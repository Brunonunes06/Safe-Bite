const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para proteger rotas
const protect = async (req, res, next) => {
  let token;

  // Verificar se token existe no header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Verificar se não há token
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Acesso negado. Token não fornecido.'
    });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Adicionar usuário ao request
    req.user = await User.findById(decoded.id).select('+emailVerified');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada.'
      });
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido.'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erro ao autenticar usuário.'
    });
  }
};

// Middleware para verificar se email está verificado
const requireEmailVerified = (req, res, next) => {
  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email não verificado. Por favor, verifique seu email.'
    });
  }
  next();
};

// Middleware para verificar plano premium
const requirePremium = (req, res, next) => {
  if (!req.user.isPremium) {
    return res.status(403).json({
      success: false,
      message: 'Esta funcionalidade requer plano Premium.'
    });
  }
  next();
};

// Middleware para verificar limite de scans (usuários free)
const checkScanLimit = async (req, res, next) => {
  // Se for premium, não tem limite
  if (req.user.isPremium) {
    return next();
  }

  // Verificar se atingiu limite mensal
  if (req.user.scansRemaining <= 0) {
    return res.status(429).json({
      success: false,
      message: 'Limite mensal de scans atingido. Faça upgrade para Premium para scans ilimitados.',
      code: 'SCAN_LIMIT_EXCEEDED',
      scansRemaining: 0
    });
  }

  next();
};

// Middleware para autorização baseada em papéis (futuro)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Permissão insuficiente.'
      });
    }
    next();
  };
};

module.exports = {
  protect,
  requireEmailVerified,
  requirePremium,
  checkScanLimit,
  authorize
};
