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
    Upload,
    Pause,
    Play,
    Square,
    Trash2,
    X,
    Check,
    LockKeyhole,
    RotateCcw,
    Download,
    Sparkles,
} from "lucide-react";

import {
    encodeSecretAudio,
} from "../../utils/steganography/encodeAudio";

import {
    encodeWav,
} from "../../utils/steganography/wavEncoder";


const EncodeSecretModal = ({
    onClose,
}) => {

    // =========================================================
    // STATE
    // =========================================================

    const [
        activeInput,
        setActiveInput,
    ] = useState(
        "audible"
    );


    const [
        audibleAudio,
        setAudibleAudio,
    ] = useState(
        null
    );


    const [
        secretAudio,
        setSecretAudio,
    ] = useState(
        null
    );


    const [
        recordingTarget,
        setRecordingTarget,
    ] = useState(
        null
    );


    const [
        recordingState,
        setRecordingState,
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
        isPlaying,
        setIsPlaying,
    ] = useState(
        false
    );


    const [
        isEncoding,
        setIsEncoding,
    ] = useState(
        false
    );


    const [
        encodedAudio,
        setEncodedAudio,
    ] = useState(
        null
    );


    // =========================================================
    // REFS
    // =========================================================

    const canvasRef =
        useRef(null);


    const audioRef =
        useRef(null);


    const audibleInputRef =
        useRef(null);


    const secretInputRef =
        useRef(null);


    const mediaRecorderRef =
        useRef(null);


    const streamRef =
        useRef(null);


    const chunksRef =
        useRef([]);


    const timerRef =
        useRef(null);


    const animationRef =
        useRef(null);


    const audioContextRef =
        useRef(null);


    const analyserRef =
        useRef(null);


    const sourceNodeRef =
        useRef(null);


    const audibleAudioRef =
        useRef(null);


    const secretAudioRef =
        useRef(null);


    const encodedAudioRef =
        useRef(null);


    // =========================================================
    // KEEP URL REFS UPDATED
    // =========================================================

    useEffect(() => {
        audibleAudioRef.current =
            audibleAudio;
    }, [
        audibleAudio,
    ]);


    useEffect(() => {
        secretAudioRef.current =
            secretAudio;
    }, [
        secretAudio,
    ]);


    useEffect(() => {
        encodedAudioRef.current =
            encodedAudio;
    }, [
        encodedAudio,
    ]);


    // =========================================================
    // CURRENT AUDIO
    // =========================================================

    const currentAudio =
        activeInput ===
        "audible"
            ? audibleAudio
            : secretAudio;


    // =========================================================
    // FORMAT TIME
    // =========================================================

    const formatTime = (
        seconds
    ) => {

        const minutes =
            Math.floor(
                seconds / 60
            );


        const remaining =
            seconds % 60;


        return `${String(
            minutes
        ).padStart(
            2,
            "0"
        )}:${String(
            remaining
        ).padStart(
            2,
            "0"
        )}`;
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
    // REVOKE OBJECT URL
    // =========================================================

    const revokeAudioUrl = (
        audio
    ) => {

        if (
            audio?.url
        ) {
            URL.revokeObjectURL(
                audio.url
            );
        }
    };


    // =========================================================
    // STOP MICROPHONE STREAM
    // =========================================================

    const stopStream = () => {

        if (
            !streamRef.current
        ) {
            return;
        }


        streamRef.current
            .getTracks()
            .forEach(
                (track) => {
                    track.stop();
                }
            );


        streamRef.current =
            null;
    };


    // =========================================================
    // CLEAR AUDIO ANALYSIS GRAPH
    // =========================================================

    const clearAudioGraph = () => {

        if (
            animationRef.current
        ) {
            cancelAnimationFrame(
                animationRef.current
            );

            animationRef.current =
                null;
        }


        const oldContext =
            audioContextRef.current;


        audioContextRef.current =
            null;

        analyserRef.current =
            null;

        sourceNodeRef.current =
            null;


        if (
            oldContext &&
            oldContext.state !==
                "closed"
        ) {
            oldContext
                .close()
                .catch(
                    () => {}
                );
        }
    };


    // =========================================================
    // PREPARE CANVAS
    // =========================================================

    const prepareCanvas = () => {

        const canvas =
            canvasRef.current;


        if (!canvas) {
            return null;
        }


        const context =
            canvas.getContext(
                "2d"
            );


        const rect =
            canvas.getBoundingClientRect();


        const dpr =
            window.devicePixelRatio ||
            1;


        canvas.width =
            Math.max(
                1,
                Math.floor(
                    rect.width *
                    dpr
                )
            );


        canvas.height =
            Math.max(
                1,
                Math.floor(
                    rect.height *
                    dpr
                )
            );


        context.setTransform(
            dpr,
            0,
            0,
            dpr,
            0,
            0
        );


        return {
            canvas,
            context,
            width:
                rect.width,
            height:
                rect.height,
        };
    };


    // =========================================================
    // DRAW CENTER LINE
    // =========================================================

    const drawCenterLine = (
        context,
        width,
        middle
    ) => {

        context.save();


        context.beginPath();


        context.moveTo(
            0,
            middle
        );


        context.lineTo(
            width,
            middle
        );


        context.strokeStyle =
            "rgba(34, 211, 197, 0.80)";


        context.lineWidth =
            1.4;


        context.shadowBlur =
            14;


        context.shadowColor =
            "rgba(34, 211, 197, 0.75)";


        context.stroke();


        context.restore();
    };


    // =========================================================
    // WAVE GRADIENT
    // =========================================================

    const createWaveGradient = (
        context,
        width
    ) => {

        const gradient =
            context.createLinearGradient(
                0,
                0,
                width,
                0
            );


        gradient.addColorStop(
            0,
            "rgba(20, 184, 166, 0.28)"
        );


        gradient.addColorStop(
            0.2,
            "rgba(45, 212, 191, 0.72)"
        );


        gradient.addColorStop(
            0.5,
            "rgba(34, 211, 238, 0.95)"
        );


        gradient.addColorStop(
            0.8,
            "rgba(45, 212, 191, 0.72)"
        );


        gradient.addColorStop(
            1,
            "rgba(20, 184, 166, 0.28)"
        );


        return gradient;
    };


    // =========================================================
    // DRAW CURVE
    // =========================================================

    const drawCurve = (
        context,
        points,
        {
            strokeStyle,
            lineWidth,
            shadowBlur = 0,
            shadowColor =
                "transparent",
            alpha = 1,
        }
    ) => {

        if (
            !points.length
        ) {
            return;
        }


        context.save();


        context.beginPath();


        points.forEach(
            (
                point,
                index
            ) => {

                if (
                    index === 0
                ) {
                    context.moveTo(
                        point.x,
                        point.y
                    );
                } else {
                    context.lineTo(
                        point.x,
                        point.y
                    );
                }
            }
        );


        context.strokeStyle =
            strokeStyle;


        context.lineWidth =
            lineWidth;


        context.globalAlpha =
            alpha;


        context.shadowBlur =
            shadowBlur;


        context.shadowColor =
            shadowColor;


        context.lineJoin =
            "round";


        context.lineCap =
            "round";


        context.stroke();


        context.restore();
    };


    // =========================================================
    // DRAW IDLE WAVE
    // =========================================================

    const drawIdleWave = () => {

        const prepared =
            prepareCanvas();


        if (!prepared) {
            return;
        }


        const {
            context,
            width,
            height,
        } = prepared;


        const middle =
            height / 2;


        const time =
            performance.now() /
            700;


        context.clearRect(
            0,
            0,
            width,
            height
        );


        drawCenterLine(
            context,
            width,
            middle
        );


        const gradient =
            createWaveGradient(
                context,
                width
            );


        const points =
            [];


        const amplitude =
            Math.min(
                height *
                    0.25,
                44
            );


        for (
            let x = 0;
            x <= width;
            x += 3
        ) {

            const normalized =
                x / width;


            const envelope =
                Math.sin(
                    Math.PI *
                    normalized
                );


            const wave =
                (
                    Math.sin(
                        normalized *
                            Math.PI *
                            7 -
                        time *
                            1.45
                    ) *
                        0.68
                ) +
                (
                    Math.sin(
                        normalized *
                            Math.PI *
                            13 +
                        time *
                            0.95
                    ) *
                        0.22
                ) +
                (
                    Math.sin(
                        normalized *
                            Math.PI *
                            3 -
                        time *
                            0.55
                    ) *
                        0.10
                );


            points.push({
                x,

                y:
                    middle +
                    wave *
                        amplitude *
                        envelope,
            });
        }


        drawCurve(
            context,
            points,
            {
                strokeStyle:
                    gradient,

                lineWidth:
                    7,

                shadowBlur:
                    22,

                shadowColor:
                    "rgba(34, 211, 197, 0.35)",

                alpha:
                    0.14,
            }
        );


        drawCurve(
            context,
            points,
            {
                strokeStyle:
                    gradient,

                lineWidth:
                    1.8,

                shadowBlur:
                    12,

                shadowColor:
                    "rgba(34, 211, 197, 0.60)",
            }
        );


        const mirrored =
            points.map(
                (point) => ({
                    x:
                        point.x,

                    y:
                        middle -
                        (
                            point.y -
                            middle
                        ) *
                            0.80,
                })
            );


        drawCurve(
            context,
            mirrored,
            {
                strokeStyle:
                    "rgba(34, 211, 238, 0.26)",

                lineWidth:
                    1.2,

                shadowBlur:
                    7,

                shadowColor:
                    "rgba(34, 211, 238, 0.30)",
            }
        );


        animationRef.current =
            requestAnimationFrame(
                drawIdleWave
            );
    };


    // =========================================================
    // START IDLE WAVE
    // =========================================================

    const startIdleWave = () => {

        if (
            animationRef.current
        ) {
            cancelAnimationFrame(
                animationRef.current
            );
        }


        animationRef.current =
            null;


        drawIdleWave();
    };


    // =========================================================
    // DRAW REAL AUDIO WAVE
    // =========================================================

    const drawAnalyserWave = () => {

        const analyser =
            analyserRef.current;


        if (!analyser) {
            return;
        }


        const prepared =
            prepareCanvas();


        if (!prepared) {
            return;
        }


        const {
            context,
            width,
            height,
        } = prepared;


        const middle =
            height / 2;


        const data =
            new Uint8Array(
                analyser.fftSize
            );


        analyser
            .getByteTimeDomainData(
                data
            );


        context.clearRect(
            0,
            0,
            width,
            height
        );


        drawCenterLine(
            context,
            width,
            middle
        );


        const gradient =
            createWaveGradient(
                context,
                width
            );


        const pointCount =
            180;


        const samplesPerPoint =
            Math.max(
                1,
                Math.floor(
                    data.length /
                    pointCount
                )
            );


        const points =
            [];


        for (
            let i = 0;
            i < pointCount;
            i++
        ) {

            const start =
                i *
                samplesPerPoint;


            const end =
                Math.min(
                    start +
                        samplesPerPoint,
                    data.length
                );


            let sum =
                0;


            let count =
                0;


            for (
                let j = start;
                j < end;
                j++
            ) {

                sum +=
                    (
                        data[j] -
                        128
                    ) /
                    128;


                count++;
            }


            const average =
                count >
                0
                    ? sum /
                        count
                    : 0;


            const normalized =
                i /
                (
                    pointCount -
                    1
                );


            const envelope =
                Math.sin(
                    Math.PI *
                    normalized
                );


            points.push({
                x:
                    normalized *
                    width,

                y:
                    middle +
                    average *
                        height *
                        0.38 *
                        envelope,
            });
        }


        drawCurve(
            context,
            points,
            {
                strokeStyle:
                    "rgba(34, 211, 197, 0.16)",

                lineWidth:
                    7,

                shadowBlur:
                    22,

                shadowColor:
                    "rgba(34, 211, 197, 0.34)",
            }
        );


        drawCurve(
            context,
            points,
            {
                strokeStyle:
                    gradient,

                lineWidth:
                    2,

                shadowBlur:
                    14,

                shadowColor:
                    "rgba(34, 211, 197, 0.70)",
            }
        );


        const mirrored =
            points.map(
                (point) => ({
                    x:
                        point.x,

                    y:
                        middle -
                        (
                            point.y -
                            middle
                        ) *
                            0.86,
                })
            );


        drawCurve(
            context,
            mirrored,
            {
                strokeStyle:
                    "rgba(45, 212, 191, 0.27)",

                lineWidth:
                    1.3,

                shadowBlur:
                    8,

                shadowColor:
                    "rgba(34, 211, 197, 0.30)",
            }
        );


        animationRef.current =
            requestAnimationFrame(
                drawAnalyserWave
            );
    };


    // =========================================================
    // CREATE AUDIO CONTEXT
    // =========================================================

    const createAudioContext =
        () => {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContext) {
            throw new Error(
                "Web Audio API is not supported."
            );
        }


        return new AudioContext();
    };


    // =========================================================
    // CONNECT MICROPHONE ANALYSER
    // =========================================================

    const connectMicrophoneAnalyser =
        (
            stream
        ) => {

            clearAudioGraph();


            const audioContext =
                createAudioContext();


            const analyser =
                audioContext
                    .createAnalyser();


            analyser.fftSize =
                2048;


            analyser.smoothingTimeConstant =
                0.82;


            const source =
                audioContext
                    .createMediaStreamSource(
                        stream
                    );


            source.connect(
                analyser
            );


            audioContextRef.current =
                audioContext;


            analyserRef.current =
                analyser;


            sourceNodeRef.current =
                source;


            drawAnalyserWave();
        };


    // =========================================================
    // CHOOSE RECORDING MIME TYPE
    // =========================================================

    const getRecorderMimeType =
        () => {

        if (
            typeof MediaRecorder ===
            "undefined"
        ) {
            return "";
        }


        const types = [
            "audio/webm;codecs=opus",
            "audio/webm",
            "audio/ogg;codecs=opus",
            "audio/ogg",
        ];


        return (
            types.find(
                (type) =>
                    MediaRecorder
                        .isTypeSupported(
                            type
                        )
            ) ||
            ""
        );
    };


    // =========================================================
    // SAVE AUDIO TO TARGET
    // =========================================================

    const saveAudioToTarget = (
        target,
        audioData
    ) => {

        if (
            target ===
            "audible"
        ) {

            revokeAudioUrl(
                audibleAudioRef.current
            );


            setAudibleAudio(
                audioData
            );

        } else {

            revokeAudioUrl(
                secretAudioRef.current
            );


            setSecretAudio(
                audioData
            );
        }


        // Any input change invalidates
        // the previous encoded result.

        revokeAudioUrl(
            encodedAudioRef.current
        );


        setEncodedAudio(
            null
        );
    };


    // =========================================================
    // START RECORDING
    // =========================================================

    const startRecording =
        async (
            target
        ) => {

            if (
                recordingState !==
                "idle"
            ) {
                return;
            }


            if (
                !navigator
                    .mediaDevices
                    ?.getUserMedia
            ) {

                alert(
                    "Microphone recording is not supported in this browser."
                );

                return;
            }


            if (
                typeof MediaRecorder ===
                "undefined"
            ) {

                alert(
                    "MediaRecorder is not supported in this browser."
                );

                return;
            }


            try {

                if (
                    audioRef.current
                ) {
                    audioRef.current
                        .pause();
                }


                setIsPlaying(
                    false
                );


                clearAudioGraph();


                const stream =
                    await navigator
                        .mediaDevices
                        .getUserMedia({
                            audio: {
                                echoCancellation:
                                    true,

                                noiseSuppression:
                                    true,

                                autoGainControl:
                                    true,
                            },
                        });


                streamRef.current =
                    stream;


                chunksRef.current =
                    [];


                const mimeType =
                    getRecorderMimeType();


                const recorder =
                    mimeType
                        ? new MediaRecorder(
                            stream,
                            {
                                mimeType,
                            }
                        )
                        : new MediaRecorder(
                            stream
                        );


                mediaRecorderRef.current =
                    recorder;


                setActiveInput(
                    target
                );


                setRecordingTarget(
                    target
                );


                setRecordingState(
                    "recording"
                );


                setElapsedSeconds(
                    0
                );


                connectMicrophoneAnalyser(
                    stream
                );


                recorder.ondataavailable =
                    (
                        event
                    ) => {

                        if (
                            event.data &&
                            event.data.size >
                                0
                        ) {

                            chunksRef.current
                                .push(
                                    event.data
                                );
                        }
                    };


                recorder.onerror =
                    (
                        event
                    ) => {

                        console.error(
                            "Recorder error:",
                            event
                        );


                        stopTimer();


                        stopStream();


                        clearAudioGraph();


                        setRecordingTarget(
                            null
                        );


                        setRecordingState(
                            "idle"
                        );


                        startIdleWave();
                    };


                recorder.onstop =
                    () => {

                        const type =
                            recorder.mimeType ||
                            mimeType ||
                            "audio/webm";


                        const blob =
                            new Blob(
                                chunksRef.current,
                                {
                                    type,
                                }
                            );


                        if (
                            blob.size >
                            0
                        ) {

                            const url =
                                URL.createObjectURL(
                                    blob
                                );


                            saveAudioToTarget(
                                target,
                                {
                                    blob,

                                    url,

                                    name:
                                        target ===
                                        "audible"
                                            ? "Recorded audible audio"
                                            : "Recorded secret audio",

                                    source:
                                        "recording",
                                }
                            );
                        }


                        chunksRef.current =
                            [];


                        mediaRecorderRef.current =
                            null;


                        stopTimer();


                        stopStream();


                        clearAudioGraph();


                        setRecordingTarget(
                            null
                        );


                        setRecordingState(
                            "idle"
                        );


                        startIdleWave();
                    };


                recorder.start(
                    250
                );


                startTimer();

            } catch (
                error
            ) {

                console.error(
                    "Recording error:",
                    error
                );


                stopTimer();


                stopStream();


                clearAudioGraph();


                setRecordingTarget(
                    null
                );


                setRecordingState(
                    "idle"
                );


                if (
                    error?.name ===
                    "NotAllowedError"
                ) {

                    alert(
                        "Microphone permission was denied. Please allow microphone access and try again."
                    );

                } else {

                    alert(
                        "Could not start microphone recording."
                    );
                }


                startIdleWave();
            }
        };


    // =========================================================
    // PAUSE / RESUME RECORDING
    // =========================================================

    const togglePauseRecording =
        () => {

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


                setRecordingState(
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


                setRecordingState(
                    "recording"
                );


                startTimer();
            }
        };


    // =========================================================
    // STOP RECORDING
    // =========================================================

    const stopRecording =
        () => {

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
    // DISCARD RECORDING
    // =========================================================

    const discardRecording =
        () => {

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


            mediaRecorderRef.current =
                null;


            chunksRef.current =
                [];


            stopTimer();


            stopStream();


            clearAudioGraph();


            setRecordingTarget(
                null
            );


            setRecordingState(
                "idle"
            );


            setElapsedSeconds(
                0
            );


            startIdleWave();
        };


    // =========================================================
    // FILE UPLOAD
    // =========================================================

    const handleFileUpload =
        (
            event,
            target
        ) => {

            const file =
                event.target
                    .files?.[0];


            event.target.value =
                "";


            if (!file) {
                return;
            }


            if (
                !file.type
                    .startsWith(
                        "audio/"
                    )
            ) {

                alert(
                    "Please choose an audio file."
                );

                return;
            }


            const url =
                URL.createObjectURL(
                    file
                );


            saveAudioToTarget(
                target,
                {
                    blob:
                        file,

                    file,

                    url,

                    name:
                        file.name,

                    source:
                        "upload",
                }
            );


            setActiveInput(
                target
            );


            if (
                audioRef.current
            ) {
                audioRef.current
                    .pause();
            }


            setIsPlaying(
                false
            );


            clearAudioGraph();


            startIdleWave();
        };


    // =========================================================
    // REMOVE AUDIO
    // =========================================================

    const removeAudio = (
        target
    ) => {

        if (
            recordingState !==
            "idle"
        ) {
            return;
        }


        if (
            audioRef.current
        ) {
            audioRef.current
                .pause();
        }


        setIsPlaying(
            false
        );


        clearAudioGraph();


        if (
            target ===
            "audible"
        ) {

            revokeAudioUrl(
                audibleAudioRef.current
            );


            setAudibleAudio(
                null
            );

        } else {

            revokeAudioUrl(
                secretAudioRef.current
            );


            setSecretAudio(
                null
            );
        }


        revokeAudioUrl(
            encodedAudioRef.current
        );


        setEncodedAudio(
            null
        );


        startIdleWave();
    };


    // =========================================================
    // CONNECT PLAYBACK ANALYSER
    // =========================================================

    const connectPlaybackAnalyser =
        () => {

            const audio =
                audioRef.current;


            if (!audio) {
                return;
            }


            clearAudioGraph();


            const audioContext =
                createAudioContext();


            const analyser =
                audioContext
                    .createAnalyser();


            analyser.fftSize =
                2048;


            analyser.smoothingTimeConstant =
                0.82;


            const source =
                audioContext
                    .createMediaElementSource(
                        audio
                    );


            source.connect(
                analyser
            );


            analyser.connect(
                audioContext.destination
            );


            audioContextRef.current =
                audioContext;


            analyserRef.current =
                analyser;


            sourceNodeRef.current =
                source;


            drawAnalyserWave();
        };


    // =========================================================
    // PLAY / PAUSE INPUT AUDIO
    // =========================================================

    const togglePlayback =
        async () => {

            if (
                !currentAudio
            ) {
                return;
            }


            const audio =
                audioRef.current;


            if (!audio) {
                return;
            }


            if (
                isPlaying
            ) {

                audio.pause();


                setIsPlaying(
                    false
                );


                clearAudioGraph();


                startIdleWave();


                return;
            }


            try {

                connectPlaybackAnalyser();


                if (
                    audioContextRef.current
                        ?.state ===
                    "suspended"
                ) {

                    await audioContextRef.current
                        .resume();
                }


                await audio.play();


                setIsPlaying(
                    true
                );

            } catch (
                error
            ) {

                console.error(
                    "Playback failed:",
                    error
                );


                clearAudioGraph();


                startIdleWave();
            }
        };


    // =========================================================
    // SELECT INPUT
    // =========================================================

    const selectInput = (
        target
    ) => {

        if (
            recordingState !==
            "idle"
        ) {
            return;
        }


        if (
            activeInput ===
            target
        ) {
            return;
        }


        if (
            audioRef.current
        ) {
            audioRef.current
                .pause();
        }


        setIsPlaying(
            false
        );


        clearAudioGraph();


        setActiveInput(
            target
        );


        startIdleWave();
    };


    // =========================================================
    // ENCODE
    // =========================================================

    const handleEncode =
        async () => {

            if (
                !audibleAudio ||
                !secretAudio
            ) {

                alert(
                    "Add both the audible audio and secret audio first."
                );

                return;
            }


            if (
                isEncoding
            ) {
                return;
            }


            try {

                if (
                    audioRef.current
                ) {
                    audioRef.current
                        .pause();
                }


                setIsPlaying(
                    false
                );


                clearAudioGraph();


                startIdleWave();


                setIsEncoding(
                    true
                );


                revokeAudioUrl(
                    encodedAudioRef.current
                );


                setEncodedAudio(
                    null
                );


                // =================================================
                // DSP
                //
                // Audible signal:
                // low-passed below normal hearing range.
                //
                // Secret:
                // low-passed voice -> modulated around 30 kHz.
                //
                // Output:
                // 96 kHz audio containing both.
                // =================================================

                const result =
                    await encodeSecretAudio(
                        audibleAudio.blob,
                        secretAudio.blob,
                        {
                            hiddenLevel:
                                0.30,

                            carrierFrequency:
                                30000,

                            secretBandwidth:
                                6000,
                        }
                    );


                // =================================================
                // CREATE PCM WAV
                // =================================================

                const wavBlob =
                    encodeWav({
                        channels:
                            result.channels,

                        sampleRate:
                            result.sampleRate,
                    });


                const url =
                    URL.createObjectURL(
                        wavBlob
                    );


                setEncodedAudio({
                    blob:
                        wavBlob,

                    url,

                    duration:
                        result.duration,

                    sampleRate:
                        result.sampleRate,

                    carrierFrequency:
                        result.carrierFrequency,

                    secretBandwidth:
                        result.secretBandwidth,

                    hiddenLevel:
                        result.hiddenLevel,
                });


            } catch (
                error
            ) {

                console.error(
                    "Encoding failed:",
                    error
                );


                alert(
                    "Could not encode the secret audio."
                );

            } finally {

                setIsEncoding(
                    false
                );
            }
        };


    // =========================================================
    // EXPORT ENCODED WAV
    // =========================================================

    const exportEncodedAudio =
        () => {

            const result =
                encodedAudioRef.current;


            if (
                !result?.url
            ) {
                return;
            }


            const anchor =
                document.createElement(
                    "a"
                );


            anchor.href =
                result.url;


            anchor.download =
                `audiverse-secret-${Date.now()}.wav`;


            document.body.appendChild(
                anchor
            );


            anchor.click();


            anchor.remove();
        };


    // =========================================================
    // START OVER
    // =========================================================

    const resetEncoder = () => {

        if (
            audioRef.current
        ) {
            audioRef.current
                .pause();
        }


        setIsPlaying(
            false
        );


        clearAudioGraph();


        revokeAudioUrl(
            audibleAudioRef.current
        );


        revokeAudioUrl(
            secretAudioRef.current
        );


        revokeAudioUrl(
            encodedAudioRef.current
        );


        setAudibleAudio(
            null
        );


        setSecretAudio(
            null
        );


        setEncodedAudio(
            null
        );


        setActiveInput(
            "audible"
        );


        setElapsedSeconds(
            0
        );


        startIdleWave();
    };


    // =========================================================
    // CLOSE MODAL
    // =========================================================

    const handleClose = () => {

        if (
            recordingState ===
                "recording" ||
            recordingState ===
                "paused"
        ) {
            discardRecording();
        }


        if (
            audioRef.current
        ) {
            audioRef.current
                .pause();
        }


        setIsPlaying(
            false
        );


        stopTimer();


        stopStream();


        clearAudioGraph();


        onClose?.();
    };


    // =========================================================
    // ESCAPE KEY
    // =========================================================

    useEffect(() => {

        const handleKeyDown =
            (
                event
            ) => {

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

    }, [
        recordingState,
    ]);


    // =========================================================
    // INITIAL WAVE
    // =========================================================

    useEffect(() => {

        startIdleWave();


        const handleResize =
            () => {

                if (
                    !analyserRef.current
                ) {
                    startIdleWave();
                }
            };


        window.addEventListener(
            "resize",
            handleResize
        );


        return () => {

            window.removeEventListener(
                "resize",
                handleResize
            );


            if (
                animationRef.current
            ) {

                cancelAnimationFrame(
                    animationRef.current
                );
            }
        };

    }, []);


    // =========================================================
    // FINAL CLEANUP
    // =========================================================

    useEffect(() => {

        return () => {

            stopTimer();


            stopStream();


            clearAudioGraph();


            revokeAudioUrl(
                audibleAudioRef.current
            );


            revokeAudioUrl(
                secretAudioRef.current
            );


            revokeAudioUrl(
                encodedAudioRef.current
            );
        };

    }, []);


    // =========================================================
    // UI
    // =========================================================

    return createPortal(
        <div
            className="
                fixed
                inset-0

                z-[9999]

                overflow-y-auto

                bg-black/80

                px-5
                py-8

                backdrop-blur-md
            "
        >
            <div
                className="
                    mx-auto

                    flex
                    min-h-full

                    w-full
                    max-w-7xl

                    items-center
                    justify-center
                "
            >
                <div
                    className="
                        relative

                        w-full

                        overflow-hidden

                        rounded-[30px]

                        border
                        border-white/10

                        bg-[#0a0f0e]/95

                        shadow-[0_40px_140px_rgba(0,0,0,0.85)]
                    "
                >

                    {/* =====================================
                        BACKGROUND TEAL GLOW
                    ===================================== */}

                    <div
                        className="
                            pointer-events-none

                            absolute
                            left-1/2
                            top-[-180px]

                            h-[420px]
                            w-[700px]

                            -translate-x-1/2

                            rounded-full

                            bg-[rgba(25,211,197,0.10)]

                            blur-[130px]
                        "
                    />


                    {/* =====================================
                        CLOSE
                    ===================================== */}

                    <button
                        type="button"

                        onClick={
                            handleClose
                        }

                        className="
                            absolute
                            right-6
                            top-6

                            z-30

                            flex
                            h-11
                            w-11

                            cursor-pointer

                            items-center
                            justify-center

                            rounded-full

                            border
                            border-white/10

                            bg-black/30

                            text-gray-400

                            backdrop-blur-xl

                            transition

                            hover:bg-white/10
                            hover:text-white
                        "
                    >
                        <X
                            size={19}
                        />
                    </button>


                    {/* =====================================
                        HEADER
                    ===================================== */}

                    <div
                        className="
                            relative
                            z-10

                            border-b
                            border-white/10

                            px-8
                            pb-7
                            pt-8

                            sm:px-10
                        "
                    >
                        <div
                            className="
                                flex
                                items-center
                                gap-4
                            "
                        >
                            <div
                                className="
                                    flex
                                    h-12
                                    w-12

                                    items-center
                                    justify-center

                                    rounded-2xl

                                    border
                                    border-[var(--accent)]/20

                                    bg-[var(--accent-soft)]

                                    text-[var(--accent)]
                                "
                            >
                                <LockKeyhole
                                    size={22}
                                />
                            </div>


                            <div>
                                <p
                                    className="
                                        text-xs
                                        font-semibold

                                        uppercase
                                        tracking-[0.22em]

                                        text-[var(--accent)]
                                    "
                                >
                                    Encoder
                                </p>


                                <h2
                                    className="
                                        mt-1

                                        text-2xl
                                        font-semibold

                                        text-white

                                        sm:text-3xl
                                    "
                                >
                                    Spill Your Secret
                                </h2>
                            </div>
                        </div>


                        <p
                            className="
                                mt-4

                                max-w-2xl

                                text-sm
                                leading-6

                                text-gray-400
                            "
                        >
                            Choose what everyone
                            should hear, then add
                            the secret audio you
                            want to hide inside it.
                        </p>
                    </div>


                    {/* =====================================
                        BODY
                    ===================================== */}

                    <div
                        className="
                            relative
                            z-10

                            px-8
                            py-8

                            sm:px-10
                        "
                    >

                        {/* =================================
                            SOURCE CARDS
                        ================================= */}

                        <div
                            className="
                                grid
                                gap-4

                                lg:grid-cols-2
                            "
                        >

                            {/* =============================
                                AUDIBLE AUDIO
                            ============================= */}

                            <button
                                type="button"

                                disabled={
                                    recordingState !==
                                    "idle"
                                }

                                onClick={() =>
                                    selectInput(
                                        "audible"
                                    )
                                }

                                className={`
                                    relative

                                    rounded-2xl

                                    border

                                    p-5

                                    text-left

                                    transition-all

                                    disabled:cursor-not-allowed

                                    ${
                                        activeInput ===
                                        "audible"
                                            ? `
                                                border-[var(--accent)]/40
                                                bg-[var(--accent-soft)]
                                            `
                                            : `
                                                border-white/10
                                                bg-white/[0.025]

                                                hover:border-white/20
                                                hover:bg-white/[0.04]
                                            `
                                    }
                                `}
                            >
                                <div
                                    className="
                                        flex

                                        items-start
                                        justify-between

                                        gap-4
                                    "
                                >
                                    <div>
                                        <p
                                            className="
                                                text-xs
                                                font-semibold

                                                uppercase
                                                tracking-[0.18em]

                                                text-gray-500
                                            "
                                        >
                                            Step 1
                                        </p>


                                        <h3
                                            className="
                                                mt-1

                                                text-lg
                                                font-semibold

                                                text-white
                                            "
                                        >
                                            What everyone hears
                                        </h3>


                                        <p
                                            className="
                                                mt-1

                                                text-sm

                                                text-gray-500
                                            "
                                        >
                                            Your normal,
                                            audible audio.
                                        </p>
                                    </div>


                                    {audibleAudio && (
                                        <div
                                            className="
                                                flex
                                                h-8
                                                w-8

                                                shrink-0

                                                items-center
                                                justify-center

                                                rounded-full

                                                bg-[var(--accent)]

                                                text-black
                                            "
                                        >
                                            <Check
                                                size={16}
                                            />
                                        </div>
                                    )}
                                </div>


                                {audibleAudio && (
                                    <p
                                        className="
                                            mt-4

                                            truncate

                                            text-sm

                                            text-[var(--accent)]
                                        "
                                    >
                                        {audibleAudio.name}
                                    </p>
                                )}
                            </button>


                            {/* =============================
                                SECRET AUDIO
                            ============================= */}

                            <button
                                type="button"

                                disabled={
                                    recordingState !==
                                    "idle"
                                }

                                onClick={() =>
                                    selectInput(
                                        "secret"
                                    )
                                }

                                className={`
                                    relative

                                    rounded-2xl

                                    border

                                    p-5

                                    text-left

                                    transition-all

                                    disabled:cursor-not-allowed

                                    ${
                                        activeInput ===
                                        "secret"
                                            ? `
                                                border-[var(--accent)]/40
                                                bg-[var(--accent-soft)]
                                            `
                                            : `
                                                border-white/10
                                                bg-white/[0.025]

                                                hover:border-white/20
                                                hover:bg-white/[0.04]
                                            `
                                    }
                                `}
                            >
                                <div
                                    className="
                                        flex

                                        items-start
                                        justify-between

                                        gap-4
                                    "
                                >
                                    <div>
                                        <p
                                            className="
                                                text-xs
                                                font-semibold

                                                uppercase
                                                tracking-[0.18em]

                                                text-gray-500
                                            "
                                        >
                                            Step 2
                                        </p>


                                        <h3
                                            className="
                                                mt-1

                                                text-lg
                                                font-semibold

                                                text-white
                                            "
                                        >
                                            What you're really saying
                                        </h3>


                                        <p
                                            className="
                                                mt-1

                                                text-sm

                                                text-gray-500
                                            "
                                        >
                                            The message that
                                            will be hidden.
                                        </p>
                                    </div>


                                    {secretAudio && (
                                        <div
                                            className="
                                                flex
                                                h-8
                                                w-8

                                                shrink-0

                                                items-center
                                                justify-center

                                                rounded-full

                                                bg-[var(--accent)]

                                                text-black
                                            "
                                        >
                                            <Check
                                                size={16}
                                            />
                                        </div>
                                    )}
                                </div>


                                {secretAudio && (
                                    <p
                                        className="
                                            mt-4

                                            truncate

                                            text-sm

                                            text-[var(--accent)]
                                        "
                                    >
                                        {secretAudio.name}
                                    </p>
                                )}
                            </button>
                        </div>


                        {/* =================================
                            WAVEFORM PANEL
                        ================================= */}

                        <div
                            className="
                                relative

                                mt-6

                                overflow-hidden

                                rounded-[26px]

                                border
                                border-white/10

                                bg-black/25

                                px-6
                                py-7
                            "
                        >

                            {/* glow */}

                            <div
                                className="
                                    pointer-events-none

                                    absolute
                                    left-1/2
                                    top-1/2

                                    h-[180px]
                                    w-[650px]

                                    -translate-x-1/2
                                    -translate-y-1/2

                                    rounded-full

                                    bg-[rgba(25,211,197,0.07)]

                                    blur-[90px]
                                "
                            />


                            {/* title */}

                            <div
                                className="
                                    relative
                                    z-10

                                    text-center
                                "
                            >
                                <p
                                    className="
                                        text-xs
                                        font-semibold

                                        uppercase
                                        tracking-[0.2em]

                                        text-gray-500
                                    "
                                >
                                    {activeInput ===
                                    "audible"
                                        ? "Audible Audio"
                                        : "Secret Audio"}
                                </p>


                                <h3
                                    className="
                                        mt-2

                                        text-xl
                                        font-semibold

                                        text-white
                                    "
                                >
                                    {activeInput ===
                                    "audible"
                                        ? "What everyone hears"
                                        : "What you're really saying"}
                                </h3>
                            </div>


                            {/* =============================
                                ANIMATED WAVEFORM
                            ============================= */}

                            <div
                                className="
                                    relative
                                    z-10

                                    mt-4

                                    h-[150px]
                                    w-full
                                "
                            >
                                <canvas
                                    ref={
                                        canvasRef
                                    }

                                    className="
                                        h-full
                                        w-full
                                    "
                                />
                            </div>


                            {/* =============================
                                RECORDING TIMER
                            ============================= */}

                            {recordingTarget ===
                                activeInput &&
                                (
                                    recordingState ===
                                        "recording" ||
                                    recordingState ===
                                        "paused"
                                ) && (
                                <div
                                    className="
                                        relative
                                        z-10

                                        text-center
                                    "
                                >
                                    <p
                                        className="
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
                                    </p>


                                    <div
                                        className="
                                            mt-2

                                            flex
                                            items-center
                                            justify-center

                                            gap-2

                                            text-xs

                                            uppercase
                                            tracking-[0.18em]

                                            text-gray-500
                                        "
                                    >
                                        <span
                                            className={`
                                                h-2
                                                w-2

                                                rounded-full

                                                ${
                                                    recordingState ===
                                                    "recording"
                                                        ? `
                                                            animate-pulse
                                                            bg-red-500
                                                        `
                                                        : `
                                                            bg-yellow-400
                                                        `
                                                }
                                            `}
                                        />


                                        {recordingState ===
                                        "recording"
                                            ? "Recording"
                                            : "Paused"}
                                    </div>
                                </div>
                            )}


                            {/* =============================
                                NORMAL INPUT CONTROLS
                            ============================= */}

                            {!(
                                recordingTarget ===
                                    activeInput &&
                                (
                                    recordingState ===
                                        "recording" ||
                                    recordingState ===
                                        "paused"
                                )
                            ) && (
                                <div
                                    className="
                                        relative
                                        z-10

                                        mt-5

                                        flex
                                        flex-wrap

                                        items-center
                                        justify-center

                                        gap-3
                                    "
                                >

                                    {!currentAudio && (
                                        <>
                                            <button
                                                type="button"

                                                onClick={() =>
                                                    startRecording(
                                                        activeInput
                                                    )
                                                }

                                                className="
                                                    flex
                                                    items-center
                                                    gap-2

                                                    rounded-full

                                                    bg-[var(--accent)]

                                                    px-6
                                                    py-3

                                                    text-sm
                                                    font-semibold

                                                    text-black

                                                    transition

                                                    hover:bg-[var(--accent-hover)]

                                                    active:scale-[0.98]
                                                "
                                            >
                                                <Mic
                                                    size={17}
                                                />

                                                Record
                                            </button>


                                            <button
                                                type="button"

                                                onClick={() => {

                                                    if (
                                                        activeInput ===
                                                        "audible"
                                                    ) {

                                                        audibleInputRef.current
                                                            ?.click();

                                                    } else {

                                                        secretInputRef.current
                                                            ?.click();
                                                    }
                                                }}

                                                className="
                                                    flex
                                                    items-center
                                                    gap-2

                                                    rounded-full

                                                    border
                                                    border-white/10

                                                    bg-white/[0.04]

                                                    px-6
                                                    py-3

                                                    text-sm
                                                    font-semibold

                                                    text-gray-200

                                                    transition

                                                    hover:bg-white/10
                                                    hover:text-white
                                                "
                                            >
                                                <Upload
                                                    size={17}
                                                />

                                                Upload
                                            </button>
                                        </>
                                    )}


                                    {currentAudio && (
                                        <>
                                            <button
                                                type="button"

                                                onClick={
                                                    togglePlayback
                                                }

                                                className="
                                                    flex
                                                    h-12
                                                    w-12

                                                    cursor-pointer

                                                    items-center
                                                    justify-center

                                                    rounded-full

                                                    bg-[var(--accent)]

                                                    text-black

                                                    transition

                                                    hover:bg-[var(--accent-hover)]

                                                    active:scale-95
                                                "
                                            >
                                                {isPlaying
                                                    ? (
                                                        <Pause
                                                            size={20}
                                                        />
                                                    )
                                                    : (
                                                        <Play
                                                            size={20}
                                                            fill="currentColor"
                                                        />
                                                    )}
                                            </button>


                                            <button
                                                type="button"

                                                onClick={() =>
                                                    removeAudio(
                                                        activeInput
                                                    )
                                                }

                                                className="
                                                    flex
                                                    items-center
                                                    gap-2

                                                    rounded-full

                                                    border
                                                    border-white/10

                                                    bg-white/[0.04]

                                                    px-5
                                                    py-3

                                                    text-sm

                                                    text-gray-300

                                                    transition

                                                    hover:bg-red-500/10
                                                    hover:text-red-400
                                                "
                                            >
                                                <Trash2
                                                    size={16}
                                                />

                                                Remove
                                            </button>


                                            <button
                                                type="button"

                                                onClick={() =>
                                                    startRecording(
                                                        activeInput
                                                    )
                                                }

                                                className="
                                                    flex
                                                    items-center
                                                    gap-2

                                                    rounded-full

                                                    border
                                                    border-white/10

                                                    bg-white/[0.04]

                                                    px-5
                                                    py-3

                                                    text-sm

                                                    text-gray-300

                                                    transition

                                                    hover:bg-white/10
                                                    hover:text-white
                                                "
                                            >
                                                <RotateCcw
                                                    size={16}
                                                />

                                                Record Again
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}


                            {/* =============================
                                RECORDING CONTROLS
                            ============================= */}

                            {recordingTarget ===
                                activeInput &&
                                (
                                    recordingState ===
                                        "recording" ||
                                    recordingState ===
                                        "paused"
                                ) && (
                                <div
                                    className="
                                        relative
                                        z-10

                                        mt-6

                                        flex
                                        items-center
                                        justify-center

                                        gap-8
                                    "
                                >

                                    {/* DISCARD */}

                                    <button
                                        type="button"

                                        onClick={
                                            discardRecording
                                        }

                                        className="
                                            group

                                            flex
                                            flex-col

                                            items-center
                                            gap-2

                                            text-gray-500

                                            transition

                                            hover:text-red-400
                                        "
                                    >
                                        <div
                                            className="
                                                flex
                                                h-12
                                                w-12

                                                items-center
                                                justify-center

                                                rounded-full

                                                border
                                                border-white/10

                                                bg-white/[0.04]

                                                transition

                                                group-hover:bg-red-500/10
                                            "
                                        >
                                            <X
                                                size={19}
                                            />
                                        </div>


                                        <span
                                            className="
                                                text-xs
                                            "
                                        >
                                            Discard
                                        </span>
                                    </button>


                                    {/* PAUSE / RESUME */}

                                    <button
                                        type="button"

                                        onClick={
                                            togglePauseRecording
                                        }

                                        className="
                                            group

                                            flex
                                            flex-col

                                            items-center
                                            gap-2

                                            text-gray-300
                                        "
                                    >
                                        <div
                                            className="
                                                flex
                                                h-16
                                                w-16

                                                items-center
                                                justify-center

                                                rounded-full

                                                bg-[var(--accent)]

                                                text-black

                                                shadow-[0_0_40px_rgba(25,211,197,0.28)]

                                                transition

                                                group-hover:scale-105
                                            "
                                        >
                                            {recordingState ===
                                            "recording"
                                                ? (
                                                    <Pause
                                                        size={25}
                                                        fill="currentColor"
                                                    />
                                                )
                                                : (
                                                    <Play
                                                        size={25}
                                                        fill="currentColor"
                                                    />
                                                )}
                                        </div>


                                        <span
                                            className="
                                                text-xs
                                            "
                                        >
                                            {recordingState ===
                                            "recording"
                                                ? "Pause"
                                                : "Resume"}
                                        </span>
                                    </button>


                                    {/* FINISH */}

                                    <button
                                        type="button"

                                        onClick={
                                            stopRecording
                                        }

                                        className="
                                            group

                                            flex
                                            flex-col

                                            items-center
                                            gap-2

                                            text-gray-500

                                            transition

                                            hover:text-[var(--accent)]
                                        "
                                    >
                                        <div
                                            className="
                                                flex
                                                h-12
                                                w-12

                                                items-center
                                                justify-center

                                                rounded-full

                                                border
                                                border-white/10

                                                bg-white/[0.04]

                                                transition

                                                group-hover:bg-[var(--accent-soft)]
                                            "
                                        >
                                            <Square
                                                size={17}
                                                fill="currentColor"
                                            />
                                        </div>


                                        <span
                                            className="
                                                text-xs
                                            "
                                        >
                                            Finish
                                        </span>
                                    </button>

                                </div>
                            )}

                        </div>


                        {/* =================================
                            HIDDEN FILE INPUTS
                        ================================= */}

                        <input
                            ref={
                                audibleInputRef
                            }

                            type="file"

                            accept="audio/*"

                            className="hidden"

                            onChange={(
                                event
                            ) =>
                                handleFileUpload(
                                    event,
                                    "audible"
                                )
                            }
                        />


                        <input
                            ref={
                                secretInputRef
                            }

                            type="file"

                            accept="audio/*"

                            className="hidden"

                            onChange={(
                                event
                            ) =>
                                handleFileUpload(
                                    event,
                                    "secret"
                                )
                            }
                        />


                        {/* =================================
                            INPUT PLAYBACK ELEMENT
                        ================================= */}

                        {currentAudio && (
                            <audio
                                key={
                                    currentAudio.url
                                }

                                ref={
                                    audioRef
                                }

                                src={
                                    currentAudio.url
                                }

                                preload="metadata"

                                onEnded={() => {

                                    setIsPlaying(
                                        false
                                    );


                                    clearAudioGraph();


                                    startIdleWave();
                                }}

                                className="
                                    hidden
                                "
                            />
                        )}


                        {/* =================================
                            ENCODER STATUS + BUTTON
                        ================================= */}

                        <div
                            className="
                                mt-7

                                flex
                                flex-col

                                items-center
                                justify-between

                                gap-5

                                border-t
                                border-white/10

                                pt-6

                                sm:flex-row
                            "
                        >
                            <div
                                className="
                                    flex
                                    flex-wrap

                                    items-center
                                    gap-4

                                    text-sm

                                    text-gray-500
                                "
                            >
                                <span
                                    className={
                                        audibleAudio
                                            ? "text-[var(--accent)]"
                                            : ""
                                    }
                                >
                                    {audibleAudio
                                        ? "✓ Audible ready"
                                        : "○ Add audible audio"}
                                </span>


                                <span
                                    className={
                                        secretAudio
                                            ? "text-[var(--accent)]"
                                            : ""
                                    }
                                >
                                    {secretAudio
                                        ? "✓ Secret ready"
                                        : "○ Add secret audio"}
                                </span>
                            </div>


                            <button
                                type="button"

                                onClick={
                                    handleEncode
                                }

                                disabled={
                                    !audibleAudio ||
                                    !secretAudio ||
                                    isEncoding ||
                                    recordingState !==
                                        "idle"
                                }

                                className="
                                    flex
                                    min-w-[175px]

                                    items-center
                                    justify-center
                                    gap-2

                                    rounded-full

                                    bg-[var(--accent)]

                                    px-7
                                    py-3

                                    text-sm
                                    font-semibold

                                    text-black

                                    transition-all

                                    hover:bg-[var(--accent-hover)]

                                    active:scale-[0.98]

                                    disabled:cursor-not-allowed
                                    disabled:opacity-30
                                "
                            >
                                {isEncoding
                                    ? (
                                        <>
                                            <Sparkles
                                                size={17}

                                                className="
                                                    animate-pulse
                                                "
                                            />

                                            Hiding Secret...
                                        </>
                                    )
                                    : (
                                        <>
                                            <LockKeyhole
                                                size={17}
                                            />

                                            Encode Secret
                                        </>
                                    )}
                            </button>
                        </div>


                        {/* =================================
                            ENCODED RESULT
                        ================================= */}

                        {encodedAudio && (
                            <div
                                className="
                                    relative

                                    mt-7

                                    overflow-hidden

                                    rounded-[26px]

                                    border
                                    border-[var(--accent)]/20

                                    bg-[var(--accent-soft)]

                                    p-6

                                    sm:p-7
                                "
                            >

                                {/* RESULT GLOW */}

                                <div
                                    className="
                                        pointer-events-none

                                        absolute
                                        right-[-80px]
                                        top-[-100px]

                                        h-[260px]
                                        w-[320px]

                                        rounded-full

                                        bg-[rgba(25,211,197,0.10)]

                                        blur-[90px]
                                    "
                                />


                                <div
                                    className="
                                        relative
                                        z-10

                                        flex
                                        flex-col

                                        gap-6

                                        lg:flex-row
                                        lg:items-center
                                        lg:justify-between
                                    "
                                >
                                    <div>
                                        <div
                                            className="
                                                mb-3

                                                flex
                                                items-center
                                                gap-2
                                            "
                                        >
                                            <div
                                                className="
                                                    flex
                                                    h-8
                                                    w-8

                                                    items-center
                                                    justify-center

                                                    rounded-full

                                                    bg-[var(--accent)]

                                                    text-black
                                                "
                                            >
                                                <Check
                                                    size={16}
                                                />
                                            </div>


                                            <p
                                                className="
                                                    text-xs
                                                    font-semibold

                                                    uppercase
                                                    tracking-[0.2em]

                                                    text-[var(--accent)]
                                                "
                                            >
                                                Secret Spilled
                                            </p>
                                        </div>


                                        <h3
                                            className="
                                                text-xl
                                                font-semibold

                                                text-white
                                            "
                                        >
                                            Your encoded audio
                                            is ready
                                        </h3>


                                        <p
                                            className="
                                                mt-2

                                                max-w-xl

                                                text-sm
                                                leading-6

                                                text-gray-400
                                            "
                                        >
                                            The normal audio remains
                                            audible while your secret
                                            message is carried in the
                                            high-frequency channel.
                                        </p>


                                        <div
                                            className="
                                                mt-3

                                                flex
                                                flex-wrap

                                                gap-x-5
                                                gap-y-1

                                                text-xs
                                                text-gray-500
                                            "
                                        >
                                            <span>
                                                96 kHz PCM WAV
                                            </span>

                                            <span>
                                                Carrier: 30 kHz
                                            </span>

                                            <span>
                                                Secret bandwidth: 6 kHz
                                            </span>
                                        </div>
                                    </div>


                                    <div
                                        className="
                                            flex
                                            min-w-0
                                            flex-col

                                            gap-3

                                            sm:flex-row
                                            sm:items-center
                                        "
                                    >
                                        <audio
                                            src={
                                                encodedAudio.url
                                            }

                                            controls

                                            preload="metadata"

                                            className="
                                                w-full

                                                sm:w-[330px]
                                            "
                                        />


                                        <button
                                            type="button"

                                            onClick={
                                                exportEncodedAudio
                                            }

                                            className="
                                                flex

                                                shrink-0

                                                items-center
                                                justify-center
                                                gap-2

                                                rounded-full

                                                bg-[var(--accent)]

                                                px-6
                                                py-3

                                                text-sm
                                                font-semibold

                                                text-black

                                                transition-all

                                                hover:bg-[var(--accent-hover)]

                                                active:scale-[0.98]
                                            "
                                        >
                                            <Download
                                                size={17}
                                            />

                                            Export WAV
                                        </button>
                                    </div>
                                </div>


                                <div
                                    className="
                                        relative
                                        z-10

                                        mt-6

                                        border-t
                                        border-white/10

                                        pt-5
                                    "
                                >
                                    <button
                                        type="button"

                                        onClick={
                                            resetEncoder
                                        }

                                        className="
                                            flex

                                            items-center
                                            gap-2

                                            text-sm

                                            text-gray-400

                                            transition

                                            hover:text-white
                                        "
                                    >
                                        <RotateCcw
                                            size={15}
                                        />

                                        Start Over
                                    </button>
                                </div>

                            </div>
                        )}

                    </div>

                </div>
            </div>
        </div>,

        document.body
    );
};


export default EncodeSecretModal;