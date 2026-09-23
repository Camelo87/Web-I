const TOTAL_CELDAS = 9;
const DURACION_PARTIDA_S = 30;
const SEGUNDOS_AVISO = 5;
const CLAVE_RECORDS = 'cazaAlBug.records';

// Cada dificultad cambia cuánto tiempo se deja ver un bug y la pausa entre apariciones
const DIFICULTADES = {
    junior: { nombre: 'Junior', duracionMs: 1100, pausaMs: 350 },
    senior: { nombre: 'Senior', duracionMs: 850, pausaMs: 250 },
    diezx: { nombre: '10x', duracionMs: 600, pausaMs: 150 }
};

// Tipos de criatura: "probabilidad" es su peso al sortear y "factorTiempo" acorta o alarga su aparición
const CRIATURAS = [
    { tipo: 'bug', emoji: '🐛', puntos: 1, probabilidad: 0.7, factorTiempo: 1, texto: '¡Bug aplastado!' },
    { tipo: 'critico', emoji: '🪲', puntos: 3, probabilidad: 0.12, factorTiempo: 0.7, texto: '¡Bug crítico en producción, eliminado!' },
    { tipo: 'feature', emoji: '✨', puntos: -2, probabilidad: 0.18, factorTiempo: 1.2, texto: '¡Eso era una feature! El cliente no está contento.' }
];

// El multiplicador sube con cada racha de aciertos seguidos
const COMBO_POR_NIVEL = 5;
const MULTIPLICADOR_MAXIMO = 3;

const tablero = document.querySelector('#tablero');
const textoPuntos = document.querySelector('#puntos');
const textoTiempo = document.querySelector('#tiempo');
const textoCombo = document.querySelector('#combo');
const textoRecord = document.querySelector('#record');
const selectorDificultad = document.querySelector('#dificultad');
const botonJugar = document.querySelector('#botonJugar');
const mensaje = document.querySelector('#mensaje');

// Estado de la partida: todo lo que cambia mientras se juega vive aquí
const estado = {
    jugando: false,
    puntos: 0,
    racha: 0,
    segundosRestantes: DURACION_PARTIDA_S,
    dificultad: DIFICULTADES.senior,
    celdaActiva: null,
    ultimaCelda: null,
    criaturaActiva: null,
    temporizadorBug: null,
    intervaloReloj: null
};

let celdas = [];

/* ---------- Récords (localStorage) ---------- */

function leerRecords() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_RECORDS)) ?? {};
    } catch {
        return {};
    }
}

function guardarRecord(claveDificultad, puntos) {
    const records = { ...leerRecords(), [claveDificultad]: puntos };
    try {
        localStorage.setItem(CLAVE_RECORDS, JSON.stringify(records));
    } catch {
        // Sin almacenamiento disponible (modo privado): el récord no se conserva
    }
}

function obtenerRecord(claveDificultad) {
    return leerRecords()[claveDificultad] ?? 0;
}

/* ---------- Tablero ---------- */

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

// Sorteo ponderado: cuanto mayor la probabilidad, más espacio ocupa en el intervalo [0, 1)
function elegirCriatura() {
    let tirada = Math.random();
    for (const criatura of CRIATURAS) {
        tirada -= criatura.probabilidad;
        if (tirada < 0) return criatura;
    }
    return CRIATURAS[0];
}

function mostrarCriatura() {
    const celda = elegirCeldaAleatoria();
    const criatura = elegirCriatura();

    const bicho = document.createElement('span');
    bicho.className = `celda__bicho celda__bicho--${criatura.tipo}`;
    bicho.textContent = criatura.emoji;

    celda.append(bicho);
    celda.classList.add('celda--activa');
    estado.celdaActiva = celda;
    estado.ultimaCelda = celda;
    estado.criaturaActiva = criatura;

    const duracion = estado.dificultad.duracionMs * criatura.factorTiempo;
    estado.temporizadorBug = setTimeout(escaparCriatura, duracion);
}

function ocultarCriatura() {
    clearTimeout(estado.temporizadorBug);

    if (estado.celdaActiva) {
        estado.celdaActiva.classList.remove('celda--activa');
        estado.celdaActiva.querySelector('.celda__bicho')?.remove();
    }
    estado.celdaActiva = null;
    estado.criaturaActiva = null;

    if (estado.jugando) {
        estado.temporizadorBug = setTimeout(mostrarCriatura, estado.dificultad.pausaMs);
    }
}

