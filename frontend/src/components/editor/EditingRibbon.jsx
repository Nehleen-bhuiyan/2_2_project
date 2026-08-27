import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Undo2,
  Redo2,
  // other icons...
} from "lucide-react";
import {
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
} from "lucide-react";


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
  ] = useState(null);

  const popoverRef =
    useRef(null);

const [
  tooltip,
  setTooltip,
] = useState(null);
  // ==========================================
  // DEFAULT EFFECT PARAMETERS
  // ==========================================

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


  // ==========================================
  // EFFECT DEFINITIONS
  // ==========================================

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


  // ==========================================
  // CLOSE POPOVER
  // ==========================================

  useEffect(() => {
    const handleOutsideClick = (
      event
    ) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(
          event.target
        )
      ) {
        setActiveControl(null);
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
  }, []);


  // ==========================================
  // GET CURRENT EFFECT PARAMETERS
  // ==========================================

  const buildEffectParameters = (
    effectId
  ) => {
    const value =
      parameters[effectId];


    if (
      effectId === "reverb" ||
      effectId === "echo" ||
      effectId === "equalizer"
    ) {
      return {
        ...value,
      };
    }


    if (
      effectId === "reverse" ||
      effectId === "normalize"
    ) {
      return {};
    }


    return {
      value,
    };
  };


  // ==========================================
  // APPLY EFFECT
  // ==========================================

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

    setActiveControl(null);
  };


  // ==========================================
  // NORMAL CLICK
  // ==========================================

  const handleEffectClick = (
    effect
  ) => {
    /*
      Normal click immediately applies
      the default/current values.
    */

    applyEffect(
      effect.id
    );
  };


  // ==========================================
  // RIGHT CLICK
  // ==========================================

  const handleContextMenu = (
    event,
    effect
  ) => {
    event.preventDefault();

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

    setActiveControl(
      effect.id
    );
  };


  // ==========================================
  // SINGLE SLIDER CONFIG
  // ==========================================

  const getSliderConfig = (
    effectId
  ) => {
    switch (effectId) {

      case "slow":
        return {
          label:
            "Speed Factor",

          min: 0.25,
          max: 1,
          step: 0.05,

          display: (value) =>
            `${value.toFixed(2)}x`,
        };


      case "speedUp":
        return {
          label:
            "Speed Factor",

          min: 1,
          max: 2,
          step: 0.05,

          display: (value) =>
            `${value.toFixed(2)}x`,
        };


      case "denoise":
        return {
          label:
            "Strength",

          min: 0,
          max: 1,
          step: 0.05,

          display: (value) =>
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

          display: (value) =>
            `${value} Hz`,
        };


      case "highpass":
        return {
          label:
            "Cutoff Frequency",

          min: 20,
          max: 3000,
          step: 20,

          display: (value) =>
            `${value} Hz`,
        };


      case "bassBoost":
        return {
          label:
            "Bass Amount",

          min: 0,
          max: 2,
          step: 0.05,

          display: (value) =>
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

          display: (value) =>
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

          display: (value) =>
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

          display: (value) =>
            `${value.toFixed(1)}s`,
        };


      case "gain":
        return {
          label:
            "Gain",

          min: 0,
          max: 2,
          step: 0.05,

          display: (value) =>
            `${value.toFixed(2)}x`,
        };


      case "distortion":
        return {
          label:
            "Mix",

          min: 0,
          max: 1,
          step: 0.05,

          display: (value) =>
            `${Math.round(
              value * 100
            )}%`,
        };


      default:
        return null;
    }
  };


  // ==========================================
  // CHANGE SIMPLE PARAMETER
  // ==========================================

  const changeSimpleParameter = (
    effectId,
    value
  ) => {
    setParameters(
      (previous) => ({
        ...previous,

        [effectId]:
          Number(value),
      })
    );
  };


  // ==========================================
  // CHANGE OBJECT PARAMETER
  // ==========================================

  const changeObjectParameter = (
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
            Number(value),
        },
      })
    );
  };


  // ==========================================
  // REUSABLE SLIDER
  // ==========================================

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
      <div className="mb-4">
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
            {display(value)}
          </span>
        </div>


        <input
          type="range"

          min={min}
          max={max}
          step={step}

          value={value}

          onChange={(
            event
          ) =>
            onChange(
              event.target.value
            )
          }

          className="
            w-full
            cursor-pointer
            accent-[var(--accent)]
          "
        />
      </div>
    );
  };


  // ==========================================
  // SPECIAL REVERB CONTROLS
  // ==========================================

  const renderReverbControls =
    () => {
      const value =
        parameters.reverb;

      return (
        <>
          <SliderRow
            label="Wet Level"
            value={value.value}
            min={0}
            max={1}
            step={0.05}

            display={(v) =>
              `${Math.round(
                v * 100
              )}%`
            }

            onChange={(v) =>
              changeObjectParameter(
                "reverb",
                "value",
                v
              )
            }
          />

          <SliderRow
            label="Decay"
            value={value.decay}
            min={0.1}
            max={2}
            step={0.05}

            display={(v) =>
              `${v.toFixed(2)}s`
            }

            onChange={(v) =>
              changeObjectParameter(
                "reverb",
                "decay",
                v
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

            display={(v) =>
              `${v.toFixed(1)}s`
            }

            onChange={(v) =>
              changeObjectParameter(
                "reverb",
                "duration",
                v
              )
            }
          />
        </>
      );
    };


  // ==========================================
  // SPECIAL ECHO CONTROLS
  // ==========================================

  const renderEchoControls =
    () => {
      const value =
        parameters.echo;

      return (
        <>
          <SliderRow
            label="Wet Level"
            value={value.value}
            min={0}
            max={1}
            step={0.05}

            display={(v) =>
              `${Math.round(
                v * 100
              )}%`
            }

            onChange={(v) =>
              changeObjectParameter(
                "echo",
                "value",
                v
              )
            }
          />

          <SliderRow
            label="Delay"
            value={value.delay}
            min={0.05}
            max={1}
            step={0.05}

            display={(v) =>
              `${v.toFixed(2)}s`
            }

            onChange={(v) =>
              changeObjectParameter(
                "echo",
                "delay",
                v
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

            display={(v) =>
              `${Math.round(
                v * 100
              )}%`
            }

            onChange={(v) =>
              changeObjectParameter(
                "echo",
                "feedback",
                v
              )
            }
          />

          <SliderRow
            label="Repeats"
            value={value.repeats}
            min={1}
            max={8}
            step={1}

            display={(v) =>
              `${v}`
            }

            onChange={(v) =>
              changeObjectParameter(
                "echo",
                "repeats",
                v
              )
            }
          />
        </>
      );
    };


  // ==========================================
  // EQUALIZER CONTROLS
  // ==========================================

  const renderEqualizerControls =
    () => {
      const value =
        parameters.equalizer;

      return (
        <>
          <SliderRow
            label="Bass"
            value={value.bass}
            min={-12}
            max={12}
            step={1}

            display={(v) =>
              `${
                v > 0
                  ? "+"
                  : ""
              }${v} dB`
            }

            onChange={(v) =>
              changeObjectParameter(
                "equalizer",
                "bass",
                v
              )
            }
          />

          <SliderRow
            label="Mid"
            value={value.mid}
            min={-12}
            max={12}
            step={1}

            display={(v) =>
              `${
                v > 0
                  ? "+"
                  : ""
              }${v} dB`
            }

            onChange={(v) =>
              changeObjectParameter(
                "equalizer",
                "mid",
                v
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

            display={(v) =>
              `${
                v > 0
                  ? "+"
                  : ""
              }${v} dB`
            }

            onChange={(v) =>
              changeObjectParameter(
                "equalizer",
                "treble",
                v
              )
            }
          />
        </>
      );
    };


  // ==========================================
  // RENDER CONTROL CONTENT
  // ==========================================

  const renderControlContent =
    () => {
      if (
        activeControl ===
        "reverb"
      ) {
        return renderReverbControls();
      }

      if (
        activeControl ===
        "echo"
      ) {
        return renderEchoControls();
      }

      if (
        activeControl ===
        "equalizer"
      ) {
        return renderEqualizerControls();
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
          label={config.label}

          value={value}

          min={config.min}
          max={config.max}
          step={config.step}

          display={
            config.display
          }

          onChange={(v) =>
            changeSimpleParameter(
              activeControl,
              v
            )
          }
        />
      );
    };


  // ==========================================
  // UI
  // ==========================================

  return (
    <div
  data-editing-ribbon

  className="
    relative

    flex
    items-center
    gap-2

    border-b
    border-white/10

    bg-[#0b100f]/95

    px-4
    py-2

    backdrop-blur-xl

    shadow-[0_8px_25px_rgba(0,0,0,0.25)]
  "
>

      {/* TITLE */}

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
      <div
  className="
    flex
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
    <Undo2 size={17} />
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
    <Redo2 size={17} />
  </button>
</div>


      {/* EFFECT BUTTONS */}

      {/* ======================================
    EFFECT BUTTONS
====================================== */}

<div
  className="
    flex
    min-w-0
    flex-1
    items-center
    gap-1

    overflow-x-auto
    hide-scrollbar
  "
>
  {effects.map((effect) => {
    const Icon = effect.icon;

    return (
      <button
        key={effect.id}

        type="button"

        disabled={!selectedClip}

        onClick={() =>
          handleEffectClick(
            effect
          )
        }

        onContextMenu={(event) =>
          handleContextMenu(
            event,
            effect
          )
        }

        onMouseEnter={(event) => {
          const button =
            event.currentTarget;

          const buttonRect =
            button.getBoundingClientRect();

          const ribbonRect =
            button
              .closest(
                "[data-editing-ribbon]"
              )
              ?.getBoundingClientRect();

          if (!ribbonRect) {
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
              buttonRect.width / 2,
          });
        }}

        onMouseLeave={() => {
          setTooltip(null);
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
        <Icon size={18} />
      </button>
    );
  })}
</div>
{/* ======================================
    EFFECT TOOLTIP
====================================== */}

{tooltip && (
  <div
    className="
      pointer-events-none

      absolute
      top-[54px]

      z-[1000]

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


      {/* ======================================
          EFFECT CONTROL POPOVER
      ====================================== */}

      {activeControl && (
        <div
          ref={
            popoverRef
          }

          className="
            absolute

            left-24
            top-[58px]

            z-[500]

            w-72

            rounded-xl

            border
            border-white/10

            bg-[#121716]

            p-4

            shadow-[0_20px_50px_rgba(0,0,0,0.55)]
          "
        >

          <div
            className="
              mb-4

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


          {renderControlContent()}


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

              rounded-lg

              bg-[var(--accent)]

              px-4
              py-2

              text-sm
              font-semibold
              text-black

              transition

              hover:bg-[var(--accent-hover)]
            "
          >
            Apply
          </button>

        </div>
      )}

    </div>
  );
};


export default EditingRibbon;