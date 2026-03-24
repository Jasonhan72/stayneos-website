const fs = require('fs');
const path = require('path');

// 修复 LoginForm.tsx
const loginPath = path.join(__dirname, 'src/components/auth/LoginForm.tsx');
let loginContent = fs.readFileSync(loginPath, 'utf8');

// 添加 useEffect 导入
loginContent = loginContent.replace(
  "import { useState } from 'react';",
  "import { useState, useEffect } from 'react';"
);

// 在组件中添加 isClient 状态
loginContent = loginContent.replace(
  '  const [isLoading, setIsLoading] = useState(false);',
  `  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);`
);

// 修复 localStorage 和 window 访问
loginContent = loginContent.replace(
  '        localStorage.setItem(TOKEN_KEY, data.token);',
  '        if (isClient) localStorage.setItem(TOKEN_KEY, data.token);'
);

loginContent = loginContent.replace(
  '        localStorage.setItem(USER_KEY, JSON.stringify(data.user));',
  '        if (isClient) localStorage.setItem(USER_KEY, JSON.stringify(data.user));'
);

loginContent = loginContent.replace(
  `        const secure = window.location.protocol === 'https:' ? '; Secure' : '';
        document.cookie = \`stayneos_auth_token=\${encodeURIComponent(data.token)}; Path=/; Max-Age=\${7 * 24 * 60 * 60}; SameSite=Lax\${secure}\`;`,
  `        if (isClient) {
          const secure = window.location.protocol === 'https:' ? '; Secure' : '';
          document.cookie = \`stayneos_auth_token=\${encodeURIComponent(data.token)}; Path=/; Max-Age=\${7 * 24 * 60 * 60}; SameSite=Lax\${secure}\`;
        }`
);

loginContent = loginContent.replace(
  '      window.location.assign(nextUrl);',
  '      if (isClient) window.location.assign(nextUrl);'
);

loginContent = loginContent.replace(
  '    window.location.href = \'/api/auth/google\';',
  '    if (isClient) window.location.href = \'/api/auth/google\';'
);

fs.writeFileSync(loginPath, loginContent);
console.log('Fixed LoginForm.tsx');

// 修复 RegisterForm.tsx
const registerPath = path.join(__dirname, 'src/components/auth/RegisterForm.tsx');
let registerContent = fs.readFileSync(registerPath, 'utf8');

// 查找类似的模式并修复
registerContent = registerContent.replace(
  /window\.location\.href\s*=/g,
  'if (typeof window !== "undefined") window.location.href ='
);

registerContent = registerContent.replace(
  /localStorage\./g,
  'typeof window !== "undefined" && localStorage.'
);

registerContent = registerContent.replace(
  /document\./g,
  'typeof window !== "undefined" && document.'
);

fs.writeFileSync(registerPath, registerContent);
console.log('Fixed RegisterForm.tsx');
