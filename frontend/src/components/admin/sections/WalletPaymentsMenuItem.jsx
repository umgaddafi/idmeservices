import React from "react";
import { CircleDollarSign, Landmark, RefreshCcw, Wallet } from "lucide-react";
import { formatMoney } from "../../../lib/appUtils.js";
import { AdminMetricCard, AdminPanel, AdminSectionHeader, AdminStatusPill } from "../AdminSectionPrimitives.jsx";

export function WalletPaymentsMenuItem({ adminMembers, transactionFeed, navigate }) {
  const creditTransactions = transactionFeed.filter((item) => item.direction === "credit");
  const debitTransactions = transactionFeed.filter((item) => item.direction === "debit");
  const totalInflow = creditTransactions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalOutflow = debitTransactions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const pendingCredits = Math.max(2, creditTransactions.filter((item) => String(item.status || "").toLowerCase() !== "completed").length);
  const averageWalletBalance = adminMembers.length
    ? adminMembers.reduce((sum, item) => sum + Number(item.walletBalance || 0), 0) / adminMembers.length
    : 0;

  const paymentRails = [
    {
      id: "dva",
      title: "Dedicated virtual accounts",
      copy: `${adminMembers.length} member wallets are mapped to platform funding accounts.`,
      status: "Connected",
      icon: <Landmark size={16} />,
    },
    {
      id: "credits",
      title: "Pending wallet credits",
      copy: `${pendingCredits} credit events still need reconciliation or customer confirmation.`,
      status: pendingCredits > 1 ? "Watch" : "Stable",
      icon: <CircleDollarSign size={16} />,
    },
    {
      id: "webhooks",
      title: "Webhook delivery",
      copy: "Funding callbacks are processing smoothly with a seeded success rate of 98.4%.",
      status: "Stable",
      icon: <RefreshCcw size={16} />,
    },
  ];

  const reconciliationTasks = [
    {
      id: "retry-webhook",
      title: "Retry failed webhook deliveries",
      copy: "Reprocess delayed Paystack events linked to user wallet credits before end-of-day close.",
      icon: <RefreshCcw size={16} />,
      status: "Priority",
    },
    {
      id: "manual-funding",
      title: "Review manual funding adjustments",
      copy: "Confirm customer references and approve any off-cycle wallet balance corrections.",
      icon: <Wallet size={16} />,
      status: "Watch",
    },
  ];

  return (
    <div className="admin-page-stack">
      <AdminSectionHeader
        eyebrow="Treasury"
        title="Wallet & Payments"
        description="Oversee wallet liquidity, funding rails, and credit reconciliation from a finance-focused operator view."
        action={
          <button type="button" className="dashboard-money-button" onClick={() => navigate("/wallet-funding")}>
            Open Wallet Funding
          </button>
        }
      />

      <section className="admin-stat-grid">
        <AdminMetricCard label="Funding inflow" value={formatMoney(totalInflow)} note="Total credits in the current transaction feed" icon={<CircleDollarSign size={18} />} accent="finance" />
        <AdminMetricCard label="Verification outflow" value={formatMoney(totalOutflow)} note="Debits captured for wallet-backed operations" icon={<Wallet size={18} />} accent="default" />
        <AdminMetricCard label="Pending credits" value={pendingCredits} note="Seeded placeholder until live payment queue lands" icon={<RefreshCcw size={18} />} accent="warning" />
        <AdminMetricCard label="Average wallet" value={formatMoney(averageWalletBalance)} note={`${adminMembers.length} member accounts in scope`} icon={<Landmark size={18} />} accent="success" />
      </section>

      <section className="admin-grid admin-grid--two">
        <AdminPanel eyebrow="Payment Rail Health" title="Funding infrastructure" description="A high-level operating picture for treasury and payment support staff.">
          <div className="admin-list">
            {paymentRails.map((item) => (
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

        <AdminPanel eyebrow="Reconciliation" title="Finance tasks" description="The recurring workflow items an enterprise admin team usually works through every day.">
          <div className="admin-list">
            {reconciliationTasks.map((item) => (
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
