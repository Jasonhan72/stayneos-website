const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/property/[id]/PropertyDetailClient.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. 添加 useEffect 导入
content = content.replace(
  "import { useState, useMemo, useRef } from 'react';",
  "import { useState, useMemo, useRef, useEffect } from 'react';"
);

// 2. 在组件中添加 isClient 状态
const stateStart = content.indexOf('  const [currentImageIndex, setCurrentImageIndex] = useState(0);');
if (stateStart !== -1) {
  const before = content.substring(0, stateStart);
  const after = content.substring(stateStart);
  content = before + `  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isClient, setIsClient] = useState(false); // 客户端检测状态
  
  // 客户端检测 useEffect
  useEffect(() => {
    setIsClient(true);
  }, []);` + after.substring(after.indexOf('\n', after.indexOf('useState(false);')));
}

// 3. 修复 window.location.reload()
content = content.replace(
  '            onRetry={() => window.location.reload()}',
  '            onRetry={() => { if (typeof window !== "undefined") window.location.reload(); }}'
);

// 4. 修复 share 函数
const sharePattern = /onClick=\{async \(\) => \{[\s\S]*?navigator\.share[\s\S]*?\}\}/;
const shareMatch = content.match(sharePattern);
if (shareMatch) {
  let shareCode = shareMatch[0];
  
  // 修复 window.location.origin
  shareCode = shareCode.replace(
    'const shareUrl = `${window.location.origin}/property/${propertyId}`;',
    'const shareUrl = isClient ? `${window.location.origin}/property/${propertyId}` : "";'
  );
  
  // 修复 navigator.share
  shareCode = shareCode.replace(
    'if (navigator.share) {',
    'if (isClient && navigator.share) {'
  );
  
  // 修复 navigator.clipboard
  shareCode = shareCode.replace(
    'await navigator.clipboard.writeText(shareUrl);',
    'if (isClient && navigator.clipboard) await navigator.clipboard.writeText(shareUrl);'
  );
  
  content = content.replace(sharePattern, shareCode);
}

// 5. 确保主元素有 suppressHydrationWarning
content = content.replace(
  '    <main className="min-h-screen bg-white">',
  '    <main className="min-h-screen bg-white" suppressHydrationWarning>'
);

fs.writeFileSync(filePath, content);
console.log('Fixed PropertyDetailClient.tsx');
