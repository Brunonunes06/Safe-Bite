/**
 * BACKEND_INTEGRATION_EXAMPLE.js
 * 
 * Exemplo de como integrar payment-brazil.js no seu projeto Express.js
 * Coloque este arquivo na pasta backend/ para referência de implementação
 */

// ============================================================
// EXEMPLO: Como integrar pagamentos no backend
// ============================================================

// 1. INSTALAR DEPENDÊNCIAS
// ─────────────────────────────────────────────────────────
// npm install mercadopago express cors dotenv

// 2. ARQUIVO: backend/server.js (ou server principal)
// ─────────────────────────────────────────────────────────

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Importar rotas de pagamento
const paymentBrazilRouter = require('./routes/payment-brazil');

// Rotas
app.use('/api/payment', paymentBrazilRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Servidor funcionando' });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Servidor de pagamento iniciado em http://localhost:${PORT}`);
  console.log(`✓ Endpoint de pagamento: http://localhost:${PORT}/api/payment`);
});

// 3. ARQUIVO: .env (na pasta raiz ou backend/)
// ─────────────────────────────────────────────────────────

// MP_ACCESS_TOKEN=seu_token_mercado_pago_aqui
// MP_PUBLIC_KEY=sua_public_key_mercado_pago_aqui
// NODE_ENV=development
// PORT=5000

// 4. ARQUIVO: backend/routes/payment-brazil.js
// ─────────────────────────────────────────────────────────
// [Já existe no projeto - use conforme está]

// 5. COMO TESTAR
// ─────────────────────────────────────────────────────────

/*
// Terminal 1: Iniciar servidor
$ cd backend
$ npm start

// Terminal 2: Abrir navegador
$ Acesse http://localhost:3000/payment.html

// Terminal 3: Testar via curl (opcional)
$ curl -X POST http://localhost:5000/api/payment/pix \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 9.90,
    "description": "Assinatura Premium",
    "customerInfo": {
      "name": "João Silva",
      "email": "joao@example.com",
      "cpf": "111.444.777-35"
    }
  }'
*/

// ============================================================
// ENDPOINTS DISPONÍVEIS
// ============================================================

/*

1. GET /api/payment/methods
   Retorna lista de métodos disponíveis
   
   Response:
   {
     "success": true,
     "methods": [
       { "id": "pix", "name": "PIX", "processingTime": "Instantâneo" },
       { "id": "boleto", "name": "Boleto", "processingTime": "1–3 dias úteis" },
       { "id": "card", "name": "Cartão", "processingTime": "Instantâneo" }
     ]
   }

2. POST /api/payment/pix
   Gera um PIX para pagamento
   
   Request Body:
   {
     "amount": 9.90,
     "description": "Assinatura Premium",
     "customerInfo": {
       "name": "João Silva",
       "email": "joao@example.com",
       "cpf": "111.444.777-35"
     }
   }
   
   Response:
   {
     "success": true,
     "payment": {
       "id": "pix_123456",
       "status": "pending",
       "amount": 9.90,
       "qrCode": "data:image/png;base64,...",
       "pixCode": "000201...",
       "expiresAt": "2026-04-29T12:30:00Z"
     }
   }

3. POST /api/payment/boleto
   Gera um Boleto para pagamento
   
   Request Body:
   {
     "amount": 9.90,
     "customerInfo": {
       "name": "João Silva",
       "email": "joao@example.com",
       "cpf": "111.444.777-35",
       "address": "Rua X, 123, Centro, Londrina - PR"
     }
   }
   
   Response:
   {
     "success": true,
     "payment": {
       "id": "boleto_123456",
       "status": "pending",
       "amount": 9.90,
       "barcodeNumber": "12345.67890 ...",
       "digitableLine": "12345.67890 ...",
       "boletoUrl": "https://...",
       "dueDate": "2026-05-01T23:59:59Z",
       "instructions": [...]
     }
   }

4. POST /api/payment/card
   Processa pagamento com cartão
   
   Request Body:
   {
     "token": "tok_visa",
     "amount": 9.90,
     "installments": 1,
     "email": "joao@example.com",
     "cpf": "111.444.777-35",
     "name": "João Silva"
   }
   
   Response:
   {
     "success": true/false,
     "payment": {
       "id": "card_123456",
       "status": "approved/rejected",
       "statusDetail": "Cartão aprovado/recusado"
     }
   }

5. GET /api/payment/:id/status
   Verifica status de um pagamento
   
   Response:
   {
     "success": true,
     "payment": {
       "id": "pix_123456",
       "status": "paid/pending/rejected",
       "statusDetail": "Descrição do status"
     }
   }

6. POST /api/payment/webhook
   Recebe notificações do Mercado Pago
   
   [Configurar em: Dashboard MP → Configurações → Webhooks]

*/

// ============================================================
// EXEMPLO DE INTEGRAÇÃO CUSTOMIZADA
// ============================================================

