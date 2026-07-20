import { useUserData } from '../context/UserDataContext.jsx';
import MovieCard from '../components/MovieCard.jsx';
import Loader from '../components/Loader.jsx';
import EstadoVacio from '../components/EstadoVacio.jsx';

// Peliculas marcadas con "me gusta" (corazon).
export default function MeGusta() {
  const { meGusta, cargando } = useUserData();

  if (cargando) return <Loader />;

  return (
    <section className="seccion">
      <h2 className="seccion__titulo">Me Gusta</h2>
      {meGusta.length ? (
        <div className="grid-peliculas">
          {meGusta.map((p) => (
            <MovieCard key={p.id} pelicula={p} />
          ))}
        </div>
      ) : (
        <EstadoVacio mensaje="Aún no has marcado películas con me gusta. Pulsa el corazón para guardarlas aquí." />
      )}
    </section>
  );
}
