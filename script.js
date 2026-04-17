// Configuracionn DEL SCRIPT DE GOOGLE
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwAMY5zZruBYsMlCi-EgBqDBpAc2IBqmf8IkqAnn2Lih0BBWcdaL2ZNxF9V-dNJaHT3/exec';



document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM cargado correctamente');
    
    // Menu Logic
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

    // Cargar apps inmediatamente
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
        // 1. Cargar apps.json
        const res = await fetch('apps.json');
        if (!res.ok) throw new Error('No se pudo cargar apps.json: ' + res.status);
        const data = await res.json();
        console.log('Apps cargadas:', data.length);
        
        // 2. Intentar obtener contadores (si falla, sigue sin contadores)
        let contadores = {};
        try {
            contadores = await obtenerContadores();
            console.log('Contadores cargados:', contadores);
        } catch (err) {
            console.warn('Contadores no disponibles:', err.message);
        }
        
        // 3. Limpiar y construir grid
        grid.innerHTML = '';
        
        for (let i = 0; i < data.length; i++) {
            const app = data[i];
            const descargas = contadores[app.id] || 0;
            const card = document.createElement('div');
            card.className = 'app-card';
            
            // Generar icono - VERSIÓN CORREGIDA (sin template strings anidados problemáticos)
            let iconoHtml = '';
            if (app.iconoUrl && app.iconoUrl.trim() !== '') {
                iconoHtml = '<img src="' + app.iconoUrl + '" alt="' + this.escapeHtml(app.nombre) + '" class="app-icon-img" onerror="this.style.display=\'none\'; this.nextElementSibling.style.display=\'block\';">' +
                           '<div style="font-size: 2.5rem; margin-bottom: 1rem; display: none;">' + (app.iconoEmoji || '⚙️') + '</div>';
            } else {
                iconoHtml = '<div style="font-size: 2.5rem; margin-bottom: 1rem;">' + (app.iconoEmoji || '⚙️') + '</div>';
            }
            
            // Construir el HTML de la tarjeta - VERSIÓN SIMPLIFICADA SIN ERRORES
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
        
        // 4. Agregar event listeners a los botones
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

async function obtenerContadores() {
    const url = SCRIPT_URL + '?action=get';
    console.log('Consultando contadores:', url);
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    return data;
}

async function incrementarContador(appId) {
    const url = SCRIPT_URL + '?action=increment&appId=' + encodeURIComponent(appId);
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    return data.success ? data.newValue : null;
}

async function handleDl(id, url) {
    console.log('Descargando:', id, url);
    try {
        const nuevoValor = await incrementarContador(id);
        if (nuevoValor !== null) {
            const countSpan = document.getElementById('count-' + id);
            if (countSpan) {
                countSpan.innerHTML = '⬇️ ' + nuevoValor + ' descargas';
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