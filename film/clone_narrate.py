"""Narrate the pilot in Jethro's voice: a directed Kokoro performance, converted to his timbre with kNN-VC.

    python3 clone_narrate.py [test]

1. Every narration line is split into sentences and each sentence gets a direction (speed + the pause
   after it), so the read has pace changes and real pauses instead of one flat run.
2. Kokoro (bm_fable: British, the widest pitch range of the British male voices) performs it.
3. kNN-VC swaps the timbre for Jethro's, matching against his own recording (vo/ref16.wav).
Writes vo/lines/<shot>_<i>.wav and vo_timing.js (which pilot.html uses to time every shot).
"""
import json, os, re, sys
import numpy as np, soundfile as sf, torch, torchaudio

ROOT = os.path.dirname(os.path.abspath(__file__))
VO = os.path.join(ROOT, "vo")
sys.path.insert(0, os.path.join(VO, "models", "knn-vc"))

VOICE = "bm_fable"
BASE_SPEED = .95
SAY = [("3400 B.C.", "thirty-four hundred B.C."), ("3400 BC", "thirty-four hundred B.C."),
       ("3350 to 3300 BC", "thirty-three fifty to thirty-three hundred B.C."),
       ("3000 to 2900 BC", "three thousand to twenty-nine hundred B.C."), ("2023", "twenty twenty-three"),
       ("ḪÚL", "khool"), ("GÍL", "gill"), ("Hul Gil", "Hool Gill"), ("hul gil", "hool gill"), ("Böck", "Berk"),
       ("Citrullus colocynthis", "sit-rullus, kollo-sinthis"), ("colocynth,", "kollo-sinth,"),
       ('"joy plant."', "joy plant."), ("'joy plant.'", "joy plant."),
       ("1188 to 1069 BC", "eleven eighty-eight to ten sixty-nine B.C."), ("3.5%", "three and a half percent"),
       ("Deir el-Medina", "Dare el Meh-deena"), ("Menkaure", "Men-cow-ray"), ("Khufu", "Koo-foo"), ("Nippur", "Nip-poor"),
       ("Ninkasi", "Nin-kah-see"), ("bappir", "bap-peer"), ("Abydos", "Ah-bye-doss"), ("Tel Yehud", "Tel Yeh-hood"),
       ("Afanasieva", "Afa-nah-see-eva"), ("per shena", "per sheh-nah"), ("A. R. Neligan", "A. R. Nelligan"),
       ("3000 BC", "three thousand B.C."), ("1800 BC", "eighteen hundred B.C."), ("14th century BC", "fourteenth century B.C."),
       ("seventh-century BC", "seventh-century B.C."), ("\"Joy Plant\"", "Joy Plant"), ("\"memory aid", "memory aid"), ("couldn't read\"", "couldn't read")]
# Direction per sentence (matched by its opening words): (speed multiplier, pause after in seconds).
DIRECT = [
    ("Every part of it is wrong", .82, .95), ("Not exaggerated", .92, .35), ("Not simplified", .92, .55),
    ("It's wrong on the date", .97, .3),
    ("The joy plant was, almost certainly", .82, .5),
    ("One.", .88, .55), ("Two.", .88, .55), ("Three.", .88, .55), ("Four.", .88, .55),
    ("The date is before writing", .9, .4), ("The language can't", .9, .4), ("The signs don't mean", .9, .4),
    ("The plant is probably", .9, .4),
    ("The earliest reference to opium", .93, .35), ("The Sumerians referred", .9, .5),
    ("You have almost certainly met", .95, .4), ("It's in hundreds of books", 1.02, .25),
    ("Here we go", .95, .2), ("If you appreciate", 1.0, .35),
    ("Read that again", .85, .5), ("So the claim gives", .92, .4),
    ("But the second", .92, .3), ("It means something closer", .88, .45),
    ("A private conversation", .85, .6), ("That's what the whole thing rests on", .9, .5), ("A conversation, reported secondhand", .92, .3),
    ("Not Sumerian", .9, .35), ("Not 3400 BC", .9, .4), ("Some 2,700 years", .93, .3),
    ("Remember that book", .9, .35), ("47 years apart", .9, .4), ("There's a small postscript", .95, .4),
    ("That's going to be a recurring problem", .88, .3), ("So what is actually true", .92, .5), ("That is the earliest", .9, .3),
    ("Quick break", .95, .4), ("All right, back to it", .95, .2), ("Let's try another one", .92, .3),
    ("Here the news is better", .95, .3), ("The text is entirely real", .92, .35), ("Two corrections", .92, .3),
    ("The date isn't", .88, .4), ("They may well be school exercises", .95, .35),
    ("Now the complication", .9, .5), ("Beer bread?", .95, .3), ("Sourdough?", .95, .3), ("Malt loaf?", .95, .4), ("Nobody knows", .85, .3),
    ("And Damerow's conclusion", .92, .6), ("We do not even know", .85, .3),
    ("I like this story enormously", .95, .35), ("One more, and this one", .92, .5), ("A gallon a day", .9, .3),
    ("The general claim is true", .93, .35), ("But every precise figure fails", .82, .3),
    ("The ration numbers come", .9, .35), ("The gallon a day has no", .9, .35), ("The strength is a guess", .88, .4),
    ("Assume a thick, weak", .95, .2), ("and it's lunch", .9, .4), ("The evidence doesn't let you choose", .9, .35),
    ("But so far the breweries have eluded us", .85, .3), ("No brewery has ever been", .9, .4),
    ("This is a history of vice", .9, .5), ("A substance arrives", .92, .35), ("Some people are ruined", .92, .35),
    ("And what actually changes the toll", .9, .35), ("Every one of those levers", .9, .3),
    ("One promise", .88, .5), ("No doses", .9, .35), ("Nothing here teaches", .9, .3),
    ("Drunk for a penny", .9, .35), ("Dead drunk for twopence", .9, .35), ("Clean straw for nothing", .88, .3),
    ("Subscribe so you don't miss it", .95, .2),
]
DEFAULT_PAUSE = .32


