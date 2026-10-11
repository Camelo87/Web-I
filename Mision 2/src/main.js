import { cargarTodas } from "./api.js";
import { limpiarRecetas, filtrarRapidas, ordenarPorIngredientes, contarPorCategoria } from "./logica.js";
import { pintarCargando, pintarError, pintarVacio, pintarRecetas } from "./render.js";
import "./estilos.css";

const busqueda = document.getElementById("busqueda");
const sugerencias = document.getElementById("sugerencias");
const inicio = document.getElementById("inicio");
const rapidas = document.getElementById("rapidas");

let recetas = []; // todas las recetas, ya limpias

// Filtra por lo escrito y por la casilla; se llama en cada tecla.
function mostrar() {
  const texto = busqueda.value.trim().toLowerCase();
  const coinciden = recetas.filter((r) => r.nombre.toLowerCase().includes(texto));
  const visibles = ordenarPorIngredientes(filtrarRapidas(coinciden, rapidas.checked));
  if (visibles.length === 0) return pintarVacio(busqueda.value.trim());
  pintarRecetas(visibles, contarPorCategoria(visibles));
}

async function arrancar() {
  pintarCargando();
  try {
    recetas = limpiarRecetas(await cargarTodas());
    sugerencias.innerHTML = recetas.map((r) => `<option value="${r.nombre.replaceAll('"', "&quot;")}">`).join("");
    mostrar();
  } catch (error) {
    pintarError(error.message);
  }
}

busqueda.addEventListener("input", () => recetas.length && mostrar());
rapidas.addEventListener("change", () => recetas.length && mostrar());
inicio.addEventListener("click", () => {
  busqueda.value = "";
  rapidas.checked = false;
  recetas.length ? mostrar() : arrancar();
});
document.getElementById("form").addEventListener("submit", (e) => e.preventDefault());

arrancar();
