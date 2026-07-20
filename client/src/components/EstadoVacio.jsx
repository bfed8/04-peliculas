import { IconoFilm } from './Iconos.jsx';

// Mensaje para listados vacios o errores.
export default function EstadoVacio({ mensaje }) {
  return (
    <div className="estado">
      <IconoFilm />
      <p>{mensaje}</p>
    </div>
  );
}
