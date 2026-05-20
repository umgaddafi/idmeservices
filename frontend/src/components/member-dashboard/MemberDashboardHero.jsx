import React, { useEffect, useState } from "react";
import { Eye, EyeOff, RefreshCcw, Wallet } from "lucide-react";
import { formatMoney } from "../../lib/appUtils.js";
import { getCurrencyConfig } from "../../lib/currency.js";

function getDashboardGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour < 5) {
    return "Have a nice sleep";
  }

  if (hour < 12) {
    return "Good Morning";
  }

  if (hour < 17) {
    return "Good Afternoon";
  }

  if (hour < 21) {
    return "Good Evening";
  }

  return "Good Night";
}

export function MemberDashboardHero({ navigate, onRefresh, refreshing, user }) {
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [greeting, setGreeting] = useState(() => getDashboardGreeting());
  const firstName = user?.name ? user.name.split(" ")[0] : null;
  const currencyCode = getCurrencyConfig().code;

  useEffect(() => {
    const refreshGreeting = () => setGreeting(getDashboardGreeting());
    const intervalId = window.setInterval(refreshGreeting, 60 * 1000);

    refreshGreeting();

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <section className="dashboard-hero">
      <div className="dashboard-hero-header">
        <h1>{firstName ? `${greeting}, ${firstName}` : greeting}</h1>
        <button type="button" className="dashboard-money-button" onClick={() => navigate("/wallet-funding")}>
          <Wallet size={14} />
          <span>Add Money</span>
        </button>
      </div>

      <div className="dashboard-balance-strip">
        <div className="dashboard-balance-copy">
          <small>Wallet Balance</small>
          {balanceVisible ? (
            <strong>{formatMoney(user?.walletBalance)}</strong>
          ) : (
            <strong className="wallet-balance-hidden">
              <span className="wallet-balance-hidden-prefix">{currencyCode}</span>
              <span className="wallet-balance-hidden-mask">XXXX.XX</span>
            </strong>
          )}
        </div>

        <div className="wallet-actions" aria-label="Wallet controls">
          <button
            type="button"
            className="wallet-icon-button"
            onClick={() => setBalanceVisible((current) => !current)}
            aria-label={balanceVisible ? "Hide wallet balance" : "Show wallet balance"}
            title={balanceVisible ? "Hide balance" : "Show balance"}
          >
            {balanceVisible ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>
          <button
            type="button"
            className={`wallet-icon-button ${refreshing ? "wallet-icon-button--spin" : ""}`}
            onClick={onRefresh}
            disabled={refreshing}
            aria-label="Refresh dashboard"
            title="Refresh"
          >
            <RefreshCcw size={15} />
          </button>
        </div>
      </div>
    </section>
  );
}

