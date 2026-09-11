import { ArrowRight, RotateCcw, Timer } from "lucide-react";
import MiniLineChart from "./charts/MiniLineChart";
import LevelMeter from "./charts/LevelMeter";
import {
  computeLevels,
  computeFrequencyResponse,
  computeTransferCurvePoints,
  computeFadeEnvelope,
  computeEchoDecay,
  computeReverbDecay,
  computeSpectrum,
} from "../../utils/signalLab/analysis";
import { estimateFundamentalHz } from "../../utils/signalLab/dsp";

const hz = (v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0));

const StatCard = ({ label, value, accent }) => (
  <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
    <p className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{label}</p>
    <p className={`mt-1 text-xl font-semibold ${accent ? "text-[var(--accent)]" : "text-white"}`}>{value}</p>
  </div>
);

// Renders the third, effect-specific chart described in the visualization
// guide: whatever best explains *how* the active effect works.
const EffectAnalysisPanel = ({ effect, params, input, output, sampleRate, extra }) => {
  if (!input || input.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        Load some audio above to see the effect analysis.
      </p>
    );
  }

  switch (effect.analysisType) {
    case "levelMeter": {
      const before = computeLevels(input);
      const after = output ? computeLevels(output) : before;
      return <LevelMeter before={before} after={after} />;
    }

    case "envelope": {
      const totalDuration = input.length / sampleRate;
      const points = computeFadeEnvelope(sampleRate, totalDuration, params.duration, params.direction);
      return (
        <MiniLineChart
          series={[{ data: points, color: "var(--accent)", area: true, name: "Gain multiplier" }]}
          xDomain={[0, totalDuration]}
          yDomain={[0, 1.1]}
          xLabel="Time (s)"
          yLabel="Gain"
          xTickFormat={(v) => v.toFixed(1)}
          yTickFormat={(v) => v.toFixed(1)}
        />
      );
    }

    case "frequencyResponse": {
      const { points, nyquist } = computeFrequencyResponse(effect.id, params, sampleRate);
      const ys = points.map((p) => p.y);
      const yMin = Math.min(-3, Math.min(...ys) - 2);
      const yMax = Math.max(3, Math.max(...ys) + 2);
      const markers = [];
      if (effect.id === "equalizer") {
        markers.push({ x: 250, label: "250 Hz", color: "#facc15" });
        markers.push({ x: 4000, label: "4 kHz", color: "#facc15" });
      } else if (params.cutoff) {
        markers.push({ x: params.cutoff, label: `${hz(params.cutoff)} Hz cutoff`, color: "#facc15" });
      }
      return (
        <MiniLineChart
          series={[{ data: points, color: "var(--accent)", area: true, name: "Filter gain" }]}
          xDomain={[20, nyquist]}
          yDomain={[yMin, yMax]}
          logX
          markers={markers}
          xLabel="Frequency (Hz, log scale)"
          yLabel="Gain (dB)"
          xTickFormat={hz}
          yTickFormat={(v) => v.toFixed(0)}
        />
      );
    }

    case "transferCurve": {
      const points = computeTransferCurvePoints(params.drive, params.amount);
      const identity = points.map((p) => ({ x: p.x, y: p.x }));
      return (
        <MiniLineChart
          series={[
            { data: identity, color: "rgba(255,255,255,0.3)", name: "Linear (no distortion)" },
            { data: points, color: "var(--accent)", name: `y = tanh(${params.drive.toFixed(1)} · x)` },
          ]}
          xDomain={[-1, 1]}
          yDomain={[-1, 1]}
          xLabel="Input amplitude"
          yLabel="Output amplitude"
          xTickFormat={(v) => v.toFixed(1)}
          yTickFormat={(v) => v.toFixed(1)}
        />
      );
    }

    case "decay": {
      if (effect.id === "echo") {
        const points = computeEchoDecay(params.delay, params.feedback, params.repeats);
        return (
          <div>
            <MiniLineChart
              series={[{ data: points, color: "var(--accent)", name: "Repeat amplitude" }]}
              xDomain={[0, points[points.length - 1].x + params.delay * 0.5]}
              yDomain={[0, 1.05]}
              xLabel="Time (s)"
              yLabel="Amplitude"
              xTickFormat={(v) => v.toFixed(2)}
              yTickFormat={(v) => v.toFixed(1)}
            />
            <p className="mt-2 text-xs text-[var(--text-muted)]">
              Each repeat lands {params.delay.toFixed(2)}s after the previous one, at{" "}
              {Math.round(params.feedback * 100)}% of the previous repeat's volume.
            </p>
          </div>
        );
      }
      // reverb
      const impulse = extra?.impulse;
      const points = impulse ? computeReverbDecay(impulse, sampleRate) : [];
      return (
        <div>
          <MiniLineChart
            series={[{ data: points, color: "var(--accent)", area: true, name: "Energy (dB)" }]}
            xDomain={[0, points.length ? points[points.length - 1].x : 1]}
            yDomain={[-60, 5]}
            xLabel="Time (s)"
            yLabel="Energy (dB)"
            xTickFormat={(v) => v.toFixed(1)}
            yTickFormat={(v) => v.toFixed(0)}
          />
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            The spike at t=0 is the direct sound; the decaying noise afterward represents early
            reflections and the reverb tail dying out over ~{params.decay.toFixed(1)}s.
          </p>
        </div>
      );
    }

    case "pitchMarker": {
      const inHz = estimateFundamentalHz(input, sampleRate);
      const outHz = output ? estimateFundamentalHz(output, sampleRate) : inHz;
      return (
        <div>
          <div className="flex flex-wrap items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <StatCard label="Detected before" value={inHz ? `${inHz.toFixed(0)} Hz` : "—"} />
            <ArrowRight className="text-[var(--text-muted)]" />
            <StatCard label="Detected after" value={outHz ? `${outHz.toFixed(0)} Hz` : "—"} accent />
            <StatCard label="Shift" value={`${params.semitones > 0 ? "+" : ""}${params.semitones} st`} accent />
          </div>
          <p className="mt-2 text-xs text-[var(--text-muted)]">
            Fundamental frequency is estimated with autocorrelation on the loaded clip — treat it as
            an approximate reading, especially on noisy or multi-note audio.
          </p>
        </div>
      );
    }

    case "reverseCompare": {
      return (
        <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-5">
          <RotateCcw className="shrink-0 text-[var(--accent)]" size={28} />
          <p className="text-sm text-[var(--text-muted)]">
            Sample <span className="text-white">N-1</span> is now first, sample{" "}
            <span className="text-white">0</span> is now last, and every sample in between keeps its
            value — only its position in time changes. Compare the Before/After waveforms above: the
            second one is a perfect time-mirror of the first.
          </p>
        </div>
      );
    }

    case "durationStats": {
      const originalDuration = input.length / sampleRate;
      const processedDuration = output ? output.length / sampleRate : originalDuration / params.rate;
      return (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Original duration" value={`${originalDuration.toFixed(2)}s`} />
          <StatCard label="Processed duration" value={`${processedDuration.toFixed(2)}s`} accent />
          <StatCard label="Playback rate" value={`${params.rate.toFixed(2)}×`} />
        </div>
      );
    }

    case "denoiseSpectrum": {
      const nyquist = sampleRate / 2;
      const original = extra?.avgOriginal;
      const removed = extra?.avgRemoved;
      const nperseg = extra?.nperseg || 1024;
      if (!original) return null;

      const freqStep = nyquist / (original.length - 1);
      const toPoints = (arr) =>
        Array.from(arr).map((v, i) => ({ x: i * freqStep, y: 20 * Math.log10(v + 1e-6) }));

      const cleanedPoints = output ? computeSpectrum(output, sampleRate, nperseg > 2048 ? nperseg : 4096).points : [];

      return (
        <div>
          <MiniLineChart
            series={[
              { data: toPoints(original), color: "#9ca3af", name: "Original" },
              { data: cleanedPoints, color: "var(--accent)", name: "Cleaned" },
              { data: toPoints(removed), color: "#ef4444", name: "Removed noise" },
            ]}
            xDomain={[20, nyquist]}
            yDomain={[-60, 10]}
            logX
            xLabel="Frequency (Hz, log scale)"
            yLabel="Magnitude (dB)"
            xTickFormat={hz}
            yTickFormat={(v) => v.toFixed(0)}
          />
          <p className="mt-2 flex items-center gap-1 text-xs text-[var(--text-muted)]">
            <Timer size={12} /> Averaged across all analysis frames of the STFT.
          </p>
        </div>
      );
    }

    default:
      return null;
  }
};

export default EffectAnalysisPanel;
