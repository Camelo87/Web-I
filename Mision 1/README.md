# Caza al Bug

Misión M1 · El Despertar del DOM — Web Development I.

Whack-a-mole de 3 × 3 en HTML, CSS y JavaScript puro, sin frameworks ni librerías. No todo lo que asoma es un bug: si golpeas una *feature* ✨, pierdes puntos.

## Cómo probarlo
Abre `index.html` en el navegador (o con Live Server). Elige el nivel
(Junior, Senior o 10x) y pulsa «Empezar»: tienes 30 segundos para
aplastar bugs con el ratón o con las teclas 1-9.

| Criatura | Puntos |
| --- | --- |
| 🐛 Bug | +1 |
| 🪲 Bug crítico (huye más rápido) | +3 |
| ✨ Feature (¡no la toques!) | −2 |
| Casilla vacía | −1 |

Cada 5 aciertos seguidos sube el multiplicador (hasta x3). Golpear una
feature o una casilla vacía, o dejar escapar un bug, lo reinicia. Hay un
récord por nivel guardado en `localStorage`.

Código secreto: escribe `debug` en cualquier momento para activar o
desactivar el modo nocturno (`keydown` sobre `document` +
`classList.toggle` sobre `<body>`). Se recuerda al recargar.

## Uso de IA
Usé Claude Code (extensión de VS Code) para construir el proyecto fase a
fase, con un commit por fase.
Prompts reales:
- "Necesito que vayas haciendo commits mientras completas fases de esta
  web (unas 5) para yo ir viendo lo que vas haciendo", junto con el enunciado completo de la misión.
- "Ponte en el papel del profesor que va a evaluar mi index.html, styles.css y app.js con esta rúbrica: manipulación del DOM (20), eventos (15), fundamentos de JS (15), calidad del código (10) y originalidad (10). Señálame los tres aspectos más flojos y explícame por qué lo son, pero no los corrijas todavía."

Cómo lo verifiqué: después de cada fase se probó en un navegador
automatizado (Playwright): puntos, fallos, combo, fin de partida,
récord y modo oscuro, y que la consola no tuviera errores. También
busqué en el código `var`, `innerHTML`, `console.log`, `onclick` y
estilos en línea, y no aparece ninguno. La revisión con la rúbrica
encontró tres fallos reales que se corrigieron después:
- la animación de acierto dejaba de verse en una casilla donde ya se
  había fallado, porque las clases se acumulaban;
- el récord se guardaba leyendo el `<select>` en lugar del estado;
- aporrear todas las casillas no tenía coste.

Escribí a mano: la estructura de este README e ir revisando cada fase de los commits para que todo estuviera bien.

## Autopsia
1. Cada vez que aparece un bug creo un `<span>` nuevo con
   `createElement` y lo borro con `remove()` al desaparecer, en vez de
   tener nueve `<span>` fijos y cambiarles solo el texto. Lo hice así
   porque la animación CSS de aparición solo se reinicia cuando el nodo
   entra en el DOM. Descarté los nodos fijos porque obligaban a forzar el
   reinicio de la animación. El coste es una creación y un borrado de
   nodo por aparición, que con un solo bug a la vez no se nota.

2. El destello de acierto/fallo se limpia con un listener de
   `animationend` delegado en el tablero, que quita la clase al acabar la
   animación. Descarté el truco de `void celda.offsetWidth` (forzar un
   reflow para repetir la animación), que era mi primera versión:
   funciona, pero es un parche que no se entiende al leerlo y dejaba las
   clases acumuladas en la celda. Lo que pierdo es que dos golpes en la
   misma casilla en menos de 0,3 s solo animan una vez.
