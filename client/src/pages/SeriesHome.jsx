import { useEffect, useState } from 'react';
import { obtenerEstrenosTv, obtenerTendenciasTv } from '../api/tmdb.js';
import MovieCard from '../components/MovieCard.jsx';
import HeroCarousel from '../components/HeroCarousel.jsx';
import Loader from '../components/Loader.jsx';
import EstadoVacio from '../components/EstadoVacio.jsx';

// Home de series: carrusel de estrenos + listados de estrenos y tendencias.
export default function SeriesHome({ mostrarToast }) {
  const [estrenos, setEstrenos] = useState([]);
  const [tendencias, setTendencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([obtenerEstrenosTv(), obtenerTendenciasTv()])
      .then(([resEstrenos, resTendencias]) => {
        setEstrenos(resEstrenos.results || []);
        setTendencias(resTendencias.results || []);
      })
      .catch(() => {
        setError(true);
        mostrarToast?.('No se pudo cargar el catalogo de series. Revisa la conexion.');
      })
      .finally(() => setCargando(false));
  }, [mostrarToast]);

  if (cargando) return <Loader />;
  if (error) return <EstadoVacio mensaje="No se pudo cargar la informacion de las series." />;

  // Estrenos con imagen de fondo para el carrusel.
  const destacadas = estrenos.filter((s) => s.backdrop_path).slice(0, 6);

  return (
    <>
      {destacadas.length > 0 && <HeroCarousel peliculas={destacadas} tipo="tv" />}

      <section className="seccion">
        <h2 className="seccion__titulo">Últimos Estrenos</h2>
        {estrenos.length ? (
          <div className="grid-peliculas">
            {estrenos.slice(0, 12).map((s) => (
              <MovieCard key={s.id} pelicula={s} tipo="tv" />
            ))}
          </div>
        ) : (
          <EstadoVacio mensaje="No hay estrenos disponibles." />
        )}
      </section>

      <section className="seccion">
        <h2 className="seccion__titulo">Tendencias</h2>
        {tendencias.length ? (
          <div className="grid-peliculas">
            {tendencias.slice(0, 10).map((s, i) => (
              <MovieCard key={s.id} pelicula={s} numero={i + 1} tipo="tv" />
            ))}
          </div>
        ) : (
          <EstadoVacio mensaje="No hay tendencias disponibles." />
        )}
      </section>
    </>
  );
}
