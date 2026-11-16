import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { esquemaReceta, CATEGORIAS, DIFICULTADES } from "../esquemas.js";
import { useCrearReceta } from "../hooks/useRecetas.js";
import { propsCampo } from "../accesibilidad.js";
import Campo, { MensajeError } from "./Campo.jsx";
import CampoIngredientes from "./CampoIngredientes.jsx";

const RECETA_VACIA = {
  nombre: "",
  autor: "",
  categoria: "",
  dificultad: "",
  raciones: 2,
  minutos: 30,
  vegetariana: false,
  ingredientes: [
    { nombre: "", cantidad: "" },
    { nombre: "", cantidad: "" },
  ],
  pasos: "",
};

// Formulario no controlado: RHF lee los valores del DOM con refs y Zod decide qué es válido.
export default function FormularioReceta() {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(esquemaReceta),
    defaultValues: RECETA_VACIA,
    mode: "onTouched", // valida al salir de cada campo; después, mientras se corrige
  });
  const publicar = useCrearReceta();

  // handleSubmit solo llama aquí si el esquema da el visto bueno; si no, pone el foco en el primer error.
  function enviar(receta) {
    publicar.mutate(receta, { onSuccess: () => reset() });
  }

  return (
    <form className="formulario" onSubmit={handleSubmit(enviar)} noValidate aria-labelledby="titulo-formulario">
      <h2 id="titulo-formulario">Publica tu receta</h2>

      <div className="rejilla-campos">
        <Campo id="nombre" etiqueta="Nombre del plato" error={errors.nombre}>
          <input type="text" autoComplete="off" {...register("nombre")} {...propsCampo("nombre", errors.nombre)} />
        </Campo>

        <Campo id="autor" etiqueta="Tu nombre o alias" error={errors.autor}>
          <input type="text" autoComplete="nickname" {...register("autor")} {...propsCampo("autor", errors.autor)} />
        </Campo>

        <Campo id="categoria" etiqueta="Categoría" error={errors.categoria}>
          <select {...register("categoria")} {...propsCampo("categoria", errors.categoria)}>
            <option value="">Elige una…</option>
            {Object.entries(CATEGORIAS).map(([valor, texto]) => (
              <option key={valor} value={valor}>
                {texto}
              </option>
            ))}
          </select>
        </Campo>

        <fieldset className="radios" aria-describedby={errors.dificultad ? "dificultad-error" : undefined}>
          <legend>Dificultad</legend>
          {Object.entries(DIFICULTADES).map(([valor, texto]) => (
            <label key={valor}>
              <input type="radio" value={valor} {...register("dificultad")} aria-invalid={errors.dificultad ? true : undefined} /> {texto}
            </label>
          ))}
          <MensajeError id="dificultad-error" error={errors.dificultad} />
        </fieldset>

        {/* valueAsNumber: el input entrega un número (o NaN si está vacío) y Zod lo valida como number */}
        <Campo id="raciones" etiqueta="Raciones" error={errors.raciones}>
          <input type="number" inputMode="numeric" {...register("raciones", { valueAsNumber: true })} {...propsCampo("raciones", errors.raciones)} />
        </Campo>

        <Campo id="minutos" etiqueta="Tiempo total (minutos)" error={errors.minutos} ayuda="Si es fácil, como mucho 60 minutos.">
          <input type="number" inputMode="numeric" {...register("minutos", { valueAsNumber: true })} {...propsCampo("minutos", errors.minutos, true)} />
        </Campo>
      </div>

      <label className="casilla">
        <input type="checkbox" {...register("vegetariana")} /> 🌱 Receta vegetariana (sin carne ni pescado)
      </label>

      <CampoIngredientes control={control} register={register} errors={errors} />

      <Campo id="pasos" etiqueta="Preparación" error={errors.pasos}>
        <textarea rows={5} {...register("pasos")} {...propsCampo("pasos", errors.pasos)} />
      </Campo>

      <div className="envio">
        {/* Deshabilitado solo mientras se envía, para evitar dobles envíos */}
        <button type="submit" disabled={publicar.isPending}>
          {publicar.isPending ? "Publicando…" : "Publicar receta"}
        </button>
        {/* La región role="status" está siempre en el DOM para que el lector anuncie el cambio */}
        <p className="exito" role="status">
          {publicar.isSuccess && `✔ «${publicar.data.nombre}» ya está publicada en la lista.`}
        </p>
        {publicar.isError && (
          <p className="error" role="alert">
            ⚠ No se pudo publicar: {publicar.error.message}
          </p>
        )}
      </div>
    </form>
  );
}
