
export const TARGET_SAMPLE_RATE =
    96000;


// ============================================================
// DECODE AUDIO DIRECTLY AT TARGET SAMPLE RATE
// ============================================================

export const decodeAudioBlob =
    async (
        blob,
        targetSampleRate =
            TARGET_SAMPLE_RATE
    ) => {

        if (!blob) {
            throw new Error(
                "No audio blob provided."
            );
        }


        const arrayBuffer =
            await blob.arrayBuffer();


        /*
            IMPORTANT

            Do NOT use:

                new AudioContext()

            here.

            A normal AudioContext commonly runs
            at 44.1 kHz or 48 kHz.

            Our hidden signal lives around 30 kHz.

            At 48 kHz:

                Nyquist = 24 kHz

            meaning the 30 kHz hidden channel
            would be destroyed while decoding.

            OfflineAudioContext allows us to
            decode directly into a 96 kHz context.
        */


        const offlineContext =
            new OfflineAudioContext(
                2,
                1,
                targetSampleRate
            );


        const decodedBuffer =
            await offlineContext
                .decodeAudioData(
                    arrayBuffer.slice(0)
                );


        console.log(
            "Requested sample rate:",
            targetSampleRate
        );


        console.log(
            "Actually decoded sample rate:",
            decodedBuffer.sampleRate
        );


        console.log(
            "Decoded channels:",
            decodedBuffer.numberOfChannels
        );


        console.log(
            "Decoded duration:",
            decodedBuffer.duration
        );


        return decodedBuffer;
    };


// ============================================================
// CONVERT AUDIO BUFFER TO MONO
// ============================================================

export const audioBufferToMono =
    (
        buffer
    ) => {

        if (!buffer) {
            throw new Error(
                "AudioBuffer is required."
            );
        }


        const length =
            buffer.length;


        const channels =
            buffer.numberOfChannels;


        const mono =
            new Float32Array(
                length
            );


        for (
            let channel = 0;
            channel < channels;
            channel++
        ) {

            const channelData =
                buffer.getChannelData(
                    channel
                );


            for (
                let i = 0;
                i < length;
                i++
            ) {

                mono[i] +=
                    channelData[i] /
                    channels;
            }
        }


        return mono;
    };


// ============================================================
// COPY AUDIO BUFFER CHANNELS
// ============================================================

export const audioBufferToChannels =
    (
        buffer
    ) => {

        if (!buffer) {
            throw new Error(
                "AudioBuffer is required."
            );
        }


        const channels =
            [];


        for (
            let channel = 0;
            channel <
            buffer.numberOfChannels;
            channel++
        ) {

            channels.push(
                new Float32Array(
                    buffer.getChannelData(
                        channel
                    )
                )
            );
        }


        return channels;
    };