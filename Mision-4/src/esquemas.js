// Única fuente de verdad de la validación: el formulario y las respuestas del API usan estos esquemas.
import { z } from "zod";

// Las opciones de los <select> y radios salen de aquí, así no se repiten en los componentes.
export const CATEGORIAS = { desayuno: "Desayuno", entrante: "Entrante", principal: "Principal", postre: "Postre" };
export const DIFICULTADES = { facil: "Fácil", media: "Media", dificil: "Difícil" };

// Palabras que delatan carne o pescado en una receta marcada como vegetariana.
const NO_VEGETARIANOS = [
  "pollo", "ternera", "cerdo", "carne", "cordero", "pavo", "jamon", "chorizo", "bacon", "beicon",
  "panceta", "lomo", "salchicha", "atun", "salmon", "merluza", "bacalao", "pescado", "gamba", "gambas", "anchoa",
];

// "Jamón Serrano" → ["jamon", "serrano"]: minúsculas y sin tildes para comparar.
const palabras = (texto) => texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(/[^a-zñ]+/);

const ingrediente = z.object({
  nombre: z.string().trim().min(2, "Escribe el ingrediente").max(40, "Máximo 40 caracteres"),
  cantidad: z.string().trim().min(1, "¿Cuánto?").max(30, "Máximo 30 caracteres"),
});

// Los ingredientes repetidos se marcan uno a uno (path con su posición) para que el error salga en su fila.
const listaIngredientes = z
  .array(ingrediente, { error: "Los ingredientes deben ser una lista" })
  .min(2, "Una receta necesita al menos 2 ingredientes")
  .max(15, "Como mucho 15 ingredientes")
  .superRefine((lista, ctx) => {
    const vistos = new Set();
    lista.forEach((ing, i) => {
      const clave = ing.nombre.trim().toLowerCase();
      if (clave && vistos.has(clave)) {
        ctx.addIssue({ code: "custom", message: "Este ingrediente ya está en la lista", path: [i, "nombre"] });
      }
      vistos.add(clave);
    });
  });

export const esquemaReceta = z
  .object({
    nombre: z.string().trim().min(3, "Mínimo 3 caracteres").max(60, "Máximo 60 caracteres"),
    autor: z.string().trim().min(2, "¿Quién la firma? Mínimo 2 caracteres").max(40, "Máximo 40 caracteres"),
    categoria: z.enum(Object.keys(CATEGORIAS), { error: "Elige una categoría" }),
    dificultad: z.enum(Object.keys(DIFICULTADES), { error: "Elige la dificultad" }),
    raciones: z.number({ error: "Escribe un número" }).int("Sin decimales").min(1, "Al menos 1 ración").max(20, "Como mucho 20 raciones"),
    minutos: z.number({ error: "Escribe un número" }).int("Sin decimales").min(5, "Mínimo 5 minutos").max(600, "Como mucho 10 horas"),
    vegetariana: z.boolean(),
    ingredientes: listaIngredientes,
    pasos: z.string().trim().min(20, "Cuenta un poco más: mínimo 20 caracteres").max(2000, "Máximo 2000 caracteres"),
  })
  // Refinamientos que cruzan campos: el error se asigna al campo que hay que corregir.
  .refine((r) => r.dificultad !== "facil" || r.minutos <= 60, {
    error: "Una receta fácil no debería pasar de 60 minutos",
    path: ["minutos"],
  })
  .superRefine((r, ctx) => {
    if (!r.vegetariana) return;
    r.ingredientes.forEach((ing, i) => {
      if (palabras(ing.nombre).some((p) => NO_VEGETARIANOS.includes(p))) {
        ctx.addIssue({ code: "custom", message: "No es vegetariano: quítalo o desmarca la casilla", path: ["ingredientes", i, "nombre"] });
      }
    });
  });

// Lo que devuelve el API: lo mismo que el formulario más lo que añade el servidor.
// safeExtend (y no extend) porque el esquema tiene refinamientos y así también se heredan.
export const esquemaRecetaGuardada = esquemaReceta.safeExtend({
  id: z.string(),
  creadaEn: z.iso.datetime({ error: "Fecha no válida" }),
});
