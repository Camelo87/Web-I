// Atributos que unen un campo con su mensaje de error (y su ayuda), para lectores de pantalla.
export function propsCampo(id, error, conAyuda = false) {
  const describe = [conAyuda && `${id}-ayuda`, error && `${id}-error`].filter(Boolean).join(" ");
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describe || undefined,
  };
}
