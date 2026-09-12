import React, { useState } from "react";
import { Check, Sparkles, ArrowRight, Calculator } from "lucide-react";

export function PricingCalculatorSection({ navigate }) {
  const [volCheckCount, setVolCheckCount] = useState(50);
  const costPerCheck = volCheckCount >= 500 ? 120 : volCheckCount >= 100 ? 150 : 180;
  const estimatedCost = volCheckCount * costPerCheck;

  return (
    <section className="ai-section">
      <div className="ai-section-header">
        <div className="ai-section-eyebrow">
          <Calculator size={14} />
          <span>Transparent Pricing</span>
        </div>
        <h2 className="ai-section-title">
          Pay Only For What You Verify
        </h2>
        <p className="ai-section-desc">
          No monthly subscription traps. Enjoy transparent pay-as-you-go verification fees with volume agent discounts.
        </p>
      </div>

      <div className="ai-pricing-grid" style={{ marginBottom: "4rem" }}>
        <div className="ai-price-card">
          <div>
            <h3 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#f8fafc" }}>Standard NIN</h3>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "0.35rem" }}>Basic identity validation and verification record summary.</p>
          </div>
          <div className="ai-price-val">
            ₦170 <span>/ check</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#f8fafc" }}><Check size={16} color="#10b981" /> Instant NIMC Check</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#f8fafc" }}><Check size={16} color="#10b981" /> Standard Slip Format</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#f8fafc" }}><Check size={16} color="#10b981" /> Transaction Receipt</div>
          </div>
          <button type="button" className="ai-btn-secondary" onClick={() => navigate("/register")} style={{ width: "100%", justifyContent: "center" }}>
            Get Started
          </button>
        </div>

        <div className="ai-price-card ai-price-card--popular">
          <div className="ai-popular-badge">Most Popular</div>
          <div>
            <h3 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#f8fafc" }}>Premium NIN Slip</h3>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "0.35rem" }}>High-resolution plastic/laminated ready slip layout with QR code.</p>
          </div>
          <div className="ai-price-val">
            ₦250 <span>/ check</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#f8fafc" }}><Check size={16} color="#10b981" /> Official Biometric Slip</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#f8fafc" }}><Check size={16} color="#10b981" /> High-DPI Printable PDF</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#f8fafc" }}><Check size={16} color="#10b981" /> Verified Digital Watermark</div>
          </div>
          <button type="button" className="ai-btn-primary" onClick={() => navigate("/register")} style={{ width: "100%", justifyContent: "center" }}>
            Start Verification
          </button>
        </div>

        <div className="ai-price-card">
          <div>
            <h3 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#f8fafc" }}>BVN & Modification</h3>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginTop: "0.35rem" }}>Full BVN cross-check, DOB correction, or Name modification tracking.</p>
          </div>
          <div className="ai-price-val">
            ₦180 <span>/ check</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.9rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#f8fafc" }}><Check size={16} color="#10b981" /> NIBSS Direct Validation</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#f8fafc" }}><Check size={16} color="#10b981" /> Modification Status Tracking</div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#f8fafc" }}><Check size={16} color="#10b981" /> IPE Resolution Support</div>
          </div>
          <button type="button" className="ai-btn-secondary" onClick={() => navigate("/register")} style={{ width: "100%", justifyContent: "center" }}>
            Get Started
          </button>
        </div>
      </div>

      {/* Interactive Volume Calculator */}
      <div className="ai-sandbox-card" style={{ gridTemplateColumns: "1fr", gap: "1.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#f8fafc", margin: 0 }}>Agent Volume Fee Estimator</h3>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: "0.25rem 0 0" }}>Adjust slider to estimate total wallet funding requirement with bulk discount.</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.78rem", color: "#64748b" }}>ESTIMATED COST</div>
              <div style={{ fontSize: "1.6rem", fontWeight: "800", color: "#34d399" }}>₦{estimatedCost.toLocaleString()}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.78rem", color: "#64748b" }}>RATE PER CHECK</div>
              <div style={{ fontSize: "1.2rem", fontWeight: "700", color: "#38bdf8" }}>₦{costPerCheck}</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: "#f8fafc", fontWeight: "600" }}>
            <span>Monthly Check Volume: {volCheckCount} checks</span>
            <span>{volCheckCount >= 500 ? "🎉 Tier 3 Enterprise Agent (-30%)" : volCheckCount >= 100 ? "✨ Tier 2 Volume Discount (-15%)" : "Standard Tier"}</span>
          </div>
          <input
            type="range"
            min={10}
            max={1000}
            step={10}
            value={volCheckCount}
            onChange={(e) => setVolCheckCount(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#10b981", cursor: "pointer", height: "8px", borderRadius: "4px" }}
          />
        </div>
      </div>
    </section>
  );
}
