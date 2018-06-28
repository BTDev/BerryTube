FROM mysql:8.0

COPY docker-entrypoint.sh /usr/local/bin/
COPY initdb.d/ /docker-entrypoint-initdb.d/
COPY updates.d/ /docker-entrypoint-updates.d/
