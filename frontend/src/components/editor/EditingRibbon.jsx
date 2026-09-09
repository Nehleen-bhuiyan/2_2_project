import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Undo2,
  Redo2,
  Gauge,
  FastForward,
  Waves,
  Radio,
  Sparkles,
  SlidersHorizontal,
  ArrowDownToLine,
  ArrowUpToLine,
  AudioWaveform,
  RotateCcw,
  Volume2,
  Activity,
  ChevronsDown,
  ChevronsUp,
  BarChart3,
  Zap,
  Mic,
} from "lucide-react";

import VoiceRecorderModal from "./VoiceRecorderModal";


const EditingRibbon = ({
  selectedClip,
  onEffectSelect,

  onUndo,
  onRedo,

  canUndo,
  canRedo,
}) => {

  const [
    activeControl,
    setActiveControl,
  ] = useState(
    null
  );


  const [
    tooltip,
    setTooltip,
  ] = useState(
    null
  );


  const [
    showRecorder,
    setShowRecorder,
  ] = useState(
    false
  );


  const popoverRef =
    useRef(null);


  // =========================================================
  // DEFAULT PARAMETERS
  // =========================================================

  const [
    parameters,
    setParameters,
  ] = useState({
    slow: 0.75,

    speedUp: 1.25,

    reverb: {
      value: 0.35,
      decay: 0.5,
      duration: 1.5,
    },

    echo: {
      value: 0.4,
      delay: 0.35,
      feedback: 0.4,
      repeats: 3,
    },

    denoise: 0.6,

    lowpass: 6000,

    highpass: 120,

    bassBoost: 0.5,

    trebleBoost: 0.5,

    equalizer: {
      bass: 0,
      mid: 0,
      treble: 0,
    },

    pitch: 0,

    fadeIn: 1,

    fadeOut: 1,

    gain: 1,

    distortion: 0.5,
  });


  // =========================================================
  // EFFECT DEFINITIONS
  // =========================================================

  const effects = [
    {
      id: "slow",
      name: "Slow",
      icon: Gauge,
      hasControl: true,
    },

    {
      id: "speedUp",
      name: "Speed Up",
      icon: FastForward,
      hasControl: true,
    },

    {
      id: "reverb",
      name: "Reverb",
      icon: Waves,
      hasControl: true,
    },

    {
      id: "echo",
      name: "Echo",
      icon: Radio,
      hasControl: true,
    },

    {
      id: "denoise",
      name: "Denoise",
      icon: Sparkles,
      hasControl: true,
    },

    {
      id: "lowpass",
      name: "Low-pass",
      icon: ChevronsDown,
      hasControl: true,
    },

    {
      id: "highpass",
      name: "High-pass",
      icon: ChevronsUp,
      hasControl: true,
    },

    {
      id: "bassBoost",
      name: "Bass Boost",
      icon: Volume2,
      hasControl: true,
    },

    {
      id: "trebleBoost",
      name: "Treble Boost",
      icon: BarChart3,
      hasControl: true,
    },

    {
      id: "equalizer",
      name: "Equalizer",
      icon: SlidersHorizontal,
      hasControl: true,
    },

    {
      id: "pitch",
      name: "Pitch Shift",
      icon: AudioWaveform,
      hasControl: true,
    },

    {
      id: "reverse",
      name: "Reverse",
      icon: RotateCcw,
      hasControl: false,
    },

    {
      id: "normalize",
      name: "Normalize",
      icon: Activity,
      hasControl: false,
    },

    {
      id: "fadeIn",
      name: "Fade In",
      icon: ArrowUpToLine,
      hasControl: true,
    },

    {
      id: "fadeOut",
      name: "Fade Out",
      icon: ArrowDownToLine,
      hasControl: true,
    },

    {
      id: "gain",
      name: "Gain",
      icon: Volume2,
      hasControl: true,
    },

    {
      id: "distortion",
      name: "Distortion",
      icon: Zap,
      hasControl: true,
    },
  ];


  // =========================================================
  // CLOSE EFFECT POPOVER ON OUTSIDE CLICK
  // =========================================================

  useEffect(() => {

    const handleOutsideClick =
      (event) => {

        if (
          activeControl &&
          popoverRef.current &&
          !popoverRef.current
            .contains(
              event.target
            )
        ) {
          setActiveControl(
            null
          );
        }
      };


    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );


    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };

  }, [
    activeControl,
  ]);


  // =========================================================
  // BUILD EFFECT PARAMETERS
  // =========================================================

  const buildEffectParameters =
    (
      effectId
    ) => {

      const value =
        parameters[
          effectId
        ];


      if (
        effectId ===
          "reverb" ||
        effectId ===
          "echo" ||
        effectId ===
          "equalizer"
      ) {
        return {
          ...value,
        };
      }


      if (
        effectId ===
          "reverse" ||
        effectId ===
          "normalize"
      ) {
        return {};
      }


      return {
        value,
      };
    };


  // =========================================================
  // APPLY EFFECT
  // =========================================================

  const applyEffect = (
    effectId
  ) => {

    if (!selectedClip) {
      alert(
        "Select a clip first."
      );

      return;
    }


    onEffectSelect?.({
      type:
        effectId,

      parameters:
        buildEffectParameters(
          effectId
        ),
    });


    setActiveControl(
      null
    );
  };


  // =========================================================
  // NORMAL EFFECT CLICK
  // =========================================================

  const handleEffectClick = (
    effect
  ) => {
    applyEffect(
      effect.id
    );
  };


  // =========================================================
  // RIGHT CLICK FOR SETTINGS
  // =========================================================

  const handleContextMenu = (
    event,
    effect
  ) => {

    event.preventDefault();

    event.stopPropagation();


    if (
      !effect.hasControl
    ) {
      return;
    }


    if (!selectedClip) {
      alert(
        "Select a clip first."
      );

      return;
    }


    setTooltip(
      null
    );


    setActiveControl(
      effect.id
    );
  };


  // =========================================================
  // SIMPLE SLIDER CONFIG
  // =========================================================

  const getSliderConfig = (
    effectId
  ) => {

    switch (
      effectId
    ) {

      case "slow":
        return {
          label:
            "Speed Factor",

          min: 0.25,
          max: 1,
          step: 0.05,

          display: (
            value
          ) =>
            `${value.toFixed(
              2
            )}x`,
        };


      case "speedUp":
        return {
          label:
            "Speed Factor",

          min: 1,
          max: 2,
          step: 0.05,

          display: (
            value
          ) =>
            `${value.toFixed(
              2
            )}x`,
        };


      case "denoise":
        return {
          label:
            "Strength",

          min: 0,
          max: 1,
          step: 0.05,

          display: (
            value
          ) =>
            `${Math.round(
              value * 100
            )}%`,
        };


      case "lowpass":
        return {
          label:
            "Cutoff Frequency",

          min: 200,
          max: 12000,
          step: 100,

          display: (
            value
          ) =>
            `${value} Hz`,
        };


      case "highpass":
        return {
          label:
            "Cutoff Frequency",

          min: 20,
          max: 3000,
          step: 20,

          display: (
            value
          ) =>
            `${value} Hz`,
        };


      case "bassBoost":
        return {
          label:
            "Bass Amount",

          min: 0,
          max: 2,
          step: 0.05,

          display: (
            value
          ) =>
            `${Math.round(
              value * 100
            )}%`,
        };


      case "trebleBoost":
        return {
          label:
            "Treble Amount",

          min: 0,
          max: 2,
          step: 0.05,

          display: (
            value
          ) =>
            `${Math.round(
              value * 100
            )}%`,
        };


      case "pitch":
        return {
          label:
            "Semitones",

          min: -12,
          max: 12,
          step: 1,

          display: (
            value
          ) =>
            `${
              value > 0
                ? "+"
                : ""
            }${value}`,
        };


      case "fadeIn":
      case "fadeOut":
        return {
          label:
            "Fade Duration",

          min: 0.1,
          max: 5,
          step: 0.1,

          display: (
            value
          ) =>
            `${value.toFixed(
              1
            )}s`,
        };


      case "gain":
        return {
          label:
            "Gain",

          min: 0,
          max: 2,
          step: 0.05,

          display: (
            value
          ) =>
            `${value.toFixed(
              2
            )}x`,
        };


      case "distortion":
        return {
          label:
            "Mix",

          min: 0,
          max: 1,
          step: 0.05,

          display: (
            value
          ) =>
            `${Math.round(
              value * 100
            )}%`,
        };


      default:
        return null;
    }
  };


  // =========================================================
  // CHANGE SIMPLE PARAMETER
  // =========================================================

  const changeSimpleParameter =
    (
      effectId,
      value
    ) => {

      setParameters(
        (previous) => ({
          ...previous,

          [effectId]:
            Number(
              value
            ),
        })
      );
    };


  // =========================================================
  // CHANGE OBJECT PARAMETER
  // =========================================================

  const changeObjectParameter =
    (
      effectId,
      key,
      value
    ) => {

      setParameters(
        (previous) => ({
          ...previous,

          [effectId]: {
            ...previous[
              effectId
            ],

            [key]:
              Number(
                value
              ),
          },
        })
      );
    };


  // =========================================================
  // REUSABLE SLIDER
  // =========================================================

  const SliderRow = ({
    label,
    value,
    min,
    max,
    step,
    display,
    onChange,
  }) => {

    return (
      <div
        className="
          mb-5
        "
      >
        <div
          className="
            mb-2

            flex
            items-center
            justify-between
          "
        >
          <span
            className="
              text-xs
              text-gray-300
            "
          >
            {label}
          </span>


          <span
            className="
              text-xs
              font-semibold

              text-[var(--accent)]
            "
          >
            {display(
              value
            )}
          </span>
        </div>


        <input
          type="range"

          min={
            min
          }

          max={
            max
          }

          step={
            step
          }

          value={
            value
          }

          onChange={(
            event
          ) => {
            onChange(
              event.target
                .value
            );
          }}

          className="
            w-full

            cursor-pointer

            accent-[var(--accent)]
          "
        />
      </div>
    );
  };


  // =========================================================
  // REVERB CONTROLS
  // =========================================================

  const renderReverbControls =
    () => {

      const value =
        parameters.reverb;


      return (
        <>
          <SliderRow
            label="Wet Level"

            value={
              value.value
            }

            min={0}
            max={1}
            step={0.05}

            display={(
              current
            ) =>
              `${Math.round(
                current *
                  100
              )}%`
            }

            onChange={(
              current
            ) =>
              changeObjectParameter(
                "reverb",
                "value",
                current
              )
            }
          />


          <SliderRow
            label="Decay"

            value={
              value.decay
            }

            min={0.1}
            max={2}
            step={0.05}

            display={(
              current
            ) =>
              `${current.toFixed(
                2
              )}s`
            }

            onChange={(
              current
            ) =>
              changeObjectParameter(
                "reverb",
                "decay",
                current
              )
            }
          />


          <SliderRow
            label="Tail Duration"

            value={
              value.duration
            }

            min={0.2}
            max={5}
            step={0.1}

            display={(
              current
            ) =>
              `${current.toFixed(
                1
              )}s`
            }

            onChange={(
              current
            ) =>
              changeObjectParameter(
                "reverb",
                "duration",
                current
              )
            }
          />
        </>
      );
    };


  // =========================================================
  // ECHO CONTROLS
  // =========================================================

  const renderEchoControls =
    () => {

      const value =
        parameters.echo;


      return (
        <>
          <SliderRow
            label="Wet Level"

            value={
              value.value
            }

            min={0}
            max={1}
            step={0.05}

            display={(
              current
            ) =>
              `${Math.round(
                current *
                  100
              )}%`
            }

            onChange={(
              current
            ) =>
              changeObjectParameter(
                "echo",
                "value",
                current
              )
            }
          />


          <SliderRow
            label="Delay"

            value={
              value.delay
            }

            min={0.05}
            max={1}
            step={0.05}

            display={(
              current
            ) =>
              `${current.toFixed(
                2
              )}s`
            }

            onChange={(
              current
            ) =>
              changeObjectParameter(
                "echo",
                "delay",
                current
              )
            }
          />


          <SliderRow
            label="Feedback"

            value={
              value.feedback
            }

            min={0}
            max={0.9}
            step={0.05}

            display={(
              current
            ) =>
              `${Math.round(
                current *
                  100
              )}%`
            }

            onChange={(
              current
            ) =>
              changeObjectParameter(
                "echo",
                "feedback",
                current
              )
            }
          />


          <SliderRow
            label="Repeats"

            value={
              value.repeats
            }

            min={1}
            max={8}
            step={1}

            display={(
              current
            ) =>
              `${current}`
            }

            onChange={(
              current
            ) =>
              changeObjectParameter(
                "echo",
                "repeats",
                current
              )
            }
          />
        </>
      );
    };


  // =========================================================
  // EQUALIZER CONTROLS
  // =========================================================

  const renderEqualizerControls =
    () => {

      const value =
        parameters.equalizer;


      const formatDb = (
        current
      ) =>
        `${
          current >
          0
            ? "+"
            : ""
        }${current} dB`;


      return (
        <>
          <SliderRow
            label="Bass"

            value={
              value.bass
            }

            min={-12}
            max={12}
            step={1}

            display={
              formatDb
            }

            onChange={(
              current
            ) =>
              changeObjectParameter(
                "equalizer",
                "bass",
                current
              )
            }
          />


          <SliderRow
            label="Mid"

            value={
              value.mid
            }

            min={-12}
            max={12}
            step={1}

            display={
              formatDb
            }

            onChange={(
              current
            ) =>
              changeObjectParameter(
                "equalizer",
                "mid",
                current
              )
            }
          />


          <SliderRow
            label="Treble"

            value={
              value.treble
            }

            min={-12}
            max={12}
            step={1}

            display={
              formatDb
            }

            onChange={(
              current
            ) =>
              changeObjectParameter(
                "equalizer",
                "treble",
                current
              )
            }
          />
        </>
      );
    };


  // =========================================================
  // RENDER EFFECT CONTROL
  // =========================================================

  const renderControlContent =
    () => {

      if (
        activeControl ===
        "reverb"
      ) {
        return (
          renderReverbControls()
        );
      }


      if (
        activeControl ===
        "echo"
      ) {
        return (
          renderEchoControls()
        );
      }


      if (
        activeControl ===
        "equalizer"
      ) {
        return (
          renderEqualizerControls()
        );
      }


      const config =
        getSliderConfig(
          activeControl
        );


      if (!config) {
        return null;
      }


      const value =
        parameters[
          activeControl
        ];


      return (
        <SliderRow
          label={
            config.label
          }

          value={
            value
          }

          min={
            config.min
          }

          max={
            config.max
          }

          step={
            config.step
          }

          display={
            config.display
          }

          onChange={(
            current
          ) =>
            changeSimpleParameter(
              activeControl,
              current
            )
          }
        />
      );
    };


  // =========================================================
  // UI
  // =========================================================

  return (
    <>
      <div
        data-editing-ribbon

        className="
          relative
          z-[800]

          flex
          w-full

          items-center
          gap-2

          overflow-visible

          border-b
          border-white/10

          bg-[#0b100f]/95

          px-4
          py-2

          backdrop-blur-xl

          shadow-[0_8px_25px_rgba(0,0,0,0.25)]
        "
      >

        {/* =====================================
            TITLE
        ===================================== */}

        <div
          className="
            mr-2

            flex
            shrink-0

            items-center
            gap-2

            border-r
            border-white/10

            pr-4
          "
        >
          <SlidersHorizontal
            size={17}

            className="
              text-[var(--accent)]
            "
          />


          <span
            className="
              text-xs
              font-semibold

              uppercase
              tracking-[0.18em]

              text-gray-500
            "
          >
            Effects
          </span>
        </div>


        {/* =====================================
            UNDO / REDO
        ===================================== */}

        <div
          className="
            flex
            shrink-0

            items-center
            gap-1

            border-r
            border-white/10

            pr-3
          "
        >
          <button
            type="button"

            onClick={
              onUndo
            }

            disabled={
              !canUndo
            }

            title="Undo"

            className="
              flex
              h-9
              w-9

              items-center
              justify-center

              rounded-lg

              text-gray-400

              transition

              hover:bg-white/10
              hover:text-white

              disabled:cursor-not-allowed
              disabled:opacity-25
            "
          >
            <Undo2
              size={17}
            />
          </button>


          <button
            type="button"

            onClick={
              onRedo
            }

            disabled={
              !canRedo
            }

            title="Redo"

            className="
              flex
              h-9
              w-9

              items-center
              justify-center

              rounded-lg

              text-gray-400

              transition

              hover:bg-white/10
              hover:text-white

              disabled:cursor-not-allowed
              disabled:opacity-25
            "
          >
            <Redo2
              size={17}
            />
          </button>
        </div>


        {/* =====================================
            RECORD VOICE
        ===================================== */}

        <div
          className="
            flex
            shrink-0

            items-center

            border-r
            border-white/10

            pr-3
          "
        >
          <button
            type="button"

            onClick={() => {
              setTooltip(
                null
              );

              setActiveControl(
                null
              );

              setShowRecorder(
                true
              );
            }}

            title="Record Voice"

            className="
              flex
              h-10
              w-10

              cursor-pointer

              items-center
              justify-center

              rounded-lg

              text-gray-400

              transition-all
              duration-200

              hover:bg-[var(--accent-soft)]
              hover:text-[var(--accent)]

              active:scale-95
            "
          >
            <Mic
              size={19}
            />
          </button>
        </div>


        {/* =====================================
            SCROLLABLE EFFECT ICONS
        ===================================== */}

        <div
          className="
            flex
            min-w-0
            flex-1

            items-center
            gap-1

            overflow-x-auto
            overflow-y-hidden

            hide-scrollbar
          "
        >
          {effects.map(
            (effect) => {

              const Icon =
                effect.icon;


              return (
                <button
                  key={
                    effect.id
                  }

                  type="button"

                  disabled={
                    !selectedClip
                  }

                  onClick={() =>
                    handleEffectClick(
                      effect
                    )
                  }

                  onContextMenu={(
                    event
                  ) =>
                    handleContextMenu(
                      event,
                      effect
                    )
                  }

                  onMouseEnter={(
                    event
                  ) => {

                    const button =
                      event.currentTarget;


                    const buttonRect =
                      button
                        .getBoundingClientRect();


                    const ribbon =
                      button.closest(
                        "[data-editing-ribbon]"
                      );


                    const ribbonRect =
                      ribbon
                        ?.getBoundingClientRect();


                    if (
                      !ribbonRect
                    ) {
                      return;
                    }


                    setTooltip({
                      name:
                        effect.name,

                      hasControl:
                        effect.hasControl,

                      left:
                        buttonRect.left -
                        ribbonRect.left +
                        buttonRect.width /
                          2,
                    });
                  }}

                  onMouseLeave={() => {
                    setTooltip(
                      null
                    );
                  }}

                  className="
                    flex
                    h-10
                    w-10
                    shrink-0

                    cursor-pointer

                    items-center
                    justify-center

                    rounded-lg

                    text-gray-400

                    transition-all
                    duration-200

                    hover:bg-[var(--accent-soft)]
                    hover:text-[var(--accent)]

                    active:scale-95

                    disabled:cursor-not-allowed
                    disabled:opacity-25
                  "
                >
                  <Icon
                    size={18}
                  />
                </button>
              );
            }
          )}
        </div>


        {/* =====================================
            EFFECT TOOLTIP
        ===================================== */}

        {tooltip && (
          <div
            className="
              pointer-events-none

              absolute
              top-[54px]

              z-[1100]

              -translate-x-1/2

              whitespace-nowrap

              rounded-md

              border
              border-white/10

              bg-[#151918]

              px-2.5
              py-1.5

              text-[11px]
              text-white

              shadow-xl
            "

            style={{
              left:
                `${tooltip.left}px`,
            }}
          >
            {tooltip.name}


            {tooltip.hasControl && (
              <span
                className="
                  ml-1
                  text-gray-500
                "
              >
                • Right-click
              </span>
            )}
          </div>
        )}


        {/* =====================================
            EFFECT CONTROL POPOVER
        ===================================== */}

        {activeControl && (
          <div
            ref={
              popoverRef
            }

            onPointerDown={(
              event
            ) => {
              event.stopPropagation();
            }}

            className="
              absolute

              left-12
              top-[58px]

              z-[1200]

              w-80

              overflow-visible

              rounded-xl

              border
              border-white/10

              bg-[#121716]

              p-5

              shadow-[0_24px_70px_rgba(0,0,0,0.75)]
            "
          >

            <div
              className="
                mb-5

                flex
                items-center
                justify-between
              "
            >
              <h3
                className="
                  text-sm
                  font-semibold
                  text-white
                "
              >
                {
                  effects.find(
                    (effect) =>
                      effect.id ===
                      activeControl
                  )?.name
                }
              </h3>


              <span
                className="
                  text-[10px]

                  uppercase
                  tracking-wider

                  text-gray-600
                "
              >
                Clip Effect
              </span>
            </div>


            {
              renderControlContent()
            }


            <button
              type="button"

              onClick={() =>
                applyEffect(
                  activeControl
                )
              }

              className="
                mt-2

                w-full

                cursor-pointer

                rounded-xl

                bg-[var(--accent)]

                px-4
                py-2.5

                text-sm
                font-semibold
                text-black

                transition

                hover:bg-[var(--accent-hover)]

                active:scale-[0.99]
              "
            >
              Apply
            </button>

          </div>
        )}

      </div>


      {/* =====================================
          VOICE RECORDER MODAL
      ===================================== */}

      {showRecorder && (
        <VoiceRecorderModal
          onClose={() =>
            setShowRecorder(
              false
            )
          }
        />
      )}
    </>
  );
};


export default EditingRibbon;