// Servidor Express: hace de proxy a la API de TMDB (ocultando la API_KEY)
// y gestiona la lectura/escritura de los datos personales en data/mis_datos.json.
import express from 'express';
import dotenv from 'dotenv';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(__dirname, '..');
const DATA_DIR = join(RAIZ, 'data');
const DATA_FILE = join(DATA_DIR, 'mis_datos.json');

const API_KEY = process.env.API_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';
const PUERTO = process.env.PORT || 3001;

// Region para los proveedores de visionado (streaming/alquiler/compra) y para el
// filtro por plataforma. Datos de JustWatch via TMDB.
const REGION_PROVEEDORES = 'AR';

if (!API_KEY) {
  console.error('Falta la variable API_KEY en el fichero .env');
  process.exit(1);
}

const app = express();
app.use(express.json());

// --- Utilidad: peticion a TMDB siempre en espanol y con la API_KEY del .env ---
async function pedirTmdb(ruta, params = {}) {
  const url = new URL(`${TMDB_BASE}${ruta}`);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('language', 'es-ES');
  for (const [clave, valor] of Object.entries(params)) {
    if (valor !== undefined && valor !== null && valor !== '') {
      url.searchParams.set(clave, valor);
    }
  }

  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    const detalle = await respuesta.text();
    throw new Error(`TMDB ${respuesta.status}: ${detalle}`);
  }
  return respuesta.json();
}

// Envoltorio para manejar errores de forma uniforme
function manejar(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (error) {
      console.error(error);
      res.status(502).json({ error: 'No se pudo obtener la informacion solicitada.' });
    }
  };
}

// --- Endpoints de peliculas (proxy a TMDB) ---

// Ultimos estrenos
app.get('/api/now_playing', manejar(async (req, res) => {
  const datos = await pedirTmdb('/movie/now_playing', { region: 'ES', page: 1 });
  res.json(datos);
}));

// Tendencias de la semana
app.get('/api/trending', manejar(async (req, res) => {
  const datos = await pedirTmdb('/trending/movie/week');
  res.json(datos);
}));

// Proximos estrenos: peliculas con fecha de estreno futura (en ES),
// ordenadas por la fecha mas cercana primero.
app.get('/api/upcoming', manejar(async (req, res) => {
  const hoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const datos = await pedirTmdb('/discover/movie', {
    region: 'ES',
    'release_date.gte': hoy,
    sort_by: 'primary_release_date.asc',
    'with_release_type': '2|3', // estreno en cines/digital
    include_adult: false,
    page: 1,
  });
  res.json(datos);
}));

// Listado de generos (categorias para filtros)
app.get('/api/genres', manejar(async (req, res) => {
  const datos = await pedirTmdb('/genre/movie/list');
  res.json(datos);
}));

// Plataformas principales en Argentina para el filtro "Dónde ver". Es una lista
// curada (TMDB devuelve ~55 proveedores en AR, muchos irrelevantes). El orden
// aqui es el que se respeta en el filtro.
const PLATAFORMAS_AR = [
  { provider_id: 8, provider_name: 'Netflix' },
  { provider_id: 119, provider_name: 'Amazon Prime Video' },
  { provider_id: 337, provider_name: 'Disney Plus' },
  { provider_id: 1899, provider_name: 'HBO Max' },
  { provider_id: 350, provider_name: 'Apple TV+' },
  { provider_id: 531, provider_name: 'Paramount+' },
  { provider_id: 167, provider_name: 'Claro Video' },
  { provider_id: 845, provider_name: 'Movistar Play' },
];

// Devuelve, para el tipo indicado ("movie" o "tv"), las plataformas curadas que
// TMDB confirma disponibles en AR (con su logo). Filtra las que ya no operen.
async function plataformasDisponibles(tipo) {
  const datos = await pedirTmdb(`/watch/providers/${tipo}`, { watch_region: REGION_PROVEEDORES });
  const porId = new Map((datos.results || []).map((p) => [p.provider_id, p]));
  return PLATAFORMAS_AR
    .filter((p) => porId.has(p.provider_id))
    .map((p) => ({ ...p, logo_path: porId.get(p.provider_id).logo_path }));
}

app.get('/api/providers', manejar(async (req, res) => {
  res.json({ results: await plataformasDisponibles('movie') });
}));

app.get('/api/tv/providers', manejar(async (req, res) => {
  res.json({ results: await plataformasDisponibles('tv') });
}));

// Convierte el parametro `genre` ("28,35,18") en una lista de ids numericos.
function parsearGeneros(genre) {
  return String(genre || '')
    .split(',')
    .map((g) => Number(g.trim()))
    .filter((g) => !Number.isNaN(g) && g > 0);
}

