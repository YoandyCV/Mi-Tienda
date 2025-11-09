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
                    <a href="${link}" class="download-button" data-app="${title}">⛓️ Descargar</a>
                `;
                appContainer.appendChild(appCard);
            }
        }
    } catch (error) {
        console.error('Error al cargar las aplicaciones:', error);
    }
}

// Scroll optimizado
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
    footer.classList.toggle('expanded', isAtBottom);
});

// Expandir descripción
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('expandir-btn')) {
        const card = e.target.closest('.app-card');
        const description = card.querySelector('.description-container');
        description.classList.toggle('expanded');
        e.target.textContent = description.classList.contains('expanded') ? '➖ Ocultar' : '➕ Expandir para ver más';
    }
});

// Modal de descarga
document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('download-button')) {
        e.preventDefault();
        const appName = e.target.getAttribute('data-app');
        const downloadUrl = e.target.getAttribute('href');
        const confirmed = await showDownloadModal(downloadUrl, appName);
        if (confirmed) {
            await updateDownloadCount(appName);
            window.location.href = downloadUrl;
        }
    }
});

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
                setTimeout(() => {
                    modal.style.display = 'none';
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

// Modal de bienvenida
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

// Contadores
const SHEET_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwrLsJhrrps_-BzzKUfII7vcEwYK3Zk4uaqUmTugxswKoC_qBgTBV2loWLT2UTnN37f/exec";

async function updateDownloadCount(appName) {
    try {
        const url = `${SHEET_SCRIPT_URL}?app=${encodeURIComponent(appName)}&mode=inc`;
        const response = await fetch(url);
        const newCount = await response.text();
        document.querySelectorAll(`.contador[data-app="${appName}"]`).forEach(el => {
            el.textContent = newCount;
        });
    } catch (error) {
        console.error("Error al actualizar contador:", error);
    }
}

async function getDownloadCount(appName) {
    try {
        const url = `${SHEET_SCRIPT_URL}?app=${encodeURIComponent(appName)}&mode=get&t=${Date.now()}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Error en la respuesta HTTP");
        return await response.text();
    } catch (error) {
        console.error("Error al obtener contador:", error);
        return "0";
    }
}

async function loadInitialCounters() {
    const counters = document.querySelectorAll('.contador');
    for (const counter of counters) {
        const appName = counter.getAttribute('data-app');
        const currentCount = await getDownloadCount(appName);
        counter.textContent = currentCount;
    }
}

// Inicialización corregida con render delay
document.addEventListener('DOMContentLoaded', async () => {
    await loadApps();
    requestAnimationFrame(() => {
        setTimeout(() => {
            loadInitialCounters();
        }, 300);
    });
});