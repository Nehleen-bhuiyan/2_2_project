import {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    createPortal,
} from "react-dom";

import {
    Upload,
    Play,
    Pause,
    Trash2,
    X,
    Ear,
    UnlockKeyhole,
    Download,
    RotateCcw,
    Check,
    Sparkles,
} from "lucide-react";

import {
    decodeSecretAudio,
} from "../../utils/steganography/decodeAudio";

import {
    encodeWav,
} from "../../utils/steganography/wavEncoder";


const DecodeSecretModal = ({
    onClose,
}) => {

    // =========================================================
    // STATE
    // =========================================================

    const [
        encodedInput,
        setEncodedInput,
    ] = useState(
        null
    );


    const [
        decodedAudio,
        setDecodedAudio,
    ] = useState(
        null
    );


    const [
        isPlaying,
        setIsPlaying,
    ] = useState(
        false
    );


    const [
        isDecoding,
        setIsDecoding,
    ] = useState(
        false
    );


    // =========================================================
    // REFS
    // =========================================================

    const canvasRef =
        useRef(null);


    const inputRef =
        useRef(null);


    const audioRef =
        useRef(null);


    const animationRef =
        useRef(null);


    const audioContextRef =
        useRef(null);


    const analyserRef =
        useRef(null);


    const sourceNodeRef =
        useRef(null);


    const encodedInputRef =
        useRef(null);


    const decodedAudioRef =
        useRef(null);


    // =========================================================
    // KEEP REFS CURRENT
    // =========================================================

    useEffect(() => {

        encodedInputRef.current =
            encodedInput;

    }, [
        encodedInput,
    ]);


    useEffect(() => {

        decodedAudioRef.current =
            decodedAudio;

    }, [
        decodedAudio,
    ]);


    // =========================================================
    // REVOKE URL
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
    // CLEAR AUDIO GRAPH
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


        const context =
            audioContextRef.current;


        audioContextRef.current =
            null;

        analyserRef.current =
            null;

        sourceNodeRef.current =
            null;


        if (
            context &&
            context.state !==
                "closed"
        ) {

            context
                .close()
                .catch(
                    () => {}
                );
        }
    };


    // =========================================================
    // CANVAS
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
            canvas
                .getBoundingClientRect();


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
            context,

            width:
                rect.width,

            height:
                rect.height,
        };
    };


    // =========================================================
    // MIDLINE
    // =========================================================

    const drawCenterLine =
        (
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
                "rgba(34,211,197,0.82)";


            context.lineWidth =
                1.4;


            context.shadowBlur =
                14;


            context.shadowColor =
                "rgba(34,211,197,0.75)";


            context.stroke();


            context.restore();
        };


    // =========================================================
    // GRADIENT
    // =========================================================

    const createWaveGradient =
        (
            context,
            width
        ) => {

            const gradient =
                context
                    .createLinearGradient(
                        0,
                        0,
                        width,
                        0
                    );


            gradient.addColorStop(
                0,
                "rgba(20,184,166,0.25)"
            );


            gradient.addColorStop(
                0.25,
                "rgba(45,212,191,0.72)"
            );


            gradient.addColorStop(
                0.5,
                "rgba(34,211,238,0.95)"
            );


            gradient.addColorStop(
                0.75,
                "rgba(45,212,191,0.72)"
            );


            gradient.addColorStop(
                1,
                "rgba(20,184,166,0.25)"
            );


            return gradient;
        };


    // =========================================================
    // DRAW CURVE
    // =========================================================

    const drawCurve =
        (
            context,
            points,
            options
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
                        index ===
                        0
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
                options.strokeStyle;


            context.lineWidth =
                options.lineWidth;


            context.shadowBlur =
                options.shadowBlur ||
                0;


            context.shadowColor =
                options.shadowColor ||
                "transparent";


            context.globalAlpha =
                options.alpha ??
                1;


            context.lineCap =
                "round";


            context.lineJoin =
                "round";


            context.stroke();


            context.restore();
        };


    // =========================================================
    // IDLE WAVE
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
                x /
                width;


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
                            1.4
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
                            0.5
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
                    "rgba(34,211,197,0.35)",

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
                    "rgba(34,211,197,0.62)",
            }
        );


        const mirrored =
            points.map(
                (
                    point
                ) => ({
                    x:
                        point.x,

                    y:
                        middle -
                        (
                            point.y -
                            middle
                        ) *
                            0.82,
                })
            );


        drawCurve(
            context,
            mirrored,
            {
                strokeStyle:
                    "rgba(34,211,238,0.25)",

                lineWidth:
                    1.2,

                shadowBlur:
                    7,

                shadowColor:
                    "rgba(34,211,238,0.30)",
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
    // ANALYSER WAVE
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
                count
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
                    "rgba(34,211,197,0.16)",

                lineWidth:
                    7,

                shadowBlur:
                    22,

                shadowColor:
                    "rgba(34,211,197,0.35)",
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
                    "rgba(34,211,197,0.7)",
            }
        );


        const mirrored =
            points.map(
                (
                    point
                ) => ({
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
                    "rgba(45,212,191,0.27)",

                lineWidth:
                    1.3,

                shadowBlur:
                    8,

                shadowColor:
                    "rgba(34,211,197,0.3)",
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


            if (
                !AudioContext
            ) {

                throw new Error(
                    "Web Audio API is unavailable."
                );
            }


            return new AudioContext();
        };


    // =========================================================
    // PLAYBACK ANALYSER
    // =========================================================

    const connectPlaybackAnalyser =
        () => {

            const audio =
                audioRef.current;


            if (!audio) {
                return;
            }


            clearAudioGraph();


            const context =
                createAudioContext();


            const analyser =
                context
                    .createAnalyser();


            analyser.fftSize =
                2048;


            analyser.smoothingTimeConstant =
                0.82;


            const source =
                context
                    .createMediaElementSource(
                        audio
                    );


            source.connect(
                analyser
            );


            analyser.connect(
                context.destination
            );


            audioContextRef.current =
                context;


            analyserRef.current =
                analyser;


            sourceNodeRef.current =
                source;


            drawAnalyserWave();
        };


    // =========================================================
    // UPLOAD
    // =========================================================

    const handleUpload =
        (
            event
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
                encodedInputRef.current
            );


            revokeAudioUrl(
                decodedAudioRef.current
            );


            const url =
                URL.createObjectURL(
                    file
                );


            setEncodedInput({
                blob:
                    file,

                file,

                url,

                name:
                    file.name,
            });


            setDecodedAudio(
                null
            );


            startIdleWave();
        };


    // =========================================================
    // PLAY INPUT
    // =========================================================

    const toggleInputPlayback =
        async () => {

            if (
                !encodedInput ||
                !audioRef.current
            ) {
                return;
            }


            if (
                isPlaying
            ) {

                audioRef.current
                    .pause();


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


                await audioRef.current
                    .play();


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
    // REMOVE INPUT
    // =========================================================

    const removeInput = () => {

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
            encodedInputRef.current
        );


        revokeAudioUrl(
            decodedAudioRef.current
        );


        setEncodedInput(
            null
        );


        setDecodedAudio(
            null
        );


        startIdleWave();
    };


    // =========================================================
    // DECODE
    // =========================================================

    const handleDecode =
        async () => {

            if (
                !encodedInput ||
                isDecoding
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


                setIsDecoding(
                    true
                );


                revokeAudioUrl(
                    decodedAudioRef.current
                );


                setDecodedAudio(
                    null
                );


                const result =
                    await decodeSecretAudio(
                        encodedInput.blob,
                        {
                            carrierFrequency:
                                30000,

                            secretBandwidth:
                                6000,
                        }
                    );


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


                setDecodedAudio({
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
                });


            } catch (
                error
            ) {

                console.error(
                    "Decoding failed:",
                    error
                );


                alert(
                    "Could not recover a hidden message from this audio."
                );

            } finally {

                setIsDecoding(
                    false
                );
            }
        };


    // =========================================================
    // EXPORT
    // =========================================================

    const exportDecodedAudio =
        () => {

            const result =
                decodedAudioRef.current;


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
                `audiverse-recovered-secret-${Date.now()}.wav`;


            document.body.appendChild(
                anchor
            );


            anchor.click();


            anchor.remove();
        };


    // =========================================================
    // RESET
    // =========================================================

    const resetDecoder = () => {

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
            encodedInputRef.current
        );


        revokeAudioUrl(
            decodedAudioRef.current
        );


        setEncodedInput(
            null
        );


        setDecodedAudio(
            null
        );


        startIdleWave();
    };


    // =========================================================
    // CLOSE
    // =========================================================

    const handleClose = () => {

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


        onClose?.();
    };


    // =========================================================
    // INITIAL WAVE
    // =========================================================

    useEffect(() => {

        startIdleWave();


        const resize = () => {

            if (
                !analyserRef.current
            ) {

                startIdleWave();
            }
        };


        window.addEventListener(
            "resize",
            resize
        );


        return () => {

            window.removeEventListener(
                "resize",
                resize
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
    // CLEANUP
    // =========================================================

    useEffect(() => {

        return () => {

            clearAudioGraph();


            revokeAudioUrl(
                encodedInputRef.current
            );


            revokeAudioUrl(
                decodedAudioRef.current
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

                    {/* BACKGROUND GLOW */}

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


                    {/* CLOSE */}

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

                            items-center
                            justify-center

                            rounded-full

                            border
                            border-white/10

                            bg-black/30

                            text-gray-400

                            transition

                            hover:bg-white/10
                            hover:text-white
                        "
                    >
                        <X
                            size={19}
                        />
                    </button>


                    {/* HEADER */}

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
                                <Ear
                                    size={23}
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
                                    Decoder
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
                                    Hear Someone&apos;s Secret
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
                            Give Audiverse an
                            encoded audio file and
                            bring its hidden
                            high-frequency message
                            back into hearing.
                        </p>
                    </div>


                    {/* BODY */}

                    <div
                        className="
                            relative
                            z-10

                            px-8
                            py-8

                            sm:px-10
                        "
                    >

                        {/* INPUT CARD */}

                        <div
                            className="
                                rounded-2xl

                                border
                                border-white/10

                                bg-white/[0.025]

                                p-5
                            "
                        >
                            <div
                                className="
                                    flex
                                    flex-col

                                    gap-4

                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
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
                                        Encoded Audio
                                    </p>


                                    <h3
                                        className="
                                            mt-1

                                            text-lg
                                            font-semibold

                                            text-white
                                        "
                                    >
                                        What did they hide?
                                    </h3>


                                    <p
                                        className="
                                            mt-1

                                            text-sm

                                            text-gray-500
                                        "
                                    >
                                        Upload an Audiverse
                                        encoded WAV file.
                                    </p>


                                    {encodedInput && (
                                        <p
                                            className="
                                                mt-3

                                                max-w-[600px]

                                                truncate

                                                text-sm

                                                text-[var(--accent)]
                                            "
                                        >
                                            {encodedInput.name}
                                        </p>
                                    )}
                                </div>


                                {encodedInput && (
                                    <div
                                        className="
                                            flex
                                            h-9
                                            w-9

                                            shrink-0

                                            items-center
                                            justify-center

                                            rounded-full

                                            bg-[var(--accent)]

                                            text-black
                                        "
                                    >
                                        <Check
                                            size={17}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>


                        {/* WAVEFORM */}

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
                                    Hidden Channel
                                </p>


                                <h3
                                    className="
                                        mt-2

                                        text-xl
                                        font-semibold

                                        text-white
                                    "
                                >
                                    Listen closely
                                </h3>
                            </div>


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
                                {!encodedInput && (
                                    <button
                                        type="button"

                                        onClick={() =>
                                            inputRef.current
                                                ?.click()
                                        }

                                        className="
                                            flex
                                            items-center
                                            gap-2

                                            rounded-full

                                            bg-[var(--accent)]

                                            px-7
                                            py-3

                                            text-sm
                                            font-semibold

                                            text-black

                                            transition

                                            hover:bg-[var(--accent-hover)]
                                        "
                                    >
                                        <Upload
                                            size={17}
                                        />

                                        Upload Encoded WAV
                                    </button>
                                )}


                                {encodedInput && (
                                    <>
                                        <button
                                            type="button"

                                            onClick={
                                                toggleInputPlayback
                                            }

                                            className="
                                                flex
                                                h-12
                                                w-12

                                                items-center
                                                justify-center

                                                rounded-full

                                                bg-[var(--accent)]

                                                text-black

                                                transition

                                                hover:bg-[var(--accent-hover)]
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

                                            onClick={
                                                removeInput
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
                                                inputRef.current
                                                    ?.click()
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

                                            Replace
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>


                        {/* FILE INPUT */}

                        <input
                            ref={
                                inputRef
                            }

                            type="file"

                            accept="
                                audio/wav,
                                audio/x-wav,
                                audio/wave,
                                audio/*
                            "

                            className="
                                hidden
                            "

                            onChange={
                                handleUpload
                            }
                        />


                        {/* HIDDEN INPUT PLAYER */}

                        {encodedInput && (
                            <audio
                                key={
                                    encodedInput.url
                                }

                                ref={
                                    audioRef
                                }

                                src={
                                    encodedInput.url
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


                        {/* DECODE ACTION */}

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
                            <p
                                className={`
                                    text-sm

                                    ${
                                        encodedInput
                                            ? "text-[var(--accent)]"
                                            : "text-gray-500"
                                    }
                                `}
                            >
                                {encodedInput
                                    ? "✓ Encoded audio ready"
                                    : "○ Upload encoded audio"}
                            </p>


                            <button
                                type="button"

                                onClick={
                                    handleDecode
                                }

                                disabled={
                                    !encodedInput ||
                                    isDecoding
                                }

                                className="
                                    flex
                                    min-w-[190px]

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

                                    transition

                                    hover:bg-[var(--accent-hover)]

                                    disabled:cursor-not-allowed
                                    disabled:opacity-30
                                "
                            >
                                {isDecoding
                                    ? (
                                        <>
                                            <Sparkles
                                                size={17}

                                                className="
                                                    animate-pulse
                                                "
                                            />

                                            Listening...
                                        </>
                                    )
                                    : (
                                        <>
                                            <UnlockKeyhole
                                                size={17}
                                            />

                                            Uncover Secret
                                        </>
                                    )}
                            </button>
                        </div>


                        {/* DECODED RESULT */}

                        {decodedAudio && (
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
                                <div
                                    className="
                                        pointer-events-none

                                        absolute
                                        right-[-100px]
                                        top-[-120px]

                                        h-[280px]
                                        w-[350px]

                                        rounded-full

                                        bg-[rgba(25,211,197,0.12)]

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
                                                Secret Found
                                            </p>
                                        </div>


                                        <h3
                                            className="
                                                text-xl
                                                font-semibold

                                                text-white
                                            "
                                        >
                                            Now you can hear
                                            what they hid
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
                                            The ultrasonic
                                            channel has been
                                            shifted back into
                                            the normal audible
                                            frequency range.
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
                                                Recovered band:
                                                0–6 kHz
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
                                                decodedAudio.url
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
                                                exportDecodedAudio
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

                                                transition

                                                hover:bg-[var(--accent-hover)]
                                            "
                                        >
                                            <Download
                                                size={17}
                                            />

                                            Export Secret
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
                                            resetDecoder
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

                                        Decode Another
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


export default DecodeSecretModal;