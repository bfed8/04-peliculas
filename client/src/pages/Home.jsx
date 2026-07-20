import { useEffect, useState } from 'react';
import { obtenerEstrenos, obtenerTendencias } from '../api/tmdb.js';
import MovieCard from '../components/MovieCard.jsx';
import HeroCarousel from '../components/HeroCarousel.jsx';
import Loader from '../components/Loader.jsx';
import EstadoVacio from '../components/EstadoVacio.jsx';

export default function Home({ mostrarToast }) {
  const [estrenos, setEstrenos] = useState([]);
  const [tendencias, setTendencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    Promise.all([obtenerEstrenos(), obtenerTendencias()])
      .then(([resEstrenos, resTendencias]) => {
        setEstrenos(resEstrenos.results || []);
        setTendencias(resTendencias.results || []);
      })
      .catch(() => {
        setError(true);
        mostrarToast?.('No se pudo cargar el catalogo. Revisa la conexion.');
      })
      .finally(() => setCargando(false));
  }, [mostrarToast]);

  if (cargando) return <Loader />;
  if (error) return <EstadoVacio mensaje="No se pudo cargar la informacion de las peliculas." />;

  // Estrenos con imagen de fondo para el carrusel (al menos 5).
  const destacadas = estrenos.filter((p) => p.backdrop_path).slice(0, 6);

  return (
    <>
      {destacadas.length > 0 && <HeroCarousel peliculas={destacadas} />}

      <section className="seccion">
        <h2 className="seccion__titulo">Ultimos Estrenos</h2>
        {estrenos.length ? (
          <div className="grid-peliculas">
            {estrenos.slice(0, 12).map((p) => (
              <MovieCard key={p.id} pelicula={p} />
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
            {tendencias.slice(0, 10).map((p, i) => (
              <MovieCard key={p.id} pelicula={p} numero={i + 1} />
            ))}
          </div>
        ) : (
          <EstadoVacio mensaje="No hay tendencias disponibles." />
        )}
      </section>
    </>
  );
}
