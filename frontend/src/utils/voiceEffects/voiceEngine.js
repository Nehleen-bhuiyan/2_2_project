export class VoiceEffectEngine {

    constructor() {

        this.audioContext = null;

        this.stream = null;

        this.sourceNode = null;

        this.workletNode = null;

        this.outputGain = null;

        this.destinationNode = null;

        this.started = false;
    }


    // ========================================================
    // START MICROPHONE
    // ========================================================

    async start() {

        if (this.started) {
            return;
        }


        // ----------------------------------------------------
        // GET MICROPHONE
        // ----------------------------------------------------

        this.stream =
            await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: true,
                    autoGainControl: true,
                },
            });


        // ----------------------------------------------------
        // CREATE AUDIO CONTEXT
        // ----------------------------------------------------

        this.audioContext =
            new AudioContext({
                latencyHint: "interactive",
            });


        await this.audioContext.resume();


        // ----------------------------------------------------
        // LOAD DSP WORKLET
        // ----------------------------------------------------

        await this.audioContext.audioWorklet.addModule(
            "/worklets/voice-effects-processor.js"
        );


        // ----------------------------------------------------
        // MICROPHONE SOURCE
        // ----------------------------------------------------

        this.sourceNode =
            this.audioContext
                .createMediaStreamSource(
                    this.stream
                );


        // ----------------------------------------------------
        // EFFECT PROCESSOR
        // ----------------------------------------------------

        this.workletNode =
            new AudioWorkletNode(
                this.audioContext,
                "voice-effects-processor"
            );


        // ----------------------------------------------------
        // MASTER OUTPUT VOLUME
        // ----------------------------------------------------

        this.outputGain =
            this.audioContext.createGain();


        this.outputGain.gain.value =
            0.8;


        // ----------------------------------------------------
        // RECORDING DESTINATION
        // ----------------------------------------------------

        this.destinationNode =
            this.audioContext
                .createMediaStreamDestination();


        // ----------------------------------------------------
        // GRAPH
        //
        // microphone
        //    ↓
        // worklet
        //    ↓
        // gain
        //    ├── speakers
        //    └── recorder
        // ----------------------------------------------------

        this.sourceNode.connect(
            this.workletNode
        );


        this.workletNode.connect(
            this.outputGain
        );


        this.outputGain.connect(
            this.audioContext.destination
        );


        this.outputGain.connect(
            this.destinationNode
        );


        this.started =
            true;
    }


    // ========================================================
    // CHANGE EFFECT
    // ========================================================

    setEffect(
        effect
    ) {

        if (!this.workletNode) {
            return;
        }


        this.workletNode.port.postMessage({
            type: "effect",
            effect,
        });
    }


    // ========================================================
    // CHANGE PARAMETER
    // ========================================================

    setParameter(
        name,
        value
    ) {

        if (!this.workletNode) {
            return;
        }


        this.workletNode.port.postMessage({
            type: "parameter",
            name,
            value,
        });
    }


    // ========================================================
    // OUTPUT VOLUME
    // ========================================================

    setVolume(
        volume
    ) {

        if (!this.outputGain) {
            return;
        }


        this.outputGain.gain.value =
            volume;
    }


    // ========================================================
    // GET PROCESSED STREAM
    //
    // Used by MediaRecorder.
    // ========================================================

    getProcessedStream() {

        return this.destinationNode
            ?.stream ?? null;
    }


    // ========================================================
    // STOP
    // ========================================================

    async stop() {

        if (this.sourceNode) {
            this.sourceNode.disconnect();
        }


        if (this.workletNode) {
            this.workletNode.disconnect();
        }


        if (this.outputGain) {
            this.outputGain.disconnect();
        }


        if (this.stream) {

            this.stream
                .getTracks()
                .forEach(
                    (track) =>
                        track.stop()
                );
        }


        if (this.audioContext) {

            await this.audioContext.close();
        }


        this.audioContext =
            null;

        this.stream =
            null;

        this.sourceNode =
            null;

        this.workletNode =
            null;

        this.outputGain =
            null;

        this.destinationNode =
            null;

        this.started =
            false;
    }
}




