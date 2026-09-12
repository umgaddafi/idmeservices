import { useEffect, useState } from "react";
import { DASHBOARD_WELCOME_SEEN_KEY, DUMMY_BVN_RECORDS, DUMMY_NIN_RECORDS, DUMMY_PASSPORT_IMAGE, DUMMY_PHONE_RECORDS, createDummyOverview } from "./appData.js";
import { formatCurrency } from "./currency.js";

export function formatDateOnly(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
}

export function formatIssueDate(value) {
  if (!value) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value)).toUpperCase();
}

export function formatNinGroups(nin) {
  return String(nin || "").replace(/\D/g, "").slice(0, 11).replace(/(\d{4})(\d{3})(\d{0,4})/, (_, a, b, c) => [a, b, c].filter(Boolean).join(" "));
}

export function formatMoney(amount) {
  return formatCurrency(amount);
}

export function formatDate(value) {
  if (!value) return "N/A";
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

export function getDummyNinRecord(user, nin) {
  const digits = String(nin || "").replace(/\D/g, "");
  if (DUMMY_NIN_RECORDS[digits]) return DUMMY_NIN_RECORDS[digits];
  const nameParts = String(user?.name || "Gaddafi Umar").trim().split(/\s+/).filter(Boolean);
  const surname = (nameParts.at(-1) || DUMMY_NIN_RECORDS["12345678901"].surname).toUpperCase();
  const firstName = (nameParts[0] || DUMMY_NIN_RECORDS["12345678901"].firstName).toUpperCase();
  const middleName = nameParts.slice(1, -1).join(" ").toUpperCase();
  return {
    ...DUMMY_NIN_RECORDS["12345678901"],
    nin: digits || DUMMY_NIN_RECORDS["12345678901"].nin,
    surname,
    firstName,
    middleName,
    givenNames: [firstName, middleName].filter(Boolean).join(" "),
  };
}

export function getDummyBvnRecord(user, bvn) {
  const digits = String(bvn || "").replace(/\D/g, "");

  if (DUMMY_BVN_RECORDS[digits]) return DUMMY_BVN_RECORDS[digits];

  const fallbackRecord = DUMMY_BVN_RECORDS["12345678901"];
  const nameParts = String(user?.name || "Gaddafi Umar").trim().split(/\s+/).filter(Boolean);
  const firstName = (nameParts[0] || fallbackRecord.firstName).toUpperCase();
  const lastName = (nameParts.at(-1) || fallbackRecord.lastName).toUpperCase();
  const middleName = nameParts.slice(1, -1).join(" ").toUpperCase();
  const address = fallbackRecord.address;

  return {
    ...fallbackRecord,
    bvn: digits || fallbackRecord.bvn,
    firstName,
    middleName,
    lastName,
    phoneNumber: user?.phone || fallbackRecord.phoneNumber,
    address,
    addressLines: fallbackRecord.addressLines,
  };
}

export function getDummyPhoneRecord(user, phone) {
  const digits = String(phone || "").replace(/\D/g, "");

  if (DUMMY_PHONE_RECORDS[digits]) return DUMMY_PHONE_RECORDS[digits];

  const fallbackRecord = DUMMY_PHONE_RECORDS["09042340091"];
  const nameParts = String(user?.name || "Gaddafi Umar").trim().split(/\s+/).filter(Boolean);
  const firstName = (nameParts[0] || fallbackRecord.firstName).toUpperCase();
  const lastName = (nameParts.at(-1) || fallbackRecord.lastName).toUpperCase();
  const middleName = nameParts.slice(1, -1).join(" ").toUpperCase();
  const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");

  return {
    ...fallbackRecord,
    phoneNumber: digits || fallbackRecord.phoneNumber,
    firstName,
    middleName,
    lastName,
    fullName,
  };
}

export function getPassportPhotoSrc(record) {
  return record?.passportPhoto || DUMMY_PASSPORT_IMAGE;
}

export function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname || "/");
  useEffect(() => {
    const onPopState = () => setPathname(window.location.pathname || "/");
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);
  const navigate = (path) => {
    if (path === pathname) return;
    window.history.pushState({}, "", path);
    setPathname(window.location.pathname || "/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return { pathname, navigate };
}

function getDashboardWelcomeSeenStorageKey(sessionToken) {
  return `${DASHBOARD_WELCOME_SEEN_KEY}:${sessionToken}`;
}

export function hasSeenDashboardWelcome(sessionToken) {
  if (!sessionToken) return true;
  try {
    return window.sessionStorage.getItem(getDashboardWelcomeSeenStorageKey(sessionToken)) === "true";
  } catch {
    return false;
  }
}

export function markDashboardWelcomeSeen(sessionToken) {
  if (!sessionToken) return;
  try {
    window.sessionStorage.setItem(getDashboardWelcomeSeenStorageKey(sessionToken), "true");
  } catch {
    // Ignore session storage failures.
  }
}

export function clearDashboardWelcomeSeen(sessionToken) {
  if (!sessionToken) return;
  try {
    window.sessionStorage.removeItem(getDashboardWelcomeSeenStorageKey(sessionToken));
  } catch {
    // Ignore session storage failures.
  }
}

export function syncPortalSnapshot({ user, transactions, setSessionUser, setOverview, setTransactions, createOverview }) {
  const buildOverview = typeof createOverview === "function" ? createOverview : createDummyOverview;
  setSessionUser(user);
  setOverview(buildOverview(user, transactions));
  setTransactions(transactions);
}
