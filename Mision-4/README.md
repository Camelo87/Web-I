# La Despensa 🍳 (Full Contact Forms)

La Despensa de las misiones 2 y 3 se abre a la comunidad: ahora puedes **publicar tus propias recetas**
con un formulario serio (React Hook Form + Zod) y ver las de los demás en un listado que se sirve desde
un API REST local (json-server) con TanStack Query.

## Cómo probarlo
```
cd Mision-4
npm install
npm run dev            # arranca el API (http://localhost:3001) y la web (http://localhost:5173)
npm run reiniciar-db   # vuelve a dejar las recetas de ejemplo (borra lo publicado)
npm run lint
npm run build
```
La primera vez, `npm run dev` crea `db.json` a partir de `db.inicial.json`. `db.json` está en el
`.gitignore` porque cambia cada vez que publicas o borras.

## Qué hace
- **Formulario de receta**: nombre, autor, categoría, dificultad (radios), raciones, minutos, casilla
  vegetariana, **ingredientes dinámicos** (añadir y quitar filas con `useFieldArray`) y preparación.
- **Validación con Zod** con mensajes propios en español y refinamientos del dominio:
  - una receta **fácil** no puede pasar de 60 minutos (cruza dificultad y minutos);
  - una receta **vegetariana** no puede llevar carne ni pescado: el error sale en el ingrediente concreto;
  - no se puede **repetir un ingrediente** («Ajo» y «ajo » cuentan como el mismo);
  - entre 2 y 15 ingredientes, raciones y minutos enteros y con límites.
- **Errores accesibles**: cada campo con su `<label>`, `aria-invalid`, `aria-describedby` hacia su error,
  mensajes con `role="alert"`, radios e ingredientes en `<fieldset>` + `<legend>`, y al enviar con errores
  el foco va al primer campo mal (lo hace `handleSubmit`).
- **Listado** con filtro por categoría y los estados de cargando, error con **Reintentar**, vacío y datos.
  «Actualizando…» cuando refresca en segundo plano. Al cambiar de categoría, la lista anterior se queda
  atenuada hasta que llega la nueva, en vez de vaciarse.
- **Publicar y borrar** con `useMutation`: el botón pasa a «Publicando…» y se bloquea para evitar dobles
  envíos, el éxito se anuncia con `role="status"` y el error con `role="alert"`. Tras publicar, el formulario
  se vacía (`reset`); si falla, conserva lo escrito.
- **Vista previa en vivo** de la tarjeta mientras escribes (`useWatch`).
- ★ **Bonus**: las respuestas del API también se validan con Zod (`safeParse`). `db.inicial.json` trae a
  propósito una receta corrupta («Bizcocho misterioso», con `raciones: "ocho"`, ingredientes como texto, sin
  dificultad…): la app la **descarta** y lo explica en un aviso desplegable con cada problema. La respuesta
  del `POST` se valida igual antes de darla por buena.

## Estructura
| Fichero | Qué hace |
| --- | --- |
| `src/esquemas.js` | Esquemas Zod: **única fuente de verdad** de la validación (formulario y respuestas) y de las opciones de categoría y dificultad |
| `src/api.js` | `fetch` a json-server: `response.ok`, errores de red con mensaje claro y `safeParse` de lo que llega |
| `src/hooks/useRecetas.js` | `useRecetas` (`useQuery`), `useCrearReceta` y `useBorrarReceta` (`useMutation` + invalidación) y las claves de la caché |
| `src/components/FormularioReceta.jsx` | `useForm` con `zodResolver`, envío y mensajes de éxito o error |
| `src/components/CampoIngredientes.jsx` | Filas de ingredientes con `useFieldArray` |
| `src/components/Campo.jsx` + `src/accesibilidad.js` | Etiqueta, ayuda y error de cada campo, con sus atributos ARIA |
| `src/components/VistaPrevia.jsx` | Tarjeta en vivo con `useWatch` |
| `src/components/ListaRecetas.jsx`, `TarjetaReceta.jsx`, `AvisoDescartadas.jsx` | Listado, tarjeta con borrar y aviso del bonus |
| `db.inicial.json`, `preparar-db.js` | Datos de ejemplo y script que crea `db.json` |

