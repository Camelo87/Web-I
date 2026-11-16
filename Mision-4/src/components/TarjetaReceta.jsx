import { CATEGORIAS, DIFICULTADES } from "../esquemas.js";
import { useBorrarReceta } from "../hooks/useRecetas.js";

// Una receta publicada, con su botón para borrarla.
export default function TarjetaReceta({ receta }) {
  const borrar = useBorrarReceta();
  const { id, nombre, autor, categoria, dificultad, raciones, minutos, vegetariana, ingredientes, pasos, creadaEn } = receta;

  return (
    <article className="tarjeta">
      <h3>{nombre}</h3>
      <p className="meta">
        {CATEGORIAS[categoria]} · {DIFICULTADES[dificultad]} · ⏱ {minutos} min · 🍽 {raciones}
        {vegetariana && <span className="etiqueta">🌱 Vegetariana</span>}
      </p>
      <p className="autor">
        Por {autor}, el {new Date(creadaEn).toLocaleDateString("es-ES")}
      </p>
      <details>
        <summary>{ingredientes.length} ingredientes</summary>
        <ul>
          {ingredientes.map((ing) => (
            <li key={ing.nombre}>
              {ing.nombre} <span className="cantidad">({ing.cantidad})</span>
            </li>
          ))}
        </ul>
      </details>
      <details>
        <summary>Preparación</summary>
        <p>{pasos}</p>
      </details>
      <button
        type="button"
        className="secundario borrar"
        disabled={borrar.isPending}
        onClick={() => window.confirm(`¿Borrar «${nombre}»? No se puede deshacer.`) && borrar.mutate(id)}
      >
        {borrar.isPending ? "Borrando…" : "Borrar"}
      </button>
      {borrar.isError && (
        <p className="error" role="alert">
          ⚠ No se pudo borrar: {borrar.error.message}
        </p>
      )}
    </article>
  );
}
