import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CircleDollarSign,
  Copy,
  Download,
  FileSearch,
  Landmark,
  LayoutGrid,
  MessageSquareWarning,
  RefreshCcw,
  Settings2,
  Users,
  Wallet,
} from "lucide-react";

import { PremiumLandingPage } from "../components/landing/PremiumLandingPage.jsx";
import { apiRequest } from "../lib/api.js";
import { ADMIN_MEMBERS, ADMIN_SUPPORT_TICKETS, ADMIN_VERIFICATIONS, DUMMY_TRANSACTIONS, FRONTEND_TEST_MODE, publicApiDocs, quickServices } from "../lib/appData.js";
import { buildFallbackAdminSettings } from "../lib/appData.js";
import { formatDate, formatMoney } from "../lib/appUtils.js";
import { MessageBanner } from "../components/common/CommonComponents.jsx";
import { MemberDashboardHero } from "../components/member-dashboard/MemberDashboardHero.jsx";
import { MemberDashboardRecentActivity } from "../components/member-dashboard/MemberDashboardRecentActivity.jsx";
import { MemberDashboardServices } from "../components/member-dashboard/MemberDashboardServices.jsx";
import { WelcomeNotificationModal } from "../components/member-dashboard/WelcomeNotificationModal.jsx";

export function OrderDetailsPage({ order, loading, message }) {
  return (
    <section className="panel">
      <div className="section-banner">Order Receipt</div>
      <MessageBanner tone={message?.tone}>{message?.text}</MessageBanner>
      {loading ? (
        <div className="empty-state">Loading your order...</div>
      ) : !order ? (
        <div className="empty-state">No order details are available yet.</div>
      ) : (
        <div className="wallet-grid">
          <article className="panel">
            <h2>{order.orderNumber}</h2>
            <p className="lede">Status: {order.status}</p>
            <div className="info-strip">Payment Reference: {order.paymentReference || "N/A"}</div>
            <div className="verify-result-grid verify-result-grid--compact">
              <div className="verify-result-item"><span>Items Total</span><strong>{formatMoney(order.itemsTotal)}</strong></div>
              <div className="verify-result-item"><span>Shipping Fee</span><strong>{formatMoney(order.shippingFee)}</strong></div>
              <div className="verify-result-item"><span>Total Paid</span><strong>{formatMoney(order.totalPaid)}</strong></div>
              <div className="verify-result-item verify-result-item--full"><span>Delivery Address</span><strong>{[order.deliveryName, order.deliveryAddress, order.deliveryPhone].filter(Boolean).join(", ")}</strong></div>
            </div>
          </article>
          <article className="panel">
            <div className="section-banner">Order Items</div>
            <table className="txn-table">
              <thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
              <tbody>
                {(order.items || []).map((item, index) => (
                  <tr key={`${item.name}-${index}`}>
                    <td data-label="Item">{item.name}</td>
                    <td data-label="Qty">{item.quantity}</td>
                    <td data-label="Unit Price">{formatMoney(item.unitPrice)}</td>
                    <td data-label="Subtotal">{formatMoney(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        </div>
      )}
    </section>
  );
}

export function HomePage(props) {
  return <PremiumLandingPage {...props} />;
}

function MemberDashboardSupportTickets({ tickets = [] }) {
  const getTicketPillClassName = (value) => {
    const normalized = String(value || "").toLowerCase();

    if (normalized.includes("resolved") || normalized.includes("closed")) {
      return "pill pill-success";
    }

    if (normalized.includes("investigating") || normalized.includes("open") || normalized.includes("pending")) {
      return "pill pill-warning";
    }

    return "pill";
  };

  return (
    <section className="dashboard-panel member-services-table-panel">
      <div className="split">
        <div>
          <div className="section-banner">Support Status</div>
          <p className="lede">Track the latest admin response status for your support tickets.</p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="txn-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Channel</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length ? tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td data-label="Ticket"><strong>{ticket.subject}</strong></td>
                <td data-label="Channel">{ticket.channel || "Portal"}</td>
                <td data-label="Priority"><span className={getTicketPillClassName(ticket.priority)}>{ticket.priority || "Medium"}</span></td>
                <td data-label="Status"><span className={getTicketPillClassName(ticket.status)}>{ticket.status || "Open"}</span></td>
                <td data-label="Updated">{ticket.updatedAt ? formatDate(ticket.updatedAt) : "N/A"}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5">
                  <div className="empty-state">No support ticket is open for your account yet.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function DashboardPage({ navigate, overview, refreshing, onRefresh, welcomeModalOpen, onCloseWelcomeModal, servicePricing, services = [] }) {
  const user = overview?.user;
  const activities = overview?.recentActivity || [];
  const supportTickets = overview?.supportTickets || [];

  return (
    <section className="member-dashboard-page">
      <WelcomeNotificationModal open={welcomeModalOpen} onClose={onCloseWelcomeModal} />
      <MemberDashboardHero navigate={navigate} onRefresh={onRefresh} refreshing={refreshing} user={user} />
      <MemberDashboardServices navigate={navigate} servicePricing={servicePricing} services={services} />
      <MemberDashboardRecentActivity activities={activities} navigate={navigate} />
      <MemberDashboardSupportTickets tickets={supportTickets} />
    </section>
  );
}

export function AdminDashboardPage({ user, navigate, transactions = [], members = [], logs = [], settings, loading = false, message = null }) {
  const [activeTab, setActiveTab] = useState("overview");
  const adminMenu = [
    { id: "overview", label: "Dashboard", icon: <LayoutGrid size={18} /> },
    { id: "users", label: "Users", icon: <Users size={18} /> },
    { id: "verifications", label: "Verifications", icon: <FileSearch size={18} /> },
    { id: "wallet", label: "Wallet Funding", icon: <CircleDollarSign size={18} /> },
    { id: "transactions", label: "Transactions", icon: <Activity size={18} /> },
    { id: "reports", label: "Reports", icon: <BarChart3 size={18} /> },
    { id: "support", label: "Support", icon: <MessageSquareWarning size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings2 size={18} /> },
  ];
  const adminMembers = useMemo(() => {
    const currentMember = user ? [{ id: user.memberId || "ADM-MB-LIVE", name: user.name || "Current User", email: user.email || "user@example.com", phone: user.phone || "N/A", walletBalance: Number(user.walletBalance || 0), status: user.status || "Active", plan: user.role || "Member", joinedAt: user.joinDate || "2026-01-01" }] : [];
    const seededMembers = members.length ? members.map((member) => ({ id: member.id || member.memberId || member.email, name: member.name, email: member.email, phone: member.phone || "N/A", walletBalance: Number(member.walletBalance || 0), status: member.status || "Active", plan: member.role || "Member", joinedAt: member.joinDate || "N/A" })) : ADMIN_MEMBERS;
    return [...currentMember, ...seededMembers].filter((member, index, list) => list.findIndex((item) => item.email === member.email) === index);
  }, [members, user]);
  const transactionFeed = transactions.length ? transactions : DUMMY_TRANSACTIONS;
  const completedVerifications = ADMIN_VERIFICATIONS.filter((item) => item.status === "Completed").length;
  const auditLogs = logs.length ? logs : [];
  const pendingTickets = (auditLogs.length ? auditLogs : ADMIN_SUPPORT_TICKETS).filter((item) => {
    const status = String(item.status || "").toLowerCase();
    return status !== "closed" && status !== "verified";
  }).length;
  const activeMembers = adminMembers.filter((item) => item.status === "Active").length;
  const totalWalletFloat = adminMembers.reduce((sum, item) => sum + Number(item.walletBalance || 0), 0);
  const totalRevenue = transactionFeed.filter((item) => item.direction === "debit").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const effectiveSettings = settings || buildFallbackAdminSettings();
  const renderStatusPill = (value) => {
    const normalized = String(value || "").toLowerCase();
    const className = normalized.includes("completed") || normalized.includes("active") || normalized.includes("connected") ? "pill pill-success" : normalized.includes("pending") || normalized.includes("review") || normalized.includes("investigating") ? "pill pill-warning" : "pill";
    return <span className={className}>{value}</span>;
  };
  const supportItems = auditLogs.length ? auditLogs.map((log) => ({ id: log.id, subject: log.action, customer: log.actor, priority: log.actorRole || "Staff", status: log.status, channel: log.target })) : ADMIN_SUPPORT_TICKETS;
  const settingsCards = [
    { label: "System Name", value: effectiveSettings.branding?.systemName || "IDM e-Services", note: "Current public-facing platform name" },
    { label: "Pool Liquidity", value: formatMoney(Number(effectiveSettings.totalPoolLiquidity || 0)), note: "Configured liquidity value from system settings" },
    { label: "Auto Debit", value: effectiveSettings.isAutoDebitActive ? "Enabled" : "Disabled", note: `Scheduled for day ${effectiveSettings.autoDebitDate || 1} of each month` },
    { label: "SMTP Sender", value: effectiveSettings.smtp?.fromEmail || "Not configured", note: effectiveSettings.smtp?.fromName || "Outgoing notification sender" },
  ];
  const activeContent = {
    overview: <>
      <MessageBanner tone={message?.tone}>{message?.text}</MessageBanner>
      <section className="admin-hero"><div><span className="section-banner admin-section-chip">Admin Workspace</span><h1>Operations dashboard for identity verification, funding, and support.</h1><p>Track member growth, verification volume, wallet health, and support pressure from one professional control room.</p></div><button type="button" className="dashboard-money-button" onClick={() => navigate("/dashboard")}>Open Member View</button></section>
      <section className="admin-stat-grid"><article className="admin-stat-card"><span>Total members</span><strong>{adminMembers.length}</strong><small>{activeMembers} active accounts</small></article><article className="admin-stat-card"><span>Wallet float</span><strong>{formatMoney(totalWalletFloat)}</strong><small>Across all tracked member balances</small></article><article className="admin-stat-card"><span>Completed verifications</span><strong>{completedVerifications}</strong><small>Across NIN and BVN requests</small></article><article className="admin-stat-card"><span>Support queue</span><strong>{pendingTickets}</strong><small>Open, escalated, or investigating</small></article></section>
    </>,
    users: <section className="panel admin-card"><div className="split"><div className="section-banner">User Management</div><button type="button" className="btn btn-primary" onClick={() => navigate("/register")}>Add Member</button></div><div className="table-wrap"><table className="txn-table"><thead><tr><th>Member ID</th><th>Name</th><th>Contact</th><th>Wallet</th><th>Status</th><th>Plan</th></tr></thead><tbody>{(loading ? [] : adminMembers).map((member) => <tr key={member.id}><td data-label="Member ID">{member.id}</td><td data-label="Name">{member.name}</td><td data-label="Contact">{member.email}<br />{member.phone}</td><td data-label="Wallet">{formatMoney(member.walletBalance)}</td><td data-label="Status">{renderStatusPill(member.status)}</td><td data-label="Plan">{member.plan}</td></tr>)}{!loading && !adminMembers.length ? <tr><td colSpan="6"><div className="empty-state">No member records are available for this admin account.</div></td></tr> : null}</tbody></table></div></section>,
    verifications: <section className="panel admin-card"><div className="split"><div className="section-banner">Verification</div>{renderStatusPill("4 requests")}</div><div className="table-wrap"><table className="txn-table"><thead><tr><th>Reference</th><th>Customer</th><th>Channel</th><th>Charge</th><th>Status</th><th>Created</th></tr></thead><tbody>{ADMIN_VERIFICATIONS.map((item) => <tr key={item.id}><td data-label="Reference">{item.reference}</td><td data-label="Customer">{item.customer}</td><td data-label="Channel">{item.channel}</td><td data-label="Charge">{formatMoney(item.amount)}</td><td data-label="Status">{renderStatusPill(item.status)}</td><td data-label="Created">{formatDate(item.createdAt)}</td></tr>)}</tbody></table></div></section>,
    wallet: <section className="admin-grid admin-grid--two"><article className="panel admin-card"><div className="section-banner">Wallet Funding Health</div><div className="admin-mini-grid"><div className="admin-kpi-box"><span>Tracked wallets</span><strong>{adminMembers.length}</strong></div><div className="admin-kpi-box"><span>Pending credits</span><strong>2</strong></div><div className="admin-kpi-box"><span>Funding reviews</span><strong>Open</strong></div><div className="admin-kpi-box"><span>Funding inflow</span><strong>{formatMoney(transactionFeed.filter((item) => item.direction === "credit").reduce((sum, item) => sum + item.amount, 0))}</strong></div></div></article><article className="panel admin-card"><div className="section-banner">Reconciliation Tasks</div><div className="admin-list"><div className="admin-list-item"><div className="admin-list-icon"><RefreshCcw size={16} /></div><div><strong>Review delayed wallet updates</strong><p>Check recent credits that still need confirmation in the member ledger.</p></div></div><div className="admin-list-item"><div className="admin-list-icon"><CircleDollarSign size={16} /></div><div><strong>Review manual funding requests</strong><p>Confirm customer references before approving manual wallet adjustments.</p></div></div></div></article></section>,
    transactions: <section className="panel admin-card"><div className="split"><div className="section-banner">Transaction Ledger</div><strong>{formatMoney(totalRevenue)} total verification revenue</strong></div><div className="table-wrap"><table className="txn-table"><thead><tr><th>Date</th><th>Type</th><th>Reference</th><th>Amount</th><th>Status</th><th>Description</th></tr></thead><tbody>{transactionFeed.map((item) => <tr key={item.id}><td data-label="Date">{formatDate(item.date)}</td><td data-label="Type">{item.type}</td><td data-label="Reference">{item.reference}</td><td data-label="Amount" className={item.direction === "credit" ? "money-positive" : "money-negative"}>{item.direction === "credit" ? "+" : "-"}{formatMoney(item.amount)}</td><td data-label="Status">{renderStatusPill(item.status)}</td><td data-label="Description">{item.description}</td></tr>)}</tbody></table></div></section>,
    reports: <section className="admin-grid admin-grid--three"><article className="panel admin-card"><div className="section-banner">Revenue Snapshot</div><strong className="admin-report-value">{formatMoney(totalRevenue)}</strong><p>Verification charges captured from completed debit transactions.</p></article><article className="panel admin-card"><div className="section-banner">Verification Mix</div><strong className="admin-report-value">50% / 50%</strong><p>Current request volume is balanced between NIN and BVN channels.</p></article><article className="panel admin-card"><div className="section-banner">Support Pressure</div><strong className="admin-report-value">{pendingTickets}</strong><p>Tickets remain open across authentication, funding, and verification issues.</p></article></section>,
    support: <section className="panel admin-card"><div className="section-banner">Support and Complaints</div><div className="admin-list">{supportItems.map((ticket) => <div key={ticket.id} className="admin-ticket"><div><strong>{ticket.subject}</strong><p>{ticket.customer} - {ticket.channel}</p></div><div className="admin-ticket-meta">{renderStatusPill(ticket.priority)}{renderStatusPill(ticket.status)}</div></div>)}</div></section>,
    settings: <section className="admin-grid admin-grid--two">{settingsCards.map((item) => <article key={item.label} className="panel admin-card"><div className="section-banner">{item.label}</div><strong className="admin-report-value">{item.value}</strong><p>{item.note}</p></article>)}</section>,
  }[activeTab];
  return <section className="admin-shell"><aside className="admin-sidebar"><div className="admin-sidebar-header"><span className="section-banner admin-section-chip">Administrator</span><h2>{user?.name || "Platform Admin"}</h2><p>Oversee operations, funding activity, and verification workflows.</p></div><nav className="admin-menu" aria-label="Admin sections">{adminMenu.map((item) => <button key={item.id} type="button" className={`admin-menu-button ${activeTab === item.id ? "active" : ""}`} onClick={() => setActiveTab(item.id)}><span>{item.icon}</span><span>{item.label}</span></button>)}</nav></aside><div className="admin-content">{activeContent}</div></section>;
}

export function TransactionsPage({ transactions, branding = {} }) {
  const systemName = branding?.systemName || "IDM e-Services";
  const downloadTransaction = (transaction) => {
    const lines = [
      `${systemName} Verification Receipt`,
      `Date: ${formatDate(transaction.date)}`,
      `Type: ${transaction.type}`,
      `Reference: ${transaction.reference}`,
      `Amount: ${transaction.direction === "credit" ? "+" : "-"}${formatMoney(transaction.amount)}`,
      `Status: ${transaction.status}`,
      `Description: ${transaction.description}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${transaction.type.toLowerCase().replace(/\s+/g, "-")}-${transaction.reference}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return <section className="panel panel-wide"><div className="section-banner">Transaction History</div><div className="table-wrap"><table className="txn-table"><thead><tr><th>Date</th><th>Type</th><th>Reference</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>{transactions.length ? transactions.map((transaction) => { const isDownloadable = /verification/i.test(transaction.type) || /verification/i.test(transaction.description || ""); return <tr key={transaction.id}><td data-label="Date">{formatDate(transaction.date)}</td><td data-label="Type">{transaction.type}</td><td data-label="Reference">{transaction.reference}</td><td data-label="Amount" className={transaction.direction === "credit" ? "money-positive" : ""}>{transaction.direction === "credit" ? "+" : "-"}{formatMoney(transaction.amount)}</td><td data-label="Status"><span className={`pill ${transaction.direction === "credit" ? "pill-success" : ""}`}>{transaction.status}</span></td><td data-label="Action">{isDownloadable ? <button type="button" className="txn-download-button" onClick={() => downloadTransaction(transaction)}><Download size={14} /><span>Download</span></button> : null}</td></tr>; }) : <tr><td colSpan="6"><div className="empty-state">No transactions have been recorded yet.</div></td></tr>}</tbody></table></div></section>;
}

export function WalletFundingPage({ user, transactions, navigate, token, onUserUpdate, onRefreshPortalData, branding = {} }) {
  const initialAccounts = user?.virtualAccounts || user?.walletProfile?.accounts || [];
  const [virtualAccounts, setVirtualAccounts] = useState(initialAccounts);
  const [walletState, setWalletState] = useState({ loading: false, message: null, copied: "" });
  const deposits = transactions.filter((item) => item.direction === "credit");

  const syncWalletInBackground = useCallback(async () => {
    if (!token || FRONTEND_TEST_MODE) return;

    try {
      const [vaPayload] = await Promise.all([
        apiRequest("/wallet/virtual-accounts", { token }).catch(() => null),
        apiRequest("/wallet/reconcile-paystack", { method: "POST", token }).catch(() => null),
      ]);

      if (vaPayload?.virtualAccounts?.length) {
        setVirtualAccounts(vaPayload.virtualAccounts);
      }
      if (vaPayload?.user) {
        onUserUpdate?.(vaPayload.user);
      }
      await onRefreshPortalData?.(token).catch(() => null);
    } catch {
      // Quiet background refresh without disturbing the UI
    }
  }, [onRefreshPortalData, onUserUpdate, token]);

  useEffect(() => {
    setVirtualAccounts(initialAccounts);
  }, [user?.id, user?.virtualAccounts, user?.walletProfile?.accounts]);

  useEffect(() => {
    if (!token || FRONTEND_TEST_MODE) return undefined;

    let cancelled = false;

    // Run silent background sync immediately on load
    syncWalletInBackground();

    // Periodically sync in background every 5 seconds silently
    const intervalId = window.setInterval(() => {
      if (!cancelled) {
        syncWalletInBackground();
      }
    }, 5000);

    const onVisible = () => {
      if (document.visibilityState === "visible" && !cancelled) {
        syncWalletInBackground();
      }
    };

    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [syncWalletInBackground, token]);

  const copyText = async (value) => {
    if (!value) return;
    try {
      let copied = false;
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(value);
          copied = true;
        } catch {
          copied = false;
        }
      }

      if (!copied) {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.setAttribute("readonly", "readonly");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      setWalletState((current) => ({ ...current, copied: value }));
      syncWalletInBackground();
      window.setTimeout(() => setWalletState((current) => ({ ...current, copied: "" })), 1800);
    } catch {
      setWalletState((current) => ({ ...current, message: { tone: "error", text: "Unable to copy this account number." } }));
    }
  };

  const downloadFundingReceipt = (account) => {
    const systemName = branding?.systemName || "IDM e-Services";
    const logoUrl = branding?.logoUrl || "/idmeservices-logo.svg";
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${systemName} Funding Account</title><style>
      body{margin:0;background:#eef7f3;font-family:Inter,Arial,sans-serif;color:#10231c}
      .sheet{max-width:760px;margin:32px auto;background:white;border-radius:18px;overflow:hidden;box-shadow:0 24px 70px rgba(7,84,58,.16)}
      .head{background:linear-gradient(135deg,#063826,#08724e,#35c893);color:white;padding:28px 34px;display:flex;align-items:center;gap:18px}
      .logo{width:74px;height:74px;object-fit:contain;background:white;border-radius:16px;padding:8px}
      h1{margin:0;font-size:28px;line-height:1.15}.sub{margin:6px 0 0;color:rgba(255,255,255,.82)}
      .body{padding:32px 34px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
      .item{border:1px solid #d7ebe0;border-radius:14px;padding:16px;background:#f8fcfa}.item span{display:block;color:#60796f;font-size:12px;text-transform:uppercase;font-weight:800;margin-bottom:8px}.item strong{font-size:20px;color:#07543a}
      .number{grid-column:1/-1;background:#eefaf4;border-color:#a5ead0}.number strong{font-size:34px;letter-spacing:.08em}
      .foot{padding:20px 34px;background:#f3faf6;color:#60796f;font-size:13px;line-height:1.6}.badge{display:inline-block;padding:8px 12px;border-radius:999px;background:#dff7ea;color:#08724e;font-weight:800}
      @media print{body{background:white}.sheet{box-shadow:none;margin:0;max-width:none}}
    </style></head><body><main class="sheet"><section class="head"><img class="logo" src="${logoUrl}" alt=""><div><h1>Wallet Funding Account</h1><p class="sub">${systemName} secure payment reference</p></div></section><section class="body"><div class="grid"><div class="item number"><span>Account Number</span><strong>${account.accountNumber || "Pending"}</strong></div><div class="item"><span>Bank</span><strong>${account.bankName || account.providerSlug || "Paystack Bank"}</strong></div><div class="item"><span>Account Name</span><strong>${account.accountName || user?.name || systemName}</strong></div><div class="item"><span>Wallet Owner</span><strong>${user?.name || "Client"}</strong></div><div class="item"><span>Status</span><strong>${account.status || "pending"}</strong></div></div></section><section class="foot"><p><span class="badge">Important</span></p><p>Transfer only to this account to fund your ${systemName} wallet. Keep this receipt for your records. Generated ${new Date().toLocaleString()}.</p></section></main></body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${systemName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-funding-account.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const accountCards = virtualAccounts.filter((account) => account.accountNumber || account.status);

  return (
    <section className="wallet-funding-layout">
      <div className="panel wallet-payment-panel">
        <div className="wallet-payment-header">
          <div>
            <div className="section-banner">Your Payment Accounts</div>
            <p className="lede">Fund your wallet by transferring to your dedicated account number.</p>
          </div>
        </div>
        <MessageBanner tone={walletState.message?.tone}>{walletState.message?.text}</MessageBanner>
        <div className="account-list payment-account-list">
          {accountCards.length ? accountCards.map((account) => {
            const isReady = account.accountNumber && account.status === "active";
            return (
              <article key={account.id || account.accountNumber || account.providerSlug} className={`payment-account-card ${isReady ? "payment-account-card--ready" : "payment-account-card--pending"}`}>
                <div className="payment-account-bank-mark"><Landmark size={22} /></div>
                <div className="payment-account-main">
                  <div className="payment-account-topline">
                    <h3>{account.bankName || account.providerSlug || "Paystack Bank"}</h3>
                    <span className={`pill ${isReady ? "pill-success" : account.status === "failed" ? "pill-danger" : "pill-warning"}`}>{account.status || "pending"}</span>
                  </div>
                  <div className="payment-account-number-row">
                    <strong>{account.accountNumber || "Account pending"}</strong>
                    {account.accountNumber ? (
                      <>
                        <button type="button" className="copy-badge copy-badge--icon" onClick={() => copyText(account.accountNumber)} title="Copy account number">
                          <Copy size={15} />
                          <span>{walletState.copied === account.accountNumber ? "Copied" : "Copy"}</span>
                        </button>
                        <button type="button" className="copy-badge copy-badge--icon copy-badge--receipt" onClick={() => downloadFundingReceipt(account)} title="Download funding receipt">
                          <Download size={15} />
                          <span>Receipt</span>
                        </button>
                      </>
                    ) : null}
                  </div>
                  <p>{account.accountName || account.customerName || user?.name || `${branding?.systemName || "IDM e-Services"} wallet`}</p>
                  {account.failureReason ? <small className="payment-account-error">{account.failureReason}</small> : null}
                </div>
              </article>
            );
          }) : (
            <div className="empty-state">Your payment account is being prepared. It will appear here automatically.</div>
          )}
        </div>
        <div className="info-strip" style={{ marginTop: "1rem" }}>A 1.5% transaction fee may apply. Minimum funding amount: {formatMoney(100)}.</div>
      </div>
      <div className="panel wallet-recent-panel">
        <div className="section-banner">Recent Transactions</div>
        <div className="deposit-list">{deposits.length ? deposits.slice(0, 5).map((deposit) => <div key={deposit.id} className="deposit-item"><div><strong>Deposit</strong><p>Via {deposit.reference}</p></div><div><strong className="money-positive">+{formatMoney(deposit.amount)}</strong><p>{formatDate(deposit.date)}</p></div></div>) : <div className="empty-state">No wallet credits have been recorded yet.</div>}</div>
        <div className="split"><button type="button" className="btn btn-secondary" onClick={() => navigate("/transactions")}>View all transactions</button></div>
      </div>
    </section>
  );
}

export function ApiDocsPage() {
  return <section className="panel panel-wide"><div className="section-banner">Public API Docs</div><div className="docs-grid">{publicApiDocs.map((item) => <article key={`${item.method}-${item.path}`} className="docs-card"><span className={`pill ${item.method === "GET" ? "pill-success" : ""}`}>{item.method}</span><code>{item.path}</code><p>{item.description}</p></article>)}</div></section>;
}
