#!/bin/bash
#
# Place this script in /etc/letsencrypt/renewal-hooks/deploy/
#
set -eu

while read -r signal names; do
	name="$(cut -d, -f1 <<<"$names")"
	echo "Sending SIG$signal to container $name" >&2
	docker kill -s "$signal" "$name" >/dev/null || true
done < <(
	docker ps \
		--filter 'status=running' \
		--filter 'label=tv.berrytube.cert-renew-signal' \
		--format '{{ .Label "tv.berrytube.cert-renew-signal" }} {{ .Names }}'
)

