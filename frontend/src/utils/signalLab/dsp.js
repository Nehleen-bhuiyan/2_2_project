// Client-side DSP effects for Signal Lab.
//
// These mirror the algorithms in backend/dsp/effects/*.py so the page can
// process the demo/uploaded/recorded audio instantly in the browser and
// draw the "before" and "after" of the exact same math the server uses.
// Everything operates on a single-channel (mono) Float32Array in the
// range [-1, 1].

import {
  filterViaFFTMask,
  fftConvolve,
  fftInPlace,
  ifftInPlace,
  hannWindow,
  percentile,
  nextPow2,
} from "./fft";

export function preventClipping(x) {
  let peak = 0;
  for (let i = 0; i < x.length; i++) {
    const a = Math.abs(x[i]);
    if (a > peak) peak = a;
  }
  if (peak > 1.0) {
    const out = new Float32Array(x.length);
    for (let i = 0; i < x.length; i++) out[i] = x[i] / peak;
    return out;
  }
  return x;
}

// ---------------------------------------------------------------------
// Gain / Normalize
// ---------------------------------------------------------------------

export function applyGain(x, gain = 1.0) {
  const out = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) out[i] = x[i] * gain;
  return preventClipping(out);
}

export function applyNormalize(x, targetPeak = 0.95) {
  let peak = 0;
  for (let i = 0; i < x.length; i++) peak = Math.max(peak, Math.abs(x[i]));
  if (peak === 0) return x.slice();
  const scale = targetPeak / peak;
  const out = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) out[i] = x[i] * scale;
  return out;
}

// ---------------------------------------------------------------------
// Fade in / Fade out
// ---------------------------------------------------------------------

export function applyFadeIn(x, sampleRate, duration = 1.0) {
  const out = x.slice();
  const fadeSamples = Math.min(Math.floor(duration * sampleRate), x.length);
  for (let i = 0; i < fadeSamples; i++) {
    out[i] *= i / Math.max(fadeSamples - 1, 1);
  }
  return out;
}

export function applyFadeOut(x, sampleRate, duration = 1.0) {
  const out = x.slice();
  const fadeSamples = Math.min(Math.floor(duration * sampleRate), x.length);
  const start = x.length - fadeSamples;
  for (let i = 0; i < fadeSamples; i++) {
    const g = 1 - i / Math.max(fadeSamples - 1, 1);
    out[start + i] *= g;
  }
  return out;
}

// ---------------------------------------------------------------------
// Frequency-domain gain masks (shared with the analysis charts)
// ---------------------------------------------------------------------

export function lowpassMask(freqs, cutoff, transition) {
  const mask = new Float32Array(freqs.length);
  const t = Math.max(transition, 1);
  const passEnd = Math.max(0, cutoff - t);
  const stopStart = cutoff + t;
  for (let i = 0; i < freqs.length; i++) {
    const f = freqs[i];
    if (f <= passEnd) mask[i] = 1;
    else if (f < stopStart) {
      const x = (f - passEnd) / (stopStart - passEnd);
      mask[i] = 0.5 * (1 + Math.cos(Math.PI * x));
    } else mask[i] = 0;
  }
  return mask;
}

export function highpassMask(freqs, cutoff, transition) {
  const mask = new Float32Array(freqs.length);
  const t = Math.max(transition, 1);
  const stopEnd = Math.max(0, cutoff - t);
  const passStart = cutoff + t;
  for (let i = 0; i < freqs.length; i++) {
    const f = freqs[i];
    if (f >= passStart) mask[i] = 1;
    else if (f > stopEnd) {
      const x = (f - stopEnd) / (passStart - stopEnd);
      mask[i] = 0.5 * (1 - Math.cos(Math.PI * x));
    } else mask[i] = 0;
  }
  return mask;
}

export function bassBoostGain(freqs, amount, cutoff) {
  const gain = new Float32Array(freqs.length).fill(1);
  for (let i = 0; i < freqs.length; i++) {
    if (freqs[i] <= cutoff) {
      gain[i] += amount * (1 - freqs[i] / cutoff);
    }
  }
  return gain;
}

export function trebleBoostGain(freqs, amount, cutoff, nyquist) {
  const gain = new Float32Array(freqs.length).fill(1);
  const denom = Math.max(nyquist - cutoff, 1);
  for (let i = 0; i < freqs.length; i++) {
    if (freqs[i] >= cutoff) {
      gain[i] += (amount * (freqs[i] - cutoff)) / denom;
    }
  }
  return gain;
}

export function dbToGain(db) {
  return Math.pow(10, db / 20);
}

