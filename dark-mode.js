class DarkModeManager {
  constructor() {
    this.isDarkMode = false;
    this.userPreference = null;
    this.systemPreference = null;
    this.init();
  }

  init() {
    console.log('🌙 Iniciando sistema de dark mode');
    this.loadPreferences();
    this.detectSystemPreference();
    this.applyTheme(this.getEffectiveTheme());
    this.setupEventListeners();
    this.addThemeToggle();
  }

  loadPreferences() {
    this.userPreference = localStorage.getItem('darkModePreference');
  }

  saveUserPreference(preference) {
    this.userPreference = preference;
    localStorage.setItem('darkModePreference', preference);
  }

  detectSystemPreference() {
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemPreference = darkModeQuery.matches ? 'dark' : 'light';
      
      darkModeQuery.addEventListener('change', (e) => {
        this.systemPreference = e.matches ? 'dark' : 'light';
        if (this.userPreference === null) {
          this.applyTheme(this.getEffectiveTheme());
        }
      });
    }
  }

  getEffectiveTheme() {
    return this.userPreference || this.systemPreference || 'light';
  }

  applyTheme(theme) {
    this.isDarkMode = theme === 'dark';
    this.updateCSSVariables(theme);
    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.toggle('dark-mode', this.isDarkMode);
    this.updateThemeToggle();
    this.dispatchThemeChange(theme);
    console.log(`🎨 Tema aplicado: ${theme}`);
  }

  updateCSSVariables(theme) {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.style.setProperty('--bg-primary', '#1a1a1a');
      root.style.setProperty('--bg-secondary', '#2d2d2d');
      root.style.setProperty('--bg-card', '#3a3a3a');
      root.style.setProperty('--text-primary', '#ffffff');
      root.style.setProperty('--text-secondary', '#b0b0b0');
      root.style.setProperty('--text-muted', '#808080');
      root.style.setProperty('--border-color', '#404040');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.3)');
      root.style.setProperty('--accent-primary', '#4ecdc4');
      root.style.setProperty('--accent-secondary', '#45a049');
      root.style.setProperty('--success-green', '#27ae60');
      root.style.setProperty('--warning-yellow', '#f39c12');
      root.style.setProperty('--danger-red', '#e74c3c');
      root.style.setProperty('--info-blue', '#3498db');
    } else {
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8f9fa');
      root.style.setProperty('--bg-card', '#ffffff');
      root.style.setProperty('--text-primary', '#2c3e50');
      root.style.setProperty('--text-secondary', '#6c757d');
      root.style.setProperty('--text-muted', '#95a5a6');
      root.style.setProperty('--border-color', '#e9ecef');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--accent-primary', '#2ecc71');
      root.style.setProperty('--accent-secondary', '#27ae60');
      root.style.setProperty('--success-green', '#2ecc71');
      root.style.setProperty('--warning-yellow', '#f39c12');
      root.style.setProperty('--danger-red', '#e74c3c');
      root.style.setProperty('--info-blue', '#3498db');
    }
  }

  setupEventListeners() {
    document.addEventListener('themechange', (e) => {
      this.applyTheme(e.detail.theme);
    });
    
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        this.toggleTheme();
      }
    });
    
    console.log('⌨️ Atalhos de tema configurados');
  }

  updateThemeToggle() {
    const toggleBtn = document.getElementById('themeToggleBtn');
    if (toggleBtn) {
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.className = `fas fa-${this.isDarkMode ? 'sun' : 'moon'}`;
      }
      toggleBtn.title = this.isDarkMode ? 
        'Ativar modo claro (Ctrl+Shift+D)' : 
        'Ativar modo escuro (Ctrl+Shift+D)';
    }
  }

  toggleTheme() {
    const newTheme = this.isDarkMode ? 'light' : 'dark';
    this.saveUserPreference(newTheme);
    this.applyTheme(newTheme);
  }

  dispatchThemeChange(theme) {
    const event = new CustomEvent('themechange', {
      detail: { theme, isDarkMode: theme === 'dark' }
    });
    document.dispatchEvent(event);
  }

  getStatus() {
    return {
      isDarkMode: this.isDarkMode,
      currentTheme: this.getEffectiveTheme(),
      userPreference: this.userPreference,
      systemPreference: this.systemPreference
    };
  }

  setTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
      this.saveUserPreference(theme);
      this.applyTheme(theme);
    }
  }

  resetToSystemPreference() {
    this.userPreference = null;
    localStorage.removeItem('darkModePreference');
    this.applyTheme(this.getEffectiveTheme());
  }

  destroy() {
    console.log('🗑️ Sistema de dark mode desativado');
  }
}

let darkModeManager;

document.addEventListener('DOMContentLoaded', () => {
  darkModeManager = new DarkModeManager();
  window.darkModeManager = darkModeManager;
  console.log('✅ Sistema de dark mode carregado');
});

window.DarkModeManager = DarkModeManager;
