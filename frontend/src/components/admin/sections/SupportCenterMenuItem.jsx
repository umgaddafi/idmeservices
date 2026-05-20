import React from "react";
import { AlertCircle, BadgeCheck, Clock3, MessageSquareWarning } from "lucide-react";
import { AdminMetricCard, AdminPanel, AdminSectionHeader, AdminStatusPill } from "../AdminSectionPrimitives.jsx";

function countByStatus(items, matcher) {
  return items.filter((item) => matcher(String(item.status || "").toLowerCase())).length;
}

export function SupportCenterMenuItem({ supportItems }) {
  const openCount = countByStatus(supportItems, (status) => status.includes("open"));
  const investigatingCount = countByStatus(supportItems, (status) => status.includes("investigating"));
  const escalatedCount = countByStatus(supportItems, (status) => status.includes("escalated"));
  const resolvedCount = countByStatus(supportItems, (status) => status.includes("closed") || status.includes("resolved") || status.includes("verified"));

  return (
    <div className="admin-page-stack">
      <AdminSectionHeader
        eyebrow="Service Desk"
        title="Support Center"
        description="Centralize customer complaints, investigation status, and escalation handling in one operator view."
      />

      <section className="admin-stat-grid">
        <AdminMetricCard label="Open tickets" value={openCount} note="Fresh issues waiting for ownership" icon={<MessageSquareWarning size={18} />} accent="warning" />
        <AdminMetricCard label="Investigating" value={investigatingCount} note="Tickets already under active review" icon={<Clock3 size={18} />} accent="default" />
        <AdminMetricCard label="Escalated" value={escalatedCount} note="Cases pushed to a higher-priority queue" icon={<AlertCircle size={18} />} accent="critical" />
        <AdminMetricCard label="Resolved" value={resolvedCount} note="Closed or verified service outcomes" icon={<BadgeCheck size={18} />} accent="success" />
      </section>

      <section className="admin-grid admin-grid--two">
        <AdminPanel eyebrow="Ticket Queue" title="Customer issues" description="A concise support desk queue for the highest-signal tickets.">
          <div className="admin-list">
            {supportItems.map((ticket) => (
              <div key={ticket.id} className="admin-ticket">
                <div>
                  <strong>{ticket.subject}</strong>
                  <p>
                    {ticket.customer} • {ticket.channel}
                  </p>
                </div>
                <div className="admin-ticket-meta">
                  <AdminStatusPill value={ticket.priority} />
                  <AdminStatusPill value={ticket.status} />
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Operating Standards" title="Support playbook" description="Simple service metrics and process reminders to make the menu feel like a real enterprise workspace.">
          <div className="admin-list">
            <div className="admin-list-item">
              <div className="admin-list-icon">
                <Clock3 size={16} />
              </div>
              <div>
                <strong>First response target</strong>
                <p>Aim to acknowledge wallet and verification complaints within 15 minutes during business hours.</p>
              </div>
              <div className="admin-ticket-meta">
                <AdminStatusPill value="Stable" />
              </div>
            </div>
            <div className="admin-list-item">
              <div className="admin-list-icon">
                <AlertCircle size={16} />
              </div>
              <div>
                <strong>Escalation rules</strong>
                <p>Escalate failed funding, blocked logins, and repeated verification mismatches to an admin owner immediately.</p>
              </div>
              <div className="admin-ticket-meta">
                <AdminStatusPill value="Watch" />
              </div>
            </div>
          </div>
        </AdminPanel>
      </section>
    </div>
  );
}
