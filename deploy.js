// Script de Deploy Automático - Safe-Bite
const fs = require('fs');
const path = require('path');

class SafeBiteDeploy {
  constructor() {
    this.projectName = 'safe-bite';
    this.distFolder = 'dist';
    this.excludeFiles = [
      'backend/',
      'node_modules/',
      '.git/',
      '.gitignore',
      'package.json',
      'package-lock.json',
      'deploy.js',
      'DEPLOYMENT_GUIDE.md',
      'PROJECT_STATUS.md',
      'GMAIL_SETUP.md'
    ];
  }

  // Criar pasta de distribuição
  createDistFolder() {
    console.log('📁 Criando pasta de distribuição...');
    
    if (fs.existsSync(this.distFolder)) {
      this.deleteFolder(this.distFolder);
    }
    
    fs.mkdirSync(this.distFolder);
    console.log('✅ Pasta dist criada');
  }

  // Copiar arquivos necessários
  copyRequiredFiles() {
    console.log('📋 Copiando arquivos necessários...');
    
    const files = fs.readdirSync('.');
    
    files.forEach(file => {
      if (!this.shouldExclude(file)) {
        const sourcePath = path.join('.', file);
        const destPath = path.join(this.distFolder, file);
        
        if (fs.statSync(sourcePath).isDirectory()) {
          this.copyFolder(sourcePath, destPath);
        } else {
          fs.copyFileSync(sourcePath, destPath);
        }
        
        console.log(`✅ Copiado: ${file}`);
      }
    });
  }

  // Verificar se arquivo deve ser excluído
  shouldExclude(file) {
    return this.excludeFiles.some(exclude => file.startsWith(exclude));
  }

