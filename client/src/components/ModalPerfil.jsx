import { useState } from 'react';
import { createPortal } from 'react-dom';
import { AVATARES } from '../avatares.js';

const MAX_NOMBRE = 40;

// Modal de edicion del perfil: nombre + seleccion de avatar del set.
export default function ModalPerfil({ perfil, onGuardar, onCerrar }) {
  const [nombre, setNombre] = useState(perfil.nombre || '');
  const [avatar, setAvatar] = useState(perfil.avatar);

  function manejarFondo(evento) {
    if (evento.target === evento.currentTarget) onCerrar();
  }

  function manejarEnviar(evento) {
    evento.preventDefault();
    onGuardar({ nombre: nombre.trim(), avatar });
  }

  return createPortal(
    <div className="modal-fondo" onClick={manejarFondo} role="dialog" aria-modal="true">
      <div className="modal modal--perfil">
        <h2 className="modal__titulo">Editar perfil</h2>

        <form onSubmit={manejarEnviar}>
          <label className="perfil-form__etiqueta" htmlFor="perfil-nombre">
            Nombre
          </label>
          <input
            id="perfil-nombre"
            className="perfil-form__input"
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value.slice(0, MAX_NOMBRE))}
            placeholder="¿Cómo te llamas?"
            maxLength={MAX_NOMBRE}
            autoFocus
          />

          <span className="perfil-form__etiqueta">Elige tu avatar</span>
          <div className="avatar-galeria" role="radiogroup" aria-label="Seleccionar avatar">
            {AVATARES.map((a) => (
              <button
                type="button"
                key={a.id}
                className={'avatar-opcion' + (avatar === a.id ? ' avatar-opcion--activo' : '')}
                style={{ backgroundColor: a.color }}
                role="radio"
                aria-checked={avatar === a.id}
                aria-label={`Avatar ${a.id}`}
                onClick={() => setAvatar(a.id)}
              >
                <span aria-hidden="true">{a.emoji}</span>
              </button>
            ))}
          </div>

          <div className="modal__acciones">
            <button type="button" className="boton boton--secundario" onClick={onCerrar}>
              Cancelar
            </button>
            <button type="submit" className="boton boton--rojo">
              Guardar cambios
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
