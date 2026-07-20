import { useUserData } from '../context/UserDataContext.jsx';
import MovieCard from '../components/MovieCard.jsx';
import Loader from '../components/Loader.jsx';
import EstadoVacio from '../components/EstadoVacio.jsx';

// Series marcadas con "me gusta" (corazon).
export default function MeGustaSeries() {
  const { meGustaSeries, cargando } = useUserData();

  if (cargando) return <Loader />;

  return (
    <section className="seccion">
      <h2 className="seccion__titulo">Me Gusta</h2>
      {meGustaSeries.length ? (
        <div className="grid-peliculas">
          {meGustaSeries.map((s) => (
            <MovieCard key={s.id} pelicula={s} tipo="tv" />
          ))}
        </div>
      ) : (
        <EstadoVacio mensaje="Aún no has marcado series con me gusta. Pulsa el corazón para guardarlas aquí." />
      )}
    </section>
  );
}
