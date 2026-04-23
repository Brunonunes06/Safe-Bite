// Correções para botões não funcionais do Nutri-Scan
// Versão corrigida e otimizada

// Aguardar DOM carregar
document.addEventListener('DOMContentLoaded', function() {
  console.log('Script de correções carregado');
  
  // Botões de assinatura - usar popup de upgrade
  document.querySelectorAll('.plan-button, .btn-pricing, .btn-primary').forEach(button => {
    // Verificar se é botão de assinatura
    if (button.textContent.includes('Assinar') || 
        button.textContent.includes('Upgrade') || 
        button.textContent.includes('Premium')) {
      button.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Usar o popup de upgrade
        if (typeof showUpgradePopup === 'function') {
          showUpgradePopup();
        } else {
          // Fallback se o popup não estiver disponível
          console.log('Popup não disponível, redirecionando...');
          window.location.href = 'payment.html';
        }
      });
    }
  });

  // Botão de upload/demo
  const uploadBtn = document.querySelector('.upload-btn, .btn-demo');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Simular upload e scan
      simulateUploadAndScan();
    });
  }

  // Formulário de contato
  const contactForm = document.querySelector('#contactForm, .contact-form form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Simular envio do formulário
      simulateContactForm(this);
    });
  }

  // Newsletter
  const newsletterForm = document.querySelector('.newsletter-form');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Simular inscrição
      simulateNewsletter(this);
    });
  }

  // Navegação suave
  setupSmoothScrolling();
});

// Simular upload e scan
function simulateUploadAndScan() {
  const uploadBtn = document.querySelector('.upload-btn, .btn-demo');
  if (!uploadBtn) return;

  // Mostrar loading
  const originalText = uploadBtn.innerHTML;
  uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
  uploadBtn.disabled = true;

  // Simular delay
  setTimeout(() => {
    uploadBtn.innerHTML = '<i class="fas fa-check"></i> Scan Concluído!';
    
    // Mostrar resultado
    showScanResult();
    
    // Restaurar botão
    setTimeout(() => {
      uploadBtn.innerHTML = originalText;
      uploadBtn.disabled = false;
    }, 2000);
  }, 2000);
}

// Mostrar resultado do scan
function showScanResult() {
  const result = {
    productName: 'Produto Teste',
    ingredients: ['Trigo', 'Açúcar', 'Leite', 'Ovos'],
    allergens: ['Glúten', 'Lactose'],
    status: 'warning',
    message: 'Este produto contém alérgenos que podem afetar você.'
  };

  // Criar modal de resultado
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  `;

  modal.innerHTML = `
    <div style="background: white; padding: 2rem; border-radius: 15px; max-width: 500px; width: 90%;">
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <div style="width: 60px; height: 60px; background: ${result.status === 'warning' ? '#f39c12' : '#27ae60'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem;">
          <i class="fas fa-${result.status === 'warning' ? 'exclamation' : 'check'}" style="color: white; font-size: 1.5rem;"></i>
        </div>
        <h3 style="margin: 0; color: var(--text-dark);">${result.productName}</h3>
      </div>
      
      <div style="margin-bottom: 1.5rem;">
        <h4 style="color: var(--text-dark); margin-bottom: 0.5rem;">Ingredientes:</h4>
        <p style="color: var(--text-light);">${result.ingredients.join(', ')}</p>
      </div>
      
      <div style="margin-bottom: 1.5rem;">
        <h4 style="color: var(--text-dark); margin-bottom: 0.5rem;">⚠️ Alérgenos Detectados:</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          ${result.allergens.map(allergen => `
            <span style="background: #e74c3c; color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.8rem;">
              ${allergen}
            </span>
          `).join('')}
        </div>
      </div>
      
      <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
        <p style="margin: 0; color: var(--text-light);">${result.message}</p>
      </div>
      
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button onclick="this.closest('div').parentElement.remove()" style="padding: 0.8rem 1.5rem; background: var(--medium-gray); color: var(--text-dark); border: none; border-radius: 8px; cursor: pointer;">
          Fechar
        </button>
        <button onclick="window.location.href='scanner.html'" style="padding: 0.8rem 1.5rem; background: var(--gradient-primary); color: white; border: none; border-radius: 8px; cursor: pointer;">
          Ver Detalhes
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Fechar modal ao clicar fora
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Simular formulário de contato
function simulateContactForm(form) {
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;

  // Mostrar loading
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
  submitBtn.disabled = true;

  // Simular envio
  setTimeout(() => {
    submitBtn.innerHTML = '<i class="fas fa-check"></i> Enviado!';
    
    // Mostrar mensagem de sucesso
    showNotification('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
    
    // Limpar formulário
    form.reset();
    
    // Restaurar botão
    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }, 2000);
  }, 1500);
}

// Simular newsletter
function simulateNewsletter(form) {
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;

  // Mostrar loading
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Inscrevendo...';
  submitBtn.disabled = true;

  // Simular inscrição
  setTimeout(() => {
    submitBtn.innerHTML = '<i class="fas fa-check"></i> Inscrito!';
    
    // Mostrar mensagem de sucesso
    showNotification('Inscrição realizada com sucesso! Obrigado por se inscrever na nossa newsletter.', 'success');
    
    // Limpar formulário
    form.reset();
    
    // Restaurar botão
    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }, 2000);
  }, 1000);
}

// Configurar navegação suave
function setupSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}

// Mostrar notificação
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? 'var(--primary-green)' : type === 'error' ? '#e74c3c' : '#3498db'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 10000;
    max-width: 300px;
    animation: slideIn 0.3s ease;
  `;

  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem;">
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
      <span>${message}</span>
    </div>
  `;

  document.body.appendChild(notification);

  // Remover após 5 segundos
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 5000);
}

// Adicionar animações CSS se não existirem
if (!document.querySelector('#notificationAnimations')) {
  const style = document.createElement('style');
  style.id = 'notificationAnimations';
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
}

// Função para o botão "Começar grátis" do hero
function handleHeroStartFree() {
  // Verificar se usuário já está logado
  const token = localStorage.getItem('nutriScanToken');
  const user = localStorage.getItem('nutriScanUser');
  
  if (token && user) {
    // Usuário já logado, redirecionar para dashboard
    window.location.href = 'dashboard.html';
  } else {
    // Usuário não logado, redirecionar para página de login
    window.location.href = 'login.html';
  }
}

// Exportar funções para uso global
window.NutriScanCorrections = {
  simulateUploadAndScan,
  showScanResult,
  showNotification,
  setupSmoothScrolling
};

// Disponibilizar função globalmente
window.handleHeroStartFree = handleHeroStartFree;
