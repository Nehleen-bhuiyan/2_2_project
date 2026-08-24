import {
  Pause,
  Play,
} from "lucide-react";


const EditorControls = ({
  isPlaying,
  onPlayPause,
  currentTime,
  duration,
}) => {

  const formatTime = (seconds) => {

    if (
      !Number.isFinite(seconds)
    ) {
      return "00:00";
    }

    const minutes =
      Math.floor(
        seconds / 60
      );

    const secs =
      Math.floor(
        seconds % 60
      );

    return (
      `${String(minutes).padStart(2, "0")}:` +
      `${String(secs).padStart(2, "0")}`
    );
  };


  return (
    <div
      className="
        flex
        items-center
        justify-center
        gap-4

        border-t
        border-white/10

        bg-black/30

        py-3

        backdrop-blur-xl
      "
    >

      <button
        onClick={
          onPlayPause
        }

        className="
          flex
          h-11
          w-11
          cursor-pointer
          items-center
          justify-center
          rounded-full

          bg-[var(--accent)]

          text-black

          transition

          hover:scale-105
        "
      >

        {isPlaying ? (

          <Pause
            size={21}
            fill="currentColor"
          />

        ) : (

          <Play
            size={21}
            fill="currentColor"
          />

        )}

      </button>


      <span
        className="
          min-w-[105px]
          text-sm
          text-gray-400
        "
      >
        {formatTime(currentTime)}
        {" / "}
        {formatTime(duration)}
      </span>

    </div>
  );
};


export default EditorControls;