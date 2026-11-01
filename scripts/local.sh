#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

# A machine-local toolchain is optional; a system Node 24 installation also works.
if [[ -x "$repo_root/.local/toolchain/bin/node" ]]; then
  export PATH="$repo_root/.local/toolchain/bin:$PATH"
fi

export PLAYWRIGHT_BROWSERS_PATH="${PLAYWRIGHT_BROWSERS_PATH:-$repo_root/.local/ms-playwright}"

if ! command -v node >/dev/null || [[ "$(node -p 'process.versions.node.split(".")[0]')" != "24" ]]; then
  echo 'StayNeos requires Node.js 24. Install/use the version in .nvmrc, then retry.' >&2
  exit 1
fi

if [[ $# -eq 0 ]]; then
  echo 'Usage: bash scripts/local.sh <npm arguments> (for example: run dev -- --hostname 127.0.0.1)' >&2
  exit 1
fi

exec npm "$@"
