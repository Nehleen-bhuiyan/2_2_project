import {
  useEffect,
  useRef,
  useState,
} from "react";

import { Scissors } from "lucide-react";

import {
  PIXELS_PER_SECOND,
  TIMELINE_PADDING,
} from "./Timeline";


const TrackMarker = ({
  markerTime,
  setMarkerTime,
  track,
  onSplit,
}) => {
  const [dragging, setDragging] =
    useState(false);

  const [showMenu, setShowMenu] =
    useState(false);

  const menuRef = useRef(null);


  // ==========================================
  // FIND END OF THIS TRACK
  // ==========================================

  let trackEnd = 0;

  track.clips?.forEach((clip) => {
    const clipDuration =
      clip.sourceEnd -
      clip.sourceStart;

    const clipEnd =
      clip.timelineStart +
      clipDuration;

    trackEnd = Math.max(
      trackEnd,
      clipEnd
    );
  });


  // ==========================================
  // MARKER PIXEL POSITION
  // ==========================================

  const markerLeft =
    TIMELINE_PADDING +
    markerTime *
    PIXELS_PER_SECOND;


  // ==========================================
  // START DRAG
  // ==========================================

  const handlePointerDown = (
    event
  ) => {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();

    setDragging(true);

    setShowMenu(false);
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

      let x =
        event.clientX -
        rect.left -
        TIMELINE_PADDING;

      // Don't go before 0
      x = Math.max(
        0,
        x
      );

      let time =
        x /
        PIXELS_PER_SECOND;

      // Don't go beyond end of this track
      time = Math.min(
        time,
        trackEnd
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
    trackEnd,
    setMarkerTime,
  ]);


  // ==========================================
  // RIGHT CLICK
  // ==========================================

  const handleContextMenu = (
    event
  ) => {
    event.preventDefault();

    setShowMenu(true);
  };


  // ==========================================
  // CLOSE MENU ON OUTSIDE CLICK
  // ==========================================

  useEffect(() => {
    const handleOutsideClick = (
      event
    ) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target
        )
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);


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
        pointer-events-auto
        absolute
        top-0
        bottom-0
        z-40
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

        onContextMenu={
          handleContextMenu
        }

        className={`
          absolute
          left-1/2
          top-0

          h-3
          w-3

          -translate-x-1/2

          cursor-ew-resize

          bg-white

          transition-transform

          ${dragging
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

        onContextMenu={
          handleContextMenu
        }

        className="
          absolute

          left-1/2
          top-3
          bottom-0

          w-[2px]

          -translate-x-1/2

          cursor-ew-resize

          bg-white
        "
      />


      {/* ======================================
          TIME LABEL WHILE DRAGGING
      ====================================== */}

      {dragging && (
        <div
          className="
            absolute
            left-2
            -top-8

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


      {/* ======================================
          RIGHT CLICK MENU
      ====================================== */}

      {showMenu && (
        <div
          ref={menuRef}

          className="
            absolute
            left-3
            top-4

            z-[100]

            w-32

            overflow-hidden

            rounded-lg

            border
            border-white/10

            bg-[#151918]

            shadow-xl
          "
        >
          <button
            type="button"
            onClick={() => {
              onSplit?.(
                markerTime
              );

              setShowMenu(
                false
              );
            }}
            className="
    flex
    w-full
    cursor-pointer
    items-center
    gap-2
    px-4
    py-3
    text-left
    text-sm
    text-white
    transition
    hover:bg-white/10
  "
          >
            <Scissors size={15} />

            Split
          </button>
        </div>
      )}

    </div>
  );
};


export default TrackMarker;