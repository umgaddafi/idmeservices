import React, { useState } from "react";
import { Alert, CircularProgress, Snackbar } from "@mui/material";
import { KeyRound, Lock, Mail, Phone, User } from "lucide-react";

export function MessageBanner({ tone = "info", children }) {
  if (!children) return null;
  return <div className={`message-banner message-banner--${tone}`}>{children}</div>;
}

export function LoadingInline({ label = "Loading...", size = 16 }) {
  return (
    <span className="loading-inline">
      <CircularProgress size={size} thickness={5} sx={{ color: "currentColor" }} />
      <span>{label}</span>
    </span>
  );
}

export function ToastHost({ toast, onClose }) {
  return (
    <Snackbar
      open={Boolean(toast?.open)}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{ zIndex: 3000, top: { xs: 72, sm: 88 } }}
    >
      <Alert onClose={onClose} severity={toast?.tone || "info"} variant="filled" sx={{ width: "100%" }}>
        {toast?.text || ""}
      </Alert>
    </Snackbar>
  );
}

export function Field({ label, type, placeholder, value, onChange, disabled = false }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
    </label>
  );
}

export function AuthPage({
  mode,
  title,
  eyebrow,
  description,
  submitLabel,
  secondary,
  passwordHelp = null,
  onSubmit,
  submitting,
  message,
  navigate,
  branding = {},
}) {
  const isRegister = mode === "register";
  const isLogin = mode === "login";
  const isAdmin = String(eyebrow || "").toLowerCase().includes("admin");
  const logoUrl = branding?.logoUrl || "/idmeservices-logo.svg";
  const systemName = branding?.systemName || "IDM e-Services";
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const goToAuthRoute = (path) => {
    if (navigate) {
      navigate(path);
      return;
    }
    window.location.href = path;
  };

  return (
    <section className="auth-wrap">
      <div className="auth-shell-card">
        <aside className="auth-brand-panel">
          <div>
            <button type="button" className="auth-brand-logo" onClick={() => goToAuthRoute("/")} aria-label="Go to homepage">
              <img src={logoUrl} alt={`${systemName} logo`} />
            </button>

            <h1>
              Secure Identity <span>Services</span>
            </h1>
            <p>
              Access trusted identity solutions for NIN enrollment, modification, verification,
              BVN services, birth attestation, and diaspora child birth notification.
            </p>

            <div className="auth-service-pills">
              <span>NIN Enrollment</span>
              <span>NIN Modification</span>
              <span>NIN Verification</span>
              <span>BVN Services</span>
              <span>Birth Attestation</span>
              <span>Error 50 Resolution</span>
            </div>
          </div>

          <div className="auth-trust-card">
            <Lock size={34} strokeWidth={2.35} />
            <div>
              <strong>Safe. Fast. Reliable.</strong>
              <p>Your data privacy and identity accuracy remain our top priority.</p>
            </div>
          </div>
        </aside>

        <div className="auth-panel">
          <div className="auth-card">
            {!isAdmin ? (
              <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
                <button
                  type="button"
                  className={isLogin ? "active" : ""}
                  onClick={() => goToAuthRoute("/login")}
                  aria-selected={isLogin}
                  role="tab"
                >
                  Login
                </button>
                <button
                  type="button"
                  className={isRegister ? "active" : ""}
                  onClick={() => goToAuthRoute("/register")}
                  aria-selected={isRegister}
                  role="tab"
                >
                  Register
                </button>
              </div>
            ) : null}

            <div className="auth-heading auth-heading--center">
              <p className="eyebrow">{eyebrow}</p>
              <h1>{isRegister ? "Create Account" : title || "Welcome Back"}</h1>
              <p className="lede">
                {description || (isRegister
                  ? "Register to request and track your identity services easily."
                  : "Login to continue managing your identity service requests.")}
              </p>
            </div>
            <MessageBanner tone={message?.tone}>{message?.text}</MessageBanner>
            <form
              className="form-stack"
              onSubmit={(event) => {
                event.preventDefault();
                onSubmit(form, setForm);
              }}
            >
              {isRegister ? (
                <div className="auth-field-row">
                  <AuthInput label="Full Name" type="text" placeholder="Full name" value={form.name} icon={<User size={18} />} onChange={(value) => setForm((current) => ({ ...current, name: value }))} />
                  <AuthInput label="Phone Number" type="tel" placeholder="Phone number" value={form.phone} icon={<Phone size={18} />} onChange={(value) => setForm((current) => ({ ...current, phone: value }))} />
                </div>
              ) : null}

              <AuthInput label="Email Address" type="email" placeholder={isRegister ? "Enter email address" : "Enter your email"} value={form.email} icon={<Mail size={18} />} onChange={(value) => setForm((current) => ({ ...current, email: value }))} />

              {isRegister ? (
                <div className="auth-field-row">
                  <AuthInput label="Password" type="password" placeholder="Password" value={form.password} icon={<KeyRound size={18} />} onChange={(value) => setForm((current) => ({ ...current, password: value }))} />
                  <AuthInput label="Confirm" type="password" placeholder="Confirm" value={form.confirmPassword} icon={<Lock size={18} />} onChange={(value) => setForm((current) => ({ ...current, confirmPassword: value }))} />
                </div>
              ) : (
                <AuthInput label="Password" type="password" placeholder="Enter your password" value={form.password} icon={<KeyRound size={18} />} onChange={(value) => setForm((current) => ({ ...current, password: value }))} />
              )}

              {!isRegister ? (
                <div className="auth-extra">
                  <label>
                    <input type="checkbox" /> Remember me
                  </label>
                  {passwordHelp}
                </div>
              ) : null}

              <button type="submit" className="btn btn-primary btn-block auth-submit-button" disabled={submitting}>
                {submitting ? <LoadingInline label="Please wait..." /> : (isRegister ? "Create Account" : submitLabel || "Login Securely")}
              </button>

              <div className="auth-links">
                {isAdmin ? secondary : (
                  <button
                    type="button"
                    className="auth-switch-button"
                    onClick={() => goToAuthRoute(isRegister ? "/login" : "/register")}
                  >
                    {isRegister ? "Already registered? " : "New user? "}
                    <span className="auth-link-underline">{isRegister ? "Login here" : "Create account"}</span>
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

function AuthInput({ label, type, placeholder, value, onChange, icon }) {
  return (
    <label className="auth-input-label">
      <span>{label}</span>
      <span className="auth-input-box">
        {icon}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
    </label>
  );
}

export function ProtectedPage({ isAuthenticated, loading, children }) {
  if (loading) {
    return <div className="empty-state">Loading your account...</div>;
  }
  if (!isAuthenticated) {
    return <div className="empty-state">Please login to continue.</div>;
  }
  return children;
}

