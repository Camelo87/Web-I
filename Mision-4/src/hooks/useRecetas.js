// Todo lo que toca el estado del servidor pasa por aquí: los componentes no llaman a fetch.
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { borrarReceta, crearReceta, obtenerRecetas } from "../api.js";

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
    // Al cambiar de categoría, la lista anterior sigue a la vista hasta que llega la nueva
    // (en vez de vaciarse y enseñar «Cargando…» cada vez).
    placeholderData: keepPreviousData,
  });
}

export function useCrearReceta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: crearReceta,
    // Tras publicar, las listas en caché ya no están al día: se invalidan y se vuelven a pedir.
    // Se devuelve la promesa para que la mutación siga "pendiente" hasta que la lista se refresque.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clavesRecetas.todas }),
  });
}

export function useBorrarReceta() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: borrarReceta,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: clavesRecetas.todas }),
  });
}
