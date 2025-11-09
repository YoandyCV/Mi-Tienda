function openNav() {
    document.getElementById("mySidenav").style.width = "250px";
    document.getElementById("app-container").style.marginLeft = "250px";
}

function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    document.getElementById("app-container").style.marginLeft = "0";
}

// Cargar aplicaciones desde el archivo apps.txt
async function loadApps() {
    const appContainer = document.getElementById('app-container');
    appContainer.classList.add('app-container');
    try {
        const response = await fetch('apps.txt');
        const data = await response.text();
        const lines = data.split('\n');
        for (let i = 0; i < lines.length; i += 5) {
            const title = lines[i].trim();
            const description = lines[i + 1].trim();
            const link = lines[i + 2].trim();
            const icon = lines[i + 3].trim();
            const fileSize = lines[i + 4].trim();
            if (title && description && link && icon && fileSize) {
                const appCard = document.createElement('div');
                appCard.className = 'app-card';
                appCard.innerHTML = `
                    <img src="${icon}" alt="${title}" class="app-icon" loading="lazy" onerror="this.src='recursos/faltante.png';">
                    <h2>${title}</h2>
                    <button class="expandir-btn">➕ Expandir para ver más</button>
                    <div class="description-container">
                        <p class="app-description">${description}</p>
                    </div>
                    <p><strong>📦 Tamaño:</strong> ${fileSize}</p>
                    <div class="descarga-contador">⬇️ Descargas: <span class="contador" data-app="${title}">0</span></div>
                    <a href="${lines[i+2].trim()}" class="download-button" data-app="${title}">⛓️ Descargar</a>
                `;
                appContainer.appendChild(appCard);
            }
        }
    } catch (error) {
        console.error('Error al cargar las aplicaciones:', error);
    }
}

// Scroll optimizado con debounce
let isScrolling;
window.addEventListener('scroll', function() {
    window.clearTimeout(isScrolling);
    
    isScrolling = setTimeout(function() {
        const header = document.querySelector('.header');
        const footer = document.querySelector('.footer');
        
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
            footer.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
            footer.classList.remove('scrolled');
        }
    }, 66);
}, false);

window.addEventListener('scroll', function() {
    const footer = document.querySelector('.footer');
    const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 10;
    
    if (isAtBottom) {
        footer.classList.add('expanded');
    } else {
        footer.classList.remove('expanded');
    }
});

// Evento para los botones de expandir
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('expandir-btn')) {
        const card = e.target.closest('.app-card');
        const description = card.querySelector('.description-container');
        const btn = e.target;

        description.classList.toggle('expanded');
        btn.textContent = description.classList.contains('expanded') 
            ? '➖ Ocultar' 
            : '➕ Expandir para ver más';
    }
});

// Función para manejar descargas
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('download-button')) {
    e.preventDefault();
    const appName = e.target.getAttribute('data-app');
    const downloadUrl = e.target.getAttribute('href');
    
    const downloadConfirmed = await showDownloadModal(downloadUrl, appName);
    
    if (downloadConfirmed) {
      window.location.href = downloadUrl;
    }
  }
});

// Función para mostrar el modal de descarga
async function showDownloadModal(downloadUrl, appName) {
    return new Promise((resolve) => {
        const modal = document.getElementById('descargaModal');
        const countdown = document.getElementById('countdown');
        const progress = document.querySelector('.descarga-pross');
        
        modal.style.display = 'block';
        progress.style.width = '0%';
        
        let seconds = 5;
        countdown.textContent = seconds;
        
        const timer = setInterval(() => {
            seconds--;
            countdown.textContent = seconds;
            
            progress.style.width = `${100 - (seconds * 20)}%`;
            
            if (seconds <= 0) {
                clearInterval(timer);
                progress.style.width = '100%';
                setTimeout(async () => {
                    modal.style.display = 'none';
                    
                    // SOLO AQUÍ SE ACTUALIZA EL CONTADOR - cuando realmente se descarga
                    await updateDownloadCount(appName);
                    resolve(true);
                }, 600);
            }
        }, 1000);
        
        document.querySelector('.close-modal').onclick = () => {
            clearInterval(timer);
            modal.style.display = 'none';
            resolve(false);
        };
    });
}

