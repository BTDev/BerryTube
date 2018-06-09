BerryTube
=========

Before running
--------------

Copy `.env.sample` to `.env` and tweak the values. Both the domainis themselves and the main domain prefixed with www. must point to the server.

Run `docker volume create caddy` to create a shared volume for storing certificates. This can be shared across multiple instances.


Running
-------

To run (or apply changes): `docker-compose up -d --build`

To stop and remove containers (keeps data): `docker-compose down`

Note that the `web` directory is mounted directly into the containers (as read-only), so any changes there will get applied immediately.


Database
--------

The database is placed in a docker volume. To get an SQL prompt, run `docker exec -it berrytube_mysql_1 mysql -uberrytube -pberrytube berrytube`.
