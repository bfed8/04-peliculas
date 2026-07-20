import { useUserData } from '../context/UserDataContext.jsx';
import MovieCard from '../components/MovieCard.jsx';
import Loader from '../components/Loader.jsx';
import EstadoVacio from '../components/EstadoVacio.jsx';

// Series marcadas como favoritas.
export default function FavoritosSeries() {
  const { favoritasSeries, cargando } = useUserData();

  if (cargando) return <Loader />;

  return (
    <section className="seccion">
      <h2 className="seccion__titulo">Mis Series Favoritas</h2>
      {favoritasSeries.length ? (
        <div className="grid-peliculas">
          {favoritasSeries.map((s) => (
            <MovieCard key={s.id} pelicula={s} tipo="tv" />
          ))}
        </div>
      ) : (
        <EstadoVacio mensaje="Aún no tienes series favoritas. Marca el icono de favorita para guardarlas aquí." />
      )}
    </section>
  );
}
