import { useEffect, useState } from 'react';
import { obtenerProximosEstrenos } from '../api/tmdb.js';
import MovieCard from '../components/MovieCard.jsx';
import Loader from '../components/Loader.jsx';
import EstadoVacio from '../components/EstadoVacio.jsx';

// Formatea una fecha ISO (YYYY-MM-DD) a "Julio 2026" (sin el "de").
function nombreMes(iso) {
  if (!iso) return 'Próximamente';
  const fecha = new Date(iso + 'T00:00:00');
  const mes = fecha.toLocaleDateString('es-ES', { month: 'long' });
  const anio = fecha.getFullYear();
  const mesCapitalizado = mes.charAt(0).toUpperCase() + mes.slice(1);
  return `${mesCapitalizado} ${anio}`;
}

// Agrupa las peliculas por mes de estreno, conservando el orden cronologico.
function agruparPorMes(peliculas) {
  const grupos = new Map();
  for (const p of peliculas) {
    const clave = nombreMes(p.release_date);
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(p);
  }
  return [...grupos.entries()];
}

export default function ProximosEstrenos({ mostrarToast }) {
  const [peliculas, setPeliculas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    obtenerProximosEstrenos()
      .then((res) => {
        // Ordenamos por fecha mas cercana primero (la API no siempre lo respeta).
        const ordenadas = (res.results || [])
          .filter((p) => p.release_date)
          .sort((a, b) => a.release_date.localeCompare(b.release_date));
        setPeliculas(ordenadas);
      })
      .catch(() => {
        setError(true);
        mostrarToast?.('No se pudieron cargar los próximos estrenos.');
      })
      .finally(() => setCargando(false));
  }, [mostrarToast]);

  if (cargando) return <Loader />;
  if (error) return <EstadoVacio mensaje="No se pudieron cargar los próximos estrenos." />;

  const grupos = agruparPorMes(peliculas);

  return (
    <section className="seccion">
      <h2 className="seccion__titulo">Próximos Estrenos</h2>

      {grupos.length ? (
        grupos.map(([mes, lista]) => (
          <div className="estrenos-mes" key={mes}>
            <h3 className="estrenos-mes__titulo">{mes}</h3>
            <div className="grid-peliculas">
              {lista.map((p) => (
                <MovieCard key={p.id} pelicula={p} />
              ))}
            </div>
          </div>
        ))
      ) : (
        <EstadoVacio mensaje="No hay próximos estrenos disponibles por ahora." />
      )}
    </section>
  );
}
