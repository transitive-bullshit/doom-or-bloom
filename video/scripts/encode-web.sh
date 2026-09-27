#!/usr/bin/env bash
# Lighter social/web encode, from the last render's lossless segments while they exist
# (no generational loss), otherwise from the master. Frame 0 is the "DOOM or BLOOM?" hold
# (frame 157, beat 18.9) rendered without the slate, so feeds and link previews that show
# the first frame pose the question instead of the opening close-up.
# Usage: ./scripts/encode-web.sh [out/doom-or-bloom-launch-web.mp4] [crf=21]
set -euo pipefail
out="${1:-out/doom-or-bloom-launch-web.mp4}"; crf="${2:-21}"
pnpm build >/dev/null
node scripts/still.mjs --samples 32 --clean --prefix first 157 >/dev/null
if [[ -f out/segments.txt ]]; then src=(-f concat -safe 0 -i out/segments.txt); else src=(-i out/doom-or-bloom-launch.mp4); fi
ffmpeg -hide_banner -loglevel error -y "${src[@]}" -i public/soundtrack.wav -i out/stills/first0157.png \
  -filter_complex "[0:v][2:v]overlay=enable='eq(n,0)'[v]" \
  -map '[v]' -map 1:a -c:v libx264 -preset slow -crf "$crf" -maxrate 14M -bufsize 28M -tune film \
  -pix_fmt yuv420p -profile:v high -level 4.2 -r 60 -c:a aac -b:a 256k -movflags +faststart -shortest "$out"
ls -la "$out"
