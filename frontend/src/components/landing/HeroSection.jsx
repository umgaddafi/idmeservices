import React from "react";
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, Zap, Lock, Terminal, Cpu } from "lucide-react";

export function HeroSection({ navigate, isAuthenticated, systemName }) {
  const primaryAction = isAuthenticated 
    ? { label: "Open Dashboard", path: "/dashboard" } 
    : { label: "Launch AI Engine Free", path: "/register" };
    
  const secondaryAction = isAuthenticated 
    ? { label: "Start Verification", path: "/select_nin_template" } 
    : { label: "Client Sign In", path: "/login" };

  return (
    <section id="home" className="ai-hero-section">
      <div className="ai-hero-content">
        <div className="ai-announcement-badge">
          <Sparkles size={16} />
          <span>IDM AI Engine v2.4 • Instant NIMC & BVN Database Sync</span>
        </div>

        <h1 className="ai-hero-title">
          Next-Gen AI Identity <br />
          <span className="ai-gradient-text">& Verification Engine</span>
        </h1>

        <p className="ai-hero-description">
          Seamlessly verify National Identification Numbers (NIN), BVN records, NIN modifications, phone checks, CAC and wallet funding in real-time with sub-second AI precision.
        </p>

        <div className="ai-hero-actions">
          <button 
            type="button" 
            className="ai-btn-primary" 
            onClick={() => navigate(primaryAction.path)}
          >
            <span>{primaryAction.label}</span>
            <ArrowRight size={18} />
          </button>
          
          <button 
            type="button" 
            className="ai-btn-secondary" 
            onClick={() => navigate(secondaryAction.path)}
          >
            {secondaryAction.label}
          </button>
        </div>

        <div className="ai-hero-metrics">
          <div className="ai-metric-item">
            <span className="ai-metric-val">99.98%</span>
            <span className="ai-metric-label">Verification Accuracy</span>
          </div>
          <div className="ai-metric-item">
            <span className="ai-metric-val">&lt; 1.8s</span>
            <span className="ai-metric-label">Avg Processing Time</span>
          </div>
          <div className="ai-metric-item">
            <span className="ai-metric-val">256-Bit</span>
            <span className="ai-metric-label">Bank-Grade Encryption</span>
          </div>
        </div>
      </div>

      <div className="ai-hero-visual">
        {/* Floating AI Badges */}
        <div className="ai-floating-badge ai-floating-badge--top-right">
          <Zap size={18} className="text-emerald-400" />
          <div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>NIMC API Status</div>
            <div style={{ color: "#34d399" }}>Connected (1.2ms)</div>
          </div>
        </div>

        <div className="ai-floating-badge ai-floating-badge--bottom-left">
          <Lock size={18} className="text-cyan-400" />
          <div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>Identity Vault</div>
            <div style={{ color: "#38bdf8" }}>Audit Compliance 100%</div>
          </div>
        </div>

        {/* Terminal Interactive Visual */}
        <div className="ai-terminal-card">
          <div className="ai-terminal-header">
            <div className="ai-terminal-dots">
              <div className="ai-terminal-dot ai-terminal-dot--red"></div>
              <div className="ai-terminal-dot ai-terminal-dot--yellow"></div>
              <div className="ai-terminal-dot ai-terminal-dot--green"></div>
            </div>
            <div className="ai-terminal-title">idm-ai-verification-terminal v2.4.0</div>
            <Cpu size={16} style={{ color: "#10b981" }} />
          </div>

          <div className="ai-terminal-body">
            <div className="ai-terminal-scan-box">
              <div className="ai-scan-line"></div>
              <div className="ai-scan-avatar">
                <ShieldCheck size={28} />
              </div>
              <div className="ai-scan-info">
                <div className="ai-scan-name">NIN Verification Engine</div>
                <div className="ai-scan-detail">Target: Central NIMC Database Sync</div>
              </div>
            </div>

            <div className="ai-terminal-results">
              <div className="ai-res-chip">
                <span className="ai-res-label">NIN Record</span>
                <span className="ai-res-val">7492****109</span>
              </div>
              <div className="ai-res-chip">
                <span className="ai-res-label">Match Status</span>
                <span className="ai-res-val ai-res-val--verified">
                  <CheckCircle2 size={15} /> Verified
                </span>
              </div>
              <div className="ai-res-chip">
                <span className="ai-res-label">BVN Cross-Check</span>
                <span className="ai-res-val">2219****841</span>
              </div>
              <div className="ai-res-chip">
                <span className="ai-res-label">Wallet Balance</span>
                <span className="ai-res-val" style={{ color: "#38bdf8" }}>Automated Credit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
