---
name: vv-film
description: Build a Vice & Versa chapter film (animated long-form YouTube video) from a book-chapter script — approved look, avatar compositing, scenery kit, sound design, render pipeline and fact-check discipline. Use whenever Jethro asks to make, animate, render, restyle or continue a V&V chapter video, or mentions the film pipeline, the avatar, style frames, guide VO or the pilot.
---

# Vice & Versa chapter film

Chapter One pilot is the reference build: `film/`. Approved look (Sept 2026): dark paper-cutout world, full
environments, the illustrated 3D avatar composited as a paper "sticker" and relit per scene, big serif type,
the red strike line with glow + camera shake + hit sound.

## Before building (always)
1. Load `jethro-context`; read the Drive memory file.
2. Fact-check the script's riskiest claims by search before animating anything. Write a `SCRIPT-vN-CHANGES.md`
   table (where / old / new / why) + "still open" list. Hedge the cold open to the body's certainty.
3. Ask only what changes the build: narration source, scope (pilot vs full), personal asides approved?
4. Show style frames (3 stills) before any long render.

## Files
- `film/kit.js` — scenery (`KIT.hall`, `KIT.marsh`, `KIT.desert`, `KIT.reedsFG`), props (`KIT.gourd`, `KIT.poppy`),
  `KIT.strike` (red line, #A32A1E, glow), `KIT.avatar` (image bust, sticker edge, tint/rim relight, breathe, pop-in),
  film grain, vignette, light shafts, dust.
- `film/pilot.html` — the film as `SHOTS`: `{ id, lines[], lead, pad, strikeAfterLine, sfx(S), draw(t, S) }`.
  Timing = 0.4 s/word (150 wpm) + 0.6 s between lines. `S.cues[i]` / `S.durs[i]` give line timing; word-level
  sync = `S.cues[i] + wordIndex * SPW`. `sfx` returns `{t, type}` events (hit, scratch, key, whoosh, pop, thud, tick).
  Hits also drive camera shake + red flash.
- `film/sfx.py` — synthesises all audio from events (no samples → no licensing).
- `film/render.py` — `stills` (3 frames per shot) / `video [--no-captions]`; parallel Chromium capture → ffmpeg;
  writes `out/guide-vo.srt` cue sheet. Full 4-min render ≈ 10–15 min on 4 cores.
- `film/assets/` (git-ignored) — `avatar_cut.png` + `avatar_border.png`, keyed from the coral-background source.
  Recut new poses with the same plane-fit background key (see git history of this skill's session) — keep
  the coral background in pose prompts (`film/POSE-PROMPTS.md`).

## Rules
- Every fact on screen traces to the chapter; citations as lower thirds (Author, Year, Publication).
- No depiction of drug consumption; no real logos or site screenshots (quote text cards + source line).
- Show undeciphered/contested signs in transliteration, not invented glyphs.
- Period-correct scenery (e.g. no ziggurats before c. 2100 BC).
- Guide captions stay until Jethro's VO exists; then re-time shots to the VO and render `--no-captions`.
- Big files (mp4) never go in git; send via SendUserFile (720p review copy + 1080p master).
