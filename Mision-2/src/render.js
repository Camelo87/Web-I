// Solo pinta en el DOM: recibe datos ya preparados.
const salida = document.getElementById("salida");
const resumen = document.getElementById("resumen");

const esc = (texto) => {
  const d = document.createElement("div");
  d.textContent = texto;
  return d.innerHTML;
};

export function pintarCargando() {
  resumen.textContent = "";
  salida.innerHTML = '<p class="estado">⏳ Cargando recetas…</p>';
}

export function pintarError(mensaje) {
  resumen.textContent = "";
  salida.innerHTML = `<p class="estado error">⚠ No se pudo cargar (${esc(mensaje)}). Revisa tu conexión e inténtalo de nuevo.</p>`;
}

export function pintarVacio(texto) {
  resumen.textContent = "";
  salida.innerHTML = `<p class="estado">No hay recetas${texto ? ` para «${esc(texto)}»` : ""}. Prueba con otra búsqueda.</p>`;
}

export function pintarRecetas(recetas, porCategoria) {
  resumen.textContent = Object.entries(porCategoria)
    .map(([categoria, n]) => `${categoria}: ${n}`)
    .join(" · ");

  salida.innerHTML = recetas
    .map(
      (r) => `
      <article class="tarjeta">
        <img src="${esc(r.foto)}/small" alt="${esc(r.nombre)}" loading="lazy" />
        <h2>${esc(r.nombre)}</h2>
        <p>${esc(r.pais)} · ${esc(r.categoria)}</p>
        <p class="num">${r.ingredientes.length} ingredientes</p>
        <details><summary>Ver ingredientes</summary>
          <ul>${r.ingredientes.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
        </details>
      </article>`,
    )
    .join("");
}
