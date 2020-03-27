FROM php:7.4.4-fpm-alpine3.11

ARG MAXMIND_KEY

RUN docker-php-ext-install pdo_mysql mysqli json && \
    curl -SsL "https://github.com/adoy/PHP-FastCGI-Client/archive/master.zip" >/tmp/fcgi-client.zip && \
    mkdir -p /opt/ && \
    unzip /tmp/fcgi-client.zip -d /opt/ && \
    rm -f /tmp/fcgi-client.zip && \
    mkdir -p /usr/local/share/GeoIP/ && \
    if [ -n "$MAXMIND_KEY" ]; then curl -SsL "https://download.maxmind.com/app/geoip_download?edition_id=GeoLite2-Country&suffix=tar.gz&license_key=$MAXMIND_KEY" | tar xvz --strip-components=1 -C /usr/local/share/GeoIP/; fi

HEALTHCHECK --interval=10s --timeout=3s --start-period=10s CMD test "$(/opt/PHP-FastCGI-Client-master/fcgiget.php localhost:9000/ping | tail -n1)" = pong
COPY php-fpm.ini /usr/local/etc/php-fpm.d/zzz-berrytube.conf
COPY php.ini /usr/local/etc/php/conf.d/zzz-berrytube.ini
RUN php-fpm -t