export function equalizerGain(freqs, bassDb, midDb, trebleDb) {
  const gain = new Float32Array(freqs.length);
  const bassGain = dbToGain(bassDb);
  const midGain = dbToGain(midDb);
  const trebleGain = dbToGain(trebleDb);
  for (let i = 0; i < freqs.length; i++) {
    const f = freqs[i];
    if (f < 250) gain[i] = bassGain;
    else if (f < 4000) gain[i] = midGain;
    else gain[i] = trebleGain;
  }
  return gain;
}

export function applyLowpass(x, sampleRate, cutoff = 6000, transition = 300) {
  const nyquist = sampleRate / 2;
  const c = Math.min(Math.max(cutoff, 1), nyquist - 1);
  return filterViaFFTMask(x, sampleRate, (freqs) => lowpassMask(freqs, c, transition));
}

export function applyHighpass(x, sampleRate, cutoff = 120, transition = 50) {
  const nyquist = sampleRate / 2;
  const c = Math.min(Math.max(cutoff, 1), nyquist - 1);
  return filterViaFFTMask(x, sampleRate, (freqs) => highpassMask(freqs, c, transition));
}

export function applyBassBoost(x, sampleRate, amount = 0.5, cutoff = 250) {
  const a = Math.max(0, amount);
  const out = filterViaFFTMask(x, sampleRate, (freqs) => bassBoostGain(freqs, a, cutoff));
  return preventClipping(out);
}

export function applyTrebleBoost(x, sampleRate, amount = 0.5, cutoff = 4000) {
  const a = Math.max(0, amount);
  const nyquist = sampleRate / 2;
  const out = filterViaFFTMask(x, sampleRate, (freqs) => trebleBoostGain(freqs, a, cutoff, nyquist));
  return preventClipping(out);
}

export function applyEqualizer(x, sampleRate, bassDb = 0, midDb = 0, trebleDb = 0) {
  const out = filterViaFFTMask(x, sampleRate, (freqs) => equalizerGain(freqs, bassDb, midDb, trebleDb));
  return preventClipping(out);
}

// ---------------------------------------------------------------------
// Distortion
// ---------------------------------------------------------------------

export function transferCurve(drive, amount, xs) {
  return xs.map((v) => (1 - amount) * v + amount * Math.tanh(v * drive));
}

export function applyDistortion(x, amount = 0.5, drive = 4.0) {
  const a = Math.min(Math.max(amount, 0), 1);
  const d = Math.max(0, drive);
  if (a === 0) return x.slice();
  const out = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) {
    out[i] = (1 - a) * x[i] + a * Math.tanh(x[i] * d);
  }
  return preventClipping(out);
}

// ---------------------------------------------------------------------
// Echo
// ---------------------------------------------------------------------

export function applyEcho(x, sampleRate, { delay = 0.35, feedback = 0.4, repeats = 3, wet = 0.4 } = {}) {
  const fb = Math.min(Math.max(feedback, 0), 0.95);
  const w = Math.min(Math.max(wet, 0), 1);
  const delaySamples = Math.max(1, Math.floor(delay * sampleRate));
  const outLen = x.length + delaySamples * repeats;

  const echoSignal = new Float32Array(outLen);
  echoSignal.set(x, 0);

  for (let r = 1; r <= repeats; r++) {
    const start = delaySamples * r;
    const gain = Math.pow(fb, r);
    for (let i = 0; i < x.length; i++) {
      echoSignal[start + i] += x[i] * gain;
    }
  }

  const out = new Float32Array(outLen);
  for (let i = 0; i < outLen; i++) {
    const dry = i < x.length ? x[i] : 0;
    out[i] = dry * (1 - w) + echoSignal[i] * w;
  }

  return preventClipping(out);
}

// ---------------------------------------------------------------------
// Reverb
// ---------------------------------------------------------------------

// Deterministic PRNG (mulberry32) so the impulse response is reproducible.
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createReverbImpulse(sampleRate, duration, decay) {
  const length = Math.max(1, Math.floor(sampleRate * duration));
  const impulse = new Float32Array(length);
  const rand = mulberry32(42);
  const d = Math.max(decay, 0.001);
  for (let i = 0; i < length; i++) {
    const t = i / sampleRate;
    const envelope = Math.exp(-t / d);
    const reflection = rand() * 2 - 1;
    impulse[i] = reflection * envelope;
  }
  impulse[0] += 1.0;
  return impulse;
}

export function applyReverb(x, sampleRate, { wet = 0.35, decay = 0.5, duration = 1.5 } = {}) {
  const w = Math.min(Math.max(wet, 0), 1);
  const impulse = createReverbImpulse(sampleRate, duration, decay);
  const wetSignal = fftConvolve(x, impulse);

  const out = new Float32Array(wetSignal.length);
  for (let i = 0; i < out.length; i++) {
    const dry = i < x.length ? x[i] : 0;
    out[i] = (1 - w) * dry + w * wetSignal[i];
  }

  return { result: preventClipping(out), impulse };
}

