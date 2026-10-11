# La Despensa 🍳 (Async Odyssey)

Buscador de recetas que consume la API pública
[TheMealDB](https://www.themealdb.com/api.php). Escribes un plato (en inglés:
`chicken`, `pasta`, `cake`…) y te muestra las recetas ordenadas por **cuántos
ingredientes necesitas**, de menos a más, para encontrar la más sencilla.

## Cómo probarlo
```
cd "Mision 2"
npm install
npm run dev      # http://localhost:5173
npm run build    # versión de producción en /dist
```

## Qué hace
- Estados visibles: **cargando**, **error** (red caída o HTTP no válido),
  **vacío** (sin resultados) y **datos**.
- Casilla «8 ingredientes o menos» para filtrar las recetas rápidas.
- Resumen con el número de recetas por categoría.
- **Bonus:** caché en `localStorage`: una búsqueda ya hecha no repite la
  petición.

## Estructura
| Fichero | Responsabilidad |
| --- | --- |
| `src/api.js` | `fetch` + `async/await`, comprobación de `response.ok` y caché |
| `src/logica.js` | Transformar datos con `map`, `filter`, `reduce` y `toSorted` |
| `src/render.js` | Pintar en el DOM (no sabe nada de la red) |
| `src/main.js` | Une los módulos y gestiona los eventos |

## Robustez
- Si la API devuelve `meals: null` (sin resultados) se trata como lista vacía.
- Si falta algún campo (categoría, país) se usa un valor por defecto.
- Si `localStorage` está bloqueado o con JSON corrupto, la app sigue sin caché.
- Los textos de la API se escapan antes de insertarlos en el HTML.

## Uso de IA
Usé Claude Code (extensión de VS Code) para construir el proyecto, con un
commit por fase.
Prompts reales:
- "Necesito que me realices la misión 2 de web 1 [...] recuerda ir haciendo
  commits y hacer el programa de la forma más sencilla posible pero
  cumpliendo todo sin mucho código", junto con el enunciado y la rúbrica.

Cómo lo verifiqué: comprobé que la API devuelve datos reales, que la lógica
transforma bien las 25 recetas de «chicken» (ingredientes limpios, conteo por
categoría) y que una búsqueda sin resultados (`meals: null`) no rompe nada.
Además, `npm run build` compila sin errores.

## Autopsia
Los ingredientes de TheMealDB vienen como 20 campos sueltos
(`strIngredient1` … `strIngredient20`), muchos vacíos. En vez de un bucle con
condiciones, uso `Array.from({ length: 20 })` + `filter(Boolean)` para
obtener un array limpio, y de ahí salen el conteo, el filtro y la ordenación.
