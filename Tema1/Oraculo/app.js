const input = document.querySelector('#numeroInput');
const botonAdivinar = document.querySelector('#adivinarBtn');
const botonReiniciar = document.querySelector('#reiniciarBtn');
const mensaje = document.querySelector('#mensaje');
const marcador = document.querySelector('#marcador');
const parrafoHistorial = document.querySelector('#historial');

// Variables globales para la partida
let secreto;
let intentos;
let historial;
const MAX_INTENTOS = 7; // Reto: Límite de 7 intentos

// Función para preparar una nueva partida
function iniciarJuego() {
    secreto = Math.floor(Math.random() * 100) + 1;
    // Criterio: Ningún console.log con el secreto en la versión final.
    
    intentos = 0;
    historial = []; // Reto: Historial en un array

    // Reiniciamos la interfaz
    input.value = '';
    input.disabled = false;
    botonAdivinar.disabled = false;
    botonReiniciar.hidden = true;

    mensaje.textContent = 'El oráculo está listo...';
    marcador.textContent = `Intentos: 0 / ${MAX_INTENTOS}`;
    parrafoHistorial.textContent = '';
    input.focus();
}

// Arrancamos el juego por primera vez
iniciarJuego();

// Evento principal para adivinar
botonAdivinar.addEventListener('click', () => {
    const valorInput = input.value;

    // Criterio: Vacío o fuera de rango da aviso y NO incrementa intentos
    if (valorInput === '') {
        mensaje.textContent = "¡Cuidado! Introduce un número antes de consultar.";
        return; 
    }

    const numero = Number(valorInput);

    if (numero < 1 || numero > 100) {
        mensaje.textContent = "El número debe estar entre 1 y 100.";
        return; 
    }

    // Si llegamos aquí, es un intento válido. Actualizamos contadores y array.
    intentos++;
    historial.push(numero);

    marcador.textContent = `Intentos: ${intentos} / ${MAX_INTENTOS}`;
    parrafoHistorial.textContent = `Has probado: ${historial.join(', ')}`;

    // Comprobamos los resultados
    if (numero === secreto) {
        // Criterio: Al acertar, mensaje con intentos y botón desactivado
        mensaje.textContent = `¡Acertaste en ${intentos} intentos! El secreto era ${secreto}.`;
        finalizarJuego();
    } else if (intentos >= MAX_INTENTOS) {
        // Reto: Superado el límite, se revela y bloquea
        mensaje.textContent = `¡Logro Francotirador fallido! Te quedaste sin intentos. El secreto era ${secreto}.`;
        finalizarJuego();
    } else if (numero < secreto) {
        // Criterio: Pistas mayor/menor
        mensaje.textContent = "El número secreto es MAYOR.";
    } else {
        mensaje.textContent = "El número secreto es MENOR.";
    }

    input.value = '';
    if (!input.disabled) input.focus();
});

// Función para bloquear la partida y mostrar el botón de reinicio
function finalizarJuego() {
    botonAdivinar.disabled = true;
    input.disabled = true;
    botonReiniciar.hidden = false;
}

// Reto: Botón "Nueva profecía" reinicia la partida
botonReiniciar.addEventListener('click', iniciarJuego);