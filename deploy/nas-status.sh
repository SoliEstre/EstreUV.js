#!/bin/sh
# nas-status.sh — export EstreUV staging container status / image version /
# logs into ./status/ so they are readable through the K: share (no ssh or
# sudo needed by the reader). Run on the NAS (called by nas-load.sh, or
# standalone via ssh / DSM Task Scheduler for periodic refresh).
#
# GUARDRAIL: scoped to the 'estreuv' compose project ONLY. Never reads or
# writes any other stack (stemmar-* / synology_* etc.).
#
# SSoT copy — deployed to /volume1/docker/estreuv (K:\estreuv) by
# build-and-transfer.ps1.
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="$HERE/status"
DOCKER="sudo /usr/local/bin/docker"
COMPOSE="$DOCKER compose -f $HERE/docker-compose.yaml --env-file $HERE/.env"
mkdir -p "$OUT"

# overall (compose project scope)
$COMPOSE ps --format json > "$OUT/containers.json" 2>&1 || true

# per-container: version/state + recent logs
for c in $($COMPOSE ps -q 2>/dev/null); do
  name=$($DOCKER inspect --format '{{.Name}}' "$c" 2>/dev/null | sed 's#^/##')
  [ -z "$name" ] && continue
  $DOCKER inspect --format 'name={{.Name}}
image={{.Config.Image}}
imageId={{.Image}}
state={{.State.Status}}
health={{if .State.Health}}{{.State.Health.Status}}{{else}}n/a{{end}}
startedAt={{.State.StartedAt}}
restartCount={{.RestartCount}}' "$c" > "$OUT/$name.info" 2>&1 || true
  $DOCKER logs --tail 200 --timestamps "$c" > "$OUT/$name.log" 2>&1 || true
done

date -u +"%Y-%m-%dT%H:%M:%SZ" > "$OUT/last-updated.txt"
echo "[nas-status] wrote $OUT (project: estreuv)"
