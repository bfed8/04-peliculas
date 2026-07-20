import { useState } from 'react';
import { useUserData } from '../context/UserDataContext.jsx';
import Loader from '../components/Loader.jsx';
import EstadoVacio from '../components/EstadoVacio.jsx';
import ModalResena from '../components/ModalResena.jsx';
import FilaPeliculaVista from '../components/FilaPeliculaVista.jsx';

// Mis Reseñas: solo las peliculas vistas que tienen una resena escrita.
export default function MisResenas() {
  const { conResena, cargando, guardarResena } = useUserData();
  const [editando, setEditando] = useState(null);

  if (cargando) return <Loader />;

  return (
    <section className="seccion">
      <h2 className="seccion__titulo">Mis Reseñas</h2>

      {conResena.length ? (
        <div className="historico">
          {conResena.map((p) => (
            <FilaPeliculaVista
              key={p.id}
              pelicula={p}
              onEditar={setEditando}
              onEliminar={(peli) => guardarResena(peli, '')}
            />
          ))}
        </div>
      ) : (
        <EstadoVacio mensaje="Aún no has escrito ninguna reseña. Al marcar una película como vista podrás añadir tu opinión." />
      )}

      {editando && (
        <ModalResena
          titulo={editando.titulo || 'esta película'}
          resenaInicial={editando.resena || ''}
          onGuardar={(resena) => {
            guardarResena(editando, resena);
            setEditando(null);
          }}
          onCerrar={() => setEditando(null)}
        />
      )}
    </section>
  );
}
