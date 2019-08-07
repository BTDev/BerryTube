# BerryTube

## Before running for the first time

Run `git submodule update --init --remote` to pull in berrymotes.

Download [the emote data](https://cdn.berrytube.tv/berrymotes/data/berrymotes_json_data.v2.json) and place it in `berrymotes/data/`. Avoid running the scraper, so that Reddit doesn't get mad at us.

Copy `.env.sample` to `.env` and tweak the values.


## Certificate options

-   `TLS_TYPE=letsencrypt`

    Use certificates from /etc/letsencrypt (bind mounted). The cert name must match `$DOMAIN`.


## Running

To run (or apply changes): `docker-compose up -d --build`

To stop and remove containers (keeps data): `docker-compose down`

Note that the `web` directory is mounted directly into the containers (as read-only), so any changes there will get applied immediately.

## Testing In Development

Simply execute `docker-compose -f docker-compose.test.yml up` to startup the testing container. This container will autorun scripts specfied in `docker/watcher/test/index.js`. It has access to all of berrytube's files via the `berrytube` module that is imported via `file:` in the package.json.

Each run will perform a `yarn install` - however, the node_moduels directory is cached locally in a named volume called `watcher_node_modules`.

## Database

The database is placed in a docker volume. To get an SQL prompt, run `docker exec -it berrytube_mysql_1 mysql -uberrytube -pberrytube berrytube`.
