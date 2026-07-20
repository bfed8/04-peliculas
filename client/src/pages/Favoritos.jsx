import { useState } from 'react';
import { useUserData } from '../context/UserDataContext.jsx';
import { urlImagen } from '../api/tmdb.js';
import MovieCard from '../components/MovieCard.jsx';
import ModalActor from '../components/ModalActor.jsx';
import Loader from '../components/Loader.jsx';
import EstadoVacio from '../components/EstadoVacio.jsx';
import { IconoUsuario } from '../components/Iconos.jsx';

// Tarjeta de un actor favorito: abre su modal al hacer clic.
function ActorFavorito({ actor, onSeleccionar }) {
  const foto = urlImagen(actor.profile_path, 'w185');
  return (
    <button
      type="button"
      className="actor actor--favorito"
      onClick={() => onSeleccionar(actor.id)}
      aria-label={`Ver información de ${actor.nombre}`}
    >
      {foto ? (
        <img className="actor__foto" src={foto} alt={actor.nombre} loading="lazy" />
      ) : (
        <div className="actor__foto actor__foto--placeholder">
          <IconoUsuario />
        </div>
      )}
      <p className="actor__nombre">{actor.nombre}</p>
    </button>
  );
}

// Pagina de favoritos con dos secciones: peliculas y actores.
export default function Favoritos() {
  const { favoritas, actoresFavoritos, cargando } = useUserData();
  const [actorId, setActorId] = useState(null);

  if (cargando) return <Loader />;

  return (
    <>
      <section className="seccion">
        <h2 className="seccion__titulo">Mis Películas Favoritas</h2>
        {favoritas.length ? (
          <div className="grid-peliculas">
            {favoritas.map((p) => (
              <MovieCard key={p.id} pelicula={p} />
            ))}
          </div>
        ) : (
          <EstadoVacio mensaje="Aún no tienes películas favoritas. Marca el icono de favorita para guardarlas aquí." />
        )}
      </section>

      <section className="seccion">
        <h2 className="seccion__titulo">Mis Actores Favoritos</h2>
        {actoresFavoritos.length ? (
          <div className="reparto reparto--favoritos">
            {actoresFavoritos.map((a) => (
              <ActorFavorito key={a.id} actor={a} onSeleccionar={setActorId} />
            ))}
          </div>
        ) : (
          <EstadoVacio mensaje="Aún no tienes actores favoritos. Abre la ficha de un actor y márcalo con el corazón." />
        )}
      </section>

      {actorId && <ModalActor personaId={actorId} onCerrar={() => setActorId(null)} />}
    </>
  );
}
