// import {
//     decodeAudioBlob,
//     audioBufferToMono,
// } from "./audioUtils";

// import {
//     lowPassBuffer,
//     highPassBuffer,
// } from "./filters";

// import {
//     SECRET_SAMPLE_RATE,
//     SECRET_CARRIER,
//     SECRET_BANDWIDTH,
// } from "./encodeAudio";


// // ============================================================
// // CREATE MONO AUDIO BUFFER
// // ============================================================

// const createMonoAudioBuffer = (
//     samples,
//     sampleRate
// ) => {

//     const context =
//         new OfflineAudioContext(
//             1,
//             samples.length,
//             sampleRate
//         );


//     const buffer =
//         context.createBuffer(
//             1,
//             samples.length,
//             sampleRate
//         );


//     buffer
//         .getChannelData(0)
//         .set(samples);


//     return buffer;
// };


// // ============================================================
// // REMOVE DC OFFSET
// // ============================================================

// const removeDC = (
//     samples
// ) => {

//     if (
//         samples.length ===
//         0
//     ) {
//         return samples;
//     }


//     let mean =
//         0;


//     for (
//         let i = 0;
//         i < samples.length;
//         i++
//     ) {
//         mean +=
//             samples[i];
//     }


//     mean /=
//         samples.length;


//     const result =
//         new Float32Array(
//             samples.length
//         );


//     for (
//         let i = 0;
//         i < samples.length;
//         i++
//     ) {
//         result[i] =
//             samples[i] -
//             mean;
//     }


//     return result;
// };


// // ============================================================
// // CALCULATE RMS
// // ============================================================

// const calculateRMS = (
//     samples
// ) => {

//     if (
//         samples.length ===
//         0
//     ) {
//         return 0;
//     }


//     let energy =
//         0;


//     for (
//         let i = 0;
//         i < samples.length;
//         i++
//     ) {
//         energy +=
//             samples[i] *
//             samples[i];
//     }


//     return Math.sqrt(
//         energy /
//         samples.length
//     );
// };


// // ============================================================
// // DEMODULATE SECRET
// // ============================================================

// const demodulateSecret = (
//     encodedSamples,
//     sampleRate,
//     carrierFrequency
// ) => {

//     const output =
//         new Float32Array(
//             encodedSamples.length
//         );


//     const angularStep =
//         (
//             2 *
//             Math.PI *
//             carrierFrequency
//         ) /
//         sampleRate;


//     for (
//         let i = 0;
//         i < encodedSamples.length;
//         i++
//     ) {

//         const oscillator =
//             Math.cos(
//                 angularStep *
//                 i
//             );


//         output[i] =
//             2 *
//             encodedSamples[i] *
//             oscillator;
//     }


//     return output;
// };


// // ============================================================
// // NOISE GATE
// // ============================================================

// const applyNoiseGate = (
//     samples,
//     {
//         frameSize = 480,
//         thresholdRatio = 0.04,
//         floorGain = 0.08,
//         attack = 0.45,
//         release = 0.10,
//     } = {}
// ) => {

//     if (
//         samples.length ===
//         0
//     ) {
//         return samples;
//     }


//     const output =
//         new Float32Array(
//             samples.length
//         );


//     let maxRms =
//         0;


//     // --------------------------------------------------------
//     // FIND MAX FRAME RMS
//     // --------------------------------------------------------

//     for (
//         let start = 0;
//         start < samples.length;
//         start += frameSize
//     ) {

//         const end =
//             Math.min(
//                 start +
//                     frameSize,
//                 samples.length
//             );


//         let energy =
//             0;


//         for (
//             let i = start;
//             i < end;
//             i++
//         ) {
//             energy +=
//                 samples[i] *
//                 samples[i];
//         }


//         const rms =
//             Math.sqrt(
//                 energy /
//                 Math.max(
//                     1,
//                     end -
//                         start
//                 )
//             );


//         if (
//             rms >
//             maxRms
//         ) {
//             maxRms =
//                 rms;
//         }
//     }


//     const threshold =
//         maxRms *
//         thresholdRatio;


//     let currentGain =
//         1;


//     // --------------------------------------------------------
//     // APPLY SMOOTH GATING
//     // --------------------------------------------------------

