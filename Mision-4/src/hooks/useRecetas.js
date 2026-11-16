// Todo lo que toca el estado del servidor pasa por aquí: los componentes no llaman a fetch.
import { useQuery } from "@tanstack/react-query";
import { obtenerRecetas } from "../api.js";

// Claves de la caché: todas empiezan por "recetas", así invalidar ["recetas"] refresca todas las listas.
export const clavesRecetas = {
  todas: ["recetas"],
  lista: (categoria) => ["recetas", "lista", categoria || "todas"],
};

// La categoría va en la clave: cada filtro tiene su propia entrada en la caché.
export function useRecetas(categoria) {
  return useQuery({
    queryKey: clavesRecetas.lista(categoria),
    queryFn: ({ signal }) => obtenerRecetas(categoria, signal),
  });
}
