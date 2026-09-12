import React, { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  Bell,
  ChevronDown,
  ChevronUp,
  Fingerprint,
  FileSearch,
  Globe2,
  History,
  LayoutGrid,
  LogOut,
  Mail,
  Menu,
  MoreHorizontal,
  PenLine,
  Settings,
  ShieldCheck,
  UserCircle,
  Wallet,
  X,
} from "lucide-react";
import { adminDashboardNavItems, getPrimaryNavItems, guestHomeNavItems } from "../../lib/appData.js";
import { LoadingInline } from "../common/CommonComponents.jsx";

function getPreferredScrollBehavior() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

function NavLink({ path, children, navigate, active, className = "", onActivate }) {
  return (
    <a
      href={path}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        if (onActivate) {
          onActivate();
          return;
        }
        navigate(path);
      }}
      aria-current={active ? "page" : undefined}
    >
      {children}
    </a>
  );
}

function NavDropdown({ item, pathname, navigate, onNavigate }) {
  const activePaths = item.activePaths || [item.path];
  const isItemActive = activePaths.includes(pathname) || (item.children || []).some((child) => (child.activePaths || [child.path]).includes(pathname));

  return (
    <div className={`header-nav-dropdown ${isItemActive ? "is-active" : ""}`}>
      <button
        type="button"
        className={`header-nav-link header-nav-link--dropdown ${isItemActive ? "active" : ""}`}
        onClick={() => (onNavigate || navigate)(item.path)}
        aria-expanded={isItemActive}
      >
        <span>{item.label}</span>
        <ChevronDown size={16} />
      </button>
      <div className="header-nav-dropdown-menu">
        {(item.children || []).map((child) => {
          const childActive = (child.activePaths || [child.path]).includes(pathname);
          return (
            <NavLink
              key={child.path}
              path={child.path}
              navigate={onNavigate || navigate}
              active={childActive}
              className={`header-nav-dropdown-link ${childActive ? "active" : ""}`}
            >
              {child.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}

function Header({
  pathname,
  navigate,
  drawerOpen,
  setDrawerOpen,
  isAuthenticated,
  isAdminAccess,
  onLogout,
  logoutLoading,
  activeAdminTab,
  onAdminTabChange,
  branding,
}) {
  const [drawerGroupOpen, setDrawerGroupOpen] = useState({});
  const [activeHomeSection, setActiveHomeSection] = useState("home");
  const menuButtonRef = useRef(null);
  const drawerRef = useRef(null);
  const visibleItems = getPrimaryNavItems(isAuthenticated, isAdminAccess);
  const isAdminDashboard = pathname === "/admin/dashboard" && isAuthenticated && isAdminAccess;
  const isAuthPage = ["/login", "/register", "/admin", "/forgot-password", "/reset-password"].includes(pathname);
  const isHomePage = pathname === "/";
  const isGuestHomeNavigation = isHomePage && !isAuthenticated;
  const primaryNavItems = isGuestHomeNavigation ? guestHomeNavItems : visibleItems;
  const logoUrl = branding?.logoUrl || "/idmeservices-logo.svg";
  const systemName = branding?.systemName || "IDM e-Services";

  const scrollToSection = (sectionId) => {
    if (sectionId === "home") {
      window.scrollTo({ top: 0, behavior: getPreferredScrollBehavior() });
      return;
    }

    const target = document.getElementById(sectionId);
    const topbarHeight = document.querySelector(".topbar")?.offsetHeight || 0;

    if (!target) return;

    const nextTop = target.getBoundingClientRect().top + window.scrollY - topbarHeight - 12;
    window.scrollTo({ top: Math.max(nextTop, 0), behavior: getPreferredScrollBehavior() });
  };

  const handleNavItemActivate = (item, closeDrawer = false) => {
    if (closeDrawer) {
      setDrawerOpen(false);
    }

    if (item.sectionId) {
      setActiveHomeSection(item.sectionId);
      scrollToSection(item.sectionId);
      return;
    }

    if (item.path) {
      navigate(item.path);
    }
  };

  useEffect(() => {
    const nextState = {};

    primaryNavItems.forEach((item) => {
      if (!item.children?.length) {
        return;
      }

      const activePaths = item.activePaths || [item.path];
      const isItemActive = activePaths.includes(pathname)
        || item.children.some((child) => (child.activePaths || [child.path]).includes(pathname));

      nextState[item.path] = isItemActive;
    });

    setDrawerGroupOpen((current) => ({ ...nextState, ...current }));
  }, [pathname, isAdminAccess, isAuthenticated, isGuestHomeNavigation]);

  useEffect(() => {
    if (!isGuestHomeNavigation) return undefined;

    let frameId = 0;
    const updateActiveSection = () => {
      const topbarHeight = document.querySelector(".topbar")?.offsetHeight || 0;
      const marker = window.scrollY + topbarHeight + window.innerHeight * 0.22;
      let nextSection = "home";

      guestHomeNavItems.forEach((item) => {
        const section = document.getElementById(item.sectionId);
        const sectionTop = section ? section.getBoundingClientRect().top + window.scrollY : null;
        if (sectionTop !== null && sectionTop <= marker) nextSection = item.sectionId;
      });

      setActiveHomeSection((current) => (current === nextSection ? current : nextSection));
    };

    const handleScroll = () => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [isGuestHomeNavigation]);

  useEffect(() => {
    if (!drawerOpen || isAuthPage) return undefined;

    const drawer = drawerRef.current;
    const previouslyFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousBodyOverflow = document.body.style.overflow;
    const focusableSelector = [
      "a[href]",
      "button:not([disabled])",
      "input:not([disabled])",
      "select:not([disabled])",
      "textarea:not([disabled])",
      '[tabindex]:not([tabindex="-1"])',
    ].join(",");

    document.body.style.overflow = "hidden";

    const focusFirstControlFrame = window.requestAnimationFrame(() => {
      const firstControl = drawer?.querySelector(focusableSelector);
      (firstControl || drawer)?.focus();
    });

    const handleDrawerKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setDrawerOpen(false);
        return;
      }

      if (event.key !== "Tab" || !drawer) return;

      const focusableElements = Array.from(drawer.querySelectorAll(focusableSelector)).filter(
        (element) => element.getClientRects().length > 0 && element.getAttribute("aria-hidden") !== "true",
      );

      if (!focusableElements.length) {
        event.preventDefault();
        drawer.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!drawer.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? lastElement : firstElement).focus();
        return;
      }

      if (event.shiftKey && (document.activeElement === firstElement || document.activeElement === drawer)) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleDrawerKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFirstControlFrame);
      document.removeEventListener("keydown", handleDrawerKeyDown);
      document.body.style.overflow = previousBodyOverflow;

      if (previouslyFocusedElement?.isConnected) {
        previouslyFocusedElement.focus();
      } else if (menuButtonRef.current?.isConnected) {
        menuButtonRef.current.focus();
      }
    };
  }, [drawerOpen, isAuthPage, setDrawerOpen]);

  return (
    <>
      <header className={`topbar ${isHomePage ? "topbar--premium-header" : ""}`}>
        <div className="topbar-inner">
          <NavLink path="/" navigate={navigate} className="brand-lockup" active={pathname === "/"}>
            <span className="brand-mark brand-mark--icon">
              <img src={logoUrl} alt={`${systemName} logo`} className="brand-logo-image" />
            </span>
            <span className="brand-copy">
              <strong>{systemName}</strong>
              <small>IDENTITY VERIFICATION</small>
            </span>
          </NavLink>

          {!isAuthenticated && !isAdminDashboard && !isAuthPage ? (
            <nav className={`header-nav ${isHomePage ? "header-nav--home" : ""}`} aria-label="Primary">
              {primaryNavItems.map((item) => {
                const activePaths = item.activePaths || [item.path];
                const isItemActive = isGuestHomeNavigation ? item.id === activeHomeSection : activePaths.includes(pathname);

                if (!isGuestHomeNavigation && item.children?.length) {
                  return <NavDropdown key={item.path} item={item} pathname={pathname} navigate={navigate} />;
                }

                return (
                  <NavLink
                    key={item.id || item.path}
                    path={item.path || `/#${item.sectionId || "home"}`}
                    navigate={navigate}
                    active={isItemActive}
                    className={`header-nav-link ${isItemActive ? "active" : ""} ${item.emphasis === "strong" ? "header-nav-link--strong" : ""}`.trim()}
                    onActivate={isGuestHomeNavigation ? () => handleNavItemActivate(item) : undefined}
                  >
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          ) : (
            <div className="header-nav header-nav--admin-spacer" aria-hidden="true" />
          )}

          {!isAuthPage ? (
            <div className="header-actions">
              {isAuthenticated ? (
                <button type="button" className="ai-btn-primary" style={{ padding: "0.55rem 1.25rem", fontSize: "0.85rem" }} onClick={() => navigate("/dashboard")}>
                  Dashboard
                </button>
              ) : (
                <div style={{ display: "flex", gap: "0.6rem" }}>
                  <NavLink path="/login" navigate={navigate} active={pathname === "/login"} className="ai-btn-secondary" style={{ padding: "0.55rem 1.1rem", fontSize: "0.85rem" }}>
                    Client Sign In
                  </NavLink>
                  <button type="button" className="ai-btn-primary hidden sm:inline-flex" style={{ padding: "0.55rem 1.2rem", fontSize: "0.85rem" }} onClick={() => navigate("/register")}>
                    Get Started
                  </button>
                </div>
              )}
            </div>
          ) : null}
          {!isAuthPage ? (
            <button
              ref={menuButtonRef}
              type="button"
              className="menu-toggle"
              aria-label={drawerOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={drawerOpen}
              aria-controls="site-navigation-drawer"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu size={24} strokeWidth={2.6} />
            </button>
          ) : null}
        </div>
      </header>

      {!isAuthPage ? <div className={`drawer-overlay ${drawerOpen ? "drawer-overlay--open" : ""}`} aria-hidden="true" onClick={() => setDrawerOpen(false)} /> : null}
      {!isAuthPage ? (
        <aside
          ref={drawerRef}
          id="site-navigation-drawer"
          className={`drawer-sheet ${drawerOpen ? "drawer-sheet--open" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="site-navigation-drawer-title"
          aria-hidden={!drawerOpen}
          inert={!drawerOpen}
          tabIndex={-1}
        >
        <div className="drawer-header">
          <button type="button" className="drawer-close" onClick={() => setDrawerOpen(false)} aria-label="Close navigation">
            <X size={20} aria-hidden="true" />
          </button>
          <div className="drawer-brand">
            <span className="brand-mark brand-mark--soft">
              <img src={logoUrl} alt={`${systemName} logo`} className="brand-logo-image" />
            </span>
            <strong id="site-navigation-drawer-title">{systemName}</strong>
          </div>
        </div>
        <nav className="drawer-links">
          {isAdminDashboard
            ? adminDashboardNavItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`drawer-action drawer-action--nav ${activeAdminTab === item.id ? "active" : ""}`}
                  onClick={() => {
                    setDrawerOpen(false);
                    onAdminTabChange(item.id);
                  }}
                >
                  {item.label}
                </button>
              ))
            : primaryNavItems.map((item) => {
                const activePaths = item.activePaths || [item.path];
                const isItemActive = isGuestHomeNavigation ? item.id === activeHomeSection : activePaths.includes(pathname);

                if (!isGuestHomeNavigation && item.children?.length) {
                  const isExpanded = Boolean(drawerGroupOpen[item.path]);

                  return (
                    <div key={item.path} className="drawer-group">
                      <button
                        type="button"
                        className={`drawer-action drawer-action--nav ${isItemActive ? "active" : ""}`}
                        aria-expanded={isExpanded}
                        onClick={() => {
                          setDrawerGroupOpen((current) => ({
                            ...current,
                            [item.path]: !current[item.path],
                          }));
                        }}
                      >
                        <span>{item.label}</span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                      <div className={`drawer-sub-links ${isExpanded ? "drawer-sub-links--open" : ""}`}>
                        {item.children.map((child) => {
                          const childActive = (child.activePaths || [child.path]).includes(pathname);
                          return (
                            <NavLink
                              key={child.path}
                              path={child.path}
                              navigate={(nextPath) => {
                                setDrawerOpen(false);
                                navigate(nextPath);
                              }}
                              active={childActive}
                              className={`drawer-sub-link ${childActive ? "active" : ""}`}
                            >
                              {child.label}
                            </NavLink>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return (
                <NavLink
                  key={item.id || item.path}
                  path={item.path || `/#${item.sectionId || "home"}`}
                  navigate={(nextPath) => {
                    setDrawerOpen(false);
                    navigate(nextPath);
                  }}
                  active={isItemActive}
                  className={`${isItemActive ? "active" : ""} ${item.emphasis === "strong" ? "drawer-link--strong" : ""}`.trim()}
                  onActivate={isGuestHomeNavigation ? () => handleNavItemActivate(item, true) : undefined}
                >
                  {item.label}
                </NavLink>
                );
              })}
          {isAuthenticated ? (
            <button
              type="button"
              className="drawer-action"
              disabled={logoutLoading}
              onClick={() => {
                setDrawerOpen(false);
                onLogout();
              }}
            >
              {logoutLoading ? <LoadingInline label="Signing out..." /> : "Logout"}
            </button>
          ) : (
            <>
              <NavLink
                path="/login"
                navigate={(nextPath) => {
                  setDrawerOpen(false);
                  navigate(nextPath);
                }}
                active={pathname === "/login"}
              >
                {isGuestHomeNavigation ? "Client Sign In" : "Login"}
              </NavLink>
              {isGuestHomeNavigation ? (
                <NavLink
                  path="/register"
                  navigate={(nextPath) => {
                    setDrawerOpen(false);
                    navigate(nextPath);
                  }}
                  active={false}
                  className="drawer-link--strong"
                >
                  Get Started
                </NavLink>
              ) : null}
            </>
          )}
        </nav>
        </aside>
      ) : null}
    </>
  );
}

function SiteFooter({ branding = {} }) {
  const year = new Date().getFullYear();
  const systemName = branding?.systemName || "IDM e-Services";
  const logoUrl = branding?.logoUrl || "/idmeservices-logo.svg";

  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div className="site-footer-brand">
          <div className="brand-lockup">
            <span className="brand-mark brand-mark--icon">
              <img src={logoUrl} alt={`${systemName} logo`} className="brand-logo-image" />
            </span>
            <span className="brand-copy">
              <strong>{systemName}</strong>
              <small>IDENTITY VERIFICATION</small>
            </span>
          </div>
          <p className="site-footer-desc">
            One clear workspace for NIN, BVN, phone checks, identity support services, wallet activity, and request history.
          </p>
        </div>

        <div className="site-footer-col">
          <h4 className="site-footer-title">Verification Services</h4>
          <ul className="site-footer-links">
            <li><a href="/select_nin_template">NIN Verification</a></li>
            <li><a href="/verify_bvn">BVN Verification</a></li>
            <li><a href="/verify_phone">Phone Number Check</a></li>
            <li><a href="/modification/nin">NIN Modification</a></li>
          </ul>
        </div>

        <div className="site-footer-col">
          <h4 className="site-footer-title">Specialized Services</h4>
          <ul className="site-footer-links">
            <li><a href="/birth-attestation">Birth Attestation</a></li>
            <li><a href="/ipe-error-50-resolution">IPE / Error 50 Resolution</a></li>
            <li><a href="/diaspora-child-birth-notification">Diaspora Child Birth</a></li>
            <li><a href="/wallet-funding">Wallet Funding</a></li>
          </ul>
        </div>

        <div className="site-footer-col">
          <h4 className="site-footer-title">Account & Access</h4>
          <ul className="site-footer-links">
            <li><a href="/login">Client Login</a></li>
            <li><a href="/register">Register Account</a></li>
            <li><a href="/admin">Admin Access</a></li>
          </ul>
        </div>
      </div>

      <div className="site-footer-bottom">
        <span>© {year} {systemName}. All rights reserved. Identity services made clearer.</span>
      </div>
    </footer>
  );
}

function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 320);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      type="button"
      className={`back-to-top-button ${visible ? "is-visible" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: getPreferredScrollBehavior() })}
      aria-label="Back to top"
      title="Back to top"
    >
      <ChevronUp size={20} strokeWidth={2.5} />
    </button>
  );
}

function getPortalPageTitle(pathname, isAdminAccess) {
  if (pathname === "/admin/dashboard") return "Admin Dashboard";
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname.includes("wallet")) return "Wallet Funding";
  if (pathname.includes("transaction")) return "Transactions";
  if (pathname.includes("bvn")) return "BVN Verification";
  if (pathname.includes("modification")) return "NIN Modification";
  if (pathname.includes("birth")) return "Birth Services";
  if (pathname.includes("verification") || pathname.includes("verify")) return "NIN Services";
  return isAdminAccess ? "Admin Workspace" : "Client Workspace";
}

function getMemberPortalItems() {
  return [
    { label: "Dashboard", path: "/dashboard", icon: <LayoutGrid size={19} />, activePaths: ["/dashboard"] },
    { label: "NIN Verification", path: "/verification", icon: <FileSearch size={19} />, activePaths: ["/verification", "/select_nin_template", "/verify"] },
    { label: "BVN Verification", path: "/verify_bvn", icon: <Fingerprint size={19} />, activePaths: ["/verify_bvn"] },
    { label: "Modification", path: "/modification/nin", icon: <PenLine size={19} />, activePaths: ["/modification", "/modification/nin"] },
    { label: "Birth Services", path: "/birth-attestation", icon: <BadgeCheck size={19} />, activePaths: ["/birth-attestation"] },
    { label: "Diaspora Child Birth Notification", path: "/diaspora-child-birth-notification", icon: <Globe2 size={19} />, activePaths: ["/diaspora-child-birth-notification"] },
    { label: "Wallet", path: "/wallet-funding", icon: <Wallet size={19} />, activePaths: ["/wallet-funding"] },
    { label: "Transactions", path: "/transactions", icon: <History size={19} />, activePaths: ["/transactions"] },
  ];
}

function PortalShell({
  children,
  pathname,
  navigate,
  isAdminAccess,
  isAdminDashboard,
  activeAdminTab,
  onAdminTabChange,
  onLogout,
  logoutLoading,
  branding,
  user,
  supportTickets = [],
  supportLoading = false,
  supportMessage = null,
  onOpenSupport = async () => {},
  onCreateSupportTicket = async () => {},
}) {
  const pageTitle = getPortalPageTitle(pathname, isAdminAccess);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [supportForm, setSupportForm] = useState({ subject: "", message: "" });
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [supportLocalMessage, setSupportLocalMessage] = useState(null);
  const logoUrl = branding?.logoUrl || "/idmeservices-logo.svg";
  const systemName = branding?.systemName || "IDM e-Services";
  const toggleSidebar = () => {
    if (window.matchMedia("(max-width: 760px)").matches) {
      setSidebarOpen((current) => !current);
      return;
    }
    setSidebarCollapsed((current) => !current);
  };
  const adminIconMap = {
    dashboard: <LayoutGrid size={19} />,
    users: <UserCircle size={19} />,
    verifications: <FileSearch size={19} />,
    wallet: <Wallet size={19} />,
    transactions: <History size={19} />,
    reports: <ShieldCheck size={19} />,
    support: <Mail size={19} />,
    settings: <Settings size={19} />,
  };
  const items = isAdminDashboard
    ? adminDashboardNavItems.map((item) => ({
        ...item,
        icon: adminIconMap[item.id] || <LayoutGrid size={19} />,
      }))
    : getMemberPortalItems();
  const memberMobileNavItems = !isAdminDashboard
    ? items.filter((item) => ["/dashboard", "/verification", "/verify_bvn", "/wallet-funding"].includes(item.path))
    : [];
  const openMessages = async () => {
    if (isAdminDashboard) {
      onAdminTabChange("support");
      return;
    }

    setSupportOpen(true);
    setSupportLocalMessage(null);
    await onOpenSupport();
  };
  const closeMessages = () => {
    if (supportSubmitting) return;
    setSupportOpen(false);
  };
  const submitSupportMessage = async (event) => {
    event.preventDefault();

    if (!supportForm.message.trim()) {
      setSupportLocalMessage({ tone: "error", text: "Type your message before sending." });
      return;
    }

    setSupportSubmitting(true);
    setSupportLocalMessage(null);
    try {
      await onCreateSupportTicket({
        subject: supportForm.subject.trim() || "Client support message",
        message: supportForm.message.trim(),
      });
      setSupportForm({ subject: "", message: "" });
      setSupportLocalMessage({ tone: "success", text: "Message sent to admin." });
    } catch (error) {
      setSupportLocalMessage({ tone: "error", text: error.message || "Unable to send your message right now." });
    } finally {
      setSupportSubmitting(false);
    }
  };

  return (
    <div className={`portal-shell ${isAdminDashboard ? "portal-shell--admin" : "portal-shell--member"} ${sidebarOpen ? "portal-shell--sidebar-open" : ""} ${sidebarCollapsed ? "portal-shell--collapsed" : ""}`}>
      <button type="button" className="portal-sidebar-scrim" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />
      <aside className="portal-sidebar">
        <button type="button" className="portal-brand" onClick={() => navigate(isAdminDashboard ? "/admin/dashboard" : "/dashboard")}>
          <span className="portal-brand-mark">
            <img src={logoUrl} alt="" />
          </span>
          <span>
            <strong>{systemName}</strong>
            <small>{isAdminDashboard ? "Admin Portal" : "Client Portal"}</small>
          </span>
        </button>

        <nav className="portal-nav" aria-label={isAdminDashboard ? "Admin navigation" : "Client navigation"}>
          {items.map((item) => {
            const active = isAdminDashboard
              ? activeAdminTab === item.id
              : (item.activePaths || [item.path]).some((path) => pathname === path || pathname.startsWith(`${path}/`));

            return (
              <button
                key={item.id || item.path}
                type="button"
                className={`portal-nav-button ${active ? "active" : ""}`}
                onClick={() => {
                  if (isAdminDashboard) {
                    onAdminTabChange(item.id);
                    setSidebarOpen(false);
                    return;
                  }
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
              >
                <span className="portal-nav-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <button type="button" className="portal-sidebar-logout" onClick={onLogout} disabled={logoutLoading}>
          {logoutLoading ? <LoadingInline label="Signing out..." /> : <><LogOut size={18} /><span>Logout</span></>}
        </button>

        <div className="portal-sidebar-note">
          <small>NIN Operations</small>
          <strong>{isAdminDashboard ? "Control Center" : "Verification Hub"}</strong>
          <span>{isAdminDashboard ? "Manage users, wallet activity, and requests." : "Start checks, fund wallet, and track records."}</span>
        </div>
      </aside>

      <section className="portal-workspace">
        <header className="portal-header">
          <div className="portal-header-title">
            <button type="button" className="portal-menu-button" aria-label="Toggle navigation" onClick={toggleSidebar}>
              <Menu size={30} strokeWidth={2.5} />
            </button>
            <h1>{pageTitle}</h1>
          </div>
          <div className="portal-header-actions">
            {isAdminAccess ? (
              <button type="button" className="portal-view-switch" onClick={() => navigate(isAdminDashboard ? "/dashboard" : "/admin/dashboard")}>
                {isAdminDashboard ? "View User Dashboard" : "View Admin"}
              </button>
            ) : null}
            <button type="button" className="portal-icon-button" aria-label="Profile" title="Profile">
              <UserCircle size={24} />
            </button>
            <button type="button" className="portal-icon-button" aria-label="Notifications" title="Notifications">
              <Bell size={21} />
            </button>
            <button
              type="button"
              className="portal-icon-button"
              aria-label="Messages"
              title="Messages"
              onClick={() => { void openMessages(); }}
            >
              <Mail size={21} />
            </button>
            <button type="button" className="portal-icon-button portal-icon-button--logout" onClick={onLogout} disabled={logoutLoading} aria-label="Logout" title="Logout">
              {logoutLoading ? <LoadingInline label="" size={16} /> : <LogOut size={20} />}
            </button>
          </div>
        </header>
        <main className="portal-content">{children}</main>
      </section>

      {!isAdminDashboard ? (
        <nav className="portal-mobile-bottom-nav" aria-label="Client quick navigation">
          {memberMobileNavItems.map((item) => {
            const active = (item.activePaths || [item.path]).some((path) => pathname === path || pathname.startsWith(`${path}/`));

            return (
              <button
                key={item.path}
                type="button"
                className={`portal-mobile-bottom-button ${active ? "active" : ""}`}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
              >
                <span className="portal-mobile-bottom-icon">{item.icon}</span>
                <span>{item.label.replace(" Verification", "")}</span>
              </button>
            );
          })}
          <button
            type="button"
            className={`portal-mobile-bottom-button portal-mobile-bottom-button--more ${sidebarOpen ? "active" : ""}`}
            onClick={() => setSidebarOpen(true)}
            aria-label="Open more navigation"
          >
            <span className="portal-mobile-bottom-icon"><MoreHorizontal size={19} /></span>
            <span>More</span>
          </button>
        </nav>
      ) : null}

      {!isAdminDashboard && supportOpen ? (
        <div className="portal-support-modal" role="dialog" aria-modal="true" aria-labelledby="portal-support-title">
          <button type="button" className="portal-support-backdrop" aria-label="Close support messages" onClick={closeMessages} />
          <section className="portal-support-dialog">
            <header className="portal-support-header">
              <div>
                <small>Support Center</small>
                <h2 id="portal-support-title">Message Admin</h2>
              </div>
              <button type="button" className="portal-support-close" onClick={closeMessages} aria-label="Close support messages">x</button>
            </header>

            <form className="portal-support-form" onSubmit={submitSupportMessage}>
              <label>
                <span>Subject</span>
                <input
                  type="text"
                  value={supportForm.subject}
                  onChange={(event) => setSupportForm((current) => ({ ...current, subject: event.target.value }))}
                  placeholder="What do you need help with?"
                  maxLength={255}
                />
              </label>
              <label>
                <span>Message</span>
                <textarea
                  value={supportForm.message}
                  onChange={(event) => setSupportForm((current) => ({ ...current, message: event.target.value }))}
                  placeholder={`Hello admin, I need help with my account${user?.name ? ` (${user.name})` : ""}.`}
                  rows={4}
                  maxLength={5000}
                />
              </label>
              {(supportLocalMessage || supportMessage) ? (
                <div className={`portal-support-message portal-support-message--${(supportLocalMessage || supportMessage).tone || "info"}`}>
                  {(supportLocalMessage || supportMessage).text}
                </div>
              ) : null}
              <button type="submit" className="portal-support-submit" disabled={supportSubmitting}>
                {supportSubmitting ? <LoadingInline label="Sending..." size={15} /> : "Send Message"}
              </button>
            </form>

            <div className="portal-support-thread">
              <div className="portal-support-thread-heading">
                <strong>Your Messages</strong>
                {supportLoading ? <LoadingInline label="Loading..." size={15} /> : null}
              </div>
              {supportTickets.length ? supportTickets.map((ticket) => (
                <article key={ticket.id} className="portal-support-ticket">
                  <div className="portal-support-ticket-top">
                    <strong>{ticket.subject}</strong>
                    <span>{ticket.status}</span>
                  </div>
                  <p>{ticket.message}</p>
                  {ticket.reply ? (
                    <div className="portal-support-reply">
                      <small>Admin reply{ticket.repliedAt ? ` - ${ticket.repliedAt}` : ""}</small>
                      <p>{ticket.reply}</p>
                    </div>
                  ) : (
                    <small className="portal-support-pending">Waiting for admin response.</small>
                  )}
                </article>
              )) : (
                <div className="portal-support-empty">No messages yet.</div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

export function AppLayout({
  children,
  pathname,
  navigate,
  drawerOpen,
  setDrawerOpen,
  footer = true,
  isAuthenticated,
  isAdminAccess,
  onLogout,
  logoutLoading = false,
  activeAdminTab = "dashboard",
  onAdminTabChange = () => {},
  branding = {},
  user = null,
  supportTickets = [],
  supportLoading = false,
  supportMessage = null,
  onOpenSupport = async () => {},
  onCreateSupportTicket = async () => {},
}) {
  const isAdminDashboard = pathname === "/admin/dashboard";
  const isAuthPage = ["/login", "/register", "/admin", "/forgot-password", "/reset-password"].includes(pathname);
  const isMemberDashboard = pathname === "/dashboard";
  const isPortalPage = Boolean(isAuthenticated && !isAuthPage && pathname !== "/");
  const mainClassName = pathname === "/"
    ? "site-main site-main--landing"
    : isAdminDashboard
      ? "site-main site-main--admin"
      : isAuthPage
        ? "site-main site-main--auth"
        : isMemberDashboard
          ? "site-main site-main--member-dashboard"
        : "site-main";
  const shellClassName = isAuthPage
    ? "app-shell app-shell--auth"
    : pathname === "/"
      ? "app-shell app-shell--landing"
      : isMemberDashboard
        ? "app-shell app-shell--member-dashboard"
        : "app-shell";

  if (isPortalPage) {
    return (
      <div className="app-shell app-shell--portal">
        <PortalShell
          pathname={pathname}
          navigate={navigate}
          isAdminAccess={isAdminAccess}
          isAdminDashboard={isAdminDashboard}
          activeAdminTab={activeAdminTab}
          onAdminTabChange={onAdminTabChange}
          branding={branding}
          user={user}
          supportTickets={supportTickets}
          supportLoading={supportLoading}
          supportMessage={supportMessage}
          onOpenSupport={onOpenSupport}
          onCreateSupportTicket={onCreateSupportTicket}
          onLogout={onLogout}
          logoutLoading={logoutLoading}
        >
          {children}
        </PortalShell>
      </div>
    );
  }

  return (
    <div className={shellClassName}>
      {pathname === "/" ? (
        <a href="#landing-content" className="sr-only z-[1200] rounded-lg bg-white px-4 py-3 font-bold text-[#0b2119] focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
          Skip to main content
        </a>
      ) : null}
      <Header
        pathname={pathname}
        navigate={navigate}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        isAuthenticated={isAuthenticated}
        isAdminAccess={isAdminAccess}
        onLogout={onLogout}
        logoutLoading={logoutLoading}
        activeAdminTab={activeAdminTab}
        onAdminTabChange={onAdminTabChange}
        branding={branding}
      />
      <main className={mainClassName}>{children}</main>
      <BackToTopButton />
      {footer ? <SiteFooter branding={branding} /> : null}
    </div>
  );
}
