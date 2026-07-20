# CINEMA — Documentación del proyecto

Aplicación web personal para **buscar películas, ver detalles y gestionar una
biblioteca propia** (favoritas, me gusta, vistas, reseñas y actores favoritos).
Consume los datos de **TMDB (The Movie Database)** y guarda la información del
usuario en un fichero local.

> Aplicación de **uso personal** (un solo usuario). No hay login: todos los datos
> se guardan en `data/mis_datos.json`.

---

## 1. Arquitectura general

El proyecto tiene **dos partes** que se ejecutan a la vez:

```
┌─────────────────┐      /api/...       ┌──────────────────┐      api.themoviedb.org
│  Cliente React  │ ──────────────────▶ │  Servidor Express │ ───────────────────────▶ TMDB
│  (Vite, :5173)  │ ◀────────────────── │  (proxy, :3001)   │ ◀───────────────────────
└─────────────────┘     JSON            └──────────────────┘
                                                 │
                                                 ▼
                                        data/mis_datos.json
                                        (datos personales)
```

- **Cliente (`/client`)**: la interfaz en React + Vite. Nunca habla directamente
  con TMDB; siempre pasa por el servidor.
- **Servidor (`/server`)**: un Express que actúa como **proxy** hacia TMDB. Su
  función principal es **ocultar la `API_KEY`** (que vive en `.env` y nunca llega
  al navegador) y además **leer/escribir los datos personales** en disco.

### ¿Por qué un proxy?

1. **Seguridad**: la `API_KEY` no se expone en el frontend.
2. **Idioma**: el servidor fuerza `language=es-ES` en todas las peticiones.
3. **Persistencia**: el navegador no puede escribir ficheros locales; el servidor sí.

---

## 2. Stack y dependencias

- **Frontend**: HTML5, CSS3 nativo, JavaScript, **React 18**, **react-router-dom 6**, **Vite 5**.
- **Backend**: **Node.js**, **Express 4**, **dotenv** (lee la `API_KEY`).
- **Dev**: **nodemon** (reinicio del servidor), **concurrently** (lanza cliente y servidor juntos).
- **Sin dependencias externas de UI** (ni librerías de iconos, ni de estilos): los
  iconos son SVG propios y los estilos CSS están escritos a mano.

---

## 3. Estructura de ficheros

```
04-peliculas/
├── CLAUDE.md                 # Especificaciones del proyecto
├── DOCUMENTACION.md          # Este documento
├── package.json              # Scripts y dependencias del servidor
├── nodemon.json              # Configuración de nodemon
├── .env                      # API_KEY (no se versiona)
├── data/
│   └── mis_datos.json        # Datos personales (favoritas, vistas, reseñas, actores)
├── desing/                   # Imágenes de referencia del diseño
├── server/
│   └── index.js              # Servidor Express (proxy TMDB + persistencia)
└── client/
    └── src/
        ├── main.jsx          # Punto de entrada de React
        ├── App.jsx           # Rutas de la aplicación
        ├── index.css         # TODOS los estilos (rem, base 10px, responsive)
        ├── api/
        │   └── tmdb.js       # Funciones que llaman al servidor (/api/...)
        ├── context/
        │   └── UserDataContext.jsx   # Estado global de los datos personales
        ├── components/       # Componentes reutilizables (ver §6)
        └── pages/            # Una vista por ruta (ver §5)
```

---

## 4. El servidor (`server/index.js`)

Es un Express con dos grupos de endpoints.

### a) Proxy a TMDB (solo lectura)

Todas las peticiones pasan por `pedirTmdb()`, que añade `api_key` y `language=es-ES`.

| Endpoint                    | TMDB usado                       | Para qué |
|-----------------------------|----------------------------------|----------|
| `GET /api/now_playing`      | `/movie/now_playing`             | Últimos estrenos (carrusel + Home) |
| `GET /api/trending`         | `/trending/movie/week`           | Tendencias de la semana |
| `GET /api/upcoming`         | `/discover/movie`                | Próximos estrenos (fecha futura, `release_date.gte = hoy`) |
| `GET /api/genres`           | `/genre/movie/list`              | Categorías para los filtros |
| `GET /api/search`           | `/search/movie` o `/discover/movie` | Búsqueda por título y/o filtros (año, rating, género) |
| `GET /api/movie/:id`        | `/movie/{id}` + `credits`        | Detalle de película con reparto |
| `GET /api/movie/:id/trailer`| `/movie/{id}/videos`             | Mejor tráiler (ES, y si no, original en-US) |
| `GET /api/person/:id`       | `/person/{id}` + `movie_credits` | Datos del actor/actriz y sus películas |

