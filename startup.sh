#!/bin/sh
set -eu
cd /workspace
node scripts/preview.mjs stop || true
if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
# Preview only: key already claimed for the hackathon. On Vercel set SECTORS_API_KEY in the dashboard — do not commit a .env.
if [ -z "${SECTORS_API_KEY:-}" ] && [ -f /workspace/artifacts/ccnn/.env ]; then
  SECTORS_API_KEY="$(grep '^SECTORS_API_KEY=' /workspace/artifacts/ccnn/.env | cut -d= -f2-)"
  export SECTORS_API_KEY
fi
npm run dev >>/tmp/app-startup.log 2>&1 &
