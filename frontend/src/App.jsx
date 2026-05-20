import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_TEMPLATE_PRICING,
  TOKEN_STORAGE_KEY,
  buildBvnTemplateOptions,
  buildNinTemplateOptions,
  buildPhoneTemplateOptions,
  buildFallbackAdminSettings,
  getMappedServicePrice,
} from "./lib/appData.js";
import {
  clearDashboardWelcomeSeen,
  hasSeenDashboardWelcome,
  markDashboardWelcomeSeen,
  usePathname,
} from "./lib/appUtils.js";
import { apiRequest } from "./lib/api.js";
import { generateBvnSlipPdf } from "./lib/bvnPdf.js";
import { generateNinSlipPdf } from "./lib/ninPdf.js";
import { setCurrencyConfig } from "./lib/currency.js";
import { AppLayout } from "./components/layout/AppLayout.jsx";
import { AuthPage, ProtectedPage, ToastHost } from "./components/common/CommonComponents.jsx";
import { AdminDashboardPage } from "./pages/AdminDashboardPage.jsx";
import { ApiDocsPage, DashboardPage, HomePage, TransactionsPage, WalletFundingPage } from "./pages/MainPages.jsx";
import { ForgotPasswordPage, ResetPasswordPage } from "./pages/PasswordPages.jsx";
import {
  BirthAttestationPage,
  DiasporaChildBirthNotificationPage,
  IpeResolutionTrackingPage,
  BvnVerificationPage,
  ModificationHubPage,
  NinModificationPage,
  PhoneVerificationDetailsPage,
  PhoneVerificationTemplatePage,
  TemplatePage,
  VerificationHubPage,
  VerifyPage,
} from "./pages/VerificationPages.jsx";

const WALLET_BALANCE_AUTO_FETCH_DELAY_MS = 5000;
const KHADVERIFY_BALANCE_AUTO_FETCH_DELAY_MS = 30000;

function getBrowserPageTitle(pathname, isAdminAccess) {
  if (pathname === "/") return "Home";
  if (pathname === "/login") return "Login";
  if (pathname === "/register") return "Create Account";
  if (pathname === "/admin") return "Admin Login";
  if (pathname === "/forgot-password") return "Forgot Password";
  if (pathname === "/reset-password") return "Reset Password";
  if (pathname === "/admin/dashboard") return "Admin Dashboard";
  if (pathname === "/dashboard") return "Dashboard";
  if (pathname.includes("wallet")) return "Wallet Funding";
  if (pathname.includes("transaction")) return "Transactions";
  if (pathname.includes("bvn")) return "BVN Verification";
  if (pathname.includes("modification")) return "NIN Modification";
  if (pathname.includes("birth")) return "Birth Services";
  if (pathname.includes("verification") || pathname.includes("verify")) return "NIN Services";
  if (pathname === "/api-docs") return "API Docs";
  return isAdminAccess ? "Admin Workspace" : "Client Workspace";
}

