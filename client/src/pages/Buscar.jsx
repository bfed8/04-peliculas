import { useEffect, useState, useCallback } from 'react';
import {
  buscarPeliculas,
  buscarSeries,
  obtenerGeneros,
  obtenerGenerosTv,
  obtenerPlataformas,
  obtenerPlataformasTv,
  urlImagen,
} from '../api/tmdb.js';
import MovieCard from '../components/MovieCard.jsx';
import Loader from '../components/Loader.jsx';
import EstadoVacio from '../components/EstadoVacio.jsx';
import { IconoLupa, IconoCalendario, IconoEstrella, IconoFilm, IconoTv } from '../components/Iconos.jsx';

// Genera una lista de anios desde el actual hacia atras para el filtro.
const ANIO_ACTUAL = new Date().getFullYear();
const ANIOS = Array.from({ length: 50 }, (_, i) => ANIO_ACTUAL - i);
const RATINGS = [10, 9, 8, 7, 6];

// Genero "Película de TV" (telefilmes) en el catalogo de peliculas. Lo ocultamos
// del filtro para no confundirlo con la seccion de Series.
const GENERO_PELICULA_TV = 10770;

// Maximo de categorias que se pueden combinar a la vez.
const MAX_GENEROS = 3;

// Buscador unificado: un conmutador elige entre Peliculas y Series. Segun el
// tipo cambian el endpoint, los generos del filtro y la ruta de las tarjetas.
export default function Buscar({ mostrarToast }) {
  const [tipo, setTipo] = useState('movie');
  const [texto, setTexto] = useState('');
  const [anio, setAnio] = useState('');
  const [rating, setRating] = useState('');
  // Categorias seleccionadas (ids como string), hasta MAX_GENEROS, con logica OR.
  const [generosSel, setGenerosSel] = useState([]);
  const [generos, setGeneros] = useState([]);
  // Plataformas seleccionadas (ids como string), con logica OR.
  const [plataformasSel, setPlataformasSel] = useState([]);
  const [plataformas, setPlataformas] = useState([]);

  const [resultados, setResultados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [buscado, setBuscado] = useState(false);

  const esTv = tipo === 'tv';

  // Cargamos las categorias del tipo activo. Al cambiar de tipo se recargan.
  useEffect(() => {
    const pedirGeneros = esTv ? obtenerGenerosTv : obtenerGeneros;
    pedirGeneros()
      .then((datos) => {
        const lista = (datos.genres || []).filter((g) => g.id !== GENERO_PELICULA_TV);
        lista.sort((a, b) => a.name.localeCompare(b.name, 'es'));
        setGeneros(lista);
      })
      .catch(() => setGeneros([]));
  }, [esTv]);

  // Cargamos las plataformas (de visionado en AR) del tipo activo.
  useEffect(() => {
    const pedirPlataformas = esTv ? obtenerPlataformasTv : obtenerPlataformas;
    pedirPlataformas()
      .then((datos) => setPlataformas(datos.results || []))
      .catch(() => setPlataformas([]));
  }, [esTv]);

  const ejecutarBusqueda = useCallback(
    async (filtros) => {
      // Sin criterios mostramos el catalogo por popularidad (el backend usa
      // /discover cuando no hay texto de busqueda).
      setCargando(true);
      setBuscado(true);
      try {
        const buscar = esTv ? buscarSeries : buscarPeliculas;
        const datos = await buscar(filtros);
        setResultados(datos.results || []);
      } catch {
        setResultados([]);
        mostrarToast?.('Error al realizar la busqueda.');
      } finally {
        setCargando(false);
      }
    },
    [esTv, mostrarToast]
  );

  // Une las categorias seleccionadas para enviarlas al backend.
  const generoQuery = generosSel.join(',');
  // El filtro por plataforma solo aplica en exploracion (sin texto): TMDB no lo
  // soporta junto a la busqueda por titulo. Si hay texto, no se envia.
  const plataformaQuery = texto ? '' : plataformasSel.join(',');

  // Al cambiar de tipo reiniciamos categorias y plataformas (las de cine y TV
  // no coinciden). No lanzamos la busqueda aqui: de eso se encarga el efecto
  // unico de abajo, para no duplicar peticiones.
  useEffect(() => {
    setGenerosSel([]);
    setPlataformasSel([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo]);

  // Unico efecto de busqueda: observa todos los criterios y aplica debounce.
  // Asi siempre se hace exactamente UNA peticion por cambio (sin doble carga).
  useEffect(() => {
    const id = setTimeout(() => {
      ejecutarBusqueda({ q: texto, year: anio, rating, genre: generoQuery, provider: plataformaQuery });
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tipo, texto, anio, rating, generoQuery, plataformaQuery]);

  function manejarSubmit(evento) {
    evento.preventDefault();
    ejecutarBusqueda({ q: texto, year: anio, rating, genre: generoQuery, provider: plataformaQuery });
  }

  // Alterna una categoria respetando el limite de MAX_GENEROS.
  function alternarGenero(id) {
    const valor = String(id);
    setGenerosSel((prev) => {
      if (prev.includes(valor)) return prev.filter((g) => g !== valor);
      if (prev.length >= MAX_GENEROS) return prev; // limite alcanzado: no anade mas
      return [...prev, valor];
    });
  }

  // Alterna una plataforma (sin limite; se combinan con logica OR).
  function alternarPlataforma(id) {
    const valor = String(id);
    setPlataformasSel((prev) =>
      prev.includes(valor) ? prev.filter((p) => p !== valor) : [...prev, valor]
    );
  }

  const hayCriterios = texto || anio || rating || generosSel.length || plataformaQuery;
  const tituloResultados = texto
    ? `Resultados para "${texto}"`
    : hayCriterios
      ? 'Resultados'
      : esTv
        ? 'Series populares'
        : 'Películas populares';

  function limpiarFiltros() {
    setAnio('');
    setRating('');
    setGenerosSel([]);
    setPlataformasSel([]);
  }

  const hayFiltros = anio || rating || generosSel.length || plataformasSel.length;
  // El filtro de plataforma no se puede combinar con la busqueda por titulo.
  const plataformasDeshabilitadas = Boolean(texto);
  const limiteAlcanzado = generosSel.length >= MAX_GENEROS;
  const placeholder = esTv ? 'Busca tu próxima serie' : 'Busca tu próxima película';
  const vacioCriterios = esTv
    ? 'No se encontraron series con esos criterios.'
    : 'No se encontraron peliculas con esos criterios.';

  return (
    <>
      <div className="buscador-tipos" role="tablist" aria-label="Tipo de contenido">
        <button
          type="button"
          role="tab"
          aria-selected={!esTv}
          className={'buscador-tipo' + (!esTv ? ' buscador-tipo--activo' : '')}
          onClick={() => setTipo('movie')}
        >
          <IconoFilm />
          Películas
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={esTv}
          className={'buscador-tipo' + (esTv ? ' buscador-tipo--activo' : '')}
          onClick={() => setTipo('tv')}
        >
          <IconoTv />
          Series
        </button>
      </div>

      <section className="buscador">
        <form onSubmit={manejarSubmit}>
          <div className="buscador__campo">
            <IconoLupa />
            <input
              className="buscador__input"
              type="search"
              placeholder={placeholder}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              aria-label={esTv ? 'Buscar serie por titulo' : 'Buscar película por titulo'}
            />
          </div>
        </form>
      </section>

      <div className="busqueda-layout">
        <aside className="panel-filtros" aria-label="Filtros de busqueda">
          <div className="panel-filtros__cabecera">
            <h2 className="panel-filtros__titulo">Filtros</h2>
            {hayFiltros && (
              <button type="button" className="panel-filtros__limpiar" onClick={limpiarFiltros}>
                Limpiar
              </button>
            )}
          </div>

          <div className="grupo-filtro">
            <span className="grupo-filtro__etiqueta">
              <IconoCalendario />
              Año
            </span>
            <div className="select-envoltorio">
              <select
                className="grupo-filtro__select"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                aria-label="Filtrar por año"
              >
                <option value="">Cualquier año</option>
                {ANIOS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grupo-filtro">
            <span className="grupo-filtro__etiqueta">
              <IconoEstrella />
              Valoración mínima
            </span>
            <div className="chips chips--rating">
              {RATINGS.map((r) => (
                <button
                  type="button"
                  key={r}
                  className={`chip-rating ${Number(rating) === r ? 'chip-rating--activo' : ''}`}
                  aria-pressed={Number(rating) === r}
                  aria-label={`Valoración mínima ${r} o más`}
                  onClick={() => setRating(Number(rating) === r ? '' : String(r))}
                >
                  <IconoEstrella />
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="grupo-filtro">
            <span className="grupo-filtro__etiqueta">
              Categoría
              {generosSel.length > 0 && (
                <span className="grupo-filtro__contador">{generosSel.length}/{MAX_GENEROS}</span>
              )}
            </span>
            <div className="chips chips--categoria">
              {generos.map((g) => {
                const seleccionado = generosSel.includes(String(g.id));
                const deshabilitado = !seleccionado && limiteAlcanzado;
                return (
                  <button
                    type="button"
                    key={g.id}
                    className={`chip ${seleccionado ? 'chip--activo' : ''}`}
                    aria-pressed={seleccionado}
                    disabled={deshabilitado}
                    title={deshabilitado ? `Máximo ${MAX_GENEROS} categorías` : undefined}
                    onClick={() => alternarGenero(g.id)}
                  >
                    {g.name}
                  </button>
                );
              })}
            </div>
          </div>

          {plataformas.length > 0 && (
            <div className="grupo-filtro">
              <span className="grupo-filtro__etiqueta">Plataforma</span>
              {plataformasDeshabilitadas && (
                <p className="grupo-filtro__aviso">
                  No disponible al buscar por título. Borra el texto para filtrar por plataforma.
                </p>
              )}
              <div className="chips chips--plataforma">
                {plataformas.map((p) => {
                  const seleccionado = plataformasSel.includes(String(p.provider_id));
                  const logo = urlImagen(p.logo_path, 'w92');
                  return (
                    <button
                      type="button"
                      key={p.provider_id}
                      className={`chip-plataforma ${seleccionado ? 'chip-plataforma--activo' : ''}`}
                      aria-pressed={seleccionado}
                      disabled={plataformasDeshabilitadas}
                      title={p.provider_name}
                      onClick={() => alternarPlataforma(p.provider_id)}
                    >
                      {logo ? (
                        <img className="chip-plataforma__logo" src={logo} alt={p.provider_name} loading="lazy" />
                      ) : (
                        <span>{p.provider_name}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        <section className="seccion seccion--resultados">
          {cargando ? (
            <Loader />
          ) : !buscado ? (
            <EstadoVacio mensaje="Busca por titulo o usa los filtros para empezar." />
          ) : resultados.length ? (
            <>
              <h2 className="seccion__titulo">{tituloResultados}</h2>
              {/* La key por consulta remonta el grid al filtrar, re-disparando
                  la animacion de entrada y evitando el swap de imagenes. */}
              <div className="grid-peliculas" key={`${tipo}|${texto}|${anio}|${rating}|${generoQuery}|${plataformaQuery}`}>
                {resultados.map((p) => (
                  <MovieCard key={p.id} pelicula={p} tipo={tipo} />
                ))}
              </div>
            </>
          ) : (
            <EstadoVacio mensaje={vacioCriterios} />
          )}
        </section>
      </div>
    </>
  );
}
