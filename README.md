BerryTube
=========

Before running
--------------

Copy `.env.sample` to `.env` and tweak the values. Both the domain itself and the domain prefixed with www. must point to the server.


Running
-------

To build everything: `make`

To run (or apply changes): `docker-compose up -d`

To stop: `docker-compose down`

Note that the `web` directory is mounted directly into the containers (as read-only), so any changes there will get applied immediately.


Database
--------

The MySQL database will be placed in the `database` directory. To get an SQL prompt, run `docker exec -it berrytube_bt-mysql_1 mysql -uberrytube -pberrytube`.
