import React, { useState } from "react";
import { ShieldCheck, Fingerprint, FileEdit, PhoneCall, Wallet, CheckCircle2, Code2, Sparkles } from "lucide-react";

export function FeaturesShowcaseSection({ systemName }) {
  const [activeTab, setActiveTab] = useState("nin");
  const [codeLang, setCodeLang] = useState("curl");

  const tabs = [
    { id: "nin", label: "NIN Verification", icon: <ShieldCheck size={18} /> },
    { id: "bvn", label: "BVN Cross-Check", icon: <Fingerprint size={18} /> },
    { id: "mod", label: "NIN Modification", icon: <FileEdit size={18} /> },
    { id: "phone", label: "Phone & CAC Check", icon: <PhoneCall size={18} /> },
    { id: "wallet", label: "Automated Wallet", icon: <Wallet size={18} /> },
  ];

  const codeSnippets = {
    curl: `curl -X POST "https://api.${systemName.toLowerCase().replace(/[^a-z]/g, '')}.com/v2/nin/verify" \\
  -H "Authorization: Bearer sec_live_99f82a17" \\
  -H "Content-Type: application/json" \\
  -d '{"nin": "74920193109", "template": "premium"}'`,
    javascript: `const response = await fetch("https://api.idmeservices.com/v2/nin/verify", {
  method: "POST",
  headers: {
    "Authorization": "Bearer sec_live_99f82a17",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({ nin: "74920193109", template: "premium" })
});
const data = await response.json();`,
    python: `import requests

url = "https://api.idmeservices.com/v2/nin/verify"
headers = {"Authorization": "Bearer sec_live_99f82a17"}
payload = {"nin": "74920193109", "template": "premium"}

response = requests.post(url, json=payload, headers=headers)
print(response.json())`,
  };

  return (
    <section id="services" className="ai-section">
      <div className="ai-section-header">
        <div className="ai-section-eyebrow">
          <Sparkles size={14} />
          <span>Core Capabilities</span>
        </div>
        <h2 className="ai-section-title">
          Enterprise Identity Solutions <br /> Built for Modern Operations
        </h2>
        <p className="ai-section-desc">
          Unified verification suite designed to reduce customer onboarding time from days to seconds while eliminating identity fraud.
        </p>
      </div>

      <div className="ai-feature-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`ai-tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="ai-feature-content-card">
        {activeTab === "nin" && (
          <>
            <div className="ai-feature-text">
              <h3>Instant NIN Verification & PDF Slip Generation</h3>
              <p style={{ color: "#94a3b8", lineHeight: "1.6" }}>
                Verify National Identification Numbers in real time with high accuracy. Output standard, premium, or deluxe formatted PDF slips with verified biometric stamps.
              </p>

              <div className="ai-feature-checklist">
                <div className="ai-check-item">
                  <CheckCircle2 size={18} className="ai-check-icon" />
                  <span>Real-time direct NIMC database validation</span>
                </div>
                <div className="ai-check-item">
                  <CheckCircle2 size={18} className="ai-check-icon" />
                  <span>Multi-format printable PDF slips (Standard, Premium, Deluxe)</span>
                </div>
                <div className="ai-check-item">
                  <CheckCircle2 size={18} className="ai-check-icon" />
                  <span>Instant digital audit logs and transaction receipts</span>
                </div>
              </div>
            </div>

            <div className="ai-feature-mockup">
              <div className="ai-code-switcher">
                <span style={{ fontSize: "0.82rem", fontWeight: "700", color: "#f8fafc" }}>Developer API Preview</span>
                <div className="ai-code-tabs">
                  {["curl", "javascript", "python"].map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      className={`ai-code-tab ${codeLang === lang ? "active" : ""}`}
                      onClick={() => setCodeLang(lang)}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <pre className="ai-code-block">
                <code>{codeSnippets[codeLang]}</code>
              </pre>
            </div>
          </>
        )}

        {activeTab === "bvn" && (
          <>
            <div className="ai-feature-text">
              <h3>BVN Cross-Check & Demographics Verification</h3>
              <p style={{ color: "#94a3b8", lineHeight: "1.6" }}>
                Cross-reference Bank Verification Numbers against registered phone numbers, dates of birth, and biometric metadata to ensure 100% KYC compliance.
              </p>

              <div className="ai-feature-checklist">
                <div className="ai-check-item">
                  <CheckCircle2 size={18} className="ai-check-icon" />
                  <span>Direct NIBSS & Central Bank verification protocols</span>
                </div>
                <div className="ai-check-item">
                  <CheckCircle2 size={18} className="ai-check-icon" />
                  <span>Cross-linked phone & name match score</span>
                </div>
                <div className="ai-check-item">
                  <CheckCircle2 size={18} className="ai-check-icon" />
                  <span>Bank account ownership verification</span>
                </div>
              </div>
            </div>

            <div className="ai-feature-mockup">
              <div className="ai-res-chip" style={{ padding: "1.25rem" }}>
                <span className="ai-res-label">BVN Match Score</span>
                <span className="ai-res-val" style={{ fontSize: "1.5rem", color: "#10b981" }}>99.4% Match</span>
                <span className="ai-res-label" style={{ marginTop: "0.5rem" }}>Customer Name, DOB & Phone Verified</span>
              </div>
            </div>
          </>
        )}

        {activeTab === "mod" && (
          <>
            <div className="ai-feature-text">
              <h3>NIN Modification Hub & Request Tracking</h3>
              <p style={{ color: "#94a3b8", lineHeight: "1.6" }}>
                Submit and monitor official NIN modification requests (Date of Birth, Name Correction, Phone Number update) with real-time status tracking.
              </p>

              <div className="ai-feature-checklist">
                <div className="ai-check-item">
                  <CheckCircle2 size={18} className="ai-check-icon" />
                  <span>Guided document upload with passport photo cropper</span>
                </div>
                <div className="ai-check-item">
                  <CheckCircle2 size={18} className="ai-check-icon" />
                  <span>Automated validation error prevention</span>
                </div>
                <div className="ai-check-item">
                  <CheckCircle2 size={18} className="ai-check-icon" />
                  <span>IPE Resolution and Birth Attestation integration</span>
                </div>
              </div>
            </div>

            <div className="ai-feature-mockup">
              <div className="ai-res-chip" style={{ padding: "1.25rem" }}>
                <span className="ai-res-label">Modification Request #MOD-8910</span>
                <span className="ai-res-val" style={{ fontSize: "1.2rem", color: "#38bdf8" }}>Status: Processing</span>
                <span className="ai-res-label" style={{ marginTop: "0.5rem" }}>Date of Birth Update • NIMC Review</span>
              </div>
            </div>
          </>
        )}

        {activeTab === "phone" && (
          <>
            <div className="ai-feature-text">
              <h3>Phone Check & Commercial CAC Verification</h3>
              <p style={{ color: "#94a3b8", lineHeight: "1.6" }}>
                Verify phone SIM registration details, telco subscriber identities, and Corporate Affairs Commission (CAC) business registrations.
              </p>

              <div className="ai-feature-checklist">
                <div className="ai-check-item">
                  <CheckCircle2 size={18} className="ai-check-icon" />
                  <span>Multi-network telco SIM registration lookup</span>
                </div>
                <div className="ai-check-item">
                  <CheckCircle2 size={18} className="ai-check-icon" />
                  <span>CAC Business RC Number & Director verification</span>
                </div>
              </div>
            </div>

            <div className="ai-feature-mockup">
              <div className="ai-res-chip" style={{ padding: "1.25rem" }}>
                <span className="ai-res-label">Telco SIM Check</span>
                <span className="ai-res-val" style={{ fontSize: "1.2rem", color: "#34d399" }}>Active Subscriber Verified</span>
                <span className="ai-res-label" style={{ marginTop: "0.5rem" }}>Network: MTN Nigeria • 4G Active</span>
              </div>
            </div>
          </>
        )}

        {activeTab === "wallet" && (
          <>
            <div className="ai-feature-text">
              <h3>Automated Wallet & Dedicated Virtual Accounts</h3>
              <p style={{ color: "#94a3b8", lineHeight: "1.6" }}>
                Fund your verification wallet instantly using dedicated Paystack virtual accounts. Enjoy zero delay on service execution and automated balance reconciliation.
              </p>

              <div className="ai-feature-checklist">
                <div className="ai-check-item">
                  <CheckCircle2 size={18} className="ai-check-icon" />
                  <span>Personalized dedicated Wema/Providus account numbers</span>
                </div>
                <div className="ai-check-item">
                  <CheckCircle2 size={18} className="ai-check-icon" />
                  <span>Instant balance updates & transparent billing ledger</span>
                </div>
              </div>
            </div>

            <div className="ai-feature-mockup">
              <div className="ai-res-chip" style={{ padding: "1.25rem" }}>
                <span className="ai-res-label">Virtual Account Funding</span>
                <span className="ai-res-val" style={{ fontSize: "1.3rem", color: "#10b981" }}>+ ₦25,000.00 Credited</span>
                <span className="ai-res-label" style={{ marginTop: "0.5rem" }}>Bank Transfer • Instant Reconciled</span>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
