import React from "react";
import { Landmark, Mail, Settings2, Wallet } from "lucide-react";
import { formatMoney } from "../../../lib/appUtils.js";
import { AdminDataPointList, AdminPanel, AdminSectionHeader, AdminMetricCard } from "../AdminSectionPrimitives.jsx";

export function SystemSettingsMenuItem({ effectiveSettings, settingsCards }) {
  return (
    <div className="admin-page-stack">
      <AdminSectionHeader
        eyebrow="Platform Controls"
        title="System Settings"
        description="Expose the most important platform configuration values in a cleaner enterprise-style settings overview."
      />

      <section className="admin-grid admin-grid--two">
        {settingsCards.map((item, index) => (
          <AdminMetricCard
            key={item.label}
            label={item.label}
            value={item.value}
            note={item.note}
            icon={
              index === 0
                ? <Settings2 size={18} />
                : index === 1
                  ? <Wallet size={18} />
                  : index === 2
                    ? <Landmark size={18} />
                    : <Mail size={18} />
            }
            accent={index === 1 ? "finance" : "default"}
          />
        ))}
      </section>

      <section className="admin-grid admin-grid--two">
        <AdminPanel eyebrow="Configuration Snapshot" title="Current values" description="A compact summary of the fallback settings currently loaded into the admin experience.">
          <AdminDataPointList
            items={[
              { label: "System Name", value: effectiveSettings.branding?.systemName || "IDM e-Services" },
              { label: "Liquidity", value: formatMoney(Number(effectiveSettings.totalPoolLiquidity || 0)) },
              { label: "Auto Debit Day", value: effectiveSettings.autoDebitDate || 1 },
              { label: "SMTP Host", value: effectiveSettings.smtp?.host || "Not configured" },
              { label: "SMTP Port", value: effectiveSettings.smtp?.port || 587 },
              { label: "From Email", value: effectiveSettings.smtp?.fromEmail || "Not configured" },
            ]}
          />
        </AdminPanel>

        <AdminPanel eyebrow="Governance" title="Change management notes" description="These are the kinds of controls that usually surround settings changes in an enterprise admin area.">
          <div className="admin-list">
            <div className="admin-list-item">
              <div className="admin-list-icon">
                <Settings2 size={16} />
              </div>
              <div>
                <strong>Settings changes should be auditable</strong>
                <p>As backend coverage expands, this section can connect to the existing audit log feed for real change history.</p>
              </div>
            </div>
            <div className="admin-list-item">
              <div className="admin-list-icon">
                <Mail size={16} />
              </div>
              <div>
                <strong>Notification safety matters</strong>
                <p>SMTP and outgoing sender configuration should be validated before any bulk notifications or workflow alerts are enabled.</p>
              </div>
            </div>
          </div>
        </AdminPanel>
      </section>
    </div>
  );
}

