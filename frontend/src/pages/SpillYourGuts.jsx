import {
  useState,
} from "react";

import {
  LockKeyhole,
  Ear,
} from "lucide-react";

import BlurCircle from "../components/BlurCircle";

import EncodeSecretModal from "../components/secret/EncodeSecretModal";
import DecodeSecretModal from "../components/secret/DecodeSecretModal";


const SpillYourGuts = () => {
  const [
    activeModal,
    setActiveModal,
  ] = useState(null);


  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const closeModal = () => {
    setActiveModal(
      null
    );
  };


  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className="
        relative

        min-h-screen
        w-full

        overflow-hidden

        bg-[#050708]

        px-5
        py-14

        text-white

        sm:px-8
        lg:px-12
      "
    >

      {/* ======================================
          PAGE BACKGROUND GLOW
      ====================================== */}

      <BlurCircle
        className="
          left-[5%]
          top-[5%]
        "
        size={360}
        color="teal"
      />


      <BlurCircle
        className="
          right-[4%]
          top-[45%]
        "
        size={420}
        color="teal"
      />


      {/* ======================================
          PAGE CONTENT
      ====================================== */}

      <div
        className="
          relative
          z-10

          mx-auto

          w-full
          max-w-7xl
        "
      >

        {/* ==================================
            PAGE HEADER
        ================================== */}

        <div
          className="
            mb-12

            text-center
          "
        >
          <p
            className="
              mb-3

              text-xs
              font-semibold

              uppercase
              tracking-[0.3em]

              text-[var(--accent)]
            "
          >
            Secret Audio
          </p>


          <h1
            className="
              text-4xl
              font-bold
              tracking-tight

              text-white

              sm:text-5xl
              lg:text-6xl
            "
          >
            Spill Your Guts
          </h1>


          <p
            className="
              mx-auto
              mt-4

              max-w-2xl

              text-sm
              leading-6

              text-gray-400

              sm:text-base
            "
          >
            Hide a secret voice
            inside ordinary audio,
            or uncover a message
            someone left behind.
          </p>
        </div>


        {/* ==================================
            PANELS
        ================================== */}

        <div
          className="
            flex
            flex-col

            gap-14
          "
        >

          {/* =================================
              ENCODE PANEL
          ================================= */}

          <div
            className="
              relative
            "
          >
            <BlurCircle
              className="
                left-1/2
                top-1/2

                -translate-x-1/2
                -translate-y-1/2
              "
              size={460}
              color="teal"
            />


            <section
              className="
                relative
                z-10

                flex
                min-h-[320px]

                w-full

                flex-col

                items-center
                justify-center

                overflow-hidden

                rounded-[28px]

                border
                border-white/10

                bg-white/[0.035]

                px-6
                py-12

                text-center

                backdrop-blur-2xl

                shadow-[0_28px_90px_rgba(0,0,0,0.40)]

                transition-all
                duration-300

                hover:border-[var(--accent)]/25
              "
            >

              {/* INNER SHEEN */}

              <div
                className="
                  pointer-events-none

                  absolute
                  inset-0

                  bg-gradient-to-br

                  from-white/[0.035]
                  via-transparent
                  to-[var(--accent)]/[0.025]
                "
              />


              {/* ICON */}

              <div
                className="
                  relative
                  z-10

                  mb-6

                  flex
                  h-16
                  w-16

                  items-center
                  justify-center

                  rounded-full

                  border
                  border-[var(--accent)]/20

                  bg-[var(--accent-soft)]

                  text-[var(--accent)]

                  shadow-[0_0_35px_rgba(25,211,197,0.10)]
                "
              >
                <LockKeyhole
                  size={27}
                />
              </div>


              {/* TITLE */}

              <h2
                className="
                  relative
                  z-10

                  text-2xl
                  font-semibold

                  text-white

                  sm:text-3xl
                "
              >
                Encode
              </h2>


              {/* DESCRIPTION */}

              <p
                className="
                  relative
                  z-10

                  mt-3

                  max-w-xl

                  text-sm
                  leading-6

                  text-gray-400

                  sm:text-base
                "
              >
                Hide your secret
                voice inside another
                audio signal using a
                high-frequency channel
                that stays out of normal
                hearing.
              </p>


              {/* BUTTON */}

              <button
                type="button"

                onClick={() =>
                  setActiveModal(
                    "encode"
                  )
                }

                className="
                  relative
                  z-10

                  mt-8

                  cursor-pointer

                  rounded-full

                  bg-[var(--accent)]

                  px-7
                  py-3

                  text-sm
                  font-semibold

                  text-black

                  shadow-[0_0_30px_rgba(25,211,197,0.16)]

                  transition-all
                  duration-200

                  hover:scale-[1.02]
                  hover:bg-[var(--accent-hover)]

                  active:scale-[0.98]
                "
              >
                Spill Your Secret
              </button>

            </section>
          </div>


          {/* =================================
              DECODE PANEL
          ================================= */}

          <div
            className="
              relative
            "
          >
            <BlurCircle
              className="
                left-1/2
                top-1/2

                -translate-x-1/2
                -translate-y-1/2
              "
              size={460}
              color="teal"
            />


            <section
              className="
                relative
                z-10

                flex
                min-h-[320px]

                w-full

                flex-col

                items-center
                justify-center

                overflow-hidden

                rounded-[28px]

                border
                border-white/10

                bg-white/[0.035]

                px-6
                py-12

                text-center

                backdrop-blur-2xl

                shadow-[0_28px_90px_rgba(0,0,0,0.40)]

                transition-all
                duration-300

                hover:border-[var(--accent)]/25
              "
            >

              {/* INNER SHEEN */}

              <div
                className="
                  pointer-events-none

                  absolute
                  inset-0

                  bg-gradient-to-br

                  from-white/[0.035]
                  via-transparent
                  to-[var(--accent)]/[0.025]
                "
              />


              {/* ICON */}

              <div
                className="
                  relative
                  z-10

                  mb-6

                  flex
                  h-16
                  w-16

                  items-center
                  justify-center

                  rounded-full

                  border
                  border-[var(--accent)]/20

                  bg-[var(--accent-soft)]

                  text-[var(--accent)]

                  shadow-[0_0_35px_rgba(25,211,197,0.10)]
                "
              >
                <Ear
                  size={28}
                />
              </div>


              {/* TITLE */}

              <h2
                className="
                  relative
                  z-10

                  text-2xl
                  font-semibold

                  text-white

                  sm:text-3xl
                "
              >
                Decode
              </h2>


              {/* DESCRIPTION */}

              <p
                className="
                  relative
                  z-10

                  mt-3

                  max-w-xl

                  text-sm
                  leading-6

                  text-gray-400

                  sm:text-base
                "
              >
                Upload an encoded audio
                file and reveal the hidden
                voice by bringing its
                secret frequency channel
                back into normal hearing.
              </p>


              {/* BUTTON */}

              <button
                type="button"

                onClick={() =>
                  setActiveModal(
                    "decode"
                  )
                }

                className="
                  relative
                  z-10

                  mt-8

                  cursor-pointer

                  rounded-full

                  bg-[var(--accent)]

                  px-7
                  py-3

                  text-sm
                  font-semibold

                  text-black

                  shadow-[0_0_30px_rgba(25,211,197,0.16)]

                  transition-all
                  duration-200

                  hover:scale-[1.02]
                  hover:bg-[var(--accent-hover)]

                  active:scale-[0.98]
                "
              >
                Hear Someone&apos;s Secret
              </button>

            </section>
          </div>

        </div>
      </div>


      {/* ======================================
          ENCODER MODAL
      ====================================== */}

      {activeModal ===
        "encode" && (
        <EncodeSecretModal
          onClose={
            closeModal
          }
        />
      )}


      {/* ======================================
          DECODER MODAL
      ====================================== */}

      {activeModal ===
        "decode" && (
        <DecodeSecretModal
          onClose={
            closeModal
          }
        />
      )}

    </div>
  );
};


export default SpillYourGuts;