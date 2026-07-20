import { useState } from 'react';
import { useUserData } from '../context/UserDataContext.jsx';
import { IconoCorazon, IconoOjo, IconoFavorita } from './Iconos.jsx';
import Tooltip from './Tooltip.jsx';
import ModalResena from './ModalResena.jsx';

// Botones reutilizables para marcar me gusta / vista / favorita.
// `pelicula` debe incluir al menos id, title (o titulo) y poster_path.
// `tipo` ('movie' | 'tv') decide sobre que coleccion se guarda; por defecto 'movie'.

// Boton de accion generico: gestiona el clic, el tooltip y el "latido".
// El latido (clase .pulso) solo se aplica tras pulsar, nunca al montar.
function BotonAccion({ elemento, campo, variante, texto, children }) {
  const { alternarFlag } = useUserData();
  const [pulso, setPulso] = useState(false);

  const onClick = (evento) => {
    // Evitamos que el clic en el icono navegue a la pelicula (tarjeta clicable).
    evento.preventDefault();
    evento.stopPropagation();
    setPulso(true);
    alternarFlag(elemento, campo);
  };

  const activo = typeof variante === 'string' && variante.includes('activo');

  return (
    <Tooltip texto={texto}>
      <button
        type="button"
        className={'icono-boton ' + variante + (pulso ? ' pulso' : '')}
        aria-pressed={activo}
        aria-label={texto}
        onClick={onClick}
        onAnimationEnd={() => setPulso(false)}
      >
        {children}
      </button>
    </Tooltip>
  );
}

export function BotonGusta({ pelicula, tipo = 'movie' }) {
  const { obtenerFlags } = useUserData();
  const { gusta } = obtenerFlags(String(pelicula.id), tipo);
  const elemento = { ...pelicula, tipo };
  const texto = gusta ? 'Quitar me gusta' : 'Me gusta';
  return (
    <BotonAccion
      elemento={elemento}
      campo="gusta"
      variante={'icono-boton--gusta' + (gusta ? ' activo--gusta' : '')}
      texto={texto}
    >
      <IconoCorazon relleno={gusta} />
    </BotonAccion>
  );
}

export function BotonVista({ pelicula, tipo = 'movie' }) {
  const { obtenerFlags, alternarFlag, guardarResena } = useUserData();
  const { vista, resena } = obtenerFlags(String(pelicula.id), tipo);
  const elemento = { ...pelicula, tipo };
  const [pulso, setPulso] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);
  const texto = vista ? 'Marcar como no vista' : 'Marcar como vista';

  const onClick = (evento) => {
    evento.preventDefault();
    evento.stopPropagation();
    setPulso(true);
    alternarFlag(elemento, 'vista');
    // Solo ofrecemos resena cuando pasa a estar vista (no al desmarcar).
    // Si ya tenia una resena previa, el modal la cargara para editarla.
    if (!vista) setMostrarModal(true);
  };

  const cerrarModal = (evento) => {
    // Evita que el clic de cierre (sobre la tarjeta) navegue al detalle.
    evento?.preventDefault?.();
    evento?.stopPropagation?.();
    setMostrarModal(false);
  };

  return (
    <>
      <Tooltip texto={texto}>
        <button
          type="button"
          className={'icono-boton icono-boton--vista' + (vista ? ' activo--vista' : '') + (pulso ? ' pulso' : '')}
          aria-pressed={vista}
          aria-label={texto}
          onClick={onClick}
          onAnimationEnd={() => setPulso(false)}
        >
          <IconoOjo relleno={vista} />
        </button>
      </Tooltip>

      {mostrarModal && (
        <ModalResena
          titulo={pelicula.title || pelicula.name || pelicula.titulo || 'este título'}
          resenaInicial={resena || ''}
          onGuardar={(nueva) => {
            if (nueva) guardarResena(elemento, nueva);
            setMostrarModal(false);
          }}
          onCerrar={cerrarModal}
        />
      )}
    </>
  );
}

export function BotonFavorita({ pelicula, tipo = 'movie' }) {
  const { obtenerFlags } = useUserData();
  const { favorita } = obtenerFlags(String(pelicula.id), tipo);
  const elemento = { ...pelicula, tipo };
  const texto = favorita ? 'Quitar de favoritas' : 'Añadir a favoritas';
  return (
    <BotonAccion
      elemento={elemento}
      campo="favorita"
      variante={'icono-boton--favorita' + (favorita ? ' activo--favorita' : '')}
      texto={texto}
    >
      <IconoFavorita relleno={favorita} />
    </BotonAccion>
  );
}
