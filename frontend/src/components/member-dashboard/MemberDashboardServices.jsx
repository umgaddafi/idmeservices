import React from "react";
import {
  ArrowRight,
  FilePenLine,
  TriangleAlert,
} from "lucide-react";

const serviceGroups = [
  {
    title: "Verification",
    copy: "Run your NIN and phone verification checks from one organized service hub.",
    tone: "verification",
    imageIcon: "/assets/dashboard/nimc-card-icon.png",
    imageAlt: "NIMC icon",
    path: "/verification",
    priceKey: "verification",
  },
  {
    title: "NIN Modification",
    copy: "Open the NIN modification form for name, phone number, and date of birth update requests.",
    tone: "modification",
    icon: FilePenLine,
    path: "/modification/nin",
    priceKey: "ninModification",
  },
  {
    title: "BVN Verification",
    copy: "Validate Bank Verification Number details from its own dedicated service card.",
    tone: "bvn",
    imageIcon: "/assets/dashboard/bvn-card-icon.png",
    imageAlt: "BVN icon",
    path: "/verify_bvn",
    priceKey: "bvnVerification",
  },
  {
    title: "Birth Attestation",
    copy: "Open permanent and temporary birth attestation requests from one guided form page.",
    tone: "attestation",
    imageIcon: "/assets/dashboard/attestion.png",
    imageAlt: "Birth attestation icon",
    path: "/birth-attestation",
    priceKey: "birthAttestation",
  },
  {
    title: "IPE / Error 50 / Resolution",
    copy: "Submit a tracking ID to begin IPE, Error 50, or general resolution processing.",
    tone: "resolution",
    icon: TriangleAlert,
    path: "/ipe-error-50-resolution",
    priceKey: "ipeResolution",
  },
  {
    title: "Diaspora Child Birth Notification",
    copy: "Open the diaspora child birth notification form for parent-linked child identity requests.",
    tone: "diaspora",
    imageIcon: "/assets/dashboard/diaspora_child.png",
    imageAlt: "Diaspora child birth notification icon",
    path: "/diaspora-child-birth-notification",
    priceKey: "diasporaBirth",
  },
];

export function MemberDashboardServices({ navigate, servicePricing = {} }) {
  return (
    <section className="dashboard-services-shell" aria-label="Client services">
      <div className="dashboard-service-grid">
        {serviceGroups.map((group) => {
          const GroupIcon = group.icon;
          const isActive = Boolean(group.path);
          const priceLabel = servicePricing[group.priceKey]?.price;

          return (
            <article
              key={group.title}
              className={[
                "service-dashboard-card",
                isActive ? "service-dashboard-card--interactive" : "",
              ].filter(Boolean).join(" ")}
              role={isActive ? "button" : undefined}
              tabIndex={isActive ? 0 : undefined}
              onClick={isActive ? () => navigate(group.path) : undefined}
              onKeyDown={isActive ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate(group.path);
                }
              } : undefined}
            >
              <div className="service-dashboard-card-main">
                <span className={[
                  "service-dashboard-icon",
                  `service-dashboard-icon--${group.tone}`,
                  group.imageIcon ? "service-dashboard-icon--has-image" : "",
                ].filter(Boolean).join(" ")}>
                  {group.imageIcon ? (
                    <img className="service-dashboard-image-icon" src={group.imageIcon} alt={group.imageAlt || ""} />
                  ) : (
                    <GroupIcon size={20} />
                  )}
                </span>
                <h3 className="service-dashboard-title">{group.title}</h3>
                <p className="service-dashboard-copy">
                  {group.copy}
                  {/* {priceLabel ? ` Starting from ${priceLabel}.` : ""} */}
                </p>
              </div>
              <button
                type="button"
                className="service-dashboard-proceed-button"
                onClick={isActive ? (event) => {
                  event.stopPropagation();
                  navigate(group.path);
                } : undefined}
                disabled={!isActive}
              >
                <span>Proceed</span>
                <ArrowRight size={14} />
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
