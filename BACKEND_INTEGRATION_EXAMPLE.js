const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const validator = require('validator');
require('dotenv').config();

const requiredEnvVars = ['MP_ACCESS_TOKEN', 'MP_PUBLIC_KEY'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('Variáveis de ambiente obrigatórias ausentes:', missingEnvVars.join(', '));
  process.exit(1);
}

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Muitas requisições deste IP, tente novamente mais tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com', 'https://www.yourdomain.com']
      : ['http://localhost:3000', 'http://localhost:8080', 'http://127.0.0.1:3000'];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

const paymentBrazilRouter = require('./routes/payment-brazil');
app.use('/api/payment', paymentBrazilRouter);

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor funcionando',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

const validatePaymentRequest = (req, res, next) => {
  try {
    const { amount, customerInfo } = req.body;

    if (!amount || typeof amount !== 'number' || amount <= 0 || amount > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Valor inválido. O valor deve estar entre R$ 0.01 e R$ 10.000,00'
      });
    }

    if (!customerInfo || typeof customerInfo !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Dados do cliente são obrigatórios'
      });
    }

    if (!customerInfo.email || !validator.isEmail(customerInfo.email)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    if (!customerInfo.cpf || !validator.isNumeric(customerInfo.cpf.replace(/\D/g, '')) || 
        customerInfo.cpf.replace(/\D/g, '').length !== 11) {
      return res.status(400).json({
        success: false,
        message: 'CPF inválido'
      });
    }

    if (customerInfo.name) {
      customerInfo.name = validator.escape(customerInfo.name.trim()).substring(0, 100);
      if (customerInfo.name.length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Nome deve ter pelo menos 2 caracteres'
        });
      }
    }

    if (customerInfo.address) {
      customerInfo.address = validator.escape(customerInfo.address.trim()).substring(0, 200);
    }

    if (req.body.description) {
      req.body.description = validator.escape(req.body.description.trim()).substring(0, 200);
    }

    customerInfo.email = validator.normalizeEmail(customerInfo.email.toLowerCase().trim());

    next();
  } catch (error) {
    console.error('Erro de validação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro na validação dos dados'
    });
  }
};

const validateWebhook = (req, res, next) => {
  try {
    const signature = req.headers['x-signature'];
    const requestId = req.headers['x-request-id'];
    
    if (!signature) {
      return res.status(401).json({
        success: false,
        message: 'Assinatura do webhook não fornecida'
      });
    }

    const webhookSecret = process.env.WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('WEBHOOK_SECRET não configurado');
      return res.status(500).json({
        success: false,
        message: 'Configuração do webhook incompleta'
      });
    }

    next();
  } catch (error) {
    console.error('Erro na validação do webhook:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro na validação do webhook'
    });
  }
};

const validatePaymentId = (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id || typeof id !== 'string' || id.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'ID de pagamento inválido'
      });
    }

    req.params.id = validator.escape(id.trim());
    
    next();
  } catch (error) {
    console.error('Erro na validação do ID de pagamento:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro na validação do ID de pagamento'
    });
  }
};

app.post('/api/payment/pix', validatePaymentRequest, (req, res) => {
  res.json({ success: false, message: 'Rota de pagamento não implementada' });
});

app.post('/api/payment/boleto', validatePaymentRequest, (req, res) => {
  res.json({ success: false, message: 'Rota de pagamento não implementada' });
});

app.post('/api/payment/card', validatePaymentRequest, (req, res) => {
  res.json({ success: false, message: 'Rota de pagamento não implementada' });
});

app.get('/api/payment/:id/status', validatePaymentId, (req, res) => {
  res.json({ success: false, message: 'Rota de status não implementada' });
});

app.post('/api/payment/webhook', validateWebhook, (req, res) => {
  res.json({ success: true, message: 'Webhook recebido' });
});

app.use((error, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.error('Detalhes completos do erro:', {
      message: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  } else {
    console.error('Erro de produção:', {
      message: error.message,
      url: req.url,
      method: req.method,
      ip: req.ip,
      timestamp: new Date().toISOString()
    });
  }

  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(error.status || 500).json({
    success: false,
    message: isDevelopment ? error.message : 'Erro interno do servidor',
    timestamp: new Date().toISOString(),
    ...(isDevelopment && { stack: error.stack })
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado',
    timestamp: new Date().toISOString()
  });
});

process.on('uncaughtException', (error) => {
  console.error('Exceção não capturada:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Rejeição não tratada em:', promise, 'motivo:', reason);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`Servidor de pagamento iniciado em http://${HOST}:${PORT}`);
  console.log(`Endpoint de pagamento: http://${HOST}:${PORT}/api/payment`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
