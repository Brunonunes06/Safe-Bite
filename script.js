// Nutri-Scan JavaScript - Funcionalidades Interativas

// Variáveis globais
let isMenuOpen = false;
let currentSection = '';

// DOMContentLoaded - Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Função principal de inicialização
function initializeApp() {
    setupMobileMenu();
    setupSmoothScrolling();
    setupScrollAnimations();
    setupContactForm();
    setupDemoUpload();
    setupNewsletterForm();
    setupScrollHeader();
    setupAnimations();
    console.log('Nutri-Scan inicializado com sucesso!');
}

// Menu Mobile
function setupMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            isMenuOpen = !isMenuOpen;
            
            if (isMenuOpen) {
                navMenu.style.display = 'flex';
                navMenu.style.position = 'absolute';
                navMenu.style.top = '100%';
                navMenu.style.left = '0';
                navMenu.style.right = '0';
                navMenu.style.background = 'white';
                navMenu.style.flexDirection = 'column';
                navMenu.style.padding = '2rem';
                navMenu.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
                mobileToggle.innerHTML = '<i class="fas fa-times"></i>';
            } else {
                navMenu.style.display = 'none';
                mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
        
        // Fechar menu ao clicar em link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (isMenuOpen) {
                    isMenuOpen = false;
                    navMenu.style.display = 'none';
                    mobileToggle.innerHTML = '<i class="fas fa-bars"></i>';
                }
            });
        });
    }
}

// Scroll suave para seções
function setupSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link, .btn-hero');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                
                if (targetSection) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetSection.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
}

// Scroll programático
function scrollToSection(sectionId) {
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const targetPosition = targetSection.offsetTop - headerHeight;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Header dinâmico ao rolar
function setupScrollHeader() {
    const header = document.querySelector('.header');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }
        
        lastScroll = currentScroll;
    });
}

// Animações ao rolar
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observar elementos para animação
    const animatedElements = document.querySelectorAll('.step, .business-card, .pricing-card, .contact-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Formulário de contato
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = {
                nome: formData.get('nome'),
                email: formData.get('email'),
                mensagem: formData.get('mensagem')
            };
            
            // Validação simples
            if (!data.nome || !data.email || !data.mensagem) {
                showNotification('Por favor, preencha todos os campos!', 'error');
                return;
            }
            
            // Simulação de envio
            console.log('Dados do formulário:', data);
            
            // Salvar no localStorage para demonstração
            const messages = JSON.parse(localStorage.getItem('nutriScanMessages') || '[]');
            messages.push({
                ...data,
                timestamp: new Date().toISOString(),
                id: Date.now()
            });
            localStorage.setItem('nutriScanMessages', JSON.stringify(messages));
            
            // Feedback visual
            showNotification('Mensagem enviada com sucesso! Entraremos em contato em breve.', 'success');
            this.reset();
            
            // Log para debug
            console.log('Mensagens salvas:', messages);
        });
    }
}

