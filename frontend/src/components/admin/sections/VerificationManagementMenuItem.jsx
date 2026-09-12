import React from "react";
import { AlertCircle, BadgeCheck, Clock3, FileSearch } from "lucide-react";
import { formatDate, formatMoney } from "../../../lib/appUtils.js";
import { AdminMetricCard, AdminPanel, AdminSectionHeader, AdminStatusPill } from "../AdminSectionPrimitives.jsx";

export function VerificationManagementMenuItem({ verificationFeed }) {
  const completedCount = verificationFeed.filter((item) => String(item.status || "").toLowerCase().includes("completed")).length;
  const pendingCount = verificationFeed.filter((item) => {
    const status = String(item.status || "").toLowerCase();
    return status.includes("pending") || status.includes("review");
  }).length;
  const failedCount = verificationFeed.filter((item) => String(item.status || "").toLowerCase().includes("failed")).length;
  const totalCharges = verificationFeed.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const queueItems = [
    {
      id: "analyst-review",
      title: "Analyst review backlog",
      copy: `${pendingCount} verifications are sitting in review states and should be processed first.`,
      status: pendingCount ? `${pendingCount} queued` : "Clear",
      icon: <Clock3 size={16} />,
    },
    {
      id: "failed-jobs",
      title: "Failed verification jobs",
      copy: `${failedCount} requests failed and may need retries, refunds, or customer support outreach.`,
      status: failedCount ? `${failedCount} failed` : "Stable",
      icon: <AlertCircle size={16} />,
    },
    {
      id: "completed-output",
      title: "Completed output",
      copy: `${completedCount} requests have completed successfully in the current feed.`,
      status: "Healthy",
      icon: <BadgeCheck size={16} />,
    },
  ];

  return (
    <div className="admin-page-stack">
      <AdminSectionHeader
        eyebrow="Identity Ops"
        title="Verification"
        description="Monitor throughput, review queues, and delivery quality across NIN and BVN verification workflows."
      />

      <section className="admin-stat-grid">
        <AdminMetricCard label="Total requests" value={verificationFeed.length} note="Combined NIN and BVN volume" icon={<FileSearch size={18} />} accent="default" />
        <AdminMetricCard label="Completed" value={completedCount} note="Successfully processed requests" icon={<BadgeCheck size={18} />} accent="success" />
        <AdminMetricCard label="Pending review" value={pendingCount} note="Items waiting for manual attention" icon={<Clock3 size={18} />} accent="warning" />
        <AdminMetricCard label="Charge volume" value={formatMoney(totalCharges)} note={`${failedCount} failed attempts in feed`} icon={<AlertCircle size={18} />} accent="finance" />
      </section>

      <section className="admin-grid admin-grid--two">
        <AdminPanel eyebrow="Verification Ledger" title="Request activity" description="A consolidated operational view of every verification request currently visible in the admin layer.">
          <div className="table-wrap">
            <table className="txn-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Customer</th>
                  <th>Channel</th>
                  <th>Charge</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {verificationFeed.map((item) => (
                  <tr key={item.id}>
                    <td data-label="Reference">{item.reference}</td>
                    <td data-label="Customer">{item.customer}</td>
                    <td data-label="Channel">{item.channel}</td>
                    <td data-label="Charge">{formatMoney(item.amount)}</td>
                    <td data-label="Status">
                      <AdminStatusPill value={item.status} />
                    </td>
                    <td data-label="Created">{formatDate(item.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AdminPanel>

        <AdminPanel eyebrow="Queue Health" title="What the verification desk should watch" description="A lighter-weight enterprise summary for the operations team.">
          <div className="admin-list">
            {queueItems.map((item) => (
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
