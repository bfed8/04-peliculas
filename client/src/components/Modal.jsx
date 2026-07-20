// Modal con el mismo estilo que la web (sustituye a alert/confirm).
export default function Modal({ titulo, texto, onCerrar, onConfirmar, textoConfirmar }) {
  function manejarFondo(evento) {
    if (evento.target === evento.currentTarget) {
      onCerrar?.();
    }
  }

  return (
    <div className="modal-fondo" onClick={manejarFondo} role="dialog" aria-modal="true">
      <div className="modal">
        {titulo && <h2 className="modal__titulo">{titulo}</h2>}
        {texto && <p className="modal__texto">{texto}</p>}
        <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center' }}>
          {onConfirmar && (
            <button className="boton boton--secundario" onClick={onCerrar}>
              Cancelar
            </button>
          )}
          <button className="boton boton--rojo" onClick={onConfirmar || onCerrar}>
            {textoConfirmar || 'Entendido'}
          </button>
        </div>
      </div>
    </div>
  );
}
