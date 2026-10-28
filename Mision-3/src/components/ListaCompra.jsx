import { juntarIngredientes } from "../logica.js";

// Panel de la compra: recetas elegidas y todos sus ingredientes juntos, sin repetir.
// Los ingredientes no son estado: se derivan de las recetas elegidas en cada render.
export default function ListaCompra({ recetas, onQuitar, onVaciar }) {
  const ingredientes = juntarIngredientes(recetas);

  return (
    <section className="compra" aria-label="Lista de la compra">
      <h2>🛒 Lista de la compra</h2>
      <p>
        {recetas.length} {recetas.length === 1 ? "receta" : "recetas"} · <strong>{ingredientes.length}</strong>{" "}
        ingredientes distintos
      </p>

      <ul className="chips">
        {recetas.map((r) => (
          <li key={r.id}>
            {r.nombre}
            <button type="button" aria-label={`Quitar ${r.nombre}`} onClick={() => onQuitar(r.id)}>
              ✕
            </button>
          </li>
        ))}
      </ul>

      <ul className="ingredientes">
        {ingredientes.map(({ clave, nombre, veces }) => (
          <li key={clave}>
            {nombre}
            {veces > 1 && <span title="Lo usan varias recetas"> ×{veces}</span>}
          </li>
        ))}
      </ul>

      <button type="button" onClick={onVaciar}>
        Vaciar lista
      </button>
    </section>
  );
}
