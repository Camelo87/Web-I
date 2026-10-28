// Caja de búsqueda con sugerencias, botón de inicio y casilla de recetas rápidas.
// No guarda estado: todo llega por props (inputs controlados por App).
export default function Buscador({ texto, onTexto, nombres, soloRapidas, onSoloRapidas, onInicio }) {
  return (
    <>
      <form className="buscador" onSubmit={(e) => e.preventDefault()}>
        <input
          type="search"
          value={texto}
          onChange={(e) => onTexto(e.target.value)}
          list="sugerencias"
          placeholder="Escribe un plato: Pie, Chicken, Soup…"
          aria-label="Buscar receta"
          autoComplete="off"
        />
        <datalist id="sugerencias">
          {nombres.map((nombre) => (
            <option key={nombre} value={nombre} />
          ))}
        </datalist>
        <button type="button" onClick={onInicio}>
          ← Inicio
        </button>
      </form>

      <label className="opcion">
        <input type="checkbox" checked={soloRapidas} onChange={(e) => onSoloRapidas(e.target.checked)} />
        Solo recetas con 8 ingredientes o menos
      </label>
    </>
  );
}
