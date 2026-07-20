import { useEffect, useState } from 'react';
import { obtenerProximosEstrenosTv } from '../api/tmdb.js';
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

// Agrupa las series por mes de estreno, conservando el orden cronologico.
function agruparPorMes(series) {
  const grupos = new Map();
  for (const s of series) {
    const clave = nombreMes(s.first_air_date);
    if (!grupos.has(clave)) grupos.set(clave, []);
    grupos.get(clave).push(s);
  }
  return [...grupos.entries()];
}

export default function ProximosEstrenosSeries({ mostrarToast }) {
  const [series, setSeries] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    obtenerProximosEstrenosTv()
      .then((res) => {
        // Ordenamos por fecha mas cercana primero (la API no siempre lo respeta).
        const ordenadas = (res.results || [])
          .filter((s) => s.first_air_date)
          .sort((a, b) => a.first_air_date.localeCompare(b.first_air_date));
        setSeries(ordenadas);
      })
      .catch(() => {
        setError(true);
        mostrarToast?.('No se pudieron cargar los próximos estrenos de series.');
      })
      .finally(() => setCargando(false));
  }, [mostrarToast]);

  if (cargando) return <Loader />;
  if (error) return <EstadoVacio mensaje="No se pudieron cargar los próximos estrenos." />;

  const grupos = agruparPorMes(series);

  return (
    <section className="seccion">
      <h2 className="seccion__titulo">Próximos Estrenos de Series</h2>

      {grupos.length ? (
        grupos.map(([mes, lista]) => (
          <div className="estrenos-mes" key={mes}>
            <h3 className="estrenos-mes__titulo">{mes}</h3>
            <div className="grid-peliculas">
              {lista.map((s) => (
                <MovieCard key={s.id} pelicula={s} tipo="tv" />
              ))}
            </div>
          </div>
        ))
      ) : (
        <EstadoVacio mensaje="No hay próximos estrenos de series disponibles por ahora." />
      )}
    </section>
  );
}
