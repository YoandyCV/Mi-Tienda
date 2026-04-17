// Configuración - PON AQUÍ TU URL DEL SCRIPT DE GOOGLE
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxBskl3naxAYg_xLfL02_gjSwBZAMI_9FeRrxuH7ne_eP8jTlMk-SEmVJDtuYDUJegR/exec'; // ⬅️ PEGA TU URL AQUÍ.

document.addEventListener('DOMContentLoaded', () => {
    // Menu Logic
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
        const data = await res.json();
        
        // Obtener contadores desde Google Sheets
        const contadores = await obtenerContadores();
        
        grid.innerHTML = '';
        data.forEach(app => {
            const descargas = contadores[app.id] || 0;
            const card = document.createElement('div');
            card.className = 'app-card';
            card.innerHTML = `
                <div class="card-info">
                    <div style="font-size: 2.5rem; margin-bottom: 1rem;">${app.iconoEmoji || '⚙️'}</div>
                    <h3>${escapeHtml(app.nombre)}</h3>
                    <p>${escapeHtml(app.descripcion)}</p>
                    <div class="card-meta">
                        <span class="size-tag">📦 ${app.tamaño}</span>
                        <span class="download-count" id="count-${app.id}">⬇️ ${descargas} descargas</span>
                    </div>
                </div>
                <button class="btn-dl" onclick="handleDl('${app.id}', '${app.urlDescarga}')">
                    ⛓️ Descargar
                </button>
            `;
            grid.appendChild(card);
        });
    } catch (err) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align:center; padding: 2rem;">⚠️ No se pudo conectar con el servidor de aplicaciones.</p>`;
        console.error('Error loading apps:', err);
    }
}

// Obtener contadores desde Google Sheets
async function obtenerContadores() {
    try {
        const url = `${SCRIPT_URL}?action=get`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Error en la petición');
        const data = await res.json();
        return data;
    } catch (error) {
        console.warn('No se pudo obtener contadores desde Google Sheets:', error);
        return {}; // Devuelve objeto vacío si falla
    }
}

// Incrementar contador en Google Sheets
async function incrementarContador(appId) {
    try {
        const url = `${SCRIPT_URL}?action=increment&appId=${encodeURIComponent(appId)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Error al incrementar');
        const data = await res.json();
        return data.success ? data.newValue : null;
    } catch (error) {
        console.error('Error al incrementar contador:', error);
        return null;
    }
}

// Manejador de descarga (ahora con contador)
window.handleDl = async function(id, url) {
    // Incrementar contador en Google Sheets
    const nuevoValor = await incrementarContador(id);
    
    // Actualizar el número en la interfaz
    if (nuevoValor !== null) {
        const countSpan = document.getElementById(`count-${id}`);
        if (countSpan) {
            countSpan.innerHTML = `⬇️ ${nuevoValor} descargas`;
        }
    }
    
    // Iniciar descarga
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}