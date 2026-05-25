// Serviço de Pagamento Brasileiro - PIX, QR Code e Boleto
// Simulação de integração com provedores brasileiros

const crypto = require('crypto');
let QRCode;
try {
  QRCode = require('qrcode');
} catch (err) {
  // `qrcode` pode não estar instalado no ambiente local; manter fallback
  QRCode = null;
}

class BrazilianPaymentService {
  constructor() {
    // API keys e chaves configuráveis via .env
    this.apiKey = process.env.BRAZILIAN_PAYMENT_API_KEY || process.env.PAYMENT_ACCESS_TOKEN || 'test_key';
    this.accessToken = process.env.PAYMENT_ACCESS_TOKEN || process.env.BRAZILIAN_PAYMENT_API_KEY || null; // manter em segredo
    this.publicKey = process.env.PAYMENT_PUBLIC_KEY || null; // chave pública que pode ser exposta ao cliente
    this.baseUrl = process.env.BRAZILIAN_PAYMENT_URL || 'https://api.payment-brazil.com';
    // Contas de teste (forneça em backend/.env ou em variáveis de ambiente)
    this.testAccounts = {
      vendor: {
        userId: process.env.TEST_VENDOR_USER_ID || null,
        username: process.env.TEST_VENDOR_USERNAME || null,
        password: process.env.TEST_VENDOR_PASSWORD || null,
        verificationCode: process.env.TEST_VENDOR_CODE || null
      },
      buyer: {
        userId: process.env.TEST_BUYER_USER_ID || null,
        username: process.env.TEST_BUYER_USERNAME || null,
        password: process.env.TEST_BUYER_PASSWORD || null,
        verificationCode: process.env.TEST_BUYER_CODE || null
      }
    };
  }

  // Gerar PIX Copia e Cola
  async generatePix(amount, description, customerInfo) {
    const pixKey = process.env.PIX_KEY || 'myhpc3301@gmail.com';
    const merchantName = 'Nutri-Scan';
    const merchantCity = 'Paranavaí - PR';
    
    // Formatar valor para o padrão BCB
    const amountFormatted = amount.toFixed(2).replace('.', '');
    
    // Gerar ID único da transação
    const txid = this.generateTxid();
    
    // Payload PIX (simplificado para demonstração)
    const payload = this.createPixPayload({
      txid,
      pixKey,
      amount: amountFormatted,
      merchantName,
      merchantCity,
      description
    });

    // Gerar QR Code (async) — se `qrcode` estiver disponível, use-o.
    const qrCodeData = await this.generateQRCodeDataURL(payload);
    // Texto "copia e cola" para o usuário (em muitos apps é o próprio BR Code)
    const copyPaste = this.createCopyPaste(payload);

    return {
      type: 'pix',
      pixCode: payload,
      qrCode: qrCodeData,
      copyPaste,
      publicKey: this.publicKey || null,
      amount,
      expiresAt: new Date(Date.now() + 3600000), // 1 hora
      txid
    };
  }

  // Gerar texto "copia e cola" a partir do payload EMV
  createCopyPaste(emvPayload) {
    // Para agora retornamos o próprio EMV string como 'copia e cola'.
    // Se desejar um formato mais amigável, podemos formatar com quebras/labels.
    return String(emvPayload || '');
  }

  // Gerar Boleto
  generateBoleto(amount, customerInfo, dueDate) {
    const ourNumber = this.generateOurNumber();
    const barcode = this.generateBarcode(ourNumber, amount, dueDate);
    
    return {
      type: 'boleto',
      barcodeNumber: barcode,
      digitableLine: this.formatDigitableLine(barcode),
      amount,
      dueDate,
      ourNumber,
      beneficiary: {
        name: 'Nutri-Scan Tecnologia LTDA',
        cnpj: '12.345.678/0001-90',
        bank: '001',
        agency: '1234',
        account: '56789-0'
      },
      customer: {
        name: customerInfo.name,
        document: customerInfo.cpf || customerInfo.cnpj,
        address: customerInfo.address
      },
      instructions: [
        'Não receber após a data de vencimento',
        'Multa de 2% após o vencimento',
        'Juros de mora de 1% ao mês'
      ],
      expiresAt: new Date(dueDate).getTime()
    };
  }

