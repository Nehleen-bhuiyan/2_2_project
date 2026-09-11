import { useRef, useCallback } from "react";

const VIEW_W = 600;
const VIEW_H = 160;

// A freehand strip you drag across (mouse or touch) to sculpt one cycle of
// a waveform by hand. `points` is a plain array of amplitudes in [-1, 1],
// evenly spaced across the cycle; dragging repaints whichever points the
// pointer passes over, interpolating between frames so fast strokes still
// draw a continuous line instead of a dotted one.
const WaveformDrawEditor = ({ points, onChange, height = 160 }) => {
  const svgRef = useRef(null);
  const drawingRef = useRef(false);
  const lastIndexRef = useRef(null);

  const toIndexAndValue = useCallback(
    (clientX, clientY) => {
      const rect = svgRef.current.getBoundingClientRect();
      const xFrac = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const yFrac = Math.min(1, Math.max(0, (clientY - rect.top) / rect.height));
      const index = Math.round(xFrac * (points.length - 1));
      const value = 1 - 2 * yFrac; // top of strip = +1, bottom = -1
      return { index, value: Math.min(1, Math.max(-1, value)) };
    },
    [points.length]
  );

  const paintTo = useCallback(
    (index, value) => {
      const next = points.slice();
      const lastIndex = lastIndexRef.current;

      if (lastIndex === null || lastIndex === index) {
        next[index] = value;
      } else {
        // Fill every index between the last painted one and this one so a
        // fast drag still produces a continuous stroke, not gaps.
        const lo = Math.min(lastIndex, index);
        const hi = Math.max(lastIndex, index);
        const startVal = lastIndex < index ? next[lastIndex] : value;
        const endVal = lastIndex < index ? value : next[lastIndex];
        for (let i = lo; i <= hi; i++) {
          const t = hi === lo ? 0 : (i - lo) / (hi - lo);
          next[i] = startVal * (1 - t) + endVal * t;
        }
      }

      lastIndexRef.current = index;
      onChange(next);
    },
    [points, onChange]
  );

  const handlePointerDown = (e) => {
    svgRef.current.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    lastIndexRef.current = null;
    const { index, value } = toIndexAndValue(e.clientX, e.clientY);
    paintTo(index, value);
  };

  const handlePointerMove = (e) => {
    if (!drawingRef.current) return;
    const { index, value } = toIndexAndValue(e.clientX, e.clientY);
    paintTo(index, value);
  };

  const stopDrawing = () => {
    drawingRef.current = false;
    lastIndexRef.current = null;
  };

  const pathD = points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * VIEW_W;
      const y = VIEW_H / 2 - v * (VIEW_H / 2 - 6);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <div
      className="touch-none select-none overflow-hidden rounded-lg border border-white/10 bg-black/30"
      style={{ height }}
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        className="h-full w-full cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
        onPointerCancel={stopDrawing}
      >
        <line x1="0" y1={VIEW_H / 2} x2={VIEW_W} y2={VIEW_H / 2} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
        <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
};

export default WaveformDrawEditor;