// Demo de upload melhorado para apresentação
function setupDemoUpload() {
    const uploadArea = document.getElementById('demoUpload');
    const demoResult = document.getElementById('demoResult');
    
    if (uploadArea && demoResult) {
        uploadArea.addEventListener('click', function() {
            // Simular processamento mais realista
            this.innerHTML = '<i class="fas fa-camera"></i><p>Capturando imagem...</p>';
            
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-spinner fa-spin"></i><p>Analisando rótulo com IA...</p>';
                
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-brain"></i><p>Processando ingredientes...</p>';
                    
                    setTimeout(() => {
                        // Mostrar resultado detalhado
                        uploadArea.style.display = 'none';
                        demoResult.style.display = 'block';
                        demoResult.innerHTML = generateDetailedResult();
                        
                        // Animar resultado
                        demoResult.style.opacity = '0';
                        demoResult.style.transform = 'translateY(20px)';
                        
                        setTimeout(() => {
                            demoResult.style.transition = 'all 0.5s ease';
                            demoResult.style.opacity = '1';
                            demoResult.style.transform = 'translateY(0)';
                            
                            // Animar cada item do resultado
                            const resultItems = demoResult.querySelectorAll('.result-item');
                            resultItems.forEach((item, index) => {
                                setTimeout(() => {
                                    item.style.opacity = '1';
                                    item.style.transform = 'translateX(0)';
                                }, 200 * index);
                            });
                        }, 100);
                        
                        console.log('Demo de análise concluída com detalhes');
                    }, 800);
                }, 800);
            }, 800);
        });
        
        // Reset demo
        const resetDemo = () => {
            uploadArea.style.display = 'block';
            demoResult.style.display = 'none';
            uploadArea.innerHTML = `
                <i class="fas fa-camera"></i>
                <p>Clique para simular scan de rótulo</p>
                <small>Demo em tempo real para apresentação</small>
            `;
        };
        
        // Adicionar botão de reset após resultado
        setTimeout(() => {
            if (demoResult.querySelector('.reset-btn')) return;
            
            const resetBtn = document.createElement('button');
            resetBtn.className = 'reset-btn';
            resetBtn.textContent = 'Fazer Nova Análise';
            resetBtn.style.cssText = `
                margin-top: 1.5rem;
                padding: 0.8rem 1.5rem;
                background: var(--gradient-primary);
                color: white;
                border: none;
                border-radius: 25px;
                cursor: pointer;
                font-weight: 600;
                font-size: 1rem;
                transition: all 0.3s ease;
            `;
            resetBtn.onmouseover = () => resetBtn.style.transform = 'translateY(-2px)';
            resetBtn.onmouseout = () => resetBtn.style.transform = 'translateY(0)';
            resetBtn.onclick = resetDemo;
            demoResult.appendChild(resetBtn);
        }, 100);
    }
}

// Gerar resultado detalhado para demo
function generateDetailedResult() {
    return `
        <div class="result-header">
            <h5>Resultado da Análise Nutricional</h5>
            <span class="confidence">95% confiança</span>
        </div>
        
        <div class="product-info">
            <div class="product-name">
                <i class="fas fa-box"></i>
                <span>Biscoito Recheado Chocolate</span>
            </div>
            <div class="scan-time">
                <i class="fas fa-clock"></i>
                <span>Análise em 3.2 segundos</span>
            </div>
        </div>
        
        <div class="result-content">
            <div class="result-section">
                <h6>Ingredientes Detectados</h6>
                <div class="result-item danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div class="item-details">
                        <strong>Açúcar</strong>
                        <span>15g por porção (Alto)</span>
                    </div>
                </div>
                <div class="result-item warning">
                    <i class="fas fa-exclamation-circle"></i>
                    <div class="item-details">
                        <strong>Glúten</strong>
                        <span>Presente no trigo</span>
                    </div>
                </div>
                <div class="result-item warning">
                    <i class="fas fa-exclamation-circle"></i>
                    <div class="item-details">
                        <strong>Lactose</strong>
                        <span>Presente no leite</span>
                    </div>
                </div>
                <div class="result-item safe">
                    <i class="fas fa-check-circle"></i>
                    <div class="item-details">
                        <strong>Fibras</strong>
                        <span>2g por porção</span>
                    </div>
                </div>
            </div>
            
            <div class="result-section">
                <h6>Alertas Personalizados</h6>
                <div class="alert-item">
                    <i class="fas fa-user-diabetic"></i>
                    <span><strong>Diabéticos:</strong> Risco alto - Evitar consumo</span>
                </div>
                <div class="alert-item">
                    <i class="fas fa-user-allergic"></i>
                    <span><strong>Celíacos:</strong> Contém glúten - Não recomendado</span>
                </div>
                <div class="alert-item">
                    <i class="fas fa-user-intolerant"></i>
                    <span><strong>Intolerantes:</strong> Contém lactose - Cuidado</span>
                </div>
            </div>
            
            <div class="result-section">
                <h6>Recomendações</h6>
                <div class="recommendation">
                    <i class="fas fa-lightbulb"></i>
                    <span>Procure versões sem açúcar ou integrais</span>
                </div>
                <div class="recommendation">
                    <i class="fas fa-apple-alt"></i>
                    <span>Frutas frescas como alternativa saudável</span>
                </div>
            </div>
        </div>
        
        <style>
        .result-item {
            opacity: 0;
            transform: translateX(-20px);
            transition: all 0.3s ease;
        }
        .result-item.danger {
            background: rgba(231, 76, 60, 0.1);
            color: #e74c3c;
            border-left: 4px solid #e74c3c;
        }
        .result-item.warning {
            background: rgba(241, 196, 15, 0.1);
            color: #f39c12;
            border-left: 4px solid #f39c12;
        }
        .result-item.safe {
            background: rgba(46, 204, 113, 0.1);
            color: #2ecc71;
            border-left: 4px solid #2ecc71;
        }
        .item-details {
            flex: 1;
        }
        .item-details span {
            display: block;
            font-size: 0.9rem;
            opacity: 0.8;
        }
        .product-info {
            background: var(--light-gray);
            padding: 1rem;
            border-radius: 10px;
            margin-bottom: 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .product-name, .scan-time {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
        }
        .result-section {
            margin-bottom: 1.5rem;
        }
        .result-section h6 {
            font-weight: 600;
            margin-bottom: 0.8rem;
            color: var(--text-dark);
        }
        .alert-item, .recommendation {
            display: flex;
            align-items: center;
            gap: 0.8rem;
            padding: 0.5rem 0;
            font-size: 0.95rem;
        }
        .alert-item i {
            color: var(--primary-blue);
        }
        .recommendation i {
            color: var(--primary-green);
        }
        </style>
    `;
}

