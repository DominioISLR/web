import { db, collection, query, where, onSnapshot } from './firebase-config.js';

const boardBody = document.getElementById('board-body');
let allFlights = [];
let displayIndex = 0;
const MAX_DISPLAY = 5;
const ROW_HEIGHT = 90;

// Reloj en tiempo real
function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).toUpperCase();
    
    document.getElementById('current-datetime').innerHTML = `${timeStr} <span>${dateStr}</span>`;
}
setInterval(updateClock, 1000);
updateClock();

// Obtener fecha de hoy en formato YYYY-MM-DD
const today = new Date().toISOString().split('T')[0];

function getStatusClass(status) {
    if (status === 'CARGANDO') return 'status-loading';
    if (status === 'EN CAMINO') return 'status-ontheway';
    if (status === 'FINALIZADO') return 'status-finished';
    return '';
}

// Escuchar cambios en la base de datos
const q = query(
    collection(db, "viajes"),
    where("fecha", "==", today)
);

onSnapshot(q, (snapshot) => {
    allFlights = [];
    snapshot.forEach((doc) => {
        allFlights.push({ id: doc.id, ...doc.data() });
    });
    
    // Ordenar por hora en JavaScript para evitar requerir un índice compuesto en Firebase
    allFlights.sort((a, b) => a.hora.localeCompare(b.hora));
    
    if (allFlights.length === 0) {
        boardBody.innerHTML = '<div class="empty-state">NO HAY CAMIONES PROGRAMADOS PARA HOY</div>';
    } else if (boardBody.children.length === 0 || boardBody.querySelector('.empty-state')) {
        renderInitialBoard();
    }
}, (error) => {
    console.error("Error al obtener los viajes: ", error);
    boardBody.innerHTML = '<div class="empty-state" style="color: #ef4444;">Error de conexión con la base de datos</div>';
});

function createFlightRowHTML(flight) {
    return `
        <div class="flight-time">${flight.hora}</div>
        <div class="flight-placa">${flight.placa}</div>
        <div class="flight-chofer">${flight.chofer}</div>
        <div class="flight-origen">${flight.origen}</div>
        <div class="flight-destino">${flight.destino}</div>
        <div class="${getStatusClass(flight.estado)}">${flight.estado}</div>
    `;
}

function renderInitialBoard() {
    boardBody.innerHTML = '';
    
    const count = Math.min(MAX_DISPLAY, allFlights.length);
    for (let i = 0; i < count; i++) {
        const flight = allFlights[i];
        const row = document.createElement('div');
        row.className = 'flight-row';
        row.style.top = `${i * ROW_HEIGHT}px`;
        row.innerHTML = createFlightRowHTML(flight);
        boardBody.appendChild(row);
    }
    
    displayIndex = count % allFlights.length;
}

// Rotación
setInterval(() => {
    if (allFlights.length > MAX_DISPLAY) {
        if (window.innerWidth <= 768) {
            renderInitialBoard();
            return;
        }

        const rows = document.querySelectorAll('.flight-row');
        if (rows.length > 0) {
            rows[0].style.top = `-${ROW_HEIGHT}px`;
            rows[0].style.opacity = '0';
            
            for (let i = 1; i < rows.length; i++) {
                rows[i].style.top = `${(i - 1) * ROW_HEIGHT}px`;
            }

            const flight = allFlights[displayIndex];
            const newRow = document.createElement('div');
            newRow.className = 'flight-row';
            newRow.style.top = `${MAX_DISPLAY * ROW_HEIGHT}px`;
            newRow.style.opacity = '0';
            newRow.innerHTML = createFlightRowHTML(flight);
            
            boardBody.appendChild(newRow);

            void newRow.offsetWidth;

            newRow.style.top = `${(MAX_DISPLAY - 1) * ROW_HEIGHT}px`;
            newRow.style.opacity = '1';

            setTimeout(() => {
                if(rows[0] && rows[0].parentNode) {
                    rows[0].remove();
                }
            }, 800);

            displayIndex = (displayIndex + 1) % allFlights.length;
        }
    } else if (allFlights.length > 0 && allFlights.length <= MAX_DISPLAY) {
        const rows = document.querySelectorAll('.flight-row');
        if(rows.length === allFlights.length && !boardBody.querySelector('.empty-state')){
           allFlights.forEach((flight, i) => {
               if(rows[i]) rows[i].innerHTML = createFlightRowHTML(flight);
           });
        } else {
            renderInitialBoard();
        }
    }
}, 4000);
