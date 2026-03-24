const fs = require('fs');
const path = require('path');

const registerPath = path.join(__dirname, 'src/components/auth/RegisterForm.tsx');
let content = fs.readFileSync(registerPath, 'utf8');

// 恢复备份
const backupPath = path.join(__dirname, 'src/components/auth/RegisterForm.tsx.backup');
const backupContent = fs.readFileSync(backupPath, 'utf8');
fs.writeFileSync(registerPath, backupContent);

// 重新读取
content = fs.readFileSync(registerPath, 'utf8');

// 添加 useEffect 导入
content = content.replace(
  "import { useState } from 'react';",
  "import { useState, useEffect } from 'react';"
);

// 在组件中添加 isClient 状态
content = content.replace(
  '  const [isLoading, setIsLoading] = useState(false);',
  `  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);`
);

// 修复 handleSubmit 中的 window 和 localStorage 访问
const handleSubmitStart = content.indexOf('const handleSubmit = async (e: React.FormEvent) => {');
if (handleSubmitStart !== -1) {
  let handleSubmitEnd = content.indexOf('}', handleSubmitStart);
  let braceCount = 1;
  let pos = handleSubmitStart + 1;
  
  while (braceCount > 0 && pos < content.length) {
    if (content[pos] === '{') braceCount++;
    if (content[pos] === '}') braceCount--;
    pos++;
  }
  handleSubmitEnd = pos;
  
  const handleSubmitFunc = content.substring(handleSubmitStart, handleSubmitEnd);
  
  // 修复 localStorage 访问
  let fixedFunc = handleSubmitFunc.replace(
    '      if (data.token) {\n        localStorage.setItem(TOKEN_KEY, data.token);',
    '      if (data.token && isClient) {\n        localStorage.setItem(TOKEN_KEY, data.token);'
  );
  
  fixedFunc = fixedFunc.replace(
    '        // Set client cookie so middleware sees it immediately\n        const secure = window.location.protocol === \'https:\' ? \'; Secure\' : \'\';\n        document.cookie = `stayneos_auth_token=${encodeURIComponent(data.token)}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${secure}`;',
    '        // Set client cookie so middleware sees it immediately\n        if (isClient) {\n          const secure = window.location.protocol === \'https:\' ? \'; Secure\' : \'\';\n          document.cookie = `stayneos_auth_token=${encodeURIComponent(data.token)}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax${secure}`;\n        }'
  );
  
  fixedFunc = fixedFunc.replace(
    '      if (data.user) {\n        localStorage.setItem(USER_KEY, JSON.stringify(data.user));',
    '      if (data.user && isClient) {\n        localStorage.setItem(USER_KEY, JSON.stringify(data.user));'
  );
  
  fixedFunc = fixedFunc.replace(
    '      // Hard redirect to dashboard (ensures middleware sees cookie)\n      window.location.assign(\'/dashboard\');',
    '      // Hard redirect to dashboard (ensures middleware sees cookie)\n      if (isClient) window.location.assign(\'/dashboard\');'
  );
  
  content = content.substring(0, handleSubmitStart) + fixedFunc + content.substring(handleSubmitEnd);
}

fs.writeFileSync(registerPath, content);
console.log('Fixed RegisterForm.tsx');