// Si un bug se escapa se rompe la racha; si lo que se va es una feature, no pasa nada
function escaparCriatura() {
    if (estado.criaturaActiva?.puntos > 0) {
        estado.racha = 0;
        actualizarCombo();
        mensaje.textContent = 'Un bug se ha colado en producción...';
    }
    ocultarCriatura();
}

/* ---------- Marcadores ---------- */

function calcularMultiplicador() {
    return Math.min(1 + Math.floor(estado.racha / COMBO_POR_NIVEL), MULTIPLICADOR_MAXIMO);
}

function actualizarPuntos() {
    textoPuntos.textContent = estado.puntos;
}

function actualizarTiempo() {
    textoTiempo.textContent = estado.segundosRestantes;
    textoTiempo.classList.toggle('panel__valor--aviso', estado.jugando && estado.segundosRestantes <= SEGUNDOS_AVISO);
}

function actualizarCombo() {
    const multiplicador = calcularMultiplicador();
    textoCombo.textContent = `x${multiplicador}`;
    textoCombo.classList.toggle('panel__valor--combo', multiplicador > 1);
}

function actualizarRecord() {
    textoRecord.textContent = obtenerRecord(selectorDificultad.value);
}

/* ---------- Jugabilidad ---------- */

// Marca visualmente una celda durante un instante (acierto o fallo)
function destellar(celda, clase) {
    celda.classList.remove(clase);
    void celda.offsetWidth; // fuerza un reflow para poder repetir la animación
    celda.classList.add(clase);
}

function golpear(celda) {
    if (!estado.jugando) return;

    const criatura = estado.criaturaActiva;

    if (celda !== estado.celdaActiva || !criatura) {
        destellar(celda, 'celda--fallo');
        mensaje.textContent = 'Ahí no había nada... 404.';
        return;
    }

    if (criatura.puntos < 0) {
        estado.racha = 0;
        estado.puntos = Math.max(0, estado.puntos + criatura.puntos);
        destellar(celda, 'celda--fallo');
        mensaje.textContent = `${criatura.texto} (${criatura.puntos})`;
    } else {
        estado.racha++;
        const ganados = criatura.puntos * calcularMultiplicador();
        estado.puntos += ganados;
        destellar(celda, 'celda--acierto');
        mensaje.textContent = `${criatura.texto} (+${ganados})`;
    }

    actualizarPuntos();
    actualizarCombo();
    ocultarCriatura();
}

function descontarSegundo() {
    estado.segundosRestantes--;
    actualizarTiempo();

    if (estado.segundosRestantes <= 0) terminarPartida();
}

function empezarPartida() {
    estado.jugando = true;
    estado.puntos = 0;
    estado.racha = 0;
    estado.segundosRestantes = DURACION_PARTIDA_S;
    estado.dificultad = DIFICULTADES[selectorDificultad.value];
    estado.ultimaCelda = null;
    actualizarPuntos();
    actualizarTiempo();
    actualizarCombo();

    botonJugar.disabled = true;
    selectorDificultad.disabled = true;
    mensaje.textContent = `Sprint ${estado.dificultad.nombre} en marcha. ¡No toques las features!`;
    estado.intervaloReloj = setInterval(descontarSegundo, 1000);
    mostrarCriatura();
}

function terminarPartida() {
    estado.jugando = false;
    clearInterval(estado.intervaloReloj);
    ocultarCriatura();
    actualizarTiempo();

    const claveDificultad = selectorDificultad.value;
    const esRecord = estado.puntos > obtenerRecord(claveDificultad);
    if (esRecord) guardarRecord(claveDificultad, estado.puntos);
    actualizarRecord();

    botonJugar.disabled = false;
    selectorDificultad.disabled = false;
    botonJugar.textContent = 'Otra partida';
    mensaje.textContent = esRecord
        ? `¡Nuevo récord en ${estado.dificultad.nombre}: ${estado.puntos} puntos!`
        : `Fin del sprint: ${estado.puntos} puntos.`;
}

/* ---------- Eventos ---------- */

// Un único listener en el tablero (delegación) en lugar de uno por celda
tablero.addEventListener('click', (evento) => {
    const celda = evento.target.closest('.celda');
    if (celda) golpear(celda);
});

botonJugar.addEventListener('click', empezarPartida);
selectorDificultad.addEventListener('change', actualizarRecord);

crearTablero();
actualizarRecord();
