#!/usr/bin/env bash
#
# Utility for disabling a filter, when one breaks the UI.
#
# Run without arguments to list all filters.
# Run with the index of a filter to disable it.
#
set -euo pipefail

source .env

if [ "$#" -eq 0 ]; then
    docker compose exec -T mysql mysql --table -uberrytube -p"$MYSQL_PASSWORD" berrytube <<'EOF'
SELECT
    IF(json.enable, '[X]', '[ ]') AS `Enabled`,
    (json.index - 1) AS `Index`,
    json.name AS `Name`
FROM
    misc,
    JSON_TABLE(
        misc.value,
        '$[*]'
        COLUMNS (
            `index` FOR ORDINALITY,
            `name` VARCHAR(100) PATH '$.name',
            `enable` BOOL PATH '$.enable'
        )
    ) AS json
WHERE
    misc.name = 'filters'
EOF
elif [ "$#" -eq 1 ]; then
    docker compose exec -T mysql mysql --table -uberrytube -p"$MYSQL_PASSWORD" berrytube <<EOF
UPDATE
    misc
SET
    misc.value = JSON_REPLACE(
        misc.value,
        '\$[${1}].enable',
        FALSE
    )
WHERE
    misc.name = 'filters'
EOF
else
    echo "Run with exactly zero or one arguments." >&2
    exit 1
fi
