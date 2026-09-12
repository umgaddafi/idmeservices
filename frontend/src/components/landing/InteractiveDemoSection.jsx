import React, { useState } from "react";
import { Play, Sparkles, CheckCircle2, FileText, Download, RefreshCcw, ShieldCheck } from "lucide-react";

export function InteractiveDemoSection({ navigate }) {
  const [sampleNumber, setSampleNumber] = useState("74920193109");
  const [serviceType, setServiceType] = useState("nin");
  const [templateFormat, setTemplateFormat] = useState("premium");
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulatedResult, setSimulatedResult] = useState(null);

  const handleSimulate = (e) => {
    e.preventDefault();
    if (!sampleNumber) return;

    setIsSimulating(true);
    setSimulatedResult(null);

    setTimeout(() => {
      setIsSimulating(false);
      setSimulatedResult({
        reference: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
        status: "SUCCESSFUL",
        nin: sampleNumber.length >= 11 ? sampleNumber : "74920193109",
        name: "ADEBAYO IBRAHIM KANU",
        dob: "1994-08-14",
        gender: "MALE",
        phone: "0803***8912",
        verificationTime: "1.4s",
        template: templateFormat.toUpperCase(),
      });
    }, 1200);
  };

  return (
    <section className="ai-section">
      <div className="ai-section-header">
        <div className="ai-section-eyebrow">
          <Play size={14} />
          <span>Interactive Sandbox</span>
        </div>
        <h2 className="ai-section-title">
          Test the Verification Engine Live
        </h2>
        <p className="ai-section-desc">
          Try a simulated NIN or BVN verification lookup right here to experience our sub-second AI database response time.
        </p>
      </div>

      <div className="ai-sandbox-card">
        <form className="ai-sandbox-form" onSubmit={handleSimulate}>
          <div className="ai-input-group">
            <label>Select Verification Type</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                className={`ai-tab-btn ${serviceType === "nin" ? "active" : ""}`}
                onClick={() => setServiceType("nin")}
                style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
              >
                NIN Check
              </button>
              <button
                type="button"
                className={`ai-tab-btn ${serviceType === "bvn" ? "active" : ""}`}
                onClick={() => setServiceType("bvn")}
                style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
              >
                BVN Check
              </button>
            </div>
          </div>

          <div className="ai-input-group">
            <label>Enter 11-Digit {serviceType.toUpperCase()} Number</label>
            <div className="ai-input-wrapper">
              <input
                type="text"
                className="ai-input-field"
                value={sampleNumber}
                onChange={(e) => setSampleNumber(e.target.value)}
                placeholder="e.g. 74920193109"
                maxLength={11}
              />
            </div>
          </div>

          <div className="ai-input-group">
            <label>Choose Document Template</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {["standard", "premium", "deluxe"].map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  className={`ai-tab-btn ${templateFormat === fmt ? "active" : ""}`}
                  onClick={() => setTemplateFormat(fmt)}
                  style={{ padding: "0.4rem 0.85rem", fontSize: "0.8rem", textTransform: "capitalize" }}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="ai-btn-primary" disabled={isSimulating}>
            {isSimulating ? (
              <>
                <RefreshCcw size={18} className="animate-spin" />
                <span>Syncing NIMC Database...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Run Instant Verification</span>
              </>
            )}
          </button>
        </form>

        <div className="ai-sandbox-output">
          {!simulatedResult && !isSimulating && (
            <div style={{ textAlign: "center", padding: "2rem 1rem", color: "#64748b" }}>
              <ShieldCheck size={42} style={{ margin: "0 auto 1rem", color: "#10b981", opacity: 0.6 }} />
              <p style={{ margin: 0, fontWeight: "600" }}>Live Terminal Standby</p>
              <small style={{ color: "#475569" }}>Click "Run Instant Verification" to test lookup</small>
            </div>
          )}

          {isSimulating && (
            <div style={{ textAlign: "center", padding: "2rem 1rem", color: "#34d399" }}>
              <div className="ai-scan-line" style={{ position: "relative", marginBottom: "1rem" }}></div>
              <p style={{ fontWeight: "700" }}>Querying Central Database...</p>
              <small style={{ color: "#94a3b8" }}>Encrypted Handshake • NIMC Protocol 2.4</small>
            </div>
          )}

          {simulatedResult && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.75rem" }}>
                <span style={{ fontSize: "0.78rem", color: "#10b981", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  <CheckCircle2 size={16} /> VERIFIED MATCH ({simulatedResult.verificationTime})
                </span>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{simulatedResult.reference}</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", fontSize: "0.85rem" }}>
                <div>
                  <div style={{ color: "#64748b", fontSize: "0.72rem" }}>FULL NAME</div>
                  <div style={{ color: "#f8fafc", fontWeight: "700" }}>{simulatedResult.name}</div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: "0.72rem" }}>IDENTITY NUMBER</div>
                  <div style={{ color: "#38bdf8", fontWeight: "700" }}>{simulatedResult.nin}</div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: "0.72rem" }}>DATE OF BIRTH</div>
                  <div style={{ color: "#f8fafc" }}>{simulatedResult.dob}</div>
                </div>
                <div>
                  <div style={{ color: "#64748b", fontSize: "0.72rem" }}>SELECTED SLIP</div>
                  <div style={{ color: "#34d399", fontWeight: "700" }}>{simulatedResult.template} PDF</div>
                </div>
              </div>

              <div style={{ marginTop: "0.5rem", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                <button
                  type="button"
                  className="ai-btn-secondary"
                  style={{ width: "100%", justifyContent: "center", padding: "0.65rem 1rem", fontSize: "0.85rem" }}
                  onClick={() => navigate("/register")}
                >
                  <Download size={16} />
                  <span>Create Account to Download Official Slip</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
