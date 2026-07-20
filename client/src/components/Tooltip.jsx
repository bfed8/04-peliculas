import { useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';

// Tooltip que se renderiza con position: fixed en un portal, de modo que se ve
// entero y centrado sobre el elemento aunque este dentro de un contenedor con
// overflow: hidden (como las tarjetas de pelicula).
export default function Tooltip({ texto, children }) {
  const [coords, setCoords] = useState(null);
  const refEnvoltorio = useRef(null);

  const mostrar = useCallback(() => {
    const elemento = refEnvoltorio.current;
    if (!elemento) return;
    const rect = elemento.getBoundingClientRect();
    // Centrado horizontalmente sobre el elemento y justo encima de el.
    setCoords({ x: rect.left + rect.width / 2, y: rect.top });
  }, []);

  const ocultar = useCallback(() => setCoords(null), []);

  return (
    <span
      className="tooltip-envoltorio"
      ref={refEnvoltorio}
      onMouseEnter={mostrar}
      onMouseLeave={ocultar}
      onFocus={mostrar}
      onBlur={ocultar}
    >
      {children}
      {coords &&
        createPortal(
          <span
            className="tooltip-flotante"
            role="tooltip"
            style={{ left: `${coords.x}px`, top: `${coords.y}px` }}
          >
            {texto}
          </span>,
          document.body
        )}
    </span>
  );
}
