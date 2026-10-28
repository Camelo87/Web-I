// Una receta. El botón avisa al padre; la tarjeta no decide si está en la compra.
export default function TarjetaReceta({ receta, enCompra, onAlternar }) {
  const { id, nombre, pais, categoria, foto, ingredientes } = receta;

  return (
    <article className={enCompra ? "tarjeta elegida" : "tarjeta"}>
      {foto && <img src={foto} alt={nombre} loading="lazy" />}
      <h2>{nombre}</h2>
      <p>
        {pais} · {categoria}
      </p>
      <p className="num">{ingredientes.length} ingredientes</p>
      <details>
        <summary>Ver ingredientes</summary>
        <ul>
          {ingredientes.map((ingrediente) => (
            <li key={ingrediente}>{ingrediente}</li>
          ))}
        </ul>
      </details>
      <button type="button" className="secundario" onClick={() => onAlternar(id)}>
        {enCompra ? "✓ En la compra" : "🛒 Añadir a la compra"}
      </button>
    </article>
  );
}
