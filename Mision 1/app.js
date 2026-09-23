const TOTAL_CELDAS = 9;
const DURACION_PARTIDA_S = 30;
const SEGUNDOS_AVISO = 5;
const CLAVE_RECORDS = 'cazaAlBug.records';
const CLAVE_TEMA = 'cazaAlBug.modoOscuro';
const CODIGO_SECRETO = 'debug';

// Cada dificultad cambia cuánto tiempo se deja ver un bug y la pausa entre apariciones
const DIFICULTADES = {
    junior: { nombre: 'Junior', duracionMs: 1100, pausaMs: 350 },
    senior: { nombre: 'Senior', duracionMs: 850, pausaMs: 250 },
    diezx: { nombre: '10x', duracionMs: 600, pausaMs: 150 }
};

// Tipos de criatura: "probabilidad" es su peso al sortear, "factorTiempo" acorta o alarga su aparición
// y "esTrampa" marca las que no hay que golpear (sus puntos se restan)
const CRIATURAS = [
    { tipo: 'bug', emoji: '🐛', puntos: 1, esTrampa: false, probabilidad: 0.7, factorTiempo: 1, texto: '¡Bug aplastado!' },
    { tipo: 'critico', emoji: '🪲', puntos: 3, esTrampa: false, probabilidad: 0.12, factorTiempo: 0.7, texto: '¡Bug crítico en producción, eliminado!' },
    { tipo: 'feature', emoji: '✨', puntos: 2, esTrampa: true, probabilidad: 0.18, factorTiempo: 1.2, texto: '¡Eso era una feature! El cliente no está contento.' }
];

// El multiplicador sube con cada racha de aciertos seguidos
const COMBO_POR_NIVEL = 5;
const MULTIPLICADOR_MAXIMO = 3;
const PENALIZACION_FALLO = 1;
const CLASES_DESTELLO = ['celda--acierto', 'celda--fallo'];

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
    claveDificultad: 'senior',
    celdaActiva: null,
    ultimaCelda: null,
    criaturaActiva: null,
    temporizadorBug: null,
    intervaloReloj: null
};

let celdas = [];
let teclasRecientes = '';

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

/* ---------- Modo oscuro secreto ---------- */

function guardarModoOscuro(activo) {
    try {
        localStorage.setItem(CLAVE_TEMA, String(activo));
    } catch {
        // Sin almacenamiento disponible: el tema solo dura mientras la página esté abierta
    }
}

function cargarModoOscuro() {
    try {
        return localStorage.getItem(CLAVE_TEMA) === 'true';
    } catch {
        return false;
    }
}

// Guarda las últimas letras pulsadas y activa el modo oscuro al escribir el código secreto
function comprobarCodigoSecreto(tecla) {
    teclasRecientes = (teclasRecientes + tecla.toLowerCase()).slice(-CODIGO_SECRETO.length);

    if (teclasRecientes === CODIGO_SECRETO) {
        teclasRecientes = '';
        const activo = document.body.classList.toggle('modo-oscuro');
        guardarModoOscuro(activo);
        mensaje.textContent = activo ? '🌙 Modo debug nocturno activado.' : '☀️ Vuelta al modo diurno.';
    }
}

/* ---------- Tablero ---------- */

// Crea las 9 celdas del tablero con createElement y las inserta de una sola vez
function crearTablero() {
    const fragmento = document.createDocumentFragment();

    for (let i = 0; i < TOTAL_CELDAS; i++) {
        const celda = document.createElement('button');
        celda.type = 'button';
        celda.className = 'celda';
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

    const duracion = dificultadActual().duracionMs * criatura.factorTiempo;
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
        estado.temporizadorBug = setTimeout(mostrarCriatura, dificultadActual().pausaMs);
    }
}

// Si un bug se escapa se rompe la racha; si lo que se va es una feature, no pasa nada
function escaparCriatura() {
    if (estado.criaturaActiva && !estado.criaturaActiva.esTrampa) {
        romperRacha('Un bug se ha colado en producción...');
    }
    ocultarCriatura();
}

/* ---------- Marcadores ---------- */

function dificultadActual() {
    return DIFICULTADES[estado.claveDificultad];
}

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

function actualizarRecord(claveDificultad) {
    textoRecord.textContent = obtenerRecord(claveDificultad);
}

/* ---------- Jugabilidad ---------- */

