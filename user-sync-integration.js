// Sistema de Integração com UserSync para páginas existentes
class UserSyncIntegration {
  constructor() {
    this.initialized = false;
    this.setupIntegration();
  }

  setupIntegration() {
    // Aguardar o UserSyncManager estar disponível
    if (window.userSync) {
      this.initializeIntegration();
    } else {
      // Se não estiver disponível, aguardar
      document.addEventListener('DOMContentLoaded', () => {
        if (window.userSync) {
          this.initializeIntegration();
        } else {
          // Aguardar mais um pouco
          setTimeout(() => {
            if (window.userSync) {
              this.initializeIntegration();
            }
          }, 1000);
        }
      });
    }
  }

  initializeIntegration() {
    if (this.initialized) return;
    
    this.initialized = true;
    console.log('UserSyncIntegration inicializado');

    // Configurar listeners para eventos de sincronização
    this.setupSyncListeners();

    // Integrar com sistemas existentes
    this.integrateWithExistingSystems();

    // Melhorar funções globais
    this.enhanceGlobalFunctions();
  }

  setupSyncListeners() {
    // Listener para atualizações de usuário
    document.addEventListener('userSync', (e) => {
      const { type, data } = e.detail;
      
      switch (type) {
        case 'userUpdated':
          console.log('Usuário atualizado:', data.name);
          this.updatePageSpecificElements(data);
          break;
          
        case 'userSynced':
          console.log('Usuário sincronizado:', data.name);
          this.updatePageSpecificElements(data);
          break;
          
        case 'profileImageUpdated':
          console.log('Foto de perfil atualizada');
          this.updateProfileImages(data);
          break;
      }
    });
  }

  updatePageSpecificElements(userData) {
    // Atualizar elementos específicos da página atual
    const pageName = this.getCurrentPageName();
    
    switch (pageName) {
      case 'profile':
        this.updateProfilePage(userData);
        break;
      case 'settings':
        this.updateSettingsPage(userData);
        break;
      case 'history':
        this.updateHistoryPage(userData);
        break;
      case 'scanner':
        this.updateScannerPage(userData);
        break;
      case 'help':
        this.updateHelpPage(userData);
        break;
      case 'payment':
        this.updatePaymentPage(userData);
        break;
      case 'index':
        this.updateIndexPage(userData);
        break;
    }
  }

  getCurrentPageName() {
    const path = window.location.pathname;
    const filename = path.split('/').pop().replace('.html', '');
    return filename || 'index';
  }

  updateProfilePage(userData) {
    // Atualizar elementos específicos do perfil
    const profileElements = {
      'profileName': userData.name,
      'profileEmail': userData.email,
      'profileBadge': userData.plan || 'Free'
    };

    Object.entries(profileElements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });

