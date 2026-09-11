const EffectControls = ({ effect, params, onChange, disabled }) => {
  if (!effect.controls || effect.controls.length === 0) {
    return (
      <p className="text-sm text-[var(--text-muted)]">
        This effect has no adjustable parameters — it's a fixed operation.
      </p>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {effect.controls.map((control) => {
        if (control.type === "select") {
          return (
            <div key={control.key}>
              <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
                {control.label}
              </label>
              <div className="flex gap-2">
                {control.options.map((opt) => (
                  <button
                    key={opt.value}
                    disabled={disabled}
                    onClick={() => onChange(control.key, opt.value)}
                    className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
                      params[control.key] === opt.value
                        ? "border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "border-white/10 bg-white/[0.03] text-[var(--text-muted)] hover:border-white/20"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          );
        }

        const value = params[control.key];
        return (
          <div key={control.key}>
            <label className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
              <span>{control.label}</span>
              <span className="font-mono normal-case text-white">
                {typeof value === "number" ? value.toFixed(control.step < 1 ? 2 : 0) : value}
                {control.unit}
              </span>
            </label>
            <input
              type="range"
              min={control.min}
              max={control.max}
              step={control.step}
              value={value}
              disabled={disabled}
              onChange={(e) => onChange(control.key, parseFloat(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </div>
        );
      })}
    </div>
  );
};

export default EffectControls;
