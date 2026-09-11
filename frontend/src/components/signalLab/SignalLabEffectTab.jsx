import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import SourceSelector from "./SourceSelector";
import EffectWorkbench from "./EffectWorkbench";

const SignalLabEffectTab = ({ effect }) => {
  const [source, setSource] = useState(null); // { data, sampleRate, type, label }

  const handleLoad = (data, sampleRate, type, label) => {
    setSource({ data, sampleRate, type, label });
  };

  return (
    <div>
      <Link
        to="/signal-lab"
        className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--text-muted)] hover:text-white"
      >
        <ChevronLeft size={16} /> All effects
      </Link>

      <div className="mb-6 flex items-center gap-3">
        <span className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
          {effect.category}
        </span>
        <span className="text-xs text-[var(--text-muted)]">backend: {effect.backendType}</span>
      </div>

      <h1 className="text-2xl font-semibold text-white">{effect.name}</h1>
      <p className="mt-1 mb-8 max-w-2xl text-sm text-[var(--text-muted)]">{effect.tagline}</p>

      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[10px] text-white">
            1
          </span>
          Choose an input signal
        </h2>
        <SourceSelector onLoad={handleLoad} activeSource={source?.type} sourceLabel={source?.label} />
      </section>

      <EffectWorkbench effect={effect} source={source} startStep={2} showTheory />
    </div>
  );
};

export default SignalLabEffectTab;