    // Atualizar avatar se tiver foto
    if (userData.profileImage) {
      const profileAvatar = document.getElementById('profileAvatar');
      if (profileAvatar) {
        profileAvatar.style.backgroundImage = `url(${userData.profileImage})`;
        profileAvatar.style.backgroundSize = 'cover';
        profileAvatar.style.backgroundPosition = 'center';
        profileAvatar.textContent = '';
      }
    }
  }

  updateSettingsPage(userData) {
    // Atualizar elementos específicos das configurações
    const settingsElements = {
      'userName': userData.name,
      'userEmail': userData.email
    };

    Object.entries(settingsElements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
  }

  updateHistoryPage(userData) {
    // Atualizar elementos específicos do histórico
    const historyElements = {
      'userName': userData.name,
      'userEmail': userData.email
    };

    Object.entries(historyElements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
  }

  updateScannerPage(userData) {
    // Atualizar elementos específicos do scanner
    const scannerElements = {
      'userName': userData.name,
      'userEmail': userData.email
    };

    Object.entries(scannerElements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
  }

  updateHelpPage(userData) {
    // Atualizar elementos específicos da ajuda
    const helpElements = {
      'userName': userData.name,
      'userEmail': userData.email
    };

    Object.entries(helpElements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
  }

  updatePaymentPage(userData) {
    // Atualizar elementos específicos do pagamento
    const paymentElements = {
      'userName': userData.name,
      'userEmail': userData.email
    };

    Object.entries(paymentElements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
  }

  updateIndexPage(userData) {
    // Atualizar elementos específicos do index
    const indexElements = {
      'userName': userData.name,
      'userEmail': userData.email
    };

    Object.entries(indexElements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) element.textContent = value;
    });
  }

  updateProfileImages(imageData) {
    // Atualizar todas as imagens de avatar na página
    const avatarElements = document.querySelectorAll('.user-avatar, #userAvatar, #profileAvatar');
    avatarElements.forEach(element => {
      if (element) {
        element.style.backgroundImage = `url(${imageData})`;
        element.style.backgroundSize = 'cover';
        element.style.backgroundPosition = 'center';
        element.textContent = '';
      }
    });
  }

  integrateWithExistingSystems() {
    // Integrar com sistemas de login existentes
    this.enhanceLoginSystem();
    
    // Integrar com sistemas de perfil
    this.enhanceProfileSystem();
    
    // Integrar com sistemas de configurações
    this.enhanceSettingsSystem();
  }

  enhanceLoginSystem() {
    // Melhorar sistema de login para usar sincronização
    if (window.loginSystem) {
      const originalLogin = window.loginSystem.login;
      window.loginSystem.login = async function(userData) {
        const result = await originalLogin.call(this, userData);
        if (result && window.userSync) {
          window.userSync.updateUser(userData);
        }
        return result;
      };
    }
  }

  enhanceProfileSystem() {
    // Melhorar sistema de perfil para usar sincronização
    if (window.profileInstance) {
      const originalSave = window.profileInstance.saveProfile;
      window.profileInstance.saveProfile = async function() {
        const result = await originalSave.call(this);
        if (result && window.userSync) {
          window.userSync.forceSync();
        }
        return result;
      };
    }
  }

  enhanceSettingsSystem() {
    // Melhorar sistema de configurações para usar sincronização
    if (window.settingsInstance) {
      const originalSave = window.settingsInstance.saveSettings;
      window.settingsInstance.saveSettings = async function() {
        const result = await originalSave.call(this);
        if (result && window.userSync) {
          window.userSync.forceSync();
        }
        return result;
      };
    }
  }

  enhanceGlobalFunctions() {
    // Melhorar funções globais para usar sincronização
    
    // Substituir função global de atualização de dados do usuário
    window.updateUserData = function(userData) {
      if (window.userSync) {
        window.userSync.updateUser(userData);
      }
      
      // Manter compatibilidade com código existente
      localStorage.setItem('nutriScanUser', JSON.stringify(userData));
    };

    // Substituir função global de atualização de foto de perfil
    window.updateProfileImage = function(imageData) {
      if (window.userSync) {
        window.userSync.updateProfileImage(imageData);
      }
      
      // Manter compatibilidade com código existente
      const userData = JSON.parse(localStorage.getItem('nutriScanUser') || '{}');
      userData.profileImage = imageData;
      localStorage.setItem('nutriScanUser', JSON.stringify(userData));
    };

    // Adicionar função para forçar sincronização
    window.forceSync = function() {
      if (window.userSync) {
        window.userSync.forceSync();
      }
    };

    // Adicionar função para obter status da sincronização
    window.getSyncStatus = function() {
      if (window.userSync) {
        return window.userSync.getSyncStatus();
      }
      return null;
    };
  }

  // Forçar atualização de todos os elementos da página
  refreshPageData() {
    if (window.userSync && window.userSync.currentUser) {
      this.updatePageSpecificElements(window.userSync.currentUser);
    }
  }

  // Limpar recursos
  destroy() {
    this.initialized = false;
  }
}

// Criar instância global de integração
window.userSyncIntegration = new UserSyncIntegration();

// Expor funções para uso global
window.refreshPageData = () => {
  window.userSyncIntegration.refreshPageData();
};

// Listener para quando a página ficar visível novamente
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    window.refreshPageData();
  }
});

// Listener para quando a janela ganhar foco
window.addEventListener('focus', () => {
  window.refreshPageData();
});

// Exportar para módulos (se usar)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UserSyncIntegration;
}
