import {
  useEffect,
  useState,
} from "react";

import {
  PIXELS_PER_SECOND,
  TIMELINE_PADDING,
} from "./Timeline";


const Marker = ({
  markerTime,
  setMarkerTime,
  maxDuration,
  isPlaying,
}) => {
  const [dragging, setDragging] =
    useState(false);


  // ==========================================
  // MARKER PIXEL POSITION
  // ==========================================

  const markerLeft =
    TIMELINE_PADDING +
    25 +
    markerTime *
      PIXELS_PER_SECOND;


  // ==========================================
  // START DRAGGING
  // ==========================================

  const handlePointerDown = (
    event
  ) => {
    if (event.button !== 0) {
      return;
    }

    // Global playback marker
    // cannot be dragged while playing
    if (isPlaying) {
      return;
    }

    event.preventDefault();

    setDragging(true);
  };


  // ==========================================
  // DRAG MARKER
  // ==========================================

  useEffect(() => {
    if (!dragging) {
      return;
    }

    const handlePointerMove = (
      event
    ) => {
      const timeline =
        document.getElementById(
          "timeline-content"
        );

      if (!timeline) {
        return;
      }

      const rect =
        timeline.getBoundingClientRect();


      // --------------------------------------
      // POINTER POSITION RELATIVE TO TIMELINE
      // --------------------------------------

      let x =
        event.clientX -
        rect.left -
        TIMELINE_PADDING -
        25;


      // Don't move before 0 seconds
      x = Math.max(
        0,
        x
      );


      // --------------------------------------
      // PIXELS -> SECONDS
      // --------------------------------------

      let time =
        x /
        PIXELS_PER_SECOND;


      // Don't move beyond project end
      time = Math.min(
        time,
        maxDuration
      );


      setMarkerTime(
        time
      );
    };


    const handlePointerUp = () => {
      setDragging(false);
    };


    window.addEventListener(
      "pointermove",
      handlePointerMove
    );

    window.addEventListener(
      "pointerup",
      handlePointerUp
    );


    return () => {
      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      window.removeEventListener(
        "pointerup",
        handlePointerUp
      );
    };

  }, [
    dragging,
    maxDuration,
    setMarkerTime,
  ]);


  // ==========================================
  // STOP DRAGGING WHEN PLAYBACK STARTS
  // ==========================================

  useEffect(() => {
    if (isPlaying) {
      setDragging(false);
    }
  }, [isPlaying]);


  // ==========================================
  // FORMAT TIME
  // ==========================================

  const formatTime = (
    time
  ) => {
    return `${time.toFixed(2)}s`;
  };


  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      className="
        absolute
        top-0
        bottom-0
        z-50
      "

      style={{
        left: `${markerLeft}px`,
      }}
    >

      {/* ======================================
          TRIANGLE HANDLE
      ====================================== */}

      <div
        onPointerDown={
          handlePointerDown
        }

        className={`
          absolute

          top-0
          left-1/2

          h-4
          w-4

          -translate-x-1/2

          bg-white

          ${
            isPlaying
              ? "cursor-default"
              : "cursor-ew-resize"
          }

          ${
            dragging
              ? "scale-110"
              : ""
          }
        `}

        style={{
          clipPath:
            "polygon(0 0, 100% 0, 50% 100%)",
        }}
      />


      {/* ======================================
          VERTICAL LINE
      ====================================== */}

      <div
        onPointerDown={
          handlePointerDown
        }

        className={`
          absolute

          top-4
          bottom-0

          left-1/2

          w-[2px]

          -translate-x-1/2

          bg-white

          ${
            isPlaying
              ? "cursor-default"
              : "cursor-ew-resize"
          }
        `}
      />


      {/* ======================================
          CURRENT POSITION WHILE DRAGGING
      ====================================== */}

      {dragging &&
        !isPlaying && (
          <div
            className="
              absolute

              -top-8
              left-2

              whitespace-nowrap

              rounded-md

              bg-black

              px-2
              py-1

              text-[11px]
              font-medium
              text-white

              shadow-lg
            "
          >
            {formatTime(
              markerTime
            )}
          </div>
        )}

    </div>
  );
};


export default Marker;