// ---------------------------------------------------------------------
// Reverse
// ---------------------------------------------------------------------

export function applyReverse(x) {
  const out = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) out[i] = x[x.length - 1 - i];
  return out;
}

// ---------------------------------------------------------------------
// Time stretch (slow / speed up) + pitch shift
//
// The backend uses librosa's STFT phase-vocoder. In the browser we use a
// simpler, dependency-free overlap-add (OLA) time-stretch. It captures the
// same core idea (analyse in overlapping windows, re-space them, blend
// with a window function) without needing a full phase-vocoder.
// ---------------------------------------------------------------------

export function timeStretch(x, factor, frameSize = 2048, hop = 512) {
  const f = Math.max(0.1, factor);
  const outLen = Math.max(1, Math.floor(x.length * f));
  const out = new Float32Array(outLen);
  const weight = new Float32Array(outLen);
  const win = hannWindow(frameSize);
  const hopOut = hop * f;

  let inPos = 0;
  let outPos = 0;

  while (inPos + frameSize <= x.length && outPos + frameSize <= outLen + frameSize) {
    const base = Math.floor(outPos);
    for (let i = 0; i < frameSize; i++) {
      const idx = base + i;
      if (idx >= 0 && idx < outLen) {
        out[idx] += x[inPos + i] * win[i];
        weight[idx] += win[i];
      }
    }
    inPos += hop;
    outPos += hopOut;
  }

  for (let i = 0; i < outLen; i++) {
    if (weight[i] > 1e-6) out[i] /= weight[i];
  }

  return out;
}

export function resampleLinear(x, newLength) {
  const out = new Float32Array(newLength);
  if (x.length === 0) return out;
  const ratio = (x.length - 1) / Math.max(newLength - 1, 1);
  for (let i = 0; i < newLength; i++) {
    const pos = i * ratio;
    const lo = Math.floor(pos);
    const hi = Math.min(lo + 1, x.length - 1);
    const frac = pos - lo;
    out[i] = x[lo] * (1 - frac) + x[hi] * frac;
  }
  return out;
}

// rate < 1 => slower & lower playback speed (same pitch); rate > 1 => faster
export function applyTimeStretch(x, rate) {
  const r = Math.max(0.1, Math.min(4, rate));
  return timeStretch(x, 1 / r);
}

export function applyPitchShift(x, sampleRate, semitones = 0) {
  if (semitones === 0) return x.slice();
  const ratio = Math.pow(2, semitones / 12);
  const stretched = timeStretch(x, ratio);
  return resampleLinear(stretched, x.length);
}

// Rough fundamental-frequency estimate via autocorrelation (for the pitch
// shift "220 Hz -> 440 Hz" style status line).
export function estimateFundamentalHz(x, sampleRate, minHz = 60, maxHz = 1000) {
  const maxLag = Math.floor(sampleRate / minHz);
  const minLag = Math.floor(sampleRate / maxHz);
  const N = Math.min(x.length, sampleRate * 1); // ~1s window is plenty
  if (N < maxLag * 2) return 0;

  let bestLag = -1;
  let bestCorr = 0;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0;
    for (let i = 0; i < N - lag; i++) corr += x[i] * x[i + lag];
    if (corr > bestCorr) {
      bestCorr = corr;
      bestLag = lag;
    }
  }
  if (bestLag <= 0) return 0;
  return sampleRate / bestLag;
}

// ---------------------------------------------------------------------
// Denoise (STFT spectral gating)
// ---------------------------------------------------------------------

