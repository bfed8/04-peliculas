import { useState } from 'react';
import { useUserData } from '../context/UserDataContext.jsx';
import Loader from '../components/Loader.jsx';
import EstadoVacio from '../components/EstadoVacio.jsx';
import ModalResena from '../components/ModalResena.jsx';
import FilaPeliculaVista from '../components/FilaPeliculaVista.jsx';

// Mis Reseñas de series: solo las series vistas con una resena escrita.
export default function MisResenasSeries() {
  const { conResenaSeries, cargando, guardarResena } = useUserData();
  const [editando, setEditando] = useState(null);

  if (cargando) return <Loader />;

  // Las entradas guardadas no llevan `tipo`; lo inyectamos para que la resena
  // se guarde en la coleccion de series.
  const guardar = (serie, resena) => guardarResena({ ...serie, tipo: 'tv' }, resena);

  return (
    <section className="seccion">
      <h2 className="seccion__titulo">Mis Reseñas</h2>

      {conResenaSeries.length ? (
        <div className="historico">
          {conResenaSeries.map((s) => (
            <FilaPeliculaVista
              key={s.id}
              pelicula={s}
              tipo="tv"
              onEditar={setEditando}
              onEliminar={(serie) => guardar(serie, '')}
            />
          ))}
        </div>
      ) : (
        <EstadoVacio mensaje="Aún no has escrito ninguna reseña de series. Al marcar una serie como vista podrás añadir tu opinión." />
      )}

      {editando && (
        <ModalResena
          titulo={editando.titulo || 'esta serie'}
          resenaInicial={editando.resena || ''}
          onGuardar={(resena) => {
            guardar(editando, resena);
            setEditando(null);
          }}
          onCerrar={() => setEditando(null)}
        />
      )}
    </section>
  );
}
