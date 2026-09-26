#!/usr/bin/env bash
# Contact sheets for review: ./scripts/sheets.sh out/file.mp4 [fps=4] [cols=5] [rows=6]
set -euo pipefail
in="$1"; fps="${2:-4}"; cols="${3:-5}"; rows="${4:-6}"
dir="out/review"; rm -rf "$dir"; mkdir -p "$dir"
ffmpeg -hide_banner -loglevel error -i "$in" -vf "fps=$fps,scale=384:-1,drawtext=text='%{pts\:hms}':x=8:y=8:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.6" "$dir/f%04d.png"
ffmpeg -hide_banner -loglevel error -pattern_type glob -i "$dir/f*.png" -vf "tile=${cols}x${rows}:padding=4:color=0x222222" "$dir/sheet%02d.png"
ls "$dir"/sheet*.png
