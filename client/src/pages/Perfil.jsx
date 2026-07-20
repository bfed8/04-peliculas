import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useUserData } from '../context/UserDataContext.jsx';
import { obtenerAvatar } from '../avatares.js';
import ModalPerfil from '../components/ModalPerfil.jsx';
import Loader from '../components/Loader.jsx';
import {
  IconoFavorita,
  IconoCorazon,
  IconoOjo,
  IconoResena,
} from '../components/Iconos.jsx';

// Tarjeta de estadistica: un numero grande con su etiqueta.
function TarjetaEstadistica({ valor, etiqueta }) {
  return (
    <div className="estadistica">
      <span className="estadistica__valor">{valor}</span>
      <span className="estadistica__etiqueta">{etiqueta}</span>
    </div>
  );
}

export default function Perfil() {
  const {
    perfil,
    guardarPerfil,
    cargando,
    favoritas,
    meGusta,
    vistas,
    conResena,
    favoritasSeries,
    meGustaSeries,
    vistasSeries,
    conResenaSeries,
    actoresFavoritos,
  } = useUserData();
  const [editando, setEditando] = useState(false);

  if (cargando) return <Loader />;

  const avatar = obtenerAvatar(perfil.avatar);
  const nombre = perfil.nombre?.trim() || 'Cinéfilo anónimo';

  // Totales combinados (peliculas + series).
  const totalVistas = vistas.length + vistasSeries.length;
  const totalFavoritas = favoritas.length + favoritasSeries.length;
  const totalResenas = conResena.length + conResenaSeries.length;

  return (
    <>
      <section className="perfil-cabecera">
        <div className="perfil-avatar" style={{ backgroundColor: avatar.color }}>
          <span aria-hidden="true">{avatar.emoji}</span>
        </div>
        <div className="perfil-cabecera__datos">
          <h1 className="perfil-nombre">{nombre}</h1>
          <p className="perfil-resumen">
            {totalVistas} títulos vistos · {totalFavoritas} favoritos · {totalResenas} reseñas
          </p>
          <button
            type="button"
            className="boton boton--secundario boton--pequeno"
            onClick={() => setEditando(true)}
          >
            Editar perfil
          </button>
        </div>
      </section>

      <section className="seccion">
        <h2 className="seccion__titulo">Mis Películas</h2>
        <div className="estadisticas-grid">
          <TarjetaEstadistica valor={vistas.length} etiqueta="Vistas" />
          <TarjetaEstadistica valor={favoritas.length} etiqueta="Favoritas" />
          <TarjetaEstadistica valor={meGusta.length} etiqueta="Me gusta" />
          <TarjetaEstadistica valor={conResena.length} etiqueta="Reseñas" />
        </div>
      </section>

      <section className="seccion">
        <h2 className="seccion__titulo">Mis Series</h2>
        <div className="estadisticas-grid">
          <TarjetaEstadistica valor={vistasSeries.length} etiqueta="Vistas" />
          <TarjetaEstadistica valor={favoritasSeries.length} etiqueta="Favoritas" />
          <TarjetaEstadistica valor={meGustaSeries.length} etiqueta="Me gusta" />
          <TarjetaEstadistica valor={conResenaSeries.length} etiqueta="Reseñas" />
        </div>
      </section>

      <section className="seccion">
        <h2 className="seccion__titulo">Mis Actores</h2>
        <div className="estadisticas-grid">
          <TarjetaEstadistica valor={actoresFavoritos.length} etiqueta="Favoritos" />
        </div>
      </section>

      <section className="seccion">
        <h2 className="seccion__titulo">Accesos rápidos</h2>
        <div className="accesos-grid">
          <Link to="/favoritos" className="acceso">
            <IconoFavorita />
            <span>Películas favoritas</span>
          </Link>
          <Link to="/me-gusta" className="acceso">
            <IconoCorazon />
            <span>Películas que me gustan</span>
          </Link>
          <Link to="/historico" className="acceso">
            <IconoOjo />
            <span>Películas vistas</span>
          </Link>
          <Link to="/mis-resenas" className="acceso">
            <IconoResena />
            <span>Mis reseñas de películas</span>
          </Link>
          <Link to="/favoritos-series" className="acceso">
            <IconoFavorita />
            <span>Series favoritas</span>
          </Link>
          <Link to="/me-gusta-series" className="acceso">
            <IconoCorazon />
            <span>Series que me gustan</span>
          </Link>
          <Link to="/historico-series" className="acceso">
            <IconoOjo />
            <span>Series vistas</span>
          </Link>
          <Link to="/mis-resenas-series" className="acceso">
            <IconoResena />
            <span>Mis reseñas de series</span>
          </Link>
        </div>
      </section>

      {editando && (
        <ModalPerfil
          perfil={perfil}
          onGuardar={(nuevo) => {
            guardarPerfil(nuevo);
            setEditando(false);
          }}
          onCerrar={() => setEditando(false)}
        />
      )}
    </>
  );
}
