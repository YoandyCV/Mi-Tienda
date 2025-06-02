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
                        <img src="${icon}" alt="${title}" class="app-icon">
                        <h2>${title}</h2>
                        <button class="expandir-btn">➕ Expandir para ver más</button>
                        <div class="description-container">
                            <p class="app-description">${description}</p>
                        </div>
                        <!--Aqui cerramos expancion-->
                        <p><strong>📦 Tamaño:</strong> ${fileSize}</p>
                        
                        <!--Aqui controlamos las descargas-->
                        <div class="descarga-contador">⬇️ Descargas: <span class="contador" data-app="${title}">0</span></div> <!-- aqui controlamos el contador en html-->
                        <a href="${link}" class="download-button" data-app="${title}">⛓️ Descargar</a>
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
    window.addEventListener('scroll', function() {
        const header = document.querySelector('.header');
        const footer = document.querySelector('.footer');
        
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
            footer.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
            footer.classList.remove('scrolled');
        }
    });

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
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('download-button')) {
            e.preventDefault();
            const appName = e.target.getAttribute('data-app');
            showDownloadModal(e.target.getAttribute('href')); // Muestra el modal de descarga
            updateDownloadCount(appName); // Actualiza Firebase
        }
    });
    
    // Función para mostrar el modal y contar 5 segundos
    function showDownloadModal(downloadUrl) {
        const modal = document.getElementById('descargaModal');
        const countdown = document.getElementById('countdown');
        const progress = document.querySelector('.descarga-pross');
        
        modal.style.display = 'block';
        progress.style.width = '0%'; // Reinicia la barra
        
        let seconds = 5;
        countdown.textContent = seconds;
        
        // Temporizador
        const timer = setInterval(() => {
            seconds--;
            countdown.textContent = seconds;
            
            if (seconds <= 0) {
                clearInterval(timer);
                progress.style.width = '100%';
                setTimeout(() => {
                    modal.style.display = 'none'; 
                    window.location.href = downloadUrl; // Inicia la descarga
                }, 600); // ydc controlo aqui el tiempo
            }
        }, 1000);
        
        // Cerrar modal manualmente
        document.querySelector('.close-modal').onclick = () => {
            clearInterval(timer);
            modal.style.display = 'none';
            };
    }

    // Configuración de Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyCYEM1q4F3jYZDuVPeNOhvILy6A5jXoi6o",
        authDomain: "contador-descargas-web.firebaseapp.com",
        databaseURL: "https://contador-descargas-web-default-rtdb.firebaseio.com",
        projectId: "contador-descargas-web",
        storageBucket: "contador-descargas-web.firebasestorage.app",
        messagingSenderId: "933872822908",
        appId: "1:933872822908:web:6481ae71b4207b1bed77f9"
    };
    
    // logica para iniciar en firabase es de google ydc y lo mejor gratuito
    firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    
    // Función para actualizar contadores
    function updateDownloadCount(appName) {
        const counterRef = database.ref('downloads/' + appName);
        counterRef.transaction((currentCount) => {
            return (currentCount || 0) + 1;
        });
    }
    
    // Escucha cambios en los contadores
    function setupCounters() {
        const countersRef = database.ref('downloads');
        countersRef.on('value', (snapshot) => {
            const data = snapshot.val();
            document.querySelectorAll('.contador').forEach(el => {
                const appName = el.getAttribute('data-app');
                el.textContent = data[appName] || 0;
            });
        });
    }

    // YDC unifique la carga de las card y del cuenta descargas
    window.onload = () => {
        loadApps();
        setupCounters(); // Carga los contadores desde Firebase
    };