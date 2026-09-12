import {
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    Mic,
    MicOff,
    Bot,
    Radio,
    Phone,
    AudioWaveform,
    CircleStop,
    CirclePlay,
    Download,
    RotateCcw,
    Sparkles,
    Volume2,
    Waves,
    CircleDot,
    Headphones,
    Zap,
    Ghost,
} from "lucide-react";

import BlurCircle from "../components/BlurCircle";

import {
    VoiceEffectEngine,
} from "../utils/voiceEffects/voiceEngine";


// ============================================================
// EFFECT DEFINITIONS
// ============================================================

const EFFECTS = [
    {
        id: "normal",
        name: "Normal",
        description:
            "Hear your original voice without processing.",
        icon: Mic,
    },
    {
        id: "robot",
        name: "Robot",
        description:
            "Metallic ring-modulated robotic voice.",
        icon: Bot,
    },
    {
        id: "alien",
        name: "Alien",
        description:
            "Robot modulation combined with spacey echo.",
        icon: Ghost,
    },
    {
        id: "distortion",
        name: "Distortion",
        description:
            "Aggressive saturated voice with extra drive.",
        icon: Zap,
    },
    {
        id: "echo",
        name: "Echo",
        description:
            "Repeating delayed copies of your voice.",
        icon: Waves,
    },
    {
        id: "tremolo",
        name: "Tremolo",
        description:
            "Rhythmic volume modulation for a pulsing voice.",
        icon: AudioWaveform,
    },
    {
        id: "radio",
        name: "Radio",
        description:
            "Thin compressed broadcast-style voice.",
        icon: Radio,

    },
    {
        id: "telephone",
        name: "Telephone",
        description:
            "Narrow-band old telephone sound.",
        icon: Phone,

    },
    {
        id: "chipmunk",
        name: "Chipmunk",
        description:
            "Higher-pitched voice while preserving speech speed.",
        icon: Sparkles,

    },
    {
        id: "deep",
        name: "Deep Voice",
        description:
            "Lower-pitched, heavier vocal tone.",
        icon: Volume2,

    },
];


// ============================================================
// FORMAT TIME
// ============================================================