// Filtra una lista por genero con logica OR: basta con que el elemento tenga
// al menos uno de los generos seleccionados.
function filtrarPorGeneros(resultados, ids) {
  if (!ids.length) return resultados;
  return resultados.filter((p) => (p.genre_ids || []).some((id) => ids.includes(id)));
}

// Busqueda por titulo y/o filtros (anio, rating minimo, categorias).
// El filtro de categoria admite varias y aplica OR (al menos una coincidencia).
app.get('/api/search', manejar(async (req, res) => {
  const { q, year, rating, genre, provider } = req.query;
  const generos = parsearGeneros(genre);
  // El filtro por plataforma solo es valido en /discover (TMDB no lo soporta en
  // /search). Por eso, si hay texto de busqueda, se ignora.
  const proveedores = parsearGeneros(provider);

  // Si hay texto de busqueda usamos /search/movie; los filtros se aplican despues.
  // Si NO hay texto pero si filtros, usamos /discover/movie.
  if (q && q.trim() !== '') {
    const datos = await pedirTmdb('/search/movie', { query: q, year, include_adult: false });
    let resultados = datos.results || [];

    // TMDB aplica el parametro `year` de forma laxa en /search; lo filtramos de
    // forma estricta por el anio de estreno para que coincida con lo seleccionado.
    if (year) {
      resultados = resultados.filter((p) => (p.release_date || '').slice(0, 4) === String(year));
    }
    if (rating) {
      resultados = resultados.filter((p) => p.vote_average >= Number(rating));
    }
    resultados = filtrarPorGeneros(resultados, generos);
    res.json({ ...datos, results: resultados });
  } else {
    const datos = await pedirTmdb('/discover/movie', {
      primary_release_year: year,
      'vote_average.gte': rating,
      // En /discover, "|" entre ids significa OR (coma seria AND).
      with_genres: generos.join('|'),
      with_watch_providers: proveedores.join('|'),
      watch_region: proveedores.length ? REGION_PROVEEDORES : undefined,
      with_watch_monetization_types: proveedores.length ? 'flatrate' : undefined,
      sort_by: 'popularity.desc',
      include_adult: false,
      'vote_count.gte': rating ? 50 : 0,
    });
    res.json(datos);
  }
}));

// Extrae los proveedores (plataformas) de la region elegida del bloque
// watch/providers que devuelve TMDB. Devuelve null si no hay datos para la region.
function extraerProveedores(watchProviders) {
  const region = watchProviders?.results?.[REGION_PROVEEDORES];
  if (!region) return null;
  const limpiar = (lista) =>
    (lista || []).map((p) => ({
      provider_id: p.provider_id,
      provider_name: p.provider_name,
      logo_path: p.logo_path,
    }));
  return {
    link: region.link || null,
    flatrate: limpiar(region.flatrate), // incluido en suscripcion
    rent: limpiar(region.rent), // alquiler
    buy: limpiar(region.buy), // compra
  };
}

// Detalle de una pelicula con reparto y proveedores de visionado (en AR)
app.get('/api/movie/:id', manejar(async (req, res) => {
  const datos = await pedirTmdb(`/movie/${req.params.id}`, {
    append_to_response: 'credits,watch/providers',
  });
  datos.proveedores = extraerProveedores(datos['watch/providers']);
  delete datos['watch/providers'];
  res.json(datos);
}));

// Elige el mejor video de una lista: prioriza Trailer oficial, luego Teaser.
function elegirMejorVideo(videos) {
  const deYoutube = (videos || []).filter((v) => v.site === 'YouTube');
  const prioridad = (v) =>
    (v.type === 'Trailer' ? 0 : v.type === 'Teaser' ? 1 : 2) - (v.official ? 0.5 : 0);
  return deYoutube.sort((a, b) => prioridad(a) - prioridad(b))[0] || null;
}

// Busca el mejor trailer de YouTube para una pelicula o serie. Prioriza el
// espanol; si no hay, recurre al idioma original (en-US). `recurso` es la ruta
// base del recurso en TMDB, p.ej. `/movie/123` o `/tv/123`.
async function obtenerTrailerDe(recurso) {
  const es = await pedirTmdb(`${recurso}/videos`, { language: 'es-ES' });
  let mejor = elegirMejorVideo(es.results);
  if (!mejor) {
    const en = await pedirTmdb(`${recurso}/videos`, { language: 'en-US' });
    mejor = elegirMejorVideo(en.results);
  }
  return mejor;
}

// Trailer de una pelicula.
app.get('/api/movie/:id/trailer', manejar(async (req, res) => {
  const video = await obtenerTrailerDe(`/movie/${req.params.id}`);
  res.json({ video });
}));

// --- Endpoints de series de TV (proxy a TMDB) ---

