// Fase 1: Selección de input, botón y párrafos
const input = document.querySelector('#numeroInput');
const boton = document.querySelector('#adivinarBtn');
const mensaje = document.querySelector('#mensaje');
const marcador = document.querySelector('#marcador');

// El oráculo elige su número secreto:
const secreto = Math.floor(Math.random() * 100) + 1;
console.log("(psst... el secreto es", secreto, ")");

// Fase 4: El marcador inicial
let intentos = 0;

// Fase 2: Evento click en el botón
boton.addEventListener('click', () => {
    // Lee el valor como texto primero para comprobar si está vacío
    const valorInput = input.value;

    // Fase 3: Validación (vacío o fuera de 1-100 no gasta intento)
    if (valorInput === '') {
        mensaje.textContent = "¡Cuidado! Introduce un número antes de consultar.";
        return; // Detiene la ejecución sin sumar intento
    }

    const numero = Number(valorInput);

    if (numero < 1 || numero > 100) {
        mensaje.textContent = "El número debe estar entre 1 y 100.";
        return; // Detiene la ejecución sin sumar intento
    }

    // Si pasa las validaciones, es un intento válido
    intentos++;
    marcador.textContent = `Intentos: ${intentos}`;

    // Fase 3: El oráculo responde
    if (numero === secreto) {
        mensaje.textContent = `¡Acertaste! El número secreto era ${secreto}.`;
        
        // Fase 5: Fin de partida
        boton.disabled = true;
        input.disabled = true; 
    } else if (numero < secreto) {
        mensaje.textContent = "El número secreto es MAYOR.";
    } else {
        mensaje.textContent = "El número secreto es MENOR.";
    }
    
    // Limpiamos el input para el siguiente intento
    input.value = '';
    input.focus();
});