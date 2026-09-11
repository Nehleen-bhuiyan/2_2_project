import { dbToLinear01 } from "../../../utils/signalLab/analysis";

const Bar = ({ label, db, color }) => (
  <div>
    <div className="mb-1 flex items-center justify-between text-xs">
      <span className="text-[var(--text-muted)]">{label}</span>
      <span className="font-mono text-white">{Number.isFinite(db) ? `${db.toFixed(1)} dBFS` : "—"}</span>
    </div>
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${dbToLinear01(db) * 100}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

// Before/after peak + RMS bars, in dBFS (20*log10(amplitude)).
const LevelMeter = ({ before, after }) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Before</p>
        <Bar label="Peak" db={before?.peakDb} color="#9ca3af" />
        <Bar label="RMS" db={before?.rmsDb} color="#6b7280" />
      </div>
      <div className="space-y-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">After</p>
        <Bar label="Peak" db={after?.peakDb} color="var(--accent)" />
        <Bar label="RMS" db={after?.rmsDb} color="var(--accent-hover)" />
      </div>
    </div>
  );
};

export default LevelMeter;
