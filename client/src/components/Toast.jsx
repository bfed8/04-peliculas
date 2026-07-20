import { createPortal } from 'react-dom';

// Aviso flotante centrado. Se renderiza en un portal sobre document.body
// para que ningun contenedor con transform/flex afecte a su tamano o posicion.
export default function Toast({ mensaje }) {
  if (!mensaje) return null;
  return createPortal(
    <div className="toast" role="status">
      {mensaje}
    </div>,
    document.body
  );
}
