// Lógica pura: transforma datos, sin React ni DOM.

// La API trae strIngredient1..20 sueltos; los juntamos en un array limpio y sin repetidos
// (así el propio nombre sirve de key en la lista de ingredientes).
function sacarIngredientes(receta) {
  const lista = Array.from({ length: 20 }, (_, i) => receta[`strIngredient${i + 1}`]?.trim())
    .filter(Boolean);
  return [...new Set(lista)];
}

export function limpiarRecetas(recetas) {
  return recetas.map((r) => ({
    id: r.idMeal,
    nombre: r.strMeal,
    categoria: r.strCategory ?? "Sin categoría",
    pais: r.strArea ?? "?",
    foto: r.strMealThumb ? `${r.strMealThumb}/small` : null,
    ingredientes: sacarIngredientes(r),
  }));
}

// Texto, categoría y casilla de rápidas en un solo paso; luego, de menos a más ingredientes.
export function filtrarRecetas(recetas, { texto, categoria, soloRapidas }) {
  const buscado = texto.trim().toLowerCase();
  return recetas
    .filter((r) => r.nombre.toLowerCase().includes(buscado))
    .filter((r) => !categoria || r.categoria === categoria)
    .filter((r) => !soloRapidas || r.ingredientes.length <= 8)
    .toSorted((a, b) => a.ingredientes.length - b.ingredientes.length);
}

// [["Beef", 42], ["Chicken", 35], ...] ordenado por nombre
export function contarPorCategoria(recetas) {
  const cuenta = recetas.reduce((acc, r) => {
    acc[r.categoria] = (acc[r.categoria] ?? 0) + 1; // acc es un objeto nuevo de este reduce: mutarlo es seguro
    return acc;
  }, {});
  return Object.entries(cuenta).toSorted(([a], [b]) => a.localeCompare(b));
}

// Lista de la compra: ingredientes sin repetir de varias recetas y en cuántas aparece cada uno.
// "Garlic" y "garlic " cuentan como el mismo.
export function juntarIngredientes(recetas) {
  const cuenta = new Map();
  for (const r of recetas) {
    for (const ingrediente of r.ingredientes) {
      const clave = ingrediente.toLowerCase();
      const previo = cuenta.get(clave);
      cuenta.set(clave, { clave, nombre: previo?.nombre ?? ingrediente, veces: (previo?.veces ?? 0) + 1 });
    }
  }
  return [...cuenta.values()].toSorted((a, b) => b.veces - a.veces || a.nombre.localeCompare(b.nombre));
}
