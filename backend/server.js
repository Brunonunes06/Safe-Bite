const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Importar rotas
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const scanRoutes = require('./routes/scans');
const productRoutes = require('./routes/products');
const subscriptionRoutes = require('./routes/subscriptions');

// Importar middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Middleware de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limite de 100 requisições
  message: {
    error: 'Muitas requisições deste IP, tente novamente mais tarde.'
  }
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Conexão com MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/nutri-scan', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB conectado com sucesso'))
.catch(err => console.error('Erro ao conectar MongoDB:', err));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/products', productRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API Nutri-Scan funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Servir arquivos estáticos (para produção)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// Middleware de erro
app.use(notFound);
app.use(errorHandler);

// Iniciar servidor
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`
  ========================================
  Servidor Nutri-Scan rodando na porta ${PORT}
  Ambiente: ${process.env.NODE_ENV || 'development'}
  API: http://localhost:${PORT}/api
  ========================================
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Fechando servidor...');
  server.close(() => {
    console.log('Servidor fechado');
    mongoose.connection.close(false, () => {
      console.log('MongoDB desconectado');
      process.exit(0);
    });
  });
});

module.exports = app;
