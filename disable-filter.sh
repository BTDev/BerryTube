#!/usr/bin/env bash
#
# Utility for disabling a filter, when one breaks the UI.
#
# Run without arguments to list all filters.
# Run with the index of a filter to disable it.
#
set -euo pipefail

if [ "$#" -eq 0 ]; then
    docker compose exec -T mysql sh -c 'mysql --table -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' <<'EOF'
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
            `name` TEXT PATH '$.name',
            `enable` BOOL PATH '$.enable'
        )
    ) AS json
WHERE
    misc.name = 'filters'
EOF
elif [ "$#" -eq 1 ]; then
    docker compose exec -T mysql sh -c 'mysql --table -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' <<EOF
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
