import React, { useState } from "react";
import { ChevronDown, ChevronUp, Search, HelpCircle, Sparkles } from "lucide-react";

export function FaqSection({ systemName }) {
  const [activeFaq, setActiveFaq] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const faqs = [
    {
      q: "How do I create an account and start verification?",
      a: "Click Launch AI Engine Free on the homepage, complete your quick registration, then access your dashboard to start NIN checks, BVN verification, or wallet funding.",
    },
    {
      q: `What services can I access on ${systemName}?`,
      a: "You can access NIN Verification, BVN Cross-Verification, NIN Modification (DOB, Name Correction), Phone SIM Registration checks, CAC Corporate checks, Birth Attestation, and PDF document template delivery.",
    },
    {
      q: "How does virtual account wallet funding work?",
      a: "Each registered user is automatically assigned a dedicated Wema or Providus bank virtual account. Any bank transfer made to this account credits your wallet instantly with zero delays.",
    },
    {
      q: "Can I track previous verifications and download PDF receipts?",
      a: "Yes. Your dashboard records every transaction, charge, and verification result. You can view, search, and download PDF slips or receipts at any time.",
    },
    {
      q: "Is my identity data handled securely?",
      a: "Absolute security is guaranteed. We utilize 256-bit SSL encryption, ISO 27001 data protection protocols, and audit compliance logging to ensure maximum identity privacy.",
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section id="contact" className="ai-section">
      <div className="ai-section-header">
        <div className="ai-section-eyebrow">
          <HelpCircle size={14} />
          <span>Knowledge Base</span>
        </div>
        <h2 className="ai-section-title">
          Frequently Asked Questions
        </h2>
        <p className="ai-section-desc">
          Quick answers about {systemName} services, wallet funding, verification workflows, and security.
        </p>
      </div>

      <div className="ai-faq-search-bar">
        <div className="ai-input-wrapper">
          <Search size={18} style={{ position: "absolute", left: "1rem", color: "#64748b" }} />
          <input
            type="text"
            className="ai-input-field"
            style={{ paddingLeft: "2.75rem" }}
            placeholder="Search questions (e.g. wallet, NIN, security)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="ai-faq-list">
        {filteredFaqs.map((faq, index) => {
          const isOpen = activeFaq === index;
          return (
            <div key={index} className="ai-faq-item">
              <button
                type="button"
                className="ai-faq-btn"
                onClick={() => setActiveFaq(isOpen ? -1 : index)}
                aria-expanded={isOpen}
              >
                <span>{faq.q}</span>
                {isOpen ? <ChevronUp size={20} color="#10b981" /> : <ChevronDown size={20} color="#64748b" />}
              </button>

              {isOpen && (
                <div className="ai-faq-answer">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}

        {filteredFaqs.length === 0 && (
          <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
            No questions matching "{searchQuery}". Send a message via support for instant help.
          </div>
        )}
      </div>
    </section>
  );
}
