import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerDetalleTv, obtenerTrailerTv, urlImagen } from '../api/tmdb.js';
import Loader from '../components/Loader.jsx';
import EstadoVacio from '../components/EstadoVacio.jsx';
import ModalActor from '../components/ModalActor.jsx';
import ModalTrailer from '../components/ModalTrailer.jsx';
import Proveedores from '../components/Proveedores.jsx';
import { BotonGusta, BotonVista, BotonFavorita } from '../components/BotonesAccion.jsx';
import { IconoFlecha, IconoReproducir, IconoUsuario } from '../components/Iconos.jsx';

// Texto de temporadas/episodios: "3 temporadas · 24 episodios".
function resumenEpisodios(serie) {
  const partes = [];
  const t = serie.number_of_seasons;
  const e = serie.number_of_episodes;
  if (t) partes.push(`${t} ${t === 1 ? 'temporada' : 'temporadas'}`);
  if (e) partes.push(`${e} ${e === 1 ? 'episodio' : 'episodios'}`);
  return partes.join(' · ') || null;
}

function Reparto({ actores, onSeleccionar }) {
  if (!actores.length) return null;
  return (
    <section className="seccion">
      <h2 className="seccion__titulo">Reparto</h2>
      <div className="reparto">
        {actores.slice(0, 12).map((actor) => {
          const foto = urlImagen(actor.profile_path, 'w185');
          return (
            <button
              type="button"
              className="actor"
              key={actor.cast_id ?? actor.credit_id}
              onClick={() => onSeleccionar(actor.id)}
              aria-label={`Ver información de ${actor.name}`}
            >
              {foto ? (
                <img className="actor__foto" src={foto} alt={actor.name} loading="lazy" />
              ) : (
                <div className="actor__foto actor__foto--placeholder">
                  <IconoUsuario />
                </div>
              )}
              <p className="actor__nombre">{actor.name}</p>
              <p className="actor__personaje">{actor.character}</p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function DetalleSerie({ mostrarToast }) {
  const { id } = useParams();
  const navegar = useNavigate();
  const [serie, setSerie] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [actorId, setActorId] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [cargandoTrailer, setCargandoTrailer] = useState(false);

  const verTrailer = () => {
    setCargandoTrailer(true);
    obtenerTrailerTv(id)
      .then((res) => {
        if (res.video?.key) setTrailerKey(res.video.key);
        else mostrarToast?.('No hay tráiler disponible para esta serie.');
      })
      .catch(() => mostrarToast?.('No se pudo cargar el tráiler.'))
      .finally(() => setCargandoTrailer(false));
  };

  useEffect(() => {
    setCargando(true);
    setError(false);
    obtenerDetalleTv(id)
      .then(setSerie)
      .catch(() => {
        setError(true);
        mostrarToast?.('No se pudo cargar la serie.');
      })
      .finally(() => setCargando(false));
  }, [id, mostrarToast]);

  if (cargando) return <Loader />;
  if (error || !serie) return <EstadoVacio mensaje="No se pudo cargar la serie." />;

  const fondo = urlImagen(serie.backdrop_path, 'w1280') || urlImagen(serie.poster_path, 'w780');
  const anio = (serie.first_air_date || '').slice(0, 4);
  const episodios = resumenEpisodios(serie);
  const generos = (serie.genres || []).map((g) => g.name).join(', ');
  const rating = serie.vote_average ? serie.vote_average.toFixed(1) : '0.0';
  const credits = serie.credits || {};
  const creadores = (serie.created_by || []).map((c) => c.name).join(', ');

  // El boton/contexto identifica la serie con su nombre. Le pasamos `name`
  // para que se guarde con el titulo correcto.
  const elemento = { ...serie, name: serie.name };

  return (
    <>
      <div className="detalle__hero">
        {fondo && <img className="detalle__fondo" src={fondo} alt="" />}
        <div className="detalle__overlay" />

        <button
          type="button"
          className="icono-boton volver"
          aria-label="Volver"
          onClick={() => navegar(-1)}
        >
          <IconoFlecha />
        </button>

        <div className="detalle__cabecera">
          <h1 className="detalle__titulo">{serie.name}</h1>
          <div className="detalle__meta">
            {anio && <span>{anio}</span>}
            {episodios && (
              <>
                <span className="punto" />
                <span>{episodios}</span>
              </>
            )}
            {generos && (
              <>
                <span className="punto" />
                <span>{generos}</span>
              </>
            )}
          </div>

          <div className="detalle__acciones">
            <button
              type="button"
              className="boton boton--rojo"
              onClick={verTrailer}
              disabled={cargandoTrailer}
            >
              <IconoReproducir /> {cargandoTrailer ? 'Cargando...' : 'Ver Tráiler'}
            </button>
            <BotonFavorita pelicula={elemento} tipo="tv" />
            <BotonGusta pelicula={elemento} tipo="tv" />
            <BotonVista pelicula={elemento} tipo="tv" />
          </div>
        </div>
      </div>

      <section className="seccion">
        <h2 className="seccion__titulo">Sinopsis</h2>
        <p>{serie.overview || 'Sin sinopsis disponible.'}</p>
      </section>

      <Proveedores proveedores={serie.proveedores} />

      <Reparto actores={credits.cast || []} onSeleccionar={setActorId} />

      <div className="ficha">
        <div className="ficha__fila">
          <span className="ficha__etiqueta">Creador</span>
          <span className="ficha__valor">{creadores || 'No disponible'}</span>
        </div>
        <div className="ficha__fila">
          <span className="ficha__etiqueta">Temporadas</span>
          <span className="ficha__valor">{serie.number_of_seasons || 'No disponible'}</span>
        </div>
        <div className="ficha__fila">
          <span className="ficha__etiqueta">Episodios</span>
          <span className="ficha__valor">{serie.number_of_episodes || 'No disponible'}</span>
        </div>
        <div className="ficha__fila">
          <span className="ficha__etiqueta">Calificacion</span>
          <span className="ficha__valor ficha__valor--rating">{rating} / 10 (TMDB)</span>
        </div>
      </div>

      {actorId && <ModalActor personaId={actorId} onCerrar={() => setActorId(null)} origen="tv" />}
      {trailerKey && (
        <ModalTrailer
          videoKey={trailerKey}
          titulo={serie.name}
          onCerrar={() => setTrailerKey(null)}
        />
      )}
    </>
  );
}
