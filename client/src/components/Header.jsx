import { Link, NavLink } from 'react-router-dom';
import { IconoClaqueta, IconoFilm, IconoTv, IconoLupa } from './Iconos.jsx';
import MenuBiblioteca from './MenuBiblioteca.jsx';
import { useUserData } from '../context/UserDataContext.jsx';
import { obtenerAvatar } from '../avatares.js';

// Cabecera con el logo CINEMA, la navegacion (solo escritorio)
// y el acceso al perfil (con el avatar elegido).
export default function Header() {
  const clase = ({ isActive }) => 'header__nav-item' + (isActive ? ' activo' : '');
  const { perfil } = useUserData();
  const avatar = obtenerAvatar(perfil.avatar);

  return (
    <header className="header">
      <div className="contenedor header__interior">
        <Link to="/" className="logo">
          <IconoClaqueta />
          CINEMA
        </Link>

        <nav className="header__nav" aria-label="Navegacion principal">
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
          <MenuBiblioteca />
        </nav>

        <Link
          to="/perfil"
          className="avatar"
          aria-label="Mi perfil"
          style={{ backgroundColor: avatar.color }}
        >
          <span aria-hidden="true">{avatar.emoji}</span>
        </Link>
      </div>
    </header>
  );
}