//     for (
//         let start = 0;
//         start < samples.length;
//         start += frameSize
//     ) {

//         const end =
//             Math.min(
//                 start +
//                     frameSize,
//                 samples.length
//             );


//         let energy =
//             0;


//         for (
//             let i = start;
//             i < end;
//             i++
//         ) {
//             energy +=
//                 samples[i] *
//                 samples[i];
//         }


//         const rms =
//             Math.sqrt(
//                 energy /
//                 Math.max(
//                     1,
//                     end -
//                         start
//                 )
//             );


//         const targetGain =
//             rms >= threshold
//                 ? 1
//                 : floorGain;


//         const smoothing =
//             targetGain >
//             currentGain
//                 ? attack
//                 : release;


//         currentGain +=
//             (
//                 targetGain -
//                 currentGain
//             ) *
//             smoothing;


//         for (
//             let i = start;
//             i < end;
//             i++
//         ) {
//             output[i] =
//                 samples[i] *
//                 currentGain;
//         }
//     }


//     return output;
// };


// // ============================================================
// // NORMALIZE RECOVERED VOICE
// // ============================================================

// const normalizeRecovered = (
//     samples,
//     {
//         targetPeak = 0.90,
//         extraGain = 1.5,
//     } = {}
// ) => {

//     let peak =
//         0;


//     for (
//         let i = 0;
//         i < samples.length;
//         i++
//     ) {

//         const magnitude =
//             Math.abs(
//                 samples[i]
//             );


//         if (
//             magnitude >
//             peak
//         ) {
//             peak =
//                 magnitude;
//         }
//     }


//     if (
//         peak <
//         1e-8
//     ) {

//         console.warn(
//             "Recovered signal is almost silent."
//         );


//         return new Float32Array(
//             samples
//         );
//     }


//     const normalizationGain =
//         targetPeak /
//         peak;


//     const output =
//         new Float32Array(
//             samples.length
//         );


//     for (
//         let i = 0;
//         i < samples.length;
//         i++
//     ) {

//         const amplified =
//             samples[i] *
//             normalizationGain *
//             extraGain;


//         // Soft limiter
//         output[i] =
//             Math.tanh(
//                 amplified
//             );
//     }


//     return output;
// };


// // ============================================================
// // DECODE SECRET AUDIO
// // ============================================================

// export const decodeSecretAudio =
//     async (
//         encodedBlob,
//         {
//             carrierFrequency =
//                 SECRET_CARRIER,

//             secretBandwidth =
//                 SECRET_BANDWIDTH,
//         } = {}
//     ) => {

//         console.log(
//             "Starting secret decoder..."
//         );


//         console.log(
//             "Carrier:",
//             carrierFrequency
//         );


//         console.log(
//             "Secret bandwidth:",
//             secretBandwidth
//         );


//         // ====================================================
//         // 1. DECODE AND RESAMPLE TO 96 kHz
//         // ====================================================

//         const encodedBuffer =
//             await decodeAudioBlob(
//                 encodedBlob,
//                 SECRET_SAMPLE_RATE
//             );


//         console.log(
//             "Decoded sample rate:",
//             encodedBuffer.sampleRate
//         );


//         console.log(
//             "Decoded channels:",
//             encodedBuffer.numberOfChannels
//         );


//         console.log(
//             "Decoded duration:",
//             encodedBuffer.duration
//         );


//         // ====================================================
//         // 2. GENTLY ISOLATE ULTRASONIC SECRET REGION
//         //
//         // Actual secret is roughly 24–36 kHz.
//         //
//         // We use a wider 22–38 kHz region
//         // so we do not aggressively destroy it.
//         // ====================================================

//         const ultrasonicHighPassed =
//             await highPassBuffer(
//                 encodedBuffer,
//                 22000,
//                 1
//             );


//         const hiddenBandBuffer =
//             await lowPassBuffer(
//                 ultrasonicHighPassed,
//                 38000,
//                 1
//             );


//         // ====================================================
//         // 3. CONVERT HIDDEN BAND TO MONO
//         // ====================================================

//         const hiddenMono =
//             audioBufferToMono(
//                 hiddenBandBuffer
//             );