def speakable(text):
    for a, b in SAY:
        text = text.replace(a, b)
    return text


def sentences(line):
    safe = line.replace("B.C.", "B․C․")
    parts = [p.strip().replace("․", ".") for p in re.split(r"(?<=[.!?])\s+", safe) if p.strip()]
    # "One. The date is before writing." -> two sentences, which the split already gives
    return parts


def direction(sentence):
    for start, speed, pause in DIRECT:
        if sentence.startswith(start):
            return speed, pause
    return 1.0, DEFAULT_PAUSE


def trim(x, sr, db=-40):
    thr = 10 ** (db / 20) * max(1e-6, np.abs(x).max())
    idx = np.where(np.abs(x) > thr)[0]
    return x[max(0, idx[0] - int(.02 * sr)): idx[-1] + int(.04 * sr)] if len(idx) else x


def transplant(src, conv, sr=16000, target_median=100.0):
    """kNN-VC flattens intonation (19 st in -> ~7 st out). Re-impose the performance's pitch contour,
    moved to Jethro's register, onto the converted voice's spectral envelope (WORLD vocoder)."""
    import pyworld as pw
    n = min(len(src), len(conv)); src = src[:n].astype(np.float64); conv = conv[:n].astype(np.float64)
    f0s, _ = pw.harvest(src, sr, f0_floor=60, f0_ceil=400, frame_period=5)
    f0c, tc = pw.harvest(conv, sr, f0_floor=55, f0_ceil=300, frame_period=5)
    sp = pw.cheaptrick(conv, f0c, tc, sr); ap = pw.d4c(conv, f0c, tc, sr)
    m = min(len(f0s), len(f0c)); f0s, f0c, sp, ap = f0s[:m], f0c[:m], sp[:m], ap[:m]
    med = np.median(f0s[f0s > 0])
    contour = target_median * np.where(f0s > 0, f0s, med) / med
    f0 = np.where((f0s > 0) & (f0c > 0), contour, np.where(f0c > 0, f0c, 0))
    y = pw.synthesize(np.ascontiguousarray(f0), sp, ap, sr, frame_period=5)
    return y / max(1e-6, np.abs(y).max()) * .9


def perform(kok, line):
    """Directed read of one narration line at 24 kHz."""
    chunks = []; sr = 24000
    ss = sentences(line)
    for k, s in enumerate(ss):
        speed, pause = direction(s)
        a, sr = kok.create(speakable(s), voice=VOICE, speed=BASE_SPEED * speed, lang="en-gb")
        chunks.append(trim(a, sr))
        if k < len(ss) - 1:
            chunks.append(np.zeros(int(pause * sr)))
    return np.concatenate(chunks), sr


def main(test=False):
    from kokoro_onnx import Kokoro
    import hubconf
    torch.set_num_threads(os.cpu_count() or 4)
    kok = Kokoro(os.path.join(VO, "models", "kokoro-v1.0.onnx"), os.path.join(VO, "models", "voices-v1.0.bin"))
    vc = hubconf.knn_vc(pretrained=True, progress=False, prematched=True, device="cpu")
    ms = vc.get_matching_set([os.path.join(VO, "ref16.wav")])
    out_dir = os.path.join(VO, "test" if test else "lines"); os.makedirs(out_dir, exist_ok=True)
    global START_SRC; START_SRC = sum(1 for f in os.listdir(out_dir) if f.endswith("_src.wav"))
    timing = {}
    for s in json.load(open(os.path.join(ROOT, "out", "vo_lines.json"))):
        if not s["lines"] or (test and s["id"] not in ("hold", "strike")):
            continue
        timing[s["id"]] = []
        for i, line in enumerate(s["lines"]):
            done = os.path.join(out_dir, f"{s['id']}_{i}.wav")
            if os.path.exists(done) and not test:   # resumable: keep lines already generated
                timing[s["id"]].append(round(sf.info(done).frames / 16000, 3)); continue
            if os.environ.get("MAX_NEW") and sum(1 for f in os.listdir(out_dir) if f.endswith("_src.wav")) >= int(os.environ["MAX_NEW"]) + START_SRC:
                sys.exit(3)                         # stop early; rerun to continue in a fresh process
            a, sr = perform(kok, line)
            w16 = torchaudio.functional.resample(torch.tensor(a, dtype=torch.float32)[None], sr, 16000)[0].numpy()
            src = os.path.join(out_dir, f"{s['id']}_{i}_src.wav"); sf.write(src, w16, 16000)
            y = vc.match(vc.get_features(src), ms, topk=4).numpy()
            y = transplant(w16, y)
            y = np.concatenate([np.zeros(800), trim(y, 16000), np.zeros(1600)])
            sf.write(os.path.join(out_dir, f"{s['id']}_{i}.wav"), y, 16000)
            timing[s["id"]].append(round(len(y) / 16000, 3))
            print(s["id"], i, timing[s["id"]][-1], flush=True)
    if not test:
        with open(os.path.join(ROOT, "vo_timing.js"), "w") as f:
            f.write("window.VO_TIMING = " + json.dumps(timing) + ";\n")


if __name__ == "__main__":
    main(test=sys.argv[1:2] == ["test"])
