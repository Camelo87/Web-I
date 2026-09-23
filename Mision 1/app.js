const TOTAL_CELDAS = 9;

const tablero = document.querySelector('#tablero');

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
}

crearTablero();
