import React, { useEffect, useEffectEvent } from "react";
import { Info } from "lucide-react";
import { WELCOME_MODAL_AUTO_CLOSE_MS } from "../../lib/appData.js";

export function WelcomeNotificationModal({ open, onClose }) {
  const handleClose = useEffectEvent(() => {
    onClose();
  });

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") handleClose();
    };

    const autoCloseTimer = window.setTimeout(() => handleClose(), WELCOME_MODAL_AUTO_CLOSE_MS + 200);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.clearTimeout(autoCloseTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, handleClose]);

  if (!open) return null;

  return (
    <div className="welcome-modal-backdrop" role="presentation">
      <div
        className="welcome-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-modal-title"
        aria-describedby="welcome-modal-copy"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="welcome-modal-icon-wrap" aria-hidden="true">
          <span className="welcome-modal-icon">
            <Info size={30} strokeWidth={2.2} />
          </span>
        </div>
        <h2 id="welcome-modal-title">Compliment.</h2>
        <p className="welcome-modal-copy" id="welcome-modal-copy">
          You are highly welcome to NinOfficialcheck. Your No.1 NIN and BVN verification platform across Nigeria that verify your details securely for just
          150 and 170 respectively. Thank you for choosing NinOfficialcheck.
        </p>
        <button type="button" className="welcome-modal-button" onClick={onClose}>
          OK
        </button>
        <div className="welcome-modal-progress" aria-hidden="true">
          <span
            className="welcome-modal-progress-bar"
            style={{ "--welcome-modal-timer-duration": `${WELCOME_MODAL_AUTO_CLOSE_MS}ms` }}
            onAnimationEnd={handleClose}
          />
        </div>
      </div>
    </div>
  );
}
