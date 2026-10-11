// Capa de red: solo habla con TheMealDB y con la caché de localStorage.
const URL_BASE = "https://www.themealdb.com/api/json/v1/1/search.php?s=";

function leerCache(clave) {
  try {
    return JSON.parse(localStorage.getItem(clave));
  } catch {
    return null; // JSON corrupto o localStorage bloqueado
  }
}

export async function buscarRecetas(texto) {
  const clave = `recetas:${texto.toLowerCase()}`;
  const guardado = leerCache(clave);
  if (guardado) return guardado;

  const respuesta = await fetch(URL_BASE + encodeURIComponent(texto));
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);

  const { meals } = await respuesta.json();
  const recetas = meals ?? []; // la API devuelve null si no hay resultados

  try {
    localStorage.setItem(clave, JSON.stringify(recetas));
  } catch {
    // sin caché, pero la app sigue funcionando
  }
  return recetas;
}
