// Minimal iterative radix-2 Cooley-Tukey FFT used across Signal Lab.
// Everything here works on plain Float32Array/Array pairs (real, imag)
// so it has no external dependency.

export function nextPow2(n) {
  let p = 1;
  while (p < n) p *= 2;
  return Math.max(p, 2);
}

// In-place forward FFT. re/im must have a power-of-two length.
export function fftInPlace(re, im) {
  const n = re.length;
  if (n <= 1) return;

  // bit-reversal permutation
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
  }

  for (let len = 2; len <= n; len <<= 1) {
    const ang = (-2 * Math.PI) / len;
    const wRe = Math.cos(ang);
    const wIm = Math.sin(ang);

    for (let i = 0; i < n; i += len) {
      let curRe = 1;
      let curIm = 0;

      for (let k = 0; k < len / 2; k++) {
        const uRe = re[i + k];
        const uIm = im[i + k];

        const vRe = re[i + k + len / 2] * curRe - im[i + k + len / 2] * curIm;
        const vIm = re[i + k + len / 2] * curIm + im[i + k + len / 2] * curRe;

        re[i + k] = uRe + vRe;
        im[i + k] = uIm + vIm;

        re[i + k + len / 2] = uRe - vRe;
        im[i + k + len / 2] = uIm - vIm;

        const nextRe = curRe * wRe - curIm * wIm;
        const nextIm = curRe * wIm + curIm * wRe;
        curRe = nextRe;
        curIm = nextIm;
      }
    }
  }
}

// In-place inverse FFT (returns real+imag scaled by 1/n).
export function ifftInPlace(re, im) {
  const n = re.length;
  for (let i = 0; i < n; i++) im[i] = -im[i];
  fftInPlace(re, im);
  for (let i = 0; i < n; i++) {
    re[i] = re[i] / n;
    im[i] = -im[i] / n;
  }
}

function hannWindow(n) {
  const w = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    w[i] = 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / Math.max(n - 1, 1));
  }
  return w;
}

export { hannWindow };

// Real-input magnitude spectrum in dB, using a Hann-windowed FFT.
// Returns { freqs, magsDb, magsLinear } for bins 0..fftSize/2 (Fs/2 inclusive).
export function rfftMagnitudeDb(x, sampleRate, fftSize) {
  const N = fftSize;
  const win = hannWindow(Math.min(N, x.length));
  const re = new Float32Array(N);
  const im = new Float32Array(N);

  const usable = Math.min(N, x.length);
  for (let i = 0; i < usable; i++) re[i] = x[i] * win[i];

  fftInPlace(re, im);

  const half = N / 2;
  const freqs = new Float32Array(half + 1);
  const magsLinear = new Float32Array(half + 1);
  const magsDb = new Float32Array(half + 1);

  // Coherent gain correction so window doesn't crush the dB scale.
  let winSum = 0;
  for (let i = 0; i < win.length; i++) winSum += win[i];
  const norm = winSum / 2 || 1;

  const floor = 1e-6;
  for (let k = 0; k <= half; k++) {
    freqs[k] = (k * sampleRate) / N;
    const mag = Math.sqrt(re[k] * re[k] + im[k] * im[k]) / norm;
    magsLinear[k] = mag;
    magsDb[k] = 20 * Math.log10(mag + floor);
  }

  return { freqs, magsDb, magsLinear };
}

// Filters a real signal by shaping its spectrum with maskFn(freqHz) -> gain.
// Uses zero-padding to the next power of two, then reconstructs a
// conjugate-symmetric spectrum so the inverse transform stays real.
export function filterViaFFTMask(x, sampleRate, maskFn) {
  const N = x.length;
  if (N === 0) return new Float32Array(0);

  const Npad = nextPow2(N);
  const re = new Float32Array(Npad);
  const im = new Float32Array(Npad);
  re.set(x);

  fftInPlace(re, im);

  const half = Npad / 2;
  const freqs = new Float32Array(half + 1);
  for (let k = 0; k <= half; k++) freqs[k] = (k * sampleRate) / Npad;

  const gains = maskFn(freqs);

  for (let k = 0; k <= half; k++) {
    re[k] *= gains[k];
    im[k] *= gains[k];
  }
  // restore conjugate symmetry for the negative-frequency half
  for (let k = 1; k < half; k++) {
    re[Npad - k] = re[k];
    im[Npad - k] = -im[k];
  }

  ifftInPlace(re, im);

  return re.slice(0, N);
}

// Frequency-domain convolution (linear convolution via zero-padded FFT).
export function fftConvolve(x, h) {
  const outLen = x.length + h.length - 1;
  const Npad = nextPow2(outLen);

  const xr = new Float32Array(Npad);
  const xi = new Float32Array(Npad);
  const hr = new Float32Array(Npad);
  const hi = new Float32Array(Npad);

  xr.set(x);
  hr.set(h);

  fftInPlace(xr, xi);
  fftInPlace(hr, hi);

  const yr = new Float32Array(Npad);
  const yi = new Float32Array(Npad);
  for (let i = 0; i < Npad; i++) {
    yr[i] = xr[i] * hr[i] - xi[i] * hi[i];
    yi[i] = xr[i] * hi[i] + xi[i] * hr[i];
  }

  ifftInPlace(yr, yi);

  return yr.slice(0, outLen);
}

export function percentile(sortedArr, p) {
  if (sortedArr.length === 0) return 0;
  const idx = (p / 100) * (sortedArr.length - 1);
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sortedArr[lo];
  const frac = idx - lo;
  return sortedArr[lo] * (1 - frac) + sortedArr[hi] * frac;
}