//         console.log(
//             "Hidden-band RMS:",
//             calculateRMS(
//                 hiddenMono
//             )
//         );


//         // ====================================================
//         // 4. DEMODULATE FROM 30 kHz BACK TO BASEBAND
//         // ====================================================

//         const demodulated =
//             demodulateSecret(
//                 hiddenMono,
//                 SECRET_SAMPLE_RATE,
//                 carrierFrequency
//             );


//         console.log(
//             "Demodulated RMS:",
//             calculateRMS(
//                 demodulated
//             )
//         );


//         // ====================================================
//         // 5. CREATE TEMPORARY AUDIO BUFFER
//         // ====================================================

//         const demodulatedBuffer =
//             createMonoAudioBuffer(
//                 demodulated,
//                 SECRET_SAMPLE_RATE
//             );


//         // ====================================================
//         // 6. REMOVE HIGH-FREQUENCY NOISE
//         //
//         // Recovered voice only needs roughly
//         // up to 5.5 kHz.
//         // ====================================================

//         const voiceLowPassed =
//             await lowPassBuffer(
//                 demodulatedBuffer,
//                 Math.min(
//                     secretBandwidth,
//                     5500
//                 ),
//                 3
//             );


//         // ====================================================
//         // 7. REMOVE LOW-FREQUENCY RUMBLE
//         // ====================================================

//         const recoveredBuffer =
//             await highPassBuffer(
//                 voiceLowPassed,
//                 180,
//                 2
//             );


//         // ====================================================
//         // 8. CONVERT BACK TO FLOAT32
//         // ====================================================

//         let recovered =
//             audioBufferToMono(
//                 recoveredBuffer
//             );


//         console.log(
//             "Recovered RMS before cleanup:",
//             calculateRMS(
//                 recovered
//             )
//         );


//         // ====================================================
//         // 9. REMOVE DC OFFSET
//         // ====================================================

//         recovered =
//             removeDC(
//                 recovered
//             );


//         // ====================================================
//         // 10. REDUCE QUIET BACKGROUND NOISE
//         // ====================================================

//         recovered =
//             applyNoiseGate(
//                 recovered,
//                 {
//                     frameSize:
//                         480,

//                     thresholdRatio:
//                         0.04,

//                     floorGain:
//                         0.06,

//                     attack:
//                         0.45,

//                     release:
//                         0.10,
//                 }
//             );


//         // ====================================================
//         // 11. NORMALIZE WITHOUT OVER-AMPLIFYING NOISE
//         // ====================================================

//         recovered =
//             normalizeRecovered(
//                 recovered,
//                 {
//                     targetPeak:
//                         0.90,

//                     extraGain:
//                         1.5,
//                 }
//             );


//         console.log(
//             "Final recovered RMS:",
//             calculateRMS(
//                 recovered
//             )
//         );


//         // ====================================================
//         // 12. RETURN
//         // ====================================================

//         return {
//             channels: [
//                 recovered,
//             ],

//             sampleRate:
//                 SECRET_SAMPLE_RATE,

//             carrierFrequency,

//             secretBandwidth,

//             duration:
//                 recovered.length /
//                 SECRET_SAMPLE_RATE,
//         };
//     };
import {
    decodeAudioBlob,
    audioBufferToMono,
} from "./audioUtils";

import {
    lowPassBuffer,
    highPassBuffer,
} from "./filters";

import {
    SECRET_SAMPLE_RATE,
    SECRET_CARRIER,
    SECRET_BANDWIDTH,
} from "./encodeAudio";


// ============================================================
// CREATE MONO AUDIO BUFFER
// ============================================================

const createMonoAudioBuffer = (
    samples,
    sampleRate
) => {

    const context =
        new OfflineAudioContext(
            1,
            samples.length,
            sampleRate
        );


    const buffer =
        context.createBuffer(
            1,
            samples.length,
            sampleRate
        );


    buffer
        .getChannelData(0)
        .set(samples);


    return buffer;
};


// ============================================================
// REMOVE DC OFFSET
// ============================================================

