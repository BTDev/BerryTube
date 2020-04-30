#!/bin/sh
set -eu

function generate_cert_if_needed {
    local CERT_DIR=/var/selfsigned

    if ! [ -f "$CERT_DIR/fullchain.pem" ]; then
        echo "Self-signed cert requested and no existing cert found; generating..." >&2
    elif [ "$(openssl -noout -subject -in "$CERT_DIR/fullchain.pem")" != "subject=CN = $DOMAIN" ]; then
        echo "Self-signed cert requested for a different domain; regenerating..." >&2
    elif ! openssl -noout -checkend 604800 -in "$CERT_DIR/fullchain.pem"; then
        echo "Self-signed cert will expire in less than a week; regenerating..." >&2
    else
        return
    fi

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
}

if [ "$TLS_TYPE" = selfsigned ]; then
    generate_cert_if_needed
fi

/refresh_config.sh

echo 'Starting nginx...' >&2
exec "$@"
