import { useState } from "react";
import { useRecetas } from "../hooks/useRecetas.js";
import { CATEGORIAS } from "../esquemas.js";
import TarjetaReceta from "./TarjetaReceta.jsx";
import AvisoDescartadas from "./AvisoDescartadas.jsx";

// Listado de la comunidad con filtro por categoría y los cuatro estados: cargando, error, vacío y datos.
export default function ListaRecetas() {
  const [categoria, setCategoria] = useState("");
  const { data, isPending, isError, error, refetch, isFetching } = useRecetas(categoria);

  return (
    <section className="listado" aria-labelledby="titulo-listado">
      <div className="listado__cabecera">
        <h2 id="titulo-listado">Recetas de la comunidad</h2>
        <label>
          Categoría{" "}
          <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            <option value="">Todas</option>
            {Object.entries(CATEGORIAS).map(([valor, texto]) => (
              <option key={valor} value={valor}>
                {texto}
              </option>
            ))}
          </select>
        </label>
        {/* Refresco en segundo plano: los datos viejos siguen a la vista mientras llegan los nuevos */}
        <span className="actualizando" aria-live="polite">
          {isFetching && !isPending ? "Actualizando…" : ""}
        </span>
      </div>

      {isPending ? (
        <p className="estado" role="status">
          ⏳ Cargando recetas…
        </p>
      ) : isError ? (
        <div className="estado error" role="alert">
          <p>⚠ No se pudieron cargar las recetas. {error.message}</p>
          <button type="button" onClick={() => refetch()}>
            Reintentar
          </button>
        </div>
      ) : (
        <>
          <AvisoDescartadas descartadas={data.descartadas} />
          {data.recetas.length === 0 ? (
            <p className="estado">Aún no hay recetas en esta categoría. ¡Publica la primera!</p>
          ) : (
            <div className="rejilla">
              {data.recetas.map((receta) => (
                <TarjetaReceta key={receta.id} receta={receta} />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}
