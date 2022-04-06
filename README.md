# BerryTube

## Before running for the first time

Run `git submodule update --init --remote` to pull in berrymotes.

Download [the emote data](https://cdn.berrytube.tv/berrymotes/data/berrymotes_json_data.v2.json) and place it in `berrymotes/data/`. Avoid running the scraper, so that Reddit doesn't get mad at us.

Copy `.env.sample` to `.env` and tweak the values.

### Certificate options

-   `TLS_TYPE=none`

    Serve plain http on `$HTTPS_PORT` as well.

-   `TLS_TYPE=selfsigned`

    Generate a self-signed certificate on startup. Note that you must separately approve the certificate in your browser for any subdomains.

-   `TLS_TYPE=letsencrypt`

    Use certificates from `$LETSENCRYPT_DIR` (e.g. /etc/letsencrypt). The cert name must match `$DOMAIN`.

-   `TLS_TYPE=bindmount`

    Use certificate files from `$CERT_DIR` (e.g. /etc/letsencrypt/live/berrytube.tv).

## Running

To run (or apply changes): `docker-compose up -d --build`

To stop and remove containers, keeping database content: `docker-compose down`

To stop and remove everything, including database content: `docker-compose down --volumes`

Note that the `web` and `berrymotes` directories are bind mounted into the containers, so any changes there will be visible without a restart.

## Testing In Development

Simply execute `docker-compose -f docker-compose.test.yml up` to startup the testing container. This container will autorun scripts specfied in `docker/watcher/test/index.js`. It has access to all of berrytube's files via the `berrytube` module that is imported via `file:` in the package.json.

Each run will perform a `yarn install` - however, the node_moduels directory is cached locally in a named volume called `watcher_node_modules`.

## Database

The database is placed in a docker volume. To get an SQL prompt, run `docker-compose exec mysql mysql -uberrytube -pberrytube berrytube`.
