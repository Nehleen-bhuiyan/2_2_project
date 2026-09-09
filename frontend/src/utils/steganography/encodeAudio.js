import {
    decodeAudioBlob,
    audioBufferToMono,
    audioBufferToChannels,
} from "./audioUtils";

import {
    lowPassBuffer,
} from "./filters";


export const SECRET_SAMPLE_RATE =
    96000;

export const SECRET_CARRIER =
    30000;

export const SECRET_BANDWIDTH =
    6000;


// ============================================================
// NORMALIZE OUTPUT
// ============================================================

const preventClipping = (
    channels,
    targetPeak = 0.97
) => {

    let peak =
        0;


    for (
        const channel
        of channels
    ) {
        for (
            let i = 0;
            i < channel.length;
            i++
        ) {
            peak =
                Math.max(
                    peak,
                    Math.abs(
                        channel[i]
                    )
                );
        }
    }


    if (
        peak <=
        targetPeak
    ) {
        return channels;
    }


    const scale =
        targetPeak /
        peak;


    return channels.map(
        (channel) => {

            const output =
                new Float32Array(
                    channel.length
                );


            for (
                let i = 0;
                i < channel.length;
                i++
            ) {
                output[i] =
                    channel[i] *
                    scale;
            }


            return output;
        }
    );
};


// ============================================================
// MODULATE SECRET INTO ULTRASONIC BAND
// ============================================================

const modulateSecret = (
    secret,
    sampleRate,
    carrierFrequency
) => {

    const output =
        new Float32Array(
            secret.length
        );


    const angularStep =
        2 *
        Math.PI *
        carrierFrequency /
        sampleRate;


    for (
        let i = 0;
        i < secret.length;
        i++
    ) {
        output[i] =
            secret[i] *
            Math.cos(
                angularStep *
                i
            );
    }


    return output;
};


// ============================================================
// ENCODE SECRET AUDIO
// ============================================================

export const encodeSecretAudio =
    async (
        audibleBlob,
        secretBlob,
        {
            hiddenLevel = 0.12,
            carrierFrequency =
                SECRET_CARRIER,
            secretBandwidth =
                SECRET_BANDWIDTH,
        } = {}
    ) => {

        // ----------------------------------------------------
        // DECODE + RESAMPLE BOTH TO 96 kHz
        // ----------------------------------------------------

        const audibleBuffer =
            await decodeAudioBlob(
                audibleBlob,
                SECRET_SAMPLE_RATE
            );


        const secretBuffer =
            await decodeAudioBlob(
                secretBlob,
                SECRET_SAMPLE_RATE
            );


        // ----------------------------------------------------
        // FILTER CARRIER AUDIO
        //
        // Remove unnecessary high-frequency material so that
        // the ultrasonic hidden channel has clean space.
        // ----------------------------------------------------

        const audibleFiltered =
            await lowPassBuffer(
                audibleBuffer,
                18000,
                2
            );


        // ----------------------------------------------------
        // FILTER SECRET VOICE
        //
        // Voice does not need huge bandwidth.
        // 6 kHz is enough for intelligible speech.
        // ----------------------------------------------------

        const secretFiltered =
            await lowPassBuffer(
                secretBuffer,
                secretBandwidth,
                3
            );


        // ----------------------------------------------------
        // SECRET -> MONO
        // ----------------------------------------------------

        const secretMono =
            audioBufferToMono(
                secretFiltered
            );


        // ----------------------------------------------------
        // FREQUENCY TRANSLATION
        // ----------------------------------------------------

        const modulatedSecret =
            modulateSecret(
                secretMono,
                SECRET_SAMPLE_RATE,
                carrierFrequency
            );


        // ----------------------------------------------------
        // AUDIBLE CHANNELS
        // ----------------------------------------------------

        let audibleChannels =
            audioBufferToChannels(
                audibleFiltered
            );


        // Always create stereo output
        if (
            audibleChannels.length ===
            1
        ) {
            audibleChannels = [
                audibleChannels[0],
                new Float32Array(
                    audibleChannels[0]
                ),
            ];
        }


        if (
            audibleChannels.length >
            2
        ) {
            audibleChannels =
                audibleChannels.slice(
                    0,
                    2
                );
        }


        // ----------------------------------------------------
        // OUTPUT LENGTH
        //
        // Keep enough room for either audio.
        // ----------------------------------------------------

        const outputLength =
            Math.max(
                audibleChannels[0]
                    .length,
                modulatedSecret.length
            );


        const left =
            new Float32Array(
                outputLength
            );


        const right =
            new Float32Array(
                outputLength
            );


        // ----------------------------------------------------
        // COPY NORMAL AUDIBLE AUDIO
        // ----------------------------------------------------

        left.set(
            audibleChannels[0]
                .subarray(
                    0,
                    Math.min(
                        audibleChannels[0]
                            .length,
                        outputLength
                    )
                )
        );


        right.set(
            audibleChannels[1]
                .subarray(
                    0,
                    Math.min(
                        audibleChannels[1]
                            .length,
                        outputLength
                    )
                )
        );


        // ----------------------------------------------------
        // MIX HIDDEN CHANNEL
        //
        // Put same hidden signal in L and R.
        // ----------------------------------------------------

        for (
            let i = 0;
            i <
            modulatedSecret.length;
            i++
        ) {
            const hidden =
                modulatedSecret[i] *
                hiddenLevel;


            left[i] +=
                hidden;


            right[i] +=
                hidden;
        }


        const safeChannels =
            preventClipping([
                left,
                right,
            ]);


        return {
            channels:
                safeChannels,

            sampleRate:
                SECRET_SAMPLE_RATE,

            carrierFrequency,

            secretBandwidth,

            hiddenLevel,

            duration:
                outputLength /
                SECRET_SAMPLE_RATE,
        };
    };