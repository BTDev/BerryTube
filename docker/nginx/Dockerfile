# https://hub.docker.com/_/nginx
ARG nginx_version=1.20.1

FROM nginx:${nginx_version}-alpine AS build

# https://github.com/openresty/headers-more-nginx-module/releases
ARG headersmore_version=0.33

# https://github.com/nginxinc/docker-nginx/blob/master/mainline/alpine/Dockerfile
RUN apk add --no-cache --virtual .build-deps \
        gcc \
        libc-dev \
        make \
        openssl-dev \
        pcre-dev \
        zlib-dev \
        linux-headers \
        libxslt-dev \
        gd-dev \
        geoip-dev \
        perl-dev \
        libedit-dev \
        mercurial \
        bash \
        alpine-sdk \
        findutils

RUN mkdir /tmp/build && \
    cd /tmp/build && \
    wget -O - "https://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz" | tar xzf - && \
    wget -O - "https://github.com/openresty/headers-more-nginx-module/archive/v${headersmore_version}.tar.gz" | tar xzf - && \
    apk add --no-cache git && \
    git clone --depth=1 --recurse-submodules "https://github.com/google/ngx_brotli.git"

RUN CONFARGS=$(nginx -V 2>&1 | sed -n -e 's/^.*arguments: //p') \
    cd /tmp/build/nginx-*/ && \
    ./configure --with-compat $CONFARGS \
        --add-dynamic-module=../headers-more-nginx-module-*/ \
        --add-dynamic-module=../ngx_brotli/ && \
    make && \
    make install

RUN wget -O /var/dhparam.pem "https://ssl-config.mozilla.org/ffdhe2048.txt"

################################################

FROM nginx:${nginx_version}-alpine

ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

RUN apk add --no-cache openssl

COPY --from=build /usr/local/nginx/modules/*.so /usr/local/nginx/modules/
COPY --from=build /var/dhparam.pem /var/dhparam.pem
COPY misc/* /
COPY config /etc/nginx.source

RUN env DOMAIN=berrytube.tv HTTP_PORT=8080 HTTPS_PORT=8443 LEGACY_SOCKET_PORT=8344 TLS_TYPE=selfsigned /entrypoint.sh nginx -t && \
    rm -r /var/selfsigned
