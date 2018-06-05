BerryTube
=========

Before running
--------------

Copy `.env.sample` to `.env` and fill in the domain you'll use to access BT, and an email address that's given to Let's Encrypt when requesting certificates. Both the domain itself and the domain prefixed with www. must point to the server.

If you want proper trusted certificates, remove `-staging` from `CA_URL`.


Running
-------

To build everything: `make`

To run (or apply changes): `docker-compose up -d`

To stop: `docker-compose down`


Database
--------

The MySQL database will be placed in the `database` directory. To get an SQL prompt, run `docker exec -it berrytube_bt-mysql_1 mysql -uberrytube -pberrytube`.
