#!/usr/bin/env bash
set -euo pipefail
patterns='(AKIA[0-9A-Z]{16}|AIza[0-9A-Za-z\-_]{35}|xox[baprs]-[0-9A-Za-z-]{10,}|ghp_[0-9A-Za-z]{36}|sk_live_[0-9A-Za-z]{24,}|-----BEGIN (RSA|EC|OPENSSH|DSA) PRIVATE KEY-----|CLOUDFLARE_API_TOKEN\s*=\s*["\x27][^"\x27]{10,}["\x27])'
staged_files=$(git diff --cached --name-only --diff-filter=ACM | tr '\n' ' ')
if [[ -z "${staged_files// }" ]]; then exit 0; fi
if git diff --cached | grep -E -n "$patterns" >/tmp/secret_scan_matches.txt; then
  echo "❌ Secret-like pattern detected in staged changes:"; cat /tmp/secret_scan_matches.txt; exit 1
fi
echo "✅ Secret scan passed"
