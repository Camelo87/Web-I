// Botones de la izquierda: "Todas" + una por categoría, con su número de recetas.
export default function Categorias({ cuenta, total, activa, onElegir }) {
  const opciones = [["", "Todas", total], ...cuenta.map(([cat, n]) => [cat, cat, n])];

  return (
    <aside className="categorias" aria-label="Categorías">
      {opciones.map(([valor, nombre, n]) => (
        <button
          key={valor || "todas"}
          type="button"
          className={valor === activa ? "activa" : ""}
          aria-pressed={valor === activa}
          onClick={() => onElegir(valor)}
        >
          {nombre} <span>{n}</span>
        </button>
      ))}
    </aside>
  );
}
