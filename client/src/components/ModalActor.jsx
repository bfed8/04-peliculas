import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { obtenerPersona, urlImagen } from '../api/tmdb.js';
import { IconoUsuario, IconoFavorita } from './Iconos.jsx';
import { useUserData } from '../context/UserDataContext.jsx';
import Tooltip from './Tooltip.jsx';
import Loader from './Loader.jsx';

// Calcula la edad a partir de la fecha de nacimiento (y de fallecimiento si la hay).
function calcularEdad(nacimiento, fallecimiento) {
  if (!nacimiento) return null;
  const fin = fallecimiento ? new Date(fallecimiento) : new Date();
  const ini = new Date(nacimiento);
  let edad = fin.getFullYear() - ini.getFullYear();
  const m = fin.getMonth() - ini.getMonth();
  if (m < 0 || (m === 0 && fin.getDate() < ini.getDate())) edad--;
  return edad;
}

// Equivalencias para normalizar abreviaturas habituales al español.
const PAISES = {
  USA: 'Estados Unidos',
  'U.S.A.': 'Estados Unidos',
  US: 'Estados Unidos',
  UK: 'Reino Unido',
  England: 'Reino Unido',
  Scotland: 'Reino Unido',
  Wales: 'Reino Unido',
};

// TMDB no expone "nacionalidad": la aproximamos con el pais del lugar
// de nacimiento (ultimo segmento), normalizando algunas abreviaturas.
function paisDeNacimiento(lugar) {
  if (!lugar) return null;
  const pais = lugar.split(',').pop().trim();
  return PAISES[pais] || pais;
}

function formatearFecha(iso) {
  if (!iso) return null;
  return new Date(iso + 'T00:00:00').toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Normaliza una lista de creditos (cine o tv): elimina duplicados por id,
// ordena por popularidad y se queda con los mas destacados.
function destacados(cast) {
  if (!cast) return [];
  return [...cast]
    .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 8);
}

// Seccion de filmografia: una rejilla de titulos (peliculas o series).
// `tipo` decide la ruta de detalle y de que campos leer titulo/anio.
function SeccionFilmografia({ titulo, items, tipo, onCerrar }) {
  if (!items.length) return null;
  return (
    <section className="actor-detalle__peliculas">
      <h3 className="actor-detalle__subtitulo">{titulo}</h3>
      <div className="actor-detalle__grid">
        {items.map((p) => {
          const poster = urlImagen(p.poster_path, 'w185');
          const nombre = tipo === 'tv' ? p.name : p.title;
          const anio = (tipo === 'tv' ? p.first_air_date : p.release_date || '').slice(0, 4);
          const ruta = tipo === 'tv' ? `/serie/${p.id}` : `/pelicula/${p.id}`;
          return (
            <Link to={ruta} className="actor-pelicula" key={p.id} onClick={onCerrar}>
              {poster ? (
                <img src={poster} alt={nombre} loading="lazy" />
              ) : (
                <div className="actor-pelicula__placeholder">{nombre}</div>
              )}
              <span className="actor-pelicula__titulo">{nombre}</span>
              {anio && <span className="actor-pelicula__anio">{anio}</span>}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

// Modal con informacion de un actor/actriz: foto, datos personales y su
// filmografia (peliculas y series). `origen` ('movie' | 'tv') decide que
// seccion se muestra primero, segun desde donde se abrio el modal.
export default function ModalActor({ personaId, onCerrar, origen = 'movie' }) {
  const [persona, setPersona] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const { esActorFavorito, alternarActorFavorito } = useUserData();
  const favorito = esActorFavorito(personaId);

  useEffect(() => {
    setCargando(true);
    setError(false);
    obtenerPersona(personaId)
      .then(setPersona)
      .catch(() => setError(true))
      .finally(() => setCargando(false));
  }, [personaId]);

  function manejarFondo(evento) {
    if (evento.target === evento.currentTarget) onCerrar();
  }

  const foto = persona && urlImagen(persona.profile_path, 'w185');
  const nacimiento = formatearFecha(persona?.birthday);
  const edad = persona && calcularEdad(persona.birthday, persona.deathday);
  const pais = paisDeNacimiento(persona?.place_of_birth);

  // Filmografia destacada en cine y television.
  const peliculas = destacados(persona?.movie_credits?.cast);
  const series = destacados(persona?.tv_credits?.cast);

  // Secciones a renderizar, ordenadas segun el origen (lo que el usuario
  // estaba viendo al abrir el modal se muestra primero).
  const seccionPeliculas = {
    clave: 'peliculas',
    titulo: 'Películas destacadas',
    items: peliculas,
    tipo: 'movie',
  };
  const seccionSeries = {
    clave: 'series',
    titulo: 'Series destacadas',
    items: series,
    tipo: 'tv',
  };
  const secciones =
    origen === 'tv'
      ? [seccionSeries, seccionPeliculas]
      : [seccionPeliculas, seccionSeries];

  return createPortal(
    <div className="modal-fondo" onClick={manejarFondo} role="dialog" aria-modal="true">
      <div className="modal modal--actor">
        <button type="button" className="modal__cerrar" aria-label="Cerrar" onClick={onCerrar}>
          ×
        </button>

        {cargando && <Loader />}
        {error && <p className="modal__texto">No se pudo cargar la información del actor.</p>}

        {persona && !cargando && (
          <>
            <header className="actor-detalle__cabecera">
              {foto ? (
                <img className="actor-detalle__foto" src={foto} alt={persona.name} />
              ) : (
                <div className="actor-detalle__foto actor-detalle__foto--placeholder">
                  <IconoUsuario />
                </div>
              )}
              <div className="actor-detalle__datos">
                <div className="actor-detalle__nombre-fila">
                  <h2 className="modal__titulo">{persona.name}</h2>
                  <Tooltip texto={favorito ? 'Quitar de favoritos' : 'Añadir a favoritos'}>
                    <button
                      type="button"
                      className={'icono-boton icono-boton--favorita' + (favorito ? ' activo--favorita' : '')}
                      aria-pressed={favorito}
                      aria-label={favorito ? 'Quitar actor de favoritos' : 'Añadir actor a favoritos'}
                      onClick={() => alternarActorFavorito(persona)}
                    >
                      <IconoFavorita relleno={favorito} />
                    </button>
                  </Tooltip>
                </div>
                {nacimiento && (
                  <p className="actor-detalle__dato">
                    <strong>Nacimiento:</strong> {nacimiento}
                    {edad != null && !persona.deathday && ` (${edad} años)`}
                  </p>
                )}
                {persona.place_of_birth && (
                  <p className="actor-detalle__dato">
                    <strong>Lugar:</strong> {persona.place_of_birth}
                  </p>
                )}
                {pais && (
                  <p className="actor-detalle__dato">
                    <strong>País:</strong> {pais}
                  </p>
                )}
                {persona.deathday && (
                  <p className="actor-detalle__dato">
                    <strong>Fallecimiento:</strong> {formatearFecha(persona.deathday)}
                  </p>
                )}
              </div>
            </header>

            {secciones.map((s) => (
              <SeccionFilmografia
                key={s.clave}
                titulo={s.titulo}
                items={s.items}
                tipo={s.tipo}
                onCerrar={onCerrar}
              />
            ))}
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
