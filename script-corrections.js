// Correções para botões não funcionais do Nutri-Scan
// Adicionar este script ao final do index.html

// Correção do botão "Assinar Agora"
function setupPricingButtons() {
    const pricingButtons = document.querySelectorAll('.btn-pricing, .btn-primary');
    
    pricingButtons.forEach(button => {
        // Verificar se é botão de assinatura
        if (button.textContent.includes('Assinar') || button.textContent.includes('Upgrade')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Botões de assinatura - usar popup de upgrade
document.querySelectorAll('.plan-button').forEach(button => {
  button.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Usar o popup de upgrade
    if (typeof showUpgradePopup === 'function') {
      showUpgradePopup();
    } else {
      // Fallback se o popup não estiver disponível
      safeRedirect('payment.html');
    }
  });
});                
                // Simular redirecionamento para página de pagamento
                console.log('Botão de assinatura clicado');
                
                // Criar modal de confirmação
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
                    <div style="background: white; padding: 2rem; border-radius: 15px; max-width: 400px; text-align: center;">
                        <h3 style="margin-bottom: 1rem; color: var(--text-dark);">🚀 Upgrade para Premium</h3>
                        <p style="margin-bottom: 1.5rem; color: var(--text-light);">
                            Você será redirecionado para a página de pagamento para completar sua assinatura Premium.
                        </p>
                        <div style="display: flex; gap: 1rem; justify-content: center;">
                            <button onclick="this.closest('div').parentElement.remove()" style="padding: 0.8rem 1.5rem; background: var(--medium-gray); color: var(--text-dark); border: none; border-radius: 8px; cursor: pointer;">
                                Cancelar
                            </button>
                            <button onclick="safeRedirect('payment.html')" style="padding: 0.8rem 1.5rem; background: var(--gradient-primary); color: white; border: none; border-radius: 8px; cursor: pointer;">
                                Continuar
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
            });
        }
    });
}

// Correção do botão de upload/demo
function setupUploadButton() {
    const uploadArea = document.getElementById('demoUpload');
    
    if (uploadArea) {
        // Remover listeners antigos para evitar duplicação
        uploadArea.replaceWith(uploadArea.cloneNode(true));
        const newUploadArea = document.getElementById('demoUpload');
        
        newUploadArea.addEventListener('click', function() {
            console.log('Botão de upload clicado');
            
            // Simular upload real
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i><p>Processando imagem...</p>';
            this.style.background = 'rgba(46, 204, 113, 0.1)';
            
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-brain"></i><p>Analisando com IA...</p>';
                
                setTimeout(() => {
                    // Mostrar resultado
                    this.style.display = 'none';
                    
                    const resultDiv = document.getElementById('demoResult');
                    if (resultDiv) {
                        resultDiv.style.display = 'block';
                        resultDiv.innerHTML = `
                            <div class="result-header">
                                <h5>✅ Análise Concluída</h5>
                                <span class="confidence">95% confiança</span>
                            </div>
                            <div class="result-content">
                                <div class="result-item safe">
                                    <i class="fas fa-check-circle"></i>
                                    <span>Produto seguro para consumo</span>
                                </div>
                                <div class="result-item info">
                                    <i class="fas fa-info-circle"></i>
                                    <span>Sem alérgenos detectados</span>
                                </div>
                                <div class="result-item warning">
                                    <i class="fas fa-exclamation-circle"></i>
                                    <span>Consuma com moderação</span>
                                </div>
                            </div>
                            <button onclick="resetDemo()" style="margin-top: 1rem; padding: 0.8rem 1.5rem; background: var(--gradient-primary); color: white; border: none; border-radius: 8px; cursor: pointer;">
                                Fazer Nova Análise
                            </button>
                        `;
                    }
                }, 1500);
            }, 1000);
        });
    }
}

// Função para resetar o demo
function resetDemo() {
    const uploadArea = document.getElementById('demoUpload');
    const resultDiv = document.getElementById('demoResult');
    
    if (uploadArea && resultDiv) {
        uploadArea.style.display = 'block';
        uploadArea.style.background = '';
        uploadArea.innerHTML = '<i class="fas fa-camera"></i><p>Clique para simular scan de rótulo</p><small>Demo em tempo real para apresentação</small>';
        
        resultDiv.style.display = 'none';
        resultDiv.innerHTML = '';
    }
}

// Correção do formulário de contato
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('.btn-submit');
            const originalText = submitBtn.innerHTML;
            
            // Simular envio
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                // Mostrar mensagem de sucesso
                const successMessage = document.createElement('div');
                successMessage.style.cssText = `
                    background: rgba(46, 204, 113, 0.1);
                    color: var(--primary-green);
                    padding: 1rem;
                    border-radius: 8px;
                    margin-top: 1rem;
                    text-align: center;
                    font-weight: 600;
                `;
                successMessage.innerHTML = '<i class="fas fa-check-circle"></i> Mensagem enviada com sucesso! Entraremos em contato em breve.';
                
                this.appendChild(successMessage);
                
                // Resetar formulário
                this.reset();
                
                // Resetar botão
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                // Remover mensagem após 5 segundos
                setTimeout(() => {
                    successMessage.remove();
                }, 5000);
                
                console.log('Formulário de contato enviado');
            }, 2000);
        });
    }
}

// Correção dos botões de navegação
function setupNavigationButtons() {
    // Botões no header
    const navButtons = document.querySelectorAll('.nav-link, .btn-hero');
    
    navButtons.forEach(button => {
        const href = button.getAttribute('href');
        
        if (href && href.startsWith('#')) {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    const headerHeight = document.querySelector('.header')?.offsetHeight || 80;
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                    
                    // Fechar menu mobile se estiver aberto
                    const navMenu = document.querySelector('.nav-menu');
                    const mobileToggle = document.querySelector('.mobile-menu-toggle');
                    
                    if (navMenu && window.innerWidth <= 768) {
                        navMenu.style.display = 'none';
                        if (mobileToggle) {
                            mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
                        }
                    }
                }
            });
        }
    });
}

// Correção do botão de newsletter
function setupNewsletterForm() {
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            if (!emailInput.value) {
                emailInput.style.borderColor = '#e74c3c';
                return;
            }
            
            // Simular inscrição
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                // Mostrar sucesso
                const successMessage = document.createElement('div');
                successMessage.style.cssText = `
                    background: rgba(46, 204, 113, 0.1);
                    color: var(--primary-green);
                    padding: 0.5rem;
                    border-radius: 4px;
                    margin-top: 0.5rem;
                    font-size: 0.9rem;
                    text-align: center;
                `;
                successMessage.innerHTML = '✅ Inscrito com sucesso!';
                
                this.appendChild(successMessage);
                
                // Resetar
                emailInput.value = '';
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                // Remover mensagem após 3 segundos
                setTimeout(() => {
                    successMessage.remove();
                }, 3000);
                
                console.log('Newsletter inscrita:', emailInput.value);
            }, 1000);
        });
    }
}

// Inicializar todas as correções
function initializeCorrections() {
    setupPricingButtons();
    setupUploadButton();
    setupContactForm();
    setupNavigationButtons();
    setupNewsletterForm();
    
    console.log('Correções de botões inicializadas com sucesso!');
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeCorrections);
} else {
    initializeCorrections();
}

// Tornar funções globais se necessário
window.resetDemo = resetDemo;
