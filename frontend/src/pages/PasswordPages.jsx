import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, KeyRound, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { AuthInput, LoadingInline, MessageBanner } from "../components/common/CommonComponents.jsx";

function readQueryValue(key) {
  try {
    return new URLSearchParams(window.location.search).get(key) || "";
  } catch {
    return "";
  }
}

export function ForgotPasswordPage({ submitting, message, onSubmit, navigate, branding }) {
  const [email, setEmail] = useState(readQueryValue("email"));
  const systemName = branding?.systemName || "IDM e-Services";
  const logoUrl = branding?.logoUrl;

  return (
    <section className="auth-wrap auth-wrap--standalone">
      <div className="auth-card auth-card--standalone">
        {logoUrl ? (
          <div className="auth-standalone-logo-wrap">
            <button
              type="button"
              className="auth-brand-logo"
              onClick={() => (navigate ? navigate("/") : (window.location.href = "/"))}
              aria-label="Go to homepage"
            >
              <img src={logoUrl} alt={`${systemName} logo`} />
            </button>
          </div>
        ) : null}

        <div className="auth-heading auth-heading--center">
          <p className="eyebrow">Password Recovery</p>
          <h1>Forgot Password</h1>
          <p className="lede">Enter the email address linked to your account and we will prepare reset instructions for you.</p>
        </div>

        <MessageBanner tone={message?.tone}>{message?.text}</MessageBanner>

        <form
          className="form-stack"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit({ email });
          }}
        >
          <AuthInput
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={setEmail}
            disabled={submitting}
            required
            icon={<Mail size={18} />}
          />

          <button type="submit" className="btn btn-primary btn-block auth-submit-button" disabled={submitting}>
            {submitting ? <LoadingInline label="Preparing..." /> : "Send Reset Instructions"}
          </button>

          <div className="auth-links">
            <a
              href="/login"
              onClick={(event) => {
                event.preventDefault();
                navigate("/login");
              }}
            >
              Back to <span className="auth-link-underline">Login</span>
            </a>
            <span className="auth-links-divider" aria-hidden="true">•</span>
            <a
              href="/reset-password"
              onClick={(event) => {
                event.preventDefault();
                navigate(email ? `/reset-password?email=${encodeURIComponent(email)}` : "/reset-password");
              }}
            >
              Already have a token? <span className="auth-link-underline">Reset password</span>
            </a>
          </div>
        </form>
      </div>
    </section>
  );
}

