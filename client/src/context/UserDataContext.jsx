// Estado global con los datos personales (favoritas / vistas / me gusta).
// Maneja dos colecciones independientes: peliculas y series. Cada objeto que
// llega lleva un campo `tipo` ('movie' | 'tv', por defecto 'movie') que decide
// sobre que coleccion se opera. Carga mis_datos.json al inicio y persiste cada
// cambio en el backend.
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  obtenerMisDatos,
  guardarFlags,
  guardarFlagsSerie,
  guardarActorFavorito,
  guardarPerfil as guardarPerfilApi,
} from '../api/tmdb.js';
import { AVATAR_POR_DEFECTO } from '../avatares.js';

const UserDataContext = createContext(null);

// Calcula las listas derivadas (favoritas, me gusta, vistas, con resena) de una
// coleccion de elementos guardados.
function derivarListas(coleccion) {
  const entradas = Object.entries(coleccion).map(([id, p]) => ({ id, ...p }));
  const favoritas = entradas.filter((p) => p.favorita);
  const meGusta = entradas.filter((p) => p.gusta);
  const vistas = entradas
    .filter((p) => p.vista)
    .sort((a, b) => (b.fecha_vista || '').localeCompare(a.fecha_vista || ''));
  const conResena = vistas.filter((p) => p.resena);
  return { favoritas, meGusta, vistas, conResena };
}

const PERFIL_POR_DEFECTO = { nombre: '', avatar: AVATAR_POR_DEFECTO };

