import React from "react";
import { Landmark } from "lucide-react";
import { formatDate, formatMoney } from "../../lib/appUtils.js";

export function MemberDashboardRecentActivity({ activities, navigate }) {
  return (
    <section className="dashboard-panel dashboard-panel--activity">
      <div className="section-title split">
        <span>Recent Activity</span>
        <a
          href="/transactions"
          className="view-link"
          onClick={(event) => {
            event.preventDefault();
            navigate("/transactions");
          }}
        >
          View All
        </a>
      </div>

      <div className="dashboard-activity-list">
        {activities.length ? (
          activities.map((activity) => (
            <div key={activity.id} className="dashboard-activity-item">
              <div className="dashboard-activity-left">
                <span className="dashboard-activity-badge">
                  <Landmark size={14} />
                </span>
                <div className="activity-copy">
                  <strong>{activity.type}</strong>
                  <small>Ref: {activity.reference}</small>
                  <div className="dashboard-activity-meta">
                    <span className={activity.direction === "credit" ? "money-positive" : "money-negative"}>
                      {activity.direction === "credit" ? "+" : "-"}
                      {formatMoney(activity.amount)}
                    </span>
                    <small>{formatDate(activity.date)}</small>
                  </div>
                </div>
              </div>

              <div className="activity-right">
                <span className={`pill ${activity.direction === "credit" ? "pill-success" : "pill-warning"}`}>{activity.status}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">No client activity yet. Add wallet funding or complete a verification to see the first activity.</div>
        )}
      </div>
    </section>
  );
}
