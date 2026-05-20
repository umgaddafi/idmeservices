import React from "react";
import { Ban, Clock3, UserPlus, Users, Wallet } from "lucide-react";
import { formatDate, formatMoney } from "../../../lib/appUtils.js";
import { AdminMetricCard, AdminPanel, AdminSectionHeader, AdminStatusPill } from "../AdminSectionPrimitives.jsx";

export function UserManagementMenuItem({ adminMembers, loading, navigate }) {
  const activeMembers = adminMembers.filter((member) => String(member.status || "").toLowerCase() === "active").length;
  const pendingMembers = adminMembers.filter((member) => String(member.status || "").toLowerCase().includes("pending")).length;
  const suspendedMembers = adminMembers.filter((member) => String(member.status || "").toLowerCase().includes("suspended")).length;
  const zeroBalanceMembers = adminMembers.filter((member) => Number(member.walletBalance || 0) <= 0).length;
  const agentCount = adminMembers.filter((member) => String(member.plan || "").toLowerCase().includes("agent")).length;

  const watchlistItems = [
    {
      id: "pending-members",
      title: "Pending onboarding reviews",
      copy: `${pendingMembers} member profiles still need onboarding checks or activation follow-up.`,
      status: pendingMembers ? `${pendingMembers} pending` : "Clear",
      icon: <Clock3 size={16} />,
    },
    {
      id: "suspended-members",
      title: "Suspended accounts",
      copy: `${suspendedMembers} records are blocked and may require compliance or support intervention.`,
      status: suspendedMembers ? `${suspendedMembers} suspended` : "Stable",
      icon: <Ban size={16} />,
    },
    {
      id: "agent-mix",
      title: "Agent coverage",
      copy: `${agentCount} accounts currently operate with agent access inside the member base.`,
      status: `${agentCount} agents`,
      icon: <Users size={16} />,
    },
    {
      id: "zero-balance",
      title: "Dormant wallets",
      copy: `${zeroBalanceMembers} members have zero wallet balance and may need reactivation nudges.`,
      status: zeroBalanceMembers ? "Watch" : "Stable",
      icon: <Wallet size={16} />,
    },
  ];

  return (
    <div className="admin-page-stack">
      <AdminSectionHeader
        eyebrow="Member Ops"
        title="User Management"
        description="Track onboarding progress, account health, wallet readiness, and segment coverage across the member base."
        action={
          <button type="button" className="btn btn-primary" onClick={() => navigate("/register")}>
            <UserPlus size={16} />
            <span>Add Member</span>
          </button>
        }
      />

      <section className="admin-stat-grid">
        <AdminMetricCard label="Total members" value={adminMembers.length} note="Across the admin-visible member portfolio" icon={<Users size={18} />} accent="success" />
        <AdminMetricCard label="Active accounts" value={activeMembers} note="Members currently able to transact" icon={<Users size={18} />} accent="default" />
        <AdminMetricCard label="Pending review" value={pendingMembers} note="Profiles waiting for staff action" icon={<Clock3 size={18} />} accent="warning" />
        <AdminMetricCard label="Suspended" value={suspendedMembers} note={`${zeroBalanceMembers} accounts also have zero balance`} icon={<Ban size={18} />} accent="critical" />
      </section>

      <section className="admin-grid admin-grid--two">
        <AdminPanel eyebrow="Directory" title="Member roster" description="A searchable enterprise build would sit here later, but the structure is ready for that next step.">
          <div className="table-wrap">
            <table className="txn-table">
              <thead>
                <tr>
                  <th>Member ID</th>
                  <th>Name</th>
                  <th>Contact</th>
                  <th>Wallet</th>
                  <th>Status</th>
                  <th>Plan</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {(loading ? [] : adminMembers).map((member) => (
                  <tr key={member.id}>
                    <td data-label="Member ID">{member.id}</td>
                    <td data-label="Name">{member.name}</td>
                    <td data-label="Contact">
                      {member.email}
                      <br />
                      {member.phone}
                    </td>
                    <td data-label="Wallet">{formatMoney(member.walletBalance)}</td>
                    <td data-label="Status">
                      <AdminStatusPill value={member.status} />
                    </td>
                    <td data-label="Plan">{member.plan}</td>
                    <td data-label="Joined">{formatDate(member.joinedAt)}</td>
                  </tr>
                ))}
                {!loading && !adminMembers.length ? (
                  <tr>
                    <td colSpan="7">
                      <div className="empty-state">No member records are available for this admin account.</div>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Watchlist" title="Segment signals" description="These slices help an admin team decide where to spend outreach time first.">
          <div className="admin-list">
            {watchlistItems.map((item) => (
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
