// Script de Deploy para GitHub Pages - Safe-Bite
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class GitHubPagesDeploy {
  constructor() {
    this.repoName = 'Nutri-Scan';
    this.username = 'Brunonunes06';
    this.buildFolder = 'build';
    this.githubPagesUrl = `https://${this.username}.github.io/${this.repoName}`;
  }

  // Verificar se está em um repositório Git
  checkGitRepository() {
    console.log('🔍 Verificando repositório Git...');
    
    try {
      execSync('git status', { stdio: 'pipe' });
      console.log('✅ Repositório Git encontrado');
      return true;
    } catch (error) {
      console.log('❌ Não é um repositório Git');
      console.log('💡 Execute: git init');
      return false;
    }
  }

  // Verificar se tem branch main
  checkMainBranch() {
    console.log('🔍 Verificando branch main...');
    
    try {
      const branches = execSync('git branch', { encoding: 'utf8' });
      if (branches.includes('main')) {
        console.log('✅ Branch main encontrada');
        return true;
      } else {
        console.log('❌ Branch main não encontrada');
        console.log('💡 Execute: git checkout -b main');
        return false;
      }
    } catch (error) {
      console.log('❌ Erro ao verificar branches');
      return false;
    }
  }

  // Preparar arquivos para GitHub Pages
  prepareFiles() {
    console.log('📁 Preparando arquivos para GitHub Pages...');
    
    // Criar pasta build
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
      '.nojekyll',
      'images/**/*'
    ];
    
    // Arquivos que devem ser excluídos
    const excludeFiles = [
      'backend/',
      'node_modules/',
      '.git/',
      '.github/',
      'deploy.js',
      'github-pages-deploy.js',
      'package.json',
      'package-lock.json',
      'DEPLOYMENT_GUIDE.md',
      'PROJECT_STATUS.md',
      'GMAIL_SETUP.md'
    ];
    
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
    
    // Copiar arquivos JS
    const jsFiles = fs.readdirSync('.').filter(file => file.endsWith('.js'));
    jsFiles.forEach(file => {
      if (!excludeFiles.includes(file)) {
        fs.copyFileSync(file, path.join(this.buildFolder, file));
        console.log(`✅ Copiado: ${file}`);
      }
    });
    
    // Copiar arquivos MD importantes
    const mdFiles = ['README.md'];
    mdFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.copyFileSync(file, path.join(this.buildFolder, file));
        console.log(`✅ Copiado: ${file}`);
      }
    });
    
    // Copiar .nojekyll
    if (fs.existsSync('.nojekyll')) {
      fs.copyFileSync('.nojekyll', path.join(this.buildFolder, '.nojekyll'));
      console.log('✅ Copiado: .nojekyll');
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

  // Ajustar arquivos para GitHub Pages
  adjustFilesForGitHubPages() {
    console.log('🔧 Ajustando arquivos para GitHub Pages...');
    
    // Se não for o repositório principal, ajustar paths
    if (this.repoName !== 'Nutri-Scan' || this.username !== 'Brunonunes06') {
      console.log('🔧 Ajustando paths para subpasta...');
      
      const htmlFiles = fs.readdirSync(this.buildFolder).filter(file => file.endsWith('.html'));
      htmlFiles.forEach(file => {
        const filePath = path.join(this.buildFolder, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Ajustar links relativos
        content = content.replace(/href="(?!http)(?!#)(?!mailto)/g, `href="/${this.repoName}/`);
        content = content.replace(/src="(?!http)/g, `src="/${this.repoName}/`);
        content = content.replace(/url\((?!http)(?!data)/g, `url(/${this.repoName}/`);
        
        fs.writeFileSync(filePath, content);
        console.log(`✅ Ajustado: ${file}`);
      });
    }
    
    // Criar service worker para GitHub Pages
    this.createServiceWorker();
    
    // Criar manifest.json para PWA
    this.createManifest();
  }

  // Criar service worker
  createServiceWorker() {
    const swContent = `
// Service Worker - Safe-Bite GitHub Pages
const CACHE_NAME = 'safe-bite-v1';
const urlsToCache = [
  '/',
  '/${this.repoName}/',
  '/${this.repoName}/index.html',
  '/${this.repoName}/dashboard.html',
  '/${this.repoName}/settings.html',
  '/${this.repoName}/scanner.html',
  '/${this.repoName}/history.html',
  '/${this.repoName}/help.html',
  '/${this.repoName}/payment.html',
  '/${this.repoName}/login.html',
  '/${this.repoName}/signup.html',
  '/${this.repoName}/privacy.html',
  '/${this.repoName}/style.css',
  '/${this.repoName}/upgrade-popup.css',
  '/${this.repoName}/payment-brazil.css',
  '/${this.repoName}/api-config.js',
  '/${this.repoName}/script.js',
  '/${this.repoName}/user-sync.js',
  '/${this.repoName}/user-sync-integration.js',
  '/${this.repoName}/login-system.js',
  '/${this.repoName}/contact-system.js'
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
      start_url: `/${this.repoName}/`,
      display: "standalone",
      background_color: "#4CAF50",
      theme_color: "#2E7D32",
      orientation: "portrait",
      scope: `/${this.repoName}/`,
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

  // Fazer commit e push
  commitAndPush() {
    console.log('🚀 Fazendo commit e push...');
    
    try {
      // Adicionar arquivos
      execSync('git add .', { stdio: 'pipe' });
      console.log('✅ Arquivos adicionados');
      
      // Commit
      const commitMessage = `🚀 Deploy Safe-Bite v1.0 - ${new Date().toISOString().split('T')[0]}`;
      execSync(`git commit -m "${commitMessage}"`, { stdio: 'pipe' });
      console.log('✅ Commit realizado');
      
      // Push
      execSync('git push origin main', { stdio: 'pipe' });
      console.log('✅ Push realizado');
      
      return true;
    } catch (error) {
      console.log('❌ Erro no commit/push:', error.message);
      return false;
    }
  }

  // Instruções para ativar GitHub Pages
  showGitHubPagesInstructions() {
    console.log('\n🌐 **Próximos passos para ativar GitHub Pages:**');
    console.log('');
    console.log('1. **Acessar GitHub**:');
    console.log(`   https://github.com/${this.username}/${this.repoName}`);
    console.log('');
    console.log('2. **Configurar Pages**:');
    console.log('   Repository → Settings → Pages');
    console.log('   Source: Deploy from branch');
    console.log('   Branch: main');
    console.log('   Folder: / (root)');
    console.log('   Save');
    console.log('');
    console.log('3. **Aguardar deploy**:');
    console.log('   GitHub irá fazer o deploy automaticamente');
    console.log('   Aguarde 2-5 minutos');
    console.log('');
    console.log('4. **Acessar site**:');
    console.log(`   🌐 ${this.githubPagesUrl}`);
    console.log('');
    console.log('5. **(Opcional) Custom domain**:');
    console.log('   Em Pages → Custom domain');
    console.log('   Adicionar seu domínio');
    console.log('   Configurar DNS');
    console.log('');
    console.log('🎉 **Safe-Bite estará no ar!** 🌿');
  }

  // Executar deploy completo
  deploy() {
    console.log('🚀 **Iniciando deploy para GitHub Pages**');
    console.log('📁 Projeto: Safe-Bite');
    console.log('👤 Usuário: Brunonunes06');
    console.log('🌐 URL: https://brunonunes06.github.io/Nutri-Scan/');
    console.log('');
    
    // Verificar repositório Git
    if (!this.checkGitRepository()) {
      console.log('❌ Execute: git init');
      return;
    }
    
    // Verificar branch main
    if (!this.checkMainBranch()) {
      console.log('❌ Execute: git checkout -b main');
      return;
    }
    
    // Preparar arquivos
    this.prepareFiles();
    
    // Ajustar para GitHub Pages
    this.adjustFilesForGitHubPages();
    
    // Commit e push
    if (this.commitAndPush()) {
      // Mostrar instruções
      this.showGitHubPagesInstructions();
    } else {
      console.log('❌ Falha no deploy. Verifique os erros acima.');
    }
  }
}

// Executar deploy
const deploy = new GitHubPagesDeploy();
deploy.deploy();
