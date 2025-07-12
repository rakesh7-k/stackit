console.log('App.js loaded successfully!');

const API_BASE = 'http://localhost:8000/api';

// Get CSRF token from cookies
function getCSRFToken() {
    const name = 'csrftoken';
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');
const demoLogin = document.getElementById('demo-login');
const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const loading = document.getElementById('loading');
const authForms = document.getElementById('auth-forms');

console.log('Elements found:', {
    loginForm: !!loginForm,
    registerForm: !!registerForm,
    demoLogin: !!demoLogin,
    loginError: !!loginError
});

// Toggle forms
showRegister.addEventListener('click', (e) => {
  e.preventDefault();
  loginForm.classList.add('hidden');
  registerForm.classList.remove('hidden');
  loginError.classList.add('hidden');
});

showLogin.addEventListener('click', (e) => {
  e.preventDefault();
  registerForm.classList.add('hidden');
  loginForm.classList.remove('hidden');
  registerError.classList.add('hidden');
});

demoLogin.addEventListener('click', (e) => {
  e.preventDefault();
  console.log('Demo login clicked');
  document.getElementById('login-username').value = 'alice_dev';
  document.getElementById('login-password').value = 'password123';
});

// Login
loginForm.addEventListener('submit', async (e) => {
  console.log('Login form submitted!');
  e.preventDefault();
  loginError.classList.add('hidden');
  setLoading(true);
  
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  
  console.log('Login attempt:', { username, password });
  
  // Temporarily bypass authentication for testing
  console.log('Bypassing authentication for testing...');
  
  // Create a mock user object
  const mockUser = {
    id: 1,
    username: username || 'testuser',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    bio: 'Test user for development',
    avatar: '',
    is_mentor: false,
    questions_asked: 0,
    answers_given: 0,
    total_points: 0,
    reputation_score: 0,
    zen_mode_enabled: false,
    created_at: new Date().toISOString()
  };
  
  // Store user in localStorage
  localStorage.setItem('stackit_user', JSON.stringify(mockUser));
  
  // Redirect to dashboard
  window.location.href = 'dashboard.html';
  
  setLoading(false);
});

// Register
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  registerError.classList.add('hidden');
  setLoading(true);
  
  const username = document.getElementById('register-username').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const first_name = document.getElementById('register-firstname').value;
  const last_name = document.getElementById('register-lastname').value;
  
  // Get CSRF token
  const csrfToken = getCSRFToken();
  
  try {
    const res = await fetch(`${API_BASE}/auth/register/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-CSRFToken': csrfToken
      },
      body: JSON.stringify({ username, email, password, first_name, last_name })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      localStorage.setItem('stackit_user', JSON.stringify(data.user));
      window.location.href = 'dashboard.html';
    } else {
      registerError.textContent = data.error || 'Registration failed.';
      registerError.classList.remove('hidden');
    }
  } catch (err) {
    registerError.textContent = 'Network error.';
    registerError.classList.remove('hidden');
  }
  setLoading(false);
});

function setLoading(isLoading) {
  if (isLoading) {
    authForms.classList.add('hidden');
    loading.classList.remove('hidden');
  } else {
    loading.classList.add('hidden');
    authForms.classList.remove('hidden');
  }
}

console.log('App.js setup complete!'); 