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
                const fileSize = lines[i + 4].trim(); // Obtener el tamaño desde la quinta línea
                if (title && description && link && icon && fileSize) {
                    const appCard = document.createElement('div');
                    appCard.className = 'app-card';
                    // Crear el contenido de la tarjeta de la aplicación

                    // aqui lo modifique para dar mejor apariencia
                    appCard.innerHTML = `
                        <img src="${icon}" alt="${title}" class="app-icon" onerror="this.src='recursos/faltante.png';">
                        <h2>${title}</h2>
                        <button class="expandir-btn">➕ Expandir para ver más</button>
                        <div class="description-container">
                            <p class="app-description">${description}</p>
                        </div>
                        <!--Aqui cerramos expancion-->
                        <p><strong>📦 Tamaño:</strong> ${fileSize}</p>
                        
                        <!--Aqui controlamos las descargas-->
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

    //yoandy de apartir de aqui hare modificaciones.. lo 
    // hare asi para intentar no tocar tus codigos a menos 
    // q o haga y si lo hago lo cometo
    //nueva funcion de scrow blur
    let isScrolling;
    window.addEventListener('scroll', function() {
        // Cancelar el timeout anterior
        window.clearTimeout(isScrolling);
        
        // Configurar un nuevo timeout
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
        }, 66); // Ejecuta cada ~66ms (15fps) en lugar de a cada evento
    }, false);

    window.addEventListener('scroll', function() {
        const footer = document.querySelector('.footer');
        // aqui ydc calculamos si estamos cerca del final)
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

    // Funcion para pasar a la pantalla de espera desde descarga y hace el conteo
    document.addEventListener('click', async (e) => {
      if (e.target.classList.contains('download-button')) {
        e.preventDefault();
        const appName = e.target.getAttribute('data-app');
        const downloadUrl = e.target.getAttribute('href');
        
        const downloadConfirmed = await showDownloadModal(downloadUrl, appName);
        
        if (downloadConfirmed) {
          // Solo redirigir para descargar si el usuario completó el proceso
          window.location.href = downloadUrl;
        }
      }
    });
    
    // Función para mostrar el modal y contar 5 segundos
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
            
            // Actualizar progreso visual
            progress.style.width = `${100 - (seconds * 20)}%`;
            
            if (seconds <= 0) {
                clearInterval(timer);
                progress.style.width = '100%';
                setTimeout(async () => {
                    modal.style.display = 'none';
                    
                    // ACTUALIZAR CONTADOR SOLO AQUÍ (cuando realmente se descarga)
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

  // Mostrar modal solo si es la primera vez
  document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('entrada-modal');
    const btnCerrar = document.querySelector('.entrada-cerrar');
  
    // Mostrar modal si es la primera vez
    if (!localStorage.getItem('modalVisto')) {
      setTimeout(() => {
        modal.style.display = 'flex';
      }, 3000);
    }
  
    // Cerrar modal al hacer clic en ✖
    btnCerrar.addEventListener('click', () => {
      modal.style.display = 'none';
      localStorage.setItem('modalVisto', 'true');
    });
  
    // Cerrar modal al compartir (WhatsApp/Telegram)
    document.querySelectorAll('.entrada-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.style.display = 'none';
        localStorage.setItem('modalVisto', 'true');
      });
    });
  });
    
  // configuración de Google Apps Script
  const SHEET_SCRIPT_URL = "https://docs.google.com/spreadsheets/d/1HnwORWzNcut9Pn4j4p6JIajXM7mfvS6zpZ9S_C7NS5k/edit?usp=drivesdk"; // yoandy aqui cambiamos la url por la q crearas mas adelante.. si quieres!
  
  async function updateDownloadCount(appName) { // esta funcion actualiza el contador de descargas
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
      return "0"; // Valor por defecto
    }
  }
  
  // yoandy esta funcion carga el contador de descarga de las aplicaciones al iniciar
  // es >> (solo lectura)
  async function loadInitialCounters() {
    const counters = document.querySelectorAll('.contador');
    
    for (const counter of counters) {
      const appName = counter.getAttribute('data-app');
      const currentCount = await getDownloadCount(appName); // aqui solo hacemos lectura sino lo cuenta la lectura como descarga osea cada vez q cargue la pagina cuenta una descarga y no queremos esto
      counter.textContent = currentCount;
    }
  }
  
  // Cargar aplicaciones y contadores al iniciar la página
  window.onload = async () => {
    loadApps(); // Carga las tarjetas de apps (como ante lo tenias pero lo unifique)
    
    // Espera 500ms para asegurar que las tarjetas se hayan renderizado
    setTimeout(() => {
      loadInitialCounters(); // Carga los contadores de cada targeta sin incrementar el contador de descargas
    }, 2000); // lo se ! > le di tiempo y es para q las personas con 2g le de tiempo arenderizar el conteo cuando se renderise las cartas
  };