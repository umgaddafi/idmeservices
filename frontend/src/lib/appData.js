import { formatCurrency } from "./currency.js";

export const DEFAULT_API_BASE_PATH = (import.meta.env.VITE_API_BASE_PATH || "/api").replace(/\/$/, "");
export const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "").trim()
  ? String(import.meta.env.VITE_API_BASE_URL || "").trim().replace(/\/$/, "")
  : DEFAULT_API_BASE_PATH;

export const TOKEN_STORAGE_KEY = "ninverify_api_token";
export const DASHBOARD_WELCOME_SEEN_KEY = "ninverify_dashboard_welcome_seen";
export const WELCOME_MODAL_AUTO_CLOSE_MS = 8000;
export const FRONTEND_TEST_MODE = String(import.meta.env.VITE_FRONTEND_TEST_MODE || "").toLowerCase() === "true";
export const USE_DUMMY_BVN_VERIFICATION = false;
export const DUMMY_MEMBER_LOGIN_EMAIL = "um@gmail.com";
export const DUMMY_MEMBER_LOGIN_PASSWORD = "12345678";
export const DUMMY_ADMIN_LOGIN_EMAIL = "admin@idmeservices.com.ng";
export const DUMMY_ADMIN_LOGIN_PASSWORD = "admin12345";
export const DUMMY_PASSPORT_IMAGE = "/assets/general.jpeg";

export const DUMMY_BOOTSTRAP = {
  branding: {
    systemName: "IDM e-Services",
  },
};

export const DUMMY_USER = {
  id: "demo-user",
  name: "Gaddafi",
  email: DUMMY_MEMBER_LOGIN_EMAIL,
  phone: "09042340091",
  nin: "12345678901",
  bvn: "12345678901",
  role: "MEMBER",
  memberId: "MB-1000",
  totalSavings: 4800,
  walletBalance: 49000,
  joinDate: "2025-12-19",
  status: "Active",
  walletProfile: {
    label: "Primary Wallet",
    reference: "NINV-MB-1000",
    note: "Use this wallet reference when requesting a manual balance update.",
    accounts: [
      {
        id: "demo-wema",
        provider: "paystack",
        status: "active",
        accountName: "IDM e-Services GADDAFI",
        accountNumber: "0123456789",
        bankName: "Wema Bank",
        providerSlug: "wema-bank",
        currency: "USD",
        active: true,
        assigned: true,
      },
    ],
  },
  virtualAccounts: [
    {
      id: "demo-wema",
      provider: "paystack",
      status: "active",
      accountName: "IDM e-Services GADDAFI",
      accountNumber: "0123456789",
      bankName: "Wema Bank",
      providerSlug: "wema-bank",
      currency: "USD",
      active: true,
      assigned: true,
    },
  ],
};

export const DUMMY_ADMIN_USER = {
  id: "demo-admin-user",
  name: "Admin Officer",
  email: DUMMY_ADMIN_LOGIN_EMAIL,
  phone: "08000000000",
  nin: "",
  bvn: "",
  role: "ADMIN",
  memberId: "ADM-0001",
  totalSavings: 0,
  walletBalance: 125000,
  joinDate: "2026-01-02",
  status: "Active",
  walletProfile: {
    label: "Admin Wallet",
    reference: "NINV-ADM-0001",
    note: "Use this wallet reference when logging internal treasury adjustments.",
    accounts: [],
  },
  virtualAccounts: [],
};

export const DUMMY_TRANSACTIONS = [
  {
    id: "deposit-1",
    date: "2025-12-23T14:36:00+01:00",
    type: "Wallet Deposit",
    reference: "62220724837",
    amount: 150,
    direction: "credit",
    status: "Completed",
    description: "Manual wallet funding approved by admin",
  },
  {
    id: "debit-1",
    date: "2025-12-23T14:36:00+01:00",
    type: "Wallet Debit",
    reference: "NIN-0001",
    amount: 150,
    direction: "debit",
    status: "Completed",
    description: "NIN verification charge",
  },
  {
    id: "debit-2",
    date: "2025-12-22T12:32:00+01:00",
    type: "Wallet Debit",
    reference: "62220724837",
    amount: 150,
    direction: "debit",
    status: "Completed",
    description: "NIN verification charge",
  },
  {
    id: "debit-3",
    date: "2025-12-22T12:30:00+01:00",
    type: "Wallet Debit",
    reference: "52540148917",
    amount: 150,
    direction: "debit",
    status: "Completed",
    description: "BVN verification charge",
  },
];

