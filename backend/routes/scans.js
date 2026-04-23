const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const axios = require('axios');
const Scan = require('../models/Scan');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, checkScanLimit } = require('../middleware/auth');
const router = express.Router();

// Configuração do Multer para upload de imagens
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'), false);
    }
  }
});

// @desc    Fazer scan de produto
// @route   POST /api/scans
// @access  Private
router.post('/', protect, checkScanLimit, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Por favor, envie uma imagem do rótulo.'
      });
    }

    // Processar imagem com Sharp
    const processedImage = await sharp(req.file.buffer)
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();

    // TODO: Upload para Cloudinary
    // const result = await cloudinary.uploader.upload(processedImage);
    
    // Simulação de análise com Teachable Machine
    const analysisResult = await analyzeImageWithTeachableMachine(processedImage);
    
    // Criar ou encontrar produto
    let product = await Product.findOne({ 
      name: analysisResult.productName,
      brand: analysisResult.brand 
    });

    if (!product) {
      product = await Product.create({
        name: analysisResult.productName,
        brand: analysisResult.brand,
        barcode: analysisResult.barcode,
        category: analysisResult.category,
        ingredients: analysisResult.ingredients,
        allergens: analysisResult.allergens,
        nutritionalInfo: analysisResult.nutritionalInfo,
        images: [{
          url: 'placeholder_url', // TODO: usar URL do Cloudinary
          isPrimary: true
        }]
      });
    }

    // Incrementar contador de scans do produto
    await product.incrementScanCount();

    // Criar scan
    const scan = await Scan.create({
      user: req.user.id,
      product: {
        name: product.name,
        brand: product.brand,
        barcode: product.barcode,
        category: product.category,
        image: {
          url: 'placeholder_url', // TODO: usar URL do Cloudinary
          originalName: req.file.originalname
        }
      },
      analysis: analysisResult,
      device: {
        type: 'api',
        userAgent: req.get('User-Agent'),
        ip: req.ip
      }
    });

    // Gerar alertas baseados nas restrições do usuário
    await scan.generateAlerts(req.user.dietaryRestrictions);
    
    // Gerar recomendações
    await scan.generateRecommendations();

    // Incrementar contador de scans do usuário
    await req.user.incrementScan();

    res.status(201).json({
      success: true,
      scan: await scan.populate('user', 'name email'),
      product,
      scansRemaining: req.user.scansRemaining
    });
  } catch (error) {
    console.error('Erro no scan:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao processar scan.'
    });
  }
});

// @desc    Obter histórico de scans do usuário
// @route   GET /api/scans
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const scans = await Scan.find({ user: req.user.id, isActive: true })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Scan.countDocuments({ user: req.user.id, isActive: true });

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

// @desc    Obter detalhes de um scan específico
// @route   GET /api/scans/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const scan = await Scan.findOne({ 
      _id: req.params.id, 
      user: req.user.id, 
      isActive: true 
    }).populate('user', 'name email');

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan não encontrado.'
      });
    }

    res.status(200).json({
      success: true,
      scan
    });
  } catch (error) {
    console.error('Erro ao obter scan:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter scan.'
    });
  }
});

// @desc    Dar feedback em um scan
// @route   PUT /api/scans/:id/feedback
// @access  Private
router.put('/:id/feedback', protect, async (req, res) => {
  try {
    const { helpful, comments, reported } = req.body;

    const scan = await Scan.findOne({ 
      _id: req.params.id, 
      user: req.user.id, 
      isActive: true 
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan não encontrado.'
      });
    }

    // Atualizar feedback
    if (typeof helpful === 'boolean') {
      scan.userFeedback.helpful = helpful;
    }
    if (comments) {
      scan.userFeedback.comments = comments;
    }
    if (typeof reported === 'boolean') {
      scan.userFeedback.reported = reported;
    }

    await scan.save();

    res.status(200).json({
      success: true,
      message: 'Feedback salvo com sucesso.',
      scan
    });
  } catch (error) {
    console.error('Erro ao salvar feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao salvar feedback.'
    });
  }
});

// @desc    Excluir um scan
// @route   DELETE /api/scans/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const scan = await Scan.findOne({ 
      _id: req.params.id, 
      user: req.user.id, 
      isActive: true 
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: 'Scan não encontrado.'
      });
    }

    // Soft delete
    scan.isActive = false;
    await scan.save();

    res.status(200).json({
      success: true,
      message: 'Scan excluído com sucesso.'
    });
  } catch (error) {
    console.error('Erro ao excluir scan:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao excluir scan.'
    });
  }
});

// @desc    Obter estatísticas dos scans do usuário
// @route   GET /api/scans/stats
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await Scan.getUserStats(req.user.id);
    
    // Obter scans dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentScans = await Scan.find({
      user: req.user.id,
      isActive: true,
      createdAt: { $gte: thirtyDaysAgo }
    }).sort({ createdAt: 1 });

    // Agrupar por categoria
    const categoryStats = recentScans.reduce((acc, scan) => {
      const category = scan.product.category || 'outros';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    // Obter produtos mais escaneados
    const topProducts = await Scan.aggregate([
      { $match: { user: req.user._id, isActive: true } },
      { $group: { 
        _id: '$product.name', 
        count: { $sum: 1 },
        lastScanned: { $max: '$createdAt' }
      }},
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      stats: stats[0] || {
        totalScans: 0,
        highRiskScans: 0,
        avgProcessingTime: 0
      },
      recentScans: recentScans.length,
      categoryStats,
      topProducts,
      scansRemaining: req.user.scansRemaining
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao obter estatísticas.'
    });
  }
});

// Função para analisar imagem com Teachable Machine (simulação)
async function analyzeImageWithTeachableMachine(imageBuffer) {
  // TODO: Implementar integração real com Teachable Machine
  // Por enquanto, simulação de resultados
  
  const mockResults = {
    productName: 'Biscoito Recheado Chocolate',
    brand: 'NutriBiscuit',
    barcode: '7891234567890',
    category: 'biscoitos',
    processingTime: 2.3,
    confidence: 95,
    overallRisk: 'caution',
    ingredients: [
      { name: 'Farinha de trigo enriquecida', risk: 'safe', confidence: 98 },
      { name: 'Açúcar', risk: 'danger', confidence: 95, amount: '15g', unit: 'por 100g' },
      { name: 'Gordura vegetal', risk: 'warning', confidence: 88 },
      { name: 'Cacau em pó', risk: 'safe', confidence: 92 },
      { name: 'Leite em pó', risk: 'warning', confidence: 85 },
      { name: 'Sal', risk: 'warning', confidence: 90, amount: '1.2g', unit: 'por 100g' }
    ],
    allergens: [
      { name: 'gluten', severity: 'high', detected: true },
      { name: 'lactose', severity: 'medium', detected: true },
      { name: 'soy', severity: 'low', detected: false }
    ],
    nutritionalInfo: {
      calories: 420,
      protein: 6,
      carbs: 65,
      fat: 18,
      fiber: 2,
      sodium: 480,
      sugar: 18,
      servingSize: '30g',
      unit: 'porção'
    }
  };

  // Simular delay de processamento
  await new Promise(resolve => setTimeout(resolve, 1000));

  return mockResults;
}

module.exports = router;
