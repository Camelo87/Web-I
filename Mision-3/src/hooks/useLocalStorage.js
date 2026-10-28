import { useEffect, useState } from "react";

// Como useState, pero el valor se guarda en localStorage y sobrevive a recargar la página.
// Reutilizable: sirve para cualquier valor que se pueda pasar a JSON.
export function useLocalStorage(clave, valorInicial) {
  // Inicialización perezosa: localStorage solo se lee en el primer render.
  const [valor, setValor] = useState(() => {
    try {
      const guardado = localStorage.getItem(clave);
      return guardado === null ? valorInicial : JSON.parse(guardado);
    } catch {
      return valorInicial; // JSON corrupto o localStorage bloqueado
    }
  });

  // Efecto justificado: sincroniza el estado con un sistema externo (localStorage).
  useEffect(() => {
    try {
      localStorage.setItem(clave, JSON.stringify(valor));
    } catch {
      // sin persistencia, pero la app sigue funcionando
    }
  }, [clave, valor]);

  return [valor, setValor];
}
