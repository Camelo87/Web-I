const TOTAL_CELDAS = 9;
const CARTAS_POR_MANO = 5;
const DURACION_PARTIDA_S = 45;
const SEGUNDOS_AVISO = 5;
const CLAVE_RECORDS = 'cazaLaMano.records';
const CLAVE_TEMA = 'cazaLaMano.modoNoche';
const CODIGO_SECRETO = 'allin';

// Cada dificultad cambia cuánto tiempo se deja ver una carta y la pausa entre apariciones
const DIFICULTADES = {
    novato: { nombre: 'Novato', duracionMs: 1300, pausaMs: 350 },
    habitual: { nombre: 'Habitual', duracionMs: 1000, pausaMs: 250 },
    tiburon: { nombre: 'Tiburón', duracionMs: 700, pausaMs: 150 }
};

const PALOS = [
    { simbolo: '♠', nombre: 'picas', rojo: false },
    { simbolo: '♥', nombre: 'corazones', rojo: true },
    { simbolo: '♦', nombre: 'diamantes', rojo: true },
    { simbolo: '♣', nombre: 'tréboles', rojo: false }
];
const FIGURAS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Tabla de premios, de la mejor jugada a la peor (el orden se usa también para pintarla)
const JUGADAS = {
    escaleraReal: { nombre: 'Escalera real', puntos: 100 },
    escaleraColor: { nombre: 'Escalera de color', puntos: 50 },
    poker: { nombre: 'Póker', puntos: 30 },
    full: { nombre: 'Full', puntos: 15 },
    color: { nombre: 'Color', puntos: 12 },
    escalera: { nombre: 'Escalera', puntos: 10 },
    trio: { nombre: 'Trío', puntos: 5 },
    doblePareja: { nombre: 'Doble pareja', puntos: 3 },
    pareja: { nombre: 'Pareja', puntos: 1 },
    cartaAlta: { nombre: 'Carta alta', puntos: 0 }
};

// La carta marcada es la trampa: si la atrapas, el crupier te pilla y quema tu mano
const CARTA_MARCADA = { marcada: true };
const PROBABILIDAD_MARCADA = 0.12;
const PENALIZACION_MARCADA = 5;
const PENALIZACION_FALLO = 1;

// Cada mano premiada seguida sube el multiplicador de la siguiente
const MULTIPLICADOR_MAXIMO = 3;
const CLASES_DESTELLO = ['celda--acierto', 'celda--fallo'];

const tablero = document.querySelector('#tablero');
const zonaMano = document.querySelector('#mano');
const textoJugada = document.querySelector('#jugada');
const listaPremios = document.querySelector('#premios');
const textoPuntos = document.querySelector('#puntos');
const textoTiempo = document.querySelector('#tiempo');
const textoRacha = document.querySelector('#racha');
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
    claveDificultad: 'habitual',
    mazo: [],
    mano: [],
    celdaActiva: null,
    ultimaCelda: null,
    cartaActiva: null,
    temporizadorCarta: null,
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

/* ---------- Modo noche secreto ---------- */

function guardarModoNoche(activo) {
    try {
        localStorage.setItem(CLAVE_TEMA, String(activo));
    } catch {
        // Sin almacenamiento disponible: el tema solo dura mientras la página esté abierta
    }
}

function cargarModoNoche() {
    try {
        return localStorage.getItem(CLAVE_TEMA) === 'true';
    } catch {
        return false;
    }
}

// Guarda las últimas letras pulsadas y activa el modo noche al escribir el código secreto
function comprobarCodigoSecreto(tecla) {
    teclasRecientes = (teclasRecientes + tecla.toLowerCase()).slice(-CODIGO_SECRETO.length);

    if (teclasRecientes === CODIGO_SECRETO) {
        teclasRecientes = '';
        const activo = document.body.classList.toggle('modo-noche');
        guardarModoNoche(activo);
        mensaje.textContent = activo ? '🌙 All-in: el casino abre de noche.' : '☀️ Partida de tarde.';
    }
}

/* ---------- Baraja ---------- */

