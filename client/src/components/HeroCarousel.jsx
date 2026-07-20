import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { urlImagen } from '../api/tmdb.js';
import { IconoEstrella, IconoReproducir } from './Iconos.jsx';

const INTERVALO_MS = 3000;

// Carrusel automatico del Hero: rota entre los ultimos estrenos.
// Avanza solo cada INTERVALO_MS y se pausa al pasar el raton.
// `tipo` ('movie' | 'tv') decide la ruta de detalle y el titulo a mostrar.
export default function HeroCarousel({ peliculas, tipo = 'movie' }) {
  const [actual, setActual] = useState(0);
  const [pausado, setPausado] = useState(false);
  const total = peliculas.length;

  useEffect(() => {
    if (pausado || total <= 1) return;
    const id = setInterval(() => {
      setActual((i) => (i + 1) % total);
    }, INTERVALO_MS);
    return () => clearInterval(id);
  }, [pausado, total]);

  // Si cambia el listado, evitamos quedar fuera de rango.
  useEffect(() => {
    setActual((i) => (i < total ? i : 0));
  }, [total]);

  if (!total) return null;

  return (
    <section
      className="hero hero--carrusel"
      aria-roledescription="carrusel"
      aria-label="Ultimos estrenos"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      {peliculas.map((pelicula, i) => {
        const fondo = urlImagen(pelicula.backdrop_path, 'w1280') || urlImagen(pelicula.poster_path, 'w780');
        const rating = pelicula.vote_average ? pelicula.vote_average.toFixed(1) : null;
        const activa = i === actual;

        return (
          <article
            key={pelicula.id}
            className={'hero__slide' + (activa ? ' activa' : '')}
            aria-hidden={!activa}
          >
            {fondo && <img className="hero__fondo" src={fondo} alt="" />}
            <div className="hero__overlay" />
            <div className="hero__contenido">
              <div className="hero__chips">
                {rating && (
                  <span className="chip chip--rating">
                    <IconoEstrella /> {rating}
                  </span>
                )}
              </div>
              <h1 className="hero__titulo">{pelicula.title || pelicula.name}</h1>
              <p className="hero__desc">{pelicula.overview || 'Sin descripcion disponible.'}</p>
              <Link
                to={tipo === 'tv' ? `/serie/${pelicula.id}` : `/pelicula/${pelicula.id}`}
                className="boton boton--rojo"
                tabIndex={activa ? 0 : -1}
              >
                <IconoReproducir /> Ver Detalles
              </Link>
            </div>
          </article>
        );
      })}

      {total > 1 && (
        <div className="hero__puntos" role="tablist" aria-label="Seleccionar estreno">
          {peliculas.map((pelicula, i) => (
            <button
              key={pelicula.id}
              type="button"
              className={'hero__punto' + (i === actual ? ' activo' : '')}
              aria-label={`Ir al estreno ${i + 1}`}
              aria-selected={i === actual}
              role="tab"
              onClick={() => setActual(i)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
