// Correções para botões do scanner.html
// Adicionar este script ao final do scanner.html

// Correção dos botões do scanner
function setupScannerButtons() {
    // Botão de upload de imagem
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');
    
    if (uploadBtn && fileInput) {
        uploadBtn.addEventListener('click', function() {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                handleImageUpload(e.target.files[0]);
            }
        });
    }

    // Botão de scan simulado
    const scanBtn = document.getElementById('scanBtn');
    if (scanBtn) {
        scanBtn.addEventListener('click', function() {
            console.log('Botão de scan clicado');
            simulateScan();
        });
    }

    // Botão "Novo Scan"
    const newScanBtn = document.getElementById('newScanBtn');
    if (newScanBtn) {
        newScanBtn.addEventListener('click', function() {
            console.log('Novo scan solicitado');
            resetScanner();
        });
    }

    // Botão de salvar scan
    const saveScanBtn = document.getElementById('saveScanBtn');
    if (saveScanBtn) {
        saveScanBtn.addEventListener('click', function() {
            console.log('Salvar scan clicado');
            saveCurrentScan();
        });
    }

    // Botões de navegação
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
}

// Simular upload de imagem
function handleImageUpload(file) {
    console.log('Imagem carregada:', file.name);
    
    const uploadArea = document.getElementById('uploadArea');
    const previewImg = document.getElementById('previewImg');
    
    if (uploadArea && previewImg) {
        // Mostrar preview
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
            uploadArea.style.display = 'none';
        };
        reader.readAsDataURL(file);
        
        // Habilitar botão de scan
        const scanBtn = document.getElementById('scanBtn');
        if (scanBtn) {
            scanBtn.disabled = false;
            scanBtn.classList.add('active');
        }
    }
}

// Simular processo de scan
function simulateScan() {
    const scanBtn = document.getElementById('scanBtn');
    const processingArea = document.getElementById('processingArea');
    const resultArea = document.getElementById('resultArea');
    
    if (scanBtn) {
        // Desabilitar botão
        scanBtn.disabled = true;
        scanBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';
    }
    
    if (processingArea) {
        processingArea.style.display = 'block';
        
        // Simular etapas do processamento
        setTimeout(() => {
            processingArea.innerHTML = `
                <div class="processing-step active">
                    <i class="fas fa-camera"></i>
                    <span>Imagem capturada</span>
                </div>
                <div class="processing-step active">
                    <i class="fas fa-brain"></i>
                    <span>Analisando com IA...</span>
                </div>
                <div class="processing-step">
                    <i class="fas fa-shield-alt"></i>
                    <span>Verificando segurança...</span>
                </div>
            `;
        }, 1000);
        
        setTimeout(() => {
            processingArea.innerHTML = `
                <div class="processing-step active">
                    <i class="fas fa-camera"></i>
                    <span>Imagem capturada</span>
                </div>
                <div class="processing-step active">
                    <i class="fas fa-brain"></i>
                    <span>IA concluída</span>
                </div>
                <div class="processing-step active">
                    <i class="fas fa-shield-alt"></i>
                    <span>Segurança verificada</span>
                </div>
            `;
        }, 2000);
        
        setTimeout(() => {
            showScanResults();
        }, 3000);
    }
}