// 52 cartas: cada figura de cada palo; "valor" sirve para ordenar y detectar escaleras (2..14)
function crearBaraja() {
    return PALOS.flatMap((palo) =>
        FIGURAS.map((figura, indice) => ({
            id: `${figura}${palo.simbolo}`,
            figura,
            valor: indice + 2,
            palo
        }))
    );
}

// Fisher-Yates: recorre el array de atrás hacia delante intercambiando cada carta con una anterior al azar
function barajar(cartas) {
    const mezcla = [...cartas];
    for (let i = mezcla.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [mezcla[i], mezcla[j]] = [mezcla[j], mezcla[i]];
    }
    return mezcla;
}

// Si el mazo se acaba se baraja uno nuevo sin las cartas que ya tienes en la mano (no puede haber dos A♠)
function robarCarta() {
    if (estado.mazo.length === 0) {
        const enMano = new Set(estado.mano.map((carta) => carta.id));
        estado.mazo = barajar(crearBaraja().filter((carta) => !enMano.has(carta.id)));
    }
    return estado.mazo.pop();
}

// Un mismo nodo de carta sirve para el tablero y para la mano
function crearNodoCarta(carta) {
    const nodo = document.createElement('span');
    nodo.className = 'carta';

    if (carta.marcada) {
        nodo.classList.add('carta--marcada');
        nodo.textContent = '☠';
        nodo.setAttribute('aria-label', 'Carta marcada');
        return nodo;
    }

    nodo.classList.toggle('carta--roja', carta.palo.rojo);
    nodo.setAttribute('aria-label', `${carta.figura} de ${carta.palo.nombre}`);

    const figura = document.createElement('span');
    figura.className = 'carta__figura';
    figura.textContent = carta.figura;

    const palo = document.createElement('span');
    palo.className = 'carta__palo';
    palo.textContent = carta.palo.simbolo;

    nodo.append(figura, palo);
    return nodo;
}

/* ---------- Evaluación de la mano ---------- */

// Devuelve cuántas cartas hay de cada valor, de mayor a menor: [3, 2] es un full, [2, 2, 1] doble pareja
function contarRepeticiones(valores) {
    const cuenta = {};
    for (const valor of valores) {
        cuenta[valor] = (cuenta[valor] ?? 0) + 1;
    }
    return Object.values(cuenta).sort((a, b) => b - a);
}

// Cinco valores seguidos; el as también cuenta como 1 en la escalera baja A-2-3-4-5
function esEscalera(valoresOrdenados) {
    const sinRepetidos = new Set(valoresOrdenados).size === CARTAS_POR_MANO;
    const seguidos = valoresOrdenados[CARTAS_POR_MANO - 1] - valoresOrdenados[0] === CARTAS_POR_MANO - 1;
    const escaleraBaja = valoresOrdenados.join() === '2,3,4,5,14';
    return sinRepetidos && (seguidos || escaleraBaja);
}

function evaluarMano(cartas) {
    const valores = cartas.map((carta) => carta.valor).sort((a, b) => a - b);
    const [primera, segunda] = contarRepeticiones(valores);
    const color = cartas.every((carta) => carta.palo === cartas[0].palo);
    const escalera = esEscalera(valores);

    if (escalera && color) return valores[0] === 10 ? JUGADAS.escaleraReal : JUGADAS.escaleraColor;
    if (primera === 4) return JUGADAS.poker;
    if (primera === 3 && segunda === 2) return JUGADAS.full;
    if (color) return JUGADAS.color;
    if (escalera) return JUGADAS.escalera;
    if (primera === 3) return JUGADAS.trio;
    if (primera === 2 && segunda === 2) return JUGADAS.doblePareja;
    if (primera === 2) return JUGADAS.pareja;
    return JUGADAS.cartaAlta;
}

/* ---------- Tablero, mano y tabla de premios ---------- */

// Crea las 9 celdas del tablero con createElement y las inserta de una sola vez
function crearTablero() {
    const fragmento = document.createDocumentFragment();

    for (let i = 0; i < TOTAL_CELDAS; i++) {
        const celda = document.createElement('button');
        celda.type = 'button';
        celda.className = 'celda';
        celda.setAttribute('aria-label', `Hueco ${i + 1}`);

        const atajo = document.createElement('span');
        atajo.className = 'celda__atajo';
        atajo.textContent = i + 1;

        celda.append(atajo);
        fragmento.append(celda);
    }

    tablero.append(fragmento);
    celdas = [...tablero.querySelectorAll('.celda')];
}

