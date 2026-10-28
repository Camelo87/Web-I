// Estados de la carga: cargando o error (con botón para reintentar).
export default function Mensaje({ estado, error, onReintentar }) {
  if (estado === "cargando") {
    return (
      <p className="estado" role="status">
        ⏳ Cargando recetas…
      </p>
    );
  }

  return (
    <div className="estado error" role="alert">
      <p>⚠ No se pudo cargar ({error}). Revisa tu conexión.</p>
      <button type="button" onClick={onReintentar}>
        Reintentar
      </button>
    </div>
  );
}