// Mostrar resultados do scan
function showScanResults() {
    const processingArea = document.getElementById('processingArea');
    const resultArea = document.getElementById('resultArea');
    const scanBtn = document.getElementById('scanBtn');
    
    if (processingArea) processingArea.style.display = 'none';
    if (resultArea) resultArea.style.display = 'block';
    
    // Gerar resultado simulado
    const mockResult = {
        product: {
            name: 'Biscoito Chocolate Recheado',
            brand: 'Nestlé',
            barcode: '7891000123456',
            category: 'biscoitos'
        },
        analysis: {
            ingredients: ['farinha de trigo', 'açúcar', 'gordura vegetal', 'cacau', 'leite em pó'],
            allergens: ['glúten', 'lactose'],
            nutritionalInfo: {
                calories: 150,
                protein: 2,
                carbs: 20,
                fat: 7,
                sodium: 50
            },
            overallRisk: 'caution',
            alerts: [
                {
                    type: 'allergy',
                    severity: 'warning',
                    message: 'Contém lactose - pode causar desconforto',
                    ingredient: 'lactose'
                },
                {
                    type: 'health',
                    severity: 'info',
                    message: 'Alto teor de açúcar - consuma com moderação',
                    ingredient: 'açúcar'
                }
            ],
            recommendations: ['Consuma com moderação', 'Verifique rótulo para alérgenos']
        }
    };
    
    if (resultArea) {
        resultArea.innerHTML = `
            <div class="result-header">
                <h3>Resultado da Análise</h3>
                <span class="confidence">95% confiança</span>
            </div>
            
            <div class="product-info">
                <h4>${mockResult.product.name}</h4>
                <p class="brand">${mockResult.product.brand}</p>
                <p class="barcode">Código: ${mockResult.product.barcode}</p>
            </div>
            
            <div class="analysis-result">
                <div class="risk-indicator ${mockResult.analysis.overallRisk}">
                    ${mockResult.analysis.overallRisk === 'safe' ? '✅ Seguro' : 
                      mockResult.analysis.overallRisk === 'caution' ? '⚠️ Cuidado' : '❌ Evitar'}
                </div>
                
                <div class="ingredients-section">
                    <h5>Ingredientes Detectados:</h5>
                    <ul>
                        ${mockResult.analysis.ingredients.map(ing => `<li>${ing}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="alerts-section">
                    <h5>Alertas:</h5>
                    ${mockResult.analysis.alerts.map(alert => `
                        <div class="alert-item ${alert.severity}">
                            <i class="fas fa-${alert.severity === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                            <span>${alert.message}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="recommendations-section">
                    <h5>Recomendações:</h5>
                    <ul>
                        ${mockResult.analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
            </div>
            
            <div class="result-actions">
                <button class="btn-secondary" onclick="resetScanner()">
                    <i class="fas fa-redo"></i> Novo Scan
                </button>
                <button class="btn-primary" onclick="saveCurrentScan()">
                    <i class="fas fa-save"></i> Salvar Scan
                </button>
            </div>
        `;
    }
    
    // Resetar botão de scan
    if (scanBtn) {
        scanBtn.disabled = false;
        scanBtn.innerHTML = '<i class="fas fa-camera"></i> Fazer Scan';
    }
}

// Resetar scanner
function resetScanner() {
    const uploadArea = document.getElementById('uploadArea');
    const previewImg = document.getElementById('previewImg');
    const processingArea = document.getElementById('processingArea');
    const resultArea = document.getElementById('resultArea');
    const fileInput = document.getElementById('fileInput');
    const scanBtn = document.getElementById('scanBtn');
    
    if (uploadArea) uploadArea.style.display = 'block';
    if (previewImg) {
        previewImg.style.display = 'none';
        previewImg.src = '';
    }
    if (processingArea) processingArea.style.display = 'none';
    if (resultArea) resultArea.style.display = 'none';
    if (fileInput) fileInput.value = '';
    if (scanBtn) {
        scanBtn.disabled = true;
        scanBtn.innerHTML = '<i class="fas fa-camera"></i> Fazer Scan';
        scanBtn.classList.remove('active');
    }
    
    console.log('Scanner resetado');
}

// Salvar scan atual
function saveCurrentScan() {
    // Simular salvamento
    const saveBtn = document.getElementById('saveScanBtn');
    if (saveBtn) {
        const originalText = saveBtn.innerHTML;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        saveBtn.disabled = true;
        
        setTimeout(() => {
            saveBtn.innerHTML = '<i class="fas fa-check"></i> Salvo!';
            saveBtn.disabled = false;
            
            setTimeout(() => {
                saveBtn.innerHTML = originalText;
            }, 2000);
        }, 1500);
    }
    
    console.log('Scan salvo com sucesso');
}

// Inicializar correções do scanner
function initializeScannerCorrections() {
    setupScannerButtons();
    
    // Verificar se há elementos para inicializar
    const uploadBtn = document.getElementById('uploadBtn');
    if (uploadBtn) {
        uploadBtn.disabled = false;
    }
    
    console.log('Correções do scanner inicializadas!');
}

// Tornar funções globais
window.resetScanner = resetScanner;
window.saveCurrentScan = saveCurrentScan;

// Inicializar quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeScannerCorrections);
} else {
    initializeScannerCorrections();
}
