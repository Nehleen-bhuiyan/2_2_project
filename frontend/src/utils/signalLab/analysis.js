// Turns raw Float32Array audio into the numbers each chart needs:
// downsampled waveform peaks, FFT spectra, level meters, filter response
// curves, transfer curves, envelopes and decay plots.

import { rfftMagnitudeDb, nextPow2 } from "./fft";
import {
  lowpassMask,
  highpassMask,
  bassBoostGain,
  trebleBoostGain,
  equalizerGain,
  transferCurve,
} from "./dsp";

const DB_FLOOR = -60;

// Downsample to ~`targetPoints` columns, keeping local min/max so
// transients and clipping are still visible (standard waveform technique).
export function computeWaveformPeaks(x, targetPoints = 600) {
  const n = x.length;
  if (n === 0) return [];
  const bucket = Math.max(1, Math.floor(n / targetPoints));
  const points = [];
  for (let i = 0; i < n; i += bucket) {
    let min = Infinity;
    let max = -Infinity;
    const end = Math.min(i + bucket, n);
    for (let j = i; j < end; j++) {
      if (x[j] < min) min = x[j];
      if (x[j] > max) max = x[j];
    }
    points.push({ min, max });
  }
  return points;
}

export function computeLevels(x) {
  let peak = 0;
  let sumSquares = 0;
  for (let i = 0; i < x.length; i++) {
    const a = Math.abs(x[i]);
    if (a > peak) peak = a;
    sumSquares += x[i] * x[i];
  }
  const rms = x.length ? Math.sqrt(sumSquares / x.length) : 0;
  const floor = 1e-6;
  return {
    peak,
    rms,
    peakDb: 20 * Math.log10(peak + floor),
    rmsDb: 20 * Math.log10(rms + floor),
  };
}

export function computeSpectrum(x, sampleRate, fftSize) {
  const size = fftSize || Math.min(16384, nextPow2(Math.min(x.length, 65536)));
  const { freqs, magsDb } = rfftMagnitudeDb(x, sampleRate, size);
  const points = [];
  for (let i = 0; i < freqs.length; i++) {
    points.push({ x: freqs[i], y: Math.max(magsDb[i], DB_FLOOR) });
  }
  return { points, nyquist: sampleRate / 2 };
}

// Analytic filter/EQ response curve (what the effect does to every
// frequency), independent of any particular input signal.
export function computeFrequencyResponse(effectId, params, sampleRate) {
  const nyquist = sampleRate / 2;
  const numPoints = 400;
  const freqs = new Float32Array(numPoints);
  // log-ish spacing so low end (where most action happens) isn't squashed
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    freqs[i] = 20 * Math.pow(nyquist / 20, t);
  }

  let gain;
  if (effectId === "lowpass") {
    gain = lowpassMask(freqs, params.cutoff, 300);
  } else if (effectId === "highpass") {
    gain = highpassMask(freqs, params.cutoff, 50);
  } else if (effectId === "bassBoost") {
    gain = bassBoostGain(freqs, params.amount, params.cutoff);
  } else if (effectId === "trebleBoost") {
    gain = trebleBoostGain(freqs, params.amount, params.cutoff, nyquist);
  } else if (effectId === "equalizer") {
    gain = equalizerGain(freqs, params.bassDb, params.midDb, params.trebleDb);
  } else {
    gain = new Float32Array(numPoints).fill(1);
  }

  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const db = 20 * Math.log10(Math.max(gain[i], 1e-4));
    points.push({ x: freqs[i], y: db });
  }
  return { points, cutoff: params.cutoff, nyquist };
}

export function computeTransferCurvePoints(drive, amount, steps = 200) {
  const xs = [];
  for (let i = 0; i <= steps; i++) xs.push(-1 + (2 * i) / steps);
  const ys = transferCurve(drive, amount, xs);
  return xs.map((x, i) => ({ x, y: ys[i] }));
}

export function computeFadeEnvelope(sampleRate, totalDuration, duration, direction) {
  const points = [];
  const steps = 100;
  const fadeDur = Math.min(duration, totalDuration);
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * totalDuration;
    let gain;
    if (direction === "in") {
      gain = t >= fadeDur ? 1 : t / fadeDur;
    } else {
      const start = totalDuration - fadeDur;
      gain = t <= start ? 1 : 1 - (t - start) / fadeDur;
    }
    points.push({ x: t, y: gain });
  }
  return points;
}

export function computeEchoDecay(delay, feedback, repeats) {
  const points = [{ x: 0, y: 1 }];
  for (let r = 1; r <= repeats; r++) {
    points.push({ x: r * delay, y: Math.pow(feedback, r) });
  }
  return points;
}

export function computeReverbDecay(impulse, sampleRate, targetPoints = 300) {
  const n = impulse.length;
  const bucket = Math.max(1, Math.floor(n / targetPoints));
  const points = [];
  for (let i = 0; i < n; i += bucket) {
    let sumSq = 0;
    let count = 0;
    const end = Math.min(i + bucket, n);
    for (let j = i; j < end; j++) {
      sumSq += impulse[j] * impulse[j];
      count++;
    }
    const energy = count ? Math.sqrt(sumSq / count) : 0;
    const db = 20 * Math.log10(energy + 1e-5);
    points.push({ x: i / sampleRate, y: Math.max(db, -60) });
  }
  return points;
}

export function dbToLinear01(db, min = -60, max = 0) {
  return Math.min(1, Math.max(0, (db - min) / (max - min)));
}
