#!/bin/bash
set -eu

readonly SOURCE='http://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types'
readonly OUTFILE='config/generated/mime.types'

echo 'types {' >"$OUTFILE"

curl "$SOURCE" | \
    grep -v '^\s*#' | \
    sed -E -e 's/$/;/' -e 's/\t+/ /' | \
    grep -v -e application/x-ms-wmz -e image/vnd.dvb.subtitle | \
    sort >>"$OUTFILE"

echo '}' >>"$OUTFILE"