// export class VoiceEffectEngine {

//     constructor() {

//         this.audioContext = null;

//         this.stream = null;

//         this.sourceNode = null;

//         this.highPassFilter = null;

//         this.workletNode = null;

//         this.outputGain = null;

//         this.compressorNode = null;

//         this.destinationNode = null;

//         this.started = false;
//     }


//     // ========================================================
//     // START
//     // ========================================================

//     async start() {

//         if (this.started) {
//             return;
//         }


//         // ----------------------------------------------------
//         // MICROPHONE
//         //
//         // Browser-level processing is useful before our
//         // custom DSP reaches the AudioWorklet.
//         // ----------------------------------------------------

//         this.stream =
//             await navigator.mediaDevices.getUserMedia({
//                 audio: {
//                     echoCancellation: true,
//                     noiseSuppression: true,
//                     autoGainControl: true,
//                 },
//             });


//         // ----------------------------------------------------
//         // AUDIO CONTEXT
//         // ----------------------------------------------------

//         this.audioContext =
//             new AudioContext({
//                 latencyHint: "interactive",
//             });


//         if (
//             this.audioContext.state ===
//             "suspended"
//         ) {

//             await this.audioContext.resume();
//         }


//         // ----------------------------------------------------
//         // LOAD AUDIO WORKLET
//         // ----------------------------------------------------

//         await this.audioContext.audioWorklet.addModule(
//             "/worklets/voice-effects-processor.js"
//         );


//         // ----------------------------------------------------
//         // MICROPHONE SOURCE
//         // ----------------------------------------------------

//         this.sourceNode =
//             this.audioContext.createMediaStreamSource(
//                 this.stream
//             );


//         // ----------------------------------------------------
//         // HIGH-PASS FILTER
//         //
//         // Removes low-frequency rumble such as:
//         //
//         // - desk vibration
//         // - air conditioner rumble
//         // - handling noise
//         // - microphone low-end noise
//         // ----------------------------------------------------

//         this.highPassFilter =
//             this.audioContext.createBiquadFilter();


//         this.highPassFilter.type =
//             "highpass";


//         this.highPassFilter.frequency.value =
//             100;


//         this.highPassFilter.Q.value =
//             0.707;


//         // ----------------------------------------------------
//         // CUSTOM DSP PROCESSOR
//         // ----------------------------------------------------

//         this.workletNode =
//             new AudioWorkletNode(
//                 this.audioContext,
//                 "voice-effects-processor"
//             );


//         // ----------------------------------------------------
//         // OUTPUT GAIN
//         // ----------------------------------------------------

//         this.outputGain =
//             this.audioContext.createGain();


//         this.outputGain.gain.value =
//             0.8;


//         // ----------------------------------------------------
//         // COMPRESSOR
//         //
//         // Helps prevent loud effects such as distortion,
//         // alien and echo from suddenly becoming uncomfortable.
//         // ----------------------------------------------------

//         this.compressorNode =
//             this.audioContext.createDynamicsCompressor();


//         this.compressorNode.threshold.value =
//             -8;


//         this.compressorNode.knee.value =
//             12;


//         this.compressorNode.ratio.value =
//             4;


//         this.compressorNode.attack.value =
//             0.003;


//         this.compressorNode.release.value =
//             0.18;


//         // ----------------------------------------------------
//         // RECORDING DESTINATION
//         //
//         // MediaRecorder reads the processed stream from here.
//         // ----------------------------------------------------

//         this.destinationNode =
//             this.audioContext.createMediaStreamDestination();


//         // ----------------------------------------------------
//         // AUDIO GRAPH
//         //
//         // Microphone
//         //      ↓
//         // High-pass filter
//         //      ↓
//         // AudioWorklet
//         //      ↓
//         // Compressor
//         //      ↓
//         // Master volume
//         //      ├────────→ headphones
//         //      │
//         //      └────────→ MediaRecorder
//         // ----------------------------------------------------

