#!/usr/bin/env node
/**
 * Translation Key Scanner
 * 扫描项目中所有 t() 调用，检查是否有缺失的翻译 key
 * 使用方法: node scripts/scan-translations.js
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  // 需要扫描的源代码目录
  srcDirs: ['src'],
  // 翻译文件路径
  translationFiles: {
    en: 'messages/en.json',
    zh: 'messages/zh.json',
    fr: 'messages/fr.json'
  },
  // 需要扫描的文件扩展名
  extensions: ['.tsx', '.ts', '.jsx', '.js'],
  // 排除的目录
  excludeDirs: ['node_modules', '.next', 'dist', 'build'],
};

// 颜色输出
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

// 加载翻译文件
function loadTranslations(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`${colors.red}Error loading ${filePath}:${colors.reset}`, error.message);
    return {};
  }
}

// 展平嵌套对象
function flattenObject(obj, prefix = '') {
  let result = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(result, flattenObject(obj[key], newKey));
      } else {
        result[newKey] = obj[key];
      }
    }
  }
  return result;
}

// 检查 key 是否存在于翻译中
function keyExists(translations, key) {
  const keys = key.split('.');
  let current = translations;
  
  for (const k of keys) {
    if (current === null || typeof current !== 'object' || !(k in current)) {
      return false;
    }
    current = current[k];
  }
  return true;
}

// 从文件内容中提取 t() 调用的 key
function extractTranslationKeys(content) {
  const keys = new Set();
  
  // 匹配 t('key') 或 t("key")
  const tRegex = /t\(['"]([^'"]+)['"]\)/g;
  let match;
  while ((match = tRegex.exec(content)) !== null) {
    keys.add(match[1]);
  }
  
  // 匹配 t("key", { 或 t('key', {
  const tWithOptionsRegex = /t\(['"]([^'"]+)['"]\s*,/g;
  while ((match = tWithOptionsRegex.exec(content)) !== null) {
    keys.add(match[1]);
  }
  
  // 匹配 label: 'key' (sortOptions 等)
  const labelRegex = /label\s*:\s*['"]([^'"]+)['"]/g;
  while ((match = labelRegex.exec(content)) !== null) {
    if (match[1].includes('.')) {
      keys.add(match[1]);
    }
  }
  
  return Array.from(keys);
}

// 递归获取所有文件
function getAllFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
  
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      if (!CONFIG.excludeDirs.some(exclude => fullPath.includes(exclude))) {
        getAllFiles(fullPath, files);
      }
    } else if (CONFIG.extensions.some(ext => item.endsWith(ext))) {
      files.push(fullPath);
    }
  }
  return files;
}

// 主函数
function main() {
  console.log(`${colors.blue}🔍 Scanning translation keys...${colors.reset}\n`);
  
  // 加载所有翻译
  const translations = {};
  for (const [lang, filePath] of Object.entries(CONFIG.translationFiles)) {
    translations[lang] = loadTranslations(filePath);
    console.log(`${colors.blue}✓ Loaded ${lang} translations${colors.reset}`);
  }
  
  console.log('');
  
  // 获取所有源文件
  const srcDir = path.join(process.cwd(), 'src');
  const files = getAllFiles(srcDir);
  console.log(`${colors.blue}Found ${files.length} source files${colors.reset}\n`);
  
  // 收集所有使用的 key
  const allUsedKeys = new Set();
  const fileKeyMap = {};
  
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    const keys = extractTranslationKeys(content);
    
    if (keys.length > 0) {
      fileKeyMap[file] = keys;
      keys.forEach(key => allUsedKeys.add(key));
    }
  }
  
  console.log(`${colors.blue}Found ${allUsedKeys.size} unique translation keys${colors.reset}\n`);
  
  // 检查每个 key 是否存在于各语言中
  let hasMissing = false;
  const missingKeys = {
    en: [],
    zh: [],
    fr: []
  };
  
  for (const key of allUsedKeys) {
    for (const [lang, trans] of Object.entries(translations)) {
      if (!keyExists(trans, key)) {
        missingKeys[lang].push(key);
        hasMissing = true;
      }
    }
  }
  
  // 输出结果
  for (const [lang, keys] of Object.entries(missingKeys)) {
    if (keys.length > 0) {
      console.log(`${colors.red}❌ Missing keys in ${lang}.json:${colors.reset}`);
      keys.forEach(key => {
        // 找出哪些文件使用了这个 key
        const usedInFiles = Object.entries(fileKeyMap)
          .filter(([_, k]) => k.includes(key))
          .map(([file, _]) => file.replace(process.cwd(), ''));
        console.log(`  - ${colors.yellow}${key}${colors.reset}`);
        if (usedInFiles.length > 0) {
          console.log(`    ${colors.blue}Used in:${colors.reset} ${usedInFiles.join(', ')}`);
        }
      });
      console.log('');
    }
  }
  
  if (!hasMissing) {
    console.log(`${colors.green}✅ All translation keys are present in all languages!${colors.reset}`);
    return 0;
  } else {
    console.log(`${colors.red}❌ Found missing translation keys!${colors.reset}`);
    console.log(`${colors.yellow}Please add the missing keys to the translation files.${colors.reset}`);
    return 1;
  }
}

// 运行
const exitCode = main();
process.exit(exitCode);