// Ultimos estrenos de series (emitidas hoy)
app.get('/api/tv/now_playing', manejar(async (req, res) => {
  const datos = await pedirTmdb('/tv/airing_today', { page: 1 });
  res.json(datos);
}));

// Tendencias de series de la semana
app.get('/api/tv/trending', manejar(async (req, res) => {
  const datos = await pedirTmdb('/trending/tv/week');
  res.json(datos);
}));

// Proximos estrenos de series: con primera emision futura, mas cercana primero.
app.get('/api/tv/upcoming', manejar(async (req, res) => {
  const hoy = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const datos = await pedirTmdb('/discover/tv', {
    'first_air_date.gte': hoy,
    sort_by: 'first_air_date.asc',
    include_adult: false,
    page: 1,
  });
  res.json(datos);
}));

// TMDB no traduce al espanol varios generos de series (devuelve el nombre en
// ingles aunque se pida en es-ES). Los traducimos nosotros por su id.
const TRADUCCION_GENEROS_TV = {
  10759: 'Acción y Aventura',
  10762: 'Infantil',
  10763: 'Noticias',
  10765: 'Ciencia ficción y Fantasía',
  10766: 'Telenovela',
  10767: 'Programa de entrevistas',
  10768: 'Bélica y Política',
};

// Listado de generos de series (categorias para filtros)
app.get('/api/tv/genres', manejar(async (req, res) => {
  const datos = await pedirTmdb('/genre/tv/list');
  const generos = (datos.genres || []).map((g) => ({
    ...g,
    name: TRADUCCION_GENEROS_TV[g.id] || g.name,
  }));
  res.json({ ...datos, genres: generos });
}));

// Busqueda de series por titulo y/o filtros (anio, rating minimo, categoria).
// Misma logica que /api/search pero sobre /search/tv y /discover/tv. En series
// el anio de estreno es `first_air_date`.
app.get('/api/tv/search', manejar(async (req, res) => {
  const { q, year, rating, genre, provider } = req.query;
  const generos = parsearGeneros(genre);
  // Igual que en peliculas: el filtro por plataforma solo aplica en /discover.
  const proveedores = parsearGeneros(provider);

  if (q && q.trim() !== '') {
    const datos = await pedirTmdb('/search/tv', { query: q, include_adult: false });
    let resultados = datos.results || [];

    if (year) {
      resultados = resultados.filter((s) => (s.first_air_date || '').slice(0, 4) === String(year));
    }
    if (rating) {
      resultados = resultados.filter((s) => s.vote_average >= Number(rating));
    }
    resultados = filtrarPorGeneros(resultados, generos);
    res.json({ ...datos, results: resultados });
  } else {
    const datos = await pedirTmdb('/discover/tv', {
      first_air_date_year: year,
      'vote_average.gte': rating,
      // En /discover, "|" entre ids significa OR (coma seria AND).
      with_genres: generos.join('|'),
      with_watch_providers: proveedores.join('|'),
      watch_region: proveedores.length ? REGION_PROVEEDORES : undefined,
      with_watch_monetization_types: proveedores.length ? 'flatrate' : undefined,
      sort_by: 'popularity.desc',
      include_adult: false,
      'vote_count.gte': rating ? 50 : 0,
    });
    res.json(datos);
  }
}));

// Detalle de una serie con reparto y proveedores de visionado (en AR)
app.get('/api/tv/:id', manejar(async (req, res) => {
  const datos = await pedirTmdb(`/tv/${req.params.id}`, {
    append_to_response: 'credits,watch/providers',
  });
  datos.proveedores = extraerProveedores(datos['watch/providers']);
  delete datos['watch/providers'];
  res.json(datos);
}));

// Trailer de una serie.
app.get('/api/tv/:id/trailer', manejar(async (req, res) => {
  const video = await obtenerTrailerDe(`/tv/${req.params.id}`);
  res.json({ video });
}));

// Detalle de una persona (actor/actriz) con sus creditos de cine y television
app.get('/api/person/:id', manejar(async (req, res) => {
  const datos = await pedirTmdb(`/person/${req.params.id}`, {
    append_to_response: 'movie_credits,tv_credits',
  });
  res.json(datos);
}));

// --- Datos personales (data/mis_datos.json) ---

// Ids de avatar permitidos. Debe mantenerse en sincronia con la lista AVATARES
// de client/src/avatares.js (fuente de verdad del selector en el cliente).
const AVATARES_PERMITIDOS = [
  'palomitas', 'claqueta', 'estrella', 'fuego', 'corazon', 'gafas',
  'robot', 'fantasma', 'alien', 'gato', 'cohete', 'corona',
];
const PERFIL_POR_DEFECTO = { nombre: '', avatar: 'palomitas' };

