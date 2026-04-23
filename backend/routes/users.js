const express = require('express');
const User = require('../models/User');
const Scan = require('../models/Scan');
const { protect } = require('../middleware/auth');
const router = express.Router();

// @desc    Obter perfil do usuário
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      user: user.getPublicProfile()
    });
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter perfil.'
    });
  }
});

// @desc    Atualizar perfil do usuário
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
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

// @desc    Obter dashboard do usuário
// @route   GET /api/users/dashboard
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Obter scans recentes
    const recentScans = await Scan.find({ 
      user: req.user.id, 
      isActive: true 
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name');
    
    // Obter estatísticas
    const stats = await Scan.getUserStats(req.user.id);
    
    // Obter scans dos últimos 7 dias para gráfico
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const weeklyScans = await Scan.find({
      user: req.user.id,
      isActive: true,
      createdAt: { $gte: sevenDaysAgo }
    }).sort({ createdAt: 1 });
    
    // Agrupar por dia
    const dailyStats = {};
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyStats[dateStr] = 0;
    }
    
    weeklyScans.forEach(scan => {
      const dateStr = scan.createdAt.toISOString().split('T')[0];
      if (dailyStats.hasOwnProperty(dateStr)) {
        dailyStats[dateStr]++;
      }
    });
    
    // Obter categorias mais escaneadas
    const categoryStats = await Scan.aggregate([
      { $match: { user: user._id, isActive: true } },
      { $group: { 
        _id: '$product.category', 
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    res.status(200).json({
      success: true,
      user: user.getPublicProfile(),
      stats: stats[0] || {
        totalScans: 0,
        highRiskScans: 0,
        avgProcessingTime: 0
      },
      recentScans,
      weeklyStats: Object.entries(dailyStats).map(([date, count]) => ({
        date,
        count
      })).reverse(),
      categoryStats
    });
  } catch (error) {
    console.error('Erro ao obter dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter dashboard.'
    });
  }
});

// @desc    Obter histórico de scans do usuário
// @route   GET /api/users/scans
// @access  Private
router.get('/scans', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filters = { user: req.user.id, isActive: true };
    
    // Filtros opcionais
    if (req.query.category) {
      filters['product.category'] = req.query.category;
    }
    
    if (req.query.risk) {
      filters['analysis.overallRisk'] = req.query.risk;
    }
    
    if (req.query.dateFrom || req.query.dateTo) {
      filters.createdAt = {};
      if (req.query.dateFrom) {
        filters.createdAt.$gte = new Date(req.query.dateFrom);
      }
      if (req.query.dateTo) {
        filters.createdAt.$lte = new Date(req.query.dateTo);
      }
    }
    
    const scans = await Scan.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Scan.countDocuments(filters);
    
    res.status(200).json({
      success: true,
      count: scans.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      scans
    });
  } catch (error) {
    console.error('Erro ao obter scans:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter histórico de scans.'
    });
  }
});

// @desc    Obter preferências do usuário
// @route   GET /api/users/preferences
// @access  Private
router.get('/preferences', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Erro ao obter preferências:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter preferências.'
    });
  }
});

// @desc    Atualizar preferências do usuário
// @route   PUT /api/users/preferences
// @access  Private
router.put('/preferences', protect, async (req, res) => {
  try {
    const { preferences } = req.body;
    
    const user = await User.findById(req.user.id);
    user.preferences = { ...user.preferences, ...preferences };
    await user.save();
    
    res.status(200).json({
      success: true,
      preferences: user.preferences
    });
  } catch (error) {
    console.error('Erro ao atualizar preferências:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar preferências.'
    });
  }
});

// @desc    Obter restrições alimentares do usuário
// @route   GET /api/users/restrictions
// @access  Private
router.get('/restrictions', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      dietaryRestrictions: user.dietaryRestrictions
    });
  } catch (error) {
    console.error('Erro ao obter restrições:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter restrições alimentares.'
    });
  }
});

// @desc    Atualizar restrições alimentares do usuário
// @route   PUT /api/users/restrictions
// @access  Private
router.put('/restrictions', protect, async (req, res) => {
  try {
    const { dietaryRestrictions } = req.body;
    
    const user = await User.findById(req.user.id);
    user.dietaryRestrictions = dietaryRestrictions;
    await user.save();
    
    res.status(200).json({
      success: true,
      dietaryRestrictions: user.dietaryRestrictions
    });
  } catch (error) {
    console.error('Erro ao atualizar restrições:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar restrições alimentares.'
    });
  }
});

// @desc    Obter estatísticas detalhadas do usuário
// @route   GET /api/users/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Período para estatísticas
    const period = req.query.period || 'month'; // week, month, year
    let startDate = new Date();
    
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }
    
    // Estatísticas de scans
    const scanStats = await Scan.aggregate([
      { $match: { 
        user: user._id, 
        isActive: true,
        createdAt: { $gte: startDate }
      }},
      { $group: {
        _id: null,
        totalScans: { $sum: 1 },
        highRiskScans: {
          $sum: { $cond: [{ $eq: ['$analysis.overallRisk', 'avoid'] }, 1, 0] }
        },
        avgProcessingTime: { $avg: '$analysis.processingTime' },
        uniqueProducts: { $addToSet: '$product.name' }
      }},
      { $project: {
        totalScans: 1,
        highRiskScans: 1,
        avgProcessingTime: 1,
        uniqueProductsCount: { $size: '$uniqueProducts' }
      }}
    ]);
    
    // Produtos mais escaneados
    const topProducts = await Scan.aggregate([
      { $match: { 
        user: user._id, 
        isActive: true,
        createdAt: { $gte: startDate }
      }},
      { $group: { 
        _id: '$product.name', 
        count: { $sum: 1 },
        lastScanned: { $max: '$createdAt' }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Categorias mais escaneadas
    const categoryStats = await Scan.aggregate([
      { $match: { 
        user: user._id, 
        isActive: true,
        createdAt: { $gte: startDate }
      }},
      { $group: { 
        _id: '$product.category', 
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } }
    ]);
    
    // Evolução diária de scans
    const dailyEvolution = await Scan.aggregate([
      { $match: { 
        user: user._id, 
        isActive: true,
        createdAt: { $gte: startDate }
      }},
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      period,
      stats: scanStats[0] || {
        totalScans: 0,
        highRiskScans: 0,
        avgProcessingTime: 0,
        uniqueProductsCount: 0
      },
      topProducts,
      categoryStats,
      dailyEvolution,
      scansRemaining: user.scansRemaining
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas.'
    });
  }
});

// @desc    Deletar conta do usuário
// @route   DELETE /api/users/account
// @access  Private
router.delete('/account', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Soft delete dos scans
    await Scan.updateMany(
      { user: req.user.id },
      { isActive: false }
    );
    
    // Soft delete do usuário
    user.isActive = false;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Conta desativada com sucesso.'
    });
  } catch (error) {
    console.error('Erro ao desativar conta:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao desativar conta.'
    });
  }
});

module.exports = router;
