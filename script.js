// Configuracionn DEL SCRIPT DE GOOGLE
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzptMLUD8-dtZrFk8I9GLczL_CwxXDaAUQ9ElAHwB6k4TnnKk_bZ9OtoRAVrvsIGye8/exec';


document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado correctamente');
    
    const menuBtn = document.getElementById('menuToggle');
    const side = document.getElementById('sidebar');

    if (menuBtn && side) {
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            side.classList.toggle('open');
        });

        document.addEventListener('click', function(e) {
            if (side.classList.contains('open') && !side.contains(e.target) && e.target !== menuBtn) {
                side.classList.remove('open');
            }
        });
    }

    loadApps();
});

async function loadApps() {
    const grid = document.getElementById('appsContainer');
    if (!grid) {
        console.error('No se encontró el contenedor appsContainer');
        return;
    }
    
    console.log('Cargando aplicaciones...');
    
    try {
        const res = await fetch('apps.json');
        if (!res.ok) throw new Error('No se pudo cargar apps.json: ' + res.status);
        const data = await res.json();
        console.log('Apps cargadas:', data.length);
        
        grid.innerHTML = '';
        
        for (let i = 0; i < data.length; i++) {
            const app = data[i];
            
            let descargas = 0;
            try {
                descargas = await getDownloadCount(app.id);
                console.log('Contador para', app.id, ':', descargas);
            } catch (err) {
                console.warn('No se pudo obtener contador para', app.id, err);
            }
            
            const card = document.createElement('div');
            card.className = 'app-card';
            
            let iconoHtml = '';
            if (app.iconoUrl && app.iconoUrl.trim() !== '') {
                iconoHtml = '<img src="' + escapeHtml(app.iconoUrl) + '" alt="' + escapeHtml(app.nombre) + '" class="app-icon-img" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'block\';">' +
                           '<div style="font-size: 2.5rem; margin-bottom: 1rem; display: none;">' + (app.iconoEmoji || '⚙️') + '</div>';
            } else {
                iconoHtml = '<div style="font-size: 2.5rem; margin-bottom: 1rem;">' + (app.iconoEmoji || '⚙️') + '</div>';
            }
            
            card.innerHTML = 
                '<div class="card-info">' +
                    iconoHtml +
                    '<h3>' + escapeHtml(app.nombre) + '</h3>' +
                    '<p>' + escapeHtml(app.descripcion) + '</p>' +
                    '<div class="card-meta">' +
                        '<span class="size-tag">📦 ' + escapeHtml(app.tamaño) + '</span>' +
                        '<span class="download-count" id="count-' + app.id + '">⬇️ ' + descargas + ' descargas</span>' +
                    '</div>' +
                '</div>' +
                '<button class="btn-dl" data-id="' + escapeHtml(app.id) + '" data-url="' + escapeHtml(app.urlDescarga) + '">' +
                    '⛓️ Descargar' +
                '</button>';
            
            grid.appendChild(card);
        }
        
        const buttons = document.querySelectorAll('.btn-dl');
        for (let i = 0; i < buttons.length; i++) {
            const btn = buttons[i];
            btn.addEventListener('click', function(e) {
                const id = btn.getAttribute('data-id');
                const url = btn.getAttribute('data-url');
                handleDl(id, url);
            });
        }
        
        console.log('Apps renderizadas correctamente');
        
    } catch (err) {
        console.error('Error en loadApps:', err);
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 2rem;">⚠️ Error: ' + escapeHtml(err.message) + '</p>';
    }
}

async function getDownloadCount(appId) {
    try {
        // URL del Google Apps Script
        const url = SCRIPT_URL + '?app=' + encodeURIComponent(appId) + '&mode=get&t=' + Date.now();
        
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
        });
        
        if (!response.ok) throw new Error('HTTP error ' + response.status);
        const count = await response.text();
        
        // Verificar si es un número válido
        const numCount = parseInt(count);
        if (isNaN(numCount)) {
            console.warn('Respuesta no numérica:', count);
            return 0;
        }
        
        console.log('Contador recibido para', appId, ':', numCount);
        return numCount;
    } catch (error) {
        console.error('Error al obtener contador:', error);
        return 0;
    }
}

async function incrementarContador(appId) {
    try {
        const url = SCRIPT_URL + '?app=' + encodeURIComponent(appId) + '&mode=inc&t=' + Date.now();
        
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
            cache: 'no-cache'
        });
        
        if (!response.ok) throw new Error('HTTP error ' + response.status);
        const newCount = await response.text();
        
        const numCount = parseInt(newCount);
        if (isNaN(numCount)) {
            console.warn('Respuesta no numérica al incrementar:', newCount);
            return null;
        }
        
        console.log('Nuevo contador para', appId, ':', numCount);
        return numCount;
    } catch (error) {
        console.error('Error al incrementar contador:', error);
        return null;
    }
}

async function handleDl(id, url) {
    console.log('Descargando:', id, url);
    
    const nuevoValor = await incrementarContador(id);
    
    if (nuevoValor !== null && nuevoValor !== undefined) {
        const countSpan = document.getElementById('count-' + id);
        if (countSpan) {
            countSpan.innerHTML = '⬇️ ' + nuevoValor + ' descargas';
            console.log('Contador actualizado en pantalla:', nuevoValor);
        } else {
            console.warn('No se encontró el elemento count-' + id);
        }
    } else {
        console.warn('No se pudo obtener el nuevo valor del contador');
        const contadorActual = await getDownloadCount(id);
        const countSpan = document.getElementById('count-' + id);
        if (countSpan) {
            countSpan.innerHTML = '⬇️ ' + contadorActual + ' descargas';
        }
    }
    
    // Iniciar la descarga
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