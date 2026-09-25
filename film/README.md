# Vice & Versa — Chapter One film: "The Joy Plant"

Code-rendered motion graphics for the Chapter One film. The current build is the **pilot**:
the cold open, the title card and Scene 3, 3:49 at guide timing.

- `pilot.html`: the whole film as a deterministic canvas. `renderAt(t)` draws the frame at `t` seconds.
  Narration lines live in `SHOTS`, and timing comes from word count at 150 wpm (0.4 s per word).
- `render.py`: headless-Chromium frame capture, then ffmpeg, split across parallel workers.
- `SCRIPT-v2-CHANGES.md`: the fact-check edits applied to the v1 script, plus the open checks.
- `fonts/`: EB Garamond, IBM Plex Mono and Inter (SIL OFL), served locally.

```
pip install pillow numpy imageio-ffmpeg playwright
python3 render.py stills                # key frames -> out/stills/
python3 render.py video                 # out/joy-plant-pilot.mp4 (guide captions on)
python3 render.py video --no-captions   # clean version, for use under the real VO
```

`out/guide-vo.srt` is the cue sheet for recording the voiceover. Once the real VO exists, re-time
each shot to it and render with `--no-captions`.

Visual rules (from the script): dark paper-cutout ground; red strike line #A32A1E whenever a claim fails;
serif citation lower thirds; no depiction of drug consumption; no real logos or site screenshots.
