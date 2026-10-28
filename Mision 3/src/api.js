// Capa de red: solo habla con TheMealDB y con la caché de localStorage.
import { limpiarRecetas } from "./logica.js";

const URL_BASE = "https://www.themealdb.com/api/json/v1/1/search.php?f=";
const CLAVE = "despensa:v2"; // versión en la clave: si cambia el formato, la caché vieja se ignora
const CADUCIDAD = 24 * 60 * 60 * 1000; // un día en milisegundos

// Solo vale una caché con recetas y de menos de un día.
function leerCache() {
  try {
    const { fecha, recetas } = JSON.parse(localStorage.getItem(CLAVE)) ?? {};
    const valida = Array.isArray(recetas) && recetas.length > 0 && Date.now() - fecha < CADUCIDAD;
    return valida ? recetas : null;
  } catch {
    return null; // JSON corrupto o localStorage bloqueado
  }
}

function guardarCache(recetas) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify({ fecha: Date.now(), recetas }));
  } catch {
    // sin caché, pero la app sigue funcionando
  }
}

async function pedirLetra(letra, signal) {
  const respuesta = await fetch(URL_BASE + letra, { signal });
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
  const { meals } = await respuesta.json();
  return meals ?? []; // la API devuelve null si no hay resultados
}

// La API solo lista por letra inicial: pedimos las 26 a la vez.
// Con allSettled, si falla una letra se muestran las demás.
export async function cargarTodas(signal) {
  const guardado = leerCache();
  if (guardado) return { recetas: guardado, fallidas: 0 };

  const letras = Array.from({ length: 26 }, (_, i) => String.fromCharCode(97 + i));
  const resultados = await Promise.allSettled(letras.map((l) => pedirLetra(l, signal)));
  const buenas = resultados.filter((r) => r.status === "fulfilled");
  if (buenas.length === 0) throw resultados[0].reason; // fallaron todas: error de verdad

  const recetas = limpiarRecetas(buenas.flatMap((r) => r.value));
  const fallidas = resultados.length - buenas.length;
  if (fallidas === 0) guardarCache(recetas); // una lista incompleta no se guarda
  return { recetas, fallidas };
}
