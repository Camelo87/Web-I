// Capa de red: solo habla con json-server. Todo lo que llega se valida con Zod antes de usarlo.
import { z } from "zod";
import { esquemaRecetaGuardada } from "./esquemas.js";

const API = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

async function pedir(ruta, opciones) {
  let respuesta;
  try {
    respuesta = await fetch(API + ruta, opciones);
  } catch (error) {
    if (error.name === "AbortError") throw error; // lo canceló TanStack Query: no es un fallo
    throw new Error("No hay conexión con el API. ¿Has arrancado el proyecto con «npm run dev»?");
  }
  // fetch solo falla con errores de red: un 404 o un 500 hay que comprobarlo a mano.
  if (!respuesta.ok) throw new Error(`El servidor respondió con un error ${respuesta.status}`);
  return respuesta.json();
}

// Una receta mal formada no rompe la lista: se descarta y se informa de qué fallaba.
export async function obtenerRecetas(categoria, signal) {
  const filtro = categoria ? `&categoria=${encodeURIComponent(categoria)}` : "";
  const json = await pedir(`/recetas?_sort=-creadaEn${filtro}`, { signal });

  const lista = z.array(z.unknown()).safeParse(json);
  if (!lista.success) throw new Error("El API no devolvió una lista de recetas");

  const recetas = [];
  const descartadas = [];
  for (const dato of lista.data) {
    const resultado = esquemaRecetaGuardada.safeParse(dato);
    if (resultado.success) {
      recetas.push(resultado.data);
    } else {
      descartadas.push({
        id: String(dato?.id ?? "sin id"),
        nombre: typeof dato?.nombre === "string" ? dato.nombre : "Sin nombre",
        problemas: resultado.error.issues.map((issue) => `${issue.path.join(".") || "receta"}: ${issue.message}`),
      });
    }
  }
  return { recetas, descartadas };
}

export async function crearReceta(receta) {
  const json = await pedir("/recetas", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...receta, creadaEn: new Date().toISOString() }),
  });
  const resultado = esquemaRecetaGuardada.safeParse(json);
  if (!resultado.success) throw new Error("El servidor guardó la receta, pero devolvió datos no válidos");
  return resultado.data;
}

export async function borrarReceta(id) {
  await pedir(`/recetas/${encodeURIComponent(id)}`, { method: "DELETE" });
}
