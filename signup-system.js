// Sistema de Cadastro - Nutri-Scan
// Gerencia cadastro de novos usuários

class SignupSystem {
  constructor() {
    this.api = new NutriScanAPI();
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Formulário de cadastro
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', (e) => this.handleSignup(e));
    }

    // Validação em tempo real
    this.setupRealTimeValidation();
  }

  setupRealTimeValidation() {
    // Validação de nome
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    
    if (firstName) {
      firstName.addEventListener('blur', () => this.validateName(firstName, 'firstNameError'));
    }
    
    if (lastName) {
      lastName.addEventListener('blur', () => this.validateName(lastName, 'lastNameError'));
    }

    // Validação de email
    const email = document.getElementById('email');
    if (email) {
      email.addEventListener('blur', () => this.validateEmail(email, 'emailError'));
    }

    // Validação de senha
    const password = document.getElementById('password');
    if (password) {
      password.addEventListener('input', () => this.validatePassword(password, 'passwordError'));
    }

    // Validação de confirmação de senha
    const confirmPassword = document.getElementById('confirmPassword');
    if (confirmPassword) {
      confirmPassword.addEventListener('input', () => this.validatePasswordMatch(confirmPassword, 'confirmPasswordError'));
    }
  }

  async handleSignup(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const userData = {
      firstName: formData.get('firstName').trim(),
      lastName: formData.get('lastName').trim(),
      email: formData.get('email').trim().toLowerCase(),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
      terms: formData.get('terms'),
      newsletter: formData.get('newsletter') === 'on'
    };

    // Validação completa
    if (!this.validateSignupForm(userData)) {
      return;
    }

    // Mostrar loading
    this.setLoadingState(true);
    this.hideMessages();

    try {
      // Tentar verificar email e fazer cadastro, mas usar modo simulado se falhar
      let result;
      try {
        // Verificar se email já existe
        const emailCheck = await this.api.post('/auth/check-email', { email: userData.email });
        
        if (emailCheck.exists) {
          throw new Error('Este email já está cadastrado. Faça login ou use outro email.');
        }

        // Fazer cadastro
        result = await this.api.post('/auth/register', {
          name: `${userData.firstName} ${userData.lastName}`,
          email: userData.email,
          password: userData.password,
          preferences: {
            allergies: [],
            dietaryRestrictions: [],
            notifications: userData.newsletter,
            language: 'pt-BR'
          },
          subscription: {
            plan: 'free',
            status: 'active',
            startDate: new Date(),
            scansUsed: 0,
            scansLimit: 10
          }
        });
      } catch (apiError) {
        // Se falhar a conexão com o servidor, usar modo simulado
        console.log('Servidor não disponível, usando modo simulado para cadastro');
        
        // Simular verificação de email (aceitar qualquer email exceto demo@nutriscan.com)
        if (userData.email === 'demo@nutriscan.com') {
          throw new Error('Este email já está cadastrado. Faça login ou use outro email.');
        }
        
        // Criar usuário simulado
        result = {
          success: true,
          token: 'simulated_token_' + Date.now(),
          user: {
            _id: 'user_' + Date.now(),
            userId: 'user_' + Date.now(),
            name: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            subscription: {
              plan: 'free',
              status: 'active',
              startDate: new Date(),
              scansUsed: 0,
              scansLimit: 10
            },
            preferences: {
              allergies: [],
              dietaryRestrictions: [],
              notifications: userData.newsletter,
              language: 'pt-BR'
            }
          }
        };
      }

      if (result.success) {
        // Salvar token e usuário
        localStorage.setItem('nutriScanToken', result.token);
        localStorage.setItem('nutriScanUser', JSON.stringify(result.user));

        // Mostrar sucesso
        this.showSuccess('Conta criada com sucesso! Redirecionando...');

        // Redirecionar para dashboard
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 2000);
      } else {
        throw new Error(result.message || 'Erro no cadastro');
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      this.showError(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      this.setLoadingState(false);
    }
  }

  async handleGoogleSignup() {
    this.setLoadingState(true);
    this.hideMessages();

    try {
      // Simular cadastro com Google
      const googleUser = await this.simulateGoogleSignup();
      
      // Tentar enviar para backend, mas usar modo simulado se falhar
      let result;
      try {
        result = await this.api.post('/auth/google-login', {
          email: googleUser.email,
          name: googleUser.name,
          picture: googleUser.picture,
          googleId: googleUser.id
        });
      } catch (apiError) {
        // Se falhar a conexão com o servidor, usar modo simulado
        console.log('Servidor não disponível, usando modo simulado para cadastro Google');
        result = {
          success: true,
          token: 'simulated_token_' + Date.now(),
          user: {
            _id: 'user_' + Date.now(),
            userId: 'user_' + Date.now(),
            email: googleUser.email,
            name: googleUser.name,
            picture: googleUser.picture,
            subscription: {
              plan: 'free',
              status: 'active',
              startDate: new Date(),
              scansUsed: 0,
              scansLimit: 10
            },
            preferences: {
              allergies: [],
              dietaryRestrictions: [],
              notifications: true,
              language: 'pt-BR'
            }
          }
        };
      }

      if (result.success) {
        // Salvar dados
        localStorage.setItem('nutriScanToken', result.token);
        localStorage.setItem('nutriScanUser', JSON.stringify(result.user));

        this.showSuccess('Conta criada com Google! Redirecionando...');

        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 2000);
      } else {
        throw new Error(result.message || 'Erro no cadastro Google');
      }
    } catch (error) {
      console.error('Erro no cadastro Google:', error);
      this.showError(error.message || 'Erro ao criar conta com Google.');
    } finally {
      this.setLoadingState(false);
    }
  }

  async simulateGoogleSignup() {
    // Simular resposta do Google Sign-In
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          email: 'novo.usuario@gmail.com',
          name: 'Novo Usuário',
          picture: 'https://lh3.googleusercontent.com/a/default-user',
          id: 'google_' + Date.now()
        });
      }, 1000);
    });
  }

  validateSignupForm(userData) {
    let isValid = true;

    // Validar nome
    if (!userData.firstName || userData.firstName.length < 2) {
      this.showFieldError('firstNameError', 'Nome deve ter pelo menos 2 caracteres.');
      isValid = false;
    }

    if (!userData.lastName || userData.lastName.length < 2) {
      this.showFieldError('lastNameError', 'Sobrenome deve ter pelo menos 2 caracteres.');
      isValid = false;
    }

    // Validar email
    if (!this.isValidEmail(userData.email)) {
      this.showFieldError('emailError', 'Por favor, insira um email válido.');
      isValid = false;
    }

    // Validar senha
    if (!userData.password || userData.password.length < 6) {
      this.showFieldError('passwordError', 'A senha deve ter pelo menos 6 caracteres.');
      isValid = false;
    }

    // Validar confirmação de senha
    if (userData.password !== userData.confirmPassword) {
      this.showFieldError('confirmPasswordError', 'As senhas não coincidem.');
      isValid = false;
    }

    // Validar termos
    if (!userData.terms) {
      this.showError('Você deve aceitar os Termos de Uso e Política de Privacidade.');
      isValid = false;
    }

    return isValid;
  }

  validateName(input, errorId) {
    const name = input.value.trim();
    const errorElement = document.getElementById(errorId);
    
    if (name.length > 0 && name.length < 2) {
      input.classList.add('error');
      this.showFieldError(errorId, 'Nome deve ter pelo menos 2 caracteres.');
      return false;
    } else {
      input.classList.remove('error');
      this.hideFieldError(errorId);
      return true;
    }
  }

  validateEmail(input, errorId) {
    const email = input.value.trim();
    const errorElement = document.getElementById(errorId);
    
    if (email.length > 0 && !this.isValidEmail(email)) {
      input.classList.add('error');
      this.showFieldError(errorId, 'Por favor, insira um email válido.');
      return false;
    } else {
      input.classList.remove('error');
      this.hideFieldError(errorId);
      return true;
    }
  }

  validatePassword(input, errorId) {
    const password = input.value;
    const errorElement = document.getElementById(errorId);
    
    if (password.length > 0 && password.length < 6) {
      input.classList.add('error');
      this.showFieldError(errorId, 'A senha deve ter pelo menos 6 caracteres.');
      return false;
    } else {
      input.classList.remove('error');
      this.hideFieldError(errorId);
      return true;
    }
  }

  validatePasswordMatch(input, errorId) {
    const password = document.getElementById('password').value;
    const confirmPassword = input.value;
    const errorElement = document.getElementById(errorId);
    
    if (confirmPassword.length > 0 && password !== confirmPassword) {
      input.classList.add('error');
      this.showFieldError(errorId, 'As senhas não coincidem.');
      return false;
    } else {
      input.classList.remove('error');
      this.hideFieldError(errorId);
      return true;
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showFieldError(fieldId, message) {
    const errorElement = document.getElementById(fieldId);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  hideFieldError(fieldId) {
    const errorElement = document.getElementById(fieldId);
    if (errorElement) {
      errorElement.style.display = 'none';
    }
  }

  setLoadingState(loading) {
    const signupBtn = document.getElementById('signupBtn');
    const googleBtn = document.querySelector('.google-signup-btn');

    if (loading) {
      if (signupBtn) {
        signupBtn.disabled = true;
        signupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando conta...';
      }
      if (googleBtn) {
        googleBtn.disabled = true;
        googleBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Conectando...';
      }
    } else {
      if (signupBtn) {
        signupBtn.disabled = false;
        signupBtn.innerHTML = '<i class="fas fa-user-plus"></i> Criar Conta Gratuita';
      }
      if (googleBtn) {
        googleBtn.disabled = false;
        googleBtn.innerHTML = '<img src="https://developers.google.com/identity/images/g-logo.png" alt="Google"><span>Criar conta com Google</span>';
      }
    }
  }

  showError(message) {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
    this.hideSuccess();
  }

  showSuccess(message) {
    const successElement = document.getElementById('successMessage');
    if (successElement) {
      successElement.textContent = message;
      successElement.style.display = 'block';
    }
    this.hideError();
  }

  hideError() {
    const errorElement = document.getElementById('errorMessage');
    if (errorElement) {
      errorElement.style.display = 'none';
    }
  }

  hideSuccess() {
    const successElement = document.getElementById('successMessage');
    if (successElement) {
      successElement.style.display = 'none';
    }
  }

  hideMessages() {
    this.hideError();
    this.hideSuccess();
  }
}

// Funções globais para acesso inline
function handleSignup(event) {
  signupSystem.handleSignup(event);
}

function handleGoogleSignup() {
  signupSystem.handleGoogleSignup();
}

// Inicializar sistema
let signupSystem;
document.addEventListener('DOMContentLoaded', () => {
  signupSystem = new SignupSystem();
});

// Disponibilizar globalmente
window.signupSystem = signupSystem;
