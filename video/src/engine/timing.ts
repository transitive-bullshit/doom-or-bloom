export const FPS = 60
export const W = 1920
export const H = 1080
export const DURATION = 50.6
export const FRAMES = Math.round(DURATION * FPS)

// Beat grid measured from "Zonnestraal" (De Hofnar): 125 BPM, 0.48 s per beat.
// Beat 0 sits at 37.558 s in the original track and the soundtrack starts at
// 44.0 s, so the spoken "One" lands on beat 14 and the band's downbeat on 18.
export const BEAT = 0.48
const GRID_REF = 37.558
const AUDIO_START = 44.0
// Visual hits lead the audio slightly; late visuals read as out of sync.
const VISUAL_LEAD = 0.012

export const beatAtTime = (t: number) =>
  (t + VISUAL_LEAD + AUDIO_START - GRID_REF) / BEAT
export const timeAtBeat = (b: number) =>
  b * BEAT + GRID_REF - AUDIO_START - VISUAL_LEAD

/** Bar downbeats of the three 8-bar phrases after the count-in. */
export const bar = {
  B: (n: number) => 18 + (n - 1) * 4,
  C: (n: number) => 50 + (n - 1) * 4,
  D: (n: number) => 82 + (n - 1) * 4
}
