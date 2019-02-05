# alpine isn't neccecary, this isn't a production container, and I like using bash for dev containers
FROM node:10

ADD root /
WORKDIR /packages/node/
RUN chmod +x /scripts/start.sh

ENTRYPOINT ["/scripts/start.sh"]