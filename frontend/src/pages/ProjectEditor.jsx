import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  MoreVertical,
  Upload,
  Download,
} from "lucide-react";


import api from "../services/api";
import { useAuth } from "../context/AuthContext";

import Timeline from "../components/editor/Timeline";
import EditorControls from "../components/editor/EditorControls";


const ProjectEditor = () => {
  const { projectId } = useParams();

  const navigate = useNavigate();
  const { user } = useAuth();

  const fileInputRef = useRef(null);
  const audioRef = useRef(null);
  const animationRef = useRef(null);
  const menuRef = useRef(null);


  // ==========================================
  // PROJECT STATE
  // ==========================================

  const [project, setProject] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [uploading, setUploading] =
    useState(false);

  const [
    showProjectMenu,
    setShowProjectMenu,
  ] = useState(false);


  // ==========================================
  // PLAYBACK STATE
  // ==========================================

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [duration, setDuration] =
    useState(0);

  /*
    The global playback marker.

    Since Python renders the whole project
    into one preview WAV, markerTime now maps
    directly to preview.currentTime.
  */
  const [
    markerTime,
    setMarkerTime,
  ] = useState(0);


  // ==========================================
  // TRACK EDIT MARKERS
  // ==========================================

  /*
    Example:

    {
      "track-id-1": 4.25,
      "track-id-2": 9.10
    }

    These are independent from the global
    playback marker and will be used for split.
  */
  const [
    trackMarkers,
    setTrackMarkers,
  ] = useState({});


  // ==========================================
  // CALCULATE PROJECT DURATION FROM METADATA
  // ==========================================

  const calculateProjectDuration = (
    projectData
  ) => {
    const tracks =
      projectData?.state?.tracks || [];

    let maxEnd = 0;

    tracks.forEach((track) => {
      track.clips?.forEach((clip) => {
        const clipDuration =
          clip.sourceEnd -
          clip.sourceStart;

        const clipEnd =
          clip.timelineStart +
          clipDuration;

        maxEnd = Math.max(
          maxEnd,
          clipEnd
        );
      });
    });

    return maxEnd;
  };


  // ==========================================
  // SAVE PROJECT STATE
  // ==========================================

  const updateProjectState = async (
    newState
  ) => {
    /*
      Optimistic update:
      update the UI immediately.
    */

    setProject((previous) => {
      if (!previous) {
        return previous;
      }

      const updatedProject = {
        ...previous,
        state: newState,
      };

      setDuration(
        calculateProjectDuration(
          updatedProject
        )
      );

      return updatedProject;
    });


    try {
      const response =
        await api.patch(
          `/projects/${projectId}/state`,
          {
            state: newState,
          }
        );

      setProject((previous) => {
        if (!previous) {
          return previous;
        }

        return {
          ...previous,
          version:
            response.data.version,
        };
      });

    } catch (error) {
      console.error(
        "Failed to save project state:",
        error
      );

      alert(
        "Failed to save project changes."
      );
    }
  };


  // ==========================================
  // SMOOTH GLOBAL PLAYBACK MARKER
  // ==========================================

  const updateMarkerAnimation = () => {
    const audio =
      audioRef.current;

    if (!audio) {
      return;
    }

    setMarkerTime(
      audio.currentTime
    );

    if (
      !audio.paused &&
      !audio.ended
    ) {
      animationRef.current =
        requestAnimationFrame(
          updateMarkerAnimation
        );
    }
  };
  
  

  // ==========================================
  // CANCEL PLAYBACK ANIMATION
  // ==========================================

  const cancelPlaybackAnimation = () => {
    if (
      animationRef.current
    ) {
      cancelAnimationFrame(
        animationRef.current
      );

      animationRef.current =
        null;
    }
  };


  // ==========================================
  // CLEANUP ON PAGE LEAVE
  // ==========================================

  useEffect(() => {
    return () => {
      cancelPlaybackAnimation();

      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);


  // ==========================================
  // CLOSE THREE-DOT MENU
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
        setShowProjectMenu(false);
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
  // LOAD PROJECT
  // ==========================================

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadProject =
      async () => {
        try {
          const response =
            await api.get(
              `/projects/${projectId}`
            );

          const loadedProject =
            response.data.project;

          setProject(
            loadedProject
          );

          /*
            Temporary duration from metadata.

            Once preview is rendered,
            Python's returned duration becomes
            the authoritative playback duration.
          */
          setDuration(
            calculateProjectDuration(
              loadedProject
            )
          );

        } catch (error) {
          console.error(
            "Failed to load project:",
            error
          );

        } finally {
          setLoading(false);
        }
      };

    loadProject();

  }, [
    projectId,
    user,
  ]);


  // ==========================================
  // OPEN FILE PICKER
  // ==========================================

  const handleUploadButton = () => {
    if (!user) {
      alert(
        "Please login before uploading audio."
      );

      navigate("/login");

      return;
    }

    fileInputRef.current?.click();
  };


  // ==========================================
  // UPLOAD AUDIO
  // ==========================================

  const handleFileChange =
    async (event) => {

      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      const formData =
        new FormData();

      formData.append(
        "file",
        file
      );


      try {
        setUploading(true);

        const response =
          await api.post(
            `/projects/${projectId}/audio`,
            formData
          );


        const updatedProject = {
          ...project,

          version:
            response.data.project
              .version,

          state:
            response.data.project
              .state,
        };


        setProject(
          updatedProject
        );


        setDuration(
          calculateProjectDuration(
            updatedProject
          )
        );


        /*
          The preview is now stale because
          project content changed.

          We don't need to store previewUrl in
          state. The next Play will ask Python
          to render a fresh preview.
        */
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.removeAttribute(
            "src"
          );
          audioRef.current.load();
        }

        cancelPlaybackAnimation();

        setIsPlaying(false);
        setMarkerTime(0);

      } catch (error) {
        console.error(
          "Audio upload failed:",
          error
        );

        alert(
          "Audio upload failed."
        );

      } finally {
        setUploading(false);

        event.target.value = "";
      }
    };


  // ==========================================
  // PLAY / PAUSE
  // ==========================================

  const handlePlayPause =
    async () => {

      const audio =
        audioRef.current;

      if (!audio) {
        return;
      }


      // ======================================
      // PAUSE EXISTING PREVIEW
      // ======================================

      if (isPlaying) {
        audio.pause();

        setMarkerTime(
          audio.currentTime
        );

        setIsPlaying(false);

        cancelPlaybackAnimation();

        return;
      }


      /*
        If an already-rendered preview is loaded
        and the project has not changed, we could
        reuse it.

        For now, always render a fresh preview.
        Later you can cache by project.version.
      */

      try {
        // ====================================
        // ASK PYTHON TO RENDER WHOLE PROJECT
        // ====================================

        const response =
          await api.post(
            `/projects/${projectId}/preview`
          );


        const previewUrl =
          response.data.preview_url;

        const previewDuration =
          response.data.duration;


        setDuration(
          previewDuration
        );


        // ====================================
        // LOAD PREVIEW WAV
        // ====================================

        audio.pause();

        cancelPlaybackAnimation();


        /*
          Adding a query parameter prevents the
          browser from reusing an old cached WAV
          if the URL/file changes unexpectedly.
        */
        audio.src =
          `${previewUrl}?v=${Date.now()}`;

        audio.load();


        // ====================================
        // WAIT UNTIL AUDIO CAN BE SEEKED
        // ====================================

        await new Promise(
          (
            resolve,
            reject
          ) => {

            const handleReady =
              () => {
                cleanup();
                resolve();
              };


            const handleError =
              () => {
                cleanup();

                reject(
                  new Error(
                    "Failed to load project preview."
                  )
                );
              };


            const cleanup =
              () => {
                audio.removeEventListener(
                  "loadedmetadata",
                  handleReady
                );

                audio.removeEventListener(
                  "error",
                  handleError
                );
              };


            audio.addEventListener(
              "loadedmetadata",
              handleReady
            );

            audio.addEventListener(
              "error",
              handleError
            );
          }
        );


        // ====================================
        // START AT GLOBAL MARKER
        // ====================================

        if (
          markerTime >=
          audio.duration
        ) {
          audio.currentTime =
            0;

          setMarkerTime(0);

        } else {
          audio.currentTime =
            markerTime;
        }


        // ====================================
        // PLAY MIXED PREVIEW
        // ====================================

        await audio.play();

        setIsPlaying(true);


        animationRef.current =
          requestAnimationFrame(
            updateMarkerAnimation
          );

      } catch (error) {
        console.error(
          "Could not render/play project preview:",
          error
        );

        setIsPlaying(false);

        cancelPlaybackAnimation();
      }
    };


  // ==========================================
  // PREVIEW FINISHED
  // ==========================================

  const handleEnded = () => {
    const audio =
      audioRef.current;

    setIsPlaying(false);

    cancelPlaybackAnimation();


    if (audio) {
      setMarkerTime(
        audio.duration
      );
    }
  };


  // ==========================================
  // EXPORT PLACEHOLDER
  // ==========================================

  const handleExport = async () => {
  setShowProjectMenu(false);

  try {
    const response =
      await api.post(
        `/projects/${projectId}/export`
      );

    const finalUrl =
      response.data.audio.url;

    /*
      Trigger browser download.
    */

    const link =
      document.createElement(
        "a"
      );

    link.href =
      finalUrl;

    link.download =
      `${project.name}.wav`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

  } catch (error) {
    console.error(
      "Export failed:",
      error
    );

    alert(
      "Failed to export project."
    );
  }
};


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[var(--bg-main)]
          text-gray-400
        "
      >
        Loading project...
      </div>
    );
  }


  // ==========================================
  // NOT LOGGED IN
  // ==========================================

  if (!user) {
    return (
      <div
        className="
          flex
          min-h-screen
          flex-col
          items-center
          justify-center
          bg-[var(--bg-main)]
        "
      >
        <h2
          className="
            text-2xl
            font-bold
          "
        >
          Login required
        </h2>


        <button
          onClick={() =>
            navigate("/login")
          }

          className="
            mt-6
            rounded-full
            bg-[var(--accent)]
            px-7
            py-3
            font-semibold
            text-black
          "
        >
          Login
        </button>
      </div>
    );
  }


  // ==========================================
  // PROJECT NOT FOUND
  // ==========================================

  if (!project) {
    return (
      <div
        className="
          flex
          min-h-screen
          items-center
          justify-center
          bg-[var(--bg-main)]
        "
      >
        Project not found.
      </div>
    );
  }


  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div
      className="
        min-h-screen
        w-full
        min-w-0

        overflow-x-auto
        overflow-y-auto

        bg-[var(--bg-main)]
        text-white
      "
    >

      {/* ======================================
          PROJECT PREVIEW AUDIO
      ====================================== */}

      <audio
        ref={audioRef}
        onEnded={
          handleEnded
        }
      />


      {/* ======================================
          HIDDEN FILE INPUT
      ====================================== */}

      <input
        ref={
          fileInputRef
        }

        type="file"

        accept="audio/*"

        hidden

        onChange={
          handleFileChange
        }
      />


      {/* ======================================
          TOP BAR
      ====================================== */}

      <div
        className="
          sticky
          top-0
          z-[150]

          flex
          min-w-full

          items-center
          justify-between

          border-b
          border-white/10

          bg-[#090d0c]

          px-6
          py-3
        "
      >

        {/* PROJECT INFO */}

        <div>
          <h1
            className="
              text-lg
              font-semibold
            "
          >
            {project.name}
          </h1>

          <p
            className="
              mt-0.5
              text-[11px]
              text-gray-500
            "
          >
            Version{" "}
            {project.version}
          </p>
        </div>


        {/* THREE-DOT MENU */}

        <div
          ref={menuRef}

          className="relative"
        >

          <button
            onClick={() =>
              setShowProjectMenu(
                (previous) =>
                  !previous
              )
            }

            className="
              flex
              h-10
              w-10

              cursor-pointer

              items-center
              justify-center

              rounded-full

              text-gray-300

              transition

              hover:bg-white/10
              hover:text-white
            "
          >
            <MoreVertical
              size={22}
            />
          </button>


          {showProjectMenu && (
            <div
              className="
                absolute
                right-0
                top-12

                z-[200]

                w-48

                overflow-hidden

                rounded-xl

                border
                border-white/10

                bg-[#121716]

                shadow-2xl
              "
            >

              {/* UPLOAD */}

              <button
                onClick={() => {
                  setShowProjectMenu(
                    false
                  );

                  handleUploadButton();
                }}

                disabled={
                  uploading
                }

                className="
                  flex
                  w-full

                  cursor-pointer

                  items-center
                  gap-3

                  px-4
                  py-3

                  text-sm
                  text-gray-200

                  transition

                  hover:bg-white/10

                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <Upload
                  size={16}
                />

                {uploading
                  ? "Uploading..."
                  : "Upload Audio"}
              </button>


              {/* EXPORT */}

              <button
                onClick={
                  handleExport
                }

                className="
                  flex
                  w-full

                  cursor-pointer

                  items-center
                  gap-3

                  px-4
                  py-3

                  text-sm
                  text-gray-200

                  transition

                  hover:bg-white/10
                "
              >
                <Download
                  size={16}
                />

                Export Audio
              </button>

            </div>
          )}

        </div>
      </div>


      {/* ======================================
          EDITING RIBBON GOES HERE
      ====================================== */}


      {/* ======================================
          MAIN WORKSPACE
      ====================================== */}

      <div
        className="
          min-h-[300px]
          min-w-full

          px-8
          py-6
        "
      >

        {project.state
          ?.tracks
          ?.length === 0 ? (

          <div
            className="
              flex
              min-h-[300px]

              flex-col

              items-center
              justify-center

              rounded-2xl

              border
              border-dashed
              border-white/10
            "
          >
            <Upload
              size={40}

              className="
                text-[var(--accent)]
              "
            />


            <h2
              className="
                mt-5
                text-xl
                font-semibold
              "
            >
              Add your first audio
            </h2>


            <p
              className="
                mt-2
                text-sm
                text-gray-500
              "
            >
              Upload an audio file
              to start editing.
            </p>


            <button
              onClick={
                handleUploadButton
              }

              disabled={
                uploading
              }

              className="
                mt-6

                cursor-pointer

                rounded-full

                bg-[var(--accent)]

                px-6
                py-3

                font-semibold
                text-black

                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {uploading
                ? "Uploading..."
                : "Upload Audio"}
            </button>

          </div>

        ) : (

          <div
            className="
              min-h-[300px]
            "
          />

        )}

      </div>


      {/* ======================================
          PLAYBACK CONTROLS
      ====================================== */}

      <EditorControls
        isPlaying={
          isPlaying
        }

        onPlayPause={
          handlePlayPause
        }

        currentTime={
          markerTime
        }

        duration={
          duration
        }
      />


      {/* ======================================
          TIMELINE
      ====================================== */}

      <Timeline
        project={
          project
        }

        updateProjectState={
          updateProjectState
        }

        markerTime={
          markerTime
        }

        setMarkerTime={
          setMarkerTime
        }

        isPlaying={
          isPlaying
        }

        trackMarkers={
          trackMarkers
        }

        setTrackMarkers={
          setTrackMarkers
        }
      />

    </div>
  );
};


export default ProjectEditor;