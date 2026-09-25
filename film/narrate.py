"""Narrate the pilot with a stock Kokoro voice (no cloning).

    python3 narrate.py [voice]      # default bm_george (British male)

Writes vo/lines/<shot>_<i>.wav (one per narration line) and vo_timing.js, which pilot.html
uses to time every shot to the narration.
"""
import json, os, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.abspath(__file__))
MODELS = os.path.join(ROOT, "vo", "models")
# respellings so the voice says the script as intended
SAY = [("3400 B.C.", "thirty-four hundred B.C."), ("3400 BC", "thirty-four hundred B.C."),
       ("3350 to 3300 BC", "thirty-three fifty to thirty-three hundred B.C."),
       ("3000 to 2900 BC", "three thousand to twenty-nine hundred B.C."), ("2023", "twenty twenty-three"),
       ("ḪÚL", "khool"), ("GÍL", "gill"), ("Hul Gil", "Hool Gill"), ("hul gil", "hool gill"), ("Böck", "Berk"),
       ("Citrullus colocynthis", "sit-rullus, kollo-sinthis"), ("colocynth,", "kollo-sinth,"),
       ('"joy plant."', "joy plant."), ("'joy plant.'", "joy plant.")]


def speakable(text):
    for a, b in SAY:
        text = text.replace(a, b)
    return text


def trim(x, sr, db=-40):
    thr = 10 ** (db / 20) * max(1e-6, np.abs(x).max())
    idx = np.where(np.abs(x) > thr)[0]
    return x[max(0, idx[0] - int(.02 * sr)): idx[-1] + int(.05 * sr)] if len(idx) else x


def main(voice="bm_george", speed=1.0):
    kok = Kokoro(os.path.join(MODELS, "kokoro-v1.0.onnx"), os.path.join(MODELS, "voices-v1.0.bin"))
    out = os.path.join(ROOT, "vo", "lines"); os.makedirs(out, exist_ok=True)
    timing = {}
    for s in json.load(open(os.path.join(ROOT, "out", "vo_lines.json"))):
        if not s["lines"]:
            continue
        timing[s["id"]] = []
        for i, text in enumerate(s["lines"]):
            a, sr = kok.create(speakable(text), voice=voice, speed=speed, lang="en-gb")
            a = np.concatenate([np.zeros(int(.05 * sr)), trim(a, sr), np.zeros(int(.1 * sr))])
            sf.write(os.path.join(out, f"{s['id']}_{i}.wav"), a, sr)
            timing[s["id"]].append(round(len(a) / sr, 3))
            print(s["id"], i, timing[s["id"]][-1], flush=True)
    with open(os.path.join(ROOT, "vo_timing.js"), "w") as f:
        f.write("window.VO_TIMING = " + json.dumps(timing) + ";\n")


if __name__ == "__main__":
    main(*(sys.argv[1:2] or []))
