import { useFieldArray } from "react-hook-form";
import { propsCampo } from "../accesibilidad.js";
import { MensajeError } from "./Campo.jsx";

// Lista dinámica de ingredientes: useFieldArray añade y quita filas sin convertir el formulario en controlado.
export default function CampoIngredientes({ control, register, errors }) {
  const { fields, append, remove } = useFieldArray({ control, name: "ingredientes" });
  // Error de la lista entera (mínimo 2, máximo 15), distinto de los errores de cada fila.
  const errorLista = errors.ingredientes?.root ?? errors.ingredientes;

  return (
    <fieldset className="ingredientes" aria-describedby={errorLista?.message ? "ingredientes-error" : undefined}>
      <legend>Ingredientes</legend>
      <ol>
        {fields.map((field, i) => {
          // field.id lo genera RHF y no cambia al borrar filas: sirve de key y de id estable.
          const idNombre = `ing-${field.id}-nombre`;
          const idCantidad = `ing-${field.id}-cantidad`;
          const error = errors.ingredientes?.[i];
          return (
            <li key={field.id} className="fila">
              <label htmlFor={idNombre} className="oculto">
                Ingrediente {i + 1}
              </label>
              <input type="text" placeholder="Ej.: harina" {...register(`ingredientes.${i}.nombre`)} {...propsCampo(idNombre, error?.nombre)} />
              <label htmlFor={idCantidad} className="oculto">
                Cantidad del ingrediente {i + 1}
              </label>
              <input type="text" placeholder="Ej.: 200 g" {...register(`ingredientes.${i}.cantidad`)} {...propsCampo(idCantidad, error?.cantidad)} />
              <button type="button" className="quitar" onClick={() => remove(i)} aria-label={`Quitar ingrediente ${i + 1}`}>
                ✕
              </button>
              <MensajeError id={`${idNombre}-error`} error={error?.nombre} />
              <MensajeError id={`${idCantidad}-error`} error={error?.cantidad} />
            </li>
          );
        })}
      </ol>
      <button type="button" className="secundario" onClick={() => append({ nombre: "", cantidad: "" })}>
        + Añadir ingrediente
      </button>
      <MensajeError id="ingredientes-error" error={errorLista} />
    </fieldset>
  );
}
