import { db, collection, addDoc, query, where, onSnapshot, deleteDoc, doc, updateDoc } from './firebase-config.js';

const form = document.getElementById('add-flight-form');
const tableBody = document.getElementById('admin-table-body');
const btnDeleteAll = document.getElementById('btn-delete-all');

// Establecer la fecha de hoy por defecto
const today = new Date().toISOString().split('T')[0];
document.getElementById('fecha').value = today;

// Guardar nuevo viaje
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btnSubmit = form.querySelector('.btn-submit');
    const originalText = btnSubmit.textContent;
    btnSubmit.textContent = 'Guardando...';
    btnSubmit.disabled = true;

    const nuevoViaje = {
        fecha: document.getElementById('fecha').value,
        hora: document.getElementById('hora').value,
        placa: document.getElementById('placa').value.toUpperCase(),
        chofer: document.getElementById('chofer').value.toUpperCase(),
        origen: document.getElementById('origen').value.toUpperCase(),
        destino: document.getElementById('destino').value.toUpperCase(),
        estado: document.getElementById('estado').value
    };

    try {
        await addDoc(collection(db, "viajes"), nuevoViaje);
        document.getElementById('hora').value = '';
        document.getElementById('placa').value = '';
        document.getElementById('chofer').value = '';
        document.getElementById('origen').value = '';
        document.getElementById('destino').value = '';
        document.getElementById('hora').focus();
    } catch (error) {
        console.error("Error agregando el viaje: ", error);
        alert('Error al guardar. Verifica la configuración de Firebase.');
    } finally {
        btnSubmit.textContent = originalText;
        btnSubmit.disabled = false;
    }
});

// Cargar y mostrar los viajes de hoy
const q = query(
    collection(db, "viajes"),
    where("fecha", "==", today)
);

let todayDocs = [];

onSnapshot(q, (snapshot) => {
    tableBody.innerHTML = '';
    todayDocs = [];
    
    if (snapshot.empty) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#9ca3af; padding: 20px;">No hay viajes planificados para hoy</td></tr>';
        return;
    }

    // Convertir a array y ordenar por hora en JavaScript
    const viajes = [];
    snapshot.forEach((documento) => {
        viajes.push({ id: documento.id, data: documento.data() });
    });
    
    viajes.sort((a, b) => a.data.hora.localeCompare(b.data.hora));

    viajes.forEach((viaje) => {
        const data = viaje.data;
        const documentoId = viaje.id;
        todayDocs.push(documentoId);
        const row = document.createElement('tr');
        
        let selectHtml = `
            <select class="status-select" data-id="${documentoId}">
                <option value="CARGANDO" ${data.estado === 'CARGANDO' ? 'selected' : ''}>CARGANDO</option>
                <option value="EN CAMINO" ${data.estado === 'EN CAMINO' ? 'selected' : ''}>EN CAMINO</option>
                <option value="FINALIZADO" ${data.estado === 'FINALIZADO' ? 'selected' : ''}>FINALIZADO</option>
            </select>
        `;

        row.innerHTML = `
            <td><strong>${data.hora}</strong></td>
            <td>${data.placa}</td>
            <td>${data.chofer}</td>
            <td>${data.origen} &rarr; ${data.destino}</td>
            <td>${selectHtml}</td>
            <td>
                <button class="btn-delete" data-id="${documentoId}">X</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Evento para cambiar el estado directamente desde la tabla
    document.querySelectorAll('.status-select').forEach(select => {
        select.addEventListener('change', async (e) => {
            const id = e.target.getAttribute('data-id');
            const nuevoEstado = e.target.value;
            
            // Colores visuales en el select temporalmente
            if(nuevoEstado === 'CARGANDO') e.target.style.color = '#facc15';
            if(nuevoEstado === 'EN CAMINO') e.target.style.color = '#60a5fa';
            if(nuevoEstado === 'FINALIZADO') e.target.style.color = '#34d399';

            try {
                const docRef = doc(db, "viajes", id);
                await updateDoc(docRef, { estado: nuevoEstado });
            } catch (error) {
                console.error("Error actualizando estado: ", error);
                alert("Error al actualizar el estado");
            }
        });
        
        // Disparar color inicial
        select.dispatchEvent(new Event('change'));
    });

    // Eventos a botones de eliminar individuales
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            if(confirm('¿Estás seguro de eliminar este registro?')) {
                const id = e.target.getAttribute('data-id');
                try {
                    await deleteDoc(doc(db, "viajes", id));
                } catch (error) {
                    console.error("Error eliminando el viaje: ", error);
                    alert("Error al eliminar");
                }
            }
        });
    });
});

// Botón para borrar todos los registros de hoy
btnDeleteAll.addEventListener('click', async () => {
    if(todayDocs.length === 0) {
        alert('No hay registros para borrar hoy.');
        return;
    }
    
    if(confirm('⚠️ ¿Estás COMPLETAMENTE SEGURO de querer borrar TODOS los registros de hoy? Esta acción no se puede deshacer.')) {
        const originalText = btnDeleteAll.textContent;
        btnDeleteAll.textContent = 'Borrando...';
        btnDeleteAll.disabled = true;

        try {
            // Borrar cada documento individualmente
            for(const id of todayDocs) {
                await deleteDoc(doc(db, "viajes", id));
            }
            alert('Registros del día borrados exitosamente.');
        } catch (error) {
            console.error("Error borrando todos los viajes: ", error);
            alert("Error al borrar algunos o todos los registros.");
        } finally {
            btnDeleteAll.textContent = originalText;
            btnDeleteAll.disabled = false;
        }
    }
});
