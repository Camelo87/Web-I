// Lógica pura: transforma los datos de la API, sin tocar el DOM.

// La API trae strIngredient1..20 sueltos; los juntamos en un array limpio.
function sacarIngredientes(receta) {
  return Array.from({ length: 20 }, (_, i) => receta[`strIngredient${i + 1}`]?.trim())
    .filter(Boolean);
}

export function limpiarRecetas(recetas) {
  return recetas.map((r) => ({
    id: r.idMeal,
    nombre: r.strMeal,
    categoria: r.strCategory ?? "Sin categoría",
    pais: r.strArea ?? "?",
    foto: r.strMealThumb,
    ingredientes: sacarIngredientes(r),
  }));
}

export function filtrarRapidas(recetas, soloRapidas) {
  return soloRapidas ? recetas.filter((r) => r.ingredientes.length <= 8) : recetas;
}

export function ordenarPorIngredientes(recetas) {
  return recetas.toSorted((a, b) => a.ingredientes.length - b.ingredientes.length);
}

// { Chicken: 3, Pasta: 1 }
export function contarPorCategoria(recetas) {
  return recetas.reduce((cuenta, r) => {
    cuenta[r.categoria] = (cuenta[r.categoria] ?? 0) + 1;
    return cuenta;
  }, {});
}
