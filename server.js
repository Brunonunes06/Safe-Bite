// ============================================================
// server.js — Backend de Pagamento com Mercado Pago
// Rotas: /api/payment/pix | /boleto | /card | /:id/status
// ============================================================

const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Payment } = require('mercadopago');

const app = express();
app.use(express.json());
app.use(cors());

// ── Configuração do Mercado Pago ─────────────────────────────
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN, // sua chave secreta
  options: { timeout: 5000 }
});

const payment = new Payment(client);

// ── Utilitários ──────────────────────────────────────────────

// Remove pontos/traços do CPF → "000.000.000-00" → "00000000000"
function sanitizeCpf(cpf) {
  return cpf.replace(/\D/g, '');
}

// Valida CPF com dígitos verificadores
function validateCpf(cpf) {
  const digits = sanitizeCpf(cpf);
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let first = (sum * 10) % 11;
  if (first === 10 || first === 11) first = 0;
  if (first !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  let second = (sum * 10) % 11;
  if (second === 10 || second === 11) second = 0;
  return second === parseInt(digits[10]);
}

// Middleware de validação de campos obrigatórios
function requireFields(fields) {
  return (req, res, next) => {
    const missing = fields.filter(f => !req.body[f] && !req.body.customerInfo?.[f]);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Campos obrigatórios ausentes: ${missing.join(', ')}`
      });
    }
    next();
  };
}

// ── Rota: GET /api/payment/methods ──────────────────────────
app.get('/api/payment/methods', (req, res) => {
  res.json({
    success: true,
    methods: [
      { id: 'pix',    name: 'PIX',    processingTime: 'Instântaneo' },
      { id: 'boleto', name: 'Boleto', processingTime: '1–3 dias úteis' },
      { id: 'card',   name: 'Cartão', processingTime: 'Instântaneo' }
    ]
  });
});

// ── Rota: POST /api/payment/pix ──────────────────────────────
app.post('/api/payment/pix', async (req, res) => {
  const { amount, description, customerInfo } = req.body;
  const { name, email, cpf } = customerInfo || {};

  // Validações
  if (!amount || !name || !email || !cpf) {
    return res.status(400).json({ success: false, message: 'Campos obrigatórios ausentes.' });
  }
  if (!validateCpf(cpf)) {
    return res.status(400).json({ success: false, message: 'CPF inválido.' });
  }

  try {
    const result = await payment.create({
      body: {
        transaction_amount: Number(amount),
        description: description || 'Pagamento via PIX',
        payment_method_id: 'pix',
        payer: {
          email,
          first_name: name.split(' ')[0],
          last_name: name.split(' ').slice(1).join(' ') || '-',
          identification: { type: 'CPF', number: sanitizeCpf(cpf) }
        }
      },
      requestOptions: { idempotencyKey: `pix-${Date.now()}-${sanitizeCpf(cpf)}` }
    });

    const txInfo = result.point_of_interaction?.transaction_data;

    res.json({
      success: true,
      payment: {
        id: result.id,
        status: result.status,
        amount: result.transaction_amount,
        qrCode: txInfo?.qr_code_base64
          ? `data:image/png;base64,${txInfo.qr_code_base64}`
          : null,
        pixCode: txInfo?.qr_code || '',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 min
      }
    });
  } catch (err) {
    console.error('[PIX] Erro:', err?.cause || err.message);
    res.status(500).json({ success: false, message: 'Erro ao gerar PIX. Tente novamente.' });
  }
});

// ── Rota: POST /api/payment/boleto ───────────────────────────
app.post('/api/payment/boleto', async (req, res) => {
  const { amount, customerInfo } = req.body;
  const { name, email, cpf, address } = customerInfo || {};

  if (!amount || !name || !email || !cpf || !address) {
    return res.status(400).json({ success: false, message: 'Campos obrigatórios ausentes.' });
  }
  if (!validateCpf(cpf)) {
    return res.status(400).json({ success: false, message: 'CPF inválido.' });
  }

  // Parsear endereço simples: "Rua X, 123, Centro, Londrina - PR"
  const addressParts = address.split(',').map(s => s.trim());

  try {
    const result = await payment.create({
      body: {
        transaction_amount: Number(amount),
        description: 'Pagamento via Boleto',
        payment_method_id: 'bolbradesco', // boleto Bradesco (aceito em todos os bancos)
        payer: {
          email,
          first_name: name.split(' ')[0],
          last_name: name.split(' ').slice(1).join(' ') || '-',
          identification: { type: 'CPF', number: sanitizeCpf(cpf) },
          address: {
            zip_code: '00000-000',      // ideal: capturar CEP separado no formulário
            street_name: addressParts[0] || address,
            street_number: addressParts[1] || 'S/N',
            neighborhood: addressParts[2] || '',
            city: (addressParts[3] || '').split('-')[0].trim(),
            federal_unit: (addressParts[3] || '').split('-')[1]?.trim() || 'SP'
          }
        }
      },
      requestOptions: { idempotencyKey: `boleto-${Date.now()}-${sanitizeCpf(cpf)}` }
    });

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3); // vencimento em 3 dias úteis

    res.json({
      success: true,
      payment: {
        id: result.id,
        status: result.status,
        amount: result.transaction_amount,
        barcodeNumber: result.barcode?.content || '',
        digitableLine: result.transaction_details?.external_resource_url || '',
        boletoUrl: result.transaction_details?.external_resource_url || '',
        dueDate: dueDate.toISOString(),
        beneficiary: { name: 'Nutri-Scan Ltda' },
        instructions: [
          'Pague em qualquer banco, lotérica ou app de pagamento.',
          'Não pague após o vencimento sem verificar a correção monetária.',
          'O boleto pode levar até 3 dias úteis para compensar.'
        ]
      }
    });
  } catch (err) {
    console.error('[BOLETO] Erro:', err?.cause || err.message);
    res.status(500).json({ success: false, message: 'Erro ao gerar boleto. Tente novamente.' });
  }
});

// ── Rota: POST /api/payment/card ─────────────────────────────
// O frontend deve usar o SDK JS do MP para gerar o token do cartão
// e enviar apenas o token aqui (NUNCA envie dados brutos do cartão)
app.post('/api/payment/card', async (req, res) => {
  const { token, amount, installments, email, cpf, name } = req.body;

  if (!token || !amount || !email || !cpf) {
    return res.status(400).json({ success: false, message: 'Campos obrigatórios ausentes.' });
  }
  if (!validateCpf(cpf)) {
    return res.status(400).json({ success: false, message: 'CPF inválido.' });
  }

  try {
    const result = await payment.create({
      body: {
        transaction_amount: Number(amount),
        token,                          // token gerado pelo SDK JS
        description: 'Assinatura Premium Nutri-Scan',
        installments: Number(installments) || 1,
        payment_method_id: 'visa',      // o SDK JS retorna o método correto
        payer: {
          email,
          identification: { type: 'CPF', number: sanitizeCpf(cpf) }
        }
      },
      requestOptions: { idempotencyKey: `card-${Date.now()}-${token}` }
    });

    if (result.status === 'approved') {
      res.json({ success: true, payment: { id: result.id, status: 'approved' } });
    } else {
      res.status(402).json({
        success: false,
        message: `Pagamento não aprovado: ${result.status_detail}`
      });
    }
  } catch (err) {
    console.error('[CARD] Erro:', err?.cause || err.message);
    res.status(500).json({ success: false, message: 'Erro ao processar cartão.' });
  }
});

// ── Rota: GET /api/payment/:id/status ────────────────────────
app.get('/api/payment/:id/status', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await payment.get({ id });

    const statusMap = {
      approved:      'paid',
      pending:       'pending',
      in_process:    'pending',
      rejected:      'rejected',
      cancelled:     'expired',
      refunded:      'refunded'
    };

    res.json({
      success: true,
      payment: {
        id: result.id,
        status: statusMap[result.status] || result.status,
        statusDetail: result.status_detail
      }
    });
  } catch (err) {
    console.error('[STATUS] Erro:', err?.cause || err.message);
    res.status(500).json({ success: false, message: 'Erro ao consultar status.' });
  }
});

// ── Rota: POST /api/payment/webhook ──────────────────────────
// Registre esta URL no painel do Mercado Pago → Configurações → Webhooks
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

  if (body.type === 'payment') {
    const paymentId = body.data?.id;
    console.log(`[WEBHOOK] Notificação de pagamento: ${paymentId}`);

    // Aqui você consulta o status e atualiza seu banco de dados
    try {
      const result = await payment.get({ id: paymentId });
      console.log(`[WEBHOOK] Status: ${result.status} — ${result.status_detail}`);
      // TODO: atualizar status no seu banco de dados
    } catch (err) {
      console.error('[WEBHOOK] Erro ao consultar pagamento:', err.message);
    }
  }

  res.sendStatus(200); // sempre responder 200 para o MP não reenviar
});

// ── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`   MP_ACCESS_TOKEN: ${process.env.MP_ACCESS_TOKEN ? '✓ configurado' : '✗ AUSENTE'}`);
});
