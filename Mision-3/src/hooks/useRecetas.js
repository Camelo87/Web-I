import { useEffect, useState } from "react";
import { cargarTodas } from "../api.js";

// Carga las recetas al montar y cada vez que se pide reintentar.
// estado: "cargando" | "error" | "listo"
export function useRecetas() {
  const [intento, setIntento] = useState(0);
  const [datos, setDatos] = useState({ estado: "cargando", recetas: [], fallidas: 0, error: null });

  useEffect(() => {
    // Efecto justificado: sincroniza con un sistema externo (la API).
    const control = new AbortController();
    cargarTodas(control.signal)
      .then(({ recetas, fallidas }) => setDatos({ estado: "listo", recetas, fallidas, error: null }))
      .catch((error) => {
        if (control.signal.aborted) return; // lo canceló la limpieza: no es un error
        setDatos({ estado: "error", recetas: [], fallidas: 0, error: error.message });
      });
    // Limpieza: si el componente se desmonta o se reintenta, se cancelan las peticiones en vuelo.
    return () => control.abort();
  }, [intento]);

  // El "cargando" se pone en el manejador, no dentro del efecto.
  function reintentar() {
    setDatos({ estado: "cargando", recetas: [], fallidas: 0, error: null });
    setIntento((n) => n + 1);
  }

  return { ...datos, reintentar };
}
