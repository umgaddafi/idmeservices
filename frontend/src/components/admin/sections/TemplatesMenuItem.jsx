import React from "react";
import { ArrowRight, BadgeCheck, Fingerprint, PhoneCall, Sparkles } from "lucide-react";
import { AdminPanel, AdminSectionHeader, AdminStatusPill } from "../AdminSectionPrimitives.jsx";

export function TemplatesMenuItem({ navigate, templateCatalog }) {
  return (
    <div className="admin-page-stack">
      <AdminSectionHeader
        eyebrow="Pricing Control"
        title="Pricing"
        description="Manage the member-facing charges available across verification and related service flows."
      />

      <section className="admin-grid admin-grid--three">
        {templateCatalog.map((template) => (
          <article key={template.id} className="panel admin-card admin-template-card">
            <div className="admin-template-card-top">
              <div className="admin-list-icon">{template.channel === "Phone" ? <PhoneCall size={16} /> : <Fingerprint size={16} />}</div>
              <AdminStatusPill value={template.status} />
            </div>
            <div>
              <div className="section-banner">{template.channel} Template</div>
              <h2 className="admin-card-title">{template.title}</h2>
              <p className="admin-card-description">{template.description}</p>
            </div>
            <div className="admin-data-points">
              <div className="admin-data-point">
                <span>Price</span>
                <strong>{template.price}</strong>
              </div>
              <div className="admin-data-point">
                <span>Usage</span>
                <strong>{template.usage}</strong>
              </div>
              <div className="admin-data-point">
                <span>Audience</span>
                <strong>{template.audience}</strong>
              </div>
              <div className="admin-data-point">
                <span>Owner</span>
                <strong>{template.owner}</strong>
              </div>
            </div>
            <button type="button" className="btn btn-secondary" onClick={() => navigate(template.routePath)}>
              <span>{template.routeLabel}</span>
              <ArrowRight size={16} />
            </button>
          </article>
        ))}
      </section>

      <section className="admin-grid admin-grid--two">
        <AdminPanel eyebrow="Release Checklist" title="Template governance" description="The checkpoints a design or compliance team would typically verify before enabling a template for users.">
          <div className="admin-list">
            <div className="admin-list-item">
              <div className="admin-list-icon">
                <Sparkles size={16} />
              </div>
              <div>
                <strong>Design consistency</strong>
                <p>Keep output quality, branding, and print readability consistent across every template variant.</p>
              </div>
              <div className="admin-ticket-meta">
                <AdminStatusPill value="Ready" />
              </div>
            </div>
            <div className="admin-list-item">
              <div className="admin-list-icon">
                <BadgeCheck size={16} />
              </div>
              <div>
                <strong>Compliance approval</strong>
                <p>Confirm the layout only exposes allowed data points and matches the current verification policy.</p>
              </div>
              <div className="admin-ticket-meta">
                <AdminStatusPill value="Watch" />
              </div>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Publishing" title="Portfolio summary" description="A quick snapshot of how broad the admin-managed template catalog has become.">
          <div className="admin-data-points">
            <div className="admin-data-point">
              <span>Total templates</span>
              <strong>{templateCatalog.length}</strong>
            </div>
            <div className="admin-data-point">
              <span>NIN variants</span>
              <strong>{templateCatalog.filter((item) => item.channel === "NIN").length}</strong>
            </div>
            <div className="admin-data-point">
              <span>Phone variants</span>
              <strong>{templateCatalog.filter((item) => item.channel === "Phone").length}</strong>
            </div>
            <div className="admin-data-point">
              <span>Live templates</span>
              <strong>{templateCatalog.filter((item) => String(item.status || "").toLowerCase().includes("live")).length}</strong>
            </div>
          </div>
        </AdminPanel>
      </section>
    </div>
  );
}
