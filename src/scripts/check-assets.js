#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script para verificar se todas as referências de assets existem
 */

const ASSETS_DIR = path.join(__dirname, '../../assets');
const SRC_DIR = path.join(__dirname, '..');

// Extensões de arquivo que queremos verificar
const FILE_EXTENSIONS = ['.ts', '.html', '.css', '.scss'];

// Padrões regex para encontrar referências de assets
const ASSET_PATTERNS = [
  /assets\/[^'"\s)]+/g,
  /\/assets\/[^'"\s)]+/g,
  /'assets\/[^']+'/g,
  /"assets\/[^"]+"/g,
  /url\(['"]?([^'")]+)['"]?\)/g
];

function findAllFiles(dir, extensions) {
  let results = [];
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      results = results.concat(findAllFiles(filePath, extensions));
    } else if (extensions.some(ext => file.endsWith(ext))) {
      results.push(filePath);
    }
  }
  
  return results;
}

function extractAssetReferences(content) {
  const references = new Set();
  
  for (const pattern of ASSET_PATTERNS) {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Limpar a referência (remover aspas, parênteses, etc.)
        let cleanRef = match.replace(/['"()]/g, '');
        if (cleanRef.includes('url(')) {
          cleanRef = cleanRef.replace('url(', '').replace(')', '');
        }
        
        // Normalizar o caminho
        if (cleanRef.startsWith('/assets/')) {
          cleanRef = cleanRef.substring(1); // Remove a barra inicial
        }
        if (cleanRef.startsWith('assets/')) {
          references.add(cleanRef);
        }
      });
    }
  }
  
  return Array.from(references);
}

function checkAssetExists(assetPath) {
  const fullPath = path.join(__dirname, '../../', assetPath);
  return fs.existsSync(fullPath);
}

function main() {
  console.log('🔍 Verificando referências de assets...\n');
  
  const sourceFiles = findAllFiles(SRC_DIR, FILE_EXTENSIONS);
  const allReferences = new Set();
  const fileReferences = new Map();
  
  // Extrair todas as referências
  for (const filePath of sourceFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const references = extractAssetReferences(content);
      
      if (references.length > 0) {
        fileReferences.set(filePath, references);
        references.forEach(ref => allReferences.add(ref));
      }
    } catch (error) {
      console.error(`❌ Erro ao ler arquivo ${filePath}:`, error.message);
    }
  }
  
  console.log(`📊 Encontradas ${allReferences.size} referências únicas de assets\n`);
  
  // Verificar se os assets existem
  const missingAssets = [];
  const existingAssets = [];
  
  for (const assetPath of allReferences) {
    if (checkAssetExists(assetPath)) {
      existingAssets.push(assetPath);
    } else {
      missingAssets.push(assetPath);
    }
  }
  
  // Relatório
  if (existingAssets.length > 0) {
    console.log('✅ Assets existentes:');
    existingAssets.forEach(asset => console.log(`   ${asset}`));
    console.log();
  }
  
  if (missingAssets.length > 0) {
    console.log('❌ Assets não encontrados:');
    missingAssets.forEach(asset => {
      console.log(`   ${asset}`);
      
      // Mostrar onde esse asset é referenciado
      for (const [filePath, references] of fileReferences) {
        if (references.includes(asset)) {
          const relativePath = path.relative(process.cwd(), filePath);
          console.log(`      → Referenciado em: ${relativePath}`);
        }
      }
    });
    console.log();
  }
  
  // Sumário
  console.log('📋 Sumário:');
  console.log(`   ✅ Assets encontrados: ${existingAssets.length}`);
  console.log(`   ❌ Assets não encontrados: ${missingAssets.length}`);
  console.log(`   📁 Arquivos verificados: ${sourceFiles.length}`);
  
  if (missingAssets.length > 0) {
    console.log('\n⚠️  Há assets faltando! Verifique os caminhos ou adicione os arquivos.');
    process.exit(1);
  } else {
    console.log('\n🎉 Todos os assets foram encontrados!');
  }
}

if (require.main === module) {
  main();
}