const removeDC = (
    samples
) => {

    if (
        samples.length ===
        0
    ) {
        return samples;
    }


    let mean =
        0;


    for (
        let i = 0;
        i < samples.length;
        i++
    ) {

        mean +=
            samples[i];
    }


    mean /=
        samples.length;


    const output =
        new Float32Array(
            samples.length
        );


    for (
        let i = 0;
        i < samples.length;
        i++
    ) {

        output[i] =
            samples[i] -
            mean;
    }


    return output;
};


// ============================================================
// CALCULATE RMS
// ============================================================

const calculateRMS = (
    samples
) => {

    if (
        samples.length ===
        0
    ) {
        return 0;
    }


    let energy =
        0;


    for (
        let i = 0;
        i < samples.length;
        i++
    ) {

        energy +=
            samples[i] *
            samples[i];
    }


    return Math.sqrt(
        energy /
        samples.length
    );
};


// ============================================================
// FIND PEAK
// ============================================================

const findPeak = (
    samples
) => {

    let peak =
        0;


    for (
        let i = 0;
        i < samples.length;
        i++
    ) {

        const magnitude =
            Math.abs(
                samples[i]
            );


        if (
            magnitude >
            peak
        ) {

            peak =
                magnitude;
        }
    }


    return peak;
};


// ============================================================
// DEMODULATE SECRET
// ============================================================

const demodulateSecret = (
    encodedSamples,
    sampleRate,
    carrierFrequency
) => {

    const output =
        new Float32Array(
            encodedSamples.length
        );


    const angularStep =
        (
            2 *
            Math.PI *
            carrierFrequency
        ) /
        sampleRate;


    for (
        let i = 0;
        i < encodedSamples.length;
        i++
    ) {

        const carrier =
            Math.cos(
                angularStep *
                i
            );


        /*
            Encoder:

                hidden =
                    secret *
                    cos(wc * n)


            Decoder:

                hidden *
                2cos(wc * n)


            Therefore:

                2s cos²(wc*n)

                = s +
                  s cos(2wc*n)


            The low-pass filter later
            removes the high-frequency
            second term.

            What remains is approximately:

                secret
        */

        output[i] =
            encodedSamples[i] *
            carrier *
            2;
    }


    return output;
};


// ============================================================
// NORMALIZE RECOVERED VOICE
// ============================================================

const normalizeRecovered = (
    samples,
    {
        targetPeak = 0.95,
        extraGain = 1.25,
    } = {}
) => {

    const peak =
        findPeak(
            samples
        );


    console.log(
        "Recovered peak before normalization:",
        peak
    );


    console.log(
        "Recovered RMS before normalization:",
        calculateRMS(
            samples
        )
    );


    if (
        peak <
        1e-8
    ) {

        console.warn(
            "Recovered signal is almost silent."
        );


        return new Float32Array(
            samples
        );
    }


    const normalizationGain =
        targetPeak /
        peak;


    const output =
        new Float32Array(
            samples.length
        );


    for (
        let i = 0;
        i < samples.length;
        i++
    ) {

        const amplified =
            samples[i] *
            normalizationGain *
            extraGain;


        /*
            Soft limiting prevents
            harsh clipping.

            This is intentionally mild.
        */

        output[i] =
            Math.tanh(
                amplified
            );
    }


    return output;
};


// ============================================================
// DECODE SECRET AUDIO
// ============================================================