export function App() {
  const { pathname, navigate } = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_STORAGE_KEY) || "");
  const [bootLoading, setBootLoading] = useState(Boolean(window.localStorage.getItem(TOKEN_STORAGE_KEY)));
  const [bootstrapData, setBootstrapData] = useState(null);
  const [sessionUser, setSessionUser] = useState(null);
  const [overview, setOverview] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [templatePricing, setTemplatePricing] = useState(DEFAULT_TEMPLATE_PRICING);
  const [services, setServices] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("premium");
  const [selectedPhoneTemplate, setSelectedPhoneTemplate] = useState("premium-phone");
  const [activeAdminTab, setActiveAdminTab] = useState("dashboard");
  const [authState, setAuthState] = useState({ loading: false, message: null });
  const [forgotPasswordState, setForgotPasswordState] = useState({ loading: false, message: null, lastEmail: "" });
  const [resetPasswordState, setResetPasswordState] = useState({ loading: false, message: null });
  const [profileState, setProfileState] = useState({ loading: false, message: null });
  const [insufficientFundsState, setInsufficientFundsState] = useState({
    open: false,
    balance: 0,
    amount: 0,
  });
  const [verificationResultState, setVerificationResultState] = useState({
    open: false,
    record: null,
  });
  const [bvnVerificationResultState, setBvnVerificationResultState] = useState({
    open: false,
    record: null,
  });
  const [phoneVerificationResultState, setPhoneVerificationResultState] = useState({
    open: false,
    record: null,
  });
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [toastState, setToastState] = useState({
    open: false,
    tone: "info",
    text: "",
  });
  const [adminState, setAdminState] = useState({
    loading: false,
    members: [],
    transactions: [],
    verifications: [],
    serviceRequests: [],
    supportTickets: [],
    logs: [],
    settings: buildFallbackAdminSettings(),
    message: null,
  });
  const [memberSupportState, setMemberSupportState] = useState({
    loading: false,
    tickets: [],
    message: null,
  });
  const [externalWalletState, setExternalWalletState] = useState({
    balance: null,
    currency: "USD",
    loading: false,
    fetchedAt: "",
    message: null,
  });
  const isAdminAccess = ["ADMIN", "PRESIDENT", "AUDITOR"].includes(String(sessionUser?.role || "").toUpperCase());
  const effectiveBranding = useMemo(() => {
    const adminBranding = adminState.settings?.branding || {};
    const bootstrapBranding = bootstrapData?.branding || {};

    return {
      systemName: bootstrapBranding.systemName || adminBranding.systemName || "IDM e-Services",
      logoUrl: bootstrapBranding.logoUrl || adminBranding.logoUrl || null,
      faviconUrl: bootstrapBranding.faviconUrl || adminBranding.faviconUrl || bootstrapBranding.logoUrl || adminBranding.logoUrl || null,
      homepageWallpaperUrl: bootstrapBranding.homepageWallpaperUrl || adminBranding.homepageWallpaperUrl || null,
    };
  }, [adminState.settings?.branding, bootstrapData?.branding]);
  const currentTemplateOptions = useMemo(() => buildNinTemplateOptions(templatePricing), [templatePricing]);
  const currentPhoneTemplateOptions = useMemo(() => buildPhoneTemplateOptions(templatePricing), [templatePricing]);
  const currentBvnTemplateOptions = useMemo(() => buildBvnTemplateOptions(templatePricing), [templatePricing]);
  const memberServicePricing = useMemo(
    () => ({
      verification: getMappedServicePrice(templatePricing, "verification"),
      phoneVerification: getMappedServicePrice(templatePricing, "phoneVerification"),
      bvnVerification: getMappedServicePrice(templatePricing, "bvnVerification"),
      ninModification: getMappedServicePrice(templatePricing, "ninModification"),
      birthAttestation: getMappedServicePrice(templatePricing, "birthAttestation"),
      ipeResolution: getMappedServicePrice(templatePricing, "ipeResolution"),
      diasporaBirth: getMappedServicePrice(templatePricing, "diasporaBirth"),
    }),
    [templatePricing],
  );
  const activeBvnTemplate = useMemo(
    () => currentBvnTemplateOptions.find((template) => String(template.status || "").toLowerCase() === "live")
      || currentBvnTemplateOptions[0]
      || {
        id: "premium-bvn",
        title: "Premium",
        displayTitle: "BVN Premium",
        amount: 170,
        price: "$170.00",
      },
    [currentBvnTemplateOptions],
  );

  const isAuthenticated = Boolean(token && sessionUser);

  const applyWalletBalanceSnapshot = useCallback((payload = {}) => {
    const hasBalance = payload.balance !== undefined && payload.balance !== null;
    const nextBalance = hasBalance ? Number(payload.balance || 0) : null;
    const nextUser = payload.user || null;

    setSessionUser((current) => {
      if (nextUser) {
        return nextUser;
      }

      if (!current || !hasBalance) {
        return current;
      }

      return {
        ...current,
        walletBalance: nextBalance,
      };
    });

    setOverview((current) => {
      if (!current) {
        return current;
      }

      const mergedUser = nextUser
        ? { ...(current.user || {}), ...nextUser }
        : hasBalance
          ? { ...(current.user || {}), walletBalance: nextBalance }
          : current.user;

      return {
        ...current,
        user: mergedUser,
        stats: {
          ...(current.stats || {}),
          ...(hasBalance ? { walletBalance: nextBalance } : {}),
        },
      };
    });

    return hasBalance ? nextBalance : Number(nextUser?.walletBalance || 0);
  }, []);

  const fetchWalletBalance = useCallback(async (sessionToken = token) => {
    if (!sessionToken) {
      return 0;
    }

    const payload = await apiRequest("/wallet/balance", { token: sessionToken });

    return applyWalletBalanceSnapshot(payload);
  }, [applyWalletBalanceSnapshot, token]);

  const fetchExternalWalletBalance = useCallback(async (sessionToken = token, { silent = false } = {}) => {
    if (!sessionToken) {
      return null;
    }

    if (!silent) {
      setExternalWalletState((current) => ({ ...current, loading: true, message: null }));
    }

    try {
      const payload = await apiRequest("/wallet/api-balance", { token: sessionToken });
      const nextState = {
        balance: Number(payload.balance || 0),
        currency: payload.currency || "USD",
        loading: false,
        fetchedAt: payload.fetchedAt || new Date().toISOString(),
        message: null,
      };
      setExternalWalletState(nextState);
      return nextState;
    } catch (error) {
      setExternalWalletState((current) => ({
        ...current,
        loading: false,
        message: error.message || "Unable to refresh API wallet balance right now.",
      }));
      throw error;
    }
  }, [token]);

  const showToast = (nextMessage) => {
    if (!nextMessage?.text) return;

    setToastState({
      open: true,
      tone: nextMessage.tone || "info",
      text: nextMessage.text,
    });
  };

  const seedAuthenticatedSession = (nextToken, nextUser, nextTransactions = []) => {
    clearDashboardWelcomeSeen(nextToken);
    window.localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
    setSessionUser(nextUser || null);
    setOverview(null);
    setTransactions(nextTransactions);
    setToken(nextToken);
  };

  useEffect(() => {
    if (authState.message) {
      showToast(authState.message);
    }
  }, [authState.message]);

  useEffect(() => {
    if (profileState.message) {
      showToast(profileState.message);
    }
  }, [profileState.message]);

  useEffect(() => {
    if (adminState.message) {
      showToast(adminState.message);
    }
  }, [adminState.message]);

  useEffect(() => {
    apiRequest("/bootstrap")
      .then((data) => {
        const settings = data.settings || null;
        setBootstrapData(settings);

        if (settings?.templatePricing) {
          setTemplatePricing({ ...DEFAULT_TEMPLATE_PRICING, ...settings.templatePricing });
        }
        if (settings?.currency) {
          setCurrencyConfig(settings.currency);
        }
      })
      .catch(() => setBootstrapData(null));
    apiRequest("/services")
      .then((payload) => setServices(payload.services || []))
      .catch(() => setServices([]));
  }, []);

  useEffect(() => {
    const logoUrl = effectiveBranding.faviconUrl || effectiveBranding.logoUrl;
    const systemName = effectiveBranding.systemName;
    if (systemName) {
      document.title = `${getBrowserPageTitle(pathname, isAdminAccess)} | ${systemName}`;
      const description = document.querySelector("meta[name='description']");
      if (description) {
        description.setAttribute("content", `${systemName} verification portal for NIN, BVN, wallet funding, and client activity tracking.`);
      }
    }
    if (logoUrl) {
      let icon = document.querySelector("link[rel='icon']");
      if (!icon) {
        icon = document.createElement("link");
        icon.setAttribute("rel", "icon");
        document.head.appendChild(icon);
      }
      icon.setAttribute("href", logoUrl);
    }
  }, [effectiveBranding, isAdminAccess, pathname]);

  const refreshPortalData = useCallback(async (sessionToken = token) => {
    const [mePayload, overviewPayload, transactionPayload] = await Promise.all([
      apiRequest("/auth/me", { token: sessionToken }),
      apiRequest("/portal/overview", { token: sessionToken }),
      apiRequest("/portal/transactions", { token: sessionToken }),
    ]);

    setSessionUser(mePayload.user || null);
    setOverview(overviewPayload || null);
    setTransactions(transactionPayload.transactions || []);
    return {
      user: mePayload.user || null,
      overview: overviewPayload || null,
      transactions: transactionPayload.transactions || [],
    };
  }, [token]);

  const refreshMemberSupportTickets = useCallback(async (sessionToken = token) => {
    if (!sessionToken) return [];

    setMemberSupportState((current) => ({ ...current, loading: true, message: null }));
    try {
      const payload = await apiRequest("/portal/support-tickets", { token: sessionToken });
      const tickets = payload.tickets || [];
      setMemberSupportState({ loading: false, tickets, message: null });
      return tickets;
    } catch (error) {
      setMemberSupportState((current) => ({
        ...current,
        loading: false,
        message: { tone: "error", text: error.message || "Unable to load your support messages." },
      }));
      return [];
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      setBootLoading(false);
      setSessionUser(null);
      setOverview(null);
      setTransactions([]);
      setMemberSupportState({ loading: false, tickets: [], message: null });
      return;
    }

    let active = true;

    refreshPortalData(token)
      .catch(() => {
        if (!active) return;
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken("");
        setSessionUser(null);
        setOverview(null);
        setTransactions([]);
      })
      .finally(() => {
        if (active) {
          setBootLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [refreshPortalData, token]);

  useEffect(() => {
    if (!token || !sessionUser || isAdminAccess) {
      setMemberSupportState((current) => ({ ...current, loading: false, tickets: isAdminAccess ? [] : current.tickets }));
      return;
    }

    void refreshMemberSupportTickets(token);
  }, [isAdminAccess, refreshMemberSupportTickets, sessionUser, token]);

  useEffect(() => {
    if (bootLoading || !token || !sessionUser || pathname !== "/admin/dashboard") {
      return undefined;
    }

    let cancelled = false;

    const loadBalance = async (silent = false) => {
      try {
        await fetchExternalWalletBalance(token, { silent });
      } catch {
        // Keep polling failures non-blocking; the card message handles visibility.
      }
    };

    void loadBalance(false);

    const intervalId = window.setInterval(() => {
      if (!cancelled) {
        void loadBalance(true);
      }
    }, KHADVERIFY_BALANCE_AUTO_FETCH_DELAY_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [bootLoading, fetchExternalWalletBalance, pathname, sessionUser, token]);

  useEffect(() => {
    const protectedRoutes = [
      "/dashboard",
      "/verification",
      "/modification",
      "/modification/nin",
      "/birth-attestation",
      "/diaspora-child-birth-notification",
      "/ipe-error-50-resolution",
      "/verify",
      "/verify_bvn",
      "/verify_phone",
      "/verify_phone_details",
      "/transactions",
      "/wallet-funding",
      "/select_nin_template",
      "/admin/dashboard",
    ];
    const requiresAuth = protectedRoutes.includes(pathname);

    if (!bootLoading && !isAuthenticated && requiresAuth) {
      navigate(pathname.startsWith("/admin/") ? "/admin" : "/login");
    }
  }, [bootLoading, isAuthenticated, navigate, pathname]);

  useEffect(() => {
    if (!bootLoading && pathname === "/admin/dashboard" && !isAdminAccess) {
      navigate("/dashboard");
    }
  }, [bootLoading, isAdminAccess, navigate, pathname]);

  useEffect(() => {
    if (pathname !== "/dashboard") {
      setWelcomeModalOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (bootLoading || pathname !== "/dashboard" || !token || !sessionUser) {
      return;
    }

    if (hasSeenDashboardWelcome(token)) {
      return;
    }

    markDashboardWelcomeSeen(token);
    setWelcomeModalOpen(true);
  }, [bootLoading, pathname, sessionUser, token]);

  useEffect(() => {
    if (bootLoading || !token || !sessionUser) {
      return undefined;
    }

    if (isAdminAccess && pathname.startsWith("/admin")) {
      return undefined;
    }

    let cancelled = false;
    let timeoutId = 0;

    const scheduleFetch = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(async () => {
        if (cancelled) return;

        try {
          await fetchWalletBalance(token);
        } catch {
          // Keep the auto-refresh quiet; manual refresh still reports errors.
        } finally {
          if (!cancelled) {
            scheduleFetch();
          }
        }
      }, WALLET_BALANCE_AUTO_FETCH_DELAY_MS);
    };

    scheduleFetch();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [bootLoading, fetchWalletBalance, isAdminAccess, pathname, sessionUser?.id, token]);

  const handleRegister = async (form) => {
    setAuthState({ loading: true, message: null });

    if (form.password !== form.confirmPassword) {
      setAuthState({ loading: false, message: { tone: "error", text: "Password and confirm password must match." } });
      return;
    }

    try {
      await apiRequest("/register", {
        method: "POST",
        body: form,
      });

      const loginPayload = await apiRequest("/auth/login", {
        method: "POST",
        body: {
          email: form.email,
          password: form.password,
        },
      });

      seedAuthenticatedSession(loginPayload.token, loginPayload.user, []);
      const hasPaymentAccount = (loginPayload.user?.virtualAccounts || loginPayload.user?.walletProfile?.accounts || [])
        .some((account) => account.accountNumber && account.status === "active");
      setAuthState({
        loading: false,
        message: {
          tone: "success",
          text: hasPaymentAccount
            ? "Account created successfully. Your payment account is ready."
            : "Account created successfully. Your payment account is being prepared.",
        },
      });
      navigate("/dashboard");
    } catch (error) {
      setAuthState({ loading: false, message: { tone: "error", text: error.message } });
    }
  };

  const handleLogin = async (form) => {
    setAuthState({ loading: true, message: null });

    try {
      const loginPayload = await apiRequest("/auth/login", {
        method: "POST",
        body: {
          email: form.email,
          password: form.password,
        },
      });

      seedAuthenticatedSession(loginPayload.token, loginPayload.user, []);
      if (pathname === "/admin") {
        setActiveAdminTab("dashboard");
      }
      setAuthState({ loading: false, message: { tone: "success", text: "Login successful." } });
      const nextRole = String(loginPayload.user?.role || "").toUpperCase();
      navigate(nextRole === "ADMIN" ? "/admin/dashboard" : "/dashboard");
    } catch (error) {
      setAuthState({ loading: false, message: { tone: "error", text: error.message } });
    }
  };

  const refreshServices = async () => {
    const payload = await apiRequest("/services");
    setServices(payload.services || []);
    return payload.services || [];
  };

  const handleAdminServiceSave = async ({ id, form }) => {
    if (!token) return;

    const body = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") return;
      body.append(key, typeof value === "boolean" ? (value ? "1" : "0") : value);
    });

    const payload = await apiRequest(id ? `/admin/services/${id}` : "/admin/services", {
      method: "POST",
      token,
      body,
    });

    await refreshServices();
    setAdminState((current) => ({
      ...current,
      message: { tone: "success", text: id ? "Service updated successfully." : "Service created successfully." },
    }));
    return payload.service;
  };

  const handleAdminServiceDelete = async (id) => {
    if (!token || !id) return;

    await apiRequest(`/admin/services/${id}`, {
      method: "DELETE",
      token,
    });

    await refreshServices();
    setAdminState((current) => ({
      ...current,
      message: { tone: "success", text: "Service deleted successfully." },
    }));
  };

  const handleForgotPassword = async ({ email }) => {
    const normalizedEmail = String(email || "").trim().toLowerCase();

    setForgotPasswordState({ loading: true, message: null, lastEmail: normalizedEmail });

    if (!normalizedEmail) {
      setForgotPasswordState({
        loading: false,
        message: { tone: "error", text: "Please enter the email address linked to your account." },
        lastEmail: "",
      });
      return;
    }

    try {
      const payload = await apiRequest("/auth/forgot-password", {
        method: "POST",
        body: {
          email: normalizedEmail,
        },
      });

      setForgotPasswordState({
        loading: false,
        lastEmail: normalizedEmail,
        message: {
          tone: "success",
          text: payload.message || "If an account exists for that email address, reset instructions have been sent.",
        },
      });
    } catch (error) {
      setForgotPasswordState({
        loading: false,
        lastEmail: normalizedEmail,
        message: {
          tone: "error",
          text: error.message,
        },
      });
    }
  };

  const handleResetPassword = async (form, setForm) => {
    const normalizedEmail = String(form.email || "").trim().toLowerCase();
    const tokenValue = String(form.token || "").trim();

    setResetPasswordState({ loading: true, message: null });

    if (!normalizedEmail) {
      setResetPasswordState({
        loading: false,
        message: { tone: "error", text: "Please enter the email address for the account you want to recover." },
      });
      return;
    }

    if (!tokenValue) {
      setResetPasswordState({
        loading: false,
        message: { tone: "error", text: "Please enter the reset token you received." },
      });
      return;
    }

    if (String(form.password || "").length < 8) {
      setResetPasswordState({
        loading: false,
        message: { tone: "error", text: "Your new password must be at least 8 characters long." },
      });
      return;
    }

    if (form.password !== form.confirmPassword) {
      setResetPasswordState({
        loading: false,
        message: { tone: "error", text: "New password and confirm password must match." },
      });
      return;
    }

    try {
      const payload = await apiRequest("/auth/reset-password", {
        method: "POST",
        body: {
          email: normalizedEmail,
          token: tokenValue,
          password: form.password,
          password_confirmation: form.confirmPassword,
        },
      });

      setResetPasswordState({
        loading: false,
        message: {
          tone: "success",
          text: payload.message || "Password reset successful. You can now sign in with your new password.",
        },
      });
    } catch (error) {
      setResetPasswordState({
        loading: false,
        message: {
          tone: "error",
          text: error.message,
        },
      });
      return;
    }

    setForm((current) => ({
      ...current,
      token: "",
      password: "",
      confirmPassword: "",
    }));
  };

  const handleLogout = async () => {
    if (logoutLoading) return;

    setLogoutLoading(true);
    const currentToken = token;

    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    clearDashboardWelcomeSeen(currentToken);
    setToken("");
    setSessionUser(null);
    setOverview(null);
    setTransactions([]);
    setWelcomeModalOpen(false);
    setAuthState({ loading: false, message: null });
    setProfileState({ loading: false, message: null });
    navigate(isAdminAccess ? "/admin" : "/login");

    if (currentToken) {
      try {
        await apiRequest("/auth/logout", { method: "POST", token: currentToken });
      } catch {
        // Local logout is enough if the backend token is already invalid.
      } finally {
        setLogoutLoading(false);
      }
      return;
    }

    setLogoutLoading(false);
  };

  const handleRefresh = async () => {
    if (!token || refreshing) return;
    setRefreshing(true);

    try {
      await refreshPortalData(token);
      if (pathname === "/admin/dashboard") {
        await fetchExternalWalletBalance(token);
      }
      showToast({ tone: "success", text: "Dashboard refreshed successfully." });
    } catch (error) {
      showToast({
        tone: "error",
        text: error.message || "Unable to refresh dashboard right now.",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpdateTemplatePricing = async ({ service, id, amount }) => {
    const normalizedAmount = Math.max(0, Number(amount || 0));
    const nextTemplatePricing = {
      ...templatePricing,
      [service]: (templatePricing[service] || []).map((item) => (
        item.id === id ? { ...item, amount: normalizedAmount } : item
      )),
    };

    try {
      const payload = await apiRequest("/settings", {
        method: "PUT",
        token,
        body: {
          templatePricing: nextTemplatePricing,
        },
      });

      const savedTemplatePricing = payload.settings?.templatePricing || nextTemplatePricing;
      setTemplatePricing({ ...DEFAULT_TEMPLATE_PRICING, ...savedTemplatePricing });
      setAdminState((current) => ({
        ...current,
        settings: payload.settings || current.settings,
        message: { tone: "success", text: "Pricing saved successfully." },
      }));
    } catch (error) {
      setAdminState((current) => ({
        ...current,
        message: { tone: "error", text: error.message || "Unable to save pricing right now." },
      }));
      throw error;
    }
  };

  const handleUpdateSettings = async (form) => {
    const body = form instanceof FormData ? form : form;
    try {
      const payload = await apiRequest("/settings", {
        method: form instanceof FormData ? "POST" : "PUT",
        token,
        body,
      });

      setAdminState((current) => ({
        ...current,
        settings: payload.settings || current.settings,
        message: { tone: "success", text: "System settings saved successfully." },
      }));
      setBootstrapData(payload.settings || bootstrapData);
      if (payload.settings?.currency) {
        setCurrencyConfig(payload.settings.currency);
      }
      if (payload.settings?.templatePricing) {
        setTemplatePricing({ ...DEFAULT_TEMPLATE_PRICING, ...payload.settings.templatePricing });
      }
      return payload.settings;
    } catch (error) {
      setAdminState((current) => ({
        ...current,
        message: { tone: "error", text: error.message || "Unable to save system settings." },
      }));
      throw error;
    }
  };

  const handleUpdateSupportTicket = async (id, status, reply = "", options = {}) => {
    const payload = await apiRequest(`/admin/support-tickets/${id}`, {
      method: "PATCH",
      token,
      body: { status, reply, sendEmail: Boolean(options.sendEmail) },
    });
    setAdminState((current) => ({
      ...current,
      supportTickets: (current.supportTickets || []).map((ticket) => (
        String(ticket.id) === String(id) ? payload.ticket : ticket
      )),
      message: {
        tone: "success",
        text: reply
          ? options.sendEmail
            ? "Support reply saved in-system and sent by email."
            : "Support reply saved in-system for the user."
          : "Support ticket updated.",
      },
    }));
  };

  const handleCreateMemberSupportTicket = async ({ subject, message }) => {
    const payload = await apiRequest("/portal/support-tickets", {
      method: "POST",
      token,
      body: {
        subject: subject || "Client support message",
        message,
        channel: "Client Portal",
      },
    });

    setMemberSupportState((current) => ({
      loading: false,
      tickets: [payload.ticket, ...(current.tickets || [])],
      message: { tone: "success", text: payload.message || "Your message has been sent to admin." },
    }));

    return payload.ticket;
  };

  const handleProfileSave = async (form) => {
    setProfileState({ loading: true, message: null });

    try {
      const payload = await apiRequest("/auth/profile", {
        method: "PATCH",
        token,
        body: form,
      });

      setSessionUser(payload.user);
      await handleRefresh();
      setProfileState({ loading: false, message: { tone: "success", text: "Verification profile updated." } });
    } catch (error) {
      setProfileState({ loading: false, message: { tone: "error", text: error.message } });
    }
  };

  const handleAdminMemberUpdate = async (memberId, changes) => {
    const normalizedMemberId = String(memberId || "");
    const payloadBody = {
      name: changes.name,
      phone: changes.phone,
      role: changes.role,
      status: changes.status,
    };

    const payload = await apiRequest(`/members/${normalizedMemberId}`, {
      method: "PUT",
      token,
      body: payloadBody,
    });

    const updatedMember = payload.member;

    setAdminState((current) => ({
      ...current,
      members: (current.members || []).map((member) => (
        String(member.id) === String(updatedMember.id) ? updatedMember : member
      )),
      message: { tone: "success", text: `${updatedMember.name} updated successfully.` },
    }));

    if (String(sessionUser?.id || "") === String(updatedMember.id)) {
      setSessionUser(updatedMember);
      setOverview((current) => current ? { ...current, user: updatedMember } : current);
    }

    return updatedMember;
  };

  const handleAdminMemberDelete = async (member) => {
    const normalizedMemberId = String(member?.id || "");

    if (normalizedMemberId === String(sessionUser?.id || "")) {
      throw new Error("You cannot delete the currently signed-in admin account.");
    }

    await apiRequest(`/members/${normalizedMemberId}`, {
      method: "DELETE",
      token,
    });

    setAdminState((current) => ({
      ...current,
      members: (current.members || []).filter((item) => String(item.id) !== normalizedMemberId),
      message: { tone: "success", text: `${member.name} deleted successfully.` },
    }));

    return true;
  };

  const handleAdminServiceRequestStatusUpdate = async (requestId, status) => {
    const payload = await apiRequest(`/admin/service-requests/${requestId}`, {
      method: "PATCH",
      token,
      body: { status },
    });

    setAdminState((current) => ({
      ...current,
      serviceRequests: (current.serviceRequests || []).map((item) => (
        String(item.id) === String(requestId) ? payload.request : item
      )),
      message: { tone: "success", text: `Service request marked as ${status}.` },
    }));

    return payload.request;
  };

  const handleAdminWalletReconcile = async () => {
    if (!token) return null;

    const payload = await apiRequest("/admin/wallet/reconcile-paystack", {
      method: "POST",
      token,
    });

    const [membersPayload, transactionsPayload] = await Promise.all([
      apiRequest("/members", { token }),
      apiRequest("/admin/transactions?limit=50", { token }),
    ]);

    setAdminState((current) => ({
      ...current,
      members: membersPayload.members || current.members,
      transactions: transactionsPayload.transactions || current.transactions,
      message: {
        tone: payload.summary?.credited > 0 ? "success" : "info",
        text: payload.message || "Wallet reconciliation completed.",
      },
    }));

    return payload;
  };

  const handleAdminPaystackReferenceLookup = async (reference) => {
    if (!token) return null;

    const payload = await apiRequest("/admin/wallet/reconcile-paystack/reference", {
      method: "POST",
      token,
      body: { reference },
    });

    const [membersPayload, transactionsPayload] = await Promise.all([
      apiRequest("/members", { token }),
      apiRequest("/admin/transactions?limit=50", { token }),
    ]);

    setAdminState((current) => ({
      ...current,
      members: membersPayload.members || current.members,
      transactions: transactionsPayload.transactions || current.transactions,
      message: {
        tone: payload.result?.credited ? "success" : "info",
        text: payload.message || "Paystack payment lookup completed.",
      },
    }));

    return payload;
  };

  useEffect(() => {
    if (!token || !sessionUser || pathname !== "/admin/dashboard" || !isAdminAccess) {
      return;
    }

    let active = true;
    setAdminState((current) => ({ ...current, loading: true, message: null }));

    Promise.allSettled([
      apiRequest("/members", { token }),
      apiRequest("/audit-logs?limit=25", { token }),
      apiRequest("/settings", { token }),
      apiRequest("/admin/transactions?limit=50", { token }),
      apiRequest("/admin/verifications?limit=50", { token }),
      apiRequest("/admin/service-requests?limit=100", { token }),
      apiRequest("/admin/support-tickets?limit=50", { token }),
    ])
      .then((results) => {
        if (!active) return;

        const [membersResult, logsResult, settingsResult, transactionsResult, verificationsResult, serviceRequestsResult, ticketsResult] = results;
        const failedSections = [
          ["members", membersResult],
          ["audit logs", logsResult],
          ["settings", settingsResult],
          ["transactions", transactionsResult],
          ["verifications", verificationsResult],
          ["service requests", serviceRequestsResult],
          ["support tickets", ticketsResult],
        ].filter(([, result]) => result.status === "rejected");
        const nextMessage = failedSections.length
          ? {
              tone: "warning",
              text: `Some admin data could not load from the server: ${failedSections.map(([label]) => label).join(", ")}. Check the API response or server log for those endpoint(s).`,
            }
          : null;

        setAdminState((current) => ({
          loading: false,
          members: membersResult.status === "fulfilled" ? membersResult.value.members || [] : current.members,
          transactions: transactionsResult.status === "fulfilled" ? transactionsResult.value.transactions || [] : current.transactions,
          verifications: verificationsResult.status === "fulfilled" ? verificationsResult.value.verifications || [] : current.verifications,
          serviceRequests: serviceRequestsResult.status === "fulfilled" ? serviceRequestsResult.value.requests || [] : current.serviceRequests,
          supportTickets: ticketsResult.status === "fulfilled" ? ticketsResult.value.tickets || [] : current.supportTickets,
          logs: logsResult.status === "fulfilled" ? logsResult.value.logs || [] : current.logs,
          settings: settingsResult.status === "fulfilled" ? settingsResult.value.settings || current.settings : current.settings,
          message: nextMessage,
        }));

        if (settingsResult.status === "fulfilled" && settingsResult.value.settings?.templatePricing) {
          setTemplatePricing({ ...DEFAULT_TEMPLATE_PRICING, ...settingsResult.value.settings.templatePricing });
        }
      })
      .catch((error) => {
        if (!active) return;
        setAdminState({
          loading: false,
          members: [],
          transactions: [],
          verifications: [],
          serviceRequests: [],
          supportTickets: [],
          logs: [],
          settings: buildFallbackAdminSettings(),
          message: { tone: "error", text: error.message || "Unable to load admin data right now." },
        });
      });

    return () => {
      active = false;
    };
  }, [isAdminAccess, pathname, sessionUser, token]);

  const handleNinVerification = async ({ nin }) => {
    const digits = String(nin || "").replace(/\D/g, "");
    const activeTemplate = currentTemplateOptions.find((template) => template.id === selectedTemplate) || currentTemplateOptions[0];
    if (!sessionUser) {
      setProfileState({ loading: false, message: { tone: "error", text: "Please login to continue." } });
      return;
    }
    let balance = Number(sessionUser.walletBalance || 0);

    setProfileState({ loading: true, message: null });

    if (digits.length !== 11) {
      setProfileState({ loading: false, message: { tone: "error", text: "Please enter a valid 11-digit NIN number." } });
      return;
    }

    try {
      balance = await fetchWalletBalance(token);
    } catch (error) {
      setProfileState({
        loading: false,
        message: { tone: "error", text: error.message || "Unable to fetch your latest wallet balance from the database." },
      });
      return;
    }

    if (balance < activeTemplate.amount) {
      setInsufficientFundsState({
        open: true,
        balance,
        amount: activeTemplate.amount,
      });
      setProfileState({
        loading: false,
        message: { tone: "error", text: "Verification failed because your wallet balance is below the template price." },
      });
      return;
    }

    try {
      const payload = await apiRequest("/verify/nin", {
        method: "POST",
        token,
        body: {
          nin: digits,
          consent: true,
        },
      });

      await refreshPortalData(token);

      setVerificationResultState({
        open: true,
        record: payload.record,
      });
      setProfileState({
        loading: false,
        message: { tone: "success", text: "Matching NIN details are ready. Review the modal and click download to generate the selected template." },
      });
    } catch (error) {
      setVerificationResultState({ open: false, record: null });
      setProfileState({
        loading: false,
        message: { tone: "error", text: error.message || "Unable to verify this NIN right now." },
      });
    }
  };

  const handleVerificationDownload = async () => {
    const activeTemplate = currentTemplateOptions.find((template) => template.id === selectedTemplate) || currentTemplateOptions[0];
    const record = verificationResultState.record;

    if (!record) return;

    setProfileState({ loading: true, message: null });

    try {
      await generateNinSlipPdf({
        template: activeTemplate,
        record,
      });
      setVerificationResultState({ open: false, record: null });
      setProfileState({
        loading: false,
        message: {
          tone: "success",
          text: `${activeTemplate.title} verification slip downloaded successfully.`,
        },
      });
    } catch (error) {
      setProfileState({
        loading: false,
        message: { tone: "error", text: error.message || "Unable to generate the NIN verification slip right now." },
      });
    }
  };

  const handleBvnVerification = async ({ bvn }) => {
    const digits = String(bvn || "").replace(/\D/g, "");
    if (!sessionUser) {
      setProfileState({ loading: false, message: { tone: "error", text: "Please login to continue." } });
      return;
    }
    let balance = Number(sessionUser.walletBalance || 0);

    setProfileState({ loading: true, message: null });

    if (digits.length !== 11) {
      setProfileState({ loading: false, message: { tone: "error", text: "Please enter a valid 11-digit BVN number." } });
      return;
    }

    try {
      balance = await fetchWalletBalance(token);
    } catch (error) {
      setProfileState({
        loading: false,
        message: { tone: "error", text: error.message || "Unable to fetch your latest wallet balance from the database." },
      });
      return;
    }

    if (balance < activeBvnTemplate.amount) {
      setInsufficientFundsState({
        open: true,
        balance,
        amount: activeBvnTemplate.amount,
      });
      setProfileState({
        loading: false,
        message: { tone: "error", text: "Verification failed because your wallet balance is below the BVN price." },
      });
      return;
    }

    try {
      const payload = await apiRequest("/verify/bvn", {
        method: "POST",
        token,
        body: {
          bvn: digits,
          consent: true,
        },
      });

      await refreshPortalData(token);

      setBvnVerificationResultState({
        open: true,
        record: payload.record,
      });
      setProfileState({
        loading: false,
        message: {
          tone: "success",
          text: "Matching BVN details are ready. Review the modal and click download to generate the verification slip.",
        },
      });
    } catch (error) {
      setBvnVerificationResultState({ open: false, record: null });
      setProfileState({
        loading: false,
        message: { tone: "error", text: error.message || "Unable to verify this BVN right now." },
      });
    }
  };

  const handleBvnVerificationDownload = async () => {
    const record = bvnVerificationResultState.record;

    if (!record) return;

    setProfileState({ loading: true, message: null });

    try {
      await generateBvnSlipPdf({
        template: activeBvnTemplate,
        record,
      });
      setBvnVerificationResultState({ open: false, record: null });
      setProfileState({
        loading: false,
        message: {
          tone: "success",
          text: `${activeBvnTemplate.displayTitle || activeBvnTemplate.title} slip downloaded successfully.`,
        },
      });
    } catch (error) {
      setProfileState({
        loading: false,
        message: { tone: "error", text: error.message || "Unable to generate the BVN verification slip right now." },
      });
    }
  };

  const handlePhoneVerification = async ({ phone }) => {
    const digits = String(phone || "").replace(/\D/g, "");
    const activeTemplate = currentPhoneTemplateOptions.find((template) => template.id === selectedPhoneTemplate)
      || currentPhoneTemplateOptions[0]
      || { amount: 0 };
    if (!sessionUser) {
      setProfileState({ loading: false, message: { tone: "error", text: "Please login to continue." } });
      return;
    }
    let balance = Number(sessionUser.walletBalance || 0);

    setProfileState({ loading: true, message: null });

    if (digits.length < 10 || digits.length > 15) {
      setProfileState({ loading: false, message: { tone: "error", text: "Please enter a valid phone number." } });
      return;
    }

    try {
      balance = await fetchWalletBalance(token);
    } catch (error) {
      setProfileState({
        loading: false,
        message: { tone: "error", text: error.message || "Unable to fetch your latest wallet balance from the database." },
      });
      return;
    }

    if (balance < activeTemplate.amount) {
      setInsufficientFundsState({
        open: true,
        balance,
        amount: activeTemplate.amount,
      });
      setProfileState({
        loading: false,
        message: { tone: "error", text: "Verification failed because your wallet balance is below the phone verification price." },
      });
      return;
    }

    try {
      const payload = await apiRequest("/verify/phone", {
        method: "POST",
        token,
        body: {
          phone: digits,
          consent: true,
        },
      });

      await refreshPortalData(token);

      setPhoneVerificationResultState({
        open: true,
        record: payload.record,
      });
      setProfileState({
        loading: false,
        message: {
          tone: "success",
          text: "Matching phone details are ready. Review the modal for the fetched result.",
        },
      });
    } catch (error) {
      setPhoneVerificationResultState({ open: false, record: null });
      setProfileState({
        loading: false,
        message: { tone: "error", text: error.message || "Unable to verify this phone number right now." },
      });
    }
  };

  const page = useMemo(() => {
    switch (pathname) {
      case "/login":
        return (
          <AuthPage
            mode="login"
            eyebrow="Access"
            title="Login"
            // description="Access wallet funding, verification and more"
            submitLabel="Login"
            submitting={authState.loading}
            message={null}
            onSubmit={handleLogin}
            navigate={navigate}
            branding={effectiveBranding}
            passwordHelp={
              <a
                href="/forgot-password"
                onClick={(event) => {
                  event.preventDefault();
                  navigate("/forgot-password");
                }}
              >
                Forgot password?
              </a>
            }
            secondary={
              <a
                href="/register"
                onClick={(event) => {
                  event.preventDefault();
                  navigate("/register");
                }}
              >
                Don't have account? <span className="auth-link-underline">Register here</span>
              </a>
            }
          />
        );
      case "/forgot-password":
        return (
          <ForgotPasswordPage
            submitting={forgotPasswordState.loading}
            message={forgotPasswordState.message}
            onSubmit={handleForgotPassword}
            navigate={navigate}
          />
        );
      case "/reset-password":
        return (
          <ResetPasswordPage
            submitting={resetPasswordState.loading}
            message={resetPasswordState.message}
            onSubmit={handleResetPassword}
            navigate={navigate}
          />
        );
      case "/admin":
        return (
          <AuthPage
            mode="login"
            eyebrow="Admin Access"
            title="Login"
            submitLabel="Login"
            submitting={authState.loading}
            message={authState.message}
            onSubmit={handleLogin}
            navigate={navigate}
            branding={effectiveBranding}
            secondary={
              <a
                href="/login"
                onClick={(event) => {
                  event.preventDefault();
                  navigate("/login");
                }}
              >
                Client account? <span className="auth-link-underline">Login here</span>
              </a>
            }
          />
        );
      case "/register":
        return (
          <AuthPage
            mode="register"
            eyebrow="Create Account"
            title="Create Account"
            // description="Create your account and initialize your wallet profile automatically."
            submitLabel="Create Account"
            submitting={authState.loading}
            message={null}
            onSubmit={handleRegister}
            navigate={navigate}
            branding={effectiveBranding}
            secondary={
              <a
                href="/login"
                onClick={(event) => {
                  event.preventDefault();
                  navigate("/login");
                }}
              >
                Already have an account? <span className="auth-link-underline">Login</span>
              </a>
            }
          />
        );
      case "/dashboard":
        return (
          <ProtectedPage isAuthenticated={isAuthenticated} loading={bootLoading}>
            <DashboardPage
              navigate={navigate}
              overview={overview}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              welcomeModalOpen={welcomeModalOpen}
              onCloseWelcomeModal={() => setWelcomeModalOpen(false)}
              servicePricing={memberServicePricing}
              services={services}
            />
          </ProtectedPage>
        );
      case "/admin/dashboard":
        return (
          <ProtectedPage isAuthenticated={isAuthenticated} loading={bootLoading}>
            <AdminDashboardPage
              user={sessionUser}
              navigate={navigate}
              transactions={adminState.transactions}
              members={adminState.members}
              verifications={adminState.verifications}
              serviceRequests={adminState.serviceRequests}
              supportTickets={adminState.supportTickets}
              logs={adminState.logs}
              settings={{ ...adminState.settings, branding: effectiveBranding }}
              loading={adminState.loading}
              message={adminState.message}
              activeTab={activeAdminTab}
              onChangeActiveTab={setActiveAdminTab}
              templatePricing={templatePricing}
              onUpdateTemplatePricing={handleUpdateTemplatePricing}
              onUpdateMember={handleAdminMemberUpdate}
              onDeleteMember={handleAdminMemberDelete}
              onUpdateServiceRequestStatus={handleAdminServiceRequestStatusUpdate}
              services={services}
              onSaveService={handleAdminServiceSave}
              onDeleteService={handleAdminServiceDelete}
              onUpdateSettings={handleUpdateSettings}
              onUpdateSupportTicket={handleUpdateSupportTicket}
              onReconcileWallets={handleAdminWalletReconcile}
              onLookupPaystackReference={handleAdminPaystackReferenceLookup}
              externalWalletState={externalWalletState}
            />
          </ProtectedPage>
        );
      case "/select_nin_template":
        return (
          <ProtectedPage isAuthenticated={isAuthenticated} loading={bootLoading}>
            <TemplatePage
              navigate={navigate}
              selectedTemplate={selectedTemplate}
              onSelectTemplate={setSelectedTemplate}
              user={sessionUser}
              templateOptions={currentTemplateOptions}
            />
          </ProtectedPage>
        );
      case "/verification":
        return (
          <ProtectedPage isAuthenticated={isAuthenticated} loading={bootLoading}>
            <VerificationHubPage navigate={navigate} servicePricing={memberServicePricing} />
          </ProtectedPage>
        );
      case "/modification":
        return (
          <ProtectedPage isAuthenticated={isAuthenticated} loading={bootLoading}>
            <ModificationHubPage navigate={navigate} servicePricing={memberServicePricing} />
          </ProtectedPage>
        );
      case "/modification/nin":
        return (
          <ProtectedPage isAuthenticated={isAuthenticated} loading={bootLoading}>
            <NinModificationPage navigate={navigate} user={sessionUser} templatePricing={templatePricing} token={token} onRefreshPortalData={() => refreshPortalData(token).catch(() => {})} />
          </ProtectedPage>
        );
      case "/birth-attestation":
        return (
          <ProtectedPage isAuthenticated={isAuthenticated} loading={bootLoading}>
            <BirthAttestationPage navigate={navigate} user={sessionUser} templatePricing={templatePricing} token={token} onRefreshPortalData={() => refreshPortalData(token).catch(() => {})} />
          </ProtectedPage>
        );
      case "/diaspora-child-birth-notification":
        return (
          <ProtectedPage isAuthenticated={isAuthenticated} loading={bootLoading}>
            <DiasporaChildBirthNotificationPage navigate={navigate} user={sessionUser} templatePricing={templatePricing} token={token} onRefreshPortalData={() => refreshPortalData(token).catch(() => {})} />
          </ProtectedPage>
        );
      case "/ipe-error-50-resolution":
        return (
          <ProtectedPage isAuthenticated={isAuthenticated} loading={bootLoading}>
            <IpeResolutionTrackingPage navigate={navigate} user={sessionUser} templatePricing={templatePricing} token={token} onRefreshPortalData={() => refreshPortalData(token).catch(() => {})} />
          </ProtectedPage>
        );
      case "/verify":
        return (
          <ProtectedPage isAuthenticated={isAuthenticated} loading={bootLoading}>
            <VerifyPage
              user={sessionUser}
              selectedTemplate={selectedTemplate}
              templateOptions={currentTemplateOptions}
              onVerifyNin={handleNinVerification}
              saving={profileState.loading}
              message={null}
              insufficientFunds={insufficientFundsState}
              onCloseInsufficientFunds={() => setInsufficientFundsState((current) => ({ ...current, open: false }))}
              onAddMoney={() => setProfileState({ loading: false, message: null })}
              navigate={navigate}
              verificationResult={verificationResultState}
              onCloseVerificationResult={() => setVerificationResultState({ open: false, record: null })}
              onDownloadVerificationResult={handleVerificationDownload}
            />
          </ProtectedPage>
        );
      case "/verify_bvn":
        return (
          <ProtectedPage isAuthenticated={isAuthenticated} loading={bootLoading}>
            <BvnVerificationPage
              user={sessionUser}
              activeTemplate={activeBvnTemplate}
              onVerifyBvn={handleBvnVerification}
              saving={profileState.loading}
              message={null}
              insufficientFunds={insufficientFundsState}
              onCloseInsufficientFunds={() => setInsufficientFundsState((current) => ({ ...current, open: false }))}
              onAddMoney={() => setProfileState({ loading: false, message: null })}
              navigate={navigate}
              verificationResult={bvnVerificationResultState}
              onCloseVerificationResult={() => setBvnVerificationResultState({ open: false, record: null })}
              onDownloadVerificationResult={handleBvnVerificationDownload}
            />
          </ProtectedPage>
        );
      case "/verify_phone":
        return (
          <ProtectedPage isAuthenticated={isAuthenticated} loading={bootLoading}>
            <PhoneVerificationTemplatePage
              navigate={navigate}
              selectedPhoneTemplate={selectedPhoneTemplate}
              onSelectPhoneTemplate={setSelectedPhoneTemplate}
              user={sessionUser}
              phoneTemplateOptions={currentPhoneTemplateOptions}
            />
          </ProtectedPage>
        );
      case "/verify_phone_details":
        return (
          <ProtectedPage isAuthenticated={isAuthenticated} loading={bootLoading}>
            <PhoneVerificationDetailsPage
              user={sessionUser}
              selectedPhoneTemplate={selectedPhoneTemplate}
              phoneTemplateOptions={currentPhoneTemplateOptions}
              onVerifyPhone={handlePhoneVerification}
              saving={profileState.loading}
              message={null}
              insufficientFunds={insufficientFundsState}
              onCloseInsufficientFunds={() => setInsufficientFundsState((current) => ({ ...current, open: false }))}
              onAddMoney={() => setProfileState({ loading: false, message: null })}
              navigate={navigate}
              verificationResult={phoneVerificationResultState}
              onCloseVerificationResult={() => setPhoneVerificationResultState({ open: false, record: null })}
            />
          </ProtectedPage>
        );
      case "/transactions":
        return (
          <ProtectedPage isAuthenticated={isAuthenticated} loading={bootLoading}>
            <TransactionsPage transactions={transactions} branding={effectiveBranding} />
          </ProtectedPage>
        );
      case "/wallet-funding":
        return (
          <ProtectedPage isAuthenticated={isAuthenticated} loading={bootLoading}>
            <WalletFundingPage user={sessionUser} transactions={transactions} navigate={navigate} token={token} onUserUpdate={setSessionUser} onRefreshPortalData={refreshPortalData} branding={effectiveBranding} />
          </ProtectedPage>
        );
      case "/api-docs":
        return <ApiDocsPage branding={effectiveBranding} />;
      case "/":
      default:
        return <HomePage navigate={navigate} isAuthenticated={isAuthenticated} services={services} branding={effectiveBranding} />;
    }
  }, [
    authState.loading,
    authState.message,
    adminState.loading,
    adminState.logs,
    adminState.members,
    adminState.message,
    adminState.serviceRequests,
    adminState.settings,
    adminState.supportTickets,
    adminState.transactions,
    adminState.verifications,
    activeBvnTemplate,
    activeAdminTab,
    bootLoading,
    bvnVerificationResultState,
    currentBvnTemplateOptions,
    currentPhoneTemplateOptions,
    currentTemplateOptions,
    handleAdminMemberDelete,
    handleAdminMemberUpdate,
    handleAdminWalletReconcile,
    handleAdminPaystackReferenceLookup,
    forgotPasswordState.loading,
    forgotPasswordState.message,
    handleBvnVerification,
    handleBvnVerificationDownload,
    handleForgotPassword,
    handleLogin,
    handleNinVerification,
    handlePhoneVerification,
    handleProfileSave,
    handleRegister,
    handleResetPassword,
    handleAdminServiceDelete,
    handleAdminServiceSave,
    handleUpdateSettings,
    handleUpdateSupportTicket,
    handleCreateMemberSupportTicket,
    insufficientFundsState,
    isAdminAccess,
    isAuthenticated,
    navigate,
    overview,
    pathname,
    profileState.loading,
    profileState.message,
    phoneVerificationResultState,
    refreshPortalData,
    refreshing,
    resetPasswordState.loading,
    resetPasswordState.message,
    sessionUser,
    templatePricing,
    transactions,
    verificationResultState,
    welcomeModalOpen,
    selectedTemplate,
    selectedPhoneTemplate,
    handleVerificationDownload,
    effectiveBranding,
    services,
    memberSupportState,
  ]);

  return (
    <AppLayout
      pathname={pathname}
      navigate={navigate}
      drawerOpen={drawerOpen}
      setDrawerOpen={setDrawerOpen}
      footer={true}
      isAuthenticated={isAuthenticated}
      isAdminAccess={isAdminAccess}
      onLogout={handleLogout}
      logoutLoading={logoutLoading}
      activeAdminTab={activeAdminTab}
      onAdminTabChange={setActiveAdminTab}
      branding={effectiveBranding}
      user={sessionUser}
      supportTickets={memberSupportState.tickets}
      supportLoading={memberSupportState.loading}
      supportMessage={memberSupportState.message}
      onOpenSupport={refreshMemberSupportTickets}
      onCreateSupportTicket={handleCreateMemberSupportTicket}
    >
      {/* {bootstrapData?.branding?.systemName ? (
        <div className="brand-banner">
          Active system: <strong>{bootstrapData.branding.systemName}</strong>
        </div>
      ) : null} */}
      {page}
      <ToastHost toast={toastState} onClose={() => setToastState((current) => ({ ...current, open: false }))} />
    </AppLayout>
  );
}