export function createDummyOverview(user = DUMMY_USER, transactions = DUMMY_TRANSACTIONS) {
  return {
    user,
    stats: {
      walletBalance: user.walletBalance,
      totalSavings: user.totalSavings,
      depositCount: transactions.filter((item) => item.direction === "credit").length,
      contributionCount: 0,
      loanCount: 0,
    },
    recentActivity: transactions.slice(0, 4),
  };
}

export const navItems = [
  { path: "/", label: "Home", public: true },
  { path: "/dashboard", label: "Dashboard" },
  {
    path: "/verification",
    label: "Verification",
    activePaths: ["/verification", "/select_nin_template", "/verify", "/verify_phone", "/verify_phone_details", "/verify_bvn"],
    children: [
      { path: "/select_nin_template", label: "NIN", activePaths: ["/select_nin_template", "/verify"] },
      { path: "/verify_bvn", label: "BVN", activePaths: ["/verify_bvn"] },
    ],
  },
  { path: "/modification", label: "Modification", activePaths: ["/modification", "/modification/nin"] },
  { path: "/birth-attestation", label: "Birth Attestation", activePaths: ["/birth-attestation"] },
  { path: "/ipe-error-50-resolution", label: "IPE/Error Resolution", activePaths: ["/ipe-error-50-resolution"] },
  { path: "/diaspora-child-birth-notification", label: "Diaspora Child Birth Notification", activePaths: ["/diaspora-child-birth-notification"] },
  { path: "/transactions", label: "Transaction", activePaths: ["/transactions"] },
];

export const guestHomeNavItems = [
  { id: "home", label: "Home", sectionId: "home" },
  { id: "services", label: "Our Services", sectionId: "services" },
  { id: "testimonies", label: "Testimonies", sectionId: "testimonies" },
  { id: "contact", label: "Contact", sectionId: "contact" },
  { id: "login", label: "Login", path: "/login" },
  { id: "register", label: "Register", path: "/register", emphasis: "strong" },
];

export const adminDashboardNavItems = [
  { id: "dashboard", label: "Dashboard", description: "Quick overview" },
  { id: "users", label: "Users", description: "Members and accounts" },
  { id: "verifications", label: "Verification", description: "Requests and outcomes" },
  { id: "ninModifications", label: "NIN Modification", description: "Name, phone, and DOB changes" },
  { id: "birthAttestations", label: "Birth Attestation", description: "Permanent and temporary requests" },
  { id: "diasporaBirth", label: "Diaspora Birth", description: "Child birth notifications" },
  { id: "resolutions", label: "IPE / Error 50", description: "Tracking ID resolution" },
  { id: "wallet", label: "Payments", description: "Funding and liquidity" },
  { id: "transactions", label: "Transactions", description: "Ledger" },
  { id: "templates", label: "Pricing", description: "Service and template charges" },
  { id: "reports", label: "Reports", description: "KPIs and summary" },
  { id: "support", label: "Support Center", description: "Customer issues" },
  { id: "admins", label: "Roles", description: "Access control" },
  { id: "settings", label: "System Settings", description: "Configuration" },
];

export const templateOptions = [
  {
    id: "premium",
    title: "Premium Template",
    price: formatCurrency(150),
    amount: 150,
    image: "/assets/premium.png",
    pdfBaseImage: "/assets/nin_premium.png",
    alt: "Premium digital NIN slip template",
    bullets: ["High-quality design with QR code", "Front & back side simulation", "Professional layout", "Instant download"],
  },
  {
    id: "regular",
    title: "Regular Template",
    price: formatCurrency(150),
    amount: 150,
    image: "/assets/regular.png",
    pdfBaseImage: "/assets/nin_regular.png",
    alt: "Regular NIN slip template",
    bullets: ["Standard verification slip", "Essential information display", "Clean and simple design", "Quick processing"],
  },
];

export const phoneTemplateOptions = [
  { id: "premium-phone", title: "Premium", price: formatCurrency(200), image: "/assets/premium.png", alt: "Premium phone verification template" },
  { id: "regular-phone", title: "Regular", price: formatCurrency(200), image: "/assets/regular.png", alt: "Regular phone verification template" },
  { id: "standard-phone", title: "Standard", price: formatCurrency(200), image: "/assets/standard.png", alt: "Standard phone verification template" },
];

