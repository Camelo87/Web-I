// Bonus: recetas que llegaron del API sin cumplir el esquema. No se pintan, pero se explica por qué.
export default function AvisoDescartadas({ descartadas }) {
  if (descartadas.length === 0) return null;

  return (
    <details className="aviso">
      <summary>
        ⚠ {descartadas.length === 1 ? "1 receta descartada" : `${descartadas.length} recetas descartadas`}: el API
        devolvió datos que no cumplen el esquema
      </summary>
      <ul>
        {descartadas.map((d) => (
          <li key={d.id}>
            <strong>{d.nombre}</strong> (id {d.id})
            <ul>
              {d.problemas.map((problema) => (
                <li key={problema}>{problema}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </details>
  );
}
