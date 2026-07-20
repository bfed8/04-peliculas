import { useState, useRef, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  IconoBiblioteca,
  IconoChevron,
  IconoFavorita,
  IconoCorazon,
  IconoOjo,
  IconoResena,
} from './Iconos.jsx';

// Menu desplegable "Mi Biblioteca" con dos grupos: Peliculas y Series.
// Se abre al pasar el cursor (hover) y tambien con clic (util en tactil/teclado).
export default function MenuBiblioteca() {
  const [abierto, setAbierto] = useState(false);
  const contenedor = useRef(null);
  const temporizadorCierre = useRef(null);

  // Cierra el menu al hacer clic fuera de el.
  useEffect(() => {
    if (!abierto) return;
    function alClicarFuera(evento) {
      if (contenedor.current && !contenedor.current.contains(evento.target)) {
        setAbierto(false);
      }
    }
    document.addEventListener('mousedown', alClicarFuera);
    return () => document.removeEventListener('mousedown', alClicarFuera);
  }, [abierto]);

  // Limpia el temporizador pendiente al desmontar.
  useEffect(() => () => clearTimeout(temporizadorCierre.current), []);

  const cerrar = () => setAbierto(false);
  const claseOpcion = ({ isActive }) => 'menu-bib__opcion' + (isActive ? ' activo' : '');

  // Hover: abrimos al instante y cerramos con un breve retardo, para que mover
  // el cursor entre el boton y el panel no lo cierre por accidente.
  const alEntrar = () => {
    clearTimeout(temporizadorCierre.current);
    setAbierto(true);
  };
  const alSalir = () => {
    clearTimeout(temporizadorCierre.current);
    temporizadorCierre.current = setTimeout(() => setAbierto(false), 150);
  };

  return (
    <div
      className="menu-bib"
      ref={contenedor}
      onMouseEnter={alEntrar}
      onMouseLeave={alSalir}
    >
      <button
        type="button"
        className={'header__nav-item menu-bib__toggle' + (abierto ? ' abierto' : '')}
        aria-haspopup="true"
        aria-expanded={abierto}
        onClick={() => setAbierto((v) => !v)}
      >
        <IconoBiblioteca />
        <span>Mi Biblioteca</span>
        <span className="menu-bib__chevron">
          <IconoChevron />
        </span>
      </button>

      {abierto && (
        <div className="menu-bib__panel" role="menu">
          <p className="menu-bib__grupo">Películas</p>
          <NavLink to="/favoritos" className={claseOpcion} onClick={cerrar} role="menuitem">
            <IconoFavorita />
            <span>Favoritos</span>
          </NavLink>
          <NavLink to="/me-gusta" className={claseOpcion} onClick={cerrar} role="menuitem">
            <IconoCorazon />
            <span>Me Gusta</span>
          </NavLink>
          <NavLink to="/historico" className={claseOpcion} onClick={cerrar} role="menuitem">
            <IconoOjo />
            <span>Películas Vistas</span>
          </NavLink>
          <NavLink to="/mis-resenas" className={claseOpcion} onClick={cerrar} role="menuitem">
            <IconoResena />
            <span>Mis Reseñas</span>
          </NavLink>

          <hr className="menu-bib__divisor" />

          <p className="menu-bib__grupo">Series</p>
          <NavLink to="/favoritos-series" className={claseOpcion} onClick={cerrar} role="menuitem">
            <IconoFavorita />
            <span>Favoritos</span>
          </NavLink>
          <NavLink to="/me-gusta-series" className={claseOpcion} onClick={cerrar} role="menuitem">
            <IconoCorazon />
            <span>Me Gusta</span>
          </NavLink>
          <NavLink to="/historico-series" className={claseOpcion} onClick={cerrar} role="menuitem">
            <IconoOjo />
            <span>Series Vistas</span>
          </NavLink>
          <NavLink to="/mis-resenas-series" className={claseOpcion} onClick={cerrar} role="menuitem">
            <IconoResena />
            <span>Mis Reseñas</span>
          </NavLink>
        </div>
      )}
    </div>
  );
}
