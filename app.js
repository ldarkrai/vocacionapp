document.addEventListener('DOMContentLoaded', () => {

  function applyGlobalTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light'; 
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }
  applyGlobalTheme();

  const feedElement = document.getElementById("feed");
  const usuarioLogueado = localStorage.getItem("usuario");

  // 1. Verificar si el usuario ha iniciado sesión
  if (!usuarioLogueado && !window.location.pathname.endsWith('index.html')) { 
    window.location.href = 'index.html';
    return; // Detener la ejecución del script si no hay usuario
  }



  const navbarUserControls = document.getElementById('navbarUserControls');
  if (navbarUserControls && usuarioLogueado) { 
    navbarUserControls.innerHTML = `
      <div class="user-menu-container">
        <span id="userProfileName" class="user-menu-trigger" title="Usuario">👤 ${usuarioLogueado}</span>
        <div class="user-menu-dropdown">
          <a href="profile.html" title="Configuración">⚙️ Configuración</a>
          <a href="#" id="logoutButtonDropdown" title="Cerrar Sesión">↪️ Cerrar Sesión</a>
        </div>
      </div>
    `;

    const logoutButton = document.getElementById('logoutButtonDropdown'); 
    if (logoutButton) {
      logoutButton.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('usuario');
        localStorage.removeItem('isAdmin'); 

        window.location.href = 'index.html';
      });
    }
  }

  if (feedElement && window.location.pathname.includes('feed.html')) {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    // Mensajes predefinidos para el prototipo
    let mensajesPredefinidos = [ 
      {
        id: "msg_kaleth_01", 
        usuario: "Kaleth",
        texto: "Al principio estaba nervioso por elegir mi carrera, pero hablar con profesionales y explorar diferentes opciones realmente me ayudó a encontrar mi camino. ¡No tengan miedo de pedir ayuda!",
        timestamp: new Date("2024-05-26T10:00:00Z").toISOString() 
      },
      {
        id: "msg_linda_01", 
        usuario: "Linda",
        texto: "Descubrí mi pasión por la ingeniería participando en un club de robótica. Las actividades extracurriculares pueden ser una gran fuente de inspiración.",
        timestamp: new Date("2024-05-26T11:00:00Z").toISOString() 
      },
      {
        id: "msg_luis_01", 
        usuario: "Luis",
        texto: "Aún no estoy 100% seguro, ¡y eso está bien! Estoy usando los recursos de la universidad para aprender sobre diferentes campos. Cada paso es un aprendizaje.",
        timestamp: new Date("2024-05-26T12:00:00Z").toISOString() 
      }
    ];

    function cargarTestimonios() {
      if (!feedElement) {
        console.error("Error: Elemento con id 'feed' no encontrado.");
        return;
      }
      feedElement.innerHTML = ""; 


      const currentPredefined = JSON.parse(JSON.stringify(mensajesPredefinidos));
      const currentLocal = JSON.parse(JSON.stringify(JSON.parse(localStorage.getItem("testimonios")) || []));
      
      console.log('[cargarTestimonios] Inicio. Predefinidos:', currentPredefined);
      console.log('[cargarTestimonios] Inicio. Locales (de localStorage):', currentLocal);
      
      const todosLosMensajes = [...mensajesPredefinidos, ...(JSON.parse(localStorage.getItem("testimonios")) || [])];
      
      console.log('[cargarTestimonios] Combinados para renderizar:', JSON.parse(JSON.stringify(todosLosMensajes)));



      todosLosMensajes.sort((a, b) => {
        const dateA = a.timestamp ? new Date(a.timestamp) : 0;
        const dateB = b.timestamp ? new Date(b.timestamp) : 0;
        return dateA - dateB;
      });


      todosLosMensajes.forEach(data => {
        const esPredefinido = mensajesPredefinidos.some(m => m.id === data.id); 
        const mensajeClass = esPredefinido ? 'mensaje-predefinido' : 'mensaje-local';
        
        let adminControls = '';
        if (isAdmin) {
          adminControls = `<span class="delete-icon" title="Eliminar comentario" onclick="eliminarComentario('${data.id}', ${esPredefinido})">🗑️</span>`;
        }

        const card = `
          <div class="mensaje ${mensajeClass}" data-id="${data.id}">
            <p>${data.texto}</p>
            <div class="mensaje-footer">
              <small>— ${data.usuario}</small>
              <div class="mensaje-actions">
                ${adminControls}
                <span class="report-flag" title="Reportar comentario" onclick="reportarComentario('${data.id}')">🚩</span>
              </div>
            </div>
          </div>
        `;
        feedElement.innerHTML += card;
      });
    }

    cargarTestimonios();

    window.publicar = function() {
      const textoInput = document.getElementById("mensaje");
      
      if (!textoInput) {
          console.error("Error Crítico: Textarea con id 'mensaje' no fue encontrado en el DOM.");
          alert("Error: No se pudo encontrar el campo de mensaje.");
          return;
      }
      
      const texto = textoInput.value.trim();
      
      if (texto.length === 0) {
        alert("Escribe algo antes de publicar.");
        return;
      }

      const testimoniosGuardados = JSON.parse(localStorage.getItem("testimonios")) || [];
      const nuevoTestimonio = {
        id: `local_${new Date().getTime()}`,
        usuario: usuarioLogueado,
        texto: texto,
        timestamp: new Date().toISOString()
      };

      testimoniosGuardados.push(nuevoTestimonio);
      localStorage.setItem("testimonios", JSON.stringify(testimoniosGuardados));

      textoInput.value = ""; 
      cargarTestimonios(); 
      
      console.log("Publicación guardada en localStorage y feed actualizado.");
    };


    window.reportarComentario = function(mensajeId) {

      console.log(`Reportando comentario con ID: ${mensajeId}`);
      alert(`El comentario ha sido reportado.\nGracias por ayudar a mantener la comunidad segura.`);
      
      const reportedFlag = document.querySelector(`.mensaje[data-id="${mensajeId}"] .report-flag`);
      if (reportedFlag) {
        reportedFlag.style.color = 'var(--color-text-light)';
        reportedFlag.style.cursor = 'default';
        reportedFlag.onclick = null; 
        reportedFlag.title = 'Comentario reportado';
      }
    };

    // Función para eliminar un comentario
    window.eliminarComentario = function(mensajeId, esPredefinidoFlag) {
      if (!isAdmin) {
        alert('Acción no permitida.');
        return;
      }

      if (confirm('¿Estás seguro de que quieres eliminar este comentario? Esta acción no se puede deshacer.')) {
        console.log(`[eliminarComentario] Intentando eliminar: ID=${mensajeId}, EsPredefinido=${esPredefinidoFlag}`);
        console.log('[eliminarComentario] Antes - mensajesPredefinidos:', JSON.parse(JSON.stringify(mensajesPredefinidos)));
        let testimoniosAntes = JSON.parse(localStorage.getItem("testimonios")) || [];
        console.log('[eliminarComentario] Antes - testimoniosGuardados (localStorage):', JSON.parse(JSON.stringify(testimoniosAntes)));

        if (esPredefinidoFlag) {
          mensajesPredefinidos = mensajesPredefinidos.filter(msg => {
            return msg.id !== mensajeId;
          });
          console.log('[eliminarComentario] Después (predefinido) - mensajesPredefinidos:', JSON.parse(JSON.stringify(mensajesPredefinidos)));
        } else {
          let testimoniosGuardados = JSON.parse(localStorage.getItem("testimonios")) || [];
          testimoniosGuardados = testimoniosGuardados.filter(testimonio => {
            return testimonio.id !== mensajeId;
          });
          localStorage.setItem("testimonios", JSON.stringify(testimoniosGuardados));
          let testimoniosDespues = JSON.parse(localStorage.getItem("testimonios")) || [];
          console.log('[eliminarComentario] Después (local) - testimoniosGuardados (localStorage):', JSON.parse(JSON.stringify(testimoniosDespues)));
        }
        
        cargarTestimonios(); 
        alert('Comentario eliminado.');
      }
    };

  }
});