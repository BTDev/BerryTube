#!/bin/bash
set -eu

exec caddy \
    -agree \
    -email "$CLOUDFLARE_EMAIL" \
    -log "stderr" \
    -disable-http-challenge \
    -disable-tls-sni-challenge \
    "$@"