const formatTime = (
    seconds
) => {

    const safeSeconds =
        Number.isFinite(seconds)
            ? seconds
            : 0;

    const minutes =
        Math.floor(
            safeSeconds / 60
        );

    const remainingSeconds =
        Math.floor(
            safeSeconds % 60
        );

    return `${minutes}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
};


// ============================================================
// MAIN COMPONENT
// ============================================================

const VoiceChanger = () => {

    const engineRef =
        useRef(null);

    const canvasRef =
        useRef(null);

    const animationRef =
        useRef(null);

    const analyserRef =
        useRef(null);

    const analyserSourceRef =
        useRef(null);

    const recorderRef =
        useRef(null);

    const recorderChunksRef =
        useRef([]);

    const recordingTimerRef =
        useRef(null);

    const recordedUrlRef =
        useRef(null);


    const [
        isLive,
        setIsLive,
    ] = useState(false);


    const [
        isStarting,
        setIsStarting,
    ] = useState(false);


    const [
        activeEffect,
        setActiveEffect,
    ] = useState("normal");


    const [
        outputVolume,
        setOutputVolume,
    ] = useState(0.8);


    const [
        robotFrequency,
        setRobotFrequency,
    ] = useState(70);


    const [
        tremoloFrequency,
        setTremoloFrequency,
    ] = useState(5);


    const [
        tremoloDepth,
        setTremoloDepth,
    ] = useState(0.7);


    const [
        distortionDrive,
        setDistortionDrive,
    ] = useState(4);
    const [
        chipmunkRatio,
        setChipmunkRatio,
    ] = useState(1.55);


    const [
        deepRatio,
        setDeepRatio,
    ] = useState(0.72);


    const [
        radioDrive,
        setRadioDrive,
    ] = useState(3.5);


    const [
        isRecording,
        setIsRecording,
    ] = useState(false);


    const [
        recordedAudio,
        setRecordedAudio,
    ] = useState(null);


    const [
        recordingSeconds,
        setRecordingSeconds,
    ] = useState(0);


    const [
        error,
        setError,
    ] = useState("");


    const currentEffect =
        useMemo(
            () =>
                EFFECTS.find(
                    (
                        effect
                    ) =>
                        effect.id ===
                        activeEffect
                ),
            [
                activeEffect,
            ]
        );


    // ========================================================
    // DRAW IDLE WAVE
    // ========================================================

    const drawIdleWave =
        () => {

            const canvas =
                canvasRef.current;

            if (!canvas) {
                return;
            }


            const context =
                canvas.getContext(
                    "2d"
                );

            if (!context) {
                return;
            }


            const rect =
                canvas.getBoundingClientRect();


            const ratio =
                window.devicePixelRatio ||
                1;


            canvas.width =
                rect.width *
                ratio;

            canvas.height =
                rect.height *
                ratio;


            context.scale(
                ratio,
                ratio
            );


            const width =
                rect.width;

            const height =
                rect.height;


            context.clearRect(
                0,
                0,
                width,
                height
            );


            // center line

            context.beginPath();

            context.moveTo(
                0,
                height / 2
            );

            context.lineTo(
                width,
                height / 2
            );

            context.strokeStyle =
                "rgba(45, 212, 191, 0.28)";

            context.lineWidth =
                1;

            context.stroke();


            const time =
                performance.now() *
                0.001;


            const gradient =
                context.createLinearGradient(
                    0,
                    0,
                    width,
                    0
                );


            gradient.addColorStop(
                0,
                "rgba(45, 212, 191, 0.12)"
            );

            gradient.addColorStop(
                0.5,
                "rgba(103, 232, 249, 0.95)"
            );

            gradient.addColorStop(
                1,
                "rgba(45, 212, 191, 0.12)"
            );


            context.beginPath();


            for (
                let x = 0;
                x < width;
                x++
            ) {

                const normalized =
                    x / width;


                const envelope =
                    Math.sin(
                        Math.PI *
                        normalized
                    );


                const y =
                    height / 2 +
                    Math.sin(
                        normalized *
                        Math.PI *
                        9 +
                        time *
                        2
                    ) *
                    18 *
                    envelope;


                if (
                    x === 0
                ) {

                    context.moveTo(
                        x,
                        y
                    );

                } else {

                    context.lineTo(
                        x,
                        y
                    );
                }
            }


            context.strokeStyle =
                gradient;

            context.lineWidth =
                2;

            context.shadowBlur =
                14;

            context.shadowColor =
                "rgba(45, 212, 191, 0.55)";

            context.stroke();


            context.shadowBlur =
                0;


            animationRef.current =
                requestAnimationFrame(
                    drawIdleWave
                );
        };


    // ========================================================
    // DRAW LIVE ANALYSER
    // ========================================================

    const drawLiveWave =
        () => {

            const analyser =
                analyserRef.current;

            const canvas =
                canvasRef.current;


            if (
                !analyser ||
                !canvas
            ) {

                return;
            }


            const context =
                canvas.getContext(
                    "2d"
                );


            const rect =
                canvas.getBoundingClientRect();


            const ratio =
                window.devicePixelRatio ||
                1;


            canvas.width =
                rect.width *
                ratio;

            canvas.height =
                rect.height *
                ratio;


            context.scale(
                ratio,
                ratio
            );


            const width =
                rect.width;

            const height =
                rect.height;


            const bufferLength =
                analyser.fftSize;


            const data =
                new Uint8Array(
                    bufferLength
                );


            analyser.getByteTimeDomainData(
                data
            );


            context.clearRect(
                0,
                0,
                width,
                height
            );


            context.beginPath();

            context.moveTo(
                0,
                height / 2
            );

            context.lineTo(
                width,
                height / 2
            );

            context.strokeStyle =
                "rgba(45, 212, 191, 0.22)";

            context.lineWidth =
                1;

            context.stroke();


            const gradient =
                context.createLinearGradient(
                    0,
                    0,
                    width,
                    0
                );


            gradient.addColorStop(
                0,
                "rgba(45, 212, 191, 0.30)"
            );

            gradient.addColorStop(
                0.5,
                "rgba(103, 232, 249, 1)"
            );

            gradient.addColorStop(
                1,
                "rgba(45, 212, 191, 0.30)"
            );


            context.beginPath();


            const sliceWidth =
                width /
                bufferLength;


            let x =
                0;


            for (
                let i = 0;
                i < bufferLength;
                i++
            ) {

                const value =
                    data[i] /
                    128.0;


                const y =
                    (
                        value *
                        height
                    ) /
                    2;


                if (
                    i === 0
                ) {

                    context.moveTo(
                        x,
                        y
                    );

                } else {

                    context.lineTo(
                        x,
                        y
                    );
                }


                x +=
                    sliceWidth;
            }


            context.strokeStyle =
                gradient;

            context.lineWidth =
                2;

            context.shadowBlur =
                18;

            context.shadowColor =
                "rgba(45, 212, 191, 0.7)";

            context.stroke();


            context.shadowBlur =
                0;


            animationRef.current =
                requestAnimationFrame(
                    drawLiveWave
                );
        };


    // ========================================================
    // START VISUALIZER
    // ========================================================

    const startVisualizer =
        () => {

            if (
                animationRef.current
            ) {

                cancelAnimationFrame(
                    animationRef.current
                );
            }


            if (
                isLive &&
                analyserRef.current
            ) {

                drawLiveWave();

            } else {

                drawIdleWave();
            }
        };


    // ========================================================
    // CONNECT ANALYSER
    // ========================================================

    const connectAnalyser =
        (
            engine
        ) => {

            if (
                !engine?.audioContext ||
                !engine?.sourceNode
            ) {

                return;
            }


            const analyser =
                engine.audioContext
                    .createAnalyser();


            analyser.fftSize =
                1024;

            analyser.smoothingTimeConstant =
                0.82;


            engine.sourceNode.connect(
                analyser
            );


            analyserRef.current =
                analyser;

            analyserSourceRef.current =
                engine.sourceNode;
        };


    // ========================================================
    // START LIVE VOICE
    // ========================================================

    const startLiveVoice =
        async () => {

            if (
                isLive ||
                isStarting
            ) {

                return;
            }


            setError("");

            setIsStarting(
                true
            );


            try {

                const engine =
                    new VoiceEffectEngine();


                await engine.start();


                engine.setEffect(
                    activeEffect
                );


                engine.setVolume(
                    outputVolume
                );


                engine.setParameter(
                    "robotFrequency",
                    robotFrequency
                );


                engine.setParameter(
                    "tremoloFrequency",
                    tremoloFrequency
                );


                engine.setParameter(
                    "tremoloDepth",
                    tremoloDepth
                );


                engine.setParameter(
                    "distortion",
                    distortionDrive
                );
                engine.setParameter(
                    "chipmunkRatio",
                    chipmunkRatio
                );


                engine.setParameter(
                    "deepRatio",
                    deepRatio
                );


                engine.setParameter(
                    "radioDrive",
                    radioDrive
                );


                engineRef.current =
                    engine;


                connectAnalyser(
                    engine
                );


                setIsLive(
                    true
                );

            } catch (
            caughtError
            ) {

                console.error(
                    caughtError
                );


                setError(
                    caughtError?.message ||
                    "Could not access the microphone."
                );
            } finally {

                setIsStarting(
                    false
                );
            }
        };


    // ========================================================
    // STOP LIVE VOICE
    // ========================================================

    const stopLiveVoice =
        async () => {

            if (
                isRecording
            ) {

                stopRecording();
            }


            if (
                animationRef.current
            ) {

                cancelAnimationFrame(
                    animationRef.current
                );
            }


            if (
                analyserRef.current
            ) {

                try {

                    analyserRef.current
                        .disconnect();

                } catch {

                    // ignore
                }
            }


            analyserRef.current =
                null;

            analyserSourceRef.current =
                null;


            if (
                engineRef.current
            ) {

                await engineRef.current.stop();

                engineRef.current =
                    null;
            }


            setIsLive(
                false
            );
        };


    // ========================================================
    // SELECT EFFECT
    // ========================================================

    const handleEffectChange =
        (
            effect
        ) => {

            if (
                effect.disabled
            ) {

                return;
            }


            setActiveEffect(
                effect.id
            );


            if (
                engineRef.current
            ) {

                engineRef.current.setEffect(
                    effect.id
                );
            }
        };


    // ========================================================
    // PARAMETER CHANGES
    // ========================================================

    const updateRobotFrequency =
        (
            value
        ) => {

            setRobotFrequency(
                value
            );


            engineRef.current?.setParameter(
                "robotFrequency",
                value
            );
        };


    const updateTremoloFrequency =
        (
            value
        ) => {

            setTremoloFrequency(
                value
            );


            engineRef.current?.setParameter(
                "tremoloFrequency",
                value
            );
        };


    const updateTremoloDepth =
        (
            value
        ) => {

            setTremoloDepth(
                value
            );


            engineRef.current?.setParameter(
                "tremoloDepth",
                value
            );
        };


    const updateDistortion =
        (
            value
        ) => {

            setDistortionDrive(
                value
            );


            engineRef.current?.setParameter(
                "distortion",
                value
            );
        };


    const updateOutputVolume =
        (
            value
        ) => {

            setOutputVolume(
                value
            );


            engineRef.current?.setVolume(
                value
            );
        };
    const updateChipmunkRatio =
        (
            value
        ) => {

            setChipmunkRatio(
                value
            );


            engineRef.current?.setParameter(
                "chipmunkRatio",
                value
            );
        };


    const updateDeepRatio =
        (
            value
        ) => {

            setDeepRatio(
                value
            );


            engineRef.current?.setParameter(
                "deepRatio",
                value
            );
        };


    const updateRadioDrive =
        (
            value
        ) => {

            setRadioDrive(
                value
            );


            engineRef.current?.setParameter(
                "radioDrive",
                value
            );
        };


    // ========================================================
    // RECORDING
    // ========================================================

    const startRecording =
        () => {

            const stream =
                engineRef.current
                    ?.getProcessedStream();


            if (
                !stream
            ) {

                return;
            }


            if (
                recordedAudio
            ) {

                URL.revokeObjectURL(
                    recordedAudio.url
                );

                recordedUrlRef.current =
                    null;

                setRecordedAudio(
                    null
                );
            }


            recorderChunksRef.current =
                [];


            const recorder =
                new MediaRecorder(
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

                        recorderChunksRef.current.push(
                            event.data
                        );
                    }
                };


            recorder.onstop =
                () => {

                    const blob =
                        new Blob(
                            recorderChunksRef.current,
                            {
                                type:
                                    recorder.mimeType ||
                                    "audio/webm",
                            }
                        );


                    const url =
                        URL.createObjectURL(
                            blob
                        );


                    recordedUrlRef.current =
                        url;


                    setRecordedAudio({
                        blob,
                        url,
                        mimeType:
                            blob.type,
                    });
                };


            recorder.start(
                250
            );


            recorderRef.current =
                recorder;


            setRecordingSeconds(
                0
            );


            setIsRecording(
                true
            );


            recordingTimerRef.current =
                window.setInterval(
                    () => {

                        setRecordingSeconds(
                            (
                                previous
                            ) =>
                                previous +
                                1
                        );

                    },
                    1000
                );
        };


    const stopRecording =
        () => {

            if (
                recordingTimerRef.current
            ) {

                clearInterval(
                    recordingTimerRef.current
                );

                recordingTimerRef.current =
                    null;
            }


            const recorder =
                recorderRef.current;


            if (
                recorder &&
                recorder.state !==
                "inactive"
            ) {

                recorder.stop();
            }


            recorderRef.current =
                null;


            setIsRecording(
                false
            );
        };


    // ========================================================
    // EXPORT RECORDING
    // ========================================================

    const exportRecording =
        () => {

            if (
                !recordedAudio
            ) {

                return;
            }


            const extension =
                recordedAudio.mimeType
                    ?.includes(
                        "ogg"
                    )
                    ? "ogg"
                    : "webm";


            const anchor =
                document.createElement(
                    "a"
                );


            anchor.href =
                recordedAudio.url;


            anchor.download =
                `audiverse-voice-${Date.now()}.${extension}`;


            document.body.appendChild(
                anchor
            );


            anchor.click();


            anchor.remove();
        };


    // ========================================================
    // RESET RECORDING
    // ========================================================

    const clearRecording =
        () => {

            if (
                recordedUrlRef.current
            ) {

                URL.revokeObjectURL(
                    recordedUrlRef.current
                );

                recordedUrlRef.current =
                    null;
            }


            setRecordedAudio(
                null
            );


            setRecordingSeconds(
                0
            );
        };


    // ========================================================
    // VISUALIZER EFFECT
    // ========================================================

    useEffect(
        () => {

            startVisualizer();


            return () => {

                if (
                    animationRef.current
                ) {

                    cancelAnimationFrame(
                        animationRef.current
                    );
                }
            };

        },
        [
            isLive,
        ]
    );


    // ========================================================
    // CLEANUP
    // ========================================================

    useEffect(
        () => {

            return () => {

                if (
                    recordingTimerRef.current
                ) {

                    clearInterval(
                        recordingTimerRef.current
                    );
                }


                if (
                    animationRef.current
                ) {

                    cancelAnimationFrame(
                        animationRef.current
                    );
                }


                if (
                    recordedUrlRef.current
                ) {

                    URL.revokeObjectURL(
                        recordedUrlRef.current
                    );
                }


                engineRef.current?.stop();
            };

        },
        []
    );


    // ========================================================
    // RENDER
    // ========================================================

    return (
        <div
            className="
                relative
                min-h-screen
                w-full
                overflow-hidden
                bg-[#050708]
                px-5
                py-12
                text-white
                sm:px-8
                lg:px-12
            "
        >
            <BlurCircle
                className="
                    left-[5%]
                    top-[10%]
                "
                size={430}
                color="teal"
            />

            <BlurCircle
                className="
                    right-[-7%]
                    top-[45%]
                "
                size={500}
                color="purple"
            />


            <div
                className="
                    relative
                    z-10
                    mx-auto
                    w-full
                    max-w-7xl
                "
            >
                {/* =========================================== */}
                {/* HEADER */}
                {/* =========================================== */}

                <div
                    className="
                        mb-10
                    "
                >
                    <div
                        className="
                            mb-4
                            flex
                            items-center
                            gap-3
                            text-sm
                            font-medium
                            uppercase
                            tracking-[0.22em]
                            text-teal-300/80
                        "
                    >
                        <AudioWaveform
                            size={18}
                        />

                        Live Voice Processing
                    </div>


                    <h1
                        className="
                            text-4xl
                            font-semibold
                            tracking-tight
                            sm:text-5xl
                            lg:text-6xl
                        "
                    >
                        Voice Changer
                    </h1>


                    <p
                        className="
                            mt-4
                            max-w-3xl
                            text-base
                            leading-7
                            text-white/55
                            sm:text-lg
                        "
                    >
                        Transform your microphone in real time
                        with low-latency voice effects.
                        Choose a voice, hear it instantly,
                        and record the processed result.
                    </p>
                </div>


                {/* =========================================== */}
                {/* LIVE PANEL */}
                {/* =========================================== */}

                <section
                    className="
                        relative
                        overflow-hidden
                        rounded-[30px]
                        border
                        border-white/10
                        bg-white/[0.035]
                        p-6
                        shadow-2xl
                        shadow-black/30
                        backdrop-blur-2xl
                        sm:p-8
                    "
                >
                    <BlurCircle
                        className="
                            left-1/2
                            top-1/2
                            -translate-x-1/2
                            -translate-y-1/2
                        "
                        size={500}
                        color="teal"
                    />


                    <div
                        className="
                            relative
                            z-10
                        "
                    >
                        <div
                            className="
                                flex
                                flex-col
                                gap-5
                                md:flex-row
                                md:items-center
                                md:justify-between
                            "
                        >
                            <div>
                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-3
                                    "
                                >
                                    <div
                                        className={`
                                            flex
                                            h-11
                                            w-11
                                            items-center
                                            justify-center
                                            rounded-2xl
                                            border
                                            ${isLive
                                                ? "border-teal-400/30 bg-teal-400/10 text-teal-300"
                                                : "border-white/10 bg-white/[0.04] text-white/65"
                                            }
                                        `}
                                    >
                                        {
                                            isLive
                                                ? (
                                                    <Mic
                                                        size={21}
                                                    />
                                                )
                                                : (
                                                    <MicOff
                                                        size={21}
                                                    />
                                                )
                                        }
                                    </div>


                                    <div>
                                        <p
                                            className="
                                                text-sm
                                                text-white/45
                                            "
                                        >
                                            Microphone
                                        </p>

                                        <p
                                            className="
                                                text-lg
                                                font-medium
                                            "
                                        >
                                            {
                                                isLive
                                                    ? "Live and processing"
                                                    : "Not connected"
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>


                            <div
                                className="
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-3
                                "
                            >
                                {
                                    !isLive
                                        ? (
                                            <button
                                                type="button"
                                                onClick={
                                                    startLiveVoice
                                                }
                                                disabled={
                                                    isStarting
                                                }
                                                className="
                                                    inline-flex
                                                    items-center
                                                    gap-2
                                                    rounded-xl
                                                    bg-teal-400
                                                    px-5
                                                    py-3
                                                    font-medium
                                                    text-black
                                                    transition
                                                    hover:bg-teal-300
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-50
                                                "
                                            >
                                                <CirclePlay
                                                    size={18}
                                                />

                                                {
                                                    isStarting
                                                        ? "Starting..."
                                                        : "Start Live Voice"
                                                }
                                            </button>
                                        )
                                        : (
                                            <button
                                                type="button"
                                                onClick={
                                                    stopLiveVoice
                                                }
                                                className="
                                                    inline-flex
                                                    items-center
                                                    gap-2
                                                    rounded-xl
                                                    border
                                                    border-red-400/20
                                                    bg-red-400/10
                                                    px-5
                                                    py-3
                                                    font-medium
                                                    text-red-200
                                                    transition
                                                    hover:bg-red-400/15
                                                "
                                            >
                                                <CircleStop
                                                    size={18}
                                                />

                                                Stop Live
                                            </button>
                                        )
                                }
                            </div>
                        </div>


                        {/* WAVEFORM */}

                        <div
                            className="
                                relative
                                mt-8
                                h-[190px]
                                overflow-hidden
                                rounded-2xl
                                border
                                border-white/10
                                bg-black/30
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


                            <div
                                className="
                                    pointer-events-none
                                    absolute
                                    left-5
                                    top-4
                                    flex
                                    items-center
                                    gap-2
                                    rounded-full
                                    border
                                    border-white/10
                                    bg-black/30
                                    px-3
                                    py-1.5
                                    text-xs
                                    text-white/55
                                    backdrop-blur-xl
                                "
                            >
                                <CircleDot
                                    size={13}
                                    className={
                                        isLive
                                            ? "text-teal-300"
                                            : "text-white/35"
                                    }
                                />

                                {
                                    isLive
                                        ? currentEffect?.name
                                        : "Waiting for microphone"
                                }
                            </div>
                        </div>


                        {/* HEADPHONE WARNING */}

                        <div
                            className="
                                mt-5
                                flex
                                gap-3
                                rounded-2xl
                                border
                                border-amber-300/10
                                bg-amber-300/[0.04]
                                p-4
                            "
                        >
                            <Headphones
                                size={20}
                                className="
                                    mt-0.5
                                    shrink-0
                                    text-amber-200/80
                                "
                            />

                            <p
                                className="
                                    text-sm
                                    leading-6
                                    text-white/55
                                "
                            >
                                Headphones are strongly recommended.
                                Playing the processed microphone through
                                speakers can create feedback.
                            </p>
                        </div>


                        {
                            error && (
                                <div
                                    className="
                                        mt-5
                                        rounded-2xl
                                        border
                                        border-red-400/20
                                        bg-red-400/10
                                        px-4
                                        py-3
                                        text-sm
                                        text-red-200
                                    "
                                >
                                    {error}
                                </div>
                            )
                        }
                    </div>
                </section>


                {/* =========================================== */}
                {/* EFFECTS */}
                {/* =========================================== */}

                <section
                    className="
                        mt-10
                    "
                >
                    <div
                        className="
                            mb-5
                        "
                    >
                        <p
                            className="
                                text-sm
                                font-medium
                                uppercase
                                tracking-[0.18em]
                                text-white/35
                            "
                        >
                            Voice Effects
                        </p>

                        <h2
                            className="
                                mt-2
                                text-2xl
                                font-semibold
                            "
                        >
                            Choose Your Voice
                        </h2>
                    </div>


                    <div
                        className="
                            grid
                            gap-4
                            sm:grid-cols-2
                            lg:grid-cols-3
                            xl:grid-cols-5
                        "
                    >
                        {
                            EFFECTS.map(
                                (
                                    effect
                                ) => {

                                    const Icon =
                                        effect.icon;


                                    const selected =
                                        activeEffect ===
                                        effect.id;


                                    return (
                                        <button
                                            key={
                                                effect.id
                                            }
                                            type="button"
                                            disabled={
                                                effect.disabled
                                            }
                                            onClick={
                                                () =>
                                                    handleEffectChange(
                                                        effect
                                                    )
                                            }
                                            className={`
                                                group
                                                relative
                                                min-h-[180px]
                                                overflow-hidden
                                                rounded-[24px]
                                                border
                                                p-5
                                                text-left
                                                transition
                                                ${selected
                                                    ? "border-teal-400/40 bg-teal-400/[0.09] shadow-lg shadow-teal-950/30"
                                                    : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.05]"
                                                }
                                                ${effect.disabled
                                                    ? "cursor-not-allowed opacity-45"
                                                    : ""
                                                }
                                            `}
                                        >
                                            {
                                                selected && (
                                                    <div
                                                        className="
                                                            absolute
                                                            inset-0
                                                            bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.12),transparent_55%)]
                                                        "
                                                    />
                                                )
                                            }


                                            <div
                                                className="
                                                    relative
                                                    z-10
                                                "
                                            >
                                                <div
                                                    className={`
                                                        flex
                                                        h-11
                                                        w-11
                                                        items-center
                                                        justify-center
                                                        rounded-2xl
                                                        border
                                                        ${selected
                                                            ? "border-teal-400/30 bg-teal-400/10 text-teal-300"
                                                            : "border-white/10 bg-white/[0.04] text-white/65"
                                                        }
                                                    `}
                                                >
                                                    <Icon
                                                        size={21}
                                                    />
                                                </div>


                                                <p
                                                    className="
                                                        mt-5
                                                        text-base
                                                        font-medium
                                                    "
                                                >
                                                    {
                                                        effect.name
                                                    }
                                                </p>


                                                <p
                                                    className="
                                                        mt-2
                                                        text-sm
                                                        leading-5
                                                        text-white/40
                                                    "
                                                >
                                                    {
                                                        effect.description
                                                    }
                                                </p>


                                                {
                                                    selected && (
                                                        <div
                                                            className="
                                                                mt-4
                                                                text-xs
                                                                font-medium
                                                                uppercase
                                                                tracking-[0.16em]
                                                                text-teal-300
                                                            "
                                                        >
                                                            Active
                                                        </div>
                                                    )
                                                }


                                                {
                                                    effect.disabled && (
                                                        <div
                                                            className="
                                                                mt-4
                                                                text-xs
                                                                uppercase
                                                                tracking-[0.14em]
                                                                text-white/25
                                                            "
                                                        >
                                                            Coming next
                                                        </div>
                                                    )
                                                }
                                            </div>
                                        </button>
                                    );
                                }
                            )
                        }
                    </div>
                </section>


                {/* =========================================== */}
                {/* CONTROLS + RECORDING */}
                {/* =========================================== */}

                <div
                    className="
                        mt-10
                        grid
                        gap-6
                        lg:grid-cols-[1.2fr_0.8fr]
                    "
                >
                    {/* CONTROLS */}

                    <section
                        className="
                            rounded-[28px]
                            border
                            border-white/10
                            bg-white/[0.035]
                            p-6
                            backdrop-blur-2xl
                        "
                    >
                        <p
                            className="
                                text-sm
                                font-medium
                                uppercase
                                tracking-[0.18em]
                                text-white/35
                            "
                        >
                            Effect Controls
                        </p>


                        <h2
                            className="
                                mt-2
                                text-2xl
                                font-semibold
                            "
                        >
                            {
                                currentEffect?.name ||
                                "Normal"
                            }
                        </h2>


                        <div
                            className="
                                mt-7
                                space-y-7
                            "
                        >
                            {/* MASTER VOLUME */}

                            <SliderControl
                                label="Output Volume"
                                value={
                                    outputVolume
                                }
                                min={0}
                                max={1}
                                step={0.01}
                                display={`${Math.round(
                                    outputVolume *
                                    100
                                )}%`}
                                onChange={
                                    updateOutputVolume
                                }
                            />


                            {
                                activeEffect ===
                                "robot" && (
                                    <SliderControl
                                        label="Robot Frequency"
                                        value={
                                            robotFrequency
                                        }
                                        min={20}
                                        max={180}
                                        step={1}
                                        display={`${robotFrequency} Hz`}
                                        onChange={
                                            updateRobotFrequency
                                        }
                                    />
                                )
                            }


                            {
                                activeEffect ===
                                "alien" && (
                                    <SliderControl
                                        label="Alien Modulation"
                                        value={
                                            robotFrequency
                                        }
                                        min={20}
                                        max={180}
                                        step={1}
                                        display={`${robotFrequency} Hz`}
                                        onChange={
                                            updateRobotFrequency
                                        }
                                    />
                                )
                            }


                            {
                                activeEffect ===
                                "tremolo" && (
                                    <>
                                        <SliderControl
                                            label="Tremolo Speed"
                                            value={
                                                tremoloFrequency
                                            }
                                            min={0.5}
                                            max={15}
                                            step={0.1}
                                            display={`${tremoloFrequency.toFixed(
                                                1
                                            )} Hz`}
                                            onChange={
                                                updateTremoloFrequency
                                            }
                                        />

                                        <SliderControl
                                            label="Tremolo Depth"
                                            value={
                                                tremoloDepth
                                            }
                                            min={0}
                                            max={1}
                                            step={0.01}
                                            display={`${Math.round(
                                                tremoloDepth *
                                                100
                                            )}%`}
                                            onChange={
                                                updateTremoloDepth
                                            }
                                        />
                                    </>
                                )
                            }
                            {
    activeEffect ===
        "radio" && (
        <SliderControl
            label="Radio Saturation"
            value={
                radioDrive
            }
            min={1}
            max={8}
            step={0.1}
            display={
                radioDrive.toFixed(
                    1
                )
            }
            onChange={
                updateRadioDrive
            }
        />
    )
}
{
    activeEffect ===
        "telephone" && (
        <div
            className="
                rounded-2xl

                border
                border-white/10

                bg-black/20

                px-4
                py-4

                text-sm
                leading-6

                text-white/45
            "
        >
            
        </div>
    )
}
{
    activeEffect ===
        "chipmunk" && (
        <SliderControl
            label="Pitch"
            value={
                chipmunkRatio
            }
            min={1.1}
            max={1.9}
            step={0.01}
            display={`${chipmunkRatio.toFixed(
                2
            )}×`}
            onChange={
                updateChipmunkRatio
            }
        />
    )
}
{
    activeEffect ===
        "deep" && (
        <SliderControl
            label="Pitch"
            value={
                deepRatio
            }
            min={0.55}
            max={0.95}
            step={0.01}
            display={`${deepRatio.toFixed(
                2
            )}×`}
            onChange={
                updateDeepRatio
            }
        />
    )
}


                            {
                                activeEffect ===
                                "distortion" && (
                                    <SliderControl
                                        label="Drive"
                                        value={
                                            distortionDrive
                                        }
                                        min={1}
                                        max={15}
                                        step={0.1}
                                        display={
                                            distortionDrive.toFixed(
                                                1
                                            )
                                        }
                                        onChange={
                                            updateDistortion
                                        }
                                    />
                                )
                            }


                            {
                                [
                                    "normal",
                                    "echo",
                                ].includes(
                                    activeEffect
                                ) && (
                                    <div
                                        className="
                                            rounded-2xl
                                            border
                                            border-white/10
                                            bg-black/20
                                            px-4
                                            py-4
                                            text-sm
                                            leading-6
                                            text-white/45
                                        "
                                    >
                                        This effect currently uses
                                        its default processing values.
                                        Custom controls can be added
                                        later.
                                    </div>
                                )
                            }
                        </div>
                    </section>


                    {/* RECORDING */}

                    <section
                        className="
                            rounded-[28px]
                            border
                            border-white/10
                            bg-white/[0.035]
                            p-6
                            backdrop-blur-2xl
                        "
                    >
                        <p
                            className="
                                text-sm
                                font-medium
                                uppercase
                                tracking-[0.18em]
                                text-white/35
                            "
                        >
                            Capture
                        </p>


                        <h2
                            className="
                                mt-2
                                text-2xl
                                font-semibold
                            "
                        >
                            Record Processed Voice
                        </h2>


                        <p
                            className="
                                mt-3
                                text-sm
                                leading-6
                                text-white/45
                            "
                        >
                            Record exactly what comes out
                            of the selected live effect.
                        </p>


                        <div
                            className="
                                mt-7
                                rounded-2xl
                                border
                                border-white/10
                                bg-black/20
                                p-5
                            "
                        >
                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    gap-4
                                "
                            >
                                <div>
                                    <p
                                        className="
                                            text-sm
                                            text-white/40
                                        "
                                    >
                                        Status
                                    </p>

                                    <p
                                        className="
                                            mt-1
                                            font-medium
                                        "
                                    >
                                        {
                                            isRecording
                                                ? "Recording processed voice"
                                                : recordedAudio
                                                    ? "Recording ready"
                                                    : "Ready to record"
                                        }
                                    </p>
                                </div>


                                <div
                                    className="
                                        rounded-xl
                                        border
                                        border-white/10
                                        bg-white/[0.04]
                                        px-3
                                        py-2
                                        font-mono
                                        text-sm
                                        text-teal-200
                                    "
                                >
                                    {
                                        formatTime(
                                            recordingSeconds
                                        )
                                    }
                                </div>
                            </div>


                            <div
                                className="
                                    mt-5
                                    flex
                                    flex-wrap
                                    gap-3
                                "
                            >
                                {
                                    !isRecording
                                        ? (
                                            <button
                                                type="button"
                                                disabled={
                                                    !isLive
                                                }
                                                onClick={
                                                    startRecording
                                                }
                                                className="
                                                    inline-flex
                                                    items-center
                                                    gap-2
                                                    rounded-xl
                                                    bg-red-500
                                                    px-4
                                                    py-2.5
                                                    font-medium
                                                    text-white
                                                    transition
                                                    hover:bg-red-400
                                                    disabled:cursor-not-allowed
                                                    disabled:opacity-35
                                                "
                                            >
                                                <CircleDot
                                                    size={17}
                                                />

                                                Record
                                            </button>
                                        )
                                        : (
                                            <button
                                                type="button"
                                                onClick={
                                                    stopRecording
                                                }
                                                className="
                                                    inline-flex
                                                    items-center
                                                    gap-2
                                                    rounded-xl
                                                    border
                                                    border-red-400/20
                                                    bg-red-400/10
                                                    px-4
                                                    py-2.5
                                                    font-medium
                                                    text-red-200
                                                "
                                            >
                                                <CircleStop
                                                    size={17}
                                                />

                                                Stop Recording
                                            </button>
                                        )
                                }
                            </div>


                            {
                                !isLive && (
                                    <p
                                        className="
                                            mt-4
                                            text-xs
                                            text-white/30
                                        "
                                    >
                                        Start Live Voice before recording.
                                    </p>
                                )
                            }
                        </div>


                        {
                            recordedAudio && (
                                <div
                                    className="
                                        mt-5
                                        rounded-2xl
                                        border
                                        border-teal-400/15
                                        bg-teal-400/[0.04]
                                        p-4
                                    "
                                >
                                    <p
                                        className="
                                            text-sm
                                            font-medium
                                            text-teal-200
                                        "
                                    >
                                        Processed recording
                                    </p>


                                    <audio
                                        controls
                                        src={
                                            recordedAudio.url
                                        }
                                        className="
                                            mt-4
                                            w-full
                                        "
                                    />


                                    <div
                                        className="
                                            mt-4
                                            flex
                                            flex-wrap
                                            gap-3
                                        "
                                    >
                                        <button
                                            type="button"
                                            onClick={
                                                exportRecording
                                            }
                                            className="
                                                inline-flex
                                                items-center
                                                gap-2
                                                rounded-xl
                                                bg-teal-400
                                                px-4
                                                py-2.5
                                                text-sm
                                                font-medium
                                                text-black
                                                hover:bg-teal-300
                                            "
                                        >
                                            <Download
                                                size={16}
                                            />

                                            Export
                                        </button>


                                        <button
                                            type="button"
                                            onClick={
                                                clearRecording
                                            }
                                            className="
                                                inline-flex
                                                items-center
                                                gap-2
                                                rounded-xl
                                                border
                                                border-white/10
                                                bg-white/[0.04]
                                                px-4
                                                py-2.5
                                                text-sm
                                                text-white/65
                                                hover:bg-white/[0.07]
                                            "
                                        >
                                            <RotateCcw
                                                size={16}
                                            />

                                            Clear
                                        </button>
                                    </div>
                                </div>
                            )
                        }
                    </section>
                </div>
            </div>
        </div>
    );
};


// ============================================================
// SLIDER COMPONENT
// ============================================================

const SliderControl = ({
    label,
    value,
    min,
    max,
    step,
    display,
    onChange,
}) => {

    return (
        <div>
            <div
                className="
                    mb-3
                    flex
                    items-center
                    justify-between
                    gap-4
                "
            >
                <label
                    className="
                        text-sm
                        font-medium
                        text-white/65
                    "
                >
                    {label}
                </label>


                <span
                    className="
                        rounded-lg
                        border
                        border-white/10
                        bg-white/[0.04]
                        px-2.5
                        py-1
                        text-xs
                        text-teal-200
                    "
                >
                    {display}
                </span>
            </div>


            <input
                type="range"
                min={
                    min
                }
                max={
                    max
                }
                step={
                    step
                }
                value={
                    value
                }
                onChange={
                    (
                        event
                    ) =>
                        onChange(
                            Number(
                                event.target.value
                            )
                        )
                }
                className="
                    h-2
                    w-full
                    cursor-pointer
                    appearance-none
                    rounded-full
                    bg-white/10
                    accent-teal-400
                "
            />
        </div>
    );
};


export default VoiceChanger;