export const decodeSecretAudio =
    async (
        encodedBlob,
        {
            carrierFrequency =
                SECRET_CARRIER,

            secretBandwidth =
                SECRET_BANDWIDTH,
        } = {}
    ) => {

        console.log(
            "======================================"
        );

        console.log(
            "Starting secret decoder"
        );

        console.log(
            "======================================"
        );


        console.log(
            "Target sample rate:",
            SECRET_SAMPLE_RATE
        );


        console.log(
            "Carrier frequency:",
            carrierFrequency
        );


        console.log(
            "Secret bandwidth:",
            secretBandwidth
        );


        // ====================================================
        // 1. DECODE AUDIO
        //
        // IMPORTANT:
        //
        // audioUtils.js must preserve / decode at 96 kHz.
        //
        // If this becomes 48 kHz, a 30 kHz carrier cannot
        // survive correctly because Nyquist would be 24 kHz.
        // ====================================================

        const encodedBuffer =
            await decodeAudioBlob(
                encodedBlob,
                SECRET_SAMPLE_RATE
            );


        console.log(
            "Actual decoded sample rate:",
            encodedBuffer.sampleRate
        );


        console.log(
            "Number of channels:",
            encodedBuffer.numberOfChannels
        );


        console.log(
            "Duration:",
            encodedBuffer.duration
        );


        if (
            encodedBuffer.sampleRate !==
            SECRET_SAMPLE_RATE
        ) {

            console.warn(
                `Expected ${SECRET_SAMPLE_RATE} Hz but got ${encodedBuffer.sampleRate} Hz`
            );
        }


        // ====================================================
        // 2. CONVERT ENCODED AUDIO TO MONO
        //
        // Do NOT apply the previous 22–38 kHz band-pass here.
        //
        // It was weakening the hidden signal too much.
        // ====================================================

        const encodedMono =
            audioBufferToMono(
                encodedBuffer
            );


        console.log(
            "Encoded samples:",
            encodedMono.length
        );


        console.log(
            "Encoded RMS:",
            calculateRMS(
                encodedMono
            )
        );


        console.log(
            "Encoded peak:",
            findPeak(
                encodedMono
            )
        );


        // ====================================================
        // 3. SYNCHRONOUS DEMODULATION
        //
        // Multiply by the same 30 kHz carrier used during
        // encoding.
        //
        // This shifts the hidden speech back down to its
        // original audible frequency range.
        // ====================================================

        const demodulated =
            demodulateSecret(
                encodedMono,
                encodedBuffer.sampleRate,
                carrierFrequency
            );


        console.log(
            "Demodulated RMS:",
            calculateRMS(
                demodulated
            )
        );


        console.log(
            "Demodulated peak:",
            findPeak(
                demodulated
            )
        );


        // ====================================================
        // 4. CREATE BUFFER FOR FILTERING
        // ====================================================

        const demodulatedBuffer =
            createMonoAudioBuffer(
                demodulated,
                encodedBuffer.sampleRate
            );


        // ====================================================
        // 5. LOW-PASS FILTER
        //
        // Secret voice was originally limited to around
        // 0–6 kHz.
        //
        // Demodulation also creates high-frequency components.
        // This removes those.
        // ====================================================

        const voiceLowPassed =
            await lowPassBuffer(
                demodulatedBuffer,
                Math.min(
                    secretBandwidth,
                    6000
                ),
                4
            );


        // ====================================================
        // 6. HIGH-PASS FILTER
        //
        // Remove very low-frequency DC / rumble while keeping
        // essentially all useful speech.
        //
        // 100 Hz is deliberately gentle.
        // ====================================================

        const voiceFiltered =
            await highPassBuffer(
                voiceLowPassed,
                100,
                2
            );


        // ====================================================
        // 7. CONVERT FILTERED AUDIO TO ARRAY
        // ====================================================

        let recovered =
            audioBufferToMono(
                voiceFiltered
            );


        console.log(
            "Filtered RMS:",
            calculateRMS(
                recovered
            )
        );


        console.log(
            "Filtered peak:",
            findPeak(
                recovered
            )
        );


        // ====================================================
        // 8. REMOVE DC OFFSET
        // ====================================================

        recovered =
            removeDC(
                recovered
            );


        // ====================================================
        // 9. NORMALIZE
        //
        // Do not use huge extra gain here.
        //
        // Very large gain also makes background noise louder.
        // ====================================================

        recovered =
            normalizeRecovered(
                recovered,
                {
                    targetPeak:
                        0.95,

                    extraGain:
                        1.25,
                }
            );


        // ====================================================
        // 10. FINAL DEBUG INFORMATION
        // ====================================================

        console.log(
            "Final recovered RMS:",
            calculateRMS(
                recovered
            )
        );


        console.log(
            "Final recovered peak:",
            findPeak(
                recovered
            )
        );


        console.log(
            "Decoder finished"
        );


        console.log(
            "======================================"
        );


        // ====================================================
        // 11. RETURN RESULT
        // ====================================================

        return {

            channels: [
                recovered,
            ],

            sampleRate:
                encodedBuffer.sampleRate,

            carrierFrequency,

            secretBandwidth,

            duration:
                recovered.length /
                encodedBuffer.sampleRate,
        };
    };