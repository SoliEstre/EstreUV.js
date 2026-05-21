# EstreUV staging deploy (NAS / Synology Container Manager)

> Groundwork — authored 2026-05-18, **not yet deployed**. Local testing is
> the priority; the NAS deploy runs when needed.

## Topology

- **Staging host**: Synology NAS `EsteriskStor` (DSM 7.2.1, Container Manager).
- **docker share**: `/volume1/docker` mounted on the dev machine as `K:`.
  Project dir = `/volume1/docker/estreuv` = `K:\estreuv`.
- **docker access**: `esterisk` via scoped `sudo NOPASSWD /usr/local/bin/docker`
  (no docker group on Synology; socket is root:root).
- **SSH**: dedicated key `~/.ssh/estreuv_nas_ed25519` → `esterisk@10.110.210.56`.
- ⚠ **Shared host** — also runs `stemmar-*` / `synology_*` live stacks. All
  scripts here are scoped to the `estreuv` compose project and must never
  touch the others.

## Image

`packages/playground/Dockerfile` bakes the no-build PWA + a fresh
`node_modules` (resolved from the **published** `estreuv` via `estreuv:"*"`)
into nginx. So staging exercises the real published artifact (aligns with GA
gate G3/G4).

## One-shot deploy (from the dev machine)

```powershell
# build image + save tar + transfer to K: + (optionally) load on NAS
.\deploy\build-and-transfer.ps1 -Tag 0.2.0            # transfer only
.\deploy\build-and-transfer.ps1 -Tag 0.2.0 -Deploy   # + ssh nas-load.sh
```

`build-and-transfer.ps1` does: `docker build` → `docker save` →
`K:\estreuv\images\estreuv-playground-<tag>.tar` → sync `nas-load.sh` /
`nas-status.sh` + `IMAGE_TAG` to `K:\estreuv` → (with `-Deploy`) ssh-run
`nas-load.sh`.

## NAS side (run via ssh, or by the build script)

```sh
ssh -i ~/.ssh/estreuv_nas_ed25519 esterisk@10.110.210.56 "sh /volume1/docker/estreuv/nas-load.sh"
```

`nas-load.sh`: loads the newest `images/*.tar` → `docker compose up -d`
(project `estreuv`) → calls `nas-status.sh`.

## Observability via K: (no ssh needed)

`nas-status.sh` writes, scoped to the `estreuv` project, into
`K:\estreuv\status\`:

| File | Content |
| --- | --- |
| `containers.json` | `docker compose ps --format json` |
| `<container>.info` | image, imageId, state, health, startedAt, restartCount |
| `<container>.log` | last 200 log lines (timestamped) |
| `last-updated.txt` | UTC timestamp of the snapshot |

Read these directly through `K:\estreuv\status\` to check running image
version / state / logs. Refresh on demand:

```sh
ssh -i ~/.ssh/estreuv_nas_ed25519 esterisk@10.110.210.56 "sh /volume1/docker/estreuv/nas-status.sh"
```

(Optional: schedule `nas-status.sh` in DSM Task Scheduler for periodic refresh.)

## Ports

`HOST_PORT=58080` (`.env`) — chosen to avoid the host's existing services.
Staging URL: `http://EsteriskStor:58080/` (or NAS IP).
