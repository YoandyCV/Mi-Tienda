// Configuraci��n - PON AQU�0�1 TU URL DEL SCRIPT DE GOOGLE
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwAMY5zZruBYsMlCi-EgBqDBpAc2IBqmf8IkqAnn2Lih0BBWcdaL2ZNxF9V-dNJaHT3/exec';


document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menuToggle');
    const side = document.getElementById('sidebar');

    if (menuBtn && side) {
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            side.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (side.classList.contains('open') && !side.contains(e.target) && e.target !== menuBtn) {
                side.classList.remove('open');
            }
        });
    }

    loadApps();
});

async function loadApps() {
    const grid = document.getElementById('appsContainer');
    try {
        const res = await fetch('apps.json');
        if (!res.ok) throw new Error('No se pudo cargar apps.json');
        const data = await res.json();
        
        let contadores = {};
        try {
            contadores = await obtenerContadores();
            console.log('Contadores cargados:', contadores);
        } catch (err) {
            console.warn('No se pudieron obtener contadores:', err);
        }
        
        grid.innerHTML = '';
        data.forEach(app => {
            const descargas = contadores[app.id] || 0;
            const card = document.createElement('div');
            card.className = 'app-card';
            
            // �9�7 NUEVO: Generar el HTML del icono (prioridad imagen sobre emoji)
            let iconoHtml = '';
            if (app.iconoUrl && app.iconoUrl.trim() !== '') {
                // Intentar cargar imagen
                iconoHtml = `<img src="${app.iconoUrl}" alt="${app.nombre}" class="app-icon-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">`;
                iconoHtml += `<div style="font-size: 2.5rem; margin-bottom: 1rem; display: none;">${app.iconoEmoji || '�7�5�1�5'}</div>`;
            } else {
                // Solo emoji
                iconoHtml = `<div style="font-size: 2.5rem; margin-bottom: 1rem;">${app.iconoEmoji || '�7�5�1�5'}</div>`;
            }
            
            card.innerHTML = `
                <div class="card-info">
                    ${iconoHtml}
                    <h3>${escapeHtml(app.nombre)}</h3>
                    <p>${escapeHtml(app.descripcion)}</p>
                    <div class="card-meta">
                        <span class="size-tag">�9�4 ${app.tama�0�9o}</span>
                        <span class="download-count" id="count-${app.id}">�8�9�1�5 ${descargas} descargas</span>
                    </div>
                </div>
                <button class="btn-dl" data-id="${app.id}" data-url="${app.urlDescarga}">
                    �7�3�1�5 Descargar
                </button>
            `;
            grid.appendChild(card);
        });
        
        // Agregar event listeners a los botones
        document.querySelectorAll('.btn-dl').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-id');
                const url = btn.getAttribute('data-url');
                handleDl(id, url);
            });
        });
        
    } catch (err) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 2rem;">�7�2�1�5 Error: ${err.message}</p>`;
        console.error('Error loading apps:', err);
    }
}

async function obtenerContadores() {
    const url = `${SCRIPT_URL}?action=get`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP error ' + res.status);
    const data = await res.json();
    return data;
}

async function incrementarContador(appId) {
    const url = `${SCRIPT_URL}?action=increment&appId=${encodeURIComponent(appId)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP error ' + res.status);
    const data = await res.json();
    return data.success ? data.newValue : null;
}

async function handleDl(id, url) {
    try {
        const nuevoValor = await incrementarContador(id);
        if (nuevoValor !== null) {
            const countSpan = document.getElementById(`count-${id}`);
            if (countSpan) {
                countSpan.innerHTML = `�8�9�1�5 ${nuevoValor} descargas`;
            }
        }
    } catch (err) {
        console.warn('No se pudo actualizar contador:', err);
    }
    
    // Iniciar descarga
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}