  // Gerar QR Code para PIX
  async generateQRCodeDataURL(payload) {
    if (QRCode && typeof QRCode.toDataURL === 'function') {
      try {
        return await QRCode.toDataURL(payload);
      } catch (err) {
        console.error('Erro ao gerar QR Code com qrcode:', err);
        // fallback para placeholder
      }
    }

    // Fallback: placeholder data URI
    return `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
  }

  // Criar payload PIX em formato EMV (BR Code) — compatível com apps bancários
  createPixPayload(data) {
    const { txid, pixKey, amount, merchantName, merchantCity, description } = data;

    const build = (id, value) => {
      const v = String(value || '');
      const l = v.length.toString().padStart(2, '0');
      return `${id}${l}${v}`;
    };

    // 00 - Payload Format Indicator
    let payload = '';
    payload += build('00', '01');

    // 01 - Point of Initiation Method (12 = dynamic, 11 = static). Usamos 12 para testes dinâmicos
    payload += build('01', '12');

    // 26 - Merchant Account Information (BR.GOV.BCB.PIX + chave)
    // Subfields: 00 = GUI, 01 = chave (ou alternativa)
    const gui = 'BR.GOV.BCB.PIX';
    const mai = `00${gui.length.toString().padStart(2, '0')}${gui}01${pixKey.length.toString().padStart(2, '0')}${pixKey}`;
    payload += build('26', mai);

    // 52 - Merchant Category Code (0000 = unspecified)
    payload += build('52', '0000');

    // 53 - Transaction Currency (986 = BRL)
    payload += build('53', '986');

    // 54 - Transaction Amount (opcional)
    if (amount !== undefined && amount !== null) {
      // formatar com ponto decimal, sem milhar
      const amt = Number(amount).toFixed(2);
      payload += build('54', amt);
    }

    // 58 - Country Code
    payload += build('58', 'BR');

    // 59 - Merchant Name (até 25 chars)
    payload += build('59', (merchantName || 'Nutri-Scan').substring(0, 25));

    // 60 - Merchant City (até 15 chars)
    payload += build('60', (merchantCity || 'Sao Paulo').substring(0, 15));

    // 62 - Additional Data Field Template (txid)
    if (txid) {
      const txField = build('05', txid);
      payload += build('62', txField);
    }

    // 64/63 - CRC (tag 63 with length 04)
    const payloadForCrc = payload + '6304';
    const crc = this.calculateCRC(payloadForCrc);
    payload += build('63', crc);

    return payload;
  }

  // Retorna as contas de teste carregadas do .env (se houver)
  getTestAccounts() {
    return this.testAccounts;
  }

  // Gerar TXID único
  generateTxid() {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 15);
    return `NUTRISCAN${timestamp}${random}`;
  }

  // Gerar número do boleto
  generateOurNumber() {
    return Math.floor(Math.random() * 900000) + 100000;
  }

  // Gerar código de barras do boleto
  generateBarcode(ourNumber, amount, dueDate) {
    // Simulação de código de barras (44 dígitos)
    const bankCode = '001';
    const currency = '9';
    const dueDateFactor = this.calculateDueDateFactor(dueDate);
    const amountFormatted = amount.toFixed(2).replace('.', '').padStart(10, '0');
    
    // Simular código de barras
    return `${bankCode}${currency}${dueDateFactor}${amountFormatted}0000000000${ourNumber.padStart(10, '0')}1234567890`;
  }

  // Formatar linha digitável
  formatDigitableLine(barcode) {
    // Simulação de formatação da linha digitável
    const part1 = barcode.substring(0, 5) + '.' + barcode.substring(5, 10) + ' ';
    const part2 = barcode.substring(10, 15) + '.' + barcode.substring(15, 21) + ' ';
    const part3 = barcode.substring(21, 27) + '.' + barcode.substring(27, 33) + ' ';
    const part4 = barcode.substring(33, 34) + ' ';
    const part5 = barcode.substring(34, 44);
    
    return part1 + part2 + part3 + part4 + part5;
  }

  // Calcular fator de vencimento
  calculateDueDateFactor(dueDate) {
    const baseDate = new Date('1997-10-07');
    const targetDate = new Date(dueDate);
    const diffTime = Math.abs(targetDate - baseDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays.toString().padStart(4, '0');
  }

  // Calcular CRC (simplificado)
  // Calcular CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF)
  calculateCRC(data) {
    const buf = Buffer.from(data, 'utf8');
    let crc = 0xffff;
    for (let offset = 0; offset < buf.length; offset++) {
      crc ^= (buf[offset] << 8);
      for (let i = 0; i < 8; i++) {
        if ((crc & 0x8000) !== 0) {
          crc = ((crc << 1) ^ 0x1021) & 0xffff;
        } else {
          crc = (crc << 1) & 0xffff;
        }
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  // Simular verificação de pagamento
  async checkPaymentStatus(paymentId) {
    // Simulação - em produção consultaria API do provedor
    const random = Math.random();
    
    if (random < 0.3) {
      return { status: 'paid', paidAt: new Date() };
    } else if (random < 0.7) {
      return { status: 'pending' };
    } else {
      return { status: 'expired' };
    }
  }

  // Criar assinatura com pagamento recorrente
  async createSubscription(plan, customerInfo, paymentMethod) {
    const subscriptionId = this.generateTxid();
    
    let paymentData;
    if (paymentMethod === 'pix') {
      paymentData = await this.generatePix(plan.price, `Assinatura ${plan.name}`, customerInfo);
    } else if (paymentMethod === 'boleto') {
      const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 dias
      paymentData = this.generateBoleto(plan.price, customerInfo, dueDate);
    }

    return {
      subscriptionId,
      plan,
      customer: customerInfo,
      payment: paymentData,
      status: 'pending',
      createdAt: new Date(),
      nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
    };
  }

  // Cancelar assinatura
  async cancelSubscription(subscriptionId) {
    // Simulação de cancelamento
    return {
      subscriptionId,
      status: 'cancelled',
      cancelledAt: new Date(),
      message: 'Assinatura cancelada com sucesso'
    };
  }

  // Gerar relatório de pagamentos
  async generatePaymentReport(subscriptionId, startDate, endDate) {
    // Simulação de relatório
    return {
      subscriptionId,
      period: { startDate, endDate },
      payments: [
        {
          id: this.generateTxid(),
          date: new Date(startDate),
          amount: 9.90,
          method: 'pix',
          status: 'paid'
        },
        {
          id: this.generateTxid(),
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          amount: 9.90,
          method: 'pix',
          status: 'pending'
        }
      ],
      total: 9.90,
      currency: 'BRL'
    };
  }
}

module.exports = BrazilianPaymentService;