export const DEFAULT_TEMPLATE_PRICING = {
  nin: [
    { id: "premium", title: "Premium Template", amount: 150, status: "Live" },
    { id: "regular", title: "Regular Template", amount: 150, status: "Ready" },
  ],
  phone: [
    { id: "premium-phone", title: "Premium", amount: 200, status: "Live" },
    { id: "regular-phone", title: "Regular", amount: 200, status: "Ready" },
    { id: "standard-phone", title: "Standard", amount: 200, status: "Ready" },
  ],
  bvn: [
    { id: "premium-bvn", title: "Premium", amount: 170, status: "Live" },
    { id: "regular-bvn", title: "Regular", amount: 170, status: "Ready" },
  ],
  modification: [
    { id: "dob-modification", title: "DOB Modification", amount: 43000, status: "Live" },
    { id: "phone-modification", title: "Phone Number Modification", amount: 8000, status: "Live" },
    { id: "address-modification", title: "Address Modification", amount: 8000, status: "Live" },
    { id: "name-modification", title: "Name Modification", amount: 8000, status: "Live" },
  ],
  birthAttestation: [
    { id: "permanent-attestation", title: "Permanent Birth Attestation", amount: 1500, status: "Live" },
    { id: "temporary-attestation", title: "Temporary Birth Attestation", amount: 1000, status: "Live" },
  ],
  diaspora: [
    { id: "diaspora-child-birth", title: "Diaspora Child Birth Notification", amount: 2000, status: "Live" },
  ],
  resolutions: [
    { id: "ipe-error-50", title: "IPE / Error 50 / Resolution", amount: 1000, status: "Live" },
  ],
  others: [
    { id: "express-other", title: "Express Verification", amount: 250, status: "Ready" },
    { id: "default-other", title: "Default Verification", amount: 180, status: "Ready" },
  ],
};

export const SERVICE_PRICE_LOOKUP = {
  verification: { service: "nin", id: "premium" },
  phoneVerification: { service: "phone", id: "premium-phone" },
  bvnVerification: { service: "bvn", id: "premium-bvn" },
  ninModification: { service: "modification", id: "name-modification" },
  birthAttestation: { service: "birthAttestation", id: "permanent-attestation" },
  ipeResolution: { service: "resolutions", id: "ipe-error-50" },
  diasporaBirth: { service: "diaspora", id: "diaspora-child-birth" },
  ninModificationName: { service: "modification", id: "name-modification" },
  ninModificationPhone: { service: "modification", id: "phone-modification" },
  ninModificationDob: { service: "modification", id: "dob-modification" },
  ninModificationAddress: { service: "modification", id: "address-modification" },
  birthAttestationPermanent: { service: "birthAttestation", id: "permanent-attestation" },
  birthAttestationTemporary: { service: "birthAttestation", id: "temporary-attestation" },
  diasporaChildBirth: { service: "diaspora", id: "diaspora-child-birth" },
  resolutionTracking: { service: "resolutions", id: "ipe-error-50" },
};

export function formatTemplatePrice(amount) {
  return formatCurrency(amount);
}

export function getPricingEntry(templatePricing = DEFAULT_TEMPLATE_PRICING, service, id) {
  const scopedItems = templatePricing?.[service];
  const fallbackItems = DEFAULT_TEMPLATE_PRICING?.[service];
  return (scopedItems || []).find((item) => item.id === id) || (fallbackItems || []).find((item) => item.id === id) || null;
}

export function getPricingAmount(templatePricing = DEFAULT_TEMPLATE_PRICING, service, id) {
  return Number(getPricingEntry(templatePricing, service, id)?.amount || 0);
}

export function getMappedServicePrice(templatePricing = DEFAULT_TEMPLATE_PRICING, lookupKey) {
  const mapping = SERVICE_PRICE_LOOKUP[lookupKey];
  if (!mapping) {
    return {
      amount: 0,
      price: formatTemplatePrice(0),
      title: "",
      status: "Ready",
    };
  }

  const entry = getPricingEntry(templatePricing, mapping.service, mapping.id);
  const amount = Number(entry?.amount || 0);

  return {
    amount,
    price: formatTemplatePrice(amount),
    title: entry?.title || "",
    status: entry?.status || "Ready",
  };
}

