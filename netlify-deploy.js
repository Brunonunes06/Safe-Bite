// Script de Deploy Netlify - Safe-Bite
const fs = require('fs');
const path = require('path');

class NetlifyDeploy {
  constructor() {
    this.projectName = 'safe-bite';
    this.buildFolder = 'dist';
    this.netlifyUrl = 'https://safe-bite.netlify.app';
  }

  // Preparar arquivos para Netlify
  prepareFiles() {
    console.log('🚀 Preparando Safe-Bite para Netlify...');
    console.log('🌐 URL: https://safe-bite.netlify.app');
    console.log('');
    
    // Criar pasta de build
    if (fs.existsSync(this.buildFolder)) {
      fs.rmSync(this.buildFolder, { recursive: true, force: true });
    }
    fs.mkdirSync(this.buildFolder);
    
    // Arquivos que devem ser incluídos
    const includeFiles = [
      '*.html',
      '*.css',
      '*.js',
      '*.md',
      'netlify.toml'
    ];
    
    // Arquivos que devem ser excluídos
    const excludeFiles = [
      'backend/',
      'node_modules/',
      '.git/',
      'deploy.js',
      'netlify-deploy.js',
      'package.json',
      'package-lock.json',
      'DEPLOYMENT_GUIDE.md',
      'PROJECT_STATUS.md',
      'GMAIL_SETUP.md'
    ];
    
    console.log('📁 Copiando arquivos necessários...');
    
    // Copiar arquivos HTML
    const htmlFiles = fs.readdirSync('.').filter(file => file.endsWith('.html'));
    htmlFiles.forEach(file => {
      fs.copyFileSync(file, path.join(this.buildFolder, file));
      console.log(`✅ Copiado: ${file}`);
    });
    
    // Copiar arquivos CSS
    const cssFiles = fs.readdirSync('.').filter(file => file.endsWith('.css'));
    cssFiles.forEach(file => {
      fs.copyFileSync(file, path.join(this.buildFolder, file));
      console.log(`✅ Copiado: ${file}`);
    });
    
    // Copiar arquivos JS (excluindo scripts de deploy)
    const jsFiles = fs.readdirSync('.').filter(file => 
      file.endsWith('.js') && !excludeFiles.includes(file)
    );
    jsFiles.forEach(file => {
      fs.copyFileSync(file, path.join(this.buildFolder, file));
      console.log(`✅ Copiado: ${file}`);
    });
    
    // Copiar arquivos MD importantes
    const mdFiles = ['README.md'];
    mdFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(this.buildFolder, file));
        console.log(`✅ Copiado: ${file}`);
      }
    });
    
    // Copiar netlify.toml
    if (fs.existsSync('netlify.toml')) {
      fs.copyFileSync('netlify.toml', path.join(this.buildFolder, 'netlify.toml'));
      console.log('✅ Copiado: netlify.toml');
    }
    
    // Copiar pasta images se existir
    if (fs.existsSync('images')) {
      fs.mkdirSync(path.join(this.buildFolder, 'images'));
      const imageFiles = fs.readdirSync('images');
      imageFiles.forEach(file => {
        fs.copyFileSync(path.join('images', file), path.join(this.buildFolder, 'images', file));
        console.log(`✅ Copiado: images/${file}`);
      });
    }
    
    console.log(`✅ Build concluído! ${this.countFiles(this.buildFolder)} arquivos`);
  }

  // Contar arquivos
  countFiles(folder) {
    let count = 0;
    const items = fs.readdirSync(folder);
    
    items.forEach(item => {
      const itemPath = path.join(folder, item);
      if (fs.statSync(itemPath).isDirectory()) {
        count += this.countFiles(itemPath);
      } else {
        count++;
      }
    });
    
    return count;
  }

  // Ajustar arquivos para Netlify
  adjustFilesForNetlify() {
    console.log('🔧 Ajustando arquivos para Netlify...');
    
    // Criar service worker para Netlify
    this.createServiceWorker();
    
    // Criar manifest.json para PWA
    this.createManifest();
    
    // Criar _redirects para SPA
    this.createRedirects();
    
    // Criar _headers para performance
    this.createHeaders();
  }

  // Criar service worker
  createServiceWorker() {
    const swContent = `
// Service Worker - Safe-Bite Netlify
const CACHE_NAME = 'safe-bite-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/profile.html',
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
    
    fs.writeFileSync(path.join(this.buildFolder, 'sw.js'), swContent);
    console.log('✅ Service worker criado');
  }

  // Criar manifest.json
  createManifest() {
    const manifestContent = {
      name: "Safe-Bite - Scanner de Alimentos",
      short_name: "SafeBite",
      description: "Scanner inteligente de alimentos para segurança alimentar",
      start_url: "/",
      display: "standalone",
      background_color: "#4CAF50",
      theme_color: "#2E7D32",
      orientation: "portrait",
      scope: "/",
      icons: [
        {
          src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkyIiBoZWlnaHQ9IjE5MiIgdmlld0JveD0iMCAwIDE5MiAxOTIiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxOTIiIGhlaWdodD0iMTkyIiByeD0iMjQiIGZpbGw9IiM0Q0FGNTAiLz4KPHN2ZyB3aWR0aD0iOTYiIGhlaWdodD0iOTYiIHZpZXdCb3g9IjAgMCA5NiA5NiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSI0OCIgeT0iNDgiPgo8cGF0aCBkPSJNMjQgNjhIMjhWMjRIMjRWNjhaTTMyIDY4SDM2VjI4SDMyVjY4Wk00MCA2OEg0NFYzMkg0MFY2OFpNNDggNjhINTJWMzZINDhWNjhaTTU2IDY4SDYwVjQwSDU2VjY4Wk02NCA2OEg2OFY0NEg2NFY2OFpNNzIgNjhINzZWNDhINzJWNjhaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4KPC9zdmc+",
          sizes: "192x192",
          type: "image/svg+xml"
        }
      ]
    };
    
    fs.writeFileSync(path.join(this.buildFolder, 'manifest.json'), JSON.stringify(manifestContent, null, 2));
    console.log('✅ Manifest.json criado');
  }

  // Criar _redirects para SPA
  createRedirects() {
    const redirectsContent = `# Redirecionamentos para SPA - Safe-Bite
# Página principal
/                    /index.html   200

# Páginas do aplicativo
/dashboard           /dashboard.html   200
/profile             /profile.html     200
/settings            /settings.html    200
/scanner             /scanner.html     200
/history             /history.html     200
/help                /help.html        200
/payment             /payment.html     200
/login               /login.html       200
/signup              /signup.html      200
/privacy             /privacy.html     200

# API fallback (se necessário)
/api/*               /.netlify/functions/:splat  200

# Catch-all para SPA (deve ser o último)
/*                   /index.html   200
`;
    
    fs.writeFileSync(path.join(this.buildFolder, '_redirects'), redirectsContent);
    console.log('✅ _redirects criado');
  }

  // Criar _headers para performance
  createHeaders() {
    const headersContent = `# Headers de performance e segurança - Safe-Bite

# Headers globais
/*
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()

# Cache para arquivos estáticos
*.css
  Cache-Control: public, max-age=31536000, immutable

*.js
  Cache-Control: public, max-age=31536000, immutable

*.png
  Cache-Control: public, max-age=31536000, immutable

*.jpg
  Cache-Control: public, max-age=31536000, immutable

*.svg
  Cache-Control: public, max-age=31536000, immutable

*.woff
  Cache-Control: public, max-age=31536000, immutable

*.woff2
  Cache-Control: public, max-age=31536000, immutable

# Cache para HTML (menor tempo)
*.html
  Cache-Control: public, max-age=3600, must-revalidate

# Service Worker
/sw.js
  Cache-Control: no-cache

# Manifest
/manifest.json
  Cache-Control: public, max-age=86400
`;
    
    fs.writeFileSync(path.join(this.buildFolder, '_headers'), headersContent);
    console.log('✅ _headers criado');
  }

  // Criar README para Netlify
  createNetlifyReadme() {
    const readmeContent = `# Safe-Bite - Versão Netlify

## 🚀 Deploy via Netlify

### Upload Manual
1. Arraste a pasta \`${this.buildFolder}/\` para [netlify.com](https://netlify.com)
2. Site publicado automaticamente!

### Deploy Automático
1. Conecte seu repositório GitHub
2. Configure build settings:
   - Build command: echo 'No build needed'
   - Publish directory: .
3. Deploy automático a cada push!

## 🌐 URL do Site
- **Produção**: ${this.netlifyUrl}
- **Preview**: Gerado automaticamente

## ✨ Recursos Netlify
- ✅ HTTPS automático
- ✅ CDN global
- ✅ Deploy automático
- ✅ Forms funcionais
- ✅ Serverless functions
- ✅ Analytics gratuito
- ✅ Custom domain

## 📱 PWA
- ✅ Service Worker ativo
- ✅ Cache inteligente
- ✅ Funciona offline
- ✅ Instalável

---

**Safe-Bite v1.0 - Powered by Netlify** 🌿
`;
    
    fs.writeFileSync(path.join(this.buildFolder, 'README-NETLIFY.md'), readmeContent);
    console.log('✅ README Netlify criado');
  }

  // Gerar relatório
  generateReport() {
    console.log('📊 Gerando relatório de deploy...');
    
    const files = this.getAllFiles(this.buildFolder);
    const totalSize = this.getTotalSize(this.buildFolder);
    
    const report = {
      projectName: this.projectName,
      version: '1.0.0',
      platform: 'Netlify',
      deployDate: new Date().toISOString(),
      url: this.netlifyUrl,
      files: files.length,
      totalSize: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
      features: [
        'HTTPS automático',
        'CDN global',
        'Service Worker',
        'PWA functionality',
        'Forms funcionais',
        'Serverless functions',
        'Analytics gratuito',
        'Custom domain',
        'Deploy automático'
      ],
      buildFiles: [
        'HTML pages',
        'CSS stylesheets',
        'JavaScript modules',
        'Service Worker',
        'PWA Manifest',
        'Netlify config',
        'Redirects',
        'Headers'
      ]
    };
    
    fs.writeFileSync(
      path.join(this.buildFolder, 'netlify-deploy-report.json'),
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

  // Mostrar instruções de deploy
  showDeployInstructions() {
    console.log('\n🌐 **Instruções de Deploy Netlify:**');
    console.log('');
    console.log('### **Opção 1: Upload Manual (Mais Rápido)**');
    console.log('1. **Acessar Netlify**: https://netlify.com');
    console.log('2. **Criar conta gratuita**');
    console.log('3. **Arrastar pasta**: Arraste a pasta dist/ para o site');
    console.log('4. **Site publicado**: https://safe-bite.netlify.app');
    console.log('');
    console.log('### **Opção 2: Deploy Automático**');
    console.log('1. **Conectar GitHub**: Site settings → Build & deploy');
    console.log('2. **Configurar build**:');
    console.log('   - Build command: echo "No build needed"');
    console.log('   - Publish directory: .');
    console.log('3. **Deploy automático**: A cada push para GitHub');
    console.log('');
    console.log('### **Opção 3: Netlify CLI**');
    console.log('1. **Instalar CLI**: npm install -g netlify-cli');
    console.log('2. **Login**: netlify login');
    console.log('3. **Deploy**: netlify deploy --prod --dir=dist');
    console.log('');
    console.log('🎉 **Vantagens Netlify:**');
    console.log('✅ 100% gratuito');
    console.log('✅ HTTPS automático');
    console.log('✅ CDN global');
    console.log('✅ Deploy automático');
    console.log('✅ Forms funcionais');
    console.log('✅ Serverless functions');
    console.log('✅ Analytics gratuito');
    console.log('✅ Custom domain');
    console.log('');
    console.log('🌿 **Safe-Bite estará no ar em minutos!**');
  }

  // Executar deploy completo
  deploy() {
    console.log('🚀 **Deploy Netlify - Safe-Bite**');
    console.log('🌐 Plataforma: Netlify (Gratuito)');
    console.log('📁 Projeto: Safe-Bite Scanner Inteligente');
    console.log('🔗 URL: https://safe-bite.netlify.app');
    console.log('');
    
    try {
      // Preparar arquivos
      this.prepareFiles();
      
      // Ajustar para Netlify
      this.adjustFilesForNetlify();
      
      // Criar README
      this.createNetlifyReadme();
      
      // Gerar relatório
      this.generateReport();
      
      // Mostrar instruções
      this.showDeployInstructions();
      
      console.log('\n✅ **Deploy preparado com sucesso!**');
      console.log(`📁 Pasta criada: ${this.buildFolder}/`);
      console.log('🌐 Pronto para upload no Netlify');
      
    } catch (error) {
      console.error('❌ Erro no deploy:', error.message);
      process.exit(1);
    }
  }
}

// Executar deploy
const deploy = new NetlifyDeploy();
deploy.deploy();
