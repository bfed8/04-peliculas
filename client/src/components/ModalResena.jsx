import { useState } from 'react';
import { createPortal } from 'react-dom';

export const MAX_RESENA = 280;

// Modal con el estilo de la web para escribir/editar una resena corta.
// Solo se admite UNA resena por pelicula: si ya existe, se carga para editar
// y se ofrece la opcion de eliminarla.
export default function ModalResena({ titulo, resenaInicial = '', onGuardar, onCerrar }) {
  const [texto, setTexto] = useState(resenaInicial);
  const restantes = MAX_RESENA - texto.length;
  const yaExiste = resenaInicial.trim() !== '';

  function manejarFondo(evento) {
    // Detenemos la propagacion para que, si el modal esta anidado dentro de
    // una tarjeta clicable, el clic no navegue al detalle de la pelicula.
    evento.stopPropagation();
    if (evento.target === evento.currentTarget) {
      evento.preventDefault();
      onCerrar?.(evento);
    }
  }

  function manejarEnviar(evento) {
    evento.preventDefault();
    evento.stopPropagation();
    onGuardar(texto.trim());
  }

  // Renderizamos en un portal sobre document.body para que el position:fixed
  // del modal no se vea afectado por los transform de las tarjetas (que crean
  // un contexto de posicionamiento propio y descolocaban el popup).
  return createPortal(
    <div className="modal-fondo" onClick={manejarFondo} role="dialog" aria-modal="true">
      <div className="modal">
        <h2 className="modal__titulo">
          {yaExiste ? 'Editar tu reseña' : '¿Qué te ha parecido?'}
        </h2>
        <p className="modal__texto">
          {yaExiste ? (
            <>Modifica tu reseña de <strong>{titulo}</strong>.</>
          ) : (
            <>
              Has marcado <strong>{titulo}</strong> como vista. Escribe una breve reseña si quieres
              (opcional).
            </>
          )}
        </p>

        <form onSubmit={manejarEnviar}>
          <textarea
            className="resena-textarea"
            value={texto}
            onChange={(e) => setTexto(e.target.value.slice(0, MAX_RESENA))}
            placeholder="Tu opinión en pocas palabras..."
            rows={4}
            maxLength={MAX_RESENA}
            autoFocus
          />
          <p className={'resena-contador' + (restantes <= 20 ? ' resena-contador--bajo' : '')}>
            {restantes} caracteres restantes
          </p>

          <div className="modal__acciones">
            <button type="button" className="boton boton--secundario" onClick={onCerrar}>
              {yaExiste ? 'Cancelar' : 'Omitir'}
            </button>
            <button type="submit" className="boton boton--rojo">
              {yaExiste ? 'Guardar cambios' : 'Guardar reseña'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
