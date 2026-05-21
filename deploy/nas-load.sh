#!/bin/sh
# nas-load.sh — load the latest transferred image tar and (re)deploy the
# EstreUV staging stack. Run on the NAS (via ssh from build-and-transfer.ps1
# or manually). Self-locating; uses the scoped `sudo NOPASSWD docker`.
#
# GUARDRAIL: operates ONLY on the 'estreuv' compose project. Never touches
# stemmar-* / synology_* or any other stack on this shared docker host.
#
# SSoT copy — deployed to /volume1/docker/estreuv (K:\estreuv) by
# build-and-transfer.ps1.
set -e
HERE="$(cd "$(dirname "$0")" && pwd)"
DOCKER="sudo /usr/local/bin/docker"

TAR="$(ls -t "$HERE"/images/*.tar 2>/dev/null | head -n1 || true)"
if [ -n "$TAR" ]; then
  echo "[nas-load] loading image: $TAR"
  $DOCKER load -i "$TAR"
else
  echo "[nas-load] no image tar in $HERE/images — using already-loaded image"
fi

echo "[nas-load] compose up -d (project: estreuv)"
$DOCKER compose -f "$HERE/docker-compose.yaml" --env-file "$HERE/.env" up -d

# refresh the K:-readable status snapshot
sh "$HERE/nas-status.sh"
echo "[nas-load] done"
