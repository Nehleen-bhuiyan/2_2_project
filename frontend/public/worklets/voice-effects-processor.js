class VoiceEffectsProcessor
    extends AudioWorkletProcessor {

    constructor() {

        super();


        this.effect =
            "normal";


        this.phase =
            0;


        this.robotFrequency =
            70;


        this.tremoloFrequency =
            5;


        this.tremoloDepth =
            0.7;


        this.distortion =
            4;


        this.delaySamples =
            Math.floor(
                sampleRate *
                0.18
            );


        this.delayBuffer =
            new Float32Array(
                sampleRate
            );


        this.delayIndex =
            0;


        this.port.onmessage =
            (event) => {

                const data =
                    event.data;


                if (
                    data.type ===
                    "effect"
                ) {

                    this.effect =
                        data.effect;
                }


                if (
                    data.type ===
                    "parameter"
                ) {

                    this[
                        data.name
                    ] =
                        data.value;
                }
            };
    }


    // ========================================================
    // ROBOT
    // ========================================================

    processRobot(
        sample
    ) {

        const carrier =
            Math.sin(
                this.phase
            );


        this.phase +=
            (
                2 *
                Math.PI *
                this.robotFrequency
            ) /
            sampleRate;


        if (
            this.phase >
            Math.PI *
            2
        ) {

            this.phase -=
                Math.PI *
                2;
        }


        return sample *
            carrier;
    }


    // ========================================================
    // TREMOLO
    // ========================================================

    processTremolo(
        sample
    ) {

        const modulation =
            (
                1 -
                this.tremoloDepth
            ) +
            this.tremoloDepth *
            (
                0.5 +
                0.5 *
                Math.sin(
                    this.phase
                )
            );


        this.phase +=
            (
                2 *
                Math.PI *
                this.tremoloFrequency
            ) /
            sampleRate;


        if (
            this.phase >
            Math.PI *
            2
        ) {

            this.phase -=
                Math.PI *
                2;
        }


        return sample *
            modulation;
    }


    // ========================================================
    // DISTORTION
    // ========================================================

    processDistortion(
        sample
    ) {

        return Math.tanh(
            sample *
            this.distortion
        );
    }


    // ========================================================
    // ECHO
    // ========================================================

    processEcho(
        sample
    ) {

        const delayed =
            this.delayBuffer[
                this.delayIndex
            ];


        const output =
            sample +
            delayed *
            0.5;


        this.delayBuffer[
            this.delayIndex
        ] =
            sample +
            delayed *
            0.65;


        this.delayIndex++;


        if (
            this.delayIndex >=
            this.delaySamples
        ) {

            this.delayIndex =
                0;
        }


        return output;
    }


    // ========================================================
    // ALIEN
    // ========================================================

    processAlien(
        sample
    ) {

        const robotic =
            this.processRobot(
                sample
            );


        return this.processEcho(
            robotic
        );
    }


    // ========================================================
    // MAIN PROCESSING
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
            !input ||
            input.length === 0
        ) {

            return true;
        }


        for (
            let channel = 0;
            channel < output.length;
            channel++
        ) {

            const inputChannel =
                input[
                    Math.min(
                        channel,
                        input.length - 1
                    )
                ];


            const outputChannel =
                output[channel];


            for (
                let i = 0;
                i <
                outputChannel.length;
                i++
            ) {

                const sample =
                    inputChannel[i] || 0;


                let processed =
                    sample;


                switch (
                    this.effect
                ) {

                    case "robot":

                        processed =
                            this.processRobot(
                                sample
                            );

                        break;


                    case "tremolo":

                        processed =
                            this.processTremolo(
                                sample
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
                                sample
                            );

                        break;


                    case "alien":

                        processed =
                            this.processAlien(
                                sample
                            );

                        break;


                    case "normal":

                    default:

                        processed =
                            sample;

                        break;
                }


                // Safety limiter

                outputChannel[i] =
                    Math.max(
                        -1,
                        Math.min(
                            1,
                            processed
                        )
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