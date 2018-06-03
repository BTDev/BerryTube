.PHONY: all push

image_prefix:=registry.gitlab.com/berrytube/berrytube

all:
	docker build -t ${image_prefix}/node ./docker/node
	docker build -t ${image_prefix}/php ./docker/php

push:
	docker push ${image_prefix}/node
	docker push ${image_prefix}/php
