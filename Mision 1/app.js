const TOTAL_CELDAS = 9;
const DURACION_BUG_MS = 900;
const PAUSA_ENTRE_BUGS_MS = 250;
const DURACION_PARTIDA_S = 30;
const SEGUNDOS_AVISO = 5;

const tablero = document.querySelector('#tablero');
const textoPuntos = document.querySelector('#puntos');
const textoTiempo = document.querySelector('#tiempo');
const botonJugar = document.querySelector('#botonJugar');
const mensaje = document.querySelector('#mensaje');

// Estado de la partida: todo lo que cambia mientras se juega vive aquí
const estado = {
    jugando: false,
    puntos: 0,
    segundosRestantes: DURACION_PARTIDA_S,
    intervaloReloj: null,
    celdaActiva: null,
    ultimaCelda: null,
    temporizadorBug: null
};

let celdas = [];

// Crea las 9 celdas del tablero con createElement y las inserta de una sola vez
function crearTablero() {
    const fragmento = document.createDocumentFragment();

    for (let i = 0; i < TOTAL_CELDAS; i++) {
        const celda = document.createElement('button');
        celda.type = 'button';
        celda.className = 'celda';
        celda.dataset.indice = i;
        celda.setAttribute('aria-label', `Agujero ${i + 1}`);

        const atajo = document.createElement('span');
        atajo.className = 'celda__atajo';
        atajo.textContent = i + 1;

        celda.append(atajo);
        fragmento.append(celda);
    }

    tablero.append(fragmento);
    celdas = [...tablero.querySelectorAll('.celda')];
}

// Elige una celda al azar distinta de la anterior para que el bug no se repita en el mismo sitio
function elegirCeldaAleatoria() {
    let indice;
    do {
        indice = Math.floor(Math.random() * TOTAL_CELDAS);
    } while (celdas[indice] === estado.ultimaCelda);
    return celdas[indice];
}

function mostrarBug() {
    const celda = elegirCeldaAleatoria();
    const bicho = document.createElement('span');
    bicho.className = 'celda__bicho';
    bicho.textContent = '🐛';

    celda.append(bicho);
    celda.classList.add('celda--activa');
    estado.celdaActiva = celda;
    estado.ultimaCelda = celda;

    estado.temporizadorBug = setTimeout(ocultarBug, DURACION_BUG_MS);
}

function ocultarBug() {
    clearTimeout(estado.temporizadorBug);

    if (estado.celdaActiva) {
        estado.celdaActiva.classList.remove('celda--activa');
        estado.celdaActiva.querySelector('.celda__bicho')?.remove();
        estado.celdaActiva = null;
    }

    if (estado.jugando) {
        estado.temporizadorBug = setTimeout(mostrarBug, PAUSA_ENTRE_BUGS_MS);
    }
}

function actualizarPuntos() {
    textoPuntos.textContent = estado.puntos;
}

function actualizarTiempo() {
    textoTiempo.textContent = estado.segundosRestantes;
    textoTiempo.classList.toggle('panel__valor--aviso', estado.jugando && estado.segundosRestantes <= SEGUNDOS_AVISO);
}

// Marca visualmente una celda durante un instante (acierto o fallo)
function destellar(celda, clase) {
    celda.classList.remove(clase);
    void celda.offsetWidth; // fuerza un reflow para poder repetir la animación
    celda.classList.add(clase);
}

function golpear(celda) {
    if (!estado.jugando) return;

    if (celda !== estado.celdaActiva) {
        destellar(celda, 'celda--fallo');
        mensaje.textContent = 'Ahí no había nada... 404.';
        return;
    }

    estado.puntos++;
    actualizarPuntos();
    destellar(celda, 'celda--acierto');
    mensaje.textContent = '¡Bug aplastado!';
    ocultarBug();
}

function descontarSegundo() {
    estado.segundosRestantes--;
    actualizarTiempo();

    if (estado.segundosRestantes <= 0) terminarPartida();
}

function empezarPartida() {
    estado.jugando = true;
    estado.puntos = 0;
    estado.segundosRestantes = DURACION_PARTIDA_S;
    estado.ultimaCelda = null;
    actualizarPuntos();
    actualizarTiempo();

    botonJugar.disabled = true;
    mensaje.textContent = 'Compilando... ¡cuidado con los bugs!';
    estado.intervaloReloj = setInterval(descontarSegundo, 1000);
    mostrarBug();
}

function terminarPartida() {
    estado.jugando = false;
    clearInterval(estado.intervaloReloj);
    ocultarBug();
    actualizarTiempo();

    botonJugar.disabled = false;
    botonJugar.textContent = 'Otra partida';
    mensaje.textContent = `Fin del sprint: ${estado.puntos} bugs aplastados.`;
}

// Un único listener en el tablero (delegación) en lugar de uno por celda
tablero.addEventListener('click', (evento) => {
    const celda = evento.target.closest('.celda');
    if (celda) golpear(celda);
});

botonJugar.addEventListener('click', empezarPartida);

crearTablero();
