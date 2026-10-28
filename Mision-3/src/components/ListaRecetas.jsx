import TarjetaReceta from "./TarjetaReceta.jsx";

// Rejilla de recetas, o el mensaje de "sin resultados" si la lista está vacía.
export default function ListaRecetas({ recetas, texto, idsCompra, onAlternar }) {
  if (recetas.length === 0) {
    const buscado = texto.trim();
    return (
      <p className="estado">
        No hay recetas{buscado && ` para «${buscado}»`}. Prueba con otra búsqueda.
      </p>
    );
  }

  return (
    <div className="rejilla">
      {recetas.map((receta) => (
        <TarjetaReceta
          key={receta.id}
          receta={receta}
          enCompra={idsCompra.includes(receta.id)}
          onAlternar={onAlternar}
        />
      ))}
    </div>
  );
}
