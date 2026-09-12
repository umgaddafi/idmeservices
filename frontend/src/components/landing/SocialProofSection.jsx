import React, { useState, useEffect } from "react";
import { Shield, Award, CheckCircle2, Lock, Activity } from "lucide-react";

export function SocialProofSection({ systemName }) {
  const activities = [
    "User from Lagos completed NIN Verification • 2s ago",
    "Agency from Abuja verified BVN Record • 5s ago",
    "Client from Port Harcourt funded wallet ₦50,000 • 12s ago",
    "Agent from Kano processed NIN Modification • 18s ago",
    "Enterprise user downloaded Premium Slip • 24s ago",
  ];

  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % activities.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [activities.length]);

  return (
    <section className="ai-social-proof-bar">
      <div className="ai-ticker-container">
        <div className="ai-trust-logos">
          <div className="ai-trust-logo">
            <Shield size={18} style={{ color: "#10b981" }} />
            <span>NIMC Direct Sync</span>
          </div>
          <div className="ai-trust-logo">
            <Lock size={18} style={{ color: "#06b6d4" }} />
            <span>Bank-Grade Encryption</span>
          </div>
          <div className="ai-trust-logo">
            <Award size={18} style={{ color: "#8b5cf6" }} />
            <span>ISO 27001 Standard</span>
          </div>
        </div>

        <div className="ai-live-activity-badge">
          <Activity size={15} style={{ color: "#10b981" }} className="animate-pulse" />
          <span>{activities[currentIdx]}</span>
        </div>
      </div>
    </section>
  );
}