export function applyDenoise(x, sampleRate, { strength = 0.6, noisePercentile = 20, nperseg = 1024 } = {}) {
  const s = Math.min(Math.max(strength, 0), 1);
  const hop = Math.floor(nperseg / 2);
  const win = hannWindow(nperseg);
  const numFrames = Math.max(1, Math.floor((x.length - nperseg) / hop) + 1);
  const half = nperseg / 2;

  const magnitudes = []; // [frame][bin]
  const phases = [];

  for (let f = 0; f < numFrames; f++) {
    const start = f * hop;
    const re = new Float32Array(nperseg);
    const im = new Float32Array(nperseg);
    for (let i = 0; i < nperseg; i++) {
      const sampleIdx = start + i;
      re[i] = sampleIdx < x.length ? x[sampleIdx] * win[i] : 0;
    }
    fftInPlace(re, im);

    const mag = new Float32Array(half + 1);
    const phase = new Float32Array(half + 1);
    for (let k = 0; k <= half; k++) {
      mag[k] = Math.sqrt(re[k] * re[k] + im[k] * im[k]);
      phase[k] = Math.atan2(im[k], re[k]);
    }
    magnitudes.push(mag);
    phases.push(phase);
  }

  // Noise profile per frequency bin (percentile across time).
  const noiseProfile = new Float32Array(half + 1);
  const column = new Float32Array(numFrames);
  for (let k = 0; k <= half; k++) {
    for (let f = 0; f < numFrames; f++) column[f] = magnitudes[f][k];
    const sorted = Array.from(column).sort((a, b) => a - b);
    noiseProfile[k] = percentile(sorted, noisePercentile);
  }

  const cleanedMagnitudes = [];
  const removedMagnitudes = [];

  for (let f = 0; f < numFrames; f++) {
    const mag = magnitudes[f];
    const cleaned = new Float32Array(half + 1);
    const removed = new Float32Array(half + 1);
    for (let k = 0; k <= half; k++) {
      const threshold = noiseProfile[k] * (1 + 3 * s);
      let mask = mag[k] / (mag[k] + threshold + 1e-10);
      mask = Math.pow(mask, 1 + 3 * s);
      cleaned[k] = mag[k] * mask;
      removed[k] = mag[k] - cleaned[k];
    }
    cleanedMagnitudes.push(cleaned);
    removedMagnitudes.push(removed);
  }

  // Overlap-add reconstruction from cleaned magnitude + original phase.
  const outLen = x.length;
  const out = new Float32Array(outLen);
  const weight = new Float32Array(outLen);

  for (let f = 0; f < numFrames; f++) {
    const start = f * hop;
    const re = new Float32Array(nperseg);
    const im = new Float32Array(nperseg);
    const mag = cleanedMagnitudes[f];
    const phase = phases[f];

    for (let k = 0; k <= half; k++) {
      re[k] = mag[k] * Math.cos(phase[k]);
      im[k] = mag[k] * Math.sin(phase[k]);
    }
    for (let k = 1; k < half; k++) {
      re[nperseg - k] = re[k];
      im[nperseg - k] = -im[k];
    }

    ifftInPlace(re, im);

    for (let i = 0; i < nperseg; i++) {
      const idx = start + i;
      if (idx < outLen) {
        out[idx] += re[i] * win[i];
        weight[idx] += win[i] * win[i];
      }
    }
  }

  for (let i = 0; i < outLen; i++) {
    if (weight[i] > 1e-6) out[i] /= weight[i];
  }

  // Average noise-only spectrum snapshot (for the "removed" spectrum chart).
  const avgOriginal = new Float32Array(half + 1);
  const avgRemoved = new Float32Array(half + 1);
  for (let k = 0; k <= half; k++) {
    let sumO = 0;
    let sumR = 0;
    for (let f = 0; f < numFrames; f++) {
      sumO += magnitudes[f][k];
      sumR += removedMagnitudes[f][k];
    }
    avgOriginal[k] = sumO / numFrames;
    avgRemoved[k] = sumR / numFrames;
  }

  return { result: out, nperseg, avgOriginal, avgRemoved };
}

// ---------------------------------------------------------------------
// Single dispatcher, mirroring backend/dsp/effects/dispatcher.py so the
// UI layer just calls one function per effect id + params.
// ---------------------------------------------------------------------

export function runEffect(effectId, params, x, sampleRate) {
  switch (effectId) {
    case "gain":
      return { output: applyGain(x, params.gain) };
    case "normalize":
      return { output: applyNormalize(x, params.targetPeak) };
    case "fadeInOut":
      return {
        output:
          params.direction === "out"
            ? applyFadeOut(x, sampleRate, params.duration)
            : applyFadeIn(x, sampleRate, params.duration),
      };
    case "lowpass":
      return { output: applyLowpass(x, sampleRate, params.cutoff) };
    case "highpass":
      return { output: applyHighpass(x, sampleRate, params.cutoff) };
    case "bassBoost":
      return { output: applyBassBoost(x, sampleRate, params.amount, params.cutoff) };
    case "trebleBoost":
      return { output: applyTrebleBoost(x, sampleRate, params.amount, params.cutoff) };
    case "equalizer":
      return { output: applyEqualizer(x, sampleRate, params.bassDb, params.midDb, params.trebleDb) };
    case "echo":
      return { output: applyEcho(x, sampleRate, params) };
    case "reverb": {
      const { result, impulse } = applyReverb(x, sampleRate, params);
      return { output: result, extra: { impulse } };
    }
    case "distortion":
      return { output: applyDistortion(x, params.amount, params.drive) };
    case "pitch":
      return { output: applyPitchShift(x, sampleRate, params.semitones) };
    case "reverse":
      return { output: applyReverse(x) };
    case "timeStretch":
      return { output: applyTimeStretch(x, params.rate) };
    case "denoise": {
      const { result, nperseg, avgOriginal, avgRemoved } = applyDenoise(x, sampleRate, params);
      return { output: result, extra: { nperseg, avgOriginal, avgRemoved } };
    }
    default:
      return { output: x.slice() };
  }
}

export { nextPow2 };
