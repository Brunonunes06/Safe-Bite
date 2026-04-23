// Correções para pagamento brasileiro (PIX e Boleto)
// Adicionar este script ao final do payment.html

// Classe para gerenciar pagamentos brasileiros
class BrazilianPaymentManager {
  constructor() {
    this.selectedMethod = 'pix';
    this.currentPayment = null;
    this.init();
  }

  init() {
    this.setupPaymentMethods();
    this.setupBrazilianPaymentForm();
    this.loadPaymentMethods();
  }

  setupPaymentMethods() {
    const methods = document.querySelectorAll('.payment-method');
    
    methods.forEach(method => {
      method.addEventListener('click', () => {
        // Remover classe active de todos
        methods.forEach(m => m.classList.remove('active'));
        
        // Adicionar classe active ao selecionado
        method.classList.add('active');
        
        this.selectedMethod = method.dataset.method;
        this.updatePaymentForm();
      });
    });

    // Selecionar PIX por padrão
    const pixMethod = document.querySelector('[data-method="pix"]');
    if (pixMethod) {
      pixMethod.classList.add('active');
      this.selectedMethod = 'pix';
      this.updatePaymentForm();
    }
  }

  updatePaymentForm() {
    const formContainer = document.getElementById('checkoutForm');
    if (!formContainer) return;

    if (this.selectedMethod === 'pix') {
      this.showPixForm();
    } else if (this.selectedMethod === 'boleto') {
      this.showBoletoForm();
    } else if (this.selectedMethod === 'card') {
      this.showCardForm();
    }
  }

  showPixForm() {
    const formContainer = document.getElementById('checkoutForm');
    formContainer.innerHTML = `
      <div class="pix-form">
        <div class="form-header">
          <i class="fas fa-qrcode"></i>
          <h3>Pagamento via PIX</h3>
          <p>Escaneie o QR Code ou copie o código PIX</p>
        </div>

        <div class="pix-preview" id="pixPreview">
          <div class="qr-code-container">
            <div class="qr-code-placeholder">
              <i class="fas fa-qrcode"></i>
              <p>QR Code será gerado</p>
            </div>
          </div>
          <div class="pix-info">
            <div class="pix-amount">
              <label>Valor:</label>
              <span class="amount">R$ 9,90</span>
            </div>
            <div class="pix-key">
              <label>Chave PIX:</label>
              <span class="key">nutri-scan@pix.com.br</span>
            </div>
          </div>
        </div>

        <div class="customer-form">
          <div class="form-group">
            <label for="pixName">Nome Completo</label>
            <input type="text" id="pixName" placeholder="Seu nome completo" required>
          </div>
          <div class="form-group">
            <label for="pixEmail">Email</label>
            <input type="email" id="pixEmail" placeholder="seu@email.com" required>
          </div>
          <div class="form-group">
            <label for="pixCpf">CPF</label>
            <input type="text" id="pixCpf" placeholder="000.000.000-00" maxlength="14" required>
          </div>
        </div>

        <button type="button" class="btn-primary" onclick="paymentManager.generatePix()">
          <i class="fas fa-qrcode"></i>
          Gerar PIX
        </button>
      </div>
    `;

    this.setupCpfMask();
  }

  showBoletoForm() {
    const formContainer = document.getElementById('checkoutForm');
    formContainer.innerHTML = `
      <div class="boleto-form">
        <div class="form-header">
          <i class="fas fa-barcode"></i>
          <h3>Pagamento via Boleto</h3>
          <p>Pague em qualquer banco, lotérica ou aplicativo</p>
        </div>

        <div class="boleto-preview" id="boletoPreview">
          <div class="boleto-placeholder">
            <i class="fas fa-barcode"></i>
            <p>Boleto será gerado</p>
          </div>
        </div>

        <div class="customer-form">
          <div class="form-group">
            <label for="boletoName">Nome Completo</label>
            <input type="text" id="boletoName" placeholder="Seu nome completo" required>
          </div>
          <div class="form-group">
            <label for="boletoEmail">Email</label>
            <input type="email" id="boletoEmail" placeholder="seu@email.com" required>
          </div>
          <div class="form-group">
            <label for="boletoCpf">CPF</label>
            <input type="text" id="boletoCpf" placeholder="000.000.000-00" maxlength="14" required>
          </div>
          <div class="form-group">
            <label for="boletoAddress">Endereço</label>
            <input type="text" id="boletoAddress" placeholder="Rua, número, bairro, cidade - UF" required>
          </div>
        </div>

        <div class="boleto-info">
          <div class="info-item">
            <i class="fas fa-calendar"></i>
            <span>Vencimento: 3 dias úteis</span>
          </div>
          <div class="info-item">
            <i class="fas fa-percent"></i>
            <span>Taxa: R$ 1,50</span>
          </div>
          <div class="info-item">
            <i class="fas fa-clock"></i>
            <span>Processamento: 1-3 dias</span>
          </div>
        </div>

        <button type="button" class="btn-primary" onclick="paymentManager.generateBoleto()">
          <i class="fas fa-barcode"></i>
          Gerar Boleto
        </button>
      </div>
    `;

    this.setupCpfMask();
  }

