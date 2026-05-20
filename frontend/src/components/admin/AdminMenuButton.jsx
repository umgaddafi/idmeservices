import React from "react";

export function AdminMenuButton({ item, active, onSelect }) {
  return (
    <button
      type="button"
      className={`admin-menu-button ${active ? "active" : ""}`}
      onClick={() => onSelect(item.id)}
      aria-pressed={active}
    >
      <span className="admin-menu-button-body">
        <span className="admin-menu-button-icon">{item.icon}</span>
        <span className="admin-menu-button-copy">
          <strong>{item.label}</strong>
          <small>{item.description}</small>
        </span>
      </span>
      {item.badge ? <span className="admin-menu-badge">{item.badge}</span> : null}
    </button>
  );
}
