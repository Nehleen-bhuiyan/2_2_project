import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, Info } from "lucide-react";

import { customWaveformEffects, getEffectById } from "../../data/signalLabEffects";
import CustomWaveformBuilder from "./CustomWaveformBuilder";
import EffectPicker from "./EffectPicker";
import EffectWorkbench from "./EffectWorkbench";
import WaveformPanel from "./charts/WaveformPanel";

const AVAILABLE_EFFECTS = customWaveformEffects();

const SignalLabCustomTab = () => {
  const [source, setSource] = useState(null); // { data, sampleRate }
  const [selectedEffectId, setSelectedEffectId] = useState(null);

  const handleGenerate = (data, sampleRate) => {
    setSource({ data, sampleRate });
  };

  const selectedEffect = selectedEffectId ? getEffectById(selectedEffectId) : null;

  return (
    <div>
      <Link
        to="/signal-lab"
        className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-white"
      >
        <ChevronLeft size={16} /> All effects
      </Link>

      <h1 className="text-2xl font-semibold text-white">Custom Waveform Builder</h1>
      <p className="mt-1 mb-8 max-w-2xl text-sm text-[var(--text-muted)]">
        Compose your own signal out of basic wave shapes, then apply any compatible effect to it and
        watch the waveform, spectrum and effect analysis update.
      </p>

      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] text-white">
            1
          </span>
          Build your waveform
        </h2>
        <CustomWaveformBuilder onGenerate={handleGenerate} />
      </section>

      {source && (
        <section className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] text-white">
              2
            </span>
            Your waveform
          </h2>
          <WaveformPanel data={source.data} sampleRate={source.sampleRate} label="Custom signal" color="#facc15" />
        </section>
      )}

      {source && (
        <section className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] text-white">
              3
            </span>
            Choose an effect to apply
          </h2>

          <div className="mb-3 flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.03] p-3 text-xs text-[var(--text-muted)]">
            <Info size={14} className="mt-0.5 shrink-0" />
            <p>
              Denoise isn't offered here: it works by telling a steady noise floor apart from the
              signal over time, and a clean synthetic tone doesn't have that separation — so the
              demo would just look like the effect erasing your signal. Every other effect works
              directly on the sample values, so all of them are available.
            </p>
          </div>

          <EffectPicker effects={AVAILABLE_EFFECTS} selectedId={selectedEffectId} onSelect={setSelectedEffectId} />
        </section>
      )}

      {source && selectedEffect && (
        <EffectWorkbench key={selectedEffect.id} effect={selectedEffect} source={source} startStep={4} showTheory />
      )}
    </div>
  );
};

export default SignalLabCustomTab;