Detalles a destacar:
- **Búsqueda**: si hay texto usa `/search/movie` y aplica los filtros (año/rating/
  género) de forma estricta sobre el resultado; si solo hay filtros usa `/discover/movie`.
- **Tráiler**: `elegirMejor()` prioriza *Trailer* oficial > *Teaser*, solo de YouTube.
  Busca primero en español y, si no encuentra, recurre al idioma original.

### b) Datos personales (lectura y escritura)

| Endpoint                    | Para qué |
|-----------------------------|----------|
| `GET /api/mis-datos`        | Devuelve todo el `mis_datos.json` |
| `PUT /api/mis-datos/:id`    | Actualiza flags de una película (favorita/vista/gusta), fecha de visionado y reseña |
| `PUT /api/actores/:id`      | Marca/desmarca un actor como favorito |

Reglas de negocio en el servidor:
- Al marcar **vista** se guarda `fecha_vista` (solo la primera vez). Si se desmarca,
  se borran `fecha_vista` y `resena`.
- La **reseña** tiene un máximo de **280 caracteres** (`MAX_RESENA`).
- Si una película queda **sin ningún flag activo**, su entrada se elimina del JSON
  para no acumular basura.

### Formato de `data/mis_datos.json`

```json
{
  "peliculas": {
    "1234": {
      "titulo": "Nombre de la peli",
      "poster_path": "/abc.jpg",
      "favorita": true,
      "vista": true,
      "gusta": false,
      "fecha_vista": "2026-06-18T10:00:00.000Z",
      "resena": "Texto opcional, máximo 280 caracteres."
    }
  },
  "actores": {
    "5678": { "nombre": "Pedro Pascal", "profile_path": "/xyz.jpg" }
  }
}
```

---

## 5. El cliente: rutas y páginas (`client/src/pages`)

Las rutas se definen en `App.jsx`:

| Ruta              | Página                | Contenido |
|-------------------|-----------------------|-----------|
| `/`               | `Home.jsx`            | Carrusel de estrenos + listados (estrenos / tendencias) |
| `/buscar`         | `Buscar.jsx`          | Buscador con filtros (año, rating, categoría) |
| `/pelicula/:id`   | `Detalle.jsx`         | Ficha completa: sinopsis, reparto, tráiler, botones de acción |
| `/proximos`       | `ProximosEstrenos.jsx`| Próximos estrenos agrupados por mes |
| `/favoritos`      | `Favoritos.jsx`       | "Mis Películas Favoritas" + "Mis Actores Favoritos" |
| `/me-gusta`       | `MeGusta.jsx`         | Películas marcadas con "me gusta" |
| `/historico`      | `Historico.jsx`       | Historial de visionado (películas vistas + fecha) |
| `/mis-resenas`    | `MisResenas.jsx`      | Solo las películas con reseña escrita |

---

## 6. Componentes (`client/src/components`)

| Componente              | Función |
|-------------------------|---------|
| `Header.jsx`            | Cabecera con logo, navegación (solo escritorio) y acceso a la biblioteca |
| `MenuBiblioteca.jsx`    | Menú desplegable: Favoritos, Me Gusta / Historial de visionado, Mis Reseñas |
| `BottomNav.jsx`         | Navegación inferior fija (solo móvil) |
| `HeroCarousel.jsx`      | Carrusel automático de estrenos (cambia cada 3 s, pausa al pasar el cursor) |
| `MovieCard.jsx`         | Tarjeta de película (póster, título, rating, botones de acción) |
| `BotonesAccion.jsx`     | Botones favorita / me gusta / vista (con animación y relleno por color) |
| `ModalActor.jsx`        | Ficha del actor/actriz: foto, nacimiento, lugar, **país**, fallecimiento y películas |
| `ModalResena.jsx`       | Modal para escribir/editar la reseña (máx. 280 caracteres) |
| `ModalTrailer.jsx`      | Reproductor de tráiler de YouTube incrustado |
| `Modal.jsx`             | Modal genérico base |
| `Toast.jsx`             | Aviso flotante centrado (p. ej. "Reseña guardada") |
| `Tooltip.jsx`           | Texto de ayuda al pasar el cursor |
| `FilaPeliculaVista.jsx` | Fila reutilizada en Histórico y Mis Reseñas |
| `Iconos.jsx`            | Todos los iconos SVG propios |
| `Loader.jsx`            | Indicador de carga |
| `EstadoVacio.jsx`       | Mensaje cuando una lista está vacía |

