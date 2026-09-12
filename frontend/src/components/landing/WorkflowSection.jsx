import React from "react";
import { UserPlus, Wallet, ShieldCheck, Download, Sparkles } from "lucide-react";

export function WorkflowSection() {
  const steps = [
    {
      num: "01",
      title: "Create Account",
      desc: "Open your personal or agent workspace in less than 60 seconds with instant verification credentials.",
      icon: <UserPlus size={20} />,
    },
    {
      num: "02",
      title: "Fund Wallet",
      desc: "Use your dedicated virtual account number (Wema/Providus) for zero-fee instant wallet credit.",
      icon: <Wallet size={20} />,
    },
    {
      num: "03",
      title: "Submit Identity Check",
      desc: "Input NIN, BVN, phone number, or modification details for real-time NIMC database lookup.",
      icon: <ShieldCheck size={20} />,
    },
    {
      num: "04",
      title: "Download Slip & Cert",
      desc: "Obtain high-fidelity PDF slips (Standard, Premium, Deluxe) ready for printing or compliance audit.",
      icon: <Download size={20} />,
    },
  ];

  return (
    <section className="ai-section">
      <div className="ai-section-header">
        <div className="ai-section-eyebrow">
          <Sparkles size={14} />
          <span>Simple 4-Step Process</span>
        </div>
        <h2 className="ai-section-title">
          How the Platform Works
        </h2>
        <p className="ai-section-desc">
          Designed for maximum speed and simplicity so you can run identity checks without technical hurdles.
        </p>
      </div>

      <div className="ai-workflow-grid">
        {steps.map((step) => (
          <div key={step.num} className="ai-step-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div className="ai-step-num">{step.num}</div>
              <div style={{ color: "#10b981", opacity: 0.8 }}>{step.icon}</div>
            </div>
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