export function ResetPasswordPage({ submitting, message, onSubmit, navigate, branding }) {
  const initialEmail = useMemo(() => readQueryValue("email"), []);
  const initialToken = useMemo(() => readQueryValue("token"), []);
  const [form, setForm] = useState({
    email: initialEmail,
    token: initialToken,
    password: "",
    confirmPassword: "",
  });
  const [localSuccess, setLocalSuccess] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(3);

  const systemName = branding?.systemName || "IDM e-Services";
  const logoUrl = branding?.logoUrl;

  const isSuccess = Boolean(localSuccess || message?.tone === "success");

  useEffect(() => {
    if (!isSuccess) return;

    setSecondsLeft(3);
    const startTime = Date.now();
    const duration = 3000;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingMs = Math.max(0, duration - elapsed);
      const remainingSec = Math.ceil(remainingMs / 1000);
      setSecondsLeft(remainingSec);

      if (elapsed >= duration) {
        clearInterval(timer);
        if (navigate) {
          navigate("/login");
        } else {
          window.location.href = "/login";
        }
      }
    }, 100);

    return () => clearInterval(timer);
  }, [isSuccess, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const ok = await onSubmit(form, setForm);
    if (ok) {
      setLocalSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <section className="auth-wrap auth-wrap--standalone">
        <motion.div
          className="auth-card auth-card--standalone auth-card--success"
          initial={{ opacity: 0, scale: 0.9, y: 22 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 24 }}
        >
          {logoUrl ? (
            <div className="auth-standalone-logo-wrap">
              <button
                type="button"
                className="auth-brand-logo"
                onClick={() => (navigate ? navigate("/") : (window.location.href = "/"))}
                aria-label="Go to homepage"
              >
                <img src={logoUrl} alt={`${systemName} logo`} />
              </button>
            </div>
          ) : null}

          <div className="auth-success-badge-wrap">
            <motion.div
              className="auth-success-badge-pulse"
              initial={{ scale: 0.8, opacity: 0.8 }}
              animate={{ scale: [0.8, 1.45, 1.9], opacity: [0.7, 0.25, 0] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeOut" }}
            />
            <motion.div
              className="auth-success-icon-badge"
              initial={{ scale: 0, rotate: -25 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.12 }}
            >
              <CheckCircle2 size={42} strokeWidth={2.6} />
            </motion.div>
          </div>

          <motion.div
            className="auth-heading auth-heading--center"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35 }}
          >
            <p
              className="eyebrow"
              style={{
                display: "block",
                color: "#37ef83",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontSize: "0.75rem",
                marginBottom: "0.4rem",
              }}
            >
              Recovery Complete
            </p>
            <h1>Password Reset Successful!</h1>
            <p className="lede">
              {message?.text || "Your password has been changed successfully. You can now sign in with your new password."}
            </p>
          </motion.div>

          <motion.div
            className="auth-redirect-box"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.35 }}
          >
            <div className="auth-redirect-text">
              <span>Redirecting to login in <strong>{secondsLeft}</strong> second{secondsLeft === 1 ? "" : "s"}...</span>
              <span className="auth-redirect-countdown">{secondsLeft}s</span>
            </div>
            <div className="auth-redirect-bar-track">
              <div className="auth-redirect-bar-fill" />
            </div>
          </motion.div>

          <motion.button
            type="button"
            className="btn btn-primary btn-block auth-submit-button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.36, duration: 0.35 }}
            onClick={() => (navigate ? navigate("/login") : (window.location.href = "/login"))}
          >
            Go to Login Now →
          </motion.button>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="auth-wrap auth-wrap--standalone">
      <div className="auth-card auth-card--standalone">
        {logoUrl ? (
          <div className="auth-standalone-logo-wrap">
            <button
              type="button"
              className="auth-brand-logo"
              onClick={() => (navigate ? navigate("/") : (window.location.href = "/"))}
              aria-label="Go to homepage"
            >
              <img src={logoUrl} alt={`${systemName} logo`} />
            </button>
          </div>
        ) : null}

        <div className="auth-heading auth-heading--center">
          <p className="eyebrow">Password Recovery</p>
          <h1>Reset Password</h1>
          <p className="lede">Enter your reset token and choose a new password to complete the recovery flow.</p>
        </div>

        <MessageBanner tone={message?.tone}>{message?.text}</MessageBanner>

        <form
          className="form-stack"
          onSubmit={handleSubmit}
        >
          <AuthInput
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={(value) => setForm((current) => ({ ...current, email: value }))}
            disabled={submitting}
            required
            icon={<Mail size={18} />}
          />
          <AuthInput
            label="Reset Token"
            type="text"
            placeholder="Enter your reset token"
            value={form.token}
            onChange={(value) => setForm((current) => ({ ...current, token: value }))}
            disabled={submitting}
            required
            icon={<KeyRound size={18} />}
          />
          <AuthInput
            label="New Password"
            type="password"
            placeholder="Create a new password"
            value={form.password}
            onChange={(value) => setForm((current) => ({ ...current, password: value }))}
            disabled={submitting}
            required
            icon={<Lock size={18} />}
          />
          <AuthInput
            label="Confirm New Password"
            type="password"
            placeholder="Confirm your new password"
            value={form.confirmPassword}
            onChange={(value) => setForm((current) => ({ ...current, confirmPassword: value }))}
            disabled={submitting}
            required
            icon={<Lock size={18} />}
          />

          <button type="submit" className="btn btn-primary btn-block auth-submit-button" disabled={submitting}>
            {submitting ? <LoadingInline label="Submitting..." /> : "Reset Password"}
          </button>

          <div className="auth-links">
            <a
              href="/forgot-password"
              onClick={(event) => {
                event.preventDefault();
                navigate("/forgot-password");
              }}
            >
              Need another token? <span className="auth-link-underline">Forgot password</span>
            </a>
            <span className="auth-links-divider" aria-hidden="true">•</span>
            <a
              href="/login"
              onClick={(event) => {
                event.preventDefault();
                navigate("/login");
              }}
            >
              Back to <span className="auth-link-underline">Login</span>
            </a>
          </div>
        </form>
      </div>
    </section>
  );
}
