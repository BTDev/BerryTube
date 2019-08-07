#!/bin/sh
set -eu

echo "Refreshing config..." >&2

readonly varnames="$(env | cut -d= -f1 | grep -v '[a-z]' | sed 's/^/$/' | xargs) \$HOST_IP"

readonly HOST_IP="$(route | grep '^default' | awk '{ print $2 }')"
export HOST_IP

for fname in $(find /etc/nginx.source -mindepth 1 -type f | cut -d/ -f4-); do
    envsubst "$varnames" <"/etc/nginx.source/$fname" >"/etc/nginx/$fname"
done

readonly pid="$(cat /var/cache/nginx/nginx.pid 2>/dev/null || true)"
if [ -n "$pid" ] && kill -0 "$pid"; then
    echo "Nginx is running; reloading..." >&2
    kill -HUP "$pid"
fi
