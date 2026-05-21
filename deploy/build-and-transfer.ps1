#requires -Version 5
<#
.SYNOPSIS
  Build the EstreUV playground image, save it to a tar, stage it + the NAS
  scripts on the docker share (K: = /volume1/docker/estreuv), and optionally
  trigger the NAS-side load over ssh — all in one go.

.EXAMPLE
  .\deploy\build-and-transfer.ps1                 # build + transfer to K:
  .\deploy\build-and-transfer.ps1 -Deploy         # + ssh-run nas-load.sh
  .\deploy\build-and-transfer.ps1 -Tag 0.2.1 -Deploy

.NOTES
  - Image is built against the PUBLISHED estreuv (package.json estreuv:"*"
    → latest on npm), so staging exercises the real artifact.
  - NAS path /volume1/docker/estreuv is the K:\estreuv share (confirmed).
  - GUARDRAIL: only the 'estreuv' compose project is affected on the NAS.
#>
param(
  [string]$Tag    = "0.2.0",
  [string]$KShare = "K:\estreuv",
  [string]$NasDir = "/volume1/docker/estreuv",
  [string]$NasSsh = "esterisk@10.110.210.56",
  [string]$Key    = "$HOME\.ssh\estreuv_nas_ed25519",
  [switch]$Deploy
)
$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$ctx  = Join-Path $repo "packages\playground"
$img  = "estreuv-playground:$Tag"

Write-Host "[1/4] docker build $img  (context: packages/playground)"
docker build -t $img $ctx

Write-Host "[2/4] docker save -> $KShare\images\estreuv-playground-$Tag.tar"
New-Item -ItemType Directory -Force -Path "$KShare\images" | Out-Null
docker save $img -o "$KShare\images\estreuv-playground-$Tag.tar"

Write-Host "[3/4] sync scripts + tag -> $KShare"
Copy-Item (Join-Path $PSScriptRoot "nas-load.sh")   $KShare -Force
Copy-Item (Join-Path $PSScriptRoot "nas-status.sh") $KShare -Force
(Get-Content "$KShare\.env") -replace '^IMAGE_TAG=.*', "IMAGE_TAG=$Tag" | Set-Content -NoNewline:$false "$KShare\.env"

if ($Deploy) {
  Write-Host "[4/4] ssh nas-load.sh"
  ssh -i $Key $NasSsh "sh $NasDir/nas-load.sh"
  Write-Host "Done. Status snapshot: $KShare\status\  (read via K:)"
} else {
  Write-Host "[4/4] transfer only. To deploy on the NAS, run:"
  Write-Host "      ssh -i `"$Key`" $NasSsh `"sh $NasDir/nas-load.sh`""
}
