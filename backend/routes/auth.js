const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Helper function para gerar token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Helper function para enviar resposta de sucesso
const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);
  
  const options = {
    expires: new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: user.getPublicProfile()
    });
};

// @desc    Registrar novo usuário
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, dietaryRestrictions } = req.body;

    // Validar campos obrigatórios
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, forneça nome, email e senha.'
      });
    }

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email já cadastrado.'
      });
    }

    // Criar usuário
    const user = await User.create({
      name,
      email,
      password,
      dietaryRestrictions: dietaryRestrictions || []
    });

    // Gerar token de verificação de email
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    await user.save();

    // TODO: Enviar email de verificação
    // await sendVerificationEmail(user.email, verificationToken);

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário.'
    });
  }
});

// @desc    Login de usuário
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, forneça email e senha.'
      });
    }

    // Incluir senha na consulta
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas.'
      });
    }

    // Verificar se usuário está ativo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada.'
      });
    }

    // Verificar senha
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas.'
      });
    }

    // Atualizar último login
    user.lastLogin = new Date();
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login.'
    });
  }
});

// @desc    Logout de usuário
// @route   GET /api/auth/logout
// @access  Private
router.get('/logout', protect, (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    message: 'Logout realizado com sucesso.'
  });
});

// @desc    Obter usuário atual
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter informações do usuário.'
    });
  }
});

// @desc    Atualizar perfil do usuário
// @route   PUT /api/auth/me
// @access  Private
router.put('/me', protect, async (req, res) => {
  try {
    const { name, dietaryRestrictions, preferences } = req.body;
    
    const user = await User.findById(req.user.id);
    
    if (name) user.name = name;
    if (dietaryRestrictions) user.dietaryRestrictions = dietaryRestrictions;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar perfil.'
    });
  }
});

// @desc    Alterar senha
// @route   PUT /api/auth/password
// @access  Private
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Forneça a senha atual e a nova senha.'
      });
    }
    
    const user = await User.findById(req.user.id).select('+password');
    
    // Verificar senha atual
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Senha atual incorreta.'
      });
    }
    
    // Atualizar senha
    user.password = newPassword;
    await user.save();
    
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao alterar senha.'
    });
  }
});

// @desc    Esqueci minha senha
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Forneça seu email.'
      });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado.'
      });
    }
    
    // Gerar token de reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutos
    
    await user.save();
    
    // TODO: Enviar email de reset
    // await sendPasswordResetEmail(user.email, resetToken);
    
    res.status(200).json({
      success: true,
      message: 'Email de reset de senha enviado.'
    });
  } catch (error) {
    console.error('Erro no forgot password:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar solicitação.'
    });
  }
});

// @desc    Resetar senha
// @route   PUT /api/auth/reset-password/:resetToken
// @access  Public
router.put('/reset-password/:resetToken', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Forneça a nova senha.'
      });
    }
    
    // Hash do token recebido
    const resetToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');
    
    const user = await User.findOne({
      passwordResetToken: resetToken,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token inválido ou expirado.'
      });
    }
    
    // Setar nova senha e limpar campos de reset
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    
    await user.save();
    
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Erro no reset password:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao resetar senha.'
    });
  }
});

// @desc    Verificar email
// @route   GET /api/auth/verify-email/:token
// @access  Public
router.get('/verify-email/:token', async (req, res) => {
  try {
    const user = await User.findOne({
      emailVerificationToken: req.params.token
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Token de verificação inválido.'
      });
    }
    
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    
    await user.save();
    
    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Erro na verificação de email:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar email.'
    });
  }
});

// @desc    Reenviar email de verificação
// @route   POST /api/auth/resend-verification
// @access  Private
router.post('/resend-verification', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email já verificado.'
      });
    }
    
    // Gerar novo token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    await user.save();
    
    // TODO: Enviar email de verificação
    // await sendVerificationEmail(user.email, verificationToken);
    
    res.status(200).json({
      success: true,
      message: 'Email de verificação reenviado.'
    });
  } catch (error) {
    console.error('Erro ao reenviar verificação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao reenviar email de verificação.'
    });
  }
});

module.exports = router;
