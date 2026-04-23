# 🌿 Safe-Bite - Scanner de Alimentos Inteligente

<div align="center">

![Safe-Bite Logo](https://img.shields.io/badge/Safe--Bite-Scanner%20Inteligente-4CAF50?style=for-the-badge&logo=leaf&logoColor=white)

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Deploy-blue?style=for-the-badge&logo=github&logoColor=white)](https://brunonunes06.github.io/Nutri-Scan/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge&logo=opensource&logoColor=white)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge&logo=check&logoColor=white)](https://brunonunes06.github.io/Nutri-Scan/)

**🚀 Demo ao vivo: [brunonunes06.github.io/Nutri-Scan/](https://brunonunes06.github.io/Nutri-Scan/)**

</div>

---

## 📋 Sobre o Projeto

O **Safe-Bite** é um aplicativo web revolucionário que utiliza inteligência artificial para analisar alimentos e garantir a segurança alimentar. Desenvolvido para a OBEmpreende 2026, este projeto oferece uma solução completa para escanear produtos, verificar alérgenos e manter um histórico saudável.

### 🎯 **Objetivo Principal**

Revolutionar a segurança alimentar através da tecnologia, tornando o acesso à informação nutricional rápido, fácil e acessível para todos.

---

## ✨ Funcionalidades Principais

### 🔍 **Scanner Inteligente**
- 📸 **Upload de fotos**: Câmera ou galeria
- 🤖 **Análise AI**: Identificação automática de produtos
- ⚠️ **Alertas de alérgenos**: Verificação de ingredientes perigosos
- 📊 **Relatórios detalhados**: Informações nutricionais completas

### 👤 **Dashboard do Usuário**
- 📈 **Estatísticas**: Histórico de scans e tendências
- 🎯 **Metas pessoais**: Objetivos de saúde e nutrição
- 📱 **Interface responsiva**: Funciona em qualquer dispositivo
- 🔄 **Sincronização real-time**: Dados atualizados instantaneamente

### 💳 **Sistema de Pagamentos**
- 🇧🇷 **Métodos brasileiros**: PIX, QR Code, Boleto
- 💳 **Cartões internacionais**: Integração com Stripe
- 🔄 **Planos flexíveis**: Free e Premium
- 🔒 **Pagamentos seguros**: Criptografia SSL

### 🔐 **Autenticação Completa**
- 🌐 **Login Google**: Acesso rápido e seguro
- 📧 **Cadastro local**: Registro tradicional
- 👥 **Perfil personalizado**: Foto e preferências
- 🔒 **Dados seguros**: Criptografia JWT

---

## 🛠️ Tecnologias Utilizadas

### **Frontend**
- 🎨 **HTML5** & **CSS3** - Estrutura e design modernos
- ⚡ **JavaScript Vanilla** - Performance otimizada
- 📱 **Responsive Design** - Mobile-first approach
- 🎭 **FontAwesome** - Ícones profissionais

### **Backend (Opcional)**
- 🟢 **Node.js** + **Express** - Servidor robusto
- 🗄️ **Banco de dados em memória** - Performance máxima
- 🔐 **JWT** - Autenticação segura
- 📧 **Nodemailer** - Sistema de emails

### **Deploy**
- 🌐 **GitHub Pages** - Hospedagem gratuita
- 🚀 **GitHub Actions** - Deploy automático
- 📱 **PWA** - Funcionalidade offline
- 🔒 **HTTPS** - Segurança garantida

---

## 🚀 Como Usar

### **Acesso Rápido**
1. Visite: [brunonunes06.github.io/Nutri-Scan/](https://brunonunes06.github.io/Nutri-Scan/)
2. Faça login com Google ou cadastre-se
3. Comece a escanear alimentos!

### **Funcionalidades Passo a Passo**

#### 🔍 **1. Scanner de Produtos**
```
1. Acesse a página Scanner
2. Clique em "Tirar Foto" ou "Upload"
3. Aguarde a análise AI
4. Visualize resultados detalhados
```

#### 📊 **2. Dashboard**
```
1. Acesse seu dashboard pessoal
2. Veja estatísticas de scans
3. Monitore tendências alimentares
4. Exporte relatórios
```

#### 👤 **3. Perfil**
```
1. Personalize suas informações
2. Adicione foto de perfil
3. Configure preferências
4. Gerencie assinatura
```

---

## 📱 Demonstração

### **Screenshots**

| 📱 Mobile | 🖥️ Desktop |
|-----------|------------|
| ![Mobile View](https://via.placeholder.com/300x600/4CAF50/FFFFFF?text=Mobile+View) | ![Desktop View](https://via.placeholder.com/600x400/4CAF50/FFFFFF?text=Desktop+View) |

### **Video Demo**
[![Video Demo](https://img.shields.io/badge/📹-Assista%20a%20Demo-red?style=for-the-badge)](https://brunonunes06.github.io/Nutri-Scan/)

---

## 🏗️ Estrutura do Projeto

```
Safe-Bite/
├── 📄 index.html              # Página principal
├── 📄 dashboard.html          # Dashboard do usuário
├── 📄 profile.html            # Perfil pessoal
├── 📄 scanner.html            # Scanner de produtos
├── 📄 settings.html           # Configurações
├── 📄 history.html            # Histórico de scans
├── 📄 help.html               # Central de ajuda
├── 📄 payment.html            # Pagamentos
├── 📄 login.html              # Login
├── 📄 signup.html             # Cadastro
├── 🎨 style.css               # Estilos principais
├── ⚡ script.js               # Lógica principal
├── 🔐 user-sync.js            # Sincronização
├── 📧 contact-system.js       # Contato
└── 🚀 deploy.yml              # GitHub Actions
```

---

## 🔧 Desenvolvimento Local

### **Pré-requisitos**
- 🟢 **Node.js** 14+ (opcional)
- 🌐 **Navegador moderno**
- 📱 **Dispositivo com câmera** (para scanner)

### **Executar Localmente**
```bash
# Opção 1: Servidor Python (Recomendado)
python -m http.server 8000

# Opção 2: Servidor Node.js
npm install
npm start

# Acesse: http://localhost:8000
```

### **Desenvolvimento**
```bash
# Clonar repositório
git clone https://github.com/Brunonunes06/Nutri-Scan.git
cd Nutri-Scan

# Iniciar servidor de desenvolvimento
python -m http.server 8000

# Abrir no navegador
open http://localhost:8000
```

---

## 🚀 Deploy

### **GitHub Pages (Automático)**
```bash
# 1. Fazer push para main
git add .
git commit -m "Update Safe-Bite"
git push origin main

# 2. GitHub Actions faz deploy automático
# 3. Site disponível em: brunonunes06.github.io/Nutri-Scan/
```

### **Outras Plataformas**
- 🌐 **Netlify**: Arrastar pasta para netlify.com
- 🚀 **Vercel**: Conectar repositório GitHub
- 🔥 **Firebase**: `firebase deploy`

---

## 📊 Status do Projeto

### ✅ **Concluído**
- [x] Interface completa e responsiva
- [x] Sistema de autenticação
- [x] Scanner funcional
- [x] Dashboard com estatísticas
- [x] Sistema de pagamentos
- [x] Sincronização real-time
- [x] Deploy automático
- [x] PWA functionality
- [x] Documentação completa

### 🔄 **Em Progresso**
- [ ] Integração com API de produtos real
- [ ] Machine learning avançado
- [ ] App mobile nativo
- [ ] Sistema de comunidade

---

## 🤝 Contribuição

### **Como Contribuir**
1. **Fork** o repositório
2. **Crie** uma branch (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

### **Diretrizes**
- 🎨 **Siga** o padrão de código existente
- 📝 **Documente** suas mudanças
- 🧪 **Teste** suas funcionalidades
- 🚀 **Seja** criativo e inovador!

---

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 📞 Contato

**Desenvolvedor**: Bruno Nunes  
**Email**: bruno.nunes.santos06@escola.pr.gov.br  
**GitHub**: [@Brunonunes06](https://github.com/Brunonunes06)  
**Projeto**: [Safe-Bite](https://brunonunes06.github.io/Nutri-Scan/)

---

## 🙏 Agradecimentos

- 🏫 **OBEmpreende 2026** - Oportunidade de apresentação
- 🌐 **GitHub** - Plataforma de hospedagem
- 🤖 **Teachable Machine** - Modelo de ML
- 🎨 **FontAwesome** - Ícones incríveis
- 💚 **Comunidade Open Source** - Inspiração diária

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Brunonunes06/Nutri-Scan&type=Date)](https://star-history.com/#Brunonunes06/Nutri-Scan&Date)

---

<div align="center">

**🌿 Safe-Bite - Revolutionando a Segurança Alimentar 🌿**

**Feito com ❤️ para a OBEmpreende 2026**

[![GitHub](https://img.shields.io/badge/GitHub-View%20on%20GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Brunonunes06/Nutri-Scan)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20Site-4CAF50?style=for-the-badge&logo=chrome&logoColor=white)](https://brunonunes06.github.io/Nutri-Scan/)

</div>
