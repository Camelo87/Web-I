import { CATEGORIAS, DIFICULTADES } from "../esquemas.js";

// Una receta publicada.
export default function TarjetaReceta({ receta }) {
  const { nombre, autor, categoria, dificultad, raciones, minutos, vegetariana, ingredientes, pasos, creadaEn } = receta;

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
    </article>
  );
}
