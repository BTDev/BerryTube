FROM node:10-alpine

RUN \
    apk update && \
    apk add git ffmpeg && \
    rm -rf /var/cache/apk/* && \
    mkdir -p /packages/berry-agent
    
WORKDIR /packages/berry-agent

ADD package.json yarn.lock /packages/berry-agent/

RUN yarn install

ADD src /packages/berry-agent/src/

ENTRYPOINT ["node"]
CMD ["."]
