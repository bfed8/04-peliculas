import { createPortal } from 'react-dom';

// Modal con el trailer de YouTube incrustado. `videoKey` es el id de YouTube.
// Pide subtitulos en espanol (apareceran si el video los tiene disponibles).
export default function ModalTrailer({ videoKey, titulo, onCerrar }) {
  function manejarFondo(evento) {
    if (evento.target === evento.currentTarget) onCerrar();
  }

  const src =
    `https://www.youtube.com/embed/${videoKey}` +
    `?autoplay=1&rel=0&cc_load_policy=1&cc_lang_pref=es&hl=es`;

  return createPortal(
    <div className="modal-fondo" onClick={manejarFondo} role="dialog" aria-modal="true">
      <div className="modal modal--trailer">
        <button type="button" className="modal__cerrar" aria-label="Cerrar" onClick={onCerrar}>
          ×
        </button>
        <div className="trailer-video">
          <iframe
            src={src}
            title={titulo ? `Tráiler de ${titulo}` : 'Tráiler'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
