import React from "react";
import { Activity, BadgeCheck, CircleDollarSign, RefreshCcw, Wallet } from "lucide-react";
import { formatDate, formatMoney } from "../../../lib/appUtils.js";
import { AdminMetricCard, AdminPanel, AdminSectionHeader, AdminStatusPill } from "../AdminSectionPrimitives.jsx";

export function TransactionHistoryMenuItem({ transactionFeed }) {
  const creditTransactions = transactionFeed.filter((item) => item.direction === "credit");
  const debitTransactions = transactionFeed.filter((item) => item.direction === "debit");
  const totalInflow = creditTransactions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalOutflow = debitTransactions.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const completedTransactions = transactionFeed.filter((item) => String(item.status || "").toLowerCase().includes("completed")).length;
  const netFlow = totalInflow - totalOutflow;

  return (
    <div className="admin-page-stack">
      <AdminSectionHeader
        eyebrow="Finance Ops"
        title="Transaction History"
        description="Review the full debit and credit ledger that powers wallet funding and verification charges."
      />

      <section className="admin-stat-grid">
        <AdminMetricCard label="Transactions" value={transactionFeed.length} note="Combined credit and debit events" icon={<Activity size={18} />} accent="default" />
        <AdminMetricCard label="Total inflow" value={formatMoney(totalInflow)} note={`${creditTransactions.length} credit events`} icon={<CircleDollarSign size={18} />} accent="finance" />
        <AdminMetricCard label="Total outflow" value={formatMoney(totalOutflow)} note={`${debitTransactions.length} debit events`} icon={<Wallet size={18} />} accent="warning" />
        <AdminMetricCard label="Net wallet flow" value={formatMoney(netFlow)} note={`${completedTransactions} completed transactions`} icon={<BadgeCheck size={18} />} accent="success" />
      </section>

      <AdminPanel eyebrow="Ledger" title="Transaction timeline" description="A finance-friendly ledger view of every transaction visible in the admin dashboard.">
        <div className="table-wrap">
          <table className="txn-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Reference</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {transactionFeed.map((item) => (
                <tr key={item.id}>
                  <td data-label="Date">{formatDate(item.date)}</td>
                  <td data-label="Type">{item.type}</td>
                  <td data-label="Reference">{item.reference}</td>
                  <td data-label="Amount" className={item.direction === "credit" ? "money-positive" : "money-negative"}>
                    {item.direction === "credit" ? "+" : "-"}
                    {formatMoney(item.amount)}
                  </td>
                  <td data-label="Status">
                    <AdminStatusPill value={item.status} />
                  </td>
                  <td data-label="Description">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminPanel>

      <AdminPanel eyebrow="Controls" title="Ledger notes" description="A few lightweight controls and checkpoints that frame how this ledger would be operated in production.">
        <div className="admin-list">
          <div className="admin-list-item">
            <div className="admin-list-icon">
              <RefreshCcw size={16} />
            </div>
            <div>
              <strong>Reconcile unmatched inflows</strong>
              <p>Investigate credits that have a bank reference but no downstream wallet balance confirmation.</p>
            </div>
            <div className="admin-ticket-meta">
              <AdminStatusPill value="Watch" />
            </div>
          </div>
          <div className="admin-list-item">
            <div className="admin-list-icon">
              <BadgeCheck size={16} />
            </div>
            <div>
              <strong>Close completed billing cycles</strong>
              <p>Use the verification debits in this ledger to validate captured revenue before downstream reporting.</p>
            </div>
            <div className="admin-ticket-meta">
              <AdminStatusPill value="Stable" />
            </div>
          </div>
        </div>
      </AdminPanel>
    </div>
  );
}
