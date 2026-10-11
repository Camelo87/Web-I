import { buscarRecetas } from "./api.js";
import { limpiarRecetas, filtrarRapidas, ordenarPorIngredientes, contarPorCategoria } from "./logica.js";
import { pintarCargando, pintarError, pintarVacio, pintarRecetas } from "./render.js";
import "./estilos.css";

const form = document.getElementById("form");
const busqueda = document.getElementById("busqueda");
const atras = document.getElementById("atras");
const rapidas = document.getElementById("rapidas");

let recetas = []; // última búsqueda, ya limpia
let texto = "";
const historial = []; // búsquedas anteriores, para el botón de volver
const inicio = ["chicken", "pasta", "cake", "beef", "fish", "soup"];

function mostrar() {
  const visibles = ordenarPorIngredientes(filtrarRapidas(recetas, rapidas.checked));
  if (visibles.length === 0) return pintarVacio(texto);
  pintarRecetas(visibles, contarPorCategoria(visibles));
}

async function buscar(termino, guardar = true) {
  if (guardar && texto) historial.push(texto);
  atras.disabled = historial.length === 0;
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
atras.addEventListener("click", () => {
  busqueda.value = historial.at(-1);
  buscar(historial.pop(), false);
  atras.disabled = historial.length === 0;
});
rapidas.addEventListener("change", () => recetas.length && mostrar());

buscar(inicio[Math.floor(Math.random() * inicio.length)]); // inicio variado
