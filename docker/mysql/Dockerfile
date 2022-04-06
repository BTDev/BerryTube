# https://hub.docker.com/_/mysql
FROM mysql:8.0.25

HEALTHCHECK --interval=10s --timeout=3s --start-period=10s CMD \
    test -f /tmp/mysql-inited-flag && \
    mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e 'SELECT "Checking MySQL...";' "$MYSQL_DATABASE"

COPY docker-entrypoint.sh /usr/local/bin/
COPY initdb.d/ /docker-entrypoint-initdb.d/
COPY updates.d/ /docker-entrypoint-updates.d/
