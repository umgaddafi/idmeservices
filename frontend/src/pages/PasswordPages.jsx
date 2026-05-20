import React, { useMemo, useState } from "react";
import { Field, LoadingInline, MessageBanner } from "../components/common/CommonComponents.jsx";

function readQueryValue(key) {
  try {
    return new URLSearchParams(window.location.search).get(key) || "";
  } catch {
    return "";
  }
}

export function ForgotPasswordPage({ submitting, message, onSubmit, navigate }) {
  const [email, setEmail] = useState(readQueryValue("email"));

  return (
    <section className="auth-wrap">
      <div className="auth-card">
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
          <Field
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={setEmail}
            disabled={submitting}
          />
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
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

export function ResetPasswordPage({ submitting, message, onSubmit, navigate }) {
  const initialEmail = useMemo(() => readQueryValue("email"), []);
  const initialToken = useMemo(() => readQueryValue("token"), []);
  const [form, setForm] = useState({
    email: initialEmail,
    token: initialToken,
    password: "",
    confirmPassword: "",
  });

  return (
    <section className="auth-wrap">
      <div className="auth-card">
        <div className="auth-heading auth-heading--center">
          <p className="eyebrow">Password Recovery</p>
          <h1>Reset Password</h1>
          <p className="lede">Enter your reset token and choose a new password to complete the recovery flow.</p>
        </div>
        <MessageBanner tone={message?.tone}>{message?.text}</MessageBanner>
        <form
          className="form-stack"
          onSubmit={(event) => {
            event.preventDefault();
            onSubmit(form, setForm);
          }}
        >
          <Field
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={(value) => setForm((current) => ({ ...current, email: value }))}
            disabled={submitting}
          />
          <Field
            label="Reset Token"
            type="text"
            placeholder="Enter your reset token"
            value={form.token}
            onChange={(value) => setForm((current) => ({ ...current, token: value }))}
            disabled={submitting}
          />
          <Field
            label="New Password"
            type="password"
            placeholder="Create a new password"
            value={form.password}
            onChange={(value) => setForm((current) => ({ ...current, password: value }))}
            disabled={submitting}
          />
          <Field
            label="Confirm New Password"
            type="password"
            placeholder="Confirm your new password"
            value={form.confirmPassword}
            onChange={(value) => setForm((current) => ({ ...current, confirmPassword: value }))}
            disabled={submitting}
          />
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
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
