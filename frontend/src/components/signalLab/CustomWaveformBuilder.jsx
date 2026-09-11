import { useState } from "react";
import { Plus, Trash2, Wand2, Shuffle, Eraser } from "lucide-react";
import {
  WAVE_SHAPES,
  MAX_SEGMENTS,
  MAX_TOTAL_DURATION,
  DRAW_PRESET_SHAPES,
  createDefaultSegment,
  buildCustomWaveform,
  totalDuration,
  createFlatDrawPoints,
  createPresetDrawPoints,
  createRandomDrawPoints,
  buildDrawnWaveform,
} from "../../utils/signalLab/waveformBuilder";
import { LAB_SAMPLE_RATE } from "../../utils/signalLab/audioIO";
import WaveformDrawEditor from "./charts/WaveformDrawEditor";

const SHAPE_LABELS = Object.fromEntries(WAVE_SHAPES.map((s) => [s.value, s.label]));

const MODES = [
  { id: "draw", label: "Draw" },
  { id: "segments", label: "Segments" },
];

const SegmentRow = ({ segment, onChange, onRemove, canRemove }) => (
  <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
    <div className="mb-3 flex items-center justify-between">
      <div className="flex gap-1.5">
        {WAVE_SHAPES.map((shape) => (
          <button
            key={shape.value}
            onClick={() => onChange({ ...segment, shape: shape.value })}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
              segment.shape === shape.value
                ? "bg-[var(--accent)] text-black"
                : "bg-white/[0.05] text-[var(--text-muted)] hover:bg-white/[0.1]"
            }`}
          >
            {shape.label}
          </button>
        ))}
      </div>
      {canRemove && (
        <button onClick={onRemove} className="text-[var(--text-muted)] hover:text-red-400">
          <Trash2 size={15} />
        </button>
      )}
    </div>

    <div className="grid grid-cols-3 gap-4">
      <div>
        <label className="mb-1 flex justify-between text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
          <span>Frequency</span>
          <span className="font-mono text-white">{segment.frequency} Hz</span>
        </label>
        <input
          type="range"
          min={20}
          max={2000}
          step={5}
          value={segment.frequency}
          disabled={segment.shape === "noise" || segment.shape === "silence"}
          onChange={(e) => onChange({ ...segment, frequency: parseFloat(e.target.value) })}
          className="w-full accent-[var(--accent)] disabled:opacity-30"
        />
      </div>
      <div>
        <label className="mb-1 flex justify-between text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
          <span>Amplitude</span>
          <span className="font-mono text-white">{segment.amplitude.toFixed(2)}</span>
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={segment.amplitude}
          disabled={segment.shape === "silence"}
          onChange={(e) => onChange({ ...segment, amplitude: parseFloat(e.target.value) })}
          className="w-full accent-[var(--accent)] disabled:opacity-30"
        />
      </div>
      <div>
        <label className="mb-1 flex justify-between text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
          <span>Duration</span>
          <span className="font-mono text-white">{segment.duration.toFixed(2)}s</span>
        </label>
        <input
          type="range"
          min={0.1}
          max={3}
          step={0.1}
          value={segment.duration}
          onChange={(e) => onChange({ ...segment, duration: parseFloat(e.target.value) })}
          className="w-full accent-[var(--accent)]"
        />
      </div>
    </div>
  </div>
);

// Lets someone compose a signal either by drag-drawing one cycle by hand
// (looped at a chosen pitch, like a wavetable oscillator) or by chaining
// basic-shape segments over time. Either way it hands back a plain
// { data, sampleRate } signal, same as demo/upload/record.
const CustomWaveformBuilder = ({ onGenerate }) => {
  const [mode, setMode] = useState("draw");

  // --- Draw mode state ---
  const [drawPoints, setDrawPoints] = useState(() => createPresetDrawPoints("sine"));
  const [drawFrequency, setDrawFrequency] = useState(220);
  const [drawDuration, setDrawDuration] = useState(2);

  // --- Segment mode state ---
  const [segments, setSegments] = useState([createDefaultSegment()]);

  const duration = totalDuration(segments);
  const atSegmentLimit = segments.length >= MAX_SEGMENTS;
  const atDurationLimit = duration >= MAX_TOTAL_DURATION;

  const updateSegment = (index, next) => {
    setSegments((segs) => segs.map((s, i) => (i === index ? next : s)));
  };

  const addSegment = () => {
    if (atSegmentLimit || atDurationLimit) return;
    setSegments((segs) => [...segs, createDefaultSegment()]);
  };

  const removeSegment = (index) => {
    setSegments((segs) => segs.filter((_, i) => i !== index));
  };

  const handleGenerateDraw = () => {
    const { data, sampleRate } = buildDrawnWaveform(drawPoints, drawFrequency, drawDuration, LAB_SAMPLE_RATE);
    onGenerate(data, sampleRate);
  };

  const handleGenerateSegments = () => {
    const { data, sampleRate } = buildCustomWaveform(segments, LAB_SAMPLE_RATE);
    onGenerate(data, sampleRate);
  };

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-4 flex gap-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              mode === m.id
                ? "bg-[var(--accent)] text-black"
                : "bg-white/[0.05] text-[var(--text-muted)] hover:bg-white/[0.1]"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === "draw" ? (
        <div>
          <p className="mb-2 text-xs text-[var(--text-muted)]">
            Click and drag across the strip to sculpt one cycle by hand. That shape then repeats at
            the frequency below to build the full signal — the same idea as a wavetable oscillator.
            Tip: keep the left and right edges close in height for a click-free loop.
          </p>

          <WaveformDrawEditor points={drawPoints} onChange={setDrawPoints} />

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-[10px] uppercase tracking-wide text-[var(--text-muted)]">Presets:</span>
            {DRAW_PRESET_SHAPES.map((shape) => (
              <button
                key={shape}
                onClick={() => setDrawPoints(createPresetDrawPoints(shape))}
                className="rounded-md bg-white/[0.05] px-2.5 py-1 text-xs text-[var(--text-muted)] transition hover:bg-white/[0.1] hover:text-white"
              >
                {SHAPE_LABELS[shape]}
              </button>
            ))}
            <button
              onClick={() => setDrawPoints(createRandomDrawPoints())}
              className="flex items-center gap-1 rounded-md bg-white/[0.05] px-2.5 py-1 text-xs text-[var(--text-muted)] transition hover:bg-white/[0.1] hover:text-white"
            >
              <Shuffle size={12} /> Randomize
            </button>
            <button
              onClick={() => setDrawPoints(createFlatDrawPoints())}
              className="flex items-center gap-1 rounded-md bg-white/[0.05] px-2.5 py-1 text-xs text-[var(--text-muted)] transition hover:bg-white/[0.1] hover:text-white"
            >
              <Eraser size={12} /> Clear
            </button>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 flex justify-between text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
                <span>Frequency (pitch of the loop)</span>
                <span className="font-mono text-white">{drawFrequency} Hz</span>
              </label>
              <input
                type="range"
                min={20}
                max={1000}
                step={1}
                value={drawFrequency}
                onChange={(e) => setDrawFrequency(parseFloat(e.target.value))}
                className="w-full accent-[var(--accent)]"
              />
            </div>
            <div>
              <label className="mb-1 flex justify-between text-[10px] uppercase tracking-wide text-[var(--text-muted)]">
                <span>Duration</span>
                <span className="font-mono text-white">{drawDuration.toFixed(1)}s</span>
              </label>
              <input
                type="range"
                min={0.2}
                max={MAX_TOTAL_DURATION}
                step={0.1}
                value={drawDuration}
                onChange={(e) => setDrawDuration(parseFloat(e.target.value))}
                className="w-full accent-[var(--accent)]"
              />
            </div>
          </div>

          <button
            onClick={handleGenerateDraw}
            className="mt-4 flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[var(--accent-hover)]"
          >
            <Wand2 size={15} /> Generate waveform
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Chain shapes over time
            </p>
            <span className="text-xs text-[var(--text-muted)]">
              {duration.toFixed(1)}s / {MAX_TOTAL_DURATION}s
            </span>
          </div>

          <div className="space-y-3">
            {segments.map((segment, i) => (
              <SegmentRow
                key={i}
                segment={segment}
                onChange={(next) => updateSegment(i, next)}
                onRemove={() => removeSegment(i)}
                canRemove={segments.length > 1}
              />
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              onClick={addSegment}
              disabled={atSegmentLimit || atDurationLimit}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white transition hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus size={15} /> Add segment
            </button>

            <button
              onClick={handleGenerateSegments}
              className="flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-black transition hover:bg-[var(--accent-hover)]"
            >
              <Wand2 size={15} /> Generate waveform
            </button>

            {(atSegmentLimit || atDurationLimit) && (
              <span className="text-xs text-[var(--text-muted)]">
                {atDurationLimit ? "Max total duration reached." : "Max segments reached."}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomWaveformBuilder;