export function buildNinTemplateOptions(templatePricing = DEFAULT_TEMPLATE_PRICING) {
  const pricingById = Object.fromEntries((templatePricing.nin || []).map((item) => [item.id, item]));

  return templateOptions.map((template) => {
    const priceEntry = pricingById[template.id];
    const amount = Number(priceEntry?.amount ?? template.amount ?? 0);

    return {
      ...template,
      amount,
      price: formatTemplatePrice(amount),
      status: priceEntry?.status || "Ready",
    };
  });
}

export function buildPhoneTemplateOptions(templatePricing = DEFAULT_TEMPLATE_PRICING) {
  const pricingById = Object.fromEntries((templatePricing.phone || []).map((item) => [item.id, item]));

  return phoneTemplateOptions.map((template) => {
    const priceEntry = pricingById[template.id];
    const amount = Number(priceEntry?.amount ?? 0);

    return {
      ...template,
      amount,
      price: formatTemplatePrice(amount),
      status: priceEntry?.status || "Ready",
    };
  });
}

export function buildBvnTemplateOptions(templatePricing = DEFAULT_TEMPLATE_PRICING) {
  return (templatePricing.bvn || []).map((template) => {
    const amount = Number(template.amount || 0);
    const title = String(template.title || "Premium").trim() || "Premium";

    return {
      ...template,
      title,
      displayTitle: title.toLowerCase().startsWith("bvn") ? title : `BVN ${title}`,
      amount,
      price: formatTemplatePrice(amount),
      status: template.status || "Ready",
    };
  });
}

export function buildTemplatePricingCatalog(templatePricing = DEFAULT_TEMPLATE_PRICING) {
  const ninTemplates = buildNinTemplateOptions(templatePricing).map((item) => ({
    id: item.id,
    title: item.title,
    channel: "NIN",
    amount: item.amount,
    price: item.price,
    status: item.status || "Ready",
    routePath: "/select_nin_template",
  }));

  const phoneTemplates = buildPhoneTemplateOptions(templatePricing).map((item) => ({
    id: item.id,
    title: item.title,
    channel: "Phone",
    amount: item.amount,
    price: item.price,
    status: item.status || "Ready",
    routePath: "/verify_phone",
  }));

  const bvnTemplates = buildBvnTemplateOptions(templatePricing).map((item) => ({
    id: item.id,
    title: item.displayTitle,
    channel: "BVN",
    amount: item.amount,
    price: item.price,
    status: item.status || "Ready",
    routePath: "/verify_bvn",
  }));

  const otherTemplates = (templatePricing.others || []).map((item) => ({
    id: item.id,
    title: item.title,
    channel: "Others",
    amount: Number(item.amount || 0),
    price: formatTemplatePrice(item.amount),
    status: item.status || "Ready",
    routePath: "/dashboard",
  }));

  const modificationServices = (templatePricing.modification || DEFAULT_TEMPLATE_PRICING.modification).map((item) => ({
    id: item.id,
    title: item.title,
    channel: "Modification",
    amount: Number(item.amount || 0),
    price: formatTemplatePrice(item.amount),
    status: item.status || "Ready",
    routePath: "/modification/nin",
  }));

  const birthAttestationServices = (templatePricing.birthAttestation || DEFAULT_TEMPLATE_PRICING.birthAttestation).map((item) => ({
    id: item.id,
    title: item.title,
    channel: "Birth Attestation",
    amount: Number(item.amount || 0),
    price: formatTemplatePrice(item.amount),
    status: item.status || "Ready",
    routePath: "/birth-attestation",
  }));

  const diasporaServices = (templatePricing.diaspora || DEFAULT_TEMPLATE_PRICING.diaspora).map((item) => ({
    id: item.id,
    title: item.title,
    channel: "Diaspora",
    amount: Number(item.amount || 0),
    price: formatTemplatePrice(item.amount),
    status: item.status || "Ready",
    routePath: "/diaspora-child-birth-notification",
  }));

  const resolutionServices = (templatePricing.resolutions || DEFAULT_TEMPLATE_PRICING.resolutions).map((item) => ({
    id: item.id,
    title: item.title,
    channel: "Resolution",
    amount: Number(item.amount || 0),
    price: formatTemplatePrice(item.amount),
    status: item.status || "Ready",
    routePath: "/ipe-error-50-resolution",
  }));

  return [
    ...ninTemplates,
    ...phoneTemplates,
    ...bvnTemplates,
    ...modificationServices,
    ...birthAttestationServices,
    ...diasporaServices,
    ...resolutionServices,
    ...otherTemplates,
  ];
}

