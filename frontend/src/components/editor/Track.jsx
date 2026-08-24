import { Trash2 } from "lucide-react";
import Clip from "./Clip";
import TrackMarker from "./TrackMarker";

const Track = ({
  track,
  project,
  updateProjectState,
  editMarkerTime,
  setEditMarkerTime,
}) => {
  //handle split
  const handleSplitClip = async (splitTime) => {
    if (!project) {
      return;
    }

    const updatedTracks =
      project.state.tracks.map(
        (currentTrack) => {

          if (
            currentTrack.id !==
            track.id
          ) {
            return currentTrack;
          }

          const updatedClips = [];

          currentTrack.clips.forEach(
            (clip) => {

              const clipDuration =
                clip.sourceEnd -
                clip.sourceStart;

              const clipStart =
                clip.timelineStart;

              const clipEnd =
                clip.timelineStart +
                clipDuration;


              // Marker is not inside this clip
              if (
                splitTime <= clipStart ||
                splitTime >= clipEnd
              ) {
                updatedClips.push(clip);
                return;
              }


              // ==================================
              // FIND WHERE TO SPLIT SOURCE AUDIO
              // ==================================

              const offsetInsideClip =
                splitTime -
                clip.timelineStart;

              const sourceSplit =
                clip.sourceStart +
                offsetInsideClip;


              // ==================================
              // LEFT CLIP
              // ==================================

              const leftClip = {
                ...clip,

                id:
                  crypto.randomUUID(),

                sourceEnd:
                  sourceSplit,

                effects:
                  structuredClone(
                    clip.effects || []
                  ),
              };


              // ==================================
              // RIGHT CLIP
              // ==================================

              const rightClip = {
                ...clip,

                id:
                  crypto.randomUUID(),

                sourceStart:
                  sourceSplit,

                timelineStart:
                  splitTime,

                effects:
                  structuredClone(
                    clip.effects || []
                  ),
              };


              updatedClips.push(
                leftClip,
                rightClip
              );
            }
          );


          return {
            ...currentTrack,
            clips: updatedClips,
          };
        }
      );


    const newState = {
      ...project.state,
      tracks: updatedTracks,
    };


    await updateProjectState(
      newState
    );
  };

  // ==========================================
  // DELETE WHOLE TRACK
  // ==========================================

  const handleDeleteTrack = async () => {
    if (!project) {
      return;
    }

    const updatedTracks =
      project.state.tracks.filter(
        (currentTrack) =>
          currentTrack.id !== track.id
      );

    const newState = {
      ...project.state,
      tracks: updatedTracks,
    };

    await updateProjectState(newState);
  };


  // ==========================================
  // DELETE ONE CLIP
  // ==========================================

  const handleDeleteClip = async (
    clipId
  ) => {
    if (!project) {
      return;
    }

    const updatedTracks =
      project.state.tracks
        .map((currentTrack) => {
          if (
            currentTrack.id !==
            track.id
          ) {
            return currentTrack;
          }

          const updatedClips =
            currentTrack.clips.filter(
              (clip) =>
                clip.id !== clipId
            );

          return {
            ...currentTrack,
            clips: updatedClips,
          };
        })
        .filter(
          (currentTrack) =>
            currentTrack.clips.length > 0
        );

    const newState = {
      ...project.state,
      tracks: updatedTracks,
    };

    await updateProjectState(newState);
  };


  // ==========================================
  // MOVE CLIP HORIZONTALLY
  // ==========================================

  const handleMoveClip = async (
    clipId,
    newTimelineStart
  ) => {
    if (!project) {
      return;
    }

    const updatedTracks =
      project.state.tracks.map(
        (currentTrack) => {

          if (
            currentTrack.id !==
            track.id
          ) {
            return currentTrack;
          }

          const updatedClips =
            currentTrack.clips.map(
              (clip) => {

                if (
                  clip.id !== clipId
                ) {
                  return clip;
                }

                return {
                  ...clip,

                  timelineStart:
                    newTimelineStart,
                };
              }
            );

          return {
            ...currentTrack,
            clips: updatedClips,
          };
        }
      );

    const newState = {
      ...project.state,
      tracks: updatedTracks,
    };

    await updateProjectState(
      newState
    );
  };


  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      className="
        relative
        flex
        h-[82px]

        border-b
        border-white/10

        bg-white/[0.025]
      "
    >

      {/* TRACK DELETE BUTTON */}

      <div
        className="
          flex
          w-12
          shrink-0
          items-center
          justify-center

          border-r
          border-white/10
        "
      >
        <button
          onClick={
            handleDeleteTrack
          }

          className="
            flex
            h-8
            w-8
            cursor-pointer
            items-center
            justify-center

            rounded-lg

            text-gray-500

            transition

            hover:bg-red-500/10
            hover:text-red-400
          "

          title="Delete track"
        >
          <Trash2 size={16} />
        </button>
      </div>


      {/* TRACK CONTENT */}

      <div
        className="
          relative
          flex-1
        "
      >

        {track.clips?.map(
          (clip) => (
            <Clip
              key={clip.id}

              clip={clip}

              onDelete={() =>
                handleDeleteClip(
                  clip.id
                )
              }

              onMove={(newTime) =>
                handleMoveClip(
                  clip.id,
                  newTime
                )
              }
            />
          )
        )}


        {/* PER-TRACK EDIT MARKER */}

        <TrackMarker
          markerTime={editMarkerTime}
          setMarkerTime={setEditMarkerTime}
          track={track}
          onSplit={handleSplitClip}
        />

      </div>

    </div>
  );
};

export default Track;