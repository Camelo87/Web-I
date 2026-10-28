# La Despensa 🍳 (Reactor Core)

La Despensa de la Misión 2 reconstruida en **React 19 + Vite**. Busca entre
todas las recetas de [TheMealDB](https://www.themealdb.com/api.php), las ordena
por **cuántos ingredientes necesitas** y, como novedad, monta una **lista de la
compra**: eliges recetas y ves todos sus ingredientes juntos, sin repetir.

## Cómo probarlo
```
cd "Mision 3"
npm install
npm run dev      # http://localhost:5173
npm run lint     # ESLint con las reglas de los hooks de React
npm run build    # versión de producción en /dist
```

## Qué hace
- Al abrir carga todas las recetas (26 peticiones, una por letra) y las ordena de menos a más ingredientes.
- Filtro mientras escribes, con sugerencias de nombres de platos.
- Categorías a la izquierda con su número de recetas, casilla «8 ingredientes o menos» y botón «← Inicio».
- Estados visibles: **cargando**, **error** con botón **Reintentar**, **sin resultados** y **datos**.
- **Lista de la compra** (lo original): cada tarjeta tiene «🛒 Añadir a la compra». El panel junta los
  ingredientes de las recetas elegidas sin repetir y marca con ×2, ×3… los que comparten. Se guarda en
  `localStorage`, así que sigue ahí al recargar.

## Componentes
| Fichero | Qué hace | Estado propio |
| --- | --- | --- |
| `App.jsx` | Une todo: guarda lo que elige el usuario y calcula lo que se ve | texto, categoría, solo rápidas, compra |
| `components/Buscador.jsx` | Caja de búsqueda con sugerencias, botón Inicio y casilla | ninguno (inputs controlados) |
| `components/Categorias.jsx` | Botones de categoría con contador | ninguno |
| `components/ListaRecetas.jsx` | Rejilla de tarjetas o mensaje de «sin resultados» | ninguno |
| `components/TarjetaReceta.jsx` | Una receta y su botón de la compra | ninguno |
| `components/ListaCompra.jsx` | Recetas elegidas y sus ingredientes juntos | ninguno |
| `components/Mensaje.jsx` | Cargando o error con Reintentar | ninguno |

Además: `api.js` (red y caché), `logica.js` (funciones puras: filtrar, contar, juntar ingredientes) y
dos hooks propios en `hooks/`.

## Estado, efectos y listas
- **Estado mínimo**: solo lo que elige el usuario (texto, categoría, casilla y los ids de la compra).
  Todo lo demás se **deriva** en el render: las recetas visibles, el número de cada categoría, las
  recetas elegidas y los ingredientes de la compra. Ningún dato está guardado dos veces.
- **El estado vive en `App`** (lifting state): el buscador, las categorías, las tarjetas y la compra lo
  necesitan, así que los hijos lo reciben por props y avisan con funciones (`onTexto`, `onElegir`,
  `onAlternar`…).
- **Cero mutaciones**: arrays nuevos con `filter`, spread y `toSorted`, y la función actualizadora
  `setCompra((ids) => ...)`.
- **Efectos**, solo dos y los dos sincronizan con un sistema externo:
  - `useRecetas`: pide las recetas a la API. Depende de `[intento]` (se repite al pulsar Reintentar) y su
    **limpieza** cancela las peticiones con `AbortController` si el componente se desmonta o se reintenta.
  - `useLocalStorage`: guarda el valor cuando cambia (`[clave, valor]`).
  - El «cargando» del reintento se pone en el manejador del botón, no dentro del efecto.
- **Keys estables**: el `id` de la receta en tarjetas y compra, el nombre en categorías, sugerencias e
  ingredientes (sin repetidos), y el ingrediente en minúsculas en la lista de la compra. Nunca el índice.
- `useMemo` solo para el contador de categorías y las sugerencias, que únicamente cambian cuando llegan
  recetas nuevas y no en cada tecla.

## 🎁 Bonus: hooks reutilizables
- `useLocalStorage(clave, valorInicial)`: igual que `useState`, pero el valor sobrevive a recargar la
  página. Lee una sola vez (inicialización perezosa) y aguanta un `localStorage` bloqueado o con JSON roto.
- `useRecetas()`: carga, error y reintento de la API en un solo hook (`{ estado, recetas, error, reintentar }`).

## Mejoras sobre la Misión 2 (feedback de la corrección)
- `Promise.allSettled` en vez de `Promise.all`: si falla una letra se enseñan las demás y se avisa de cuántas faltan.
- Caché validada: tiene que ser un array no vacío, con versión en la clave (`despensa:v2`) y caducidad de un día.
  Una lista incompleta no se guarda.
- Botón **Reintentar** en el estado de error.
- El contador de categorías se calcula una sola vez por carga (`useMemo`), no dos veces por tecla.
- Si una receta no tiene foto, no se pinta la imagen (antes salía `undefined/small`).
- React escapa los textos solo: ya no hace falta la función `esc` ni construir HTML con cadenas.

## Uso de IA
Usé Claude Code (extensión de VS Code) para pasar la Despensa de la Misión 2
a React, con un commit por fase. También redactó este README, incluidas
estas dos secciones.

Prompts reales:
- "Vamos a hacer la mision 3, creo que tienes que pasar la mision 2 a react",
  junto con el enunciado y la rúbrica de la misión.
- "Acuérdate de hacerlo de una forma sencilla pero cumpliendo todo, también te
  voy a pasar las correcciones de mis otras misiones", con el feedback de la
  Arena de la M1 y la M2 para aplicar sus puntos de mejora.

Qué decidí yo: rehacer la M2 en vez de empezar otra app, que fuera sencilla
y que se arreglara lo que me marcaron en la corrección de la M2
(`Promise.allSettled`, caché validada, botón Reintentar...).

Cómo lo verifiqué:
- `npm run lint` (incluye las reglas de los hooks de React, que avisan de
  dependencias mal puestas) y `npm run build` sin errores.
- En el navegador: carga de las 790 recetas, filtro al escribir, categoría +
  casilla de rápidas, botón Inicio, búsqueda sin resultados («zzzz»), añadir y
  quitar recetas de la compra y que la lista sigue ahí al recargar.
- La función `cargarTodas` probada a mano desde la consola: con la red caída
  lanza el error; con una letra devolviendo HTTP 500 enseña las otras 699
  recetas, avisa de 1 letra fallida y no guarda la caché incompleta; al
  cancelar con `AbortController` da `AbortError`; y con basura en la caché la
  ignora y vuelve a pedir.

## Autopsia
**1. La compra guarda solo los ids de las recetas.** Las recetas elegidas y
la lista de ingredientes se calculan en cada render a partir de esos ids.
Descarté guardar en el estado las recetas enteras o la lista de ingredientes
ya juntada: sería el mismo dato guardado dos veces y habría que mantenerlo
sincronizado a mano al añadir o quitar. Lo discutible es que se recalcula en
cada render (con unas pocas recetas no se nota) y que, si una receta
desaparece de la API, su id se queda en `localStorage` aunque ya no se vea.

**2. La carga de la API va en un hook propio con `useEffect`.** `useRecetas`
pide los datos en un efecto y lo limpia con `AbortController`, y el
«cargando» del reintento se pone en el manejador del botón, no dentro del
efecto. Descarté `use()` con `<Suspense>` de React 19: necesita una promesa
cacheada fuera del componente y reintentar es más complicado. Lo discutible
es que la documentación de React recomienda no pedir datos en efectos y usar
una librería (como TanStack Query, que se ve en la U4). Para esta misión, el
efecto con su limpieza es lo más sencillo y deja ver cómo funciona por dentro.