// La tabla de premios se genera a partir de JUGADAS, así solo hay una fuente de verdad para los puntos
function crearTablaPremios() {
    const fragmento = document.createDocumentFragment();

    for (const jugada of Object.values(JUGADAS)) {
        const fila = document.createElement('li');
        fila.className = 'premios__fila';

        const nombre = document.createElement('span');
        nombre.textContent = jugada.nombre;

        const puntos = document.createElement('span');
        puntos.className = 'premios__puntos';
        puntos.textContent = jugada.puntos;

        fila.append(nombre, puntos);
        fragmento.append(fila);
    }

    listaPremios.append(fragmento);
}

function resaltarPremio(jugada) {
    const indice = Object.values(JUGADAS).indexOf(jugada);
    [...listaPremios.children].forEach((fila, i) => {
        fila.classList.toggle('premios__fila--activa', i === indice);
    });
}

// Pinta los 5 huecos de la mano: las cartas atrapadas y el resto vacíos
function pintarMano() {
    const fragmento = document.createDocumentFragment();

    for (let i = 0; i < CARTAS_POR_MANO; i++) {
        const carta = estado.mano[i];
        const hueco = carta ? crearNodoCarta(carta) : document.createElement('span');
        if (!carta) hueco.className = 'mano__hueco';
        fragmento.append(hueco);
    }

    zonaMano.replaceChildren(fragmento);
    zonaMano.classList.remove('mano--resuelta');
}

// Elige una celda al azar distinta de la anterior para que la carta no se repita en el mismo sitio
function elegirCeldaAleatoria() {
    let indice;
    do {
        indice = Math.floor(Math.random() * TOTAL_CELDAS);
    } while (celdas[indice] === estado.ultimaCelda);
    return celdas[indice];
}

function mostrarCarta() {
    const celda = elegirCeldaAleatoria();
    const carta = Math.random() < PROBABILIDAD_MARCADA ? CARTA_MARCADA : robarCarta();

    const nodo = crearNodoCarta(carta);
    nodo.classList.add('carta--tablero');

    celda.append(nodo);
    celda.classList.add('celda--activa');
    estado.celdaActiva = celda;
    estado.ultimaCelda = celda;
    estado.cartaActiva = carta;

    estado.temporizadorCarta = setTimeout(ocultarCarta, dificultadActual().duracionMs);
}

// Retira la carta visible (atrapada o no) y programa la siguiente mientras dure la partida
function ocultarCarta() {
    clearTimeout(estado.temporizadorCarta);

    if (estado.celdaActiva) {
        estado.celdaActiva.classList.remove('celda--activa');
        estado.celdaActiva.querySelector('.carta')?.remove();
    }
    estado.celdaActiva = null;
    estado.cartaActiva = null;

    if (estado.jugando) {
        estado.temporizadorCarta = setTimeout(mostrarCarta, dificultadActual().pausaMs);
    }
}

/* ---------- Marcadores ---------- */

function dificultadActual() {
    return DIFICULTADES[estado.claveDificultad];
}

function calcularMultiplicador() {
    return Math.min(1 + estado.racha, MULTIPLICADOR_MAXIMO);
}

function actualizarPuntos() {
    textoPuntos.textContent = estado.puntos;
}

function actualizarTiempo() {
    textoTiempo.textContent = estado.segundosRestantes;
    textoTiempo.classList.toggle('panel__valor--aviso', estado.jugando && estado.segundosRestantes <= SEGUNDOS_AVISO);
}

