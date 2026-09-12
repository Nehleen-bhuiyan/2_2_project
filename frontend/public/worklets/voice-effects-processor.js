
class VoiceEffectsProcessor
    extends AudioWorkletProcessor {

    constructor() {
        super();


        // ====================================================
        // CURRENT EFFECT
        // ====================================================

        this.effect =
            "normal";


        // ====================================================
        // ROBOT
        // ====================================================

        this.robotFrequency =
            70;


        // ====================================================
        // TREMOLO
        // ====================================================

        this.tremoloFrequency =
            5;

        this.tremoloDepth =
            0.7;


        // ====================================================
        // DISTORTION
        // ====================================================

        this.distortion =
            4;


        // ====================================================
        // ECHO
        // ====================================================

        this.echoDelaySeconds =
            0.18;

        this.echoFeedback =
            0.65;

        this.echoWet =
            0.5;


        this.delaySamples =
            Math.max(
                1,
                Math.floor(
                    sampleRate *
                    this.echoDelaySeconds
                )
            );


        // ====================================================
        // NOISE GATE
        // ====================================================

        this.noiseGateEnabled =
            true;

        this.noiseGateThreshold =
            0.015;

        this.noiseGateFloor =
            0.04;

        this.noiseGateAttack =
            0.12;

        this.noiseGateRelease =
            0.008;


        // ====================================================
        // NEW EFFECT SETTINGS
        // ====================================================

        // Chipmunk
        this.chipmunkRatio =
            1.55;

        // Deep voice
        this.deepRatio =
            0.72;

        // Radio
        this.radioDrive =
            3.5;

        // Telephone
        this.telephoneDrive =
            1.8;


        // ====================================================
        // PER-CHANNEL STATE
        // ====================================================

        this.robotPhases =
            [];

        this.tremoloPhases =
            [];

        this.noiseGateGains =
            [];

        this.noiseEnvelopes =
            [];

        this.delayBuffers =
            [];

        this.delayIndices =
            [];


        // ====================================================
        // FILTER STATES
        // ====================================================

        this.filterStates =
            [];


        // ====================================================
        // PITCH SHIFT STATES
        // ====================================================

        this.pitchBuffers =
            [];

        this.pitchWriteIndices =
            [];

        this.pitchPhases =
            [];


        // About 45 ms grain size
        this.pitchGrainSize =
            Math.floor(
                sampleRate *
                0.045
            );


        this.pitchMinDelay =
            Math.floor(
                sampleRate *
                0.015
            );


        this.pitchBufferSize =
            Math.floor(
                sampleRate *
                0.25
            );


        // ====================================================
        // MESSAGES
        // ====================================================

        this.port.onmessage =
            (
                event
            ) => {

                const data =
                    event.data;


                if (!data) {
                    return;
                }


                if (
                    data.type ===
                    "effect"
                ) {

                    this.effect =
                        data.effect ||
                        "normal";

                    return;
                }


                if (
                    data.type ===
                    "noiseGateEnabled"
                ) {

                    this.noiseGateEnabled =
                        Boolean(
                            data.enabled
                        );

                    return;
                }


                if (
                    data.type ===
                    "parameter"
                ) {

                    this.setParameter(
                        data.name,
                        data.value
                    );
                }
            };
    }


    // ========================================================
    // PARAMETERS
    // ========================================================

    setParameter(
        name,
        value
    ) {

        const numericValue =
            Number(value);


        if (
            !Number.isFinite(
                numericValue
            )
        ) {
            return;
        }


        switch (name) {

            case "robotFrequency":

                this.robotFrequency =
                    Math.max(
                        10,
                        Math.min(
                            500,
                            numericValue
                        )
                    );

                break;


            case "tremoloFrequency":

                this.tremoloFrequency =
                    Math.max(
                        0.1,
                        Math.min(
                            30,
                            numericValue
                        )
                    );

                break;


            case "tremoloDepth":

                this.tremoloDepth =
                    Math.max(
                        0,
                        Math.min(
                            1,
                            numericValue
                        )
                    );

                break;


            case "distortion":

                this.distortion =
                    Math.max(
                        1,
                        Math.min(
                            30,
                            numericValue
                        )
                    );

                break;


            case "echoFeedback":

                this.echoFeedback =
                    Math.max(
                        0,
                        Math.min(
                            0.85,
                            numericValue
                        )
                    );

                break;


            case "echoWet":

                this.echoWet =
                    Math.max(
                        0,
                        Math.min(
                            1,
                            numericValue
                        )
                    );

                break;


            case "noiseGateThreshold":

                this.noiseGateThreshold =
                    Math.max(
                        0.001,
                        Math.min(
                            0.2,
                            numericValue
                        )
                    );

                break;


            case "chipmunkRatio":

                this.chipmunkRatio =
                    Math.max(
                        1,
                        Math.min(
                            2,
                            numericValue
                        )
                    );

                break;


            case "deepRatio":

                this.deepRatio =
                    Math.max(
                        0.5,
                        Math.min(
                            1,
                            numericValue
                        )
                    );

                break;


            case "radioDrive":

                this.radioDrive =
                    Math.max(
                        1,
                        Math.min(
                            10,
                            numericValue
                        )
                    );

                break;


            default:
                break;
        }
    }


    // ========================================================
    // CHANNEL INITIALIZATION
    // ========================================================

    ensureChannelState(
        channel
    ) {

        if (
            this.robotPhases[
                channel
            ] === undefined
        ) {
            this.robotPhases[
                channel
            ] = 0;
        }


        if (
            this.tremoloPhases[
                channel
            ] === undefined
        ) {
            this.tremoloPhases[
                channel
            ] = 0;
        }


        if (
            this.noiseGateGains[
                channel
            ] === undefined
        ) {
            this.noiseGateGains[
                channel
            ] = 1;
        }


        if (
            this.noiseEnvelopes[
                channel
            ] === undefined
        ) {
            this.noiseEnvelopes[
                channel
            ] = 0;
        }


        if (
            !this.delayBuffers[
                channel
            ]
        ) {
            this.delayBuffers[
                channel
            ] =
                new Float32Array(
                    this.delaySamples
                );
        }


        if (
            this.delayIndices[
                channel
            ] === undefined
        ) {
            this.delayIndices[
                channel
            ] = 0;
        }


        if (
            !this.filterStates[
                channel
            ]
        ) {

            this.filterStates[
                channel
            ] = {
                low1: 0,
                low2: 0,

                hpInput1: 0,
                hpOutput1: 0,

                hpInput2: 0,
                hpOutput2: 0,
            };
        }


        if (
            !this.pitchBuffers[
                channel
            ]
        ) {

            this.pitchBuffers[
                channel
            ] =
                new Float32Array(
                    this.pitchBufferSize
                );
        }


        if (
            this.pitchWriteIndices[
                channel
            ] === undefined
        ) {
            this.pitchWriteIndices[
                channel
            ] = 0;
        }


        if (
            this.pitchPhases[
                channel
            ] === undefined
        ) {
            this.pitchPhases[
                channel
            ] = 0;
        }
    }


    // ========================================================
    // NOISE GATE
    // ========================================================

    processNoiseGate(
        sample,
        channel
    ) {

        if (
            !this.noiseGateEnabled
        ) {
            return sample;
        }


        const amplitude =
            Math.abs(
                sample
            );


        let envelope =
            this.noiseEnvelopes[
                channel
            ];


        const speed =
            amplitude >
            envelope
                ? 0.12
                : 0.015;


        envelope +=
            (
                amplitude -
                envelope
            ) *
            speed;


        this.noiseEnvelopes[
            channel
        ] =
            envelope;


        const targetGain =
            envelope >=
            this.noiseGateThreshold
                ? 1
                : this.noiseGateFloor;


        let gain =
            this.noiseGateGains[
                channel
            ];


        const smoothing =
            targetGain >
            gain
                ? this.noiseGateAttack
                : this.noiseGateRelease;


        gain +=
            (
                targetGain -
                gain
            ) *
            smoothing;


        this.noiseGateGains[
            channel
        ] =
            gain;


        return (
            sample *
            gain
        );
    }


    // ========================================================
    // LOW-PASS FILTER
    // ========================================================

    processLowPass(
        sample,
        channel,
        cutoff,
        stage = 1
    ) {

        const state =
            this.filterStates[
                channel
            ];


        const dt =
            1 /
            sampleRate;


        const rc =
            1 /
            (
                2 *
                Math.PI *
                cutoff
            );


        const alpha =
            dt /
            (
                rc +
                dt
            );


        const key =
            stage === 1
                ? "low1"
                : "low2";


        state[key] +=
            alpha *
            (
                sample -
                state[key]
            );


        return state[key];
    }


    // ========================================================
    // HIGH-PASS FILTER
    // ========================================================

    processHighPass(
        sample,
        channel,
        cutoff,
        stage = 1
    ) {

        const state =
            this.filterStates[
                channel
            ];


        const dt =
            1 /
            sampleRate;


        const rc =
            1 /
            (
                2 *
                Math.PI *
                cutoff
            );


        const alpha =
            rc /
            (
                rc +
                dt
            );


        const inputKey =
            stage === 1
                ? "hpInput1"
                : "hpInput2";


        const outputKey =
            stage === 1
                ? "hpOutput1"
                : "hpOutput2";


        const output =
            alpha *
            (
                state[
                    outputKey
                ] +
                sample -
                state[
                    inputKey
                ]
            );


        state[
            inputKey
        ] =
            sample;


        state[
            outputKey
        ] =
            output;


        return output;
    }


    // ========================================================
    // BAND LIMIT
    // ========================================================

    processBandLimit(
        sample,
        channel,
        lowCut,
        highCut
    ) {

        let output =
            this.processHighPass(
                sample,
                channel,
                lowCut,
                1
            );


        output =
            this.processHighPass(
                output,
                channel,
                lowCut,
                2
            );


        output =
            this.processLowPass(
                output,
                channel,
                highCut,
                1
            );


        output =
            this.processLowPass(
                output,
                channel,
                highCut,
                2
            );


        return output;
    }


    // ========================================================
    // ROBOT
    // ========================================================

    processRobot(
        sample,
        channel
    ) {

        let phase =
            this.robotPhases[
                channel
            ];


        const carrier =
            Math.sin(
                phase
            );


        phase +=
            (
                2 *
                Math.PI *
                this.robotFrequency
            ) /
            sampleRate;


        if (
            phase >=
            2 *
            Math.PI
        ) {
            phase -=
                2 *
                Math.PI;
        }


        this.robotPhases[
            channel
        ] =
            phase;


        return (
            sample *
            carrier
        );
    }


    // ========================================================
    // TREMOLO
    // ========================================================

    processTremolo(
        sample,
        channel
    ) {

        let phase =
            this.tremoloPhases[
                channel
            ];


        const oscillator =
            0.5 +
            0.5 *
            Math.sin(
                phase
            );


        const modulation =
            (
                1 -
                this.tremoloDepth
            ) +
            this.tremoloDepth *
            oscillator;


        phase +=
            (
                2 *
                Math.PI *
                this.tremoloFrequency
            ) /
            sampleRate;


        if (
            phase >=
            2 *
            Math.PI
        ) {
            phase -=
                2 *
                Math.PI;
        }


        this.tremoloPhases[
            channel
        ] =
            phase;


        return (
            sample *
            modulation
        );
    }


    // ========================================================
    // DISTORTION
    // ========================================================

    processDistortion(
        sample
    ) {

        return (
            Math.tanh(
                sample *
                this.distortion
            ) /
            Math.tanh(
                this.distortion
            )
        );
    }


    // ========================================================
    // ECHO
    // ========================================================

    processEcho(
        sample,
        channel
    ) {

        const buffer =
            this.delayBuffers[
                channel
            ];


        let index =
            this.delayIndices[
                channel
            ];


        const delayed =
            buffer[
                index
            ];


        const output =
            sample +
            delayed *
            this.echoWet;


        buffer[
            index
        ] =
            sample +
            delayed *
            this.echoFeedback;


        index++;


        if (
            index >=
            buffer.length
        ) {
            index =
                0;
        }


        this.delayIndices[
            channel
        ] =
            index;


        return output;
    }


    // ========================================================
    // ALIEN
    // ========================================================

    processAlien(
        sample,
        channel
    ) {

        const robotic =
            this.processRobot(
                sample,
                channel
            );


        return this.processEcho(
            robotic,
            channel
        );
    }


    // ========================================================
    // RADIO
    //
    // 300 Hz - 5000 Hz
    // + saturation
    //
    // Removes deep bass and high treble,
    // then adds harmonic distortion.
    // ========================================================

    processRadio(
        sample,
        channel
    ) {

        let output =
            this.processBandLimit(
                sample,
                channel,
                300,
                5000
            );


        output =
            Math.tanh(
                output *
                this.radioDrive
            );


        // Slight volume boost

        return (
            output *
            1.15
        );
    }


    // ========================================================
    // TELEPHONE
    //
    // Traditional speech telephone band:
    // approximately 300 Hz - 3400 Hz.
    // ========================================================

    processTelephone(
        sample,
        channel
    ) {

        let output =
            this.processBandLimit(
                sample,
                channel,
                300,
                3400
            );


        output =
            Math.tanh(
                output *
                this.telephoneDrive
            );


        return (
            output *
            1.1
        );
    }


    // ========================================================
    // READ CIRCULAR BUFFER WITH INTERPOLATION
    // ========================================================

    readPitchBuffer(
        buffer,
        position
    ) {

        const length =
            buffer.length;


        while (
            position <
            0
        ) {
            position +=
                length;
        }


        while (
            position >=
            length
        ) {
            position -=
                length;
        }


        const indexA =
            Math.floor(
                position
            );


        const indexB =
            (
                indexA +
                1
            ) %
            length;


        const fraction =
            position -
            indexA;


        return (
            buffer[
                indexA
            ] *
            (
                1 -
                fraction
            ) +
            buffer[
                indexB
            ] *
            fraction
        );
    }


    // ========================================================
    // GRANULAR PITCH SHIFTER
    //
    // Two overlapping read heads.
    //
    // ratio > 1  -> higher pitch
    // ratio < 1  -> lower pitch
    //
    // This changes pitch while keeping
    // the microphone stream itself real-time.
    // ========================================================

    processPitchShift(
        sample,
        channel,
        ratio
    ) {

        if (
            Math.abs(
                ratio -
                1
            ) <
            0.001
        ) {
            return sample;
        }


        const buffer =
            this.pitchBuffers[
                channel
            ];


        let writeIndex =
            this.pitchWriteIndices[
                channel
            ];


        let phase =
            this.pitchPhases[
                channel
            ];


        buffer[
            writeIndex
        ] =
            sample;


        const grainRange =
            this.pitchGrainSize;


        // Rate required to create
        // requested playback ratio.

        const phaseIncrement =
            Math.abs(
                ratio -
                1
            ) /
            grainRange;


        const phase2 =
            (
                phase +
                0.5
            ) %
            1;


        let delay1;
        let delay2;


        if (
            ratio >
            1
        ) {

            // Higher pitch:
            // delay decreases during grain.

            delay1 =
                this.pitchMinDelay +
                (
                    1 -
                    phase
                ) *
                grainRange;


            delay2 =
                this.pitchMinDelay +
                (
                    1 -
                    phase2
                ) *
                grainRange;

        } else {

            // Lower pitch:
            // delay increases during grain.

            delay1 =
                this.pitchMinDelay +
                phase *
                grainRange;


            delay2 =
                this.pitchMinDelay +
                phase2 *
                grainRange;
        }


        const read1 =
            writeIndex -
            delay1;


        const read2 =
            writeIndex -
            delay2;


        const sample1 =
            this.readPitchBuffer(
                buffer,
                read1
            );


        const sample2 =
            this.readPitchBuffer(
                buffer,
                read2
            );


        // Hann-like overlapping windows.

        const weight1 =
            Math.sin(
                Math.PI *
                phase
            ) ** 2;


        const weight2 =
            Math.sin(
                Math.PI *
                phase2
            ) ** 2;


        const output =
            sample1 *
            weight1 +
            sample2 *
            weight2;


        phase +=
            phaseIncrement;


        if (
            phase >=
            1
        ) {
            phase -=
                1;
        }


        writeIndex++;


        if (
            writeIndex >=
            buffer.length
        ) {
            writeIndex =
                0;
        }


        this.pitchPhases[
            channel
        ] =
            phase;


        this.pitchWriteIndices[
            channel
        ] =
            writeIndex;


        return output;
    }


    // ========================================================
    // CHIPMUNK
    // ========================================================

    processChipmunk(
        sample,
        channel
    ) {

        return this.processPitchShift(
            sample,
            channel,
            this.chipmunkRatio
        );
    }


    // ========================================================
    // DEEP VOICE
    // ========================================================

    processDeepVoice(
        sample,
        channel
    ) {

        let output =
            this.processPitchShift(
                sample,
                channel,
                this.deepRatio
            );


        // Slight warmth after pitch shift.

        output =
            this.processLowPass(
                output,
                channel,
                6500,
                1
            );


        return (
            output *
            1.1
        );
    }


    // ========================================================
    // LIMITER
    // ========================================================

    limitSample(
        sample
    ) {

        return Math.max(
            -1,
            Math.min(
                1,
                sample
            )
        );
    }


    // ========================================================
    // MAIN PROCESS
    // ========================================================

    process(
        inputs,
        outputs
    ) {

        const input =
            inputs[0];


        const output =
            outputs[0];


        if (
            !output ||
            output.length ===
            0
        ) {
            return true;
        }


        if (
            !input ||
            input.length ===
            0
        ) {

            for (
                let channel = 0;
                channel <
                output.length;
                channel++
            ) {
                output[
                    channel
                ].fill(0);
            }


            return true;
        }


        for (
            let channel = 0;
            channel <
            output.length;
            channel++
        ) {

            this.ensureChannelState(
                channel
            );


            const inputChannel =
                input[
                    Math.min(
                        channel,
                        input.length -
                        1
                    )
                ];


            const outputChannel =
                output[
                    channel
                ];


            for (
                let i = 0;
                i <
                outputChannel.length;
                i++
            ) {

                let sample =
                    inputChannel[
                        i
                    ] || 0;


                // ============================================
                // FIRST: NOISE REDUCTION
                // ============================================

                sample =
                    this.processNoiseGate(
                        sample,
                        channel
                    );


                // ============================================
                // EFFECT
                // ============================================

                let processed =
                    sample;


                switch (
                    this.effect
                ) {

                    case "robot":

                        processed =
                            this.processRobot(
                                sample,
                                channel
                            );

                        break;


                    case "alien":

                        processed =
                            this.processAlien(
                                sample,
                                channel
                            );

                        break;


                    case "distortion":

                        processed =
                            this.processDistortion(
                                sample
                            );

                        break;


                    case "echo":

                        processed =
                            this.processEcho(
                                sample,
                                channel
                            );

                        break;


                    case "tremolo":

                        processed =
                            this.processTremolo(
                                sample,
                                channel
                            );

                        break;


                    // ========================================
                    // NEW EFFECTS
                    // ========================================

                    case "radio":

                        processed =
                            this.processRadio(
                                sample,
                                channel
                            );

                        break;


                    case "telephone":

                        processed =
                            this.processTelephone(
                                sample,
                                channel
                            );

                        break;


                    case "chipmunk":

                        processed =
                            this.processChipmunk(
                                sample,
                                channel
                            );

                        break;


                    case "deep":

                        processed =
                            this.processDeepVoice(
                                sample,
                                channel
                            );

                        break;


                    case "normal":

                    default:

                        processed =
                            sample;

                        break;
                }


                outputChannel[
                    i
                ] =
                    this.limitSample(
                        processed
                    );
            }
        }


        return true;
    }
}


registerProcessor(
    "voice-effects-processor",
    VoiceEffectsProcessor
);