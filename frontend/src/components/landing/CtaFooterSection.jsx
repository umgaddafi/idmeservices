import React, { useState } from "react";
import { ArrowRight, ShieldCheck, Mail, Send, CheckCircle2, Lock } from "lucide-react";
import { apiRequest } from "../../lib/api.js";

export function CtaFooterSection({ navigate, isAuthenticated, branding = {} }) {
  const systemName = branding?.systemName || "IDM e-Services";
  const logoUrl = branding?.logoUrl || "/idmeservices-logo.svg";
  const year = new Date().getFullYear();

  const [supportForm, setSupportForm] = useState({ name: "", email: "", message: "" });
  const [supportState, setSupportState] = useState({ loading: false, message: null });

  const submitSupportMessage = async (e) => {
    e.preventDefault();
    setSupportState({ loading: true, message: null });
    try {
      await apiRequest("/support-tickets", {
        method: "POST",
        body: {
          name: supportForm.name,
          email: supportForm.email,
          message: supportForm.message,
          subject: "Homepage support message",
          channel: "Homepage Form",
        },
      });
      setSupportForm({ name: "", email: "", message: "" });
      setSupportState({ loading: false, message: { tone: "success", text: "Message sent! Admin will respond by email." } });
    } catch (error) {
      setSupportState({ loading: false, message: { tone: "error", text: error.message || "Unable to send message right now." } });
    }
  };

  return (
    <>
      {/* Final Conversion CTA Banner */}
      <section className="ai-section" style={{ paddingTop: "2rem", paddingBottom: "6rem" }}>
        <div className="ai-cta-card">
          <h2>Ready to Launch Your AI Identity Operations?</h2>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem", maxWidth: "34rem", margin: 0 }}>
            Join thousands of agents, businesses, and compliance teams using {systemName} for real-time verification.
          </p>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <button
              type="button"
              className="ai-btn-primary"
              onClick={() => navigate(isAuthenticated ? "/dashboard" : "/register")}
              style={{ fontSize: "1.05rem", padding: "1.05rem 2.2rem" }}
            >
              <span>{isAuthenticated ? "Go to Dashboard" : "Create Free Account"}</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* Support & Contact Form Drawer */}
      <section className="ai-section" style={{ paddingTop: "0", paddingBottom: "6rem" }}>
        <div className="ai-feature-content-card">
          <div className="ai-feature-text">
            <span className="ai-section-eyebrow">Support Helpdesk</span>
            <h3>Need Assistance With Verification?</h3>
            <p style={{ color: "#94a3b8", lineHeight: "1.6" }}>
              Our dedicated identity specialists are on standby to answer your questions regarding NIN checks, wallet funding, API keys, or custom enterprise solutions.
            </p>

            <div className="ai-feature-checklist">
              <div className="ai-check-item">
                <CheckCircle2 size={18} className="ai-check-icon" />
                <span>24/7 Priority ticket desk & email support</span>
              </div>
              <div className="ai-check-item">
                <CheckCircle2 size={18} className="ai-check-icon" />
                <span>Dedicated account manager for bulk volume agents</span>
              </div>
            </div>
          </div>

          <div className="ai-feature-mockup" style={{ padding: "2rem" }}>
            {supportState.message && (
              <div style={{ padding: "0.75rem", borderRadius: "0.5rem", marginBottom: "1rem", fontSize: "0.85rem", background: supportState.message.tone === "success" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", color: supportState.message.tone === "success" ? "#34d399" : "#f87171" }}>
                {supportState.message.text}
              </div>
            )}

            <form onSubmit={submitSupportMessage} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div className="ai-input-group">
                <label style={{ fontSize: "0.82rem" }}>Full Name</label>
                <input
                  type="text"
                  className="ai-input-field"
                  style={{ padding: "0.75rem 1rem", fontSize: "0.9rem" }}
                  placeholder="Your Name"
                  value={supportForm.name}
                  onChange={(e) => setSupportForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div className="ai-input-group">
                <label style={{ fontSize: "0.82rem" }}>Email Address</label>
                <input
                  type="email"
                  className="ai-input-field"
                  style={{ padding: "0.75rem 1rem", fontSize: "0.9rem" }}
                  placeholder="name@example.com"
                  value={supportForm.email}
                  onChange={(e) => setSupportForm((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div className="ai-input-group">
                <label style={{ fontSize: "0.82rem" }}>Message / Inquiry</label>
                <textarea
                  rows="3"
                  className="ai-input-field"
                  style={{ padding: "0.75rem 1rem", fontSize: "0.9rem", resize: "none" }}
                  placeholder="Describe your verification requirement..."
                  value={supportForm.message}
                  onChange={(e) => setSupportForm((prev) => ({ ...prev, message: e.target.value }))}
                  required
                />
              </div>

              <button type="submit" className="ai-btn-primary" disabled={supportState.loading} style={{ justifyContent: "center" }}>
                {supportState.loading ? "Sending..." : "Send Support Message"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Futuristic 2026 Footer */}
      <footer className="ai-footer">
        <div className="ai-footer-inner">
          <div className="ai-footer-brand">
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <span className="brand-mark brand-mark--icon" style={{ width: "36px", height: "36px", padding: "4px", borderRadius: "10px", background: "white", display: "flex" }}>
                <img src={logoUrl} alt={systemName} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              </span>
              <strong style={{ color: "#ffffff", fontSize: "1.25rem", fontWeight: "800" }}>{systemName}</strong>
            </div>

            <p>
              Next-generation AI SaaS platform providing real-time National Identification Number (NIN), BVN, NIN modification, phone verification, and wallet funding.
            </p>

            <div className="header-status-pill" style={{ width: "fit-content" }}>
              <div className="header-status-dot"></div>
              <span>All Systems Operational • 99.98% Uptime</span>
            </div>
          </div>

          <div className="ai-footer-col">
            <h4>Verification Services</h4>
            <div className="ai-footer-links">
              <a href="#services" onClick={(e) => { e.preventDefault(); navigate("/select_nin_template"); }} className="ai-footer-link">NIN Check & PDF Slips</a>
              <a href="#services" onClick={(e) => { e.preventDefault(); navigate("/verify_bvn"); }} className="ai-footer-link">BVN Cross-Verification</a>
              <a href="#services" onClick={(e) => { e.preventDefault(); navigate("/modification/nin"); }} className="ai-footer-link">NIN Modification Hub</a>
              <a href="#services" onClick={(e) => { e.preventDefault(); navigate("/birth-attestation"); }} className="ai-footer-link">Birth Attestation</a>
            </div>
          </div>

          <div className="ai-footer-col">
            <h4>Platform & Wallet</h4>
            <div className="ai-footer-links">
              <a href="/wallet-funding" onClick={(e) => { e.preventDefault(); navigate("/wallet-funding"); }} className="ai-footer-link">Virtual Account Funding</a>
              <a href="/transactions" onClick={(e) => { e.preventDefault(); navigate("/transactions"); }} className="ai-footer-link">Transaction Ledger</a>
              <a href="/api-docs" onClick={(e) => { e.preventDefault(); navigate("/api-docs"); }} className="ai-footer-link">API Documentation</a>
              <a href="/login" onClick={(e) => { e.preventDefault(); navigate("/login"); }} className="ai-footer-link">Client Sign In</a>
            </div>
          </div>

          <div className="ai-footer-col">
            <h4>Security & Compliance</h4>
            <div className="ai-footer-links">
              <span className="ai-footer-link" style={{ cursor: "default", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Lock size={14} color="#10b981" /> 256-Bit SSL Encrypted
              </span>
              <span className="ai-footer-link" style={{ cursor: "default", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <ShieldCheck size={14} color="#06b6d4" /> NIMC Direct Protocol
              </span>
              <span className="ai-footer-link" style={{ cursor: "default" }}>ISO 27001 Certified</span>
              <span className="ai-footer-link" style={{ cursor: "default" }}>Audit Trail Compliant</span>
            </div>
          </div>
        </div>

        <div className="ai-footer-bottom">
          <span>&copy; {year} {systemName}. All rights reserved.</span>
          <div style={{ display: "flex", gap: "1.5rem" }}>
            <span style={{ color: "#64748b" }}>Privacy Policy</span>
            <span style={{ color: "#64748b" }}>Terms of Service</span>
            <span style={{ color: "#64748b" }}>Security Disclosures</span>
          </div>
        </div>
      </footer>
    </>
  );
}
