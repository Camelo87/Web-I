import { useWatch } from "react-hook-form";
import { CATEGORIAS, DIFICULTADES } from "../esquemas.js";

// Tarjeta en vivo de lo que se va a publicar. useWatch se suscribe a los valores del formulario:
// al teclear solo se vuelve a pintar este componente, no el formulario entero.
export default function VistaPrevia({ control }) {
  const receta = useWatch({ control });
  const ingredientes = (receta.ingredientes ?? []).map((ing) => ing.nombre?.trim()).filter(Boolean);
  const detalles = [
    CATEGORIAS[receta.categoria],
    DIFICULTADES[receta.dificultad],
    Number.isFinite(receta.minutos) && `⏱ ${receta.minutos} min`,
    Number.isFinite(receta.raciones) && `🍽 ${receta.raciones}`,
  ].filter(Boolean);

  return (
    <section className="vista-previa" aria-label="Vista previa de la receta">
      <p className="vista-previa__titulo">Así se verá en la lista</p>
      <h3>{receta.nombre?.trim() || "Tu receta"}</h3>
      <p className="meta">
        {detalles.join(" · ")}
        {receta.vegetariana && <span className="etiqueta">🌱 Vegetariana</span>}
      </p>
      <p className="autor">Por {receta.autor?.trim() || "…"}</p>
      <p>{ingredientes.length > 0 ? ingredientes.join(", ") : "Sin ingredientes todavía"}</p>
    </section>
  );
}
