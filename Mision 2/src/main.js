import { buscarRecetas } from "./api.js";
import { limpiarRecetas, filtrarRapidas, ordenarPorIngredientes, contarPorCategoria } from "./logica.js";
import { pintarCargando, pintarError, pintarVacio, pintarRecetas } from "./render.js";
import "./estilos.css";

const form = document.getElementById("form");
const busqueda = document.getElementById("busqueda");
const rapidas = document.getElementById("rapidas");

let recetas = []; // última búsqueda, ya limpia
let texto = "";

function mostrar() {
  const visibles = ordenarPorIngredientes(filtrarRapidas(recetas, rapidas.checked));
  if (visibles.length === 0) return pintarVacio(texto);
  pintarRecetas(visibles, contarPorCategoria(visibles));
}

async function buscar(termino) {
  texto = termino.trim();
  if (!texto) return pintarVacio("");
  pintarCargando();
  try {
    recetas = limpiarRecetas(await buscarRecetas(texto));
    mostrar();
  } catch (error) {
    pintarError(error.message);
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  buscar(busqueda.value);
});
rapidas.addEventListener("change", () => recetas.length && mostrar());

buscar("chicken");
