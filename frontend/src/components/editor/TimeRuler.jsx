import {
  PIXELS_PER_SECOND,
  TIMELINE_PADDING,
} from "./Timeline";


const TimeRuler = ({ duration }) => {
  const markers = [];

  for (
    let second = 0;
    second <= duration;
    second += 5
  ) {
    markers.push(second);
  }

  return (
    <div
      className="
        relative
        h-10
        border-b
        border-white/10
        bg-white/[0.02]
      "
    >
      {markers.map((second) => {
        const left =
  TIMELINE_PADDING +
  second * PIXELS_PER_SECOND;

        return (
          <div
            key={second}
            className="
              absolute
              top-0
              h-full
            "
            style={{
              left: `${left}px`,
            }}
          >
            {/* tick */}

            <div
              className="
                h-2
                w-px
                bg-gray-600
              "
            />

            {/* time */}

            <span
              className="
                absolute
                top-3
                -translate-x-1/2
                whitespace-nowrap
                text-[11px]
                text-gray-500
              "
            >
              {formatTime(second)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

const formatTime = (seconds) => {
  const minutes = Math.floor(
    seconds / 60
  );

  const remaining =
    seconds % 60;

  if (minutes === 0) {
    return `${remaining}s`;
  }

  return `${minutes}:${String(
    remaining
  ).padStart(2, "0")}`;
};

export default TimeRuler;