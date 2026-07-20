import { Link } from 'react-router-dom';
import { urlImagen } from '../api/tmdb.js';
import { BotonGusta, BotonVista, BotonFavorita } from './BotonesAccion.jsx';
import { IconoEstrella } from './Iconos.jsx';

// Tarjeta de pelicula o serie. `numero` opcional para las listas de tendencias.
// `tipo` ('movie' | 'tv') decide la ruta de detalle y la coleccion de datos.
// `pelicula` puede venir de TMDB (title/name, poster_path) o de mis_datos (titulo).
export default function MovieCard({ pelicula, numero, tipo = 'movie' }) {
  const titulo = pelicula.title || pelicula.name || pelicula.titulo || 'Sin titulo';
  const poster = urlImagen(pelicula.poster_path, 'w342');
  const anio = (pelicula.release_date || pelicula.first_air_date || '').slice(0, 4);
  // Valoracion media de TMDB (0-10). Solo la mostramos si hay votos.
  const valoracion = pelicula.vote_average;
  const tieneValoracion = typeof valoracion === 'number' && valoracion > 0;
  const ruta = tipo === 'tv' ? `/serie/${pelicula.id}` : `/pelicula/${pelicula.id}`;

  return (
    <Link to={ruta} className="card" aria-label={titulo}>
      {poster ? (
        <img className="card__img" src={poster} alt={titulo} loading="lazy" />
      ) : (
        <div className="card__placeholder">{titulo}</div>
      )}

      {tieneValoracion && (
        <span className="card__rating" aria-label={`Valoración ${valoracion.toFixed(1)} sobre 10`}>
          <IconoEstrella />
          {valoracion.toFixed(1)}
        </span>
      )}

      <div className="card__acciones">
        <BotonFavorita pelicula={pelicula} tipo={tipo} />
        <BotonGusta pelicula={pelicula} tipo={tipo} />
        <BotonVista pelicula={pelicula} tipo={tipo} />
      </div>

      {numero != null && <span className="card__numero">{numero}</span>}

      {(poster && (titulo || anio)) && (
        <div className="card__info">
          <p className="card__titulo">{titulo}</p>
          {anio && <p className="card__anio">{anio}</p>}
        </div>
      )}
    </Link>
  );
}
