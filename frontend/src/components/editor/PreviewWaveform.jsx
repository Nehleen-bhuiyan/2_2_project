
import {
  useEffect,
  useRef,
  useState,
} from "react";


const PIXELS_PER_SECOND = 70;
const BAR_SPACING = 6;
const MIN_WAVEFORM_WIDTH = 900;


const PreviewWaveform = ({
  audioUrl,
  currentTime,
  duration,
}) => {
  const canvasRef =
    useRef(null);

  const containerRef =
    useRef(null);

  const [
    peaks,
    setPeaks,
  ] = useState([]);

  const [
    containerWidth,
    setContainerWidth,
  ] = useState(0);


  // ==========================================
  // WATCH AVAILABLE CONTAINER WIDTH
  // ==========================================

  useEffect(() => {
    const container =
      containerRef.current;

    if (!container) {
      return;
    }


    const updateWidth = () => {
      setContainerWidth(
        container.clientWidth
      );
    };


    updateWidth();


    const resizeObserver =
      new ResizeObserver(
        updateWidth
      );


    resizeObserver.observe(
      container
    );


    return () => {
      resizeObserver.disconnect();
    };
  }, []);


  // ==========================================
  // WAVEFORM WIDTH
  // ==========================================

  /*
    Short audio:
    use a minimum fixed width
    and center it.

    Long audio:
    width grows according to duration
    and becomes horizontally scrollable.
  */

  const waveformWidth =
    Math.max(
      MIN_WAVEFORM_WIDTH,
      duration *
        PIXELS_PER_SECOND
    );


  // ==========================================
  // LOAD + DECODE COMPILED PREVIEW AUDIO
  // ==========================================

  useEffect(() => {
    if (!audioUrl) {
      setPeaks([]);
      return;
    }


    let cancelled = false;

    let audioContext =
      null;


    const generateWaveform =
      async () => {

        try {
          // ==================================
          // FETCH PREVIEW AUDIO
          // ==================================

          const response =
            await fetch(
              audioUrl
            );


          if (!response.ok) {
            throw new Error(
              "Could not fetch preview audio."
            );
          }


          const arrayBuffer =
            await response
              .arrayBuffer();


          // ==================================
          // DECODE AUDIO
          // ==================================

          audioContext =
            new AudioContext();


          const audioBuffer =
            await audioContext
              .decodeAudioData(
                arrayBuffer
              );


          const channelCount =
            audioBuffer
              .numberOfChannels;


          const sampleLength =
            audioBuffer.length;


          // ==================================
          // CALCULATE ACTUAL WAVEFORM WIDTH
          // ==================================

          const desiredWidth =
            Math.max(
              MIN_WAVEFORM_WIDTH,

              audioBuffer.duration *
                PIXELS_PER_SECOND
            );


          // ==================================
          // NUMBER OF WAVEFORM BARS
          // ==================================

          const barCount =
            Math.max(
              100,

              Math.floor(
                desiredWidth /
                  BAR_SPACING
              )
            );


          const blockSize =
            Math.max(
              1,

              Math.floor(
                sampleLength /
                  barCount
              )
            );


          const calculatedPeaks =
            [];


          // ==================================
          // GENERATE PEAK FOR EVERY BAR
          // ==================================

          for (
            let bar = 0;
            bar < barCount;
            bar++
          ) {
            const start =
              bar *
              blockSize;


            const end =
              Math.min(
                start +
                  blockSize,

                sampleLength
              );


            let maxAmplitude =
              0;


            // ==================================
            // CHECK ALL CHANNELS
            // ==================================

            for (
              let channel = 0;
              channel <
                channelCount;
              channel++
            ) {
              const data =
                audioBuffer
                  .getChannelData(
                    channel
                  );


              for (
                let i = start;
                i < end;
                i++
              ) {
                const amplitude =
                  Math.abs(
                    data[i]
                  );


                if (
                  amplitude >
                  maxAmplitude
                ) {
                  maxAmplitude =
                    amplitude;
                }
              }
            }


            calculatedPeaks.push(
              maxAmplitude
            );
          }


          // ==================================
          // STORE RESULT
          // ==================================

          if (!cancelled) {
            setPeaks(
              calculatedPeaks
            );
          }


        } catch (error) {
          console.error(
            "Failed to generate waveform:",
            error
          );

        } finally {
          if (
            audioContext &&
            audioContext.state !==
              "closed"
          ) {
            await audioContext.close();
          }
        }
      };


    generateWaveform();


    return () => {
      cancelled = true;


      if (
        audioContext &&
        audioContext.state !==
          "closed"
      ) {
        audioContext.close();
      }
    };

  }, [
    audioUrl,
  ]);


  // ==========================================
  // DRAW WAVEFORM
  // ==========================================

  useEffect(() => {
    const canvas =
      canvasRef.current;


    if (
      !canvas ||
      peaks.length === 0 ||
      waveformWidth <= 0
    ) {
      return;
    }


    const context =
      canvas.getContext(
        "2d"
      );


    const cssHeight =
      180;


    const dpr =
      window.devicePixelRatio ||
      1;


    // ========================================
    // CANVAS PIXEL SIZE
    // ========================================

    canvas.width =
      Math.floor(
        waveformWidth *
          dpr
      );


    canvas.height =
      Math.floor(
        cssHeight *
          dpr
      );


    context.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );


    context.clearRect(
      0,
      0,
      waveformWidth,
      cssHeight
    );


    // ========================================
    // CENTER LINE
    // ========================================

    const centerY =
      cssHeight / 2;


    // ========================================
    // PLAYBACK PROGRESS
    // ========================================

    const progress =
      duration > 0
        ? Math.min(
            Math.max(
              currentTime /
                duration,
              0
            ),
            1
          )
        : 0;


    const playedBars =
      Math.floor(
        peaks.length *
          progress
      );


    // ========================================
    // BAR SIZE
    // ========================================

    const barWidth =
      waveformWidth /
      peaks.length;


    // ========================================
    // DRAW EVERY BAR
    // ========================================

    peaks.forEach(
      (
        peak,
        index
      ) => {

        const x =
          index *
          barWidth;


        /*
          Keep near-silent areas visible
          with a very small minimum height.
        */

        const normalizedPeak =
          Math.max(
            0.035,
            peak
          );


        const barHeight =
          normalizedPeak *
          cssHeight *
          0.82;


        // ====================================
        // PLAYED / UNPLAYED COLOR
        // ====================================

        context.fillStyle =
          index <=
          playedBars
            ? "#19d3c5"
            : "rgba(255,255,255,0.14)";


        context.fillRect(
          x,

          centerY -
            barHeight / 2,

          Math.max(
            1.5,
            barWidth * 0.55
          ),

          barHeight
        );
      }
    );

  }, [
    peaks,
    currentTime,
    duration,
    waveformWidth,
  ]);


  // ==========================================
  // EMPTY STATE
  // ==========================================

  if (!audioUrl) {
    return (
      <div
        className="
          flex
          min-h-[260px]
          w-full

          items-center
          justify-center

          text-sm
          text-gray-700
        "
      >
        Run the project to generate waveform.
      </div>
    );
  }


  // ==========================================
  // UI
  // ==========================================

  return (
    <div
      ref={
        containerRef
      }

      className="
        flex

        min-h-[260px]
        w-full

        items-center

        overflow-x-auto
        overflow-y-hidden

        hide-scrollbar
      "
    >

      {/* ======================================
          CENTERED WAVEFORM WRAPPER
      ====================================== */}

      <div
        className="
          mx-auto

          flex
          min-h-[260px]

          shrink-0

          items-center

          px-4
        "

        style={{
          width:
            `${waveformWidth}px`,
        }}
      >

        {/* ====================================
            WAVEFORM CANVAS
        ==================================== */}

        <canvas
          ref={
            canvasRef
          }

          className="
            h-[180px]
            shrink-0
          "

          style={{
            width:
              `${waveformWidth}px`,
          }}
        />

      </div>
    </div>
  );
};


export default PreviewWaveform;