  showCardForm() {
    const formContainer = document.getElementById('checkoutForm');
    formContainer.innerHTML = `
      <div class="card-form">
        <div class="form-header">
          <i class="fas fa-credit-card"></i>
          <h3>Pagamento via Cartão</h3>
          <p>Pagamento processado pelo Stripe</p>
        </div>

        <form id="paymentForm">
          <div class="form-group">
            <label for="cardNumber">Número do Cartão</label>
            <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" maxlength="19" required>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label for="cardExpiry">Validade</label>
              <input type="text" id="cardExpiry" placeholder="MM/AA" maxlength="5" required>
            </div>
            <div class="form-group">
              <label for="cardCvc">CVV</label>
              <input type="text" id="cardCvc" placeholder="123" maxlength="4" required>
            </div>
          </div>
          <div class="form-group">
            <label for="cardName">Nome no Cartão</label>
            <input type="text" id="cardName" placeholder="NOME COMO NO CARTÃO" required>
          </div>
          <button type="submit" class="btn-primary" id="checkoutButton">
            <i class="fas fa-lock"></i>
            Pagar R$ 9,90
          </button>
        </form>
      </div>
    `;

    this.setupCardFormatting();
  }

  setupBrazilianPaymentForm() {
    // Event listeners serão configurados dinamicamente
  }

  setupCpfMask() {
    const cpfInputs = document.querySelectorAll('input[id*="Cpf"]');
    
    cpfInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length >= 3 && value.length <= 6) {
          value = value.slice(0, 3) + '.' + value.slice(3);
        } else if (value.length > 6 && value.length <= 9) {
          value = value.slice(0, 3) + '.' + value.slice(3, 6) + '.' + value.slice(6);
        } else if (value.length > 9) {
          value = value.slice(0, 3) + '.' + value.slice(3, 6) + '.' + value.slice(6, 9) + '-' + value.slice(9, 11);
        }
        