async function leerMisDatos() {
  if (!existsSync(DATA_FILE)) {
    await mkdir(DATA_DIR, { recursive: true });
    const inicial = { perfil: { ...PERFIL_POR_DEFECTO }, peliculas: {}, series: {}, actores: {} };
    await writeFile(DATA_FILE, JSON.stringify(inicial, null, 2), 'utf-8');
    return inicial;
  }
  const contenido = await readFile(DATA_FILE, 'utf-8');
  const datos = JSON.parse(contenido || '{"peliculas":{},"series":{},"actores":{}}');
  // Garantizamos las claves aunque el fichero sea de una version anterior.
  if (!datos.perfil) datos.perfil = { ...PERFIL_POR_DEFECTO };
  if (!datos.peliculas) datos.peliculas = {};
  if (!datos.series) datos.series = {};
  if (!datos.actores) datos.actores = {};
  return datos;
}

async function guardarMisDatos(datos) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(datos, null, 2), 'utf-8');
}

// Obtener todos los datos personales
app.get('/api/mis-datos', manejar(async (req, res) => {
  const datos = await leerMisDatos();
  res.json(datos);
}));

const MAX_NOMBRE = 40;

// Actualizar el perfil (nombre y avatar). Valida el avatar contra la lista
// blanca y recorta el nombre; ante valores invalidos cae a lo ya guardado.
app.put('/api/perfil', manejar(async (req, res) => {
  const { nombre, avatar } = req.body || {};
  const datos = await leerMisDatos();
  const actual = datos.perfil || { ...PERFIL_POR_DEFECTO };

  datos.perfil = {
    nombre: typeof nombre === 'string' ? nombre.slice(0, MAX_NOMBRE) : actual.nombre,
    avatar: AVATARES_PERMITIDOS.includes(avatar) ? avatar : actual.avatar,
  };

  await guardarMisDatos(datos);
  res.json(datos);
}));

const MAX_RESENA = 280;

// Actualiza los flags (favorita/vista/gusta) de un elemento dentro de una
// coleccion (peliculas o series). Al pasar a "vista" se registra la fecha; al
// dejar de estarlo se borra la fecha y la resena. La resena se actualiza aparte.
// Devuelve el objeto completo de datos personales tras guardar.
async function actualizarFlags(coleccion, id, cuerpo) {
  const { favorita, vista, gusta, titulo, poster_path, resena } = cuerpo || {};

  const datos = await leerMisDatos();
  const actual = datos[coleccion][id] || {};

  const nuevaVista = vista ?? actual.vista ?? false;

  const actualizada = {
    ...actual,
    titulo: titulo ?? actual.titulo ?? '',
    poster_path: poster_path ?? actual.poster_path ?? null,
    favorita: favorita ?? actual.favorita ?? false,
    vista: nuevaVista,
    gusta: gusta ?? actual.gusta ?? false,
  };

  if (nuevaVista) {
    // Conservamos la fecha original; solo la fijamos la primera vez que se ve.
    actualizada.fecha_vista = actual.fecha_vista || new Date().toISOString();
    if (resena !== undefined) {
      actualizada.resena = String(resena).slice(0, MAX_RESENA);
    }
  } else {
    // Si deja de estar vista, no tiene sentido conservar fecha ni resena.
    delete actualizada.fecha_vista;
    delete actualizada.resena;
  }

  // Si todos los flags quedan en false, eliminamos la entrada para no acumular basura.
  if (!actualizada.favorita && !actualizada.vista && !actualizada.gusta) {
    delete datos[coleccion][id];
  } else {
    datos[coleccion][id] = actualizada;
  }

  await guardarMisDatos(datos);
  return datos;
}

// Flags de una pelicula
app.put('/api/mis-datos/:id', manejar(async (req, res) => {
  const datos = await actualizarFlags('peliculas', req.params.id, req.body);
  res.json(datos);
}));

// Flags de una serie (misma logica, coleccion separada para evitar colisiones
// de ID entre peliculas y series en TMDB).
app.put('/api/mis-datos-series/:id', manejar(async (req, res) => {
  const datos = await actualizarFlags('series', req.params.id, req.body);
  res.json(datos);
}));

// Alternar un actor como favorito. Recibe { favorito, nombre, profile_path }.
app.put('/api/actores/:id', manejar(async (req, res) => {
  const { id } = req.params;
  const { favorito, nombre, profile_path } = req.body || {};

  const datos = await leerMisDatos();

  if (favorito) {
    datos.actores[id] = {
      nombre: nombre ?? datos.actores[id]?.nombre ?? '',
      profile_path: profile_path ?? datos.actores[id]?.profile_path ?? null,
    };
  } else {
    delete datos.actores[id];
  }

  await guardarMisDatos(datos);
  res.json(datos);
}));

app.listen(PUERTO, () => {
  console.log(`Servidor escuchando en http://localhost:${PUERTO}`);
});