export const quickServices = [
  { title: "Update Verification Data", copy: "Add or refresh your NIN, BVN, and contact information securely.", action: "Open Form", path: "/select_nin_template" },
  { title: "Wallet Funding", copy: "Use your wallet reference to request funding and review balance updates.", action: "View Wallet", path: "/wallet-funding" },
  { title: "Transaction History", copy: "See every wallet credit and verification charge tied to your profile.", action: "View History", path: "/transactions" },
];

export const publicApiDocs = [
  { method: "POST", path: "/api/register", description: "Register a new member account." },
  { method: "POST", path: "/api/auth/login", description: "Authenticate and receive an API token." },
  { method: "GET", path: "/api/auth/me", description: "Fetch the currently authenticated member profile." },
  { method: "PATCH", path: "/api/auth/profile", description: "Update member profile fields such as NIN and BVN." },
  { method: "POST", path: "/api/verify/nin", description: "Run a NIN verification and store the transaction." },
  { method: "POST", path: "/api/verify/bvn", description: "Run a BVN verification and store the transaction." },
  { method: "POST", path: "/api/verify/phone", description: "Run a phone number verification and store the transaction." },
  { method: "GET", path: "/api/portal/overview", description: "Dashboard summary, balances, and recent activity." },
  { method: "GET", path: "/api/portal/transactions", description: "Combined member transaction feed." },
];

export const ADMIN_MEMBERS = [
  { id: "ADM-MB-1001", name: "Gaddafi Umar", email: "um@gmail.com", phone: "09042340091", walletBalance: 49000, status: "Active", plan: "Member", joinedAt: "2025-12-19" },
  { id: "ADM-MB-1002", name: "Amina Yusuf", email: "amina@example.com", phone: "08124567890", walletBalance: 11200, status: "Pending Review", plan: "Member", joinedAt: "2026-01-08" },
  { id: "ADM-MB-1003", name: "Chinedu Okeke", email: "chinedu@example.com", phone: "08033445566", walletBalance: 7200, status: "Active", plan: "Agent", joinedAt: "2026-02-11" },
  { id: "ADM-MB-1004", name: "Blessing Eze", email: "blessing@example.com", phone: "07099887766", walletBalance: 0, status: "Suspended", plan: "Member", joinedAt: "2026-03-03" },
];

export const ADMIN_VERIFICATIONS = [
  { id: "VRF-9001", customer: "Gaddafi Umar", channel: "NIN Verification", reference: "NIN-0001", amount: 150, status: "Completed", createdAt: "2026-05-08T09:15:00+01:00" },
  { id: "VRF-9002", customer: "Amina Yusuf", channel: "BVN Verification", reference: "BVN-0008", amount: 170, status: "Pending Review", createdAt: "2026-05-08T10:05:00+01:00" },
  { id: "VRF-9003", customer: "Chinedu Okeke", channel: "NIN Verification", reference: "NIN-0011", amount: 150, status: "Completed", createdAt: "2026-05-07T16:42:00+01:00" },
  { id: "VRF-9004", customer: "Blessing Eze", channel: "BVN Verification", reference: "BVN-0013", amount: 170, status: "Failed", createdAt: "2026-05-07T18:20:00+01:00" },
];

export const ADMIN_SUPPORT_TICKETS = [
  { id: "SUP-101", subject: "Wallet funded but balance not updated", customer: "Amina Yusuf", priority: "High", status: "Open", channel: "Wallet Funding" },
  { id: "SUP-102", subject: "BVN response mismatch", customer: "Chinedu Okeke", priority: "Medium", status: "Investigating", channel: "Verification" },
  { id: "SUP-103", subject: "Unable to login after registration", customer: "Blessing Eze", priority: "High", status: "Escalated", channel: "Authentication" },
];

