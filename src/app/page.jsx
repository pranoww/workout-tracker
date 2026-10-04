"use client";

import { useEffect, useRef, useState } from "react";
import { sendOtp as sendOtpAPI, verifyOtp as verifyOtpAPI } from "../api/auth";

const RESEND_SECONDS = 60;

export default function AuthPage() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRefs = useRef([]);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((value) => value - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const sendOtp = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await sendOtpAPI(email);
      setStep("otp");
      setCountdown(RESEND_SECONDS);

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event) => {
    event.preventDefault();

    const code = otp.join("");

    if (code.length !== 6) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await verifyOtpAPI(email, code);

      // Redirect after successful authentication.
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;

    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
    setError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (event) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    if (!pasted) return;

    const updatedOtp = [...otp];

    pasted.split("").forEach((digit, index) => {
      updatedOtp[index] = digit;
    });

    setOtp(updatedOtp);

    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const resendOtp = async () => {
    if (countdown > 0 || loading) return;

    setLoading(true);
    setError("");

    try {
      await sendOtpAPI(email);

      setOtp(["", "", "", "", "", ""]);
      setCountdown(RESEND_SECONDS);
      inputRefs.current[0]?.focus();
    } catch (err) {
      setError("Unable to resend the code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const changeEmail = () => {
    setStep("email");
    setOtp(["", "", "", "", "", ""]);
    setError("");
    setCountdown(0);
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left visual section */}
        <section className="relative hidden overflow-hidden lg:flex">
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
                  <span className="text-lg font-black">F</span>
                </div>

                <span className="text-lg font-semibold tracking-tight">
                  Fitness Tracker
                </span>
              </div>
            </div>

            <div className="max-w-lg">
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-zinc-500">
                Train smarter
              </p>

              <h1 className="text-5xl font-bold leading-[1.05] tracking-tight xl:text-6xl">
                Build consistency.
                <br />
                Track progress.
                <br />
                Get stronger.
              </h1>

              <p className="mt-6 max-w-md text-base leading-7 text-zinc-400">
                Your workouts, progress and personalized recommendations in
                one place.
              </p>

              <div className="mt-10 grid max-w-md grid-cols-3 gap-3">
                <Stat value="01" label="Profile" />
                <Stat value="02" label="Workout" />
                <Stat value="03" label="Progress" />
              </div>
            </div>

            <p className="text-sm text-zinc-600">
              Your training journey starts here.
            </p>
          </div>
        </section>

        {/* Right authentication section */}
        <section className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 py-10 sm:px-10">
          <div className="w-full max-w-md">
            {/* Mobile logo */}
            <div className="mb-12 flex items-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black">
                <span className="text-lg font-black">F</span>
              </div>

              <span className="font-semibold">Fitness Tracker</span>
            </div>

            {step === "email" ? (
              <EmailStep
                email={email}
                setEmail={setEmail}
                loading={loading}
                error={error}
                onSubmit={sendOtp}
              />
            ) : (
              <OtpStep
                email={email}
                otp={otp}
                countdown={countdown}
                loading={loading}
                error={error}
                inputRefs={inputRefs}
                onChange={handleOtpChange}
                onKeyDown={handleOtpKeyDown}
                onPaste={handleOtpPaste}
                onSubmit={verifyOtp}
                onResend={resendOtp}
                onChangeEmail={changeEmail}
              />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function EmailStep({
  email,
  setEmail,
  loading,
  error,
  onSubmit,
}) {
  return (
    <div>
      <div className="mb-10">
        <p className="mb-3 text-sm font-medium text-zinc-500">
          Welcome back
        </p>

        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Sign in to your account
        </h2>

        <p className="mt-4 leading-6 text-zinc-400">
          Enter your email and we&apos;ll send you a verification code.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-zinc-300"
          >
            Email address
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
            }}
            placeholder="you@example.com"
            autoComplete="email"
            className="h-14 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 text-white outline-none transition placeholder:text-zinc-600 focus:border-zinc-500 focus:ring-2 focus:ring-zinc-800"
          />
        </div>

        {error && <ErrorMessage message={error} />}

        <button
          type="submit"
          disabled={loading}
          className="h-14 w-full rounded-xl bg-white px-5 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Sending code..." : "Continue with email"}
        </button>
      </form>

      <div className="my-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-zinc-800" />
        <span className="text-xs text-zinc-600">PASSWORDLESS</span>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>

      <p className="text-center text-sm leading-6 text-zinc-500">
        No password required. We&apos;ll securely verify your email with a
        one-time code.
      </p>

      <p className="mt-10 text-center text-xs text-zinc-600">
        By continuing, you agree to our Terms and Privacy Policy.
      </p>
    </div>
  );
}

function OtpStep({
  email,
  otp,
  countdown,
  loading,
  error,
  inputRefs,
  onChange,
  onKeyDown,
  onPaste,
  onSubmit,
  onResend,
  onChangeEmail,
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onChangeEmail}
        className="mb-8 flex items-center gap-2 text-sm text-zinc-500 transition hover:text-white"
      >
        <span>←</span>
        Change email
      </button>

      <div className="mb-10">
        <p className="mb-3 text-sm font-medium text-zinc-500">
          Verify your email
        </p>

        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Enter your code
        </h2>

        <p className="mt-4 leading-6 text-zinc-400">
          We sent a 6-digit verification code to{" "}
          <span className="font-medium text-zinc-200">
            {maskEmail(email)}
          </span>
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <div
          className="mb-6 flex justify-between gap-2 sm:gap-3"
          onPaste={onPaste}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                inputRefs.current[index] = element;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(event) => {
                onChange(index, event.target.value);
              }}
              onKeyDown={(event) => {
                onKeyDown(index, event);
              }}
              className="h-14 w-full rounded-xl border border-zinc-800 bg-zinc-900 text-center text-xl font-semibold text-white outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-800 sm:h-16"
              aria-label={`OTP digit ${index + 1}`}
            />
          ))}
        </div>

        {error && <ErrorMessage message={error} />}

        <button
          type="submit"
          disabled={loading}
          className="mt-5 h-14 w-full rounded-xl bg-white px-5 font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Verifying..." : "Verify & continue"}
        </button>
      </form>

      <div className="mt-8 text-center">
        {countdown > 0 ? (
          <p className="text-sm text-zinc-500">
            Resend code in{" "}
            <span className="font-medium text-zinc-300">
              {countdown}s
            </span>
          </p>
        ) : (
          <button
            type="button"
            onClick={onResend}
            disabled={loading}
            className="text-sm font-medium text-zinc-300 transition hover:text-white disabled:opacity-50"
          >
            Resend code
          </button>
        )}
      </div>

      <p className="mt-10 text-center text-xs leading-5 text-zinc-600">
        The verification code expires shortly. Never share your code with
        anyone.
      </p>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
      <p className="text-xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  );
}

function ErrorMessage({ message }) {
  return (
    <div className="rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-400">
      {message}
    </div>
  );
}

function maskEmail(email) {
  const [name, domain] = email.split("@");

  if (!name || !domain) return email;

  if (name.length <= 2) {
    return `${name[0]}***@${domain}`;
  }

  return `${name[0]}${"*".repeat(Math.min(name.length - 1, 5))}@${domain}`;
}