        e.target.value = value;
      });
    });
  }

  setupCardFormatting() {
    const cardNumber = document.getElementById('cardNumber');
    const cardExpiry = document.getElementById('cardExpiry');
    const cardCvc = document.getElementById('cardCvc');

    if (cardNumber) {
      cardNumber.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\s/g, '');
        let formattedValue = '';
        
        for (let i = 0; i < value.length; i++) {
          if (i > 0 && i % 4 === 0) {
            formattedValue += ' ';
          }
          formattedValue += value[i];
        }
        
        e.target.value = formattedValue;
      });
    }

    if (cardExpiry) {
      cardExpiry.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length >= 2) {
          value = value.slice(0, 2) + '/' + value.slice(2, 4);
        }
        
        e.target.value = value;
      });
    }

    if (cardCvc) {
      cardCvc.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4);
      });
    }
  }

  async loadPaymentMethods() {
    try {
      const response = await fetch('/api/payment/methods');
      const data = await response.json();
      
      if (data.success) {
        this.displayPaymentMethods(data.methods);
      }
    } catch (error) {
      console.error('Erro ao carregar métodos:', error);
    }
  }

  displayPaymentMethods(methods) {
    // Atualizar informações dos métodos se necessário
    const methodElements = document.querySelectorAll('.payment-method');
    
    methodElements.forEach(element => {
      const methodId = element.dataset.method;
      const method = methods.find(m => m.id === methodId);
      
      if (method) {
        const small = element.querySelector('small');
        if (small && method.processingTime) {
          small.textContent = method.processingTime;
        }
      }
    });
  }

  async generatePix() {
    const name = document.getElementById('pixName')?.value;
    const email = document.getElementById('pixEmail')?.value;
    const cpf = document.getElementById('pixCpf')?.value;

    if (!name || !email || !cpf) {
      this.showError('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const response = await fetch('/api/payment/pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: 9.90,
          description: 'Assinatura Premium Nutri-Scan',
          customerInfo: { name, email, cpf }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        this.displayPixPayment(data.payment);
      } else {
        this.showError(data.message || 'Erro ao gerar PIX');
      }
    } catch (error) {
      console.error('Erro ao gerar PIX:', error);
      this.showError('Erro ao gerar pagamento PIX');
    }
  }

  displayPixPayment(payment) {
    const preview = document.getElementById('pixPreview');
    if (!preview) return;

    preview.innerHTML = `
      <div class="qr-code-container">
        <img src="${payment.qrCode}" alt="QR Code PIX" class="qr-code-image">
        <p>Escaneie com seu app de banco</p>
      </div>
      <div class="pix-info">
        <div class="pix-amount">
          <label>Valor:</label>
          <span class="amount">R$ ${payment.amount.toFixed(2)}</span>
        </div>
        <div class="pix-key">
          <label>Código PIX:</label>
          <div class="pix-code-container">
            <span class="key">${payment.pixCode}</span>
            <button class="copy-btn" onclick="paymentManager.copyToClipboard('${payment.pixCode}')">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
        <div class="pix-expires">
          <label>Expira em:</label>
          <span>${new Date(payment.expiresAt).toLocaleString('pt-BR')}</span>
        </div>
      </div>
    `;

    this.currentPayment = payment;
    this.startPaymentStatusCheck(payment.id);
  }

  async generateBoleto() {
    const name = document.getElementById('boletoName')?.value;
    const email = document.getElementById('boletoEmail')?.value;
    const cpf = document.getElementById('boletoCpf')?.value;
    const address = document.getElementById('boletoAddress')?.value;

    if (!name || !email || !cpf || !address) {
      this.showError('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const response = await fetch('/api/payment/boleto', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: 9.90,
          customerInfo: { name, email, cpf, address }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        this.displayBoletoPayment(data.payment);
      } else {
        this.showError(data.message || 'Erro ao gerar boleto');
      }
    } catch (error) {
      console.error('Erro ao gerar boleto:', error);
      this.showError('Erro ao gerar boleto');
    }
  }

  displayBoletoPayment(payment) {
    const preview = document.getElementById('boletoPreview');
    if (!preview) return;

    preview.innerHTML = `
      <div class="boleto-generated">
        <div class="barcode-container">
          <div class="barcode">${payment.barcodeNumber}</div>
        </div>
        <div class="digitable-line">
          <label>Linha Digitável:</label>
          <div class="line-container">
            <span class="line">${payment.digitableLine}</span>
            <button class="copy-btn" onclick="paymentManager.copyToClipboard('${payment.digitableLine}')">
              <i class="fas fa-copy"></i>
            </button>
          </div>
        </div>
        <div class="boleto-details">
          <div class="detail-item">
            <label>Vencimento:</label>
            <span>${new Date(payment.dueDate).toLocaleDateString('pt-BR')}</span>
          </div>
          <div class="detail-item">
            <label>Beneficiário:</label>
            <span>${payment.beneficiary.name}</span>
          </div>
          <div class="detail-item">
            <label>Valor:</label>
            <span>R$ ${payment.amount.toFixed(2)}</span>
          </div>
        </div>
        <div class="boleto-instructions">
          <h4>Instruções:</h4>
          <ul>
            ${payment.instructions.map(inst => `<li>${inst}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;

    this.currentPayment = payment;
    this.startPaymentStatusCheck(payment.id);
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showSuccess('Copiado para a área de transferência!');
    }).catch(() => {
      this.showError('Erro ao copiar');
    });
  }

  startPaymentStatusCheck(paymentId) {
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/payment/${paymentId}/status`);
        const data = await response.json();
        
        if (data.success) {
          if (data.payment.status === 'paid') {
            this.showSuccess('Pagamento confirmado! Redirecionando...');
            setTimeout(() => {
              window.location.href = 'dashboard.html';
            }, 3000);
          } else if (data.payment.status === 'expired') {
            this.showError('Pagamento expirado. Tente novamente.');
          } else {
            // Continuar verificando
            setTimeout(checkStatus, 5000);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error);
        setTimeout(checkStatus, 10000);
      }
    };

    // Iniciar verificação após 5 segundos
    setTimeout(checkStatus, 5000);
  }

  showError(message) {
    this.showMessage(message, 'error');
  }

  showSuccess(message) {
    this.showMessage(message, 'success');
  }

  showMessage(message, type) {
    // Remover mensagens anteriores
    const existingMessages = document.querySelectorAll('.payment-message');
    existingMessages.forEach(msg => msg.remove());

    const messageDiv = document.createElement('div');
    messageDiv.className = `payment-message ${type}`;
    messageDiv.innerHTML = `
      <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
      <span>${message}</span>
    `;

    const form = document.getElementById('checkoutForm');
    if (form) {
      form.insertBefore(messageDiv, form.firstChild);
      
      // Remover mensagem após 5 segundos
      setTimeout(() => {
        messageDiv.remove();
      }, 5000);
    }
  }
}

// Inicializar gerenciador de pagamento
let paymentManager;

// Função global para cópia
window.copyToClipboard = (text) => {
  if (paymentManager) {
    paymentManager.copyToClipboard(text);
  }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  paymentManager = new BrazilianPaymentManager();
});
