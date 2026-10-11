import { cargarTodas } from "./api.js";
import { limpiarRecetas, filtrarRapidas, ordenarPorIngredientes, contarPorCategoria } from "./logica.js";
import { pintarCargando, pintarError, pintarVacio, pintarRecetas } from "./render.js";
import "./estilos.css";

const busqueda = document.getElementById("busqueda");
const sugerencias = document.getElementById("sugerencias");
const inicio = document.getElementById("inicio");
const lateral = document.getElementById("categorias");
const rapidas = document.getElementById("rapidas");

let recetas = []; // todas las recetas, ya limpias
let categoria = ""; // "" = todas

// Filtra por lo escrito y por la casilla; se llama en cada tecla.
function mostrar() {
  const texto = busqueda.value.trim().toLowerCase();
  const coinciden = recetas.filter(
    (r) => r.nombre.toLowerCase().includes(texto) && (!categoria || r.categoria === categoria),
  );
  pintarCategorias();
  const visibles = ordenarPorIngredientes(filtrarRapidas(coinciden, rapidas.checked));
  if (visibles.length === 0) return pintarVacio(busqueda.value.trim());
  pintarRecetas(visibles, contarPorCategoria(visibles));
}

// Botones de la izquierda: "Todas" + una por categoría, con su número de recetas.
function pintarCategorias() {
  const cuenta = Object.entries(contarPorCategoria(recetas)).toSorted();
  const boton = (valor, nombre, n) =>
    `<button type="button" data-cat="${valor}" class="${valor === categoria ? "activa" : ""}">${nombre} <span>${n}</span></button>`;
  lateral.innerHTML =
    boton("", "Todas", recetas.length) + cuenta.map(([c, n]) => boton(c, c, n)).join("");
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
lateral.addEventListener("click", (e) => {
  const boton = e.target.closest("button");
  if (!boton) return;
  categoria = boton.dataset.cat;
  mostrar();
});
inicio.addEventListener("click", () => {
  busqueda.value = "";
  categoria = "";
  rapidas.checked = false;
  recetas.length ? mostrar() : arrancar();
});
document.getElementById("form").addEventListener("submit", (e) => e.preventDefault());

arrancar();