/*
// Arquivo: backend/utils/payment-processor.js
// Classe auxiliar para processar pagamentos

class PaymentProcessor {
  constructor() {
    this.paymentRouter = require('../routes/payment-brazil');
  }

  // Processar PIX
  async processPIX(amount, customerData) {
    try {
      const response = await fetch('http://localhost:5000/api/payment/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          description: 'Pagamento Safe-Bite',
          customerInfo: customerData
        })
      });

      const data = await response.json();
      
      // Salvar no banco de dados
      await this.savePaymentToDatabase(data.payment);
      
      return data.payment;
    } catch (error) {
      console.error('Erro ao processar PIX:', error);
      throw error;
    }
  }

  // Processar Boleto
  async processBoleto(amount, customerData) {
    // Similar ao PIX
  }

  // Verificar Status
  async checkPaymentStatus(paymentId) {
    const response = await fetch(`http://localhost:5000/api/payment/${paymentId}/status`);
    return response.json();
  }

  // Salvar na base de dados
  async savePaymentToDatabase(paymentData) {
    // Implementar segundo seu banco de dados
    // Exemplo com MongoDB:
    // const payment = new Payment(paymentData);
    // await payment.save();
  }
}

module.exports = PaymentProcessor;
*/

// ============================================================
// VARIÁVEIS DE AMBIENTE NECESSÁRIAS
// ============================================================

/*
# .env (ou .env.local)

# Mercado Pago
MP_ACCESS_TOKEN=APP_USR-1234567890123456-ABCDEFGHIJKLMNOPQRSTUVWXYZ
MP_PUBLIC_KEY=APP_USR-1234567890123456-ABCDEFGHIJKLMNOPQRSTUVWXYZ

# Servidor
NODE_ENV=development
PORT=5000
HOST=localhost

# Banco de Dados (opcional)
DB_HOST=localhost
DB_PORT=27017
DB_NAME=safe_bite

# Webhook (opcional)
WEBHOOK_SECRET=seu_secret_webhook_aqui
*/

// ============================================================
// VALIDAÇÃO DOS DADOS
// ============================================================

/*
// Middleware para validar requisição de pagamento
const validatePaymentRequest = (req, res, next) => {
  const { amount, customerInfo } = req.body;

  // Validar amount
  if (!amount || typeof amount !== 'number' || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Valor inválido'
    });
  }

  // Validar informações do cliente
  if (!customerInfo || !customerInfo.email || !customerInfo.cpf) {
    return res.status(400).json({
      success: false,
      message: 'Dados do cliente incompletos'
    });
  }

  next();
};

// Usar no router
app.post('/api/payment/pix', validatePaymentRequest, (req, res) => {
  // Processar pagamento
});
*/

// ============================================================
// TRATAMENTO DE ERROS
// ============================================================

/*
// Middleware global de erro
app.use((error, req, res, next) => {
  console.error('Erro:', error);

  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Erro interno do servidor',
    timestamp: new Date().toISOString()
  });
});
*/

// ============================================================
// TESTES (Jest ou Mocha)
// ============================================================

/*
// Arquivo: backend/__tests__/payment.test.js

describe('Payment Routes', () => {
  
  test('GET /api/payment/methods deve retornar lista de métodos', async () => {
    const response = await fetch('http://localhost:5000/api/payment/methods');
    const data = await response.json();
    
    expect(response.ok).toBe(true);
    expect(data.methods).toBeDefined();
    expect(data.methods.length).toBeGreaterThan(0);
  });

  test('POST /api/payment/pix deve gerar PIX válido', async () => {
    const response = await fetch('http://localhost:5000/api/payment/pix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 9.90,
        customerInfo: {
          name: 'Teste',
          email: 'test@example.com',
          cpf: '111.444.777-35'
        }
      })
    });

    const data = await response.json();
    
    expect(data.success).toBe(true);
    expect(data.payment.id).toBeDefined();
    expect(data.payment.qrCode).toBeDefined();
  });
});

// Executar testes
// npm test
*/

// ============================================================
// DOCUMENTAÇÃO E RECURSOS
// ============================================================

/*
RECURSOS ÚTEIS:

1. Mercado Pago Docs
   https://www.mercadopago.com.br/developers/en

2. SDK NodeJS
   https://github.com/mercadopago/sdk-nodejs

3. Test Cards (para desenvolvimento)
   Visa:       4111111111111111
   Mastercard: 5555555555554444
   Amex:       378282246310005

4. Webhook Testing
   https://webhook.site/

5. Dashboard Mercado Pago
   https://www.mercadopago.com.br/sellers/

PRÓXIMAS ETAPAS:

1. Integrar com banco de dados (MongoDB/MySQL)
2. Implementar autenticação JWT
3. Adicionar taxa de transação
4. Criar dashboard de vendas
5. Implementar reembolsos
6. Adicionar análise de fraude
7. Integrar com email/SMS
8. Implementar retry de webhooks
*/

console.log(`
╔════════════════════════════════════════════════════════════════╗
║                                                                ║
║     BACKEND INTEGRATION EXAMPLE LOADED                        ║
║                                                                ║
║     Use este arquivo como referência para integrar           ║
║     o sistema de pagamentos no seu backend!                  ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
`);
