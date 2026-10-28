# Caza la Mano ♠♥♦♣

Misión M1 · El Despertar del DOM — Web Development I.

Whack-a-mole de 3 × 3 con póker, en HTML, CSS y JavaScript puro, sin
frameworks ni librerías. Sobre el tapete asoman cartas de una baraja de
verdad: atrapas 5 y cobras la jugada que formen. No basta con ser rápido,
también hay que elegir qué cartas coger.

## Cómo probarlo
Abre `index.html` en el navegador (o con Live Server). Elige la mesa
(Novato, Habitual o Tiburón) y pulsa «Repartir»: tienes 45 segundos para
atrapar cartas con el ratón o con las teclas 1-9.

- Cada 5 cartas se evalúa tu mano y cobras según la tabla de premios.
- Las cartas que dejas pasar se descartan, así que conviene esperar las
  que encajan (por ejemplo, solo corazones para buscar un color).
- Cada mano premiada seguida sube el multiplicador de la siguiente
  (x2, x3 como máximo). Una carta alta lo reinicia.
- La carta marcada ☠ es una trampa: si la atrapas, el crupier te quema
  la mano y pierdes 5 fichas. Golpear un hueco vacío resta 1.
- Hay un récord por mesa guardado en `localStorage`.

| Jugada | Fichas |
| --- | --- |
| Escalera real | 100 |
| Escalera de color | 50 |
| Póker | 30 |
| Full | 15 |
| Color | 12 |
| Escalera | 10 |
| Trío | 5 |
| Doble pareja | 3 |
| Pareja | 1 |
| Carta alta | 0 |

Código secreto: escribe `allin` en cualquier momento para activar o
desactivar el modo noche (`keydown` sobre `document` +
`classList.toggle` sobre `<body>`). Se recuerda al recargar.

## Uso de IA
Usé Claude Code (extensión de VS Code) para construir el proyecto fase a
fase, con un commit por fase. Empezó siendo el «Caza al Bug» del cuaderno
y en las fases 8 y 9 lo convertí en un juego de póker para darle una idea
propia.
Prompts reales:
- "Necesito que vayas haciendo commits mientras completas fases de esta
  web (unas 5) para yo ir viendo lo que vas haciendo", junto con el enunciado completo de la misión.
- "Quiero que le pongas algo de originalidad al proyecto para que no sea
  tal cual como el jefe del cuaderno, me gustaría algo relacionado con el
  póker". De las opciones que me propuso elegí esta, porque aprovechaba
  lo que ya estaba hecho y añadía lógica propia (evaluar manos).

Cómo lo verifiqué: después de cada fase se probó en un navegador
automatizado (Playwright): fichas, fallos, racha, carta marcada, fin de
partida, récord y modo noche, y que la consola no tuviera errores. El
evaluador de manos se comprobó con 13 manos conocidas, una por jugada,
más casos límite: la escalera baja A-2-3-4-5 sí cuenta y Q-K-A-2-3 no.
También busqué en el código `var`, `innerHTML`, `console.log`, `onclick`
y estilos en línea, y no aparece ninguno. La revisión con la rúbrica
encontró tres fallos reales que se corrigieron después:
- la animación de acierto dejaba de verse en una casilla donde ya se
  había fallado, porque las clases se acumulaban;
- el récord se guardaba leyendo el `<select>` en lugar del estado;
- aporrear todas las casillas no tenía coste.

Escribí a mano: la estructura de este README e ir revisando cada fase de los commits para que todo estuviera bien.

## Autopsia
1. Las cartas salen de una baraja real de 52 cartas (`crearBaraja` +
   `barajar` con Fisher-Yates + `pop`) en vez de generar cada carta con
   un `Math.random()` independiente. Descarté lo aleatorio independiente
   porque podía darte dos A♠ en la misma mano y porque las probabilidades
   no serían las del póker. Además, con baraja real, lo que ya ha salido
   no vuelve a salir, y eso añade estrategia. El coste es que, cuando el
   mazo se acaba, hay que barajar uno nuevo quitando las cartas que ya
   tienes en la mano para no duplicarlas.

2. `evaluarMano` no compara las cartas de dos en dos: cuenta cuántas hay
   de cada valor y ordena esas cuentas (`[3, 2]` es un full, `[2, 2, 1]`
   doble pareja). Después comprueba las jugadas de mejor a peor, así que
   el orden de los `if` importa: el color se mira antes que la escalera
   porque en póker vale más. Descarté comparar pares de cartas con bucles
   anidados porque obliga a muchas condiciones repetidas y es fácil que un
   full acabe contándose también como trío. Lo que pierdo es que no desempata
   dos manos de la misma jugada (una pareja de ases vale lo mismo que una
   de doses), pero en un juego de un solo jugador no hace falta.
