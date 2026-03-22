#!/usr/bin/env bash
set -euo pipefail
npm audit --omit=dev --audit-level=high
if rg -n "eval\(|new Function\(|child_process\.exec\(" src --glob '!**/*.test.*' > /tmp/security_antipatterns.txt; then
  echo "❌ Dangerous patterns found:"; cat /tmp/security_antipatterns.txt; exit 1
fi
echo "✅ Security scan passed"
