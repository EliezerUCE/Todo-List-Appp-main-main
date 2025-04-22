// login.js - Script para manejo de autenticación en EasyTasks

// Variables globales
const authWrapper = document.querySelector('.auth-wrapper');
const loginScreen = document.querySelector('.login-screen');
const registerScreen = document.querySelector('.register-screen');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const gotoRegisterBtn = document.getElementById('goto-register');
const gotoLoginBtn = document.getElementById('goto-login');
const logoutBtn = document.querySelector('.logout-btn');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const userNameSpan = document.getElementById('user-name');

// Variables para los campos de formulario
const loginUsername = document.getElementById('login-username');
const loginPassword = document.getElementById('login-password');
const registerName = document.getElementById('register-name');
const registerUsername = document.getElementById('register-username');
const registerPassword = document.getElementById('register-password');
const registerConfirmPassword = document.getElementById('register-confirm-password');

// Estructura para almacenar usuarios
let users = [];

// Función para guardar usuarios en localStorage
const saveUsers = () => {
  localStorage.setItem('easytasks_users', JSON.stringify(users));
};

// Función para cargar usuarios desde localStorage
const loadUsers = () => {
  const storedUsers = localStorage.getItem('easytasks_users');
  if (storedUsers) {
    users = JSON.parse(storedUsers);
  }
};

// Función para guardar la sesión actual
const saveSession = (user) => {
  localStorage.setItem('easytasks_current_user', JSON.stringify(user));
};

// Función para cargar la sesión actual
const loadSession = () => {
  const currentUser = localStorage.getItem('easytasks_current_user');
  if (currentUser) {
    return JSON.parse(currentUser);
  }
  return null;
};

// Función para eliminar la sesión actual
const clearSession = () => {
  localStorage.removeItem('easytasks_current_user');
};

// Función para mostrar pantalla de login
const showLoginScreen = () => {
  loginScreen.classList.add('active');
  registerScreen.classList.remove('active');
  loginError.textContent = '';
  loginUsername.value = '';
  loginPassword.value = '';
};

// Función para mostrar pantalla de registro
const showRegisterScreen = () => {
  loginScreen.classList.remove('active');
  registerScreen.classList.add('active');
  registerError.textContent = '';
  registerName.value = '';
  registerUsername.value = '';
  registerPassword.value = '';
  registerConfirmPassword.value = '';
};

// Función para guardar las tareas y categorías del usuario actual
const saveUserData = () => {
  const currentUser = loadSession();
  if (currentUser) {
    localStorage.setItem(`easytasks_tasks_${currentUser.username}`, JSON.stringify(tasks));
    localStorage.setItem(`easytasks_categories_${currentUser.username}`, JSON.stringify(categories));
  }
};

// Función para entrar a la aplicación
const enterApp = (user) => {
  // Actualizar el nombre de usuario en la UI
  if (userNameSpan) {
    userNameSpan.textContent = user.name;
  }
  
  // Ocultar la pantalla de autenticación
  authWrapper.classList.add('hidden');
  
  // Cargar las categorías y tareas del usuario actual
  loadUserData(user.username);
  
  // Renderizar la interfaz de la aplicación
  renderCategories();
  updateTotals();
};

// Función para salir de la aplicación
const exitApp = () => {
  // Asegurarnos de guardar los datos del usuario antes de salir
  saveUserData();
  
  // Limpiar la sesión
  clearSession();
  
  // Mostrar la pantalla de autenticación
  authWrapper.classList.remove('hidden');
  showLoginScreen();
  
  // Limpiar categorías y tareas actuales
  categories = [];
  tasks = [];
};

// Función para validar y realizar login
const login = () => {
  const username = loginUsername.value.trim();
  const password = loginPassword.value;
  
  // Validación básica
  if (!username || !password) {
    loginError.textContent = 'Por favor completa todos los campos';
    return;
  }
  
  // Buscar el usuario
  const user = users.find(u => u.username === username);
  
  // Verificar si existe y la contraseña es correcta
  if (!user || user.password !== password) {
    loginError.textContent = 'Usuario o contraseña incorrectos';
    return;
  }
  
  // Guardar sesión y entrar a la app
  saveSession(user);
  enterApp(user);
};

