import { performance } from 'node:perf_hooks';
const ITERATIONS = 20000;
const start = performance.now();
for (let i = 0; i < ITERATIONS; i++) {
  const p = JSON.stringify({ i, t: Date.now(), payload: 'stayneos' });
  JSON.parse(p);
}
const elapsed = performance.now() - start;
const thresholdMs = 1200;
console.log(`Benchmark: ${ITERATIONS} json ops in ${elapsed.toFixed(2)}ms (threshold ${thresholdMs}ms)`);
if (elapsed > thresholdMs) process.exit(1);
