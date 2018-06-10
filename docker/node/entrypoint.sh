#!/bin/bash
set -eu

# wait for MySQL to be up, otherwise the server gets confused
while ! mysql -hmysql -uberrytube -pberrytube -e 'SELECT "Checking MySQL...";' berrytube; do
    echo "Waiting for MySQL..." >&2
    sleep 1
done

echo "MySQL is up! Launching the tube..." >&2
exec "$@"
