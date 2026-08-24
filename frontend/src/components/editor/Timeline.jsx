import TimeRuler from "./TimeRuler";
import Track from "./Track";
import Marker from "./Marker";

export const PIXELS_PER_SECOND = 50;
export const TIMELINE_PADDING = 24;

const Timeline = ({
    project,
    setProject,
    updateProjectState,
    markerTime,
    setMarkerTime,
    isPlaying,
    trackMarkers,
    setTrackMarkers,
}) => {
    const tracks =
        project?.state?.tracks || [];

    // ==========================================
    // FIND ACTUAL END OF PROJECT
    // ==========================================

    let maxDuration = 30;

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

    // Keep at least 5 seconds visible
    const timelineDuration =
        Math.max(
            Math.ceil(maxDuration),
            5
        );

    const timelineWidth =
        timelineDuration *
        PIXELS_PER_SECOND +
        TIMELINE_PADDING;

    return (
        <div
            className="
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
          SCROLLABLE TIMELINE
      ====================================== */}

            <div
                className="
          overflow-x-auto
          hide-scrollbar
        "
            >
                <div
                    id="timeline-content"
                    className="relative"
                    style={{
                        width: `${timelineWidth}px`,
                    }}
                >
                    {/* ==================================
              TIME RULER
          ================================== */}

                    <TimeRuler
                        duration={timelineDuration}
                    />

                    {/* ==================================
              MARKER
          ================================== */}

                    {maxDuration > 0 && (
                        <Marker
                            markerTime={markerTime}
                            setMarkerTime={setMarkerTime}
                            maxDuration={maxDuration}
                            isPlaying={isPlaying}
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
                                    key={track.id}
                                    track={track}
                                    project={project}
                                    updateProjectState={updateProjectState}

                                    editMarkerTime={
                                        trackMarkers[track.id] ?? 0
                                    }

                                    setEditMarkerTime={(time) => {
                                        setTrackMarkers((previous) => ({
                                            ...previous,
                                            [track.id]: time,
                                        }));
                                    }}
                                />
                            ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Timeline;