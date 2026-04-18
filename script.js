// Configuracionn DEL SCRIPT DE GOOGLE
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzI8xdX1RDMHa3Dy86UK410123d2gEyZgWnuEhL0jpFiRL9DN8S55QCqVNO4glTXtEU/exec';


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
        
        // Cargar contadores desde localStorage primero
        for (let i = 0; i < data.length; i++) {
            const app = data[i];
            let descargas = 0;
            
            // Intentar obtener contador guardado localmente
            const savedCount = localStorage.getItem('count_' + app.id);
            if (savedCount) {
                descargas = parseInt(savedCount);
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
        const url = SCRIPT_URL + '?app=' + encodeURIComponent(appId) + '&mode=get&t=' + Date.now();
        
        // Usar modo no-cors - no podemos leer respuesta pero al menos se envía
        await fetch(url, { mode: 'no-cors' });
        
        // Retornar el valor guardado en localStorage
        const saved = localStorage.getItem('count_' + appId);
        return saved ? parseInt(saved) : 0;
        
    } catch (error) {
        console.error('Error al obtener contador:', error);
        const saved = localStorage.getItem('count_' + appId);
        return saved ? parseInt(saved) : 0;
    }
}

async function incrementarContador(appId) {
    try {
        const url = SCRIPT_URL + '?app=' + encodeURIComponent(appId) + '&mode=inc&t=' + Date.now();
        
        // Enviar la petición en segundo plano (no esperamos respuesta)
        fetch(url, { mode: 'no-cors' }).catch(e => console.log('Error en fetch:', e));
        
        // Incrementar localmente
        const current = localStorage.getItem('count_' + appId);
        const newCount = (current ? parseInt(current) : 0) + 1;
        localStorage.setItem('count_' + appId, newCount);
        
        console.log('Contador incrementado localmente:', appId, newCount);
        return newCount;
        
    } catch (error) {
        console.error('Error al incrementar contador:', error);
        // Fallback: solo incrementar localmente
        const current = localStorage.getItem('count_' + appId);
        const newCount = (current ? parseInt(current) : 0) + 1;
        localStorage.setItem('count_' + appId, newCount);
        return newCount;
    }
}

async function handleDl(id, url) {
    console.log('Descargando:', id, url);
    
    // Incrementar contador y actualizar UI
    const nuevoValor = await incrementarContador(id);
    
    const countSpan = document.getElementById('count-' + id);
    if (countSpan && nuevoValor !== null) {
        countSpan.innerHTML = '⬇️ ' + nuevoValor + ' descargas';
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