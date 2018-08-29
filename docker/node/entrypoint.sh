#!/bin/sh
set -eu

# Wait for MySQL to be up, otherwise the server gets confused.
# Docker healthcheck isn't enough during server reboot.
while ! mysql -hmysql -uberrytube -p"${MYSQL_PASSWORD:-berrytube}" -e 'SELECT "Checking MySQL...";' berrytube; do
    echo "Waiting for MySQL..." >&2
    sleep 1
done

echo "MySQL is up! Launching the tube..." >&2
exec "$@"

