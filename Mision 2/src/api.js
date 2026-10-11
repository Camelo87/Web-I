// Capa de red: solo habla con TheMealDB y con la caché de localStorage.
const URL_BASE = "https://www.themealdb.com/api/json/v1/1/search.php?f=";
const CLAVE = "recetas:todas";

function leerCache() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE));
  } catch {
    return null; // JSON corrupto o localStorage bloqueado
  }
}

async function pedirLetra(letra) {
  const respuesta = await fetch(URL_BASE + letra);
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
  const { meals } = await respuesta.json();
  return meals ?? []; // la API devuelve null si no hay resultados
}

// La API solo lista por letra inicial: pedimos las 26 a la vez.
export async function cargarTodas() {
  const guardado = leerCache();
  if (guardado) return guardado;

  const letras = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i));
  const recetas = (await Promise.all(letras.map(pedirLetra))).flat()
    .map(({ strInstructions, ...resto }) => resto); // las instrucciones pesan y no se usan

  try {
    localStorage.setItem(CLAVE, JSON.stringify(recetas));
  } catch {
    // sin caché, pero la app sigue funcionando
  }
  return recetas;
}