// Newsletter
function setupNewsletterForm() {
    const newsletterForm = document.querySelector('.newsletter-form');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            
            if (!email) {
                showNotification('Por favor, insira seu email!', 'error');
                return;
            }
            
            // Simulação de inscrição
            console.log('Newsletter signup:', email);
            
            // Salvar no localStorage
            const subscribers = JSON.parse(localStorage.getItem('nutriScanSubscribers') || '[]');
            subscribers.push({
                email: email,
                timestamp: new Date().toISOString(),
                id: Date.now()
            });
            localStorage.setItem('nutriScanSubscribers', JSON.stringify(subscribers));
            
            showNotification('Inscrição realizada com sucesso!', 'success');
            this.reset();
        });
    }
}

// Sistema de notificações
function showNotification(message, type = 'info') {
    // Remover notificações existentes
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Criar nova notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Estilos
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        color: white;
        font-weight: 600;
        z-index: 10000;
        max-width: 300px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
    
    // Cores por tipo
    const colors = {
        success: 'linear-gradient(135deg, #2ecc71, #27ae60)',
        error: 'linear-gradient(135deg, #e74c3c, #c0392b)',
        info: 'linear-gradient(135deg, #3498db, #2980b9)'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover após 5 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 5000);
}

// Configurar animações adicionais
function setupAnimations() {
    // Animação de números nas estatísticas
    const stats = document.querySelectorAll('.stat h3');
    
    const animateNumber = (element, target) => {
        let current = 0;
        const increment = target / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            // Formatar número
            if (target === 95) {
                element.textContent = Math.round(current) + '%';
            } else if (target === 10000) {
                element.textContent = (current / 1000).toFixed(0) + 'k+';
            } else {
                element.textContent = '24/7';
            }
        }, 30);
    };
    
    // Observer para animar números quando visível
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.animated) {
                const text = entry.target.textContent;
                let target = 95; // default
                
                if (text.includes('95%')) target = 95;
                else if (text.includes('10k+')) target = 10000;
                else if (text.includes('24/7')) target = 24;
                
                animateNumber(entry.target, target);
                entry.target.animated = true;
            }
        });
    });
    
    stats.forEach(stat => statsObserver.observe(stat));
    
    // Efeito parallax no hero
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const hero = document.querySelector('.hero');
        const heroContent = document.querySelector('.hero-content');
        
        if (hero && heroContent && scrolled < 800) {
            heroContent.style.transform = `translateY(${scrolled * 0.5}px)`;
            heroContent.style.opacity = 1 - (scrolled / 800);
        }
    });
}

// Utilitários
const utils = {
    // Debounce para performance
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Verificar se elemento está visível
    isElementInViewport: function(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.left <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    
    // Formatar data
    formatDate: function(date) {
        return new Date(date).toLocaleDateString('pt-BR');
    }
};

// Exportar funções para uso global
window.NutriScan = {
    scrollToSection,
    showNotification,
    utils
};

// Log de inicialização
console.log('%c Nutri-Scan v1.0 ', 'background: linear-gradient(135deg, #2ecc71, #3498db); color: white; font-weight: bold; padding: 5px 10px; border-radius: 5px;');