// Función para validar y registrar nuevo usuario
const register = () => {
  const name = registerName.value.trim();
  const username = registerUsername.value.trim();
  const password = registerPassword.value;
  const confirmPassword = registerConfirmPassword.value;
  
  // Validaciones
  if (!name || !username || !password || !confirmPassword) {
    registerError.textContent = 'Por favor completa todos los campos';
    return;
  }
  
  if (password !== confirmPassword) {
    registerError.textContent = 'Las contraseñas no coinciden';
    return;
  }
  
  // Verificar si el usuario ya existe
  if (users.some(u => u.username === username)) {
    registerError.textContent = 'Este nombre de usuario ya está en uso';
    return;
  }
  
  // Crear nuevo usuario
  const newUser = {
    name,
    username,
    password,
    dateCreated: new Date().toISOString()
  };
  
  // Añadir a la lista y guardar
  users.push(newUser);
  saveUsers();
  
  // Crear datos iniciales para el nuevo usuario
  createInitialUserData(username);
  
  // Guardar sesión y entrar a la app
  saveSession(newUser);
  enterApp(newUser);
};

// Función para crear datos iniciales para un nuevo usuario
const createInitialUserData = (username) => {
  // Crear categorías predeterminadas
  const defaultCategories = [
    {
      title: "Personal",
      img: "boy.png",
    },
    {
      title: "Work",
      img: "briefcase.png",
    },
    {
      title: "Shopping",
      img: "shopping.png",
    },
    {
      title: "Coding",
      img: "web-design.png",
    }
  ];
  
  // Crear una tarea de ejemplo para el nuevo usuario
  const defaultTasks = [
    {
      id: 1,
      task: "Mi primera tarea",
      category: "Personal",
      completed: false
    }
  ];
  
  // Guardar datos iniciales en localStorage
  localStorage.setItem(`easytasks_categories_${username}`, JSON.stringify(defaultCategories));
  localStorage.setItem(`easytasks_tasks_${username}`, JSON.stringify(defaultTasks));
};

// Función para cargar datos del usuario (categorías y tareas)
const loadUserData = (username) => {
  // Cargar categorías del usuario
  const userCategoriesData = localStorage.getItem(`easytasks_categories_${username}`);
  if (userCategoriesData) {
    window.categories = JSON.parse(userCategoriesData);
  } else {
    // Si no hay categorías guardadas, usar las predeterminadas del script.js
    // Las categorías por defecto ya están definidas en script.js
  }
  
  // Cargar tareas del usuario
  const userTasksData = localStorage.getItem(`easytasks_tasks_${username}`);
  if (userTasksData) {
    window.tasks = JSON.parse(userTasksData);
  } else {
    // Si no hay tareas guardadas, usar un array vacío
    window.tasks = [];
  }
};

// Función para reemplazar la función saveLocal de script.js
const replaceSaveLocal = () => {
  // Guardar referencia a la función original
  if (window.originalSaveLocal) return; // Evitar reemplazar múltiples veces
  
  window.originalSaveLocal = window.saveLocal;
  
  // Redefinir la función saveLocal
  window.saveLocal = function() {
    saveUserData();
  };
};

// Inicializar el sistema de autenticación
const initAuth = () => {
  // Cargar usuarios existentes
  loadUsers();
  
  // Reemplazar la función saveLocal
  replaceSaveLocal();
  
  // Verificar si hay sesión activa
  const currentUser = loadSession();
  if (currentUser) {
    // Si hay sesión, entrar directamente a la app
    setTimeout(() => {
      enterApp(currentUser);
    }, 500); // Pequeño retraso para asegurarse de que el DOM y script.js estén cargados
  } else {
    // Si no hay sesión, mostrar pantalla de login
    authWrapper.classList.remove('hidden');
  }
  
  // Event listeners
  gotoRegisterBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showRegisterScreen();
  });
  
  gotoLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showLoginScreen();
  });
  
  loginBtn.addEventListener('click', login);
  registerBtn.addEventListener('click', register);
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', exitApp);
  }
  
  // Event listeners para envío con Enter
  loginPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      login();
    }
  });
  
  registerConfirmPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      register();
    }
  });
  
  // Añadir event listener para guardar datos antes de cerrar la página
  window.addEventListener('beforeunload', () => {
    saveUserData();
  });
};

// Esperar a que el DOM se cargue completamente y también script.js
document.addEventListener('DOMContentLoaded', () => {
  // Verificar si script.js ya se ha cargado
  const checkScriptLoaded = setInterval(() => {
    if (typeof renderCategories === 'function' && typeof updateTotals === 'function') {
      clearInterval(checkScriptLoaded);
      // Inicializar autenticación después de que script.js está listo
      initAuth();
    }
  }, 100);
  
  // Por seguridad, iniciar de todos modos después de un tiempo máximo
  setTimeout(() => {
    clearInterval(checkScriptLoaded);
    initAuth();
  }, 2000);
});