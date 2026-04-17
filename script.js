// Configuracionn DEL SCRIPT DE GOOGLE
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwQcxm00OkVnFX-wV1cGVjdgvtq96RBtWLVtwl2a81qw80qayvzZC7bZymOGfQqYa3g/exec';



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
                iconoHtml = '<img src="' + app.iconoUrl + '" alt="' + escapeHtml(app.nombre) + '" class="app-icon-img" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'block\';">' +
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
                        '<span class="size-tag">📦 ' + app.tamaño + '</span>' +
                        '<span class="download-count" id="count-' + app.id + '">⬇️ ' + descargas + ' descargas</span>' +
                    '</div>' +
                '</div>' +
                '<button class="btn-dl" data-id="' + app.id + '" data-url="' + app.urlDescarga + '">' +
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
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align:center; padding: 2rem;">⚠️ Error: ' + err.message + '</p>';
    }
}

async function getDownloadCount(appId) {
    try {
        // Usar proxy CORS para evitar el bloqueo
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const targetUrl = SCRIPT_URL + '?app=' + encodeURIComponent(appId) + '&mode=get&t=' + Date.now();
        const response = await fetch(proxyUrl + targetUrl);
        if (!response.ok) throw new Error('HTTP error ' + response.status);
        const count = await response.text();
        console.log('Contador recibido para', appId, ':', count);
        return parseInt(count) || 0;
    } catch (error) {
        console.error('Error al obtener contador:', error);
        return 0;
    }
}

async function incrementarContador(appId) {
    try {
        // Usar proxy CORS para evitar el bloqueo
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const targetUrl = SCRIPT_URL + '?app=' + encodeURIComponent(appId) + '&mode=inc&t=' + Date.now();
        const response = await fetch(proxyUrl + targetUrl);
        if (!response.ok) throw new Error('HTTP error ' + response.status);
        const newCount = await response.text();
        console.log('Nuevo contador para', appId, ':', newCount);
        return parseInt(newCount) || 0;
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