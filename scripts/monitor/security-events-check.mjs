import fs from 'node:fs';
const file = process.env.SECURITY_LOG_FILE || 'logs/security-events.log';
const maxCritical = Number(process.env.MAX_CRITICAL_EVENTS || 0);
if (!fs.existsSync(file)) process.exit(0);
const critical = (fs.readFileSync(file, 'utf8').match(/CRITICAL/gi) || []).length;
console.log(`critical events=${critical}`);
if (critical > maxCritical) process.exit(1);
