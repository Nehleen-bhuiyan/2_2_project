import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Music2,
  Trash2,
} from "lucide-react";

import {
  PIXELS_PER_SECOND,
  TIMELINE_PADDING,
} from "./Timeline";


const Clip = ({
  clip,
  onDelete,
  onMove,
}) => {
  const [
    showMenu,
    setShowMenu,
  ] = useState(false);

  const [
    dragging,
    setDragging,
  ] = useState(false);

  const [
    dragTime,
    setDragTime,
  ] = useState(
    clip.timelineStart
  );

  const menuRef =
    useRef(null);

  const dragStartXRef =
    useRef(0);

  const originalTimeRef =
    useRef(
      clip.timelineStart
    );

  const dragTimeRef =
    useRef(
      clip.timelineStart
    );


  // ==========================================
  // CLIP SIZE
  // ==========================================

  const clipDuration =
    clip.sourceEnd -
    clip.sourceStart;

  const width =
    clipDuration *
    PIXELS_PER_SECOND;


  // ==========================================
  // POSITION TO SHOW
  // ==========================================

  const displayedTime =
    dragging
      ? dragTime
      : clip.timelineStart;

  const left =
    TIMELINE_PADDING +
    displayedTime *
      PIXELS_PER_SECOND;


  // ==========================================
  // START CLIP DRAG
  // ==========================================

  const handlePointerDown = (
    event
  ) => {
    if (
      event.button !== 0
    ) {
      return;
    }

    /*
      If context menu is open,
      don't start dragging.
    */
    if (showMenu) {
      return;
    }

    event.preventDefault();

    dragStartXRef.current =
      event.clientX;

    originalTimeRef.current =
      clip.timelineStart;

    dragTimeRef.current =
      clip.timelineStart;

    setDragTime(
      clip.timelineStart
    );

    setDragging(true);
  };


  // ==========================================
  // HANDLE DRAG MOVEMENT
  // ==========================================

  useEffect(() => {
    if (!dragging) {
      return;
    }

    const handlePointerMove = (
      event
    ) => {
      const deltaX =
        event.clientX -
        dragStartXRef.current;

      const deltaTime =
        deltaX /
        PIXELS_PER_SECOND;

      /*
        Prevent moving before 0 sec.
      */

      const newTime =
        Math.max(
          0,
          originalTimeRef.current +
            deltaTime
        );

      dragTimeRef.current =
        newTime;

      setDragTime(
        newTime
      );
    };


    const handlePointerUp = () => {
      setDragging(false);

      /*
        Save once when drag finishes.
      */

      if (onMove) {
        onMove(
          dragTimeRef.current
        );
      }
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
    onMove,
  ]);


  // ==========================================
  // RIGHT CLICK
  // ==========================================

  const handleContextMenu = (
    event
  ) => {
    event.preventDefault();

    /*
      Stop right-click from
      beginning a drag.
    */

    event.stopPropagation();

    setShowMenu(true);
  };


  // ==========================================
  // CLOSE CONTEXT MENU
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
  // DELETE
  // ==========================================

  const handleDelete = () => {
    setShowMenu(false);

    onDelete?.();
  };


  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      onPointerDown={
        handlePointerDown
      }

      onContextMenu={
        handleContextMenu
      }

      className={`
        absolute
        top-2

        h-[64px]

        rounded-xl

        border
        border-[var(--accent)]/70

        bg-[var(--accent)]

        text-black

        overflow-visible

        select-none

        ${
          dragging
            ? "cursor-grabbing opacity-80"
            : "cursor-grab"
        }
      `}

      style={{
        left: `${left}px`,
        width: `${width}px`,
      }}
    >

      {/* WAVEFORM */}

      <div
        className="
          pointer-events-none

          absolute
          inset-0

          flex
          items-center
          justify-between

          overflow-hidden

          rounded-xl

          px-2

          opacity-25
        "
      >
        {Array.from({
          length: Math.max(
            20,
            Math.floor(
              width / 6
            )
          ),
        }).map(
          (_, index) => {

            const height =
              20 +
              (
                (index * 17) %
                45
              );

            return (
              <div
                key={index}

                className="
                  w-[2px]
                  shrink-0

                  rounded-full

                  bg-black
                "

                style={{
                  height:
                    `${height}%`,
                }}
              />
            );
          }
        )}
      </div>


      {/* CLIP NAME */}

      <div
        className="
          pointer-events-none

          relative
          z-10

          flex
          items-center
          gap-2

          overflow-hidden

          p-2
        "
      >
        <Music2
          size={14}
          className="shrink-0"
        />

        <span
          className="
            truncate

            text-xs
            font-semibold
          "
        >
          {clip.originalName ||
            "Audio Clip"}
        </span>
      </div>


      {/* DRAG TIME LABEL */}

      {dragging && (
        <div
          className="
            pointer-events-none

            absolute
            -top-7
            left-2

            z-[100]

            whitespace-nowrap

            rounded-md

            bg-black

            px-2
            py-1

            text-[11px]
            text-white

            shadow-lg
          "
        >
          {dragTime.toFixed(2)}s
        </div>
      )}


      {/* RIGHT CLICK MENU */}

      {showMenu && (
        <div
          ref={menuRef}

          onPointerDown={(
            event
          ) => {
            /*
              Prevent clicking menu
              from starting clip drag.
            */

            event.stopPropagation();
          }}

          className="
            absolute

            left-4
            top-8

            z-[200]

            w-36

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

            onClick={
              handleDelete
            }

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

              text-red-400

              transition

              hover:bg-red-500/10
            "
          >
            <Trash2
              size={15}
            />

            Delete
          </button>
        </div>
      )}

    </div>
  );
};


export default Clip;