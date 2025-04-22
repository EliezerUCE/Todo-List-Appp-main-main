console.log("Login.js cargado");

function getElement(selector) {
  const element = document.querySelector(selector);
  if (!element) {
    console.warn(`Elemento no encontrado: ${selector}`);
  }
  return element;
}

const authWrapper = getElement('.auth-wrapper');
const loginScreen = getElement('.login-screen');
const registerScreen = getElement('.register-screen');
const loginBtn = getElement('#login-btn');
const registerBtn = getElement('#register-btn');
const gotoRegisterBtn = getElement('#goto-register');
const gotoLoginBtn = getElement('#goto-login');
const logoutBtn = getElement('.logout-btn');
const loginError = getElement('#login-error');
const registerError = getElement('#register-error');
const userNameSpan = getElement('#user-name');
const loginUsername = getElement('#login-username');
const loginPassword = getElement('#login-password');
const registerName = getElement('#register-name');
const registerUsername = getElement('#register-username');
const registerPassword = getElement('#register-password');
const registerConfirmPassword = getElement('#register-confirm-password');

// Variables globales
let users = [];


function getLocalData(key, defaultValue = null) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error al obtener datos de localStorage (${key}):`, error);
    return defaultValue;
  }
}

function setLocalData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error al guardar datos en localStorage (${key}):`, error);
    return false;
  }
}

// Cargar usuarios
function loadUsers() {
  users = getLocalData('easytasks_users', []);
  console.log(`${users.length} usuarios cargados`);
}

// Guardar usuarios
function saveUsers() {
  setLocalData('easytasks_users', users);
}

// Gestión de sesión
function saveSession(user) {
  setLocalData('easytasks_current_user', user);
}

function loadSession() {
  return getLocalData('easytasks_current_user', null);
}

function clearSession() {
  localStorage.removeItem('easytasks_current_user');
}

// Funciones de UI
function showLoginScreen() {
  if (loginScreen && registerScreen) {
    loginScreen.classList.add('active');
    registerScreen.classList.remove('active');
    if (loginError) loginError.textContent = '';
    if (loginUsername) loginUsername.value = '';
    if (loginPassword) loginPassword.value = '';
  }
}

function showRegisterScreen() {
  if (loginScreen && registerScreen) {
    loginScreen.classList.remove('active');
    registerScreen.classList.add('active');
    if (registerError) registerError.textContent = '';
    if (registerName) registerName.value = '';
    if (registerUsername) registerUsername.value = '';
    if (registerPassword) registerPassword.value = '';
    if (registerConfirmPassword) registerConfirmPassword.value = '';
  }
}

// Guardar datos del usuario actual
function saveUserData() {
  const currentUser = loadSession();
  if (currentUser && currentUser.username) {
    setLocalData(`easytasks_tasks_${currentUser.username}`, window.tasks || []);
    setLocalData(`easytasks_categories_${currentUser.username}`, window.categories || []);
    console.log(`Datos guardados para usuario: ${currentUser.username}`);
  }
}

// Cargar datos del usuario
function loadUserData(username) {
  // Cargar categorías
  window.categories = getLocalData(`easytasks_categories_${username}`, window.categories || []);
  
  // Cargar tareas
  window.tasks = getLocalData(`easytasks_tasks_${username}`, []);
  
  console.log(`Datos cargados para: ${username} (${window.tasks.length} tareas, ${window.categories.length} categorías)`);
}

// Reemplazar funciones de almacenamiento
function setupStorageFunctions(username) {

  const originalSaveLocal = window.saveLocal;

  window.saveLocal = function() {
    setLocalData(`easytasks_tasks_${username}`, window.tasks || []);
    setLocalData(`easytasks_categories_${username}`, window.categories || []);
    console.log(`Datos guardados para: ${username}`);

    if (typeof originalSaveLocal === 'function') {
      originalSaveLocal();
    }
  };
  

  window.getLocal = function() {
    window.tasks = getLocalData(`easytasks_tasks_${username}`, []);
    window.categories = getLocalData(`easytasks_categories_${username}`, window.categories || []);
  };
  
  console.log("Funciones de almacenamiento configuradas");
}

// Iniciar la aplicación para un usuario
function enterApp(user) {
  if (!authWrapper) {
    console.error("No se encontró el contenedor de autenticación");
    return;
  }
  
  // Ocultar pantalla de autenticación
  authWrapper.style.display = 'none';
  
  // Actualizar nombre de usuario en la UI
  if (userNameSpan) {
    userNameSpan.textContent = user.name;
  }
  
  // Cargar datos y configurar funciones
  loadUserData(user.username);
  setupStorageFunctions(user.username);
  
  // Actualizar la UI
  if (typeof window.renderCategories === 'function') {
    window.renderCategories();
  }
  
  if (typeof window.initCategoryDropdown === 'function') {
    window.initCategoryDropdown();
  }
  
  if (typeof window.updateTotals === 'function') {
    window.updateTotals();
  }

  if (window.categories && window.categories.length > 0) {
    window.selectedCategory = window.categories[0];
    
    const categoryTitle = getElement('#category-title');
    const categoryImg = getElement('#category-img');
    
    if (categoryTitle) {
      categoryTitle.innerHTML = window.selectedCategory.title;
    }
    
    if (categoryImg && window.selectedCategory.img) {
      categoryImg.src = `images/${window.selectedCategory.img}`;
    }
    
    if (typeof window.renderTasks === 'function') {
      window.renderTasks();
    }
  } else {
    console.warn("No hay categorías disponibles");
  }
  
  console.log(`Usuario ${user.name} ha iniciado sesión correctamente`);
}


