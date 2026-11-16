// Mensaje de error de un campo: role="alert" hace que se anuncie al aparecer.
export function MensajeError({ id, error }) {
  if (!error?.message) return null;
  return (
    <p id={id} className="error" role="alert">
      {error.message}
    </p>
  );
}

// Etiqueta + campo + ayuda opcional + error. El campo (children) recibe sus props con propsCampo().
export default function Campo({ id, etiqueta, error, ayuda, children }) {
  return (
    <div className="campo">
      <label htmlFor={id}>{etiqueta}</label>
      {children}
      {ayuda && (
        <small id={`${id}-ayuda`} className="ayuda">
          {ayuda}
        </small>
      )}
      <MensajeError id={`${id}-error`} error={error} />
    </div>
  );
}