// Marca visualmente una celda; la clase se retira sola al acabar la animación (listener animationend)
function destellar(celda, clase) {
    celda.classList.remove(...CLASES_DESTELLO);
    celda.classList.add(clase);
}

function cambiarPuntos(cantidad) {
    estado.puntos = Math.max(0, estado.puntos + cantidad);
    actualizarPuntos();
}

function romperRacha(texto) {
    estado.racha = 0;
    actualizarCombo();
    mensaje.textContent = texto;
}

function golpear(celda) {
    if (!estado.jugando) return;

    const criatura = estado.criaturaActiva;

    // Golpear a ciegas también cuesta: así aporrear todas las casillas deja de ser la mejor estrategia
    if (celda !== estado.celdaActiva || !criatura) {
        destellar(celda, 'celda--fallo');
        cambiarPuntos(-PENALIZACION_FALLO);
        romperRacha(`Ahí no había nada... 404. (−${PENALIZACION_FALLO})`);
        return;
    }

    if (criatura.esTrampa) {
        destellar(celda, 'celda--fallo');
        cambiarPuntos(-criatura.puntos);
        romperRacha(`${criatura.texto} (−${criatura.puntos})`);
    } else {
        estado.racha++;
        const ganados = criatura.puntos * calcularMultiplicador();
        destellar(celda, 'celda--acierto');
        cambiarPuntos(ganados);
        actualizarCombo();
        mensaje.textContent = `${criatura.texto} (+${ganados})`;
    }

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
    estado.claveDificultad = selectorDificultad.value;
    estado.ultimaCelda = null;
    actualizarPuntos();
    actualizarTiempo();
    actualizarCombo();

    botonJugar.disabled = true;
    selectorDificultad.disabled = true;
    mensaje.textContent = `Sprint ${dificultadActual().nombre} en marcha. ¡No toques las features!`;
    estado.intervaloReloj = setInterval(descontarSegundo, 1000);
    mostrarCriatura();
}

function terminarPartida() {
    estado.jugando = false;
    clearInterval(estado.intervaloReloj);
    ocultarCriatura();
    actualizarTiempo();

    const { claveDificultad, puntos } = estado;
    const esRecord = puntos > obtenerRecord(claveDificultad);
    if (esRecord) guardarRecord(claveDificultad, puntos);
    actualizarRecord(claveDificultad);

    botonJugar.disabled = false;
    selectorDificultad.disabled = false;
    botonJugar.textContent = 'Otra partida';
    mensaje.textContent = esRecord
        ? `¡Nuevo récord en ${dificultadActual().nombre}: ${puntos} puntos!`
        : `Fin del sprint: ${puntos} puntos.`;
}

/* ---------- Eventos ---------- */

// Ignora repeticiones al mantener pulsado y combinaciones con modificadores (Ctrl+D, etc.)
function esTeclaSimple(evento) {
    return !evento.repeat && !evento.ctrlKey && !evento.metaKey && !evento.altKey;
}

// Teclas 1-9: golpean la celda con ese número
function manejarTeclaDeJuego(evento) {
    const numero = Number(evento.key);
    if (Number.isInteger(numero) && numero >= 1 && numero <= TOTAL_CELDAS) {
        golpear(celdas[numero - 1]);
    }
}

// Letras: alimentan el código secreto del modo oscuro
function manejarTeclaSecreta(evento) {
    if (/^[a-z]$/i.test(evento.key)) comprobarCodigoSecreto(evento.key);
}

// Un único listener en el tablero (delegación) en lugar de uno por celda
tablero.addEventListener('click', (evento) => {
    const celda = evento.target.closest('.celda');
    if (celda) golpear(celda);
});

// También delegado: al acabar el destello se retira la clase para que la siguiente animación arranque limpia
tablero.addEventListener('animationend', (evento) => {
    if (evento.target.classList.contains('celda')) {
        evento.target.classList.remove(...CLASES_DESTELLO);
    }
});

document.addEventListener('keydown', (evento) => {
    if (!esTeclaSimple(evento)) return;
    manejarTeclaDeJuego(evento);
    manejarTeclaSecreta(evento);
});

botonJugar.addEventListener('click', empezarPartida);
selectorDificultad.addEventListener('change', () => actualizarRecord(selectorDificultad.value));

crearTablero();
actualizarRecord(estado.claveDificultad);
document.body.classList.toggle('modo-oscuro', cargarModoOscuro());
