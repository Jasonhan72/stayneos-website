import { translateContent } from './agents/echo/scripts/translate-content.mjs';

async function test() {
  const text = "Greater Toronto Area home sales were down 6.3% year-over-year in February 2026.";
  console.log('Testing Cloudflare AI translation...');
  console.log('Original:', text);
  
  try {
    const zh = await translateContent(text, 'zh');
    console.log('\nChinese:', zh);
  } catch (err) {
    console.log('Chinese translation failed:', err.message);
  }
  
  try {
    const fr = await translateContent(text, 'fr');
    console.log('\nFrench:', fr);
  } catch (err) {
    console.log('French translation failed:', err.message);
  }
}

test();