function exitApp() {

  saveUserData();
  clearSession();
  

  if (authWrapper) {
    authWrapper.style.display = '';
    showLoginScreen();
  }
  
  // Limpiar datos
  window.tasks = [];
  window.selectedCategory = null;
  
  // Actualizar UI si las funciones están disponibles
  if (typeof window.renderCategories === 'function') window.renderCategories();
  if (typeof window.renderTasks === 'function') window.renderTasks();
  if (typeof window.updateTotals === 'function') window.updateTotals();
  
  console.log('Usuario ha cerrado sesión');
}

// Crear datos iniciales para un nuevo usuario
function createInitialUserData(username) {
  // Categorías predeterminadas
  const defaultCategories = [
    { title: "Personal", img: "boy.png" },
    { title: "Trabajo", img: "briefcase.png" },
    { title: "Compras", img: "shopping.png" },
    { title: "Programación", img: "web-design.png" },
  
    { title: "Salud", img: "healthcare.png" },
    { title: "Fitness", img: "dumbbell.png" },
    { title: "Educación", img: "education.png" },
    { title: "Finanzas", img: "saving.png" }
  ];

  // Tarea de ejemplo
  const defaultTasks = [
    { id: 1, task: "Mi primera tarea", category: "Personal", completed: false }
  ];
  
  // Guardar datos iniciales
  setLocalData(`easytasks_categories_${username}`, defaultCategories);
  setLocalData(`easytasks_tasks_${username}`, defaultTasks);
  
  console.log(`Datos iniciales creados para: ${username}`);
}

// Procesar login
function processLogin() {
  if (!loginUsername || !loginPassword) {
    console.error("Elementos de login no encontrados");
    return;
  }
  
  const username = loginUsername.value.trim();
  const password = loginPassword.value;
  
  // Validación básica
  if (!username || !password) {
    if (loginError) loginError.textContent = 'Por favor completa todos los campos';
    return;
  }
  
  // Buscar usuario
  const user = users.find(u => u.username === username);
  
  if (!user || user.password !== password) {
    if (loginError) loginError.textContent = 'Usuario o contraseña incorrectos';
    return;
  }
  
  // Login exitoso
  saveSession(user);
  enterApp(user);
}

// Procesar registro
function processRegister() {
  if (!registerName || !registerUsername || !registerPassword || !registerConfirmPassword) {
    console.error("Elementos de registro no encontrados");
    return;
  }
  
  const name = registerName.value.trim();
  const username = registerUsername.value.trim();
  const password = registerPassword.value;
  const confirmPassword = registerConfirmPassword.value;
  
  // Validaciones
  if (!name || !username || !password || !confirmPassword) {
    if (registerError) registerError.textContent = 'Por favor completa todos los campos';
    return;
  }
  
  if (password !== confirmPassword) {
    if (registerError) registerError.textContent = 'Las contraseñas no coinciden';
    return;
  }
  
  if (users.some(u => u.username === username)) {
    if (registerError) registerError.textContent = 'Este nombre de usuario ya está en uso';
    return;
  }
  
  // Crear nuevo usuario
  const newUser = {
    name,
    username,
    password,
    dateCreated: new Date().toISOString()
  };
  
  users.push(newUser);
  saveUsers();
  
  // Crear datos iniciales
  createInitialUserData(username);
  
  // Iniciar sesión con el nuevo usuario
  saveSession(newUser);
  enterApp(newUser);
}

// Inicializar el sistema de autenticación
function initAuth() {
  console.log("Inicializando sistema de autenticación");
  
  // Cargar usuarios existentes
  loadUsers();
  
  // Verificar si hay sesión activa
  const currentUser = loadSession();
  if (currentUser) {
    console.log(`Sesión activa encontrada: ${currentUser.username}`);
    enterApp(currentUser);
  } else {
    // Mostrar pantalla de login
    if (authWrapper) {
      window.tasks = [];
      authWrapper.style.display = '';
      console.log('Mostrando pantalla de login');
    } else {
      console.error("No se pudo mostrar la pantalla de login");
    }
  }
  
  // Configurar event listeners
  if (gotoRegisterBtn) {
    gotoRegisterBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showRegisterScreen();
    });
  }
  
  if (gotoLoginBtn) {
    gotoLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      showLoginScreen();
    });
  }
  
  if (loginBtn) {
    loginBtn.addEventListener('click', processLogin);
  }
  
  if (registerBtn) {
    registerBtn.addEventListener('click', processRegister);
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', exitApp);
  }
  
  // Event listeners para envío con Enter
  if (loginPassword) {
    loginPassword.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        processLogin();
      }
    });
  }
  
  if (registerConfirmPassword) {
    registerConfirmPassword.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        processRegister();
      }
    });
  }
  
  // Guardar datos antes de cerrar
  window.addEventListener('beforeunload', saveUserData);
}

function waitForScriptJs() {
  console.log("Esperando que script.js esté disponible...");

  if (typeof window.renderCategories === 'function' && 
      typeof window.updateTotals === 'function' && 
      typeof window.renderTasks === 'function') {
    console.log("Script.js está listo, inicializando autenticación");
    initAuth();
    return true;
  }
  
  return false;
}


document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM cargado, iniciando sistema de login");
  

  if (!waitForScriptJs()) {

    let attempts = 0;
    const maxAttempts = 50; 
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      if (waitForScriptJs() || attempts >= maxAttempts) {
        clearInterval(checkInterval);
        
        if (attempts >= maxAttempts) {
          console.error("No se pudo inicializar el sistema de login: script.js no disponible después de varios intentos");

          initAuth();
        }
      }
    }, 100);
  }
});


window.addEventListener('load', () => {
  console.log("Ventana cargada completamente");

  if (authWrapper && authWrapper.style.display !== 'none' && users.length === 0) {
    console.log("Intentando inicializar autenticación después de carga completa");
    waitForScriptJs();
  }
});