// import {
//   useEffect,
//   useRef,
//   useState,
// } from "react";


// const PreviewWaveform = ({
//   audioUrl,
//   currentTime,
//   duration,
// }) => {
//   const canvasRef =
//     useRef(null);

//   const [
//     peaks,
//     setPeaks,
//   ] = useState([]);


//   // ==========================================
//   // LOAD + DECODE FINAL PREVIEW AUDIO
//   // ==========================================

//   useEffect(() => {
//     if (!audioUrl) {
//       setPeaks([]);
//       return;
//     }

//     let cancelled = false;


//     const generateWaveform =
//       async () => {

//         try {
//           const response =
//             await fetch(
//               audioUrl
//             );

//           const arrayBuffer =
//             await response.arrayBuffer();


//           const audioContext =
//             new AudioContext();


//           const audioBuffer =
//             await audioContext
//               .decodeAudioData(
//                 arrayBuffer
//               );


//           const channelCount =
//             audioBuffer
//               .numberOfChannels;


//           const sampleLength =
//             audioBuffer.length;


//           /*
//             Number of vertical waveform bars.

//             Increase for more detail.
//           */

//           const barCount = 220;


//           const blockSize =
//             Math.max(
//               1,
//               Math.floor(
//                 sampleLength /
//                   barCount
//               )
//             );


//           const calculatedPeaks =
//             [];


//           for (
//             let bar = 0;
//             bar < barCount;
//             bar++
//           ) {

//             const start =
//               bar *
//               blockSize;


//             const end =
//               Math.min(
//                 start +
//                   blockSize,
//                 sampleLength
//               );


//             let maxAmplitude =
//               0;


//             for (
//               let channel = 0;
//               channel <
//               channelCount;
//               channel++
//             ) {

//               const data =
//                 audioBuffer
//                   .getChannelData(
//                     channel
//                   );


//               for (
//                 let i = start;
//                 i < end;
//                 i++
//               ) {

//                 const amplitude =
//                   Math.abs(
//                     data[i]
//                   );


//                 if (
//                   amplitude >
//                   maxAmplitude
//                 ) {
//                   maxAmplitude =
//                     amplitude;
//                 }
//               }
//             }


//             calculatedPeaks.push(
//               maxAmplitude
//             );
//           }


//           if (!cancelled) {
//             setPeaks(
//               calculatedPeaks
//             );
//           }


//           await audioContext.close();


//         } catch (error) {
//           console.error(
//             "Failed to generate waveform:",
//             error
//           );
//         }
//       };


//     generateWaveform();


//     return () => {
//       cancelled = true;
//     };

//   }, [audioUrl]);


//   // ==========================================
//   // DRAW WAVEFORM
//   // ==========================================

//   useEffect(() => {
//     const canvas =
//       canvasRef.current;

//     if (
//       !canvas ||
//       peaks.length === 0
//     ) {
//       return;
//     }


//     const context =
//       canvas.getContext(
//         "2d"
//       );


//     const rect =
//       canvas.getBoundingClientRect();


//     const dpr =
//       window.devicePixelRatio ||
//       1;


//     canvas.width =
//       rect.width * dpr;

//     canvas.height =
//       rect.height * dpr;


//     context.scale(
//       dpr,
//       dpr
//     );


//     const width =
//       rect.width;

//     const height =
//       rect.height;


//     context.clearRect(
//       0,
//       0,
//       width,
//       height
//     );


//     const centerY =
//       height / 2;


//     const progress =
//       duration > 0
//         ? Math.min(
//             currentTime /
//               duration,
//             1
//           )
//         : 0;


//     const playedBars =
//       Math.floor(
//         peaks.length *
//           progress
//       );


//     const barWidth =
//       width /
//       peaks.length;


//     peaks.forEach(
//       (
//         peak,
//         index
//       ) => {

//         const x =
//           index *
//           barWidth;


//         const normalizedPeak =
//           Math.max(
//             0.04,
//             peak
//           );


//         const barHeight =
//           normalizedPeak *
//           height *
//           0.82;


//         /*
//           PLAYED PART = teal
//           UNPLAYED PART = dark gray
//         */

//         context.fillStyle =
//           index <=
//           playedBars
//             ? "#19d3c5"
//             : "rgba(255,255,255,0.14)";


//         context.fillRect(
//           x,
//           centerY -
//             barHeight / 2,
//           Math.max(
//             1,
//             barWidth * 0.55
//           ),
//           barHeight
//         );
//       }
//     );


//   }, [
//     peaks,
//     currentTime,
//     duration,
//   ]);


//   // ==========================================
//   // EMPTY STATE
//   // ==========================================

//   if (!audioUrl) {
//     return (
//       <div
//         className="
//           flex
//           h-full
//           min-h-[260px]
//           items-center
//           justify-center
//           text-sm
//           text-gray-700
//         "
//       >
//         Run the project to generate waveform.
//       </div>
//     );
//   }


//   // ==========================================
//   // UI
//   // ==========================================

//   return (
//   <div
//     className="
//       flex
//       h-full
//       min-h-[260px]
//       w-full
//       items-center
//       justify-center
//       px-4
//     "
//   >
//     <canvas
//       ref={canvasRef}
//       className="
//         h-[180px]
//         w-full
//       "
//     />
//   </div>
// );
// };


// export default PreviewWaveform;
import {
  useEffect,
  useRef,
  useState,
} from "react";


const PIXELS_PER_SECOND = 70;
const BAR_SPACING = 6;


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
  // WATCH AVAILABLE SCREEN WIDTH
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
  // CALCULATE WAVEFORM WIDTH
  // ==========================================

  /*
    Short audio:
    fill visible editor width.

    Long audio:
    make waveform wider than editor,
    allowing horizontal scrolling.
  */

  const waveformWidth =
    Math.max(
      containerWidth,
      duration *
        PIXELS_PER_SECOND
    );


  // ==========================================
  // LOAD + DECODE COMPILED PREVIEW
  // ==========================================

  useEffect(() => {
    if (!audioUrl) {
      setPeaks([]);
      return;
    }


    let cancelled = false;

    let audioContext = null;


    const generateWaveform =
      async () => {

        try {
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
            await response.arrayBuffer();


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


          // ====================================
          // NUMBER OF WAVEFORM BARS
          // ====================================

          /*
            Instead of always 220 bars,
            calculate bars according to
            waveform pixel width.

            Example:
            1800px / 6
            ≈ 300 bars.
          */

          const desiredWidth =
            Math.max(
              containerWidth,
              audioBuffer.duration *
                PIXELS_PER_SECOND
            );


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


          // ====================================
          // GENERATE PEAK FOR EACH BAR
          // ====================================

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

          if (audioContext) {
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
    containerWidth,
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
    // REAL CANVAS PIXEL SIZE
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


    const barWidth =
      waveformWidth /
      peaks.length;


    // ========================================
    // DRAW BARS
    // ========================================

    peaks.forEach(
      (
        peak,
        index
      ) => {

        const x =
          index *
          barWidth;


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
        w-full

        overflow-x-auto
        overflow-y-hidden

        hide-scrollbar
      "
    >
      <div
        className="
          flex
          min-h-[260px]

          items-center

          px-4
        "

        style={{
          width:
            `${waveformWidth}px`,
        }}
      >
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