export const DUMMY_NIN_RECORDS = {
  "12345678901": {
    nin: "12345678901",
    surname: "UMAR",
    firstName: "GADDAFI",
    middleName: "",
    givenNames: "GADDAFI",
    dateOfBirth: "1998-12-27",
    sex: "M",
    gender: "Male",
    issueDate: "2025-11-17",
    trackingId: "S2N6NVERAB0AX4",
    addressLines: ["BACHURE VILLAGE JIMETA", "Yola North", "Adamawa"],
    nationalityCode: "NGA",
  },
  "52540148917": {
    nin: "52540148917",
    surname: "UMAR",
    firstName: "GADDAFI",
    middleName: "",
    givenNames: "GADDAFI",
    dateOfBirth: "1994-12-27",
    sex: "M",
    gender: "Male",
    issueDate: "2025-11-17",
    trackingId: "S2N6NVERAB0AX4",
    addressLines: ["BACHURE VILLAGE JIMETA", "Yola North", "Adamawa"],
    nationalityCode: "NGA",
  },
  "52183237373": {
    nin: "52183237373",
    surname: "ADEMUREWA",
    firstName: "SHILE",
    middleName: "CHUKWUMA",
    givenNames: "SHILE CHUKWUMA",
    dateOfBirth: "1991-08-12",
    sex: "M",
    gender: "Male",
    issueDate: "2018-09-09",
    trackingId: "H6Y0NYFH0000373",
    addressLines: ["47, HARMONY AVENUE", "KETU ALAPERE", "Lagos"],
    nationalityCode: "NGA",
  },
};

export const DUMMY_BVN_RECORDS = {
  "12345678901": {
    bvn: "12345678901",
    firstName: "GADDAFI",
    middleName: "",
    lastName: "UMAR",
    phoneNumber: "09035067771",
    dateOfBirth: "1998-12-27",
    gender: "Male",
    address: "Bachure Village Jimeta, Yola North, Adamawa",
    addressLines: ["Bachure Village Jimeta", "Yola North", "Adamawa"],
    passportPhoto: DUMMY_PASSPORT_IMAGE,
  },
  "22240458089": {
    bvn: "22240458089",
    firstName: "GADDAFI",
    middleName: "",
    lastName: "UMAR",
    phoneNumber: "09035067771",
    dateOfBirth: "1998-12-27",
    gender: "Male",
    address: "",
    addressLines: ["", "", ""],
    passportPhoto: DUMMY_PASSPORT_IMAGE,
  },
};

export const DUMMY_PHONE_RECORDS = {
  "09042340091": {
    phoneNumber: "09042340091",
    firstName: "GADDAFI",
    middleName: "",
    lastName: "UMAR",
    fullName: "GADDAFI UMAR",
    dateOfBirth: "1998-12-27",
    gender: "Male",
    address: "Bachure Village Jimeta, Yola North, Adamawa",
    carrier: "MTN Nigeria",
    lineType: "Mobile",
    status: "Verified",
    reference: "PHONE-TRACK-001",
  },
  "08124567890": {
    phoneNumber: "08124567890",
    firstName: "AMINA",
    middleName: "",
    lastName: "YUSUF",
    fullName: "AMINA YUSUF",
    dateOfBirth: "1999-04-08",
    gender: "Female",
    address: "Kaduna, Kaduna State",
    carrier: "Airtel Nigeria",
    lineType: "Mobile",
    status: "Verified",
    reference: "PHONE-TRACK-002",
  },
};

export function getPrimaryNavItems(isAuthenticated, isAdminAccess) {
  return navItems.filter((item) => (isAuthenticated ? !item.public : item.public || isAuthenticated)).concat(
    isAuthenticated && isAdminAccess ? [{ path: "/admin/dashboard", label: "Admin" }] : [],
  );
}

export function buildFallbackAdminSettings() {
  return {
    minMonthlyContribution: 0,
    defaultPenaltyRate: 0,
    loanToSavingsMultiplier: 0,
    emergencyLoanInterest: 0,
    loanEligibilityMonths: 0,
    autoDebitDate: 1,
    isAutoDebitActive: false,
    totalPoolLiquidity: 0,
    branding: { systemName: "IDM e-Services", logoUrl: null },
    smtp: { host: "", port: 587, user: "", pass: "", fromName: "", fromEmail: "" },
    templatePricing: DEFAULT_TEMPLATE_PRICING,
  };
}





