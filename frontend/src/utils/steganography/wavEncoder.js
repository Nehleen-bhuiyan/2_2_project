const writeString = (
    view,
    offset,
    value
) => {

    for (
        let i = 0;
        i < value.length;
        i++
    ) {
        view.setUint8(
            offset + i,
            value.charCodeAt(
                i
            )
        );
    }
};


// ============================================================
// FLOAT -> PCM16
// ============================================================

const floatToPCM16 = (
    value
) => {

    const clipped =
        Math.max(
            -1,
            Math.min(
                1,
                value
            )
        );


    return clipped < 0
        ? clipped * 0x8000
        : clipped * 0x7fff;
};


// ============================================================
// ENCODE WAV
// ============================================================

export const encodeWav = ({
    channels,
    sampleRate,
}) => {

    if (
        !channels ||
        channels.length === 0
    ) {
        throw new Error(
            "No audio channels supplied."
        );
    }


    const channelCount =
        channels.length;


    const frameCount =
        channels[0].length;


    const bytesPerSample =
        2;


    const blockAlign =
        channelCount *
        bytesPerSample;


    const byteRate =
        sampleRate *
        blockAlign;


    const dataSize =
        frameCount *
        blockAlign;


    const buffer =
        new ArrayBuffer(
            44 +
            dataSize
        );


    const view =
        new DataView(
            buffer
        );


    // RIFF
    writeString(
        view,
        0,
        "RIFF"
    );


    view.setUint32(
        4,
        36 + dataSize,
        true
    );


    writeString(
        view,
        8,
        "WAVE"
    );


    // fmt
    writeString(
        view,
        12,
        "fmt "
    );


    view.setUint32(
        16,
        16,
        true
    );


    // PCM
    view.setUint16(
        20,
        1,
        true
    );


    view.setUint16(
        22,
        channelCount,
        true
    );


    view.setUint32(
        24,
        sampleRate,
        true
    );


    view.setUint32(
        28,
        byteRate,
        true
    );


    view.setUint16(
        32,
        blockAlign,
        true
    );


    view.setUint16(
        34,
        16,
        true
    );


    // data
    writeString(
        view,
        36,
        "data"
    );


    view.setUint32(
        40,
        dataSize,
        true
    );


    // --------------------------------------------------------
    // INTERLEAVE CHANNELS
    // --------------------------------------------------------

    let offset =
        44;


    for (
        let frame = 0;
        frame < frameCount;
        frame++
    ) {
        for (
            let channel = 0;
            channel < channelCount;
            channel++
        ) {
            view.setInt16(
                offset,
                floatToPCM16(
                    channels[channel][
                        frame
                    ]
                ),
                true
            );


            offset +=
                bytesPerSample;
        }
    }


    return new Blob(
        [
            buffer,
        ],
        {
            type:
                "audio/wav",
        }
    );
};