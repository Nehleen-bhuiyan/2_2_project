import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, User } from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const { login } = useAuth();

  // ==============================
  // INPUT CHANGE
  // ==============================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ==============================
  // SUBMIT
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      if (isLogin) {
        // =========================
        // LOGIN
        // =========================

        const response = await api.post("/login", {
          email: form.email,
          password: form.password,
        });

        /*
          Expected response:

          {
            access_token: "...",
            token_type: "bearer",
            user: {
              id: "...",
              email: "...",
              name: "..."
            }
          }
        */

        login(
          response.data.access_token,
          response.data.user
        );

        navigate("/");
      } else {
        // =========================
        // REGISTER
        // =========================

        await api.post("/register", {
          name: form.name,
          email: form.email,
          password: form.password,
        });

        // Registration successful
        // Switch user to login panel

        setIsLogin(true);

        setForm({
          name: "",
          email: form.email,
          password: "",
        });
      }
    } catch (err) {
      console.error(err);

      /*
        FastAPI normally sends errors as:

        {
          detail: "Invalid email or password"
        }
      */

      const message =
        err.response?.data?.detail ||
        (isLogin
          ? "Invalid email or password"
          : "Registration failed");

      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // ==============================
  // SWITCH LOGIN / REGISTER
  // ==============================

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError("");

    setForm({
      name: "",
      email: "",
      password: "",
    });
  };

  return (
    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        px-6
        bg-[var(--bg-main)]
      "
    >
      {/* ==================================
          AUTH CARD
      =================================== */}

      <div
        className="
          relative
          w-[850px]
          max-w-full
          h-[500px]
          overflow-hidden
          rounded-[28px]

          border
          border-white/10

          bg-white/[0.04]
          backdrop-blur-2xl

          shadow-[0_25px_80px_rgba(0,0,0,0.55)]

          text-white
        "
      >

        {/* ==================================
            TEAL SLIDING PANEL
        =================================== */}

        <div
          className={`
            absolute
            top-0
            z-20

            h-full
            w-1/2

            flex
            items-center
            justify-center

            bg-[var(--accent)]

            transition-transform
            duration-700
            ease-in-out

            ${
              isLogin
                ? "translate-x-full"
                : "translate-x-0"
            }
          `}
        >
          {/* Decorative glow */}

          <div
            className="
              absolute
              w-72
              h-72
              rounded-full
              bg-white/20
              blur-[100px]
            "
          />

          <div
            className="
              relative
              z-10
              px-10
              text-center
              text-black
            "
          >
            <h2
              className="
                mb-4
                text-4xl
                font-bold
              "
            >
              {isLogin
                ? "Hello!"
                : "Welcome Back!"}
            </h2>

            <p
              className="
                mb-8
                text-sm
                font-medium
                text-black/70
              "
            >
              {isLogin
                ? "New to Audiverse? Create an account and start editing."
                : "Already have an account? Sign in to continue your projects."}
            </p>

            <button
              type="button"
              onClick={switchMode}
              className="
                cursor-pointer
                rounded-full

                border
                border-black/60

                px-8
                py-2.5

                font-semibold

                transition-all
                duration-300

                hover:bg-black
                hover:text-white
              "
            >
              {isLogin ? "Register" : "Login"}
            </button>
          </div>
        </div>

        {/* ==================================
            FORM SIDE
        =================================== */}

        <div
          className={`
            absolute
            top-0

            h-full
            w-1/2

            flex
            items-center
            justify-center

            transition-transform
            duration-700
            ease-in-out

            ${
              isLogin
                ? "translate-x-0"
                : "translate-x-full"
            }
          `}
        >

          {/* ==================================
              LOGIN FORM
          =================================== */}

          {isLogin ? (
            <form
              onSubmit={handleSubmit}
              className="w-[78%]"
            >
              <div className="mb-8">
                <h1
                  className="
                    text-3xl
                    font-bold
                  "
                >
                  Login
                </h1>

                <p
                  className="
                    mt-2
                    text-sm
                    text-gray-400
                  "
                >
                  Welcome back to Audiverse
                </p>
              </div>

              {/* EMAIL */}

              <div className="relative mb-4">

                <Mail
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                  "
                />

                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  className="
                    w-full

                    rounded-xl

                    border
                    border-white/10

                    bg-white/[0.05]

                    py-3.5
                    pl-11
                    pr-4

                    text-sm
                    text-white

                    outline-none

                    transition

                    placeholder:text-gray-500

                    focus:border-[var(--accent)]
                    focus:ring-1
                    focus:ring-[var(--accent)]
                  "
                />
              </div>

              {/* PASSWORD */}

              <div className="relative mb-5">

                <Lock
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                  "
                />

                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className="
                    w-full

                    rounded-xl

                    border
                    border-white/10

                    bg-white/[0.05]

                    py-3.5
                    pl-11
                    pr-4

                    text-sm

                    outline-none

                    placeholder:text-gray-500

                    focus:border-[var(--accent)]
                    focus:ring-1
                    focus:ring-[var(--accent)]
                  "
                />
              </div>

              {/* ERROR */}

              {error && (
                <p
                  className="
                    mb-4
                    text-sm
                    text-red-400
                  "
                >
                  {error}
                </p>
              )}

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                disabled={submitting}
                className="
                  w-full
                  cursor-pointer

                  rounded-xl

                  bg-[var(--accent)]

                  py-3

                  font-bold
                  text-black

                  transition-all
                  duration-200

                  hover:bg-[var(--accent-hover)]
                  hover:shadow-[0_0_25px_rgba(25,211,197,0.25)]

                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {submitting
                  ? "Logging in..."
                  : "Login"}
              </button>
            </form>
          ) : (

            /* ==================================
                REGISTER FORM
            =================================== */

            <form
              onSubmit={handleSubmit}
              className="w-[78%]"
            >
              <div className="mb-7">

                <h1
                  className="
                    text-3xl
                    font-bold
                  "
                >
                  Create Account
                </h1>

                <p
                  className="
                    mt-2
                    text-sm
                    text-gray-400
                  "
                >
                  Start creating with SignalStudio
                </p>
              </div>

              {/* NAME */}

              <div className="relative mb-4">

                <User
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                  "
                />

                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Name"
                  value={form.name}
                  onChange={handleChange}
                  className="
                    w-full
                    rounded-xl

                    border
                    border-white/10

                    bg-white/[0.05]

                    py-3
                    pl-11
                    pr-4

                    text-sm

                    outline-none

                    placeholder:text-gray-500

                    focus:border-[var(--accent)]
                    focus:ring-1
                    focus:ring-[var(--accent)]
                  "
                />
              </div>

              {/* EMAIL */}

              <div className="relative mb-4">

                <Mail
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                  "
                />

                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  className="
                    w-full
                    rounded-xl

                    border
                    border-white/10

                    bg-white/[0.05]

                    py-3
                    pl-11
                    pr-4

                    text-sm

                    outline-none

                    placeholder:text-gray-500

                    focus:border-[var(--accent)]
                    focus:ring-1
                    focus:ring-[var(--accent)]
                  "
                />
              </div>

              {/* PASSWORD */}

              <div className="relative mb-5">

                <Lock
                  size={18}
                  className="
                    absolute
                    left-4
                    top-1/2
                    -translate-y-1/2
                    text-gray-500
                  "
                />

                <input
                  name="password"
                  type="password"
                  required
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className="
                    w-full
                    rounded-xl

                    border
                    border-white/10

                    bg-white/[0.05]

                    py-3
                    pl-11
                    pr-4

                    text-sm

                    outline-none

                    placeholder:text-gray-500

                    focus:border-[var(--accent)]
                    focus:ring-1
                    focus:ring-[var(--accent)]
                  "
                />
              </div>

              {/* ERROR */}

              {error && (
                <p
                  className="
                    mb-4
                    text-sm
                    text-red-400
                  "
                >
                  {error}
                </p>
              )}

              {/* REGISTER */}

              <button
                type="submit"
                disabled={submitting}
                className="
                  w-full
                  cursor-pointer

                  rounded-xl

                  bg-[var(--accent)]

                  py-3

                  font-bold
                  text-black

                  transition-all
                  duration-200

                  hover:bg-[var(--accent-hover)]
                  hover:shadow-[0_0_25px_rgba(25,211,197,0.25)]

                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {submitting
                  ? "Creating account..."
                  : "Register"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;