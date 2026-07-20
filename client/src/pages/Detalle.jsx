import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { obtenerDetalle, obtenerTrailer, urlImagen } from '../api/tmdb.js';
import Loader from '../components/Loader.jsx';
import EstadoVacio from '../components/EstadoVacio.jsx';
import ModalActor from '../components/ModalActor.jsx';
import ModalTrailer from '../components/ModalTrailer.jsx';
import Proveedores from '../components/Proveedores.jsx';
import { BotonGusta, BotonVista, BotonFavorita } from '../components/BotonesAccion.jsx';
import { IconoFlecha, IconoReproducir, IconoUsuario } from '../components/Iconos.jsx';

// Convierte minutos a formato "2h 49m"
function formatearDuracion(minutos) {
  if (!minutos) return null;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return `${h}h ${m}m`;
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

export default function Detalle({ mostrarToast }) {
  const { id } = useParams();
  const navegar = useNavigate();
  const [pelicula, setPelicula] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [actorId, setActorId] = useState(null);
  const [trailerKey, setTrailerKey] = useState(null);
  const [cargandoTrailer, setCargandoTrailer] = useState(false);

  const verTrailer = () => {
    setCargandoTrailer(true);
    obtenerTrailer(id)
      .then((res) => {
        if (res.video?.key) setTrailerKey(res.video.key);
        else mostrarToast?.('No hay tráiler disponible para esta película.');
      })
      .catch(() => mostrarToast?.('No se pudo cargar el tráiler.'))
      .finally(() => setCargandoTrailer(false));
  };

  useEffect(() => {
    setCargando(true);
    setError(false);
    obtenerDetalle(id)
      .then(setPelicula)
      .catch(() => {
        setError(true);
        mostrarToast?.('No se pudo cargar la pelicula.');
      })
      .finally(() => setCargando(false));
  }, [id, mostrarToast]);

  if (cargando) return <Loader />;
  if (error || !pelicula) return <EstadoVacio mensaje="No se pudo cargar la pelicula." />;

  const fondo = urlImagen(pelicula.backdrop_path, 'w1280') || urlImagen(pelicula.poster_path, 'w780');
  const anio = (pelicula.release_date || '').slice(0, 4);
  const duracion = formatearDuracion(pelicula.runtime);
  const generos = (pelicula.genres || []).map((g) => g.name).join(', ');
  const rating = pelicula.vote_average ? pelicula.vote_average.toFixed(1) : '0.0';
  const credits = pelicula.credits || {};
  const director = (credits.crew || []).find((c) => c.job === 'Director');
  const guionistas = (credits.crew || [])
    .filter((c) => c.department === 'Writing')
    .map((c) => c.name)
    .filter((n, i, arr) => arr.indexOf(n) === i)
    .slice(0, 3)
    .join(', ');

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
          <h1 className="detalle__titulo">{pelicula.title}</h1>
          <div className="detalle__meta">
            {anio && <span>{anio}</span>}
            {duracion && (
              <>
                <span className="punto" />
                <span>{duracion}</span>
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
            <BotonFavorita pelicula={pelicula} />
            <BotonGusta pelicula={pelicula} />
            <BotonVista pelicula={pelicula} />
          </div>
        </div>
      </div>

      <section className="seccion">
        <h2 className="seccion__titulo">Sinopsis</h2>
        <p>{pelicula.overview || 'Sin sinopsis disponible.'}</p>
      </section>

      <Proveedores proveedores={pelicula.proveedores} />

      <Reparto actores={credits.cast || []} onSeleccionar={setActorId} />

      <div className="ficha">
        <div className="ficha__fila">
          <span className="ficha__etiqueta">Director</span>
          <span className="ficha__valor">{director ? director.name : 'No disponible'}</span>
        </div>
        <div className="ficha__fila">
          <span className="ficha__etiqueta">Escritores</span>
          <span className="ficha__valor">{guionistas || 'No disponible'}</span>
        </div>
        <div className="ficha__fila">
          <span className="ficha__etiqueta">Calificacion</span>
          <span className="ficha__valor ficha__valor--rating">{rating} / 10 (TMDB)</span>
        </div>
      </div>

      {actorId && <ModalActor personaId={actorId} onCerrar={() => setActorId(null)} />}
      {trailerKey && (
        <ModalTrailer
          videoKey={trailerKey}
          titulo={pelicula.title}
          onCerrar={() => setTrailerKey(null)}
        />
      )}
    </>
  );
}
