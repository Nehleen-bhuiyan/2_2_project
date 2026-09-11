import { Check } from "lucide-react";

// A selectable grid of effects, each with a one-line description of what
// it actually does to a waveform — used so the picker itself is useful
// even before anything is applied.
const EffectPicker = ({ effects, selectedId, onSelect }) => {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {effects.map((effect) => {
        const isActive = effect.id === selectedId;
        return (
          <button
            key={effect.id}
            onClick={() => onSelect(effect.id)}
            className={`flex flex-col items-start rounded-xl border p-4 text-left transition ${
              isActive
                ? "border-[var(--accent)] bg-[var(--accent-soft)]"
                : "border-white/10 bg-white/[0.03] hover:border-white/20"
            }`}
          >
            <div className="mb-1.5 flex w-full items-center justify-between">
              <span className={`font-medium ${isActive ? "text-[var(--accent)]" : "text-white"}`}>
                {effect.name}
              </span>
              {isActive && <Check size={16} className="text-[var(--accent)]" />}
            </div>
            <p className="text-xs text-[var(--text-muted)]">{effect.waveformNote}</p>
          </button>
        );
      })}
    </div>
  );
};

export default EffectPicker;
