import React from "react";

function getPillClassName(value) {
  const normalized = String(value || "").toLowerCase();

  if (
    normalized.includes("completed")
    || normalized.includes("active")
    || normalized.includes("connected")
    || normalized.includes("live")
    || normalized.includes("stable")
    || normalized.includes("enabled")
    || normalized.includes("ready")
  ) {
    return "pill pill-success";
  }

  if (
    normalized.includes("pending")
    || normalized.includes("review")
    || normalized.includes("investigating")
    || normalized.includes("watch")
    || normalized.includes("medium")
  ) {
    return "pill pill-warning";
  }

  if (
    normalized.includes("failed")
    || normalized.includes("suspended")
    || normalized.includes("escalated")
    || normalized.includes("critical")
    || normalized.includes("disabled")
    || normalized.includes("high")
  ) {
    return "pill pill-danger";
  }

  return "pill";
}

export function AdminStatusPill({ value }) {
  return <span className={getPillClassName(value)}>{value}</span>;
}

export function AdminSectionHeader({ eyebrow = "Operations", title, description, action = null }) {
  return (
    <div className="admin-section-header">
      <div className="admin-section-header-copy">
        {eyebrow ? <span className="section-banner">{eyebrow}</span> : null}
        <h1 className="admin-section-title">{title}</h1>
        {description ? <p className="admin-section-text">{description}</p> : null}
      </div>
      {action ? <div className="admin-section-header-actions">{action}</div> : null}
    </div>
  );
}

export function AdminMetricCard({ label, value, note, icon = null, accent = "default" }) {
  return (
    <article className={`admin-stat-card admin-stat-card--${accent}`}>
      {icon ? <div className="admin-stat-icon">{icon}</div> : null}
      <span>{label}</span>
      <strong>{value}</strong>
      {note ? <small>{note}</small> : null}
    </article>
  );
}

export function AdminPanel({ eyebrow, title, description, action = null, className = "", children }) {
  const panelClassName = ["panel", "admin-card", className].filter(Boolean).join(" ");
  const hasHeader = eyebrow || title || description || action;

  return (
    <article className={panelClassName}>
      {hasHeader ? (
        <div className="admin-card-header">
          <div className="admin-card-header-copy">
            {eyebrow ? <div className="section-banner">{eyebrow}</div> : null}
            {title ? <h2 className="admin-card-title">{title}</h2> : null}
            {description ? <p className="admin-card-description">{description}</p> : null}
          </div>
          {action ? <div className="admin-card-header-action">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </article>
  );
}

export function AdminDataPointList({ items }) {
  return (
    <div className="admin-data-points">
      {items.map((item) => (
        <div key={item.label} className="admin-data-point">
          <span>{item.label}</span>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}