### Patrón importante: `createPortal`

Todos los modales y el toast se renderizan con **`createPortal` a `document.body`**.
Esto es **necesario** porque las tarjetas usan `transform` en `:hover`, lo que crea
un contexto de posicionamiento que rompía el centrado de los elementos `position:fixed`.
Sacándolos al `body` se posicionan respecto a la ventana, no respecto a la tarjeta.

---

## 7. Estado global: `UserDataContext.jsx`

Un único contexto de React guarda en memoria los datos personales y los sincroniza
con el servidor:

- **Estado**: `peliculas`, `actores`, `cargando`.
- **Acciones**: `alternarFlag` (favorita/vista/gusta, **optimista**), `guardarResena`,
  `alternarActorFavorito`, `esActorFavorito`, `obtenerFlags`.
- **Listas derivadas** (calculadas a partir del estado): `favoritas`, `meGusta`,
  `vistas` (ordenadas por fecha), `conResena`, `actoresFavoritos`.

"Optimista" significa que la interfaz se actualiza al instante y luego confirma con
el servidor, para que la experiencia sea fluida.

---

## 8. Capa de API del cliente (`client/src/api/tmdb.js`)

Funciones que envuelven las llamadas `fetch` a `/api/...`:
`obtenerEstrenos`, `obtenerTendencias`, `obtenerProximosEstrenos`, `obtenerDetalle`,
`buscarPeliculas`, `obtenerPersona`, `obtenerTrailer`, `obtenerMisDatos`,
`guardarFlags`, `guardarResena`, `guardarActorFavorito`, y `urlImagen` (construye la
URL de las imágenes de TMDB según el tamaño).

---

## 9. Diseño y estilos (`index.css`)

- **Medidas en `rem`** con `font-size` base de **10px** (`1rem = 10px`).
- **Responsive** con punto de quiebre en **768px**: en escritorio la navegación va en
  el header; en móvil aparece la barra inferior (`BottomNav`).
- **Flexbox y CSS Grid** para la maquetación.
- **Colores destacados**: corazón rojo (me gusta), ojo celeste (`--color-celeste`),
  favorita dorado (`--color-dorado`).
- Los iconos de acción mantienen siempre **fondo gris** y se **rellenan con su color**
  al activarse.

### Decisiones de la interfaz que conviene recordar

- Todos los **textos visibles están en español**.
- No se usan `alert`/`confirm`/`prompt`: todo el feedback es visual (toast y modales).
- No se usa `innerHTML`: el contenido se construye con React.
- **Nacionalidad del actor**: TMDB **no expone un campo de nacionalidad**, solo
  `place_of_birth`. En `ModalActor.jsx` se aproxima el **país** tomando el último
  segmento del lugar de nacimiento y normalizando abreviaturas comunes (USA → Estados
  Unidos, UK → Reino Unido).

---

## 10. Cómo ejecutarlo

```bash
# 1. Instalar dependencias del servidor y del cliente
npm run install:all

# 2. Asegurarse de tener un fichero .env en la raíz con:
#    API_KEY = tu_clave_de_tmdb

# 3. Arrancar cliente y servidor a la vez
npm run dev
```

- Servidor (proxy TMDB): `http://localhost:3001`
- Cliente (interfaz): `http://localhost:5173`

Scripts disponibles (`package.json`):
- `npm run dev` — arranca servidor **y** cliente juntos (concurrently).
- `npm run server` — solo el servidor (con nodemon).
- `npm run client` — solo el cliente (Vite).
- `npm start` — servidor en modo producción.