export function UserDataProvider({ children, mostrarToast }) {
  const [perfil, setPerfil] = useState(PERFIL_POR_DEFECTO);
  const [peliculas, setPeliculas] = useState({});
  const [series, setSeries] = useState({});
  const [actores, setActores] = useState({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerMisDatos()
      .then((datos) => {
        setPerfil(datos.perfil || PERFIL_POR_DEFECTO);
        setPeliculas(datos.peliculas || {});
        setSeries(datos.series || {});
        setActores(datos.actores || {});
      })
      .catch(() => mostrarToast?.('No se pudieron cargar tus datos guardados.'))
      .finally(() => setCargando(false));
  }, [mostrarToast]);

  // Guarda el perfil (nombre + avatar) con actualizacion optimista.
  const guardarPerfil = useCallback(
    async (nuevo) => {
      const anterior = perfil;
      setPerfil(nuevo); // optimista
      try {
        const datos = await guardarPerfilApi(nuevo);
        setPerfil(datos.perfil || nuevo);
        mostrarToast?.('Perfil actualizado.');
      } catch {
        setPerfil(anterior); // revertimos si falla
        mostrarToast?.('No se pudo guardar el perfil.');
      }
    },
    [perfil, mostrarToast]
  );

  // Devuelve, segun el tipo, la coleccion en estado, su setter y la funcion de
  // API que persiste los cambios.
  const recursosDe = useCallback(
    (tipo) =>
      tipo === 'tv'
        ? { coleccion: series, setColeccion: setSeries, guardar: guardarFlagsSerie }
        : { coleccion: peliculas, setColeccion: setPeliculas, guardar: guardarFlags },
    [peliculas, series]
  );

  // Devuelve los flags de un elemento (o valores por defecto). El tipo decide
  // de que coleccion se leen.
  const obtenerFlags = useCallback(
    (id, tipo = 'movie') => {
      const coleccion = tipo === 'tv' ? series : peliculas;
      return coleccion[id] || { favorita: false, vista: false, gusta: false };
    },
    [peliculas, series]
  );

  // Cambia un flag (favorita/vista/gusta) y persiste en el servidor.
  // `elemento` incluye id, titulo, poster_path y `tipo` ('movie' | 'tv').
  const alternarFlag = useCallback(
    async (elemento, campo) => {
      const tipo = elemento.tipo || 'movie';
      const { coleccion, setColeccion, guardar } = recursosDe(tipo);
      const id = String(elemento.id);
      const actuales = coleccion[id] || { favorita: false, vista: false, gusta: false };
      const nuevos = {
        titulo: elemento.title || elemento.name || elemento.titulo || actuales.titulo || '',
        poster_path: elemento.poster_path ?? actuales.poster_path ?? null,
        favorita: actuales.favorita,
        vista: actuales.vista,
        gusta: actuales.gusta,
        [campo]: !actuales[campo],
      };

      // Actualizacion optimista de la UI
      setColeccion((prev) => {
        const copia = { ...prev };
        if (!nuevos.favorita && !nuevos.vista && !nuevos.gusta) {
          delete copia[id];
        } else {
          copia[id] = nuevos;
        }
        return copia;
      });

      try {
        const datos = await guardar(id, nuevos);
        setColeccion(tipo === 'tv' ? datos.series || {} : datos.peliculas || {});
      } catch {
        // Si falla, recargamos el estado real desde el servidor
        mostrarToast?.('No se pudo guardar el cambio.');
        const datos = await obtenerMisDatos().catch(() => null);
        if (datos) setColeccion(tipo === 'tv' ? datos.series || {} : datos.peliculas || {});
      }
    },
    [recursosDe, mostrarToast]
  );

  // Guarda (o actualiza) la resena de un elemento ya visto.
  const guardarResena = useCallback(
    async (elemento, resena) => {
      const tipo = elemento.tipo || 'movie';
      const { coleccion, setColeccion, guardar } = recursosDe(tipo);
      const id = String(elemento.id);
      const actuales = coleccion[id] || {};
      const cuerpo = {
        titulo: elemento.title || elemento.name || elemento.titulo || actuales.titulo || '',
        poster_path: elemento.poster_path ?? actuales.poster_path ?? null,
        favorita: actuales.favorita ?? false,
        vista: true,
        gusta: actuales.gusta ?? false,
        resena,
      };

      setColeccion((prev) => ({ ...prev, [id]: { ...prev[id], ...cuerpo } }));

      try {
        const datos = await guardar(id, cuerpo);
        setColeccion(tipo === 'tv' ? datos.series || {} : datos.peliculas || {});
        mostrarToast?.(resena ? 'Reseña guardada.' : 'Reseña eliminada.');
      } catch {
        mostrarToast?.('No se pudo guardar la reseña.');
        const datos = await obtenerMisDatos().catch(() => null);
        if (datos) setColeccion(tipo === 'tv' ? datos.series || {} : datos.peliculas || {});
      }
    },
    [recursosDe, mostrarToast]
  );

  // --- Actores favoritos ---
  const esActorFavorito = useCallback((id) => Boolean(actores[String(id)]), [actores]);

  // Marca/desmarca un actor como favorito. `actor` incluye id, name y profile_path.
  const alternarActorFavorito = useCallback(
    async (actor) => {
      const id = String(actor.id);
      const esFavorito = Boolean(actores[id]);
      const cuerpo = {
        favorito: !esFavorito,
        nombre: actor.name || actor.nombre || '',
        profile_path: actor.profile_path ?? null,
      };

      // Actualizacion optimista
      setActores((prev) => {
        const copia = { ...prev };
        if (esFavorito) delete copia[id];
        else copia[id] = { nombre: cuerpo.nombre, profile_path: cuerpo.profile_path };
        return copia;
      });

      try {
        const datos = await guardarActorFavorito(id, cuerpo);
        setActores(datos.actores || {});
        mostrarToast?.(esFavorito ? 'Actor quitado de favoritos.' : 'Actor añadido a favoritos.');
      } catch {
        mostrarToast?.('No se pudo guardar el actor favorito.');
        const datos = await obtenerMisDatos().catch(() => null);
        if (datos) setActores(datos.actores || {});
      }
    },
    [actores, mostrarToast]
  );

  // Listas derivadas de peliculas y series.
  const {
    favoritas,
    meGusta,
    vistas,
    conResena,
  } = derivarListas(peliculas);
  const {
    favoritas: favoritasSeries,
    meGusta: meGustaSeries,
    vistas: vistasSeries,
    conResena: conResenaSeries,
  } = derivarListas(series);

  // Lista de actores favoritos
  const actoresFavoritos = Object.entries(actores).map(([id, a]) => ({ id, ...a }));

  const valor = {
    perfil,
    guardarPerfil,
    peliculas,
    series,
    cargando,
    obtenerFlags,
    alternarFlag,
    guardarResena,
    // Listas de peliculas
    favoritas,
    meGusta,
    vistas,
    conResena,
    // Listas de series
    favoritasSeries,
    meGustaSeries,
    vistasSeries,
    conResenaSeries,
    // Actores
    esActorFavorito,
    alternarActorFavorito,
    actoresFavoritos,
  };

  return <UserDataContext.Provider value={valor}>{children}</UserDataContext.Provider>;
}

export function useUserData() {
  const contexto = useContext(UserDataContext);
  if (!contexto) {
    throw new Error('useUserData debe usarse dentro de UserDataProvider');
  }
  return contexto;
}
