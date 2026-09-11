import { useMemo } from "react";

// A small dependency-free SVG line chart. Handles linear or log X scales,
// multiple series, optional area fill, vertical reference markers, and a
// legend — enough for every Signal Lab analysis panel.
const MiniLineChart = ({
  series = [],
  xDomain,
  yDomain,
  xLabel,
  yLabel,
  logX = false,
  height = 220,
  xTickFormat = (v) => v.toFixed(0),
  yTickFormat = (v) => v.toFixed(0),
  markers = [],
  yTicks = 4,
  xTicks = 5,
}) => {
  const width = 640;
  const padding = { top: 14, right: 18, bottom: 30, left: 46 };
  const plotW = width - padding.left - padding.right;
  const plotH = height - padding.top - padding.bottom;

  const allX = series.flatMap((s) => s.data.map((p) => p.x));
  const allY = series.flatMap((s) => s.data.map((p) => p.y));

  const [xMin, xMax] = xDomain || [Math.min(...allX), Math.max(...allX)];
  const [yMin, yMax] = yDomain || [Math.min(...allY), Math.max(...allY)];

  const xScale = (x) => {
    if (logX) {
      const lo = Math.log10(Math.max(xMin, 1));
      const hi = Math.log10(Math.max(xMax, 10));
      const v = Math.log10(Math.max(x, 1));
      return padding.left + ((v - lo) / (hi - lo)) * plotW;
    }
    return padding.left + ((x - xMin) / (xMax - xMin || 1)) * plotW;
  };

  const yScale = (y) =>
    padding.top + plotH - ((y - yMin) / (yMax - yMin || 1)) * plotH;

  const linePath = (data) =>
    data
      .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.x).toFixed(1)} ${yScale(p.y).toFixed(1)}`)
      .join(" ");

  const areaPath = (data) => {
    if (data.length === 0) return "";
    const line = linePath(data);
    const first = data[0];
    const last = data[data.length - 1];
    return `${line} L ${xScale(last.x).toFixed(1)} ${yScale(yMin).toFixed(1)} L ${xScale(first.x).toFixed(1)} ${yScale(yMin).toFixed(1)} Z`;
  };

  const xTickValues = useMemo(() => {
    const vals = [];
    if (logX) {
      const lo = Math.log10(Math.max(xMin, 1));
      const hi = Math.log10(Math.max(xMax, 10));
      for (let i = 0; i <= xTicks; i++) {
        vals.push(Math.pow(10, lo + ((hi - lo) * i) / xTicks));
      }
    } else {
      for (let i = 0; i <= xTicks; i++) {
        vals.push(xMin + ((xMax - xMin) * i) / xTicks);
      }
    }
    return vals;
  }, [xMin, xMax, logX, xTicks]);

  const yTickValues = useMemo(() => {
    const vals = [];
    for (let i = 0; i <= yTicks; i++) vals.push(yMin + ((yMax - yMin) * i) / yTicks);
    return vals;
  }, [yMin, yMax, yTicks]);

  const hasLegend = series.some((s) => s.name);

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" preserveAspectRatio="xMidYMid meet">
        {/* grid */}
        {yTickValues.map((v, i) => (
          <line
            key={`gy-${i}`}
            x1={padding.left}
            x2={width - padding.right}
            y1={yScale(v)}
            y2={yScale(v)}
            stroke="rgba(255,255,255,0.07)"
            strokeWidth="1"
          />
        ))}
        {xTickValues.map((v, i) => (
          <line
            key={`gx-${i}`}
            x1={xScale(v)}
            x2={xScale(v)}
            y1={padding.top}
            y2={padding.top + plotH}
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="1"
          />
        ))}

        {/* markers (e.g. cutoff frequency) */}
        {markers.map((m, i) => (
          <g key={`marker-${i}`}>
            <line
              x1={xScale(m.x)}
              x2={xScale(m.x)}
              y1={padding.top}
              y2={padding.top + plotH}
              stroke={m.color || "#19d3c5"}
              strokeDasharray="4 3"
              strokeWidth="1.5"
            />
            {m.label && (
              <text
                x={xScale(m.x) + 4}
                y={padding.top + 10}
                fill={m.color || "#19d3c5"}
                fontSize="10"
              >
                {m.label}
              </text>
            )}
          </g>
        ))}

        {/* series */}
        {series.map((s, i) => (
          <g key={`s-${i}`}>
            {s.area && (
              <path d={areaPath(s.data)} fill={s.color} opacity="0.15" stroke="none" />
            )}
            <path d={linePath(s.data)} fill="none" stroke={s.color} strokeWidth={s.strokeWidth || 2} />
          </g>
        ))}

        {/* axes */}
        <line
          x1={padding.left}
          x2={width - padding.right}
          y1={padding.top + plotH}
          y2={padding.top + plotH}
          stroke="rgba(255,255,255,0.25)"
        />
        <line
          x1={padding.left}
          x2={padding.left}
          y1={padding.top}
          y2={padding.top + plotH}
          stroke="rgba(255,255,255,0.25)"
        />

        {/* x ticks */}
        {xTickValues.map((v, i) => (
          <text
            key={`xt-${i}`}
            x={xScale(v)}
            y={padding.top + plotH + 16}
            fill="#9ca3af"
            fontSize="9"
            textAnchor="middle"
          >
            {xTickFormat(v)}
          </text>
        ))}

        {/* y ticks */}
        {yTickValues.map((v, i) => (
          <text key={`yt-${i}`} x={padding.left - 6} y={yScale(v) + 3} fill="#9ca3af" fontSize="9" textAnchor="end">
            {yTickFormat(v)}
          </text>
        ))}

        {xLabel && (
          <text x={padding.left + plotW / 2} y={height - 2} fill="#9ca3af" fontSize="10" textAnchor="middle">
            {xLabel}
          </text>
        )}
        {yLabel && (
          <text
            x={12}
            y={padding.top + plotH / 2}
            fill="#9ca3af"
            fontSize="10"
            textAnchor="middle"
            transform={`rotate(-90 12 ${padding.top + plotH / 2})`}
          >
            {yLabel}
          </text>
        )}
      </svg>

      {hasLegend && (
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 px-1">
          {series.map((s, i) => (
            <div key={`legend-${i}`} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
              {s.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MiniLineChart;
