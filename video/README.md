# Doom or Bloom launch video

A 50-second launch film rendered by a small custom motion engine: every frame is drawn with Canvas2D, composited through a WebGL2 post pipeline, captured deterministically in headless Chromium, and encoded with ffmpeg.

## Setup

Run everything from this `video/` directory. It is a standalone package, separate from the app workspace.

The soundtrack is De Hofnar's "Zonnestraal" and is not committed. Build the edited soundtrack and its envelope from your own copy of the track (requires `ffmpeg`, `numpy` and `scipy`):

```sh
pnpm install
python3 scripts/prepare-audio.py ~/Music/Zonnestraal.mp3
```

## Commands

```sh
pnpm preview                       # http://127.0.0.1:4747/?preview: real-time playback with audio and a scrubber
pnpm still b50 b82.5 12.3s 900     # render single frames to out/stills (beat, seconds, or frame index)
pnpm render                        # full render → out/doom-or-bloom-launch.mp4 (~5 min on an M3 Pro)
node scripts/render.mjs --from 1200 --to 1500 --out out/clip.mp4   # render a frame range
./scripts/encode-web.sh out/doom-or-bloom-launch-web.mp4           # lighter social/web encode from the last render
./scripts/sheets.sh out/doom-or-bloom-launch.mp4                   # contact sheets for review
```

Rendering needs a GPU-backed Chromium: the Playwright build launches with ANGLE on Metal. It also needs `ffmpeg` on the path. The preview server serves portraits straight from the app's `public/personas`.

## How it fits together

- `src/engine/timing.ts` holds the beat grid. The soundtrack starts at 0:44.0 on the spoken count-in and runs at exactly 125 BPM (0.48 s per beat). "One, two, three" land on beats 14–16, "hit it!" on 17–17.5, and the band's downbeat on 18. Every animation is keyed to these global beat positions, not to frames.
- `src/timeline.ts` decides which scene draws at which beat. Its three 8-bar phrases are the three acts:
  - Beats 18–50: the problem.
  - Beats 50–82: the drop and the product.
  - Beats 82–114: the payoff and the CTA.

  The final lockup lands on beat 114, at 48.28 s.

- `src/engine/post.ts` renders sub-frame motion blur, accumulated in linear light at up to 64 samples per frame. It also handles perspective planes, soft-knee bloom, chromatic aberration, zoom blur, film grain, the vignette, flashes and dithering. Scenes drive these effects per frame through `s.fx`.
- `src/engine/mat4.ts` contains the perspective math for the tilted interview card, the flipping result cards and the 3D map world.
- `src/scenes/*` holds the scenes:
  - `hook`: the count-in.
  - `act1`: the problem.
  - `act2`: the product.
  - `act3`: the payoff and the CTA.
  - `brand`: shared pieces, namely the Eclipse logo, the wordmark and the map.
- `src/data/*` holds the video's data:
  - Featured-map coordinates from doom-or-bloom.com.
  - A port of the site's portrait-separation layout.
  - The story copy. The follow-up questions are real prompts from `content/releases/0.4.0-draft/prompts.json`.
  - `src/data/envelope.ts`, a per-frame kick and level envelope that gives the groove sections subtle music-reactive motion.

## Soundtrack edit

`scripts/prepare-audio.py` writes `public/soundtrack.wav`. The edit takes 44.000–90.358 s of the original track, then splices in the track's own riser bar (74.998–76.918 s) so the final lockup lands on its impact. The two pieces meet on a bar line with a 12 ms equal-power crossfade, and a 2.1 s fade follows the impact. Beat, vocal and phrase positions came from onset analysis and from word timestamps produced by two speech models.

Publishing a video with this track requires the appropriate music rights.

## Credits

The typefaces are Inter Tight, Instrument Serif and JetBrains Mono, used under the SIL Open Font License 1.1. Their licenses are in `public/fonts`.
