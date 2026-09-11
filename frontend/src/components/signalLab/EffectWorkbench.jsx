import { useMemo, useState } from "react";
import { Sparkles, Wand2, Waves } from "lucide-react";

import { defaultParamsFor } from "../../data/signalLabEffects";
import { computeSpectrum } from "../../utils/signalLab/analysis";
import { runEffect } from "../../utils/signalLab/dsp";

import EffectControls from "./EffectControls";
import EffectAnalysisPanel from "./EffectAnalysisPanel";
import WaveformPanel from "./charts/WaveformPanel";
import MiniLineChart from "./charts/MiniLineChart";

const Section = ({ step, title, children }) => (
  <section className="mb-8">
    <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] text-white">
        {step}
      </span>
      {title}
    </h2>
    {children}
  </section>
);

// Everything that happens *after* a signal has been loaded: theory,
// before/after waveform, parameter controls + apply, spectrum, and the
// effect-specific analysis chart. Shared by the normal per-effect tab and
// the Custom Waveform tab so the two stay in lockstep.
const EffectWorkbench = ({ effect, source, startStep = 2, showTheory = true }) => {
  const [params, setParams] = useState(() => defaultParamsFor(effect));
  const [output, setOutput] = useState(null);
  const [extra, setExtra] = useState(null);
  const [applying, setApplying] = useState(false);

  // A freshly (re)generated waveform should clear any stale result from
  // the previous version, without losing the chosen parameters. Adjusting
  // state during render (rather than in an effect) avoids an extra
  // commit/cascade — this is React's recommended pattern for "reset state
  // when a prop changes".
  const [prevSource, setPrevSource] = useState(source);
  if (source !== prevSource) {
    setPrevSource(source);
    setOutput(null);
    setExtra(null);
  }

  const handleParamChange = (key, value) => {
    setParams((p) => ({ ...p, [key]: value }));
    setOutput(null);
    setExtra(null);
  };

  const handleApply = () => {
    if (!source) return;
    setApplying(true);
    setTimeout(() => {
      const { output: result, extra: extraData } = runEffect(effect.id, params, source.data, source.sampleRate);
      setOutput(result);
      setExtra(extraData || null);
      setApplying(false);
    }, 30);
  };

  const spectrumBefore = useMemo(() => {
    if (!source) return null;
    return computeSpectrum(source.data, source.sampleRate);
  }, [source]);

  const spectrumAfter = useMemo(() => {
    if (!output || !source) return null;
    return computeSpectrum(output, source.sampleRate);
  }, [output, source]);

  return (
    <div>
      {showTheory && (
        <Section step={String(startStep)} title="How this effect works">
          <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            {effect.theory.map((paragraph, i) => (
              <p key={i} className="text-sm leading-relaxed text-[var(--text-muted)]">
                {paragraph}
              </p>
            ))}
            <div className="flex items-start gap-2 rounded-lg border border-[var(--accent)]/20 bg-[var(--accent-soft)] p-3">
              <Waves size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" />
              <p className="text-sm text-[var(--text-muted)]">
                <span className="font-medium text-white">What to look for: </span>
                {effect.waveformNote}
              </p>
            </div>
          </div>
        </Section>
      )}

      <Section step={String(startStep + (showTheory ? 1 : 0))} title="Waveform — before &amp; after">
        <div className="space-y-3">
          <WaveformPanel data={source?.data} sampleRate={source?.sampleRate || 44100} label="Before" color="#9ca3af" />
          <WaveformPanel
            data={output}
            sampleRate={source?.sampleRate || 44100}
            label="After"
            color="var(--accent)"
          />
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            <Sparkles size={14} /> Customize parameters
          </p>
          <EffectControls effect={effect} params={params} onChange={handleParamChange} disabled={!source} />

          <button
            onClick={handleApply}
            disabled={!source || applying}
            className="mt-5 flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[var(--accent-hover)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Wand2 size={16} />
            {applying ? "Applying…" : "Apply effect"}
          </button>
          {!source && (
            <p className="mt-2 text-xs text-[var(--text-muted)]">Load a signal above to enable this.</p>
          )}
        </div>
      </Section>

      <Section step={String(startStep + (showTheory ? 2 : 1))} title="Frequency spectrum">
        {spectrumBefore ? (
          <MiniLineChart
            series={[
              { data: spectrumBefore.points, color: "#9ca3af", name: "Before" },
              ...(spectrumAfter ? [{ data: spectrumAfter.points, color: "var(--accent)", name: "After" }] : []),
            ]}
            xDomain={[20, spectrumBefore.nyquist]}
            yDomain={[-60, 10]}
            logX
            xLabel="Frequency (Hz, log scale)"
            yLabel="Magnitude (dB)"
            xTickFormat={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toFixed(0))}
            yTickFormat={(v) => v.toFixed(0)}
          />
        ) : (
          <p className="text-sm text-[var(--text-muted)]">Load audio to see its FFT spectrum here.</p>
        )}
      </Section>

      <Section step={String(startStep + (showTheory ? 3 : 2))} title="Effect analysis">
        <EffectAnalysisPanel
          effect={effect}
          params={params}
          input={source?.data}
          output={output}
          sampleRate={source?.sampleRate || 44100}
          extra={extra}
        />
      </Section>
    </div>
  );
};

export default EffectWorkbench;
