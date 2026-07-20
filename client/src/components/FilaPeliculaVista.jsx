import { Link } from 'react-router-dom';
import { urlImagen } from '../api/tmdb.js';

// Formatea una fecha ISO a algo legible en espanol: "14 de junio de 2026".
function formatearFecha(iso) {
  if (!iso) return '';
  const fecha = new Date(iso);
  return fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

// Fila de una pelicula o serie vista (poster, fecha y resena) con acciones de
// editar/eliminar resena. Reutilizada por Historico y Mis Reseñas.
// `tipo` ('movie' | 'tv') decide la ruta de detalle.
export default function FilaPeliculaVista({ pelicula, onEditar, onEliminar, tipo = 'movie' }) {
  const poster = urlImagen(pelicula.poster_path, 'w185');
  const tieneResena = Boolean(pelicula.resena);
  const ruta = tipo === 'tv' ? `/serie/${pelicula.id}` : `/pelicula/${pelicula.id}`;

  return (
    <article className="historico__item">
      <Link to={ruta} className="historico__poster">
        {poster ? (
          <img src={poster} alt={pelicula.titulo} loading="lazy" />
        ) : (
          <div className="card__placeholder">{pelicula.titulo}</div>
        )}
      </Link>

      <div className="historico__info">
        <h3 className="historico__titulo">{pelicula.titulo || 'Sin título'}</h3>
        <p className="historico__fecha">
          {pelicula.fecha_vista ? `Vista el ${formatearFecha(pelicula.fecha_vista)}` : 'Vista'}
        </p>

        {tieneResena ? (
          <p className="historico__resena">{pelicula.resena}</p>
        ) : (
          <p className="historico__resena historico__resena--vacia">Sin reseña.</p>
        )}

        <div className="historico__acciones">
          <button
            type="button"
            className="boton boton--secundario boton--pequeno"
            onClick={() => onEditar(pelicula)}
          >
            {tieneResena ? 'Editar reseña' : 'Añadir reseña'}
          </button>
          {tieneResena && (
            <button
              type="button"
              className="boton boton--peligro boton--pequeno"
              onClick={() => onEliminar(pelicula)}
            >
              Eliminar reseña
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
