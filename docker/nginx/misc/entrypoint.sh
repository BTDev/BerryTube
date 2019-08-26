#!/bin/sh
set -eu

CERT_DIR=/var/selfsigned

if [ "$TLS_TYPE" = selfsigned ] && ! [ -f "$CERT_DIR/fullchain.pem" ]; then
    echo "Self-signed requested but no certificate found; generating..." >&2

    cp /etc/ssl/openssl.cnf "$CERT_DIR/openssl.cnf"
    echo >>"$CERT_DIR/openssl.cnf"
    echo '[SAN]' >>"$CERT_DIR/openssl.cnf"
    echo "subjectAltName=DNS:$DOMAIN,DNS:*.$DOMAIN" >>"$CERT_DIR/openssl.cnf"

    openssl req -new -newkey rsa:4096 -days 365 -nodes -x509 \
        -subj "/CN=$DOMAIN" \
        -reqexts SAN \
        -config "$CERT_DIR/openssl.cnf" \
        -keyout "$CERT_DIR/privkey.pem" -out "$CERT_DIR/chain.pem"
    cat "$CERT_DIR/chain.pem" "$CERT_DIR/privkey.pem" >"$CERT_DIR/fullchain.pem"
fi

/refresh_config.sh

echo 'Starting nginx...' >&2
exec "$@"