function actualizarRacha() {
    const multiplicador = calcularMultiplicador();
    textoRacha.textContent = `x${multiplicador}`;
    textoRacha.classList.toggle('panel__valor--racha', multiplicador > 1);
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

function romperRacha() {
    estado.racha = 0;
    actualizarRacha();
}

function quemarMano() {
    estado.mano = [];
    pintarMano();
    textoJugada.textContent = 'Mano quemada';
}

// Con 5 cartas se cobra la jugada; la mano resuelta se queda a la vista hasta atrapar la siguiente carta
function resolverMano() {
    const jugada = evaluarMano(estado.mano);
    const multiplicador = calcularMultiplicador();
    const ganados = jugada.puntos * multiplicador;

    if (jugada.puntos > 0) {
        estado.racha++;
        actualizarRacha();
    } else {
        romperRacha();
    }

    cambiarPuntos(ganados);
    resaltarPremio(jugada);
    textoJugada.textContent = jugada.nombre;
    zonaMano.classList.add('mano--resuelta');
    mensaje.textContent = ganados > 0
        ? `¡${jugada.nombre}! +${ganados}${multiplicador > 1 ? ` (x${multiplicador})` : ''}`
        : 'Carta alta: el bote se queda en la mesa.';
    estado.mano = [];
}

function atraparCarta(carta) {
    if (estado.mano.length === 0) {
        textoJugada.textContent = '';
        resaltarPremio(null);
    }

    estado.mano.push(carta);
    pintarMano();

    if (estado.mano.length === CARTAS_POR_MANO) {
        resolverMano();
    } else {
        mensaje.textContent = `${carta.id} a la mano (${estado.mano.length}/${CARTAS_POR_MANO})`;
    }
}

function golpear(celda) {
    if (!estado.jugando) return;

    const carta = estado.cartaActiva;

    // Golpear a ciegas también cuesta: así aporrear todas las casillas deja de ser la mejor estrategia
    if (celda !== estado.celdaActiva || !carta) {
        destellar(celda, 'celda--fallo');
        cambiarPuntos(-PENALIZACION_FALLO);
        mensaje.textContent = `Ahí no había carta. (−${PENALIZACION_FALLO})`;
        return;
    }

    if (carta.marcada) {
        destellar(celda, 'celda--fallo');
        cambiarPuntos(-PENALIZACION_MARCADA);
        romperRacha();
        quemarMano();
        mensaje.textContent = `¡Carta marcada! El crupier te ha pillado y quema tu mano. (−${PENALIZACION_MARCADA})`;
    } else {
        destellar(celda, 'celda--acierto');
        atraparCarta(carta);
    }

    ocultarCarta();
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
    estado.mazo = barajar(crearBaraja());
    estado.mano = [];
    estado.ultimaCelda = null;
    actualizarPuntos();
    actualizarTiempo();
    actualizarRacha();
    pintarMano();
    resaltarPremio(null);
    textoJugada.textContent = '';

    botonJugar.disabled = true;
    selectorDificultad.disabled = true;
    mensaje.textContent = `Mesa ${dificultadActual().nombre}: atrapa 5 cartas y forma tu mano. ¡Ojo con las marcadas!`;
    estado.intervaloReloj = setInterval(descontarSegundo, 1000);
    mostrarCarta();
}

function terminarPartida() {
    estado.jugando = false;
    clearInterval(estado.intervaloReloj);
    ocultarCarta();
    actualizarTiempo();

    const { claveDificultad, puntos } = estado;
    const esRecord = puntos > obtenerRecord(claveDificultad);
    if (esRecord) guardarRecord(claveDificultad, puntos);
    actualizarRecord(claveDificultad);

    botonJugar.disabled = false;
    selectorDificultad.disabled = false;
    botonJugar.textContent = 'Otra mano';
    mensaje.textContent = esRecord
        ? `¡Nuevo récord en la mesa ${dificultadActual().nombre}: ${puntos} fichas!`
        : `Se cierra la mesa: ${puntos} fichas.`;
}

/* ---------- Eventos ---------- */

// Ignora repeticiones al mantener pulsado y combinaciones con modificadores (Ctrl+A, etc.)
function esTeclaSimple(evento) {
    return !evento.repeat && !evento.ctrlKey && !evento.metaKey && !evento.altKey;
}

// Teclas 1-9: atrapan la carta de la celda con ese número
function manejarTeclaDeJuego(evento) {
    const numero = Number(evento.key);
    if (Number.isInteger(numero) && numero >= 1 && numero <= TOTAL_CELDAS) {
        golpear(celdas[numero - 1]);
    }
}

// Letras: alimentan el código secreto del modo noche
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
crearTablaPremios();
pintarMano();
actualizarRecord(estado.claveDificultad);
document.body.classList.toggle('modo-noche', cargarModoNoche());
