// Iconos SVG como componentes React (sin innerHTML, todo via JSX).

// Iconos estilo "outline fino" (basados en Lucide): trazo redondeado y limpio.

export function IconoCorazon({ relleno = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={relleno ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
    </svg>
  );
}

// Ojo: silueta de almendra + iris (contorno). Cuando esta vista, el iris
// se rellena pero se deja un punto de luz para que siga leyendose como ojo.
export function IconoOjo({ relleno = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3.5" fill={relleno ? 'currentColor' : 'none'} />
      {relleno && <circle cx="13.4" cy="10.6" r="1.1" fill="#0a0a0a" stroke="none" />}
    </svg>
  );
}

export function IconoFavorita({ relleno = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={relleno ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" />
    </svg>
  );
}

export function IconoEstrella() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="m12 2 3 6.3 6.9.9-5 4.8 1.3 6.9L12 17.6 5.8 20.9 7 14 2 9.2l6.9-.9L12 2Z" />
    </svg>
  );
}

export function IconoLupa() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.7 20.3 17 15.6a8 8 0 1 0-1.4 1.4l4.7 4.7a1 1 0 0 0 1.4-1.4ZM4 10a6 6 0 1 1 12 0 6 6 0 0 1-12 0Z" />
    </svg>
  );
}

export function IconoCalendario() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M7 2v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm12 7v10H5V9h14Z" />
    </svg>
  );
}

export function IconoInicio() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  );
}

export function IconoReproducir() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 4l14 8-14 8V4Z" />
    </svg>
  );
}

export function IconoFlecha() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

export function IconoClaqueta() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M3 5.5 5 9l3.5-1L6.5 4.5 3 5.5Zm6.5-1.7L11.5 7l3.5-1-2-3.2-3.5 1Zm6 .1 2 3.2 3.4-1-2-3.2-3.4 1ZM3 10v9.5A1.5 1.5 0 0 0 4.5 21h15a1.5 1.5 0 0 0 1.5-1.5V10H3Z" />
    </svg>
  );
}

export function IconoUsuario() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-5 0-9 2.5-9 5.5V22h18v-2.5c0-3-4-5.5-9-5.5Z" />
    </svg>
  );
}

export function IconoFilm() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm2 2v2h2V5H6Zm10 0v2h2V5h-2ZM6 9v2h2V9H6Zm10 0v2h2V9h-2ZM6 13v2h2v-2H6Zm10 0v2h2v-2h-2ZM6 17v2h2v-2H6Zm10 0v2h2v-2h-2Z" />
    </svg>
  );
}

// Televisor: icono para la seccion de Series.
export function IconoTv() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="13" rx="2" />
      <path d="m7 7 5-4 5 4" />
    </svg>
  );
}

// Reloj con flecha de retroceso: icono clasico de "historial".
export function IconoHistorial() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3v5h5" />
      <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

// Libros en estanteria: icono para "Mi Biblioteca".
export function IconoBiblioteca() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  );
}

// Bocadillo de texto: icono para "Mis Reseñas".
export function IconoResena() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" />
      <path d="M8 10h8M8 13.5h5" />
    </svg>
  );
}

// Flecha hacia abajo (chevron) para indicar desplegable.
export function IconoChevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
