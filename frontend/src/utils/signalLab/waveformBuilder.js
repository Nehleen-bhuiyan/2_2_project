// Builds a synthetic waveform from a sequence of user-defined segments
// (shape + frequency + amplitude + duration), concatenated end to end.
// Used by the Custom Waveform tab so people can compose their own signal
// instead of only picking demo/upload/record.

export const WAVE_SHAPES = [
  { value: "sine", label: "Sine" },
  { value: "square", label: "Square" },
  { value: "triangle", label: "Triangle" },
  { value: "sawtooth", label: "Sawtooth" },
  { value: "noise", label: "White noise" },
  { value: "silence", label: "Silence" },
];

export const MAX_SEGMENTS = 8;
export const MAX_TOTAL_DURATION = 8; // seconds, keeps in-browser DSP snappy

export function createDefaultSegment() {
  return { shape: "sine", frequency: 440, amplitude: 0.7, duration: 1.0 };
}

function sampleUnitShape(shape, phase) {
  // phase is expected in [0, 1)
  switch (shape) {
    case "sine":
      return Math.sin(2 * Math.PI * phase);
    case "square":
      return phase < 0.5 ? 1 : -1;
    case "triangle":
      return 4 * Math.abs(phase - 0.5) - 1;
    case "sawtooth":
      return 2 * phase - 1;
    case "noise":
      return Math.random() * 2 - 1;
    case "silence":
    default:
      return 0;
  }
}

function sampleShape(shape, frequency, t) {
  const phase = frequency * t - Math.floor(frequency * t); // 0..1 fractional cycle
  return sampleUnitShape(shape, phase);
}

function applyEdgeFade(out, fadeSeconds, sampleRate) {
  const n = out.length;
  const fadeSamples = Math.min(Math.floor(sampleRate * fadeSeconds), Math.floor(n / 2));
  for (let i = 0; i < fadeSamples; i++) {
    const g = i / fadeSamples;
    out[i] *= g;
    out[n - 1 - i] *= g;
  }
}

function generateSegmentSamples(segment, sampleRate) {
  const n = Math.max(1, Math.floor(segment.duration * sampleRate));
  const out = new Float32Array(n);
  const amp = segment.shape === "silence" ? 0 : segment.amplitude;
  for (let i = 0; i < n; i++) {
    const t = i / sampleRate;
    out[i] = amp * sampleShape(segment.shape, segment.frequency, t);
  }

  // Tiny declick fade (5ms) at each segment edge so concatenated segments
  // don't create audible/visible clicks at the boundaries.
  applyEdgeFade(out, 0.005, sampleRate);

  return out;
}

// Concatenates every segment into a single mono Float32Array.
export function buildCustomWaveform(segments, sampleRate = 44100) {
  const clipped = segments.slice(0, MAX_SEGMENTS);
  const parts = clipped.map((seg) => generateSegmentSamples(seg, sampleRate));
  const totalLen = parts.reduce((sum, p) => sum + p.length, 0);
  const cappedLen = Math.min(totalLen, Math.floor(MAX_TOTAL_DURATION * sampleRate));

  const out = new Float32Array(cappedLen);
  let offset = 0;
  for (const part of parts) {
    const remaining = cappedLen - offset;
    if (remaining <= 0) break;
    const slice = part.length > remaining ? part.subarray(0, remaining) : part;
    out.set(slice, offset);
    offset += slice.length;
  }

  return { data: out, sampleRate };
}

export function totalDuration(segments) {
  return segments.reduce((sum, s) => sum + (s.duration || 0), 0);
}

// ---------------------------------------------------------------------
// Draw mode: the user drags across a strip to sculpt one cycle's worth of
// shape by hand, then that single cycle is looped at a chosen frequency
// to build the full signal — the same idea as a wavetable oscillator.
// ---------------------------------------------------------------------

export const DRAW_RESOLUTION = 200; // points across one drawn cycle
export const DRAW_PRESET_SHAPES = ["sine", "square", "triangle", "sawtooth"];

export function createFlatDrawPoints() {
  return new Array(DRAW_RESOLUTION).fill(0);
}

export function createPresetDrawPoints(shape) {
  return Array.from({ length: DRAW_RESOLUTION }, (_, i) => sampleUnitShape(shape, i / DRAW_RESOLUTION));
}

export function createRandomDrawPoints() {
  // A handful of random anchor points, smoothly interpolated, reads as a
  // squiggly-but-continuous shape rather than pure static.
  const anchors = 10;
  const anchorVals = Array.from({ length: anchors }, () => Math.random() * 2 - 1);
  return Array.from({ length: DRAW_RESOLUTION }, (_, i) => {
    const pos = (i / DRAW_RESOLUTION) * anchors;
    const lo = Math.floor(pos) % anchors;
    const hi = (lo + 1) % anchors;
    const frac = pos - Math.floor(pos);
    return anchorVals[lo] * (1 - frac) + anchorVals[hi] * frac;
  });
}

// Resamples the drawn cycle (length DRAW_RESOLUTION, wrapping) to however
// many samples one cycle needs at the chosen frequency + sample rate.
function resampleCycle(points, cycleSamples) {
  const len = points.length;
  const cycle = new Float32Array(cycleSamples);
  for (let i = 0; i < cycleSamples; i++) {
    const pos = (i / cycleSamples) * len;
    const lo = Math.floor(pos) % len;
    const hi = (lo + 1) % len;
    const frac = pos - Math.floor(pos);
    cycle[i] = points[lo] * (1 - frac) + points[hi] * frac;
  }
  return cycle;
}

export function buildDrawnWaveform(points, frequency, duration, sampleRate = 44100) {
  const freq = Math.max(20, Math.min(4000, frequency));
  const dur = Math.min(Math.max(duration, 0.1), MAX_TOTAL_DURATION);
  const cycleSamples = Math.max(2, Math.round(sampleRate / freq));
  const cycle = resampleCycle(points, cycleSamples);

  const totalSamples = Math.floor(dur * sampleRate);
  const out = new Float32Array(totalSamples);
  for (let i = 0; i < totalSamples; i++) out[i] = cycle[i % cycleSamples];

  // Only the very start/end need a fade — the loop itself repeats the
  // drawn cycle exactly, so there's no seam to declick in between.
  applyEdgeFade(out, 0.01, sampleRate);

  return { data: out, sampleRate };
}