## Decisiones
- **Claves de la caché**: `["recetas", "lista", categoria]`. Cada filtro tiene su propia entrada (cambiar de
  categoría y volver no repite la petición durante 30 s de `staleTime`) y todas empiezan por `["recetas"]`,
  así que invalidar `["recetas"]` tras publicar o borrar refresca todas las listas a la vez.
- `placeholderData: keepPreviousData` en `useRecetas`: al cambiar de categoría por primera vez no se vacía
  la lista ni sale «Cargando…»; se ven los datos anteriores atenuados (`isPlaceholderData`) hasta que llegan
  los nuevos. Si la categoría ya está en caché, sale al instante.
- `onSuccess` **devuelve** la promesa de `invalidateQueries`: la mutación sigue «pendiente» hasta que la lista
  ya trae la receta nueva, y el mensaje de éxito no aparece antes que la tarjeta.
- `mode: "onTouched"`: no se marca nada en rojo mientras escribes un campo por primera vez; se valida al salir
  de él y, a partir de ahí, mientras lo corriges.
- Los componentes no llaman a `fetch`: solo usan los hooks, que a su vez usan `api.js`.

## Uso de IA
Usé Claude Code para construir el proyecto, con un commit por fase. Redactó también este README.

Prompts reales:
- "Vamos con la mision 4", junto con el enunciado y la rúbrica de la misión.
- De las opciones que me propuso, elegí el dominio («La Despensa: publica tu receta», para seguir la historia
  de la M2 y la M3) y json-server como API, en lugar de un API simulado en el navegador.
- "Qué cosas se podrían mejorar o cambiar": me propuso 8 mejoras (importar recetas de TheMealDB, borrado
  optimista, un resumen de errores, borrador guardado…) y le pedí solo una: "haz el 2", que la lista no se
  vacíe al cambiar de categoría (`keepPreviousData`). Las demás las dejé fuera por el plazo de entrega.

Qué decidí yo: el dominio, usar json-server y qué mejora aplicar de las propuestas.

Cómo lo verifiqué:
- `npm run lint` y `npm run build` sin errores.
- El esquema, probado con Node: una receta válida, el formulario vacío, fácil con 90 minutos, ingrediente
  repetido, vegetariana con jamón, un solo ingrediente y las 5 recetas de `db.inicial.json` (4 válidas y la
  corrupta con sus 7 problemas).
- En el navegador: envío vacío (foco en el primer campo y cada error unido a su campo con `aria-describedby`),
  los tres refinamientos, publicación con «Publicando…», la lista refrescada sola y el formulario vaciado,
  mínimo de 2 ingredientes, vista previa, borrar, y con el API apagado el error del listado, el error al
  publicar (sin perder lo escrito) y «Reintentar» al volver a encenderlo. Con `keepPreviousData`: al cambiar a
  «Postre» las 4 tarjetas anteriores siguen a la vista atenuadas, con «Actualizando…», hasta que llega la nueva
  lista, y al volver a «Todas» sale al instante desde la caché.

## Autopsia
**1. Validar la respuesta del API receta a receta y descartar las malas.** `obtenerRecetas` hace
`safeParse` de cada receta: las válidas se pintan y las corruptas se apartan con un aviso que explica qué
fallaba. Descarté hacer `parse` de la lista entera: una sola receta rota pondría toda la consulta en error y
el usuario no vería ninguna. Lo discutible es que se esconden datos (aunque se avisa) y que esto no sustituye
a validar en el servidor: json-server guarda lo que le mandes, así que cualquiera podría meter una receta
corrupta con un `fetch` desde la consola.

**2. Un único esquema para el formulario y para la respuesta, con números de verdad.** El esquema del API es
el del formulario más `id` y `creadaEn` (`safeExtend`, porque `extend` no admite esquemas con refinamientos).
Para que sirva en los dos lados, los campos numéricos usan `z.number()` y los inputs `valueAsNumber`, en vez
de `z.coerce.number()`. Descarté `coerce` porque en la respuesta aceptaría un `"4"` de texto como válido y
escondería un dato mal guardado. Lo discutible: un input vacío llega como `NaN` y hay que darle un mensaje
propio («Escribe un número»), y la respuesta hereda también las reglas de negocio, así que una receta antigua
que ya no cumpla una regla nueva (por ejemplo, fácil con 70 minutos) se descartaría del listado.
