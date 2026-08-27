import TimeRuler from "./TimeRuler";
import Track from "./Track";
import Marker from "./Marker";

export const PIXELS_PER_SECOND = 50;
export const TIMELINE_PADDING = 24;

const Timeline = ({
  project,
  updateProjectState,

  markerTime,
  setMarkerTime,
  isPlaying,

  trackMarkers,
  setTrackMarkers,

  selectedClip,
  setSelectedClip,
}) => {
  const tracks =
    project?.state?.tracks || [];


  // ==========================================
  // FIND ACTUAL END OF PROJECT
  // ==========================================

  let maxDuration = 0;

  tracks.forEach((track) => {
    track.clips?.forEach((clip) => {
      const clipDuration =
        clip.sourceEnd -
        clip.sourceStart;

      const clipEnd =
        clip.timelineStart +
        clipDuration;

      maxDuration = Math.max(
        maxDuration,
        clipEnd
      );
    });
  });


  // ==========================================
  // TIMELINE WORKSPACE DURATION
  // ==========================================

  /*
    Give some empty space after the
    actual project end so clips can
    still be dragged further right.
  */

  const timelineDuration =
    Math.max(
      Math.ceil(maxDuration + 15),
      30
    );


  const timelineWidth =
    timelineDuration *
      PIXELS_PER_SECOND +
    TIMELINE_PADDING;


  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      className="
        w-full
        min-w-0

        border-t
        border-white/10

        bg-[#080c0b]
      "
    >

      {/* ======================================
          TIMELINE HEADER
      ====================================== */}

      <div
        className="
          flex
          items-center
          justify-between

          border-b
          border-white/10

          px-6
          py-3
        "
      >
        <h3
          className="
            text-sm
            font-semibold
            text-gray-300
          "
        >
          Timeline
        </h3>

        <span
          className="
            text-xs
            text-gray-600
          "
        >
          {tracks.length} track
          {tracks.length !== 1 && "s"}
        </span>
      </div>


      {/* ======================================
          HORIZONTAL SCROLL AREA
      ====================================== */}

      <div
        className="
          w-full
          overflow-x-auto
          overflow-y-visible
          hide-scrollbar
        "
      >

        {/* ====================================
            COMPLETE TIMELINE CONTENT
        ==================================== */}

        <div
          id="timeline-content"

          className="
            relative
            shrink-0
          "

          style={{
            width: `${timelineWidth}px`,
            minWidth: "100%",
          }}
        >

          {/* ==================================
              TIME RULER
          ================================== */}

          <TimeRuler
            duration={
              timelineDuration
            }
          />


          {/* ==================================
              GLOBAL PLAYBACK MARKER
          ================================== */}

          {maxDuration > 0 && (
            <Marker
              markerTime={
                markerTime
              }

              setMarkerTime={
                setMarkerTime
              }

              maxDuration={
                maxDuration
              }

              isPlaying={
                isPlaying
              }
            />
          )}


          {/* ==================================
              TRACKS
          ================================== */}

          {tracks.length === 0 ? (
            <div
              className="
                flex
                h-24

                items-center
                justify-center

                text-sm
                text-gray-600
              "
            >
              Upload audio to create a track.
            </div>

          ) : (

            [...tracks]
              .sort(
                (a, b) =>
                  a.position -
                  b.position
              )
              .map((track) => (

                <Track
                  key={
                    track.id
                  }

                  track={
                    track
                  }

                  project={
                    project
                  }

                  updateProjectState={
                    updateProjectState
                  }


                  // ==========================
                  // TRACK EDIT MARKER
                  // ==========================

                  editMarkerTime={
                    trackMarkers?.[
                      track.id
                    ] ?? 0
                  }

                  setEditMarkerTime={(
                    time
                  ) => {
                    setTrackMarkers(
                      (previous) => ({
                        ...previous,

                        [track.id]:
                          time,
                      })
                    );
                  }}


                  // ==========================
                  // CLIP SELECTION
                  // ==========================

                  selectedClip={
                    selectedClip
                  }

                  setSelectedClip={
                    setSelectedClip
                  }
                />

              ))
          )}

        </div>
      </div>
    </div>
  );
};

export default Timeline;