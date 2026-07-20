// Set de avatares predefinidos para el perfil. Cada avatar es solo datos
// (emoji + color), sin archivos ni dependencias. Esta lista es la fuente de
// verdad del selector; el backend replica los ids permitidos (mantener en
// sincronia con AVATARES_PERMITIDOS en server/index.js).
export const AVATARES = [
  { id: 'palomitas', emoji: '🍿', color: '#e50914' },
  { id: 'claqueta', emoji: '🎬', color: '#f5c518' },
  { id: 'estrella', emoji: '⭐', color: '#4aa3ff' },
  { id: 'fuego', emoji: '🔥', color: '#ff6b35' },
  { id: 'corazon', emoji: '❤️', color: '#e84393' },
  { id: 'gafas', emoji: '🕶️', color: '#6c5ce7' },
  { id: 'robot', emoji: '🤖', color: '#00b894' },
  { id: 'fantasma', emoji: '👻', color: '#b2bec3' },
  { id: 'alien', emoji: '👽', color: '#55efc4' },
  { id: 'gato', emoji: '🐱', color: '#fab1a0' },
  { id: 'cohete', emoji: '🚀', color: '#0984e3' },
  { id: 'corona', emoji: '👑', color: '#fdcb6e' },
];

// Avatar por defecto (el primero del set).
export const AVATAR_POR_DEFECTO = AVATARES[0].id;

// Devuelve el avatar con ese id, o el por defecto si no existe.
export function obtenerAvatar(id) {
  return AVATARES.find((a) => a.id === id) || AVATARES[0];
}
