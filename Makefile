.PHONY: all caddy node php push clean-docker

image_prefix:=registry.gitlab.com/berrytube/berrytube

all: caddy node php

caddy:
	docker build -t ${image_prefix}/caddy ./docker/caddy

node:
	docker build -t ${image_prefix}/node ./docker/node

php:
	docker build -t ${image_prefix}/php ./docker/php

push:
	docker push ${image_prefix}/caddy
	docker push ${image_prefix}/node
	docker push ${image_prefix}/php

clean-docker:
	docker ps -qa --no-trunc --filter "status=exited" | xargs -r docker rm
	docker images --filter "dangling=true" -q --no-trunc | xargs -r docker rmi
	docker volume ls -qf dangling=true | xargs -r docker volume rm
