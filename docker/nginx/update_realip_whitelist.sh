#!/bin/bash
set -eu

# https://www.cloudflare.com/ips/
readonly URLS=(
    'https://www.cloudflare.com/ips-v4'
    'https://www.cloudflare.com/ips-v6'
)
readonly OUTFILE='config/generated/realip_whitelist.conf'

echo -n >"$OUTFILE"
for url in "${URLS[@]}"; do
    while read -r ip; do
        echo "set_real_ip_from $ip;" >>"$OUTFILE"
    done < <(curl -SsL "$url")
done
