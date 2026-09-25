import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  SlidersHorizontal,
  Activity,
  Lock,
  Mic2,
  ArrowRight,
  Sparkles,
  Code2,
  Mail,
  Waves,
} from "lucide-react";

import BlurCircle from "../components/BlurCircle";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/audiverse_logo.png";

// =========================================================
// SCROLL REVEAL — lightweight IntersectionObserver hook.
// No extra dependency needed; drives the "morph in" effect
// used throughout the page as sections enter the viewport.
// =========================================================

const useInView = (options = { threshold: 0.15 }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver(([entry]) => {
      // Toggling both ways (rather than unobserving after the first
      // hit) makes the morph replay every time a section scrolls
      // back into view, not just the first time.
      setVisible(entry.isIntersecting);
    }, options);

    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return [ref, visible];
};

const Reveal = ({ children, delay = 0, className = "" }) => {
  const [ref, visible] = useInView();

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// =========================================================
// STATIC CONTENT
// =========================================================

const FEATURES = [
  {
    icon: SlidersHorizontal,
    tag: "EDIT",
    title: "Editing Studio",
    description:
      "A full multitrack workspace — import, arrange and trim clips across tracks, then render a mixed, processed export.",
    points: [
      "Multitrack timeline & clip editing",
      "15 built-in clip effects",
      "Recording, resampling & final export",
    ],
    to: "/studio",
  },
  {
    icon: Activity,
    tag: "ANALYZE",
    title: "Signal Lab",
    description:
      "See sound instead of just hearing it — waveforms, FFT spectra and a visualization tailored to every effect's DSP.",
    points: [
      "Before / after waveform & FFT spectrum",
      "Per-effect DSP visualizations",
      "Frequency response & transfer curves",
    ],
    to: "/signal-lab",
  },
  {
    icon: Lock,
    tag: "HIDE & RECOVER",
    title: "Spill Your Guts",
    description:
      "Hide a secret voice message inside ordinary audio with high-frequency steganography, then decode it back out.",
    points: [
      "96kHz carrier modulation, in-browser",
      "Encode & decode entirely client-side",
      "No backend round-trip required",
    ],
    to: "/spill-your-guts",
  },
  {
    icon: Mic2,
    tag: "TRANSFORM LIVE",
    title: "Voice Changer",
    description:
      "Reshape your voice in real time with low-latency AudioWorklet processing — robot, alien, radio and more.",
    points: [
      "10 live voice presets",
      "Real-time pitch shifting & modulation",
      "Built-in noise gate & mic cleanup",
    ],
    to: "/voice-changer",
  },
];

const STATS = [
  { value: "15", label: "Clip Effects" },
  { value: "10", label: "Live Voice Presets" },
  { value: "4", label: "Core Workflows" },
  { value: "96kHz", label: "Steganography Rate" },
];

const EFFECT_CHIPS = [
  "Bass Boost",
  "Denoise",
  "Distortion",
  "Echo",
  "Equalizer",
  "Fade",
  "Gain",
  "High-pass",
  "Low-pass",
  "Normalize",
  "Pitch",
  "Reverb",
  "Reverse",
  "Slow",
  "Treble Boost",
];

const STEPS = [
  {
    n: "01",
    title: "Edit",
    body: "Import audio, arrange it across tracks and clips, and shape it with 15 studio effects.",
  },
  {
    n: "02",
    title: "Analyze",
    body: "Drop into Signal Lab to see the waveform, spectrum and mechanism behind any effect.",
  },
  {
    n: "03",
    title: "Hide & Recover",
    body: "Use Spill Your Guts to fold a secret voice message into ordinary audio, then decode it.",
  },
  {
    n: "04",
    title: "Transform Live",
    body: "Switch to the Voice Changer and reshape your voice in real time as you speak.",
  },
];

// =========================================================
// HOME PAGE
// =========================================================

const Home = () => {
  const { user } = useAuth();
  const year = useMemo(() => new Date().getFullYear(), []);

  // Deterministic-looking but organic waveform bar heights for the
  // hero decoration — seeded so it doesn't reshuffle on re-render.
  const bars = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => ({
        h: 18 + Math.round(Math.abs(Math.sin(i * 0.7)) * 46),
        d: (i % 12) * 0.09,
      })),
    []
  );

  return (
    <div className="overflow-hidden">
      {/* =====================================================
          HERO
      ===================================================== */}
      <section className="relative px-6 pb-24 pt-6 sm:pt-10">
        <BlurCircle className="-top-24 -left-32" size={420} color="teal" />
        <BlurCircle className="top-56 -right-44" size={320} color="teal" />

        <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-medium tracking-wide text-[var(--accent)] backdrop-blur-xl sm:text-xs">
            <Sparkles size={13} />
            EDIT&nbsp;·&nbsp;ANALYZE&nbsp;·&nbsp;HIDE&nbsp;&amp;&nbsp;RECOVER&nbsp;·&nbsp;TRANSFORM&nbsp;LIVE
          </div>

          <img
            src={logo}
            alt="Audiverse"
            className="h-11 w-auto sm:h-16"
          />

          <h1 className="mt-7 max-w-2xl text-3xl font-bold leading-[1.15] sm:text-5xl">
            One studio for{" "}
            <span className="text-[var(--accent)]">every</span> way you
            touch sound.
          </h1>

          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--text-muted)] sm:text-lg">
            Edit it, see it, hide it, transform it — live.
          </p>

          <div className="mt-9 flex w-full flex-col items-center gap-4 sm:w-auto sm:flex-row">
            <Link
              to="/studio"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-8 py-3.5 font-bold text-black transition-all duration-200 hover:scale-105 hover:bg-[var(--accent-hover)] hover:shadow-[0_0_25px_rgba(25,211,197,0.4)] sm:w-auto"
            >
              Launch Editing Studio
              <ArrowRight size={18} />
            </Link>

            <a
              href="#features"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-3.5 font-semibold text-white backdrop-blur-xl transition-all duration-200 hover:border-[var(--accent)]/50 hover:bg-white/10 sm:w-auto"
            >
              Explore Features
            </a>
          </div>

          {/* animated waveform decoration */}
          <div className="mt-16 flex h-16 items-end gap-[3px] opacity-80">
            {bars.map((bar, i) => (
              <span
                key={i}
                className="wave-bar w-[3px] rounded-full bg-[var(--accent)]"
                style={{
                  height: `${bar.h}%`,
                  animationDelay: `${bar.d}s`,
                }}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          STATS STRIP
      ===================================================== */}
      <Reveal className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-6 py-10 sm:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-[var(--accent)] sm:text-3xl">
                {stat.value}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-widest text-gray-400 sm:text-xs">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* =====================================================
          FEATURES
      ===================================================== */}
      <section id="features" className="relative px-6 py-28">
        <BlurCircle className="bottom-0 left-1/2 -translate-x-1/2" size={500} color="teal" />

        <div className="relative mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold sm:text-4xl">
              Four workflows. One{" "}
              <span className="text-[var(--accent)]">Audiverse</span>.
            </h2>
            <p className="mt-4 text-sm text-[var(--text-muted)] sm:text-base">
              Every page is a different lens on the same signal — build it,
              understand it, conceal it, or bend it live.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Reveal key={feature.title} delay={idx * 110}>
                  <div className="group relative h-full rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[var(--accent)]/40 hover:bg-white/[0.05] hover:shadow-[0_0_40px_rgba(25,211,197,0.14)]">
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] transition-transform duration-300 group-hover:scale-110">
                        <Icon size={22} />
                      </div>
                      <span className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                        {feature.tag}
                      </span>
                    </div>

                    <h3 className="mt-6 text-xl font-bold">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--text-muted)]">
                      {feature.description}
                    </p>

                    <ul className="mt-5 space-y-2.5">
                      {feature.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-2.5 text-sm text-gray-300"
                        >
                          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[var(--accent)]" />
                          {point}
                        </li>
                      ))}
                    </ul>

                    <Link
                      to={feature.to}
                      className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-[var(--accent)] transition-all duration-200 group-hover:gap-3"
                    >
                      Explore {feature.title}
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          EFFECTS CHIP CLOUD
      ===================================================== */}
      <section className="px-6 pb-28">
        <div className="mx-auto max-w-4xl text-center">
          <Reveal>
            <h2 className="text-2xl font-bold sm:text-3xl">
              15 studio-grade effects, ready to shape your sound
            </h2>
            <p className="mt-3 text-sm text-[var(--text-muted)] sm:text-base">
              Every effect below is available in the Editing Studio — and
              explained visually in Signal Lab.
            </p>
          </Reveal>

          <Reveal delay={120}>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              {EFFECT_CHIPS.map((effect) => (
                <Link
                  key={effect}
                  to="/signal-lab"
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 backdrop-blur-xl transition-all duration-200 hover:border-[var(--accent)]/50 hover:text-[var(--accent)] hover:shadow-[0_0_18px_rgba(25,211,197,0.18)]"
                >
                  {effect}
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* =====================================================
          WORKFLOW STEPS
      ===================================================== */}
      <section className="relative border-t border-white/10 bg-white/[0.02] px-6 py-28">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold sm:text-4xl">
              How Audiverse flows
            </h2>
            <p className="mt-4 text-sm text-[var(--text-muted)] sm:text-base">
              You don't have to use every page — but together, they cover
              the full life of a sound.
            </p>
          </Reveal>

          <div className="mt-16 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, idx) => (
              <Reveal key={step.n} delay={idx * 110} className="relative">
                <span className="text-4xl font-bold text-white/10 sm:text-5xl">
                  {step.n}
                </span>
                <h3 className="mt-3 text-lg font-bold text-[var(--accent)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">
                  {step.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA BANNER
      ===================================================== */}
      <section className="px-6 py-28">
        <Reveal>
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.01] px-8 py-16 text-center backdrop-blur-xl sm:px-16">
            <BlurCircle className="-top-24 left-1/2 -translate-x-1/2" size={420} color="teal" />

            <div className="relative">
              <Waves className="mx-auto mb-6 text-[var(--accent)]" size={32} />
              <h2 className="text-2xl font-bold sm:text-4xl">
                Ready to make some noise?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-sm text-[var(--text-muted)] sm:text-base">
                Jump into the Editing Studio right now, or create a free
                account to save your projects and revisit them later.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  to="/studio"
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-8 py-3.5 font-bold text-black transition-all duration-200 hover:scale-105 hover:bg-[var(--accent-hover)] hover:shadow-[0_0_25px_rgba(25,211,197,0.4)] sm:w-auto"
                >
                  Start Editing
                  <ArrowRight size={18} />
                </Link>

                {!user && (
                  <Link
                    to="/auth"
                    className="flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-8 py-3.5 font-semibold text-white backdrop-blur-xl transition-all duration-200 hover:border-[var(--accent)]/50 hover:bg-white/10 sm:w-auto"
                  >
                    Create Free Account
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="border-t border-white/10 bg-black/40 px-6 pt-16">
        <div className="mx-auto grid max-w-6xl gap-12 pb-12 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <img src={logo} alt="Audiverse" className="h-7 w-auto" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-400">
              A multitrack audio studio, DSP visualizer, audio
              steganography tool and live voice changer — built as one
              connected signal-processing playground.
            </p>
            <div className="mt-5 flex items-center gap-3">
              <a
                href="#"
                aria-label="GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition-colors hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
              >
                <Code2 size={16} />
              </a>
              <a
                href="mailto:hello@audiverse.app"
                aria-label="Email"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition-colors hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-white">Product</h4>
            <ul className="mt-4 space-y-3 text-sm text-gray-400">
              <li>
                <Link to="/studio" className="transition-colors hover:text-[var(--accent)]">
                  Editing Studio
                </Link>
              </li>
              <li>
                <Link to="/signal-lab" className="transition-colors hover:text-[var(--accent)]">
                  Signal Lab
                </Link>
              </li>
              <li>
                <Link to="/spill-your-guts" className="transition-colors hover:text-[var(--accent)]">
                  Spill Your Guts
                </Link>
              </li>
              <li>
                <Link to="/voice-changer" className="transition-colors hover:text-[var(--accent)]">
                  Voice Changer
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="text-sm font-semibold text-white">About</h4>
            <ul className="mt-4 space-y-3 text-sm text-gray-400">
              <li>
                Built as a project exploring audio DSP, signal
                visualization and steganography end-to-end.
              </li>
              <li className="pt-1 text-gray-500">
                Developers:{" "}
                <span className="text-gray-300"> Nusaiba Nehleen Bhuiyan</span> &amp;{" "}
                <span className="text-gray-300">Ramisa Musarrat Sujana</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-gray-400">
              <li>
                <a
                  href="mailto:hello@audiverse.app"
                  className="transition-colors hover:text-[var(--accent)]"
                >
                  hello@audiverse.app
                </a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-[var(--accent)]">
                  GitHub Repository
                </a>
              </li>
              <li>
                <Link to="/auth" className="transition-colors hover:text-[var(--accent)]">
                  Sign in / Create account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 py-6 text-center text-xs text-gray-500">
          © {year} Audiverse. Built with React, the Web Audio API &amp;
          Python DSP.
        </div>
      </footer>
    </div>
  );
};

export default Home;
