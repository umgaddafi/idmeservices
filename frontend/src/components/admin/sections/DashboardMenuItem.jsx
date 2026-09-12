import React from "react";
import { Activity, AlertCircle, CircleDollarSign, FileSearch, MessageSquareWarning, RefreshCcw, Users } from "lucide-react";
import { MessageBanner } from "../../common/CommonComponents.jsx";
import { formatDate, formatMoney } from "../../../lib/appUtils.js";
import { AdminMetricCard, AdminPanel, AdminSectionHeader, AdminStatusPill } from "../AdminSectionPrimitives.jsx";

export function DashboardMenuItem({
  adminMembers,
  message,
  navigate,
  pendingTickets,
  totalWalletFloat,
  verificationFeed,
  transactionFeed,
}) {
  const activeMembers = adminMembers.filter((member) => String(member.status || "").toLowerCase() === "active").length;
  const pendingMemberCount = adminMembers.filter((member) => String(member.status || "").toLowerCase().includes("pending")).length;
  const lowBalanceCount = adminMembers.filter((member) => Number(member.walletBalance || 0) < 1000).length;
  const completedVerifications = verificationFeed.filter((item) => String(item.status || "").toLowerCase().includes("completed")).length;
  const pendingVerifications = verificationFeed.filter((item) => {
    const status = String(item.status || "").toLowerCase();
    return status.includes("pending") || status.includes("review");
  }).length;
  const failedVerifications = verificationFeed.filter((item) => String(item.status || "").toLowerCase().includes("failed")).length;
  const totalRevenue = transactionFeed
    .filter((item) => item.direction === "debit")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const focusItems = [
    {
      id: "verification-queue",
      title: "Verification queue",
      copy: `${pendingVerifications} requests are waiting for analyst review.`,
      icon: <FileSearch size={16} />,
      status: `${pendingVerifications} pending`,
    },
    {
      id: "support-pressure",
      title: "Support pressure",
      copy: `${pendingTickets} tickets are still open across wallet, auth, and verification workflows.`,
      icon: <MessageSquareWarning size={16} />,
      status: pendingTickets > 2 ? "Watch" : "Stable",
    },
    {
      id: "member-review",
      title: "Member review",
      copy: `${pendingMemberCount} accounts still need onboarding or compliance follow-up.`,
      icon: <Users size={16} />,
      status: pendingMemberCount ? `${pendingMemberCount} waiting` : "Clear",
    },
    {
      id: "failed-jobs",
      title: "Failed jobs",
      copy: `${failedVerifications} verification attempts need triage or customer outreach.`,
      icon: <AlertCircle size={16} />,
      status: failedVerifications ? `${failedVerifications} failed` : "Stable",
    },
  ];

  const recentSignals = [
    ...verificationFeed.map((item) => ({
      id: `verification-${item.id}`,
      title: item.reference,
      copy: `${item.customer} • ${item.channel}`,
      meta: formatDate(item.createdAt),
      status: item.status,
      sortKey: item.createdAt,
      icon: <FileSearch size={16} />,
    })),
    ...transactionFeed.map((item) => ({
      id: `transaction-${item.id}`,
      title: item.reference,
      copy: `${item.type} • ${item.description}`,
      meta: formatDate(item.date),
      status: item.status,
      sortKey: item.date,
      icon: item.direction === "credit" ? <CircleDollarSign size={16} /> : <RefreshCcw size={16} />,
    })),
  ]
    .sort((left, right) => new Date(right.sortKey).getTime() - new Date(left.sortKey).getTime())
    .slice(0, 6);

  return (
    <div className="admin-page-stack">
      <MessageBanner tone={message?.tone}>{message?.text}</MessageBanner>

      <section className="admin-hero">
        <div>
          <span className="section-banner admin-section-chip">Control Room</span>
          <h1>Enterprise overview for verification, wallets, and operator workload.</h1>
          <p>Stay ahead of customer demand, funding movement, and operational risk from one central command surface.</p>
        </div>
        <button type="button" className="dashboard-money-button" onClick={() => navigate("/dashboard")}>
          Open Member View
        </button>
      </section>

      <section className="admin-stat-grid">
        <AdminMetricCard label="Total members" value={adminMembers.length} note={`${activeMembers} active accounts`} icon={<Users size={18} />} accent="success" />
        <AdminMetricCard label="Wallet float" value={formatMoney(totalWalletFloat)} note={`${lowBalanceCount} low-balance accounts`} icon={<CircleDollarSign size={18} />} accent="finance" />
        <AdminMetricCard label="Completed verifications" value={completedVerifications} note={`${pendingVerifications} queued for review`} icon={<FileSearch size={18} />} accent="default" />
        <AdminMetricCard label="Verification revenue" value={formatMoney(totalRevenue)} note={`${pendingTickets} support tickets still open`} icon={<Activity size={18} />} accent="warning" />
      </section>

      <AdminSectionHeader
        eyebrow="Operations"
        title="What needs attention today"
        description="A quick pass over the queues and events that matter most before digging into the deeper admin modules."
      />

      <section className="admin-grid admin-grid--two">
        <AdminPanel eyebrow="Priority Queues" title="Operational focus" description="These queues are the fastest way to spot friction across the platform.">
          <div className="admin-list">
            {focusItems.map((item) => (
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

        <AdminPanel eyebrow="Live Activity" title="Recent platform signals" description="The latest verification and wallet events across the admin workspace.">
          <div className="admin-activity-list">
            {recentSignals.map((item) => (
              <div key={item.id} className="admin-activity-item">
                <div className="admin-list-icon">{item.icon}</div>
                <div className="activity-copy">
                  <strong>{item.title}</strong>
                  <p>{item.copy}</p>
                  <small>{item.meta}</small>
                </div>
                <div className="admin-activity-right">
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