  // Copiar pasta recursivamente
  copyFolder(source, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    
    const files = fs.readdirSync(source);
    
    files.forEach(file => {
      const sourcePath = path.join(source, file);
      const destPath = path.join(dest, file);
      
      if (fs.statSync(sourcePath).isDirectory()) {
        this.copyFolder(sourcePath, destPath);
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
    });
  }

  // Deletar pasta
  deleteFolder(folder) {
    if (fs.existsSync(folder)) {
      fs.rmSync(folder, { recursive: true, force: true });
    }
  }

  // Ajustar arquivos para produção
  adjustFilesForProduction() {
    console.log('🔧 Ajustando arquivos para produção...');
    
    // Ajustar api-config.js
    this.adjustApiConfig();
    
    // Criar .nojekyll para GitHub Pages
    fs.writeFileSync(path.join(this.distFolder, '.nojekyll'), '');
    
    // Criar service worker
    this.createServiceWorker();
    
    console.log('✅ Arquivos ajustados para produção');
  }

  // Ajustar configuração da API
  adjustApiConfig() {
    const apiConfigPath = path.join(this.distFolder, 'api-config.js');
    
    if (fs.existsSync(apiConfigPath)) {
      let content = fs.readFileSync(apiConfigPath, 'utf8');
      
      // Ajustar baseURL para modo produção
      content = content.replace(
        "baseURL: 'http://localhost:5000/api'",
        "baseURL: window.location.origin + '/api'"
      );
      
      fs.writeFileSync(apiConfigPath, content);
      console.log('✅ api-config.js ajustado');
    }
  }

  // Criar service worker para cache
  createServiceWorker() {
    const swContent = `
// Service Worker - Safe-Bite
const CACHE_NAME = 'safe-bite-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/settings.html',
  '/scanner.html',
  '/history.html',
  '/help.html',
  '/payment.html',
  '/login.html',
  '/signup.html',
  '/privacy.html',
  '/style.css',
  '/upgrade-popup.css',
  '/payment-brazil.css',
  '/api-config.js',
  '/script.js',
  '/user-sync.js',
  '/user-sync-integration.js',
  '/login-system.js',
  '/contact-system.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
`;
    
    fs.writeFileSync(path.join(this.distFolder, 'sw.js'), swContent);
    console.log('✅ Service worker criado');
  }

  // Criar README para deploy
  createDeployReadme() {
    const readmeContent = `# Safe-Bite - Versão Deploy

## 🚀 Como Usar

1. **Upload**: Arraste esta pasta para sua plataforma de hospedagem
2. **Configurar**: Ajuste domínio personalizado se necessário
3. **Publicar**: Ative o site

## 🌐 Plataformas Suportadas

- ✅ GitHub Pages
- ✅ Netlify
- ✅ Vercel
- ✅ Firebase Hosting
- ✅ Qualquer hosting estático

## 📱 Funcionalidades

- Login Google/Local
- Dashboard completo
- Scanner de produtos
- Sistema de pagamentos
- Sincronização real-time
- Design responsivo

## 🔗 Links Úteis

- **Site Principal**: index.html
- **Dashboard**: dashboard.html
- **Login**: login.html
- **Cadastro**: signup.html

## 📧 Suporte

bruno.nunes.santos06@escola.pr.gov.br

---

**Safe-Bite v1.0 - Pronto para produção!** 🌿
`;
    
    fs.writeFileSync(path.join(this.distFolder, 'README.md'), readmeContent);
    console.log('✅ README de deploy criado');
  }

  // Gerar relatório
  generateReport() {
    console.log('📊 Gerando relatório de deploy...');
    
    const files = this.getAllFiles(this.distFolder);
    const totalSize = this.getTotalSize(this.distFolder);
    
    const report = {
      projectName: this.projectName,
      version: '1.0.0',
      deployDate: new Date().toISOString(),
      files: files.length,
      totalSize: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
      platforms: [
        'GitHub Pages',
        'Netlify',
        'Vercel',
        'Firebase Hosting'
      ],
      features: [
        'Login Google/Local',
        'Dashboard com estatísticas',
        'Scanner de produtos',
        'Sistema de pagamentos',
        'Sincronização real-time',
        'Design responsivo',
        'Service Worker',
        'SEO otimizado'
      ]
    };
    
    fs.writeFileSync(
      path.join(this.distFolder, 'deploy-report.json'),
      JSON.stringify(report, null, 2)
    );
    
    console.log('✅ Relatório gerado');
    console.log(`📊 ${files.length} arquivos, ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  }

  // Obter todos os arquivos
  getAllFiles(folder) {
    let files = [];
    
    const items = fs.readdirSync(folder);
    
    items.forEach(item => {
      const itemPath = path.join(folder, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        files = files.concat(this.getAllFiles(itemPath));
      } else {
        files.push(itemPath);
      }
    });
    
    return files;
  }

  // Obter tamanho total
  getTotalSize(folder) {
    let totalSize = 0;
    
    const items = fs.readdirSync(folder);
    
    items.forEach(item => {
      const itemPath = path.join(folder, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        totalSize += this.getTotalSize(itemPath);
      } else {
        totalSize += stat.size;
      }
    });
    
    return totalSize;
  }

  // Executar deploy
  deploy() {
    console.log('🚀 Iniciando deploy do Safe-Bite...\n');
    
    try {
      this.createDistFolder();
      this.copyRequiredFiles();
      this.adjustFilesForProduction();
      this.createDeployReadme();
      this.generateReport();
      
      console.log('\n✅ Deploy concluído com sucesso!');
      console.log(`📁 Pasta dist criada: ${this.distFolder}/`);
      console.log('🌐 Pronto para upload em qualquer plataforma de hospedagem');
      console.log('\n📋 Próximos passos:');
      console.log('1. Escolha sua plataforma (Netlify recomendado)');
      console.log('2. Faça upload da pasta dist');
      console.log('3. Configure domínio personalizado (opcional)');
      console.log('4. Publique o site');
      console.log('\n🎉 Safe-Bite está no ar! 🌿');
      
    } catch (error) {
      console.error('❌ Erro no deploy:', error.message);
      process.exit(1);
    }
  }
}

// Executar deploy
const deploy = new SafeBiteDeploy();
deploy.deploy();
