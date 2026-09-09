import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  createPortal,
} from "react-dom";

import {
  Mic,
  Pause,
  Play,
  Square,
  Download,
  Trash2,
  X,
} from "lucide-react";


const VoiceRecorderModal = ({
  onClose,
}) => {
  const [
    recorderState,
    setRecorderState,
  ] = useState(
    "idle"
  );

  const [
    elapsedSeconds,
    setElapsedSeconds,
  ] = useState(
    0
  );

  const [
    audioUrl,
    setAudioUrl,
  ] = useState(
    null
  );

  const [
    recordedBlob,
    setRecordedBlob,
  ] = useState(
    null
  );

  const [
    mimeType,
    setMimeType,
  ] = useState(
    "audio/webm"
  );


  const mediaRecorderRef =
    useRef(null);

  const streamRef =
    useRef(null);

  const chunksRef =
    useRef([]);

  const timerRef =
    useRef(null);

  const audioUrlRef =
    useRef(null);


  // =========================================================
  // SUPPORTED MIME TYPE
  // =========================================================

  const getSupportedMimeType =
    () => {

      const candidates = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/ogg;codecs=opus",
        "audio/ogg",
      ];


      for (
        const type
        of candidates
      ) {
        if (
          MediaRecorder
            .isTypeSupported(
              type
            )
        ) {
          return type;
        }
      }


      return "";
    };


  // =========================================================
  // TIMER
  // =========================================================

  const startTimer = () => {
    if (
      timerRef.current
    ) {
      clearInterval(
        timerRef.current
      );
    }


    timerRef.current =
      setInterval(
        () => {
          setElapsedSeconds(
            (previous) =>
              previous + 1
          );
        },
        1000
      );
  };


  const stopTimer = () => {
    if (
      timerRef.current
    ) {
      clearInterval(
        timerRef.current
      );

      timerRef.current =
        null;
    }
  };


  // =========================================================
  // STOP MICROPHONE STREAM
  // =========================================================

  const stopStream = () => {
    if (
      streamRef.current
    ) {
      streamRef.current
        .getTracks()
        .forEach(
          (track) => {
            track.stop();
          }
        );

      streamRef.current =
        null;
    }
  };


  // =========================================================
  // CLEAR OBJECT URL
  // =========================================================

  const clearAudioUrl = () => {
    if (
      audioUrlRef.current
    ) {
      URL.revokeObjectURL(
        audioUrlRef.current
      );

      audioUrlRef.current =
        null;
    }

    setAudioUrl(
      null
    );
  };


  // =========================================================
  // START RECORDING
  // =========================================================

  const startRecording =
    async () => {

      if (
        !navigator
          .mediaDevices
          ?.getUserMedia
      ) {
        alert(
          "Microphone recording is not supported by this browser."
        );

        return;
      }


      if (
        typeof MediaRecorder ===
        "undefined"
      ) {
        alert(
          "MediaRecorder is not supported by this browser."
        );

        return;
      }


      try {
        clearAudioUrl();

        setRecordedBlob(
          null
        );

        setElapsedSeconds(
          0
        );

        chunksRef.current =
          [];


        const stream =
          await navigator
            .mediaDevices
            .getUserMedia({
              audio: true,
            });


        streamRef.current =
          stream;


        const supportedType =
          getSupportedMimeType();


        const recorder =
          supportedType
            ? new MediaRecorder(
                stream,
                {
                  mimeType:
                    supportedType,
                }
              )
            : new MediaRecorder(
                stream
              );


        mediaRecorderRef.current =
          recorder;


        setMimeType(
          recorder.mimeType ||
            supportedType ||
            "audio/webm"
        );


        recorder.ondataavailable =
          (event) => {
            if (
              event.data &&
              event.data.size >
                0
            ) {
              chunksRef.current.push(
                event.data
              );
            }
          };


        recorder.onerror =
          (event) => {
            console.error(
              "MediaRecorder error:",
              event
            );

            stopTimer();

            stopStream();

            setRecorderState(
              "idle"
            );
          };


        recorder.onstop =
          () => {
            stopTimer();


            const type =
              recorder.mimeType ||
              supportedType ||
              "audio/webm";


            const blob =
              new Blob(
                chunksRef.current,
                {
                  type,
                }
              );


            setRecordedBlob(
              blob
            );

            setMimeType(
              type
            );


            const url =
              URL.createObjectURL(
                blob
              );


            audioUrlRef.current =
              url;


            setAudioUrl(
              url
            );


            setRecorderState(
              "finished"
            );


            stopStream();
          };


        recorder.start(
          250
        );


        setRecorderState(
          "recording"
        );


        startTimer();

      } catch (error) {
        console.error(
          "Microphone permission error:",
          error
        );


        stopTimer();

        stopStream();


        setRecorderState(
          "idle"
        );


        if (
          error?.name ===
          "NotAllowedError"
        ) {
          alert(
            "Microphone permission was denied. Please allow microphone access and try again."
          );

          return;
        }


        alert(
          "Could not start microphone recording."
        );
      }
    };


  // =========================================================
  // PAUSE / RESUME
  // =========================================================

  const togglePause = () => {
    const recorder =
      mediaRecorderRef.current;


    if (!recorder) {
      return;
    }


    if (
      recorder.state ===
      "recording"
    ) {
      recorder.pause();

      setRecorderState(
        "paused"
      );

      stopTimer();

      return;
    }


    if (
      recorder.state ===
      "paused"
    ) {
      recorder.resume();

      setRecorderState(
        "recording"
      );

      startTimer();
    }
  };


  // =========================================================
  // STOP RECORDING
  // =========================================================

  const stopRecording = () => {
    const recorder =
      mediaRecorderRef.current;


    if (
      !recorder ||
      recorder.state ===
        "inactive"
    ) {
      return;
    }


    stopTimer();

    recorder.stop();
  };


  // =========================================================
  // DELETE RECORDING
  // =========================================================

  const deleteRecording = () => {
    stopTimer();

    stopStream();

    clearAudioUrl();


    chunksRef.current =
      [];


    mediaRecorderRef.current =
      null;


    setRecordedBlob(
      null
    );

    setElapsedSeconds(
      0
    );

    setRecorderState(
      "idle"
    );
  };


  // =========================================================
  // EXPORT
  // =========================================================

  const exportRecording = () => {
    if (
      !recordedBlob ||
      !audioUrl
    ) {
      return;
    }


    let extension =
      "webm";


    if (
      mimeType.includes(
        "ogg"
      )
    ) {
      extension =
        "ogg";
    }


    const anchor =
      document.createElement(
        "a"
      );


    anchor.href =
      audioUrl;


    anchor.download =
      `audiverse-recording.${extension}`;


    document.body.appendChild(
      anchor
    );


    anchor.click();


    anchor.remove();
  };


  // =========================================================
  // CLOSE
  // =========================================================

  const handleClose = () => {
    const recorder =
      mediaRecorderRef.current;


    if (
      recorder &&
      recorder.state !==
        "inactive"
    ) {
      recorder.onstop =
        null;

      recorder.stop();
    }


    stopTimer();

    stopStream();

    clearAudioUrl();


    onClose?.();
  };


  // =========================================================
  // FORMAT TIMER
  // =========================================================

  const formatTime = (
    totalSeconds
  ) => {
    const minutes =
      Math.floor(
        totalSeconds /
          60
      );


    const seconds =
      totalSeconds %
      60;


    return `${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:${String(
      seconds
    ).padStart(
      2,
      "0"
    )}`;
  };


  // =========================================================
  // ESCAPE KEY
  // =========================================================

  useEffect(() => {
    const handleKeyDown =
      (event) => {

        if (
          event.key ===
          "Escape"
        ) {
          handleClose();
        }
      };


    document.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  });


  // =========================================================
  // CLEANUP
  // =========================================================

  useEffect(() => {
    return () => {
      stopTimer();

      stopStream();


      if (
        audioUrlRef.current
      ) {
        URL.revokeObjectURL(
          audioUrlRef.current
        );
      }
    };
  }, []);


  // =========================================================
  // MODAL
  // =========================================================

  return createPortal(
    <div
      className="
        fixed
        inset-0

        z-[9999]

        flex
        items-center
        justify-center

        bg-black/75

        px-4

        backdrop-blur-md
      "

      onMouseDown={
        handleClose
      }
    >
      <div
        className="
          relative

          w-full
          max-w-md

          rounded-2xl

          border
          border-white/10

          bg-[#101514]

          p-6

          shadow-[0_30px_100px_rgba(0,0,0,0.85)]
        "

        onMouseDown={(
          event
        ) => {
          event.stopPropagation();
        }}
      >

        {/* =====================================
            CLOSE BUTTON
        ===================================== */}

        <button
          type="button"

          onClick={
            handleClose
          }

          className="
            absolute
            right-4
            top-4

            flex
            h-9
            w-9

            cursor-pointer

            items-center
            justify-center

            rounded-full

            text-gray-400

            transition

            hover:bg-white/10
            hover:text-white
          "
        >
          <X
            size={18}
          />
        </button>


        {/* =====================================
            HEADER
        ===================================== */}

        <div
          className="
            mb-7

            text-center
          "
        >
          <div
            className="
              mx-auto
              mb-4

              flex
              h-16
              w-16

              items-center
              justify-center

              rounded-full

              border
              border-[var(--accent)]/20

              bg-[var(--accent-soft)]

              text-[var(--accent)]
            "
          >
            <Mic
              size={28}
            />
          </div>


          <h2
            className="
              text-xl
              font-semibold

              text-white
            "
          >
            Record Voice
          </h2>


          <p
            className="
              mt-2

              text-sm
              text-gray-500
            "
          >
            Capture audio directly
            from your microphone.
          </p>
        </div>


        {/* =====================================
            TIMER
        ===================================== */}

        <div
          className="
            mb-4

            text-center

            font-mono
            text-4xl
            font-semibold

            tracking-wider

            text-white
          "
        >
          {formatTime(
            elapsedSeconds
          )}
        </div>


        {/* =====================================
            STATUS
        ===================================== */}

        <div
          className="
            mb-7

            flex
            h-5

            items-center
            justify-center
            gap-2

            text-xs

            uppercase
            tracking-[0.16em]

            text-gray-500
          "
        >
          {recorderState ===
            "idle" && (
            <>
              <span
                className="
                  h-2
                  w-2

                  rounded-full

                  bg-gray-600
                "
              />

              Ready
            </>
          )}


          {recorderState ===
            "recording" && (
            <>
              <span
                className="
                  h-2
                  w-2

                  animate-pulse

                  rounded-full

                  bg-red-500
                "
              />

              Recording
            </>
          )}


          {recorderState ===
            "paused" && (
            <>
              <span
                className="
                  h-2
                  w-2

                  rounded-full

                  bg-yellow-400
                "
              />

              Paused
            </>
          )}


          {recorderState ===
            "finished" && (
            <>
              <span
                className="
                  h-2
                  w-2

                  rounded-full

                  bg-[var(--accent)]
                "
              />

              Recording Complete
            </>
          )}
        </div>


        {/* =====================================
            RECORD BUTTON
        ===================================== */}

        {recorderState ===
          "idle" && (
          <div
            className="
              mb-7

              flex
              justify-center
            "
          >
            <button
              type="button"

              onClick={
                startRecording
              }

              className="
                flex
                h-16
                w-16

                cursor-pointer

                items-center
                justify-center

                rounded-full

                bg-red-500

                text-white

                shadow-[0_0_35px_rgba(239,68,68,0.25)]

                transition

                hover:scale-105
                hover:bg-red-400

                active:scale-95
              "
            >
              <Mic
                size={25}
              />
            </button>
          </div>
        )}


        {/* =====================================
            RECORDING CONTROLS
        ===================================== */}

        {(
          recorderState ===
            "recording" ||
          recorderState ===
            "paused"
        ) && (
          <div
            className="
              mb-7

              flex
              items-center
              justify-center

              gap-4
            "
          >
            <button
              type="button"

              onClick={
                togglePause
              }

              className="
                flex
                h-12
                w-12

                cursor-pointer

                items-center
                justify-center

                rounded-full

                border
                border-white/10

                bg-white/5

                text-white

                transition

                hover:bg-white/10
              "
            >
              {recorderState ===
              "recording"
                ? (
                  <Pause
                    size={20}
                  />
                )
                : (
                  <Play
                    size={20}
                  />
                )}
            </button>


            <button
              type="button"

              onClick={
                stopRecording
              }

              className="
                flex
                h-16
                w-16

                cursor-pointer

                items-center
                justify-center

                rounded-full

                bg-red-500

                text-white

                transition

                hover:bg-red-400

                active:scale-95
              "
            >
              <Square
                size={20}
                fill="currentColor"
              />
            </button>
          </div>
        )}


        {/* =====================================
            AUDIO PREVIEW
        ===================================== */}

        {audioUrl && (
          <div
            className="
              mb-6

              rounded-xl

              border
              border-white/10

              bg-black/20

              p-3
            "
          >
            <audio
              controls

              src={
                audioUrl
              }

              className="
                w-full
              "
            />
          </div>
        )}


        {/* =====================================
            FINISHED ACTIONS
        ===================================== */}

        {recorderState ===
          "finished" &&
          audioUrl && (
          <div
            className="
              flex
              gap-3
            "
          >
            <button
              type="button"

              onClick={
                deleteRecording
              }

              className="
                flex
                flex-1

                cursor-pointer

                items-center
                justify-center
                gap-2

                rounded-xl

                border
                border-white/10

                px-4
                py-3

                text-sm
                font-medium

                text-gray-300

                transition

                hover:bg-white/10
                hover:text-white
              "
            >
              <Trash2
                size={17}
              />

              Delete
            </button>


            <button
              type="button"

              onClick={
                exportRecording
              }

              className="
                flex
                flex-1

                cursor-pointer

                items-center
                justify-center
                gap-2

                rounded-xl

                bg-[var(--accent)]

                px-4
                py-3

                text-sm
                font-semibold

                text-black

                transition

                hover:bg-[var(--accent-hover)]

                active:scale-[0.98]
              "
            >
              <Download
                size={17}
              />

              Export
            </button>
          </div>
        )}

      </div>
    </div>,

    document.body
  );
};


export default VoiceRecorderModal;