// Modal de entrada
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('entrada-modal');
    const btnCerrar = document.querySelector('.entrada-cerrar');
  
    if (!localStorage.getItem('modalVisto')) {
      setTimeout(() => {
        modal.style.display = 'flex';
      }, 3000);
    }
  
    btnCerrar.addEventListener('click', () => {
      modal.style.display = 'none';
      localStorage.setItem('modalVisto', 'true');
    });
  
    document.querySelectorAll('.entrada-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.style.display = 'none';
        localStorage.setItem('modalVisto', 'true');
      });
    });
});

// Configuración de Google Apps Script
const SHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwrLsJhrrps_-BzzKUfII7vcEwYK3Zk4uaqUmTugxswKoC_qBgTBV2loWLT2UTnN37f/exec";

// FUNCIÓN CORREGIDA: Solo incrementa cuando hay descarga real
async function updateDownloadCount(appName) {
    try {
        console.log(`🔄 Actualizando contador para: ${appName}`);
        const url = `${SHEET_SCRIPT_URL}?app=${encodeURIComponent(appName)}&mode=inc`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const newCount = await response.text();
        console.log(`✅ Contador actualizado: ${appName} = ${newCount}`);
        
        // Actualizar TODOS los contadores con el mismo nombre de app
        document.querySelectorAll(`.contador[data-app="${appName}"]`).forEach(el => {
            el.textContent = newCount;
        });
        
        return newCount;
    } catch (error) {
        console.error("❌ Error al actualizar contador:", error);
        // Mostrar error al usuario
        document.querySelectorAll(`.contador[data-app="${appName}"]`).forEach(el => {
            el.textContent = "Error";
        });
    }
}

// FUNCIÓN CORREGIDA: Solo lectura, nunca incrementa
async function getDownloadCount(appName) { 
    try {
        console.log(`📊 Obteniendo contador para: ${appName}`);
        const url = `${SHEET_SCRIPT_URL}?app=${encodeURIComponent(appName)}&mode=get&t=${Date.now()}`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const count = await response.text();
        console.log(`📈 Contador obtenido: ${appName} = ${count}`);
        
        // Validar que sea un número
        if (!isNaN(count) && count.trim() !== '') {
            return count;
        } else {
            console.warn(`⚠️ Contador inválido para ${appName}:`, count);
            return "0";
        }
    } catch (error) {
        console.error("❌ Error al obtener contador:", error);
        return "0"; // Valor por defecto
    }
}

// FUNCIÓN CORREGIDA: Carga inicial SIN duplicaciones
async function loadInitialCounters() {
    try {
        console.log("🔄 Iniciando carga de contadores...");
        const counters = document.querySelectorAll('.contador');
        
        console.log(`📊 Encontrados ${counters.length} contadores`);
        
        // Usar Promise.all para cargar todos simultáneamente
        const promises = Array.from(counters).map(async (counter) => {
            const appName = counter.getAttribute('data-app');
            if (appName) {
                const currentCount = await getDownloadCount(appName);
                counter.textContent = currentCount;
                console.log(`✅ Contador cargado: ${appName} = ${currentCount}`);
            }
        });
        
        await Promise.all(promises);
        console.log("🎯 Todos los contadores cargados correctamente");
        
    } catch (error) {
        console.error("❌ Error en carga inicial de contadores:", error);
    }
}

// CARGA OPTIMIZADA Y CORREGIDA
document.addEventListener('DOMContentLoaded', function() {
    console.log("🚀 Iniciando carga de la aplicación...");
    
    // 1. Primero cargar las apps (estructura visual)
    loadApps();
    
    // 2. Esperar a que el DOM esté completamente listo para los contadores
    if (document.readyState === 'complete') {
        console.log("📄 DOM ya completo, cargando contadores...");
        loadInitialCounters();
    } else {
        console.log("⏳ Esperando carga completa del DOM...");
        window.addEventListener('load', function() {
            console.log("📄 DOM completamente cargado, cargando contadores...");
            // Pequeño delay para asegurar que las tarjetas se rendericen
            setTimeout(loadInitialCounters, 500);
        });
    }
});

// Medición de performance y debug
window.addEventListener('load', function() {
    setTimeout(() => {
        if (performance.timing.loadEventEnd > 0) {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            console.log('🚀 Tiempo de carga total:', loadTime + 'ms');
        }
        
        // Debug: verificar contadores en consola
        const counters = document.querySelectorAll('.contador');
        console.log(`🔍 Estado final - Contadores encontrados: ${counters.length}`);
        counters.forEach(counter => {
            console.log(`📱 ${counter.getAttribute('data-app')}: ${counter.textContent}`);
        });
    }, 1000);
});