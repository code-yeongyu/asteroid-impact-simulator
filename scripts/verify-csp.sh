#!/usr/bin/env bash
set -euo pipefail

url="${1:-http://localhost:8787/manifest.webmanifest}"
csp="$(curl -fsSI "$url" | tr -d '\r' | awk 'BEGIN{IGNORECASE=1} /^content-security-policy:/ {print; found=1} END{exit found ? 0 : 1}')"

printf '%s\n' "$csp"
printf '%s\n' "$csp" | grep -qi "default-src 'self'"
printf '%s\n' "$csp" | grep -qi "connect-src.*https://tiles.openfreemap.org"
script_src="$(printf '%s\n' "$csp" | sed -E 's/.*script-src ([^;]+);.*/\1/I')"
if printf '%s\n' "$csp" | grep -qi "unsafe-eval"; then
  printf 'verify-csp: unsafe-eval must not appear in CSP\n' >&2
  exit 1
fi

if printf '%s\n' "$script_src" | grep -qi "'unsafe-inline'"; then
  printf 'verify-csp: script-src must use hashes instead of unsafe-inline\n' >&2
  exit 1
fi
