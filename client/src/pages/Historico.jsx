import { useState } from 'react';
import { useUserData } from '../context/UserDataContext.jsx';
import Loader from '../components/Loader.jsx';
import EstadoVacio from '../components/EstadoVacio.jsx';
import ModalResena from '../components/ModalResena.jsx';
import FilaPeliculaVista from '../components/FilaPeliculaVista.jsx';

// Historial de visionado: peliculas vistas con su fecha.
export default function Historico() {
  const { vistas, cargando, guardarResena } = useUserData();
  const [editando, setEditando] = useState(null);

  if (cargando) return <Loader />;

  return (
    <section className="seccion">
      <h2 className="seccion__titulo">Películas Vistas</h2>

      {vistas.length ? (
        <div className="historico">
          {vistas.map((p) => (
            <FilaPeliculaVista
              key={p.id}
              pelicula={p}
              onEditar={setEditando}
              onEliminar={(peli) => guardarResena(peli, '')}
            />
          ))}
        </div>
      ) : (
        <EstadoVacio mensaje="Aún no has marcado ninguna película como vista. Marca el icono del ojo para registrarlas aquí." />
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
