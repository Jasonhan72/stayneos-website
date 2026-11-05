#!/usr/bin/env bash
set -euo pipefail
umask 077
mkdir -p .local/e2e
openssl req -x509 -newkey rsa:2048 -nodes -days 2 \
  -keyout .local/e2e/key.pem -out .local/e2e/cert.pem \
  -subj '/CN=localhost' \
  -addext 'subjectAltName=DNS:localhost,IP:127.0.0.1' \
  -addext 'basicConstraints=critical,CA:TRUE'
