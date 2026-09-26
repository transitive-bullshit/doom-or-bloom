#!/usr/bin/env bash
# Lighter social/web encode straight from the lossless segments (no generational loss).
# Usage: ./scripts/encode-web.sh out/doom-or-bloom-web.mp4 [crf=21]
set -euo pipefail
out="${1:-out/doom-or-bloom-web.mp4}"; crf="${2:-21}"
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i out/segments.txt -i public/soundtrack.wav \
  -map 0:v -map 1:a -c:v libx264 -preset slow -crf "$crf" -maxrate 14M -bufsize 28M -tune film \
  -pix_fmt yuv420p -profile:v high -level 4.2 -r 60 -c:a aac -b:a 256k -movflags +faststart -shortest "$out"
ls -la "$out"
