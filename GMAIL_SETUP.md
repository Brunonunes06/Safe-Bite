# Configuração de Email Gmail para Nutri-Scan

## 📧 Configuração do Gmail

Para que o sistema de contato funcione com envio de emails via Gmail, siga estas instruções:

### 🔐 Passo 1: Habilitar App Password no Gmail

1. **Acesse sua conta Gmail**
2. **Vá para Configurações da Conta Google**
   - Link: https://myaccount.google.com/
3. **Ative a Verificação em 2 etapas** (se ainda não tiver)
4. **Crie uma Senha de App**:
   - Vá para: https://myaccount.google.com/apppasswords
   - Selecione "Outro (nome personalizado)"
   - Digite: "Nutri-Scan Contato"
   - Clique em "Gerar"
   - **Copie a senha gerada** (ela não será mostrada novamente)

### ⚙️ Passo 2: Configurar Variáveis de Ambiente

Crie um arquivo `.env` na pasta `backend` com as seguintes variáveis:

```env
# Email Configuration
GMAIL_EMAIL=bruno.nunes.santos06@escola.pr.gov.br
GMAIL_PASSWORD=sua_senha_de_app_gerada

# Outras configurações
JWT_SECRET=nutri_scan_secret_key
NODE_ENV=development
PORT=5000
```

### 📦 Passo 3: Instalar Dependências

Na pasta `backend`, instale o nodemailer:

```bash
npm install nodemailer
```

### 🚀 Passo 4: Testar o Sistema

1. **Inicie o servidor**:
   ```bash
   cd backend
   node server.js
   ```

2. **Acesse o site**:
   ```
   http://localhost:5000
   ```

3. **Teste o formulário de contato** na seção "Entre em Contato"

### 🔍 Verificação

Após enviar uma mensagem de contato:

1. **Verifique o console do servidor** - Deve mostrar logs do envio
2. **Verifique seu email** - Deve receber uma mensagem formatada
3. **Verifique o banco de dados** - A mensagem será salva localmente

### 📝 Estrutura do Email Recebido

Você receberá um email HTML formatado com:

- **Cabeçalho** com logo Nutri-Scan
- **Informações do remetente** (nome, email, data)
- **Mensagem formatada** com preservação de quebras de linha
- **Rodapé** informativo

### 🛠️ Solução de Problemas

#### Erro: "535-5.7.8 Username and Password not accepted"
- **Causa**: Senha de app não configurada ou incorreta
- **Solução**: Verifique se criou a senha de app corretamente

#### Erro: "Greeting never received"
- **Causa**: Firewall ou bloqueio de rede
- **Solução**: Verifique configurações de rede/firewall

#### Email não chega
- **Verifique**: Pasta de spam/lixeira
- **Verifique**: Se o email remetente está correto
- **Verifique**: Logs do console para erros

### 🔄 Modo Desenvolvimento

Em modo de desenvolvimento (`NODE_ENV=development`), o sistema inclui informações de debug:

```json
{
  "debug": {
    "savedToDatabase": true,
    "emailConfig": {
      "user": "seu_email@gmail.com",
      "hasPassword": true
    },
    "emailError": null
  }
}
```

### 📱 Modo Produção

Para produção:

1. **Use variáveis de ambiente reais**
2. **Configure um email dedicado**
3. **Monitore logs de erro**
4. **Considere usar serviço de email profissional** (SendGrid, Mailgun, etc.)

### 🔐 Segurança

- **Nunca** commit senhas no repositório
- **Sempre** use variáveis de ambiente
- **Roteie** o email através de serviço seguro em produção
- **Limite** taxa de envio para evitar spam

### 📊 Monitoramento

O sistema salva todas as mensagens no banco de dados local, mesmo que o email falhe. Você pode acessar as mensagens via API:

```bash
# Listar mensagens (requer autenticação)
GET /api/contact
```

### ✅ Checklist Final

- [ ] Verificação em 2 etapas ativada
- [ ] Senha de app criada
- [ ] Variáveis de ambiente configuradas
- [ ] Nodemailer instalado
- [ ] Servidor reiniciado
- [ ] Formulário testado
- [ ] Email recebido
- [ ] Banco de dados verificado

---

**Status**: ✅ Sistema de contato pronto para uso!
