// ============================================================
// GENERIC FILTER
// ============================================================

const filterAudioBuffer =
    async (
        buffer,
        type,
        frequency,
        stages = 2
    ) => {

        const offline =
            new OfflineAudioContext(
                buffer.numberOfChannels,
                buffer.length,
                buffer.sampleRate
            );


        const source =
            offline.createBufferSource();


        source.buffer =
            buffer;


        let previous =
            source;


        for (
            let i = 0;
            i < stages;
            i++
        ) {
            const filter =
                offline.createBiquadFilter();


            filter.type =
                type;


            filter.frequency.value =
                frequency;


            filter.Q.value =
                0.707;


            previous.connect(
                filter
            );


            previous =
                filter;
        }


        previous.connect(
            offline.destination
        );


        source.start(0);


        return await offline
            .startRendering();
    };


// ============================================================
// LOW PASS
// ============================================================

export const lowPassBuffer =
    (
        buffer,
        cutoff,
        stages = 2
    ) => {

        return filterAudioBuffer(
            buffer,
            "lowpass",
            cutoff,
            stages
        );
    };


// ============================================================
// HIGH PASS
// ============================================================

export const highPassBuffer =
    (
        buffer,
        cutoff,
        stages = 2
    ) => {

        return filterAudioBuffer(
            buffer,
            "highpass",
            cutoff,
            stages
        );
    };


// ============================================================
// BAND PASS
// ============================================================

export const bandPassBuffer =
    async (
        buffer,
        lowCutoff,
        highCutoff,
        stages = 3
    ) => {

        const highPassed =
            await highPassBuffer(
                buffer,
                lowCutoff,
                stages
            );


        const bandPassed =
            await lowPassBuffer(
                highPassed,
                highCutoff,
                stages
            );


        return bandPassed;
    };