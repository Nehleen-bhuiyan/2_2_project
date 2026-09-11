import { Link } from "react-router-dom";
import { ArrowUpRight, Waves, AudioLines, Wand2 } from "lucide-react";
import { EFFECTS } from "../../data/signalLabEffects";

const SignalLabHome = () => {
  const categories = [...new Set(EFFECTS.map((e) => e.category))];

  return (
    <div>
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)]">
          <AudioLines className="text-[var(--accent)]" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-white">Signal Lab</h1>
          <p className="mt-1 max-w-2xl text-sm text-[var(--text-muted)]">
            Pick an effect to see what it actually does to a signal: its waveform, its frequency
            spectrum, and a specialized chart that explains the DSP mechanism underneath. Every
            effect works on a demo tone, a file you upload, or your own voice recording.
          </p>
        </div>
      </div>

      <Link
        to="/signal-lab/custom"
        className="mb-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-[var(--accent)]/30 bg-gradient-to-br from-[var(--accent-soft)] to-white/[0.02] p-5 transition hover:border-[var(--accent)]/60 sm:flex-row sm:items-center"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)]">
            <Wand2 className="text-[var(--accent)]" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Custom Waveform Builder</h3>
            <p className="mt-1 max-w-xl text-sm text-[var(--text-muted)]">
              Compose your own signal from sine, square, triangle, sawtooth and noise segments, then
              apply any compatible effect to it.
            </p>
          </div>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[var(--accent)]/40 px-3 py-1.5 text-sm font-medium text-[var(--accent)]">
          Open builder <ArrowUpRight size={15} />
        </span>
      </Link>

      {categories.map((category) => (
        <div key={category} className="mb-8">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            <Waves size={14} /> {category}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {EFFECTS.filter((e) => e.category === category).map((effect) => (
              <div
                key={effect.id}
                className="flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition hover:border-[var(--accent)]/50 hover:bg-white/[0.07]"
              >
                <div>
                  <h3 className="text-lg font-semibold text-white">{effect.name}</h3>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">{effect.tagline}</p>
                </div>
                <Link
                  to={`/signal-lab/${effect.id}`}
                  className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-lg border border-[var(--accent)]/40 px-3 py-1.5 text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--accent-soft)]"
                >
                  Open demo <ArrowUpRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SignalLabHome;
