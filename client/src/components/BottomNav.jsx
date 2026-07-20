import { NavLink } from 'react-router-dom';
import { IconoLupa, IconoFavorita, IconoTv, IconoFilm } from './Iconos.jsx';

// Navegacion inferior fija: Inicio / Buscar / Series / Favoritos.
// "Inicio" se marca activo tanto en peliculas como en la home de series.
export default function BottomNav() {
  const clase = ({ isActive }) => 'bottomnav__item' + (isActive ? ' activo' : '');

  return (
    <nav className="bottomnav" aria-label="Navegacion principal">
      <NavLink to="/" className={clase} end>
        <IconoFilm />
        <span>Películas</span>
      </NavLink>
      <NavLink to="/series" className={clase}>
        <IconoTv />
        <span>Series</span>
      </NavLink>
      <NavLink to="/buscar" className={clase}>
        <IconoLupa />
        <span>Buscar</span>
      </NavLink>
      <NavLink to="/favoritos" className={clase}>
        <IconoFavorita />
        <span>Favoritos</span>
      </NavLink>
    </nav>
  );
}
