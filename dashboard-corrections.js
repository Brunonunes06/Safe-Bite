// Correções para botões do dashboard.html
// Adicionar este script ao final do dashboard.html

// Correção do botão "Ver Todos" no dashboard
function setupDashboardButtons() {
    // Botão "Ver Todos" de scans recentes
    const viewAllBtn = document.querySelector('a[href="#history"]');
    if (viewAllBtn) {
        viewAllBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Redirecionando para histórico...');
            window.location.href = 'history.html';
        });
    }

    // Botão "Fazer Upgrade"
    const upgradeBtn = document.getElementById('upgradeBtn');
    if (upgradeBtn) {
        upgradeBtn.addEventListener('click', function() {
            console.log('Botão de upgrade clicado');
            window.location.href = 'payment.html';
        });
    }

    // Botão "Fazer Primeiro Scan"
    const firstScanBtn = document.getElementById('firstScanBtn');
    if (firstScanBtn) {
        firstScanBtn.addEventListener('click', function() {
            console.log('Botão de primeiro scan clicado');
            window.location.href = 'scanner.html';
        });
    }

    // Botões de navegação lateral
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href && href !== '#') {
                e.preventDefault();
                console.log('Navegando para:', href);
                window.location.href = href;
            }
        });
    });

    // Botão de logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            console.log('Botão de logout clicado');
            
            // Limpar token
            localStorage.removeItem('nutriScanToken');
            
            // Mostrar confirmação
            if (confirm('Tem certeza que deseja sair?')) {
                window.location.href = 'index.html';
            }
        });
    }
}

// Simular carregamento de dados do dashboard
function loadDashboardData() {
    // Simular dados de usuário
    const userData = {
        name: 'João da Silva',
        email: 'joao@exemplo.com',
        isPremium: false,
        stats: {
            totalScans: 12,
            safeProducts: 8,
            warningProducts: 3,
            dangerProducts: 1
        }
    };

    // Atualizar informações do usuário
    const userNameElements = document.querySelectorAll('#userName, .user-name');
    userNameElements.forEach(el => {
        if (el) el.textContent = userData.name;
    });

    // Atualizar estatísticas
    const statsElements = {
        totalScans: document.getElementById('totalScans'),
        safeProducts: document.getElementById('safeProducts'),
        warningProducts: document.getElementById('warningProducts'),
        dangerProducts: document.getElementById('dangerProducts')
    };

    Object.keys(statsElements).forEach(key => {
        if (statsElements[key]) {
            statsElements[key].textContent = userData.stats[key];
        }
    });

    // Mostrar/esconder card de upgrade
    const upgradeCard = document.getElementById('upgradeCard');
    if (upgradeCard) {
        upgradeCard.style.display = userData.isPremium ? 'none' : 'block';
    }

    // Simular scans recentes
    const recentScans = document.getElementById('recentScans');
    if (recentScans) {
        const mockScans = [
            {
                product: 'Biscoito Chocolate',
                brand: 'Nestlé',
                risk: 'caution',
                date: '22/04/2026'
            },
            {
                product: 'Maçã Gala',
                brand: 'Natureza',
                risk: 'safe',
                date: '21/04/2026'
            },
            {
                product: 'Iogurte Natural',
                brand: 'Danone',
                risk: 'warning',
                date: '20/04/2026'
            }
        ];

        recentScans.innerHTML = mockScans.map(scan => `
            <div class="scan-item">
                <div class="scan-info">
                    <div class="scan-product">${scan.product}</div>
                    <div class="scan-brand">${scan.brand}</div>
                    <div class="scan-date">${scan.date}</div>
                </div>
                <div class="scan-risk ${scan.risk}">
                    ${scan.risk === 'safe' ? '✅ Seguro' : scan.risk === 'caution' ? '⚠️ Cuidado' : '❌ Evitar'}
                </div>
            </div>
        `).join('');
    }

    // Simular categorias
    const categoryChart = document.getElementById('categoryChart');
    if (categoryChart) {
        const categories = [
            { name: 'Biscoitos', count: 5, color: '#3498db' },
            { name: 'Frutas', count: 3, color: '#2ecc71' },
            { name: 'Laticínios', count: 2, color: '#f39c12' },
            { name: 'Outros', count: 2, color: '#9b59b6' }
        ];

        categoryChart.innerHTML = categories.map(cat => `
            <div class="category-item">
                <div class="category-bar" style="width: ${cat.count * 20}%; background: ${cat.color};"></div>
                <div class="category-info">
                    <span class="category-name">${cat.name}</span>
                    <span class="category-count">${cat.count}</span>
                </div>
            </div>
        `).join('');
    }

    // Esconder empty state se tiver dados
    const emptyState = document.getElementById('emptyState');
    const dashboardContent = document.getElementById('dashboardContent');
    
    if (emptyState && dashboardContent) {
        if (userData.stats.totalScans > 0) {
            emptyState.style.display = 'none';
            dashboardContent.style.display = 'block';
        } else {
            emptyState.style.display = 'block';
            dashboardContent.style.display = 'none';
        }
    }
}

// Inicializar correções do dashboard
function initializeDashboardCorrections() {
    setupDashboardButtons();
    loadDashboardData();
    
    console.log('Correções do dashboard inicializadas!');
}

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboardCorrections);
} else {
    initializeDashboardCorrections();
}
