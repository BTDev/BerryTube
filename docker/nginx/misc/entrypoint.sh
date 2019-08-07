#!/bin/sh
set -eu

/refresh_config.sh
exec nginx -g 'daemon off;'
