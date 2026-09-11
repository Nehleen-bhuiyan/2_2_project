// Metadata catalog for every Signal Lab effect: what it's called, the
// theory shown to the user, which parameters are adjustable, and which
// specialized "Effect Analysis" chart it uses. This is the single source
// of truth the Home tab, sidebar and effect tab all read from.

export const EFFECTS = [
  {
    id: "gain",
    name: "Gain",
    category: "Level",
    tagline: "Simple amplitude scaling.",
    backendType: "gain",
    analysisType: "levelMeter",
    theory: [
      "Gain multiplies every sample of the signal by a single constant. If the constant is greater than 1 the waveform gets taller (louder); if it's less than 1 the waveform shrinks (quieter).",
      "Because it's a linear operation, gain doesn't change the shape of the waveform at all — it only rescales it vertically. Push it too far past ±1.0 and the signal clips.",
    ],
    waveformNote:
      "Watch the peaks: they'll stretch taller or shorter by exactly the gain factor, and the overall shape stays identical.",
    controls: [
      { key: "gain", label: "Gain", min: 0, max: 3, step: 0.05, default: 1.6, unit: "×" },
    ],
  },
  {
    id: "normalize",
    name: "Normalize",
    category: "Level",
    tagline: "Boosts level while preserving shape.",
    backendType: "normalize",
    analysisType: "levelMeter",
    theory: [
      "Normalization finds the loudest peak in the whole signal, then scales every sample by the same factor so that peak lands exactly on a target level (like 0.95 of full scale).",
      "Unlike a fixed gain value, normalize adapts to whatever audio you give it — quiet recordings get boosted more, already-loud ones get boosted less (or turned down).",
    ],
    waveformNote:
      "The overall envelope shape is identical to the input; only the vertical scale changes so the tallest peak just touches the target line.",
    controls: [
      { key: "targetPeak", label: "Target peak", min: 0.2, max: 1.0, step: 0.01, default: 0.95, unit: "" },
    ],
  },
  {
    id: "fadeInOut",
    name: "Fade In / Fade Out",
    category: "Level",
    tagline: "Time-varying gain envelope.",
    backendType: "fadeIn / fadeOut",
    analysisType: "envelope",
    theory: [
      "A fade multiplies the signal by a gain envelope that changes over time instead of staying constant — ramping linearly from 0 to 1 (fade in) or 1 to 0 (fade out).",
      "It's the same multiplication idea as gain, just with a time-varying multiplier instead of a fixed one, which is why the waveform's outline tapers smoothly to silence.",
    ],
    waveformNote:
      "You'll see the waveform's outline taper down (or up) like a triangle at the start or end, while the untouched middle of the clip stays the same.",
    controls: [
      {
        key: "direction",
        label: "Direction",
        type: "select",
        options: [
          { value: "in", label: "Fade In" },
          { value: "out", label: "Fade Out" },
        ],
        default: "in",
      },
      { key: "duration", label: "Fade duration", min: 0.2, max: 4, step: 0.1, default: 1.2, unit: "s" },
    ],
  },
  {
    id: "lowpass",
    name: "Low-pass Filter",
    category: "Filter",
    tagline: "Removes content above a cutoff.",
    backendType: "lowpass",
    analysisType: "frequencyResponse",
    theory: [
      "A low-pass filter lets frequencies below a cutoff pass through unchanged, and progressively attenuates everything above it. Signal Lab does this in the frequency domain: FFT the signal, multiply by a smooth mask, then inverse-FFT back to time domain.",
      "The mask uses a raised-cosine transition rather than a hard on/off cutoff, because sudden cutoffs in the frequency domain cause ringing artifacts in the time domain.",
    ],
    waveformNote:
      "High frequencies carry the sharp, jittery detail in a waveform, so after filtering the waveform looks smoother and rounder — the fast wiggles are gone.",
    controls: [
      { key: "cutoff", label: "Cutoff frequency", min: 200, max: 12000, step: 50, default: 2500, unit: "Hz" },
    ],
  },
  {
    id: "highpass",
    name: "High-pass Filter",
    category: "Filter",
    tagline: "Removes content below a cutoff.",
    backendType: "highpass",
    analysisType: "frequencyResponse",
    theory: [
      "A high-pass filter is the mirror image of a low-pass: frequencies above the cutoff pass through, everything below is attenuated. It's built the same way — FFT, multiply by a smooth mask, inverse-FFT.",
      "This is the classic tool for removing low rumble, hum, or handling noise from a recording without touching the parts of the spectrum that carry the actual voice or instrument.",
    ],
    waveformNote:
      "Low frequencies usually carry the slow-moving 'body' of a waveform, so after filtering the waveform tends to look thinner, with less of the slow up-and-down drift.",
    controls: [
      { key: "cutoff", label: "Cutoff frequency", min: 50, max: 4000, step: 20, default: 400, unit: "Hz" },
    ],
  },
  {
    id: "bassBoost",
    name: "Bass Boost",
    category: "EQ",
    tagline: "Strengthens the low end.",
    backendType: "bassBoost",
    analysisType: "frequencyResponse",
    theory: [
      "Bass boost adds extra gain to frequencies below a cutoff, with the biggest boost right near 0 Hz and the boost fading out to nothing at the cutoff — a smooth low shelf rather than a hard switch.",
      "It doesn't remove anything, it only adds emphasis, so the result is a fuller, warmer low end without losing the rest of the spectrum.",
    ],
    waveformNote:
      "Slow, rounded swings in the waveform (the low-frequency content) become more pronounced relative to the fine detail on top.",
    controls: [
      { key: "amount", label: "Boost amount", min: 0, max: 1.5, step: 0.05, default: 0.7, unit: "" },
      { key: "cutoff", label: "Cutoff frequency", min: 80, max: 500, step: 10, default: 250, unit: "Hz" },
    ],
  },
  {
    id: "trebleBoost",
    name: "Treble Boost",
    category: "EQ",
    tagline: "Strengthens the high end.",
    backendType: "trebleBoost",
    analysisType: "frequencyResponse",
    theory: [
      "Treble boost is the mirror of bass boost: gain increases above a cutoff frequency, growing linearly toward the top of the spectrum (the Nyquist frequency), while everything below the cutoff is left alone.",
      "This adds 'air' and clarity — sibilance, cymbals, and fine texture — without touching the fundamental tones lower down.",
    ],
    waveformNote:
      "The fine, fast jitter riding on top of the waveform becomes more prominent, while the overall slow-moving shape stays about the same.",
    controls: [
      { key: "amount", label: "Boost amount", min: 0, max: 1.5, step: 0.05, default: 0.7, unit: "" },
      { key: "cutoff", label: "Cutoff frequency", min: 1500, max: 10000, step: 100, default: 4000, unit: "Hz" },
    ],
  },
  {
    id: "equalizer",
    name: "Equalizer",
    category: "EQ",
    tagline: "Independent bass / mid / treble control.",
    backendType: "equalizer",
    analysisType: "frequencyResponse",
    theory: [
      "This is a 3-band FFT equalizer: the spectrum is split into a bass region (below 250 Hz), a mid region (250 Hz–4 kHz) and a treble region (above 4 kHz), and each region gets its own flat gain in decibels.",
      "Dragging a band's slider directly reshapes the frequency-response curve below — that's the direct link between a control and the math it changes.",
    ],
    waveformNote:
      "Because three separate regions are boosted or cut independently, the waveform's texture shifts unevenly rather than scaling uniformly like a plain gain change.",
    controls: [
      { key: "bassDb", label: "Bass", min: -12, max: 12, step: 0.5, default: 4, unit: "dB" },
      { key: "midDb", label: "Mid", min: -12, max: 12, step: 0.5, default: 0, unit: "dB" },
      { key: "trebleDb", label: "Treble", min: -12, max: 12, step: 0.5, default: -3, unit: "dB" },
    ],
  },
  {
    id: "echo",
    name: "Echo",
    category: "Time-based",
    tagline: "Delayed, decaying repetitions.",
    backendType: "echo",
    analysisType: "decay",
    theory: [
      "Echo makes delayed copies of the signal, spaced by a fixed delay time, with each successive repeat multiplied by a feedback factor raised to increasing powers — so each repeat is quieter than the last.",
      "The final output blends the dry (unprocessed) signal with this stack of delayed repeats using a wet/dry mix, which is why turning wet all the way down leaves the signal untouched.",
    ],
    waveformNote:
      "You'll see the original waveform followed by fainter, evenly-spaced copies of itself trailing off into silence — each one delayed by the same time step.",
    controls: [
      { key: "delay", label: "Delay time", min: 0.05, max: 1.0, step: 0.01, default: 0.3, unit: "s" },
      { key: "feedback", label: "Feedback", min: 0, max: 0.9, step: 0.02, default: 0.45, unit: "" },
      { key: "repeats", label: "Repeats", min: 1, max: 6, step: 1, default: 3, unit: "" },
      { key: "wet", label: "Wet mix", min: 0, max: 1, step: 0.05, default: 0.5, unit: "" },
    ],
  },
  {
    id: "reverb",
    name: "Reverb",
    category: "Time-based",
    tagline: "Early reflections + decaying tail.",
    backendType: "reverb",
    analysisType: "decay",
    theory: [
      "Reverb simulates a room by convolving the dry signal with an impulse response — a short burst of noise whose energy decays exponentially, representing thousands of overlapping reflections off imaginary walls.",
      "Convolution is done efficiently in the frequency domain (FFT the signal and the impulse, multiply, inverse-FFT), which is mathematically identical to a very long time-domain sum but far faster to compute.",
    ],
    waveformNote:
      "The sharp transients in the original waveform get smeared out into a longer, denser tail, and the whole clip becomes noticeably longer.",
    controls: [
      { key: "wet", label: "Wet mix", min: 0, max: 1, step: 0.05, default: 0.4, unit: "" },
      { key: "decay", label: "Decay time", min: 0.1, max: 3, step: 0.1, default: 0.6, unit: "s" },
      { key: "duration", label: "Tail length", min: 0.3, max: 3, step: 0.1, default: 1.5, unit: "s" },
    ],
  },
  {
    id: "distortion",
    name: "Distortion",
    category: "Nonlinear",
    tagline: "Soft-clipping waveshaper.",
    backendType: "distortion",
    analysisType: "transferCurve",
    theory: [
      "Distortion applies a nonlinear function, y = tanh(drive × x), to every sample. At low drive the curve looks almost like a straight line (input ≈ output); at high drive the curve flattens hard near ±1, clipping the peaks.",
      "Because it's nonlinear, distortion creates brand-new frequencies (harmonics) that weren't in the original signal at all — that's why the spectrum grows extra peaks above the fundamental after this effect.",
    ],
    waveformNote:
      "Rounded peaks get squashed toward flat plateaus near the top and bottom of the waveform, which is the time-domain signature of clipping.",
    controls: [
      { key: "amount", label: "Amount", min: 0, max: 1, step: 0.05, default: 0.6, unit: "" },
      { key: "drive", label: "Drive", min: 1, max: 20, step: 0.5, default: 6, unit: "×" },
    ],
  },
  {
    id: "pitch",
    name: "Pitch Shift",
    category: "Spectral",
    tagline: "Moves pitch without changing duration.",
    backendType: "pitch",
    analysisType: "pitchMarker",
    theory: [
      "Pitch shifting needs to change the frequency content without changing how long the clip lasts. Signal Lab does this in two steps: first time-stretch the signal by the pitch ratio, then resample it back to the original length.",
      "Stretching without resampling would only change speed (like slow-motion). Resampling after stretching moves every frequency up or down by the same ratio while restoring the original duration.",
    ],
    waveformNote:
      "The overall envelope and duration stay put, but the fine ripples inside each cycle get packed closer together (pitch up) or spread further apart (pitch down).",
    controls: [
      { key: "semitones", label: "Shift", min: -12, max: 12, step: 1, default: 5, unit: "st" },
    ],
  },
  {
    id: "reverse",
    name: "Reverse",
    category: "Temporal",
    tagline: "Plays the signal backward.",
    backendType: "reverse",
    analysisType: "reverseCompare",
    theory: [
      "Reverse simply flips the sample order: the last sample becomes the first, and the first becomes the last. No frequency content is added or removed — every value that existed in the original is still present.",
      "Because human speech and most instruments have asymmetric attack/decay shapes, reversing usually sounds strikingly different even though the frequency spectrum is unchanged.",
    ],
    waveformNote:
      "The waveform becomes a mirror image of itself in time — sharp attacks at the start of the original now appear as sharp cutoffs at the end, and vice versa.",
    controls: [],
  },
  {
    id: "timeStretch",
    name: "Slow / Speed Up",
    category: "Temporal",
    tagline: "Stretches or compresses the timeline.",
    backendType: "slow / speedUp",
    analysisType: "durationStats",
    theory: [
      "Time-stretching changes duration while trying to keep pitch the same, by analysing the signal in overlapping windows and re-spacing those windows closer together (faster) or further apart (slower) before blending them back together.",
      "A rate below 1.0 spreads the windows out (slower, longer clip); a rate above 1.0 packs them closer together (faster, shorter clip). A rate of exactly 1.0 leaves the audio unchanged.",
    ],
    waveformNote:
      "The overall shape of the waveform is preserved, but it's stretched or squeezed horizontally along the time axis — the total clip length changes by the chosen rate.",
    controls: [
      { key: "rate", label: "Playback rate", min: 0.25, max: 2.5, step: 0.05, default: 0.7, unit: "×" },
    ],
  },
  {
    id: "denoise",
    name: "Denoise",
    category: "Spectral",
    tagline: "Suppresses steady background noise.",
    backendType: "denoise",
    analysisType: "denoiseSpectrum",
    theory: [
      "Denoise works frame-by-frame: it FFTs short overlapping windows (an STFT), estimates a 'noise floor' per frequency bin using a low percentile across time (noise tends to be the quiet, steady part), and then attenuates bins that sit near that floor.",
      "The attenuation is a soft mask rather than a hard on/off gate, which avoids the musical, watery artifacts that hard gating tends to introduce, then the cleaned spectrum is inverse-STFT'd back to a waveform.",
    ],
    waveformNote:
      "Steady, low-level hiss between louder parts of the signal gets thinner or disappears, while the louder foreground content is mostly preserved.",
    controls: [
      { key: "strength", label: "Strength", min: 0, max: 1, step: 0.05, default: 0.6, unit: "" },
    ],
  },
];

export function getEffectById(id) {
  return EFFECTS.find((e) => e.id === id) || null;
}

// Denoise assumes a real noise floor separate from the signal (estimated
// per-frequency-bin across time). A clean synthetic tone has no such
// separation — every frame looks the same — so the percentile-based noise
// estimate ends up treating the tone itself as "noise" and mostly erases
// it, which is a misleading demo rather than a useful one. Every other
// effect operates on the sample array directly and works fine on a
// synthetic signal, so everything else is available for custom waveforms.
export const CUSTOM_WAVEFORM_EXCLUDED_IDS = ["denoise"];

export function customWaveformEffects() {
  return EFFECTS.filter((e) => !CUSTOM_WAVEFORM_EXCLUDED_IDS.includes(e.id));
}

export function defaultParamsFor(effect) {
  const params = {};
  effect.controls.forEach((c) => {
    params[c.key] = c.default;
  });
  return params;
}
