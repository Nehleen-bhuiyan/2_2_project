// Audio input/output helpers shared by every Signal Lab effect tab:
// - decode an uploaded file
// - synthesize a demo tone (so the page always works with zero setup)
// - record from the microphone
// - mix down to mono + cap duration so the in-browser DSP stays fast
// - play back a Float32Array through Web Audio

export const LAB_SAMPLE_RATE = 44100;
export const MAX_DURATION_SECONDS = 8;

let sharedContext = null;
export function getAudioContext() {
  if (!sharedContext) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    sharedContext = new Ctx();
  }
  if (sharedContext.state === "suspended") {
    sharedContext.resume();
  }
  return sharedContext;
}

export async function decodeFile(file) {
  const ctx = getAudioContext();
  const arrayBuffer = await file.arrayBuffer();
  return ctx.decodeAudioData(arrayBuffer.slice(0));
}

// A short, musically-structured demo phrase: a few notes with distinct
// harmonics so filters, pitch shift and distortion all have something
// interesting to show, plus a touch of hiss for the denoise demo.
export function generateDemoBuffer(durationSec = 4) {
  const sr = LAB_SAMPLE_RATE;
  const n = Math.floor(sr * durationSec);
  const data = new Float32Array(n);

  const notesHz = [220, 277.18, 329.63, 220]; // A3, C#4, E4, A3
  const noteLen = Math.floor(n / notesHz.length);

  for (let noteIdx = 0; noteIdx < notesHz.length; noteIdx++) {
    const f0 = notesHz[noteIdx];
    const start = noteIdx * noteLen;
    const end = Math.min(start + noteLen, n);

    for (let i = start; i < end; i++) {
      const t = (i - start) / sr;
      const localT = (i - start) / (end - start);
      // quick attack, gentle decay so each note has a clear envelope
      const envelope = Math.min(1, localT * 12) * Math.exp(-localT * 1.6);

      const fundamental = Math.sin(2 * Math.PI * f0 * t);
      const harmonic2 = 0.45 * Math.sin(2 * Math.PI * f0 * 2 * t);
      const harmonic3 = 0.2 * Math.sin(2 * Math.PI * f0 * 3 * t);

      const hiss = (Math.random() * 2 - 1) * 0.02;

      data[i] = envelope * 0.6 * (fundamental + harmonic2 + harmonic3) + hiss;
    }
  }

  return { data, sampleRate: sr };
}

// Mixes an AudioBuffer down to mono, resamples toward LAB_SAMPLE_RATE if
// wildly different, and truncates to MAX_DURATION_SECONDS.
export function bufferToMonoFloat32(audioBuffer, maxDurationSec = MAX_DURATION_SECONDS) {
  const sampleRate = audioBuffer.sampleRate;
  const numChannels = audioBuffer.numberOfChannels;
  const maxSamples = Math.min(audioBuffer.length, Math.floor(sampleRate * maxDurationSec));

  const mono = new Float32Array(maxSamples);
  for (let ch = 0; ch < numChannels; ch++) {
    const chData = audioBuffer.getChannelData(ch);
    for (let i = 0; i < maxSamples; i++) {
      mono[i] += chData[i] / numChannels;
    }
  }

  return { data: mono, sampleRate };
}

export function createAudioBufferFromFloat32(data, sampleRate) {
  const ctx = getAudioContext();
  const buffer = ctx.createBuffer(1, Math.max(data.length, 1), sampleRate);
  buffer.copyToChannel(Float32Array.from(data), 0);
  return buffer;
}

export function playFloat32(data, sampleRate, { onEnded } = {}) {
  const ctx = getAudioContext();
  const buffer = createAudioBufferFromFloat32(data, sampleRate);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.onended = () => onEnded && onEnded();
  source.start();
  return () => {
    try {
      source.stop();
    } catch {
      // already stopped
    }
  };
}

// Simple mic recorder wrapper around MediaRecorder.
export function createMicRecorder() {
  let mediaRecorder = null;
  let stream = null;
  let chunks = [];

  return {
    async start() {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      mediaRecorder.start();
    },
    stop() {
      return new Promise((resolve, reject) => {
        if (!mediaRecorder) {
          reject(new Error("Recorder was not started"));
          return;
        }
        mediaRecorder.onstop = () => {
          stream.getTracks().forEach((t) => t.stop());
          resolve(new Blob(chunks, { type: "audio/webm" }));
        };
        mediaRecorder.stop();
      });
    },
    cancel() {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
      if (stream) stream.getTracks().forEach((t) => t.stop());
    },
  };
}

export async function decodeBlob(blob) {
  const ctx = getAudioContext();
  const arrayBuffer = await blob.arrayBuffer();
  return ctx.decodeAudioData(arrayBuffer);
}

export function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
