import { useEffect, useRef, useState } from "react";
import { Play, Square } from "lucide-react";
import { computeWaveformPeaks } from "../../../utils/signalLab/analysis";
import { playFloat32, formatDuration } from "../../../utils/signalLab/audioIO";

// Renders a downsampled amplitude-vs-time waveform on <canvas>, with an
// optional play button. Used for both the "before" and "after" panels so
// they stay visually consistent and share the same time scale.
const WaveformPanel = ({ data, sampleRate, label, color = "#19d3c5", height = 110 }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const stopRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !data || data.length === 0) return;

    const cssWidth = container.clientWidth || 600;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = cssWidth * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, cssWidth, height);

    // center line
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(cssWidth, height / 2);
    ctx.stroke();

    const peaks = computeWaveformPeaks(data, cssWidth);
    const midY = height / 2;
    const scaleY = height / 2 - 4;

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    peaks.forEach((p, i) => {
      const x = (i / peaks.length) * cssWidth;
      const y1 = midY - p.max * scaleY;
      const y2 = midY - p.min * scaleY;
      ctx.beginPath();
      ctx.moveTo(x, y1);
      ctx.lineTo(x, y2 === y1 ? y1 + 0.5 : y2);
      ctx.stroke();
    });
  }, [data, color, height]);

  const handlePlay = () => {
    if (playing) {
      stopRef.current?.();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    stopRef.current = playFloat32(data, sampleRate, {
      onEnded: () => setPlaying(false),
    });
  };

  const duration = data ? data.length / sampleRate : 0;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-[var(--text-muted)]">
          {label}
        </span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[var(--text-muted)]">{formatDuration(duration)}</span>
          <button
            onClick={handlePlay}
            disabled={!data || data.length === 0}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent)] text-black transition hover:bg-[var(--accent-hover)] disabled:opacity-30"
          >
            {playing ? <Square size={12} fill="black" /> : <Play size={12} fill="black" className="ml-0.5" />}
          </button>
        </div>
      </div>
      <div ref={containerRef} className="w-full">
        {data && data.length > 0 ? (
          <canvas ref={canvasRef} className="block w-full" />
        ) : (
          <div
            className="flex items-center justify-center text-xs text-[var(--text-muted)]"
            style={{ height }}
          >
            No audio loaded yet
          </div>
        )}
      </div>
    </div>
  );
};

export default WaveformPanel;
