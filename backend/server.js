const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

// Importar banco de dados simplificado
const SimpleDatabase = require('./database');

// Importar rotas simplificadas
const authRoutes = require('./routes/auth-simple');
const scanRoutes = require('./routes/scans-simple');
const paymentRoutes = require('./routes/payment-brazil');
const googleAuthRoutes = require('./routes/auth-google');

// Importar middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Inicializar banco de dados
const db = new SimpleDatabase();

// Middleware de segurança
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requisições por IP
  message: 'Muitas requisições. Tente novamente mais tarde.'
});
app.use('/api/', limiter);

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Disponibilizar banco de dados globalmente
app.use((req, res, next) => {
  req.db = db;
  next();
});

// Inicializar banco de dados e criar dados de teste
db.seedTestData().then(() => {
  console.log('Banco de dados de teste inicializado com sucesso!');
}).catch(err => console.error('Erro ao inicializar banco:', err));

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/auth', googleAuthRoutes);
app.use('/api/scans', scanRoutes);
app.use('/api/payment', paymentRoutes);

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
