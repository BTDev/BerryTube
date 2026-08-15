# https://hub.docker.com/_/mysql
FROM mysql:8.4.11

HEALTHCHECK --interval=10s --timeout=3s --start-period=20s CMD \
    mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e 'SELECT "Checking MySQL...";' "$MYSQL_DATABASE"
