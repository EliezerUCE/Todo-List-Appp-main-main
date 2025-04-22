document.addEventListener('DOMContentLoaded', () => {
  console.log("Aplicando corrección para almacenamiento de datos de usuario");
  
  // Sobrescribir la función saveUserData 
  window.saveUserData = function() {
    const currentUser = loadSession();
    if (currentUser && currentUser.username) {
      // Guarda las tareas con la clave correcta
      localStorage.setItem(`easytasks_tasks_${currentUser.username}`, JSON.stringify(window.tasks || []));
      // Guarda las categorías con la clave correcta
      localStorage.setItem(`easytasks_categories_${currentUser.username}`, JSON.stringify(window.categories || []));
      console.log(`Datos guardados para: ${currentUser.username} (${window.tasks?.length || 0} tareas)`);
    }
  };
  
  // Sobrescribir la función loadUserData para cargar correctamente los datos
  window.loadUserData = function(username) {
    if (!username) return;
    
    try {
      // Cargar categorías
      const storedCategories = localStorage.getItem(`easytasks_categories_${username}`);
      if (storedCategories) {
        window.categories = JSON.parse(storedCategories);
      }
      
      // Cargar tareas
      const storedTasks = localStorage.getItem(`easytasks_tasks_${username}`);
      if (storedTasks) {
        window.tasks = JSON.parse(storedTasks);
      }
      
      console.log(`Datos cargados correctamente para: ${username} (${window.tasks?.length || 0} tareas, ${window.categories?.length || 0} categorías)`);
    } catch (error) {
      console.error("Error al cargar datos de usuario:", error);
    }
  };
  
  // Sobrescribir setupStorageFunctions para que realmente reemplace las funciones de almacenamiento
  window.setupStorageFunctions = function(username) {
    if (!username) return;
    
    console.log(`Configurando funciones de almacenamiento para: ${username}`);
    
    // Sobrescribir saveLocal para usar el nombre de usuario
    window.saveLocal = function() {
      localStorage.setItem(`easytasks_tasks_${username}`, JSON.stringify(window.tasks || []));
      localStorage.setItem(`easytasks_categories_${username}`, JSON.stringify(window.categories || []));
      console.log(`Datos guardados para: ${username}`);
    };
    
    // Sobrescribir getLocal para usar el nombre de usuario
    window.getLocal = function() {
      try {
        const storedTasks = localStorage.getItem(`easytasks_tasks_${username}`);
        if (storedTasks) {
          window.tasks = JSON.parse(storedTasks);
        }
        
        const storedCategories = localStorage.getItem(`easytasks_categories_${username}`);
        if (storedCategories) {
          window.categories = JSON.parse(storedCategories);
        }
        
        console.log(`Datos cargados para: ${username}`);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };
  };
  
  // Función para cargar la sesión actual
  function loadSession() {
    try {
      const data = localStorage.getItem('easytasks_current_user');
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error al cargar la sesión:", error);
      return null;
    }
  }
  
  // Agregar un evento de guardado automático periódico
  setInterval(() => {
    const currentUser = loadSession();
    if (currentUser && currentUser.username) {
      window.saveUserData();
    }
  }, 30000); // Guardar cada 30 segundos
  
  // Agregar un evento para guardar cuando la ventana se cierre
  window.addEventListener('beforeunload', () => {
    const currentUser = loadSession();
    if (currentUser && currentUser.username) {
      window.saveUserData();
    }
  });
  
  // Modificar la función exitApp para guardar correctamente
  const originalExitApp = window.exitApp;
  if (typeof originalExitApp === 'function') {
    window.exitApp = function() {
      // Guardar antes de salir
      window.saveUserData();
      
      // Continuar con la función original
      originalExitApp();
    };
  }
  
  // Verificar si hay una sesión activa y aplicar las funciones
  const currentUser = loadSession();
  if (currentUser && currentUser.username) {
    console.log(`Corrección aplicada para usuario: ${currentUser.username}`);
    window.setupStorageFunctions(currentUser.username);
    window.getLocal(); // Cargar datos inmediatamente
  }

  
});
