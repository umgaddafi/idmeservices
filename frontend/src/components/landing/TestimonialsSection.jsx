import React, { useState } from "react";
import { Star, Quote, Sparkles, CheckCircle2 } from "lucide-react";

export function TestimonialsSection({ systemName }) {
  const testimonials = [
    {
      name: "Amina Yusuf",
      role: "KYC Compliance Officer",
      location: "Abuja",
      quote: "The sub-second NIN verification response is incredible. We processed over 400 identity checks for onboarding in a single afternoon without a hitch.",
      rating: 5,
    },
    {
      name: "Chinedu Okeke",
      role: "Financial Services Agent",
      location: "Lagos",
      quote: "The automated Paystack virtual account wallet funding feature saved our team so much time. Reconciliations happen instantly in real time.",
      rating: 5,
    },
    {
      name: "Blessing Eze",
      role: "Telecom Retailer",
      location: "Port Harcourt",
      quote: "The Premium NIN Slip printing format looks clean and professional. Our customers love the quality of the generated PDF documents.",
      rating: 5,
    },
    {
      name: "Ibrahim Musa",
      role: "Enterprise Systems Integrator",
      location: "Kano",
      quote: "Integrating our backend with the API took less than 20 minutes. Reliable uptime, bank-grade encryption, and zero downtime.",
      rating: 5,
    },
  ];

  return (
    <section className="ai-section">
      <div className="ai-section-header">
        <div className="ai-section-eyebrow">
          <Sparkles size={14} />
          <span>Verified Client Reviews</span>
        </div>
        <h2 className="ai-section-title">
          Trusted by Agents & Compliance Teams
        </h2>
        <p className="ai-section-desc">
          See how businesses and identity agents across Nigeria leverage {systemName} for fast, dependable verification.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(18rem, 1fr))", gap: "1.5rem" }}>
        {testimonials.map((t, i) => (
          <div key={i} className="ai-step-card" style={{ gap: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: "2px" }}>
                {[...Array(t.rating)].map((_, r) => (
                  <Star key={r} size={15} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <Quote size={20} style={{ color: "#10b981", opacity: 0.5 }} />
            </div>

            <p style={{ fontStyle: "italic", fontSize: "0.95rem", color: "#e2e8f0", lineHeight: "1.6" }}>
              "{t.quote}"
            </p>

            <div style={{ marginTop: "auto", paddingTop: "0.75rem", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: "linear-gradient(135deg, #10b981, #06b6d4)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: "800", fontSize: "0.85rem" }}>
                {t.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: "700", color: "#f8fafc", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                  {t.name} <CheckCircle2 size={13} color="#34d399" />
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>{t.role} • {t.location}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
