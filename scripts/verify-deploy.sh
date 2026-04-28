#!/usr/bin/env bash
set -euo pipefail

DEPLOY_URL="${1:-${DEPLOY_URL:-}}"

if [[ -z "$DEPLOY_URL" ]]; then
  echo "Usage: DEPLOY_URL=https://example.workers.dev bash scripts/verify-deploy.sh" >&2
  echo "   or: bash scripts/verify-deploy.sh https://example.workers.dev" >&2
  exit 2
fi

DEPLOY_URL="${DEPLOY_URL%/}"
LOCALES=(en zh-CN zh-TW es hi ar bn pt-BR pt-PT ru ja de fr ko it tr vi pl uk nl id th fa he sv cs el fil)

failures=0

check_status() {
  local path="$1"
  local expected="$2"
  local code
  code=$(curl -sS -o /dev/null -w '%{http_code}' "$DEPLOY_URL$path")
  echo "$path status=$code"
  if [[ "$code" != "$expected" ]]; then
    failures=$((failures + 1))
  fi
}

check_charset() {
  local path="$1"
  local content_type
  content_type=$(curl -sSI "$DEPLOY_URL$path" | tr -d '\r' | awk 'BEGIN{IGNORECASE=1} /^content-type:/ {print; exit}')
  echo "$path $content_type"
  if [[ ! "$content_type" =~ [Cc][Hh][Aa][Rr][Ss][Ee][Tt]=[Uu][Tt][Ff]-8 ]]; then
    failures=$((failures + 1))
  fi
}

for locale in "${LOCALES[@]}"; do
  check_status "/$locale" 200
done

for path in /en /ar /ja /de /sitemap.xml /manifest.webmanifest /api/health; do
  check_charset "$path"
done

health_body=$(curl -sS "$DEPLOY_URL/api/health")
echo "/api/health body=$health_body"
if [[ ! "$health_body" =~ '"status":"ok"' ]]; then
  failures=$((failures + 1))
fi

sitemap_count=$(curl -sS "$DEPLOY_URL/sitemap.xml" | grep -c '<url>')
echo "/sitemap.xml urls=$sitemap_count"
if (( sitemap_count < 140 )); then
  failures=$((failures + 1))
fi

asset_path=$(curl -sS "$DEPLOY_URL/en" | grep -o '/assets/[^"'\'' ]*\.js' | head -n 1 || true)
if [[ -n "$asset_path" ]]; then
  cache_control=$(curl -sSI "$DEPLOY_URL$asset_path" | tr -d '\r' | awk 'BEGIN{IGNORECASE=1} /^cache-control:/ {print; exit}')
  echo "$asset_path $cache_control"
  if [[ ! "$cache_control" =~ immutable ]]; then
    failures=$((failures + 1))
  fi
else
  echo "No built JS asset found from /en" >&2
  failures=$((failures + 1))
fi

if (( failures > 0 )); then
  echo "verify-deploy failed with $failures failure(s)" >&2
  exit 1
fi

echo "verify-deploy passed for $DEPLOY_URL"
