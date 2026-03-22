import fs from 'node:fs';

const metricsFile = process.env.CAPACITY_METRICS_FILE || 'logs/capacity-metrics.json';
if (!fs.existsSync(metricsFile)) {
  console.log(`No metrics file at ${metricsFile}; skipping capacity alarm`);
  process.exit(0);
}

const metrics = JSON.parse(fs.readFileSync(metricsFile, 'utf8'));
const cpu = Number(metrics.cpuUtilization ?? 0);
const memory = Number(metrics.memoryUtilization ?? 0);
const cpuThreshold = Number(process.env.CPU_ALERT_THRESHOLD || 0.85);
const memThreshold = Number(process.env.MEMORY_ALERT_THRESHOLD || 0.9);

console.log(`cpu=${cpu} memory=${memory}`);
if (cpu > cpuThreshold || memory > memThreshold) process.exit(1);
