import React from "react";
import { Activity, AlertCircle, BarChart3, CircleDollarSign, Users } from "lucide-react";
import { formatMoney } from "../../../lib/appUtils.js";
import { AdminMetricCard, AdminPanel, AdminSectionHeader, AdminStatusPill } from "../AdminSectionPrimitives.jsx";

export function ReportsAnalyticsMenuItem({ adminMembers, pendingTickets, transactionFeed, verificationFeed }) {
  const totalRevenue = transactionFeed
    .filter((item) => item.direction === "debit")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const activeMembers = adminMembers.filter((member) => String(member.status || "").toLowerCase() === "active").length;
  const averageCharge = verificationFeed.length ? totalRevenue / verificationFeed.length : 0;
  const channelPerformance = Object.values(
    verificationFeed.reduce((accumulator, item) => {
      const key = item.channel || "Unknown";
      if (!accumulator[key]) {
        accumulator[key] = { name: key, volume: 0, revenue: 0 };
      }
      accumulator[key].volume += 1;
      accumulator[key].revenue += Number(item.amount || 0);
      return accumulator;
    }, {}),
  );

  const executiveSignals = [
    {
      id: "revenue",
      title: "Revenue concentration",
      copy: `Average verification yield is ${formatMoney(averageCharge)} per request in the current admin feed.`,
      status: "Stable",
      icon: <CircleDollarSign size={16} />,
    },
    {
      id: "support",
      title: "Support backlog",
      copy: `${pendingTickets} support cases remain open and could affect customer satisfaction if left unattended.`,
      status: pendingTickets > 2 ? "Watch" : "Stable",
      icon: <AlertCircle size={16} />,
    },
    {
      id: "adoption",
      title: "Member adoption",
      copy: `${activeMembers} of ${adminMembers.length} accounts are active inside the current portfolio.`,
      status: "Ready",
      icon: <Users size={16} />,
    },
  ];

  return (
    <div className="admin-page-stack">
      <AdminSectionHeader
        eyebrow="Business Intelligence"
        title="Reports & Analytics"
        description="A compact executive layer for revenue, adoption, channel mix, and operational pressure."
      />

      <section className="admin-stat-grid">
        <AdminMetricCard label="Gross revenue" value={formatMoney(totalRevenue)} note="Wallet-backed verification charges" icon={<CircleDollarSign size={18} />} accent="finance" />
        <AdminMetricCard label="Average charge" value={formatMoney(averageCharge)} note="Average value per verification request" icon={<BarChart3 size={18} />} accent="default" />
        <AdminMetricCard label="Active members" value={activeMembers} note={`${adminMembers.length - activeMembers} inactive or pending accounts`} icon={<Users size={18} />} accent="success" />
        <AdminMetricCard label="Support backlog" value={pendingTickets} note="Open or investigating customer issues" icon={<Activity size={18} />} accent="warning" />
      </section>

      <section className="admin-grid admin-grid--two">
        <AdminPanel eyebrow="Channel Mix" title="Performance by verification channel" description="How request volume and charge capture are distributed across the current service lines.">
          <div className="admin-list">
            {channelPerformance.map((item) => (
              <div key={item.name} className="admin-list-item">
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.volume} requests recorded in the current feed.</p>
                </div>
                <div className="admin-activity-right">
                  <strong>{formatMoney(item.revenue)}</strong>
                  <small>captured charges</small>
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Executive Notes" title="Signals worth watching" description="High-level operational context for leadership or audit-style reviews.">
          <div className="admin-list">
            {executiveSignals.map((item) => (
              <div key={item.id} className="admin-list-item">
                <div className="admin-list-icon">{item.icon}</div>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.copy}</p>
                </div>
                <div className="admin-ticket-meta">
                  <AdminStatusPill value={item.status} />
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>
      </section>
    </div>
  );
}
