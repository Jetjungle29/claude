"""Synthesise the film's sound design from the page's event list.

Every sound is generated here (no samples, so no licensing): a low drone bed,
impact hits for the red line, pen scratches, typewriter keys, paper whooshes,
soft pops for the avatar, thuds and ticks. Output: 48 kHz stereo WAV.
"""
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile

SR = 48000
rng = np.random.default_rng(7)


def bp(x, lo, hi):
    return sosfilt(butter(2, [lo, hi], btype="band", fs=SR, output="sos"), x)


def lp(x, f):
    return sosfilt(butter(2, f, btype="low", fs=SR, output="sos"), x)


def hp(x, f):
    return sosfilt(butter(2, f, btype="high", fs=SR, output="sos"), x)


def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


def noise(sec):
    return rng.standard_normal(int(sec * SR))


def hit():
    n = int(2.2 * SR); t = np.arange(n) / SR
    f = 38 + 70 * np.exp(-t * 9)
    boom = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / .55)
    crack = lp(noise(2.2), 1800) * env(n, .002, .06) * .9
    sub = np.sin(2 * np.pi * 32 * t) * np.exp(-t / .9) * .6
    x = boom + crack + sub
    ir = noise(1.4) * np.exp(-np.arange(int(1.4 * SR)) / SR / .35) * .03
    return np.tanh(1.4 * (x + fftconvolve(x, ir)[:n] * .5)) * .9


def scratch():
    n = int(.42 * SR); t = np.arange(n) / SR
    x = bp(noise(.42), 1800, 6500) * (0.6 + 0.4 * np.sin(2 * np.pi * 23 * t) ** 2)
    return x * np.sin(np.pi * np.clip(t / .42, 0, 1)) ** .6 * .35


def key():
    n = int(.05 * SR)
    c = hp(noise(.05), 2500) * env(n, .0005, .006) * .5
    th = np.sin(2 * np.pi * (140 + rng.uniform(-15, 15)) * np.arange(n) / SR) * env(n, .001, .015) * .35
    return (c + th) * rng.uniform(.6, 1)


def whoosh():
    n = int(.7 * SR); t = np.arange(n) / SR
    x = noise(.7); out = np.zeros(n)
    for i, (lo, hi) in enumerate([(200, 900), (500, 2000), (1200, 4000)]):
        out += bp(x, lo, hi) * np.exp(-((t - .25 - i * .08) / .12) ** 2)
    return out * .22


def pop():
    n = int(.12 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (420 * np.exp(-t * 18) + 160) * t) * env(n, .002, .04) * .3


def thud():
    n = int(.6 * SR); t = np.arange(n) / SR
    return (np.sin(2 * np.pi * 58 * t) * np.exp(-t / .16) + lp(noise(.6), 400) * env(n, .001, .03) * .6) * .5


def tick():
    n = int(.08 * SR)
    return bp(noise(.08), 900, 3000) * env(n, .001, .012) * .18


SOUNDS = {"hit": hit, "scratch": scratch, "key": key, "whoosh": whoosh, "pop": pop, "thud": thud, "tick": tick}


def drone(total, hits):
    n = int(total * SR); t = np.arange(n) / SR
    base = sum(np.sin(2 * np.pi * f * t + p) * a for f, a, p in [(55, .5, 0), (82.4, .25, 1), (110.3, .15, 2), (164.8, .06, 3)])
    base *= .55 + .45 * np.sin(2 * np.pi * t / 17) ** 2
    air = lp(noise(total), 700) * .12 * (.6 + .4 * np.sin(2 * np.pi * t / 11 + 1))
    x = (base + air) * .28
    # swell into every hit, duck just after it
    g = np.ones(n)
    for h in hits:
        g += 1.2 * np.exp(-((t - h + .5) / .6) ** 2) * (t < h)
        g *= 1 - .6 * np.exp(-np.clip(t - h, 0, None) / .8) * (t >= h)
    fade = np.minimum(1, t / 2.5) * np.minimum(1, (total - t) / 3)
    return x * g * fade


def render(events, total, path, captions=None):
    n = int(total * SR) + SR
    L = np.zeros(n); R = np.zeros(n)
    d = drone(total, [e["t"] for e in events if e["type"] == "hit"])
    L[:len(d)] += d; R[:len(d)] += d * .97
    for e in events:
        fn = SOUNDS.get(e["type"])
        if not fn: continue
        s = fn(); i = int(e["t"] * SR); j = min(n, i + len(s))
        pan = rng.uniform(-.25, .25) if e["type"] in ("key", "tick") else 0
        L[i:j] += s[:j - i] * (1 - pan); R[i:j] += s[:j - i] * (1 + pan)
    mix = np.stack([L, R], 1)[:int(total * SR)]
    mix = np.tanh(mix * 1.1) / np.tanh(1.1)
    mix *= .89 / max(1e-6, np.abs(mix).max())
    wavfile.write(path, SR, (mix * 32767).astype(np.int16))


def mix_with_vo(shots, sfx_path, lines_dir, out_path, ffmpeg):
    """Place each narration line at its cue, polish the voice, duck the sound design under it, master to -14 LUFS."""
    import os, subprocess, tempfile
    import soundfile as sf
    from scipy.signal import resample_poly
    _, fx = wavfile.read(sfx_path); fx = fx.astype(float) / 32767
    vo = np.zeros(len(fx))
    for s in shots:
        for i, c in enumerate(s.get("cues", [])):
            p = os.path.join(lines_dir, f"{s['id']}_{i}.wav")
            if not os.path.exists(p): continue
            x, r = sf.read(p)
            if x.ndim > 1: x = x.mean(1)
            x = resample_poly(x, SR, r)
            a = int(c * SR); b = min(len(vo), a + len(x)); vo[a:b] += x[:b - a]
    tmp = tempfile.mkdtemp()
    wavfile.write(f"{tmp}/vo_raw.wav", SR, (np.clip(vo / max(1e-6, np.abs(vo).max()) * .9, -1, 1) * 32767).astype(np.int16))
    subprocess.run([ffmpeg, "-y", "-loglevel", "error", "-i", f"{tmp}/vo_raw.wav", "-af",
                    "highpass=f=70,equalizer=f=180:t=q:w=1:g=2,equalizer=f=3200:t=q:w=1.4:g=1.5,"
                    "acompressor=threshold=-22dB:ratio=2.5:attack=6:release=150:makeup=2,loudnorm=I=-16:TP=-2",
                    "-ar", str(SR), "-ac", "1", f"{tmp}/vo.wav"], check=True)
    _, v = wavfile.read(f"{tmp}/vo.wav"); v = v.astype(float) / 32767
    v = np.pad(v, (0, max(0, len(fx) - len(v))))[:len(fx)]
    # sidechain duck: the sound design drops ~8 dB while the voice is speaking
    envv = np.convolve(np.abs(v), np.ones(4800) / 4800, mode="same")
    duck = 1 - .6 * np.clip(envv / .02, 0, 1)
    mix = fx * (.55 * duck)[:, None] + v[:, None]
    wavfile.write(f"{tmp}/mix.wav", SR, (np.clip(mix / max(1e-6, np.abs(mix).max()) * .9, -1, 1) * 32767).astype(np.int16))
    subprocess.run([ffmpeg, "-y", "-loglevel", "error", "-i", f"{tmp}/mix.wav", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
                    "-ar", str(SR), out_path], check=True)
