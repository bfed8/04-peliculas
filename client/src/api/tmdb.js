// Capa de acceso a datos: todas las peticiones van al backend (/api/*),
// que a su vez consulta TMDB con la API_KEY oculta.

const IMG_BASE = 'https://image.tmdb.org/t/p';

// Construye la URL de una imagen de TMDB. Si no hay ruta, devuelve null.
export function urlImagen(ruta, tamano = 'w500') {
  if (!ruta) return null;
  return `${IMG_BASE}/${tamano}${ruta}`;
}

async function pedir(url) {
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error('Error al obtener los datos.');
  }
  return respuesta.json();
}

export function obtenerEstrenos() {
  return pedir('/api/now_playing');
}

export function obtenerTendencias() {
  return pedir('/api/trending');
}

export function obtenerProximosEstrenos() {
  return pedir('/api/upcoming');
}

export function obtenerGeneros() {
  return pedir('/api/genres');
}

export function obtenerPlataformas() {
  return pedir('/api/providers');
}

export function obtenerDetalle(id) {
  return pedir(`/api/movie/${id}`);
}

export function obtenerPersona(id) {
  return pedir(`/api/person/${id}`);
}

export function obtenerTrailer(id) {
  return pedir(`/api/movie/${id}/trailer`);
}

// Busqueda con texto y/o filtros (anio, rating minimo, categoria, plataforma).
// El filtro `provider` solo lo aplica el backend cuando NO hay texto (q).
export function buscarPeliculas({ q = '', year = '', rating = '', genre = '', provider = '' } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (year) params.set('year', year);
  if (rating) params.set('rating', rating);
  if (genre) params.set('genre', genre);
  if (provider) params.set('provider', provider);
  return pedir(`/api/search?${params.toString()}`);
}

// --- Series de TV (mismos datos que peliculas, endpoints /api/tv/*) ---
export function obtenerEstrenosTv() {
  return pedir('/api/tv/now_playing');
}

export function obtenerTendenciasTv() {
  return pedir('/api/tv/trending');
}

export function obtenerProximosEstrenosTv() {
  return pedir('/api/tv/upcoming');
}

export function obtenerGenerosTv() {
  return pedir('/api/tv/genres');
}

export function obtenerPlataformasTv() {
  return pedir('/api/tv/providers');
}

export function obtenerDetalleTv(id) {
  return pedir(`/api/tv/${id}`);
}

export function obtenerTrailerTv(id) {
  return pedir(`/api/tv/${id}/trailer`);
}

export function buscarSeries({ q = '', year = '', rating = '', genre = '', provider = '' } = {}) {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (year) params.set('year', year);
  if (rating) params.set('rating', rating);
  if (genre) params.set('genre', genre);
  if (provider) params.set('provider', provider);
  return pedir(`/api/tv/search?${params.toString()}`);
}

// --- Datos personales ---
export function obtenerMisDatos() {
  return pedir('/api/mis-datos');
}

export async function guardarFlags(id, flags) {
  const respuesta = await fetch(`/api/mis-datos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(flags),
  });
  if (!respuesta.ok) {
    throw new Error('No se pudieron guardar los cambios.');
  }
  return respuesta.json();
}

export async function guardarFlagsSerie(id, flags) {
  const respuesta = await fetch(`/api/mis-datos-series/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(flags),
  });
  if (!respuesta.ok) {
    throw new Error('No se pudieron guardar los cambios.');
  }
  return respuesta.json();
}

export async function guardarPerfil(perfil) {
  const respuesta = await fetch('/api/perfil', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(perfil),
  });
  if (!respuesta.ok) {
    throw new Error('No se pudo guardar el perfil.');
  }
  return respuesta.json();
}

export async function guardarActorFavorito(id, datos) {
  const respuesta = await fetch(`/api/actores/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  if (!respuesta.ok) {
    throw new Error('No se pudo guardar el actor favorito.');
  }
  return respuesta.json();
}