//         this.sourceNode.connect(
//             this.highPassFilter
//         );


//         this.highPassFilter.connect(
//             this.workletNode
//         );


//         this.workletNode.connect(
//             this.compressorNode
//         );


//         this.compressorNode.connect(
//             this.outputGain
//         );


//         this.outputGain.connect(
//             this.audioContext.destination
//         );


//         this.outputGain.connect(
//             this.destinationNode
//         );


//         this.started =
//             true;
//     }


//     // ========================================================
//     // SET EFFECT
//     // ========================================================

//     setEffect(
//         effect
//     ) {

//         if (!this.workletNode) {
//             return;
//         }


//         this.workletNode.port.postMessage({
//             type: "effect",
//             effect,
//         });
//     }


//     // ========================================================
//     // SET EFFECT PARAMETER
//     // ========================================================

//     setParameter(
//         name,
//         value
//     ) {

//         if (!this.workletNode) {
//             return;
//         }


//         this.workletNode.port.postMessage({
//             type: "parameter",
//             name,
//             value,
//         });
//     }


//     // ========================================================
//     // ENABLE / DISABLE NOISE GATE
//     // ========================================================

//     setNoiseGateEnabled(
//         enabled
//     ) {

//         if (!this.workletNode) {
//             return;
//         }


//         this.workletNode.port.postMessage({
//             type: "noiseGateEnabled",
//             enabled,
//         });
//     }


//     // ========================================================
//     // SET NOISE GATE THRESHOLD
//     // ========================================================

//     setNoiseGateThreshold(
//         threshold
//     ) {

//         if (!this.workletNode) {
//             return;
//         }


//         this.workletNode.port.postMessage({
//             type: "parameter",
//             name: "noiseGateThreshold",
//             value: threshold,
//         });
//     }


//     // ========================================================
//     // OUTPUT VOLUME
//     // ========================================================

//     setVolume(
//         volume
//     ) {

//         if (!this.outputGain) {
//             return;
//         }


//         const safeVolume =
//             Math.max(
//                 0,
//                 Math.min(
//                     1.5,
//                     Number(volume)
//                 )
//             );


//         this.outputGain.gain.setTargetAtTime(
//             safeVolume,
//             this.audioContext.currentTime,
//             0.01
//         );
//     }


//     // ========================================================
//     // GET PROCESSED STREAM
//     //
//     // Used by MediaRecorder.
//     // ========================================================

//     getProcessedStream() {

//         return (
//             this.destinationNode?.stream ??
//             null
//         );
//     }


//     // ========================================================
//     // STOP
//     // ========================================================

//     async stop() {

//         if (!this.started) {
//             return;
//         }


//         try {

//             this.sourceNode?.disconnect();

//         } catch {

//             // already disconnected
//         }


//         try {

//             this.highPassFilter?.disconnect();

//         } catch {

//             // already disconnected
//         }


//         try {

//             this.workletNode?.disconnect();

//         } catch {

//             // already disconnected
//         }


//         try {

//             this.compressorNode?.disconnect();

//         } catch {

//             // already disconnected
//         }


//         try {

//             this.outputGain?.disconnect();

//         } catch {

//             // already disconnected
//         }


//         try {

//             this.destinationNode?.disconnect();

//         } catch {

//             // already disconnected
//         }


//         // Stop actual microphone hardware.

//         if (this.stream) {

//             this.stream
//                 .getTracks()
//                 .forEach(
//                     (
//                         track
//                     ) => {

//                         track.stop();
//                     }
//                 );
//         }


//         if (
//             this.audioContext &&
//             this.audioContext.state !==
//             "closed"
//         ) {

//             await this.audioContext.close();
//         }


//         this.audioContext =
//             null;

//         this.stream =
//             null;

//         this.sourceNode =
//             null;

//         this.highPassFilter =
//             null;

//         this.workletNode =
//             null;

//         this.outputGain =
//             null;

//         this.compressorNode =
//             null;

//         this.destinationNode =
//             null;

//         this.started =
//             false;
//     }
// }