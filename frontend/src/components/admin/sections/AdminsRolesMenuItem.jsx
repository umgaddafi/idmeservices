import React from "react";
import { Settings2, ShieldCheck, Users } from "lucide-react";
import { AdminDataPointList, AdminMetricCard, AdminPanel, AdminSectionHeader, AdminStatusPill } from "../AdminSectionPrimitives.jsx";

export function AdminsRolesMenuItem({ adminRoster }) {
  const activeAdmins = adminRoster.filter((item) => String(item.status || "").toLowerCase() === "active").length;
  const elevatedRoles = adminRoster.filter((item) => ["ADMIN", "PRESIDENT", "AUDITOR"].includes(String(item.role || "").toUpperCase())).length;

  return (
    <div className="admin-page-stack">
      <AdminSectionHeader
        eyebrow="Governance"
        title="Admins / Roles"
        description="Review who has access to the platform, what they can touch, and how responsibilities are distributed."
      />

      <section className="admin-stat-grid">
        <AdminMetricCard label="Admin seats" value={adminRoster.length} note="People or roles represented in this workspace" icon={<Users size={18} />} accent="default" />
        <AdminMetricCard label="Active admins" value={activeAdmins} note="Roles currently marked active" icon={<ShieldCheck size={18} />} accent="success" />
        <AdminMetricCard label="Elevated roles" value={elevatedRoles} note="Admin, president, and auditor access scopes" icon={<Settings2 size={18} />} accent="warning" />
        <AdminMetricCard label="Coverage model" value="24/7" note="Operations, support, and finance role overlap" icon={<ShieldCheck size={18} />} accent="finance" />
      </section>

      <section className="admin-grid admin-grid--three">
        {adminRoster.map((admin) => (
          <article key={admin.id} className="panel admin-card admin-role-card">
            <div className="admin-template-card-top">
              <div>
                <div className="section-banner">{admin.role}</div>
                <h2 className="admin-card-title">{admin.name}</h2>
              </div>
              <AdminStatusPill value={admin.status} />
            </div>
            <p className="admin-card-description">{admin.scope}</p>
            <AdminDataPointList
              items={[
                { label: "Role ID", value: admin.id },
                { label: "Last Seen", value: admin.lastSeen },
              ]}
            />
            <div className="admin-permission-list">
              {admin.permissions.map((permission) => (
                <AdminStatusPill key={permission} value={permission} />
              ))}
            </div>
          </article>
        ))}
      </section>

      <AdminPanel eyebrow="Access Principles" title="Role governance notes" description="These notes help communicate how the access model is intended to evolve.">
        <div className="admin-list">
          <div className="admin-list-item">
            <div className="admin-list-icon">
              <ShieldCheck size={16} />
            </div>
            <div>
              <strong>Separation of duties</strong>
              <p>Keep funding approvals, reporting, and settings changes separated where possible to reduce operational risk.</p>
            </div>
          </div>
          <div className="admin-list-item">
            <div className="admin-list-icon">
              <Settings2 size={16} />
            </div>
            <div>
              <strong>Least-privilege growth path</strong>
              <p>As more backend endpoints land, the UI can map these cards to real role permissions without rewriting the menu shell.</p>
            </div>
          </div>
        </div>
      </AdminPanel>
    </div>
  );
}
