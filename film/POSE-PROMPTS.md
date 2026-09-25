# Avatar pose prompts: Vice & Versa presenter

**How to use them**
- Attach your original avatar image as the **reference image** for every prompt. Consistency depends on it.
- Paste the **Character lock** paragraph, then **one pose line**, then the **Output rules**.
- Generate 3 or 4 of each and keep the one that matches the original best: same glasses, hair, face shape and outfit.
- Keep the **flat coral background**. It's what lets me cut the character out cleanly, like the first one.
- **Don't let the generator crop the hands.** A pose with a hand cut off at the frame edge is unusable.

---

## Character lock (paste first, every time)

> The same 3D animated cartoon character as the reference image, in the same Pixar-style 3D render: a young man
> with a tall swept-back golden-blond quiff, thick black square-framed glasses, bright blue eyes, a warm closed-mouth
> smile, rosy cheeks, a navy blue blazer over a white open-collar shirt. Identical face, hairstyle, glasses and
> outfit to the reference. Soft studio lighting from the front-left.

## Output rules (paste last, every time)

> Plain flat solid coral background (#E87A64), no gradient, no floor, no shadow on the background, no props other
> than those described, no text, no logos. Framed from the waist up, centred, with both hands and arms fully inside
> the frame. Square image, high resolution.

---

## Pose lines (one per image)

| # | File name | Pose line | Used for |
|---|-----------|-----------|----------|
| 1 | `pose_point.png` | Turned slightly to his left, pointing with his right index finger out to the side of the frame, arm extended at shoulder height, confident expression. | Pointing at the quote, the date, the red line |
| 2 | `pose_present.png` | Right hand raised to shoulder height, palm open and facing up as if presenting a small object resting on his palm, looking at his hand, slight smile. Nothing in the hand. | Holding up the gourd, a tablet or a beer jar (I composite the object into his palm) |
| 3 | `pose_sceptical.png` | Arms crossed, one eyebrow raised, head tilted slightly, a sceptical half-smile. | "Every part of it is wrong" and debunk beats |
| 4 | `pose_surprised.png` | Eyebrows raised high, eyes wide behind the glasses, mouth open in an "oh" of surprise, both hands raised slightly with palms out. | Reveals: "a stinking cucumber", "the breweries have eluded us" |
| 5 | `pose_thinking.png` | Hand on chin, eyes looking up and to the side, thoughtful. | Open questions ("Beer bread? Sourdough? Nobody knows.") |
| 6 | `pose_explain.png` | Both hands in front of his chest in a relaxed explaining gesture, fingers spread slightly, mouth slightly open mid-sentence. | General narration |
| 7 | `pose_serious.png` | Standing straight, hands loosely together in front, serious, sincere expression, no smile. | Serious beats: the DEA, the method, the series promise |

## Talking mouth (for crude lip-sync)

For the **original avatar** and **pose 6**, make one extra version with only the mouth changed. Most generators
have an edit mode for this.

> Edit this exact image. Change only the mouth: open it naturally as if mid-word saying "ah", showing a little of the
> upper teeth. Keep everything else identical: face, glasses, hair, clothes, background, framing, lighting.

Name them `talk_open.png` and `pose_explain_open.png`. I'll switch between closed and open mouth in time with the
loudness of your voiceover.

## Full body (optional, for wide scenery shots)

> Same character, same outfit plus dark trousers and brown leather shoes, standing full body, turned three-quarters to
> his left, one foot slightly forward as if mid-stride. Plain flat coral background (#E87A64), no shadow, whole body
> including feet inside the frame, portrait image, high resolution.

`body_walk.png`. With this one he can stand inside the scenes: in the marsh, in the hall, on the dunes.

---

**Send them back** in this chat, or drop them into the `claude-memory` folder in your Drive. I'll cut them out and
wire them into the scenes.
**Check before sending:** the glasses have the same shape, the quiff isn't a different style, and the blazer is still navy.
Drift across images is the most common failure.
