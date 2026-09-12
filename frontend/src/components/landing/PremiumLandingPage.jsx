import React, { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Baby,
  Banknote,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleCheckBig,
  Fingerprint,
  Headphones,
  History,
  Landmark,
  LockKeyhole,
  MessageCircle,
  PenLine,
  Phone,
  ScanFace,
  Send,
  ShieldCheck,
  UserRoundCheck,
  WalletCards,
  X,
} from "lucide-react";

import { apiRequest } from "../../lib/api.js";
import { formatMoney } from "../../lib/appUtils.js";
import TestimonialCarousel from "./TestimonialCarousel.jsx";

const FALLBACK_SERVICES = [
  {
    id: "nin-verification",
    title: "NIN Verification",
    category: "Identity",
    description: "Confirm National Identification Number records through a guided, account-controlled workflow.",
    routePath: "/select_nin_template",
    icon: Fingerprint,
  },
  {
    id: "bvn-verification",
    title: "BVN Verification",
    category: "Financial identity",
    description: "Run BVN checks and keep the request, charge, and result connected in one workspace.",
    routePath: "/verify_bvn",
    icon: Landmark,
  },
  {
    id: "phone-verification",
    title: "Phone Verification",
    category: "Contact check",
    description: "Validate phone-linked details with a clear flow designed for fast, confident review.",
    routePath: "/verify_phone",
    icon: Phone,
  },
  {
    id: "nin-modification",
    title: "NIN Modification",
    category: "Record support",
    description: "Start supported correction requests for identity details without losing track of progress.",
    routePath: "/modification",
    icon: PenLine,
  },
  {
    id: "birth-services",
    title: "Birth Services",
    category: "Documentation",
    description: "Access birth attestation and diaspora child notification services from the same account.",
    routePath: "/birth-attestation",
    icon: Baby,
  },
  {
    id: "wallet-funding",
    title: "Wallet & Funding",
    category: "Payments",
    description: "Fund once, view your balance clearly, and keep every service charge easy to trace.",
    routePath: "/wallet-funding",
    icon: WalletCards,
  },
];

const WORKFLOW_STEPS = [
  {
    number: "01",
    title: "Create your workspace",
    copy: "Open one account for verification services, wallet activity, and request history.",
  },
  {
    number: "02",
    title: "Choose what you need",
    copy: "Select the right identity service and follow a focused, step-by-step request flow.",
  },
  {
    number: "03",
    title: "Review and keep track",
    copy: "See charges, status, and completed activity without switching between disconnected tools.",
  },
];

const FAQS = [
  {
    question: "How do I start a verification request?",
    answer: "Create an account, sign in to your dashboard, then choose the service you need. The platform guides you through the required details before you submit.",
  },
  {
    question: "Which identity services are available?",
    answer: "You can find NIN and BVN verification, phone checks, identity record support, birth services, and wallet activity in your account. Browse the services above to see what is currently available.",
  },
  {
    question: "How does wallet funding work?",
    answer: "Your account includes a wallet area where funding details and balance activity are kept together. You can review credits and service charges from your dashboard.",
  },
  {
    question: "Can I review earlier requests and transactions?",
    answer: "Yes. Recent verification activity and wallet transactions remain visible in your account so you can return to them when needed.",
  },
  {
    question: "What if I need help during a request?",
    answer: "Use the support form or the message button on this page. Send the details of the issue and the support team can reply to the email address you provide.",
  },
];

const TESTIMONIALS = [
  {
    quote: "The verification flow feels fast and clear. I funded my wallet and completed my request without getting lost.",
    name: "Amina Yusuf",
    detail: "Verification client",
  },
  {
    quote: "The dashboard made it easy to track my wallet balance and review previous verification activity in one place.",
    name: "Blessing Eze",
    detail: "Workspace user",
  },
  {
    quote: "Everything feels organized, from account creation to document delivery. That makes the service more trustworthy.",
    name: "David Ojo",
    detail: "Identity services client",
  },
];

const PREVIEW_TYPES = [
  {
    id: "nin",
    label: "NIN",
    icon: Fingerprint,
    numberLabel: "National identity number",
    number: "••••  •••  •904",
    record: "Identity profile",
  },
  {
    id: "bvn",
    label: "BVN",
    icon: Landmark,
    numberLabel: "Bank verification number",
    number: "••••  •••  •217",
    record: "BVN profile",
  },
  {
    id: "phone",
    label: "Phone",
    icon: Phone,
    numberLabel: "Phone number",
    number: "+234  •••  •••  0481",
    record: "Phone-linked profile",
  },
];

const SERVICE_META = [
  { match: ["bvn", "bank verification"], icon: Landmark, routePath: "/verify_bvn" },
  { match: ["phone", "mobile"], icon: Phone, routePath: "/verify_phone" },
  { match: ["modification", "correction", "update"], icon: PenLine, routePath: "/modification" },
  { match: ["birth", "attestation", "diaspora"], icon: Baby, routePath: "/birth-attestation" },
  { match: ["wallet", "funding", "payment"], icon: WalletCards, routePath: "/wallet-funding" },
  { match: ["nin", "identity"], icon: Fingerprint, routePath: "/select_nin_template" },
];

function getServiceMeta(service) {
  const searchText = [service.title, service.slug, service.category, service.type].filter(Boolean).join(" ").toLowerCase();
  return SERVICE_META.find((item) => item.match.some((term) => searchText.includes(term))) || {
    icon: ShieldCheck,
    routePath: "/dashboard",
  };
}

function Reveal({ children, className = "", delay = 0, as = "div", direction = "up" }) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as] || motion.div;
  const offset = direction === "left" ? { x: 24, y: 0 } : { x: 0, y: 24 };

  return (
    <Component
      className={className}
      initial={reduceMotion ? false : { opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Component>
  );
}

function SectionLabel({ index, children, light = false }) {
  return (
    <div className={`mb-5 flex items-center gap-3 text-[0.72rem] font-bold uppercase tracking-[0.19em] ${light ? "text-emerald-200" : "text-emerald-800"}`}>
      <span className={`h-px w-8 ${light ? "bg-emerald-400/70" : "bg-emerald-600/70"}`} aria-hidden="true" />
      <span>{index}</span>
      <span className={light ? "text-white/65" : "text-slate-500"}>{children}</span>
    </div>
  );
}

function SectionTitle({ firstLine, secondLine, compact = false, className = "" }) {
  return (
    <div className={`premium-title-frame ${className}`}>
      <h2 className={`premium-section-title ${compact ? "premium-section-title--compact" : ""}`}>
        <span className="premium-title-line">{firstLine}</span>{" "}
        <span className="premium-title-line">{secondLine}</span>
      </h2>
    </div>
  );
}

function ArrowButton({ children, onClick, tone = "primary", className = "", type = "button", disabled = false }) {
  const tones = {
    primary: "bg-[#b8f34a] text-[#0b2119] shadow-[0_16px_40px_rgba(184,243,74,0.2)] hover:bg-[#c8ff61] focus-visible:ring-[#b8f34a]",
    dark: "bg-[#0b2119] text-white shadow-[0_16px_40px_rgba(11,33,25,0.16)] hover:bg-[#123c2e] focus-visible:ring-[#0b2119]",
    light: "border border-white/25 bg-white/10 text-white hover:border-white/40 hover:bg-white/15 focus-visible:ring-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`premium-action group inline-flex min-h-12 cursor-pointer items-center justify-center gap-3 rounded-full px-6 py-3 text-sm font-bold transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${className}`}
    >
      <span>{children}</span>
      <ArrowRight className="h-[1.1rem] w-[1.1rem] transition-transform duration-200 motion-safe:group-hover:translate-x-1 motion-safe:group-focus-visible:translate-x-1" aria-hidden="true" />
    </button>
  );
}

function VerificationPreview() {
  const [activeType, setActiveType] = useState(PREVIEW_TYPES[0]);
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-[38rem] lg:ml-auto">
      <div className="absolute -left-8 top-10 h-36 w-36 rounded-full bg-[#b8f34a]/20 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-8 bottom-10 h-40 w-40 rounded-full bg-emerald-300/15 blur-3xl" aria-hidden="true" />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 22, rotateX: 4 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-[#102b21]/90 p-2 shadow-[0_38px_90px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-3"
      >
        <div className="rounded-[1.35rem] border border-white/10 bg-[#f5f7f2] text-[#10241c]">
          <div className="flex items-center justify-between border-b border-[#dfe7e1] px-4 py-3.5 sm:px-5">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#0b2119] text-[#b8f34a]">
                <ScanFace className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
              </div>
              <div>
                <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-slate-500">Workflow preview</p>
                <p className="m-0 text-sm font-bold text-[#10241c]">New verification</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[0.68rem] font-bold text-emerald-800">
              <span className="premium-status-dot h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              Ready
            </span>
          </div>

          <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-[1fr_0.78fr]">
            <div className="rounded-2xl border border-[#dfe7e1] bg-white p-4 shadow-[0_12px_30px_rgba(16,36,28,0.06)]">
              <div className="mb-4 grid grid-cols-3 gap-1 rounded-xl bg-[#eef2ed] p-1" aria-label="Choose preview type">
                {PREVIEW_TYPES.map((item) => {
                  const Icon = item.icon;
                  const selected = activeType.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveType(item)}
                      aria-pressed={selected}
                      className={`inline-flex min-h-11 cursor-pointer items-center justify-center gap-1.5 rounded-lg px-2 text-xs font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${selected ? "bg-white text-[#0b2119] shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                    >
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                      {item.label}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeType.id}
                  initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="mb-2 mt-0 text-xs font-bold text-slate-600">{activeType.numberLabel}</p>
                  <div className="flex min-h-12 items-center justify-between rounded-xl border border-[#d8e3dc] bg-[#f8faf7] px-3.5">
                    <span className="font-mono text-[0.78rem] font-bold tracking-[0.11em] text-slate-700 sm:text-sm">{activeType.number}</span>
                    <LockKeyhole className="h-4 w-4 text-emerald-700" aria-label="Masked value" />
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-[#0b2119] px-3.5 py-3 text-white">
                    <span className="text-xs font-semibold">Prepare secure request</span>
                    <ArrowRight className="h-4 w-4 text-[#b8f34a]" aria-hidden="true" />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="flex flex-col gap-3">
              <div className="relative isolate flex flex-1 flex-col justify-between overflow-hidden rounded-2xl bg-[#dff7cf] p-4">
                <motion.span
                  key={activeType.id}
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-full origin-top bg-gradient-to-b from-transparent via-emerald-400/20 to-transparent"
                  initial={reduceMotion ? false : { opacity: 0, y: "-100%" }}
                  animate={reduceMotion ? { opacity: 0 } : { opacity: [0, 1, 0], y: "100%" }}
                  transition={{ duration: 1.4, delay: 0.2, ease: "easeInOut" }}
                />
                <div className="flex items-start justify-between">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-white/75 text-emerald-900">
                    <CircleCheckBig className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
                  </div>
                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-emerald-900/65">Structured</span>
                </div>
                <div className="mt-8">
                  <p className="m-0 text-[0.72rem] font-semibold text-emerald-900/65">Request output</p>
                  <p className="mb-0 mt-1 text-base font-extrabold leading-tight text-emerald-950">{activeType.record}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-[#dfe7e1] bg-white p-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Activity trail</span>
                  <History className="h-4 w-4 text-emerald-700" aria-hidden="true" />
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
                  <span className="text-xs font-bold text-slate-800">Saved to workspace</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.92, x: -18 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: reduceMotion ? 0 : [0, -7, 0] }}
        transition={{ duration: 0.45, delay: 0.65, ease: [0.16, 1, 0.3, 1], y: { duration: reduceMotion ? 0 : 3.2, delay: 0.85, ease: "easeInOut" } }}
        className="absolute -bottom-5 left-3 hidden items-center gap-3 rounded-2xl border border-white/20 bg-white px-4 py-3 text-[#0b2119] shadow-[0_18px_45px_rgba(0,0,0,0.24)] sm:flex"
      >
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
          <CheckCircle2 className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
        </div>
        <div>
          <p className="m-0 text-[0.66rem] font-semibold uppercase tracking-[0.11em] text-slate-500">One clear record</p>
          <p className="m-0 text-sm font-extrabold">Request, charge, status</p>
        </div>
      </motion.div>
    </div>
  );
}

function ServiceCard({ service, index, isAuthenticated, navigate }) {
  const Icon = service.icon || ShieldCheck;
  const isFeature = index === 0;
  const hasPrice = Number.isFinite(Number(service.amount)) && Number(service.amount) > 0;
  const destination = isAuthenticated ? service.routePath : "/register";

  return (
    <Reveal
      as="article"
      delay={Math.min(index, 5) * 0.08}
      className={`premium-service-card group relative flex min-h-[20rem] overflow-hidden rounded-[1.6rem] border p-6 sm:p-7 ${
        isFeature
          ? "border-emerald-900 bg-[#0b2119] text-white md:col-span-2 lg:row-span-2 lg:min-h-[30rem]"
          : "border-[#dfe6df] bg-white text-[#11271f]"
      }`}
    >
      <div
        className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
          isFeature
            ? "bg-[radial-gradient(circle_at_85%_20%,rgba(184,243,74,0.16),transparent_32%)]"
            : "bg-[radial-gradient(circle_at_90%_10%,rgba(62,163,111,0.10),transparent_35%)]"
        }`}
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className={`premium-service-icon grid h-12 w-12 place-items-center rounded-2xl ${isFeature ? "bg-white/10 text-[#b8f34a]" : "bg-[#edf5ee] text-emerald-800"}`}>
            <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`text-[0.65rem] font-bold uppercase tracking-[0.15em] ${isFeature ? "text-white/55" : "text-slate-400"}`}>
              {service.category || "Identity service"}
            </span>
            {hasPrice ? (
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isFeature ? "bg-white/10 text-white" : "bg-[#f1f5f1] text-emerald-900"}`}>
                {formatMoney(service.amount)}
              </span>
            ) : null}
          </div>
        </div>

        {isFeature ? (
          <div className="pointer-events-none absolute right-[8%] top-[18%] hidden h-60 w-60 place-items-center sm:grid" aria-hidden="true">
            <span className="absolute inset-0 rounded-full border border-[#b8f34a]/20" />
            <span className="absolute inset-7 rounded-full border border-white/10" />
            <span className="absolute inset-14 rounded-full border border-[#b8f34a]/25 bg-[#b8f34a]/[0.04]" />
            <span className="absolute left-1/2 top-0 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
            <span className="absolute left-0 top-1/2 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <Icon className="relative h-14 w-14 text-[#b8f34a]" strokeWidth={1.25} />
          </div>
        ) : null}

        <div className={isFeature ? "mt-auto pt-20 sm:max-w-lg" : "mt-auto pt-16"}>
          {isFeature ? <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#b8f34a]">Start with confidence</p> : null}
          <h3 className={`m-0 font-['Outfit'] font-semibold tracking-[-0.025em] ${isFeature ? "text-3xl text-white sm:text-4xl" : "text-xl text-[#11271f]"}`}>
            {service.title}
          </h3>
          <p className={`mb-0 mt-3 max-w-xl text-[0.95rem] leading-7 ${isFeature ? "text-white/68" : "text-slate-600"}`}>
            {service.description}
          </p>
          <button
            type="button"
            onClick={() => navigate(destination)}
            className={`premium-action mt-6 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition duration-200 focus-visible:outline-none focus-visible:ring-4 ${
              isFeature
                ? "border-white/20 bg-white/10 text-white hover:bg-white/15 focus-visible:ring-[#b8f34a]/60"
                : "border-[#d7e2da] bg-[#f8faf7] text-emerald-900 hover:border-emerald-300 hover:bg-emerald-50 focus-visible:ring-emerald-600/25"
            }`}
          >
            {isAuthenticated ? "Open service" : "Start service"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </Reveal>
  );
}

function SupportForm({ form, setForm, state, onSubmit, idPrefix = "contact" }) {
  return (
    <form className="mt-7 space-y-4" onSubmit={onSubmit}>
      <div>
        <label htmlFor={`${idPrefix}-name`} className="mb-2 block text-sm font-bold text-[#183229]">Full name</label>
        <input
          id={`${idPrefix}-name`}
          type="text"
          autoComplete="name"
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          className="min-h-12 w-full rounded-xl border border-[#d8e2da] bg-white px-4 text-base text-[#10241c] outline-none transition placeholder:text-slate-400 hover:border-emerald-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
          placeholder="Your name"
          required
        />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-email`} className="mb-2 block text-sm font-bold text-[#183229]">Email address</label>
        <input
          id={`${idPrefix}-email`}
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          className="min-h-12 w-full rounded-xl border border-[#d8e2da] bg-white px-4 text-base text-[#10241c] outline-none transition placeholder:text-slate-400 hover:border-emerald-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
          placeholder="you@example.com"
          required
        />
      </div>
      <div>
        <label htmlFor={`${idPrefix}-message`} className="mb-2 block text-sm font-bold text-[#183229]">How can we help?</label>
        <textarea
          id={`${idPrefix}-message`}
          rows="4"
          value={form.message}
          onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
          className="w-full resize-y rounded-xl border border-[#d8e2da] bg-white px-4 py-3 text-base leading-6 text-[#10241c] outline-none transition placeholder:text-slate-400 hover:border-emerald-300 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
          placeholder="Tell us what you need help with"
          required
        />
      </div>

      <div aria-live="polite" aria-atomic="true">
        {state.message ? (
          <div className={`flex items-start gap-2 rounded-xl border px-3.5 py-3 text-sm font-semibold ${state.message.tone === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-800"}`}>
            {state.message.tone === "success" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" /> : <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
            <span>{state.message.text}</span>
          </div>
        ) : null}
      </div>

      <ArrowButton type="submit" tone="dark" disabled={state.loading} className="w-full sm:w-auto">
        {state.loading ? "Sending message…" : "Send to support"}
      </ArrowButton>
    </form>
  );
}

export function PremiumLandingPage({ navigate, isAuthenticated, services: managedServices = [], branding = {} }) {
  const reduceMotion = useReducedMotion();
  const systemName = branding?.systemName || "IDM e-Services";
  const emptyForm = { name: "", email: "", message: "" };
  const [activeFaq, setActiveFaq] = useState(0);
  const [supportForm, setSupportForm] = useState(emptyForm);
  const [supportState, setSupportState] = useState({ loading: false, message: null });
  const [chatOpen, setChatOpen] = useState(false);
  const [chatForm, setChatForm] = useState(emptyForm);
  const [chatState, setChatState] = useState({ loading: false, message: null });
  const chatNameRef = useRef(null);
  const chatLauncherRef = useRef(null);

  const primaryAction = isAuthenticated
    ? { label: "Open your dashboard", path: "/dashboard" }
    : { label: "Create your account", path: "/register" };
  const secondaryAction = isAuthenticated
    ? { label: "Start a verification", path: "/select_nin_template" }
    : { label: "Sign in", path: "/login" };

  const services = useMemo(() => {
    const liveServices = managedServices
      .filter((service) => service.showOnHomepage !== false && String(service.status || "Live").toLowerCase() === "live")
      .sort((first, second) => Number(first.sortOrder || 0) - Number(second.sortOrder || 0))
      .map((service) => {
        const meta = getServiceMeta(service);
        return {
          ...service,
          id: service.id || service.slug || service.title,
          category: service.category || service.type || "Identity service",
          description: service.description || `Access ${service.title} from your secure ${systemName} workspace.`,
          routePath: service.routePath || meta.routePath,
          icon: meta.icon,
        };
      });

    return managedServices.length ? liveServices : FALLBACK_SERVICES;
  }, [managedServices, systemName]);

  const closeChat = () => {
    setChatOpen(false);
    window.requestAnimationFrame(() => chatLauncherRef.current?.focus());
  };

  useEffect(() => {
    if (!chatOpen) return undefined;

    const focusTimer = window.setTimeout(() => chatNameRef.current?.focus(), reduceMotion ? 0 : 180);
    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeChat();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [chatOpen, reduceMotion]);

  useEffect(() => {
    const sectionId = window.location.hash.replace(/^#/, "");
    if (!sectionId) return undefined;

    const scrollTimer = window.setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "auto", block: "start" });
    }, 80);

    return () => window.clearTimeout(scrollTimer);
  }, []);

  const submitSupportMessage = async ({ form, channel, setState, reset }) => {
    setState({ loading: true, message: null });
    try {
      await apiRequest("/support-tickets", {
        method: "POST",
        body: {
          name: form.name,
          email: form.email,
          message: form.message,
          subject: channel === "Live Chat" ? "Chat support request" : "Homepage support message",
          channel,
        },
      });
      reset();
      setState({ loading: false, message: { tone: "success", text: "Message sent. The support team will reply by email." } });
    } catch (error) {
      setState({ loading: false, message: { tone: "error", text: error.message || "We could not send your message. Please try again." } });
    }
  };

  const heroStyle = branding?.homepageWallpaperUrl
    ? {
        backgroundImage: `linear-gradient(90deg, rgba(5, 25, 18, 0.97) 0%, rgba(5, 25, 18, 0.92) 48%, rgba(5, 25, 18, 0.76) 100%), url("${branding.homepageWallpaperUrl}")`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }
    : undefined;

  return (
    <div className="premium-landing overflow-hidden bg-[#f5f7f2] text-[#11271f] selection:bg-[#b8f34a] selection:text-[#0b2119]">
      <section id="home" className="relative isolate overflow-hidden bg-[#071c15] text-white" style={heroStyle}>
        {!branding?.homepageWallpaperUrl ? (
          <>
            <div className="absolute inset-0 -z-20 bg-[radial-gradient(circle_at_12%_5%,rgba(47,152,105,0.26),transparent_34%),radial-gradient(circle_at_88%_18%,rgba(184,243,74,0.11),transparent_29%),linear-gradient(130deg,#061a13_0%,#0b271d_55%,#071c15_100%)]" aria-hidden="true" />
            <div className="absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_86%)]" aria-hidden="true" />
          </>
        ) : null}

        <div id="landing-content" tabIndex={-1} className="mx-auto grid min-h-[min(48rem,calc(100dvh-4.7rem))] w-full max-w-[90rem] items-center gap-14 px-5 pb-14 pt-8 sm:px-8 sm:pb-16 sm:pt-10 lg:grid-cols-[minmax(0,0.92fr)_minmax(32rem,1.08fr)] lg:px-12 lg:pb-20 lg:pt-14 xl:gap-20">
          <div className="max-w-[43rem]">
          

            <div className="premium-title-frame">
              <motion.h1
                initial={reduceMotion ? false : { opacity: 0, y: 20 }}
                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="premium-hero-title premium-typewriter-title text-white"
              >
                <span className="premium-title-line premium-typewriter-line">Verify identity.</span>{" "}
                <span className="premium-title-line premium-typewriter-line premium-typewriter-line--second">Move with <span className="premium-hero-highlight text-[#b8f34a]">confidence.</span></span>
              </motion.h1>
            </div>

            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}
              className="mb-0 mt-7 max-w-[39rem] text-base leading-8 text-white/68 sm:text-lg"
            >
              {systemName} brings NIN, BVN, phone checks, record support, and wallet activity into one clear experience—so every next step feels obvious.
            </motion.p>

            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 18 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.21, ease: [0.16, 1, 0.3, 1] }}
              className="premium-hero-actions mt-8 flex flex-nowrap items-center justify-center gap-2 sm:gap-3"
            >
              <ArrowButton onClick={() => navigate(primaryAction.path)}>{isAuthenticated ? "Dashboard" : primaryAction.label}</ArrowButton>
              <ArrowButton tone="light" onClick={() => navigate(secondaryAction.path)}>{isAuthenticated ? "Verify identity" : secondaryAction.label}</ArrowButton>
            </motion.div>

          
          </div>

          <VerificationPreview />
        </div>

        <div className="border-t border-white/10">
          <div className="mx-auto grid max-w-[90rem] grid-cols-2 divide-x divide-y divide-white/10 px-5 sm:px-8 md:grid-cols-4 md:divide-y-0 lg:px-12">
            {[
              ["NIN + BVN", "Core verification"],
              ["One account", "Unified workspace"],
              ["Clear records", "Request history"],
              ["Support ready", "Help when needed"],
            ].map(([value, label], index) => (
              <Reveal key={value} delay={index * 0.08} className="px-4 py-5 sm:px-6 sm:py-6">
                <p className="m-0 font-['Outfit'] text-lg font-semibold tracking-[-0.02em] text-white sm:text-xl">{value}</p>
                <p className="mb-0 mt-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-white/65">{label}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="services" className="scroll-mt-[4.25rem] bg-[#f5f7f2] px-5 py-20 sm:px-8 sm:py-28 md:scroll-mt-20 lg:px-12">
        <div className="mx-auto max-w-[90rem]">
          <Reveal className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
            <div>
              <SectionLabel index="01">Services</SectionLabel>
              <SectionTitle firstLine="Identity services," secondLine="without the maze." />
            </div>
            <div className="lg:pb-2 lg:pl-12">
              <p className="m-0 max-w-[42rem] text-base leading-8 text-slate-600 sm:text-lg">
                Move from request to record inside one considered experience. Available services, pricing, and access stay connected to your account.
              </p>
            </div>
          </Reveal>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:auto-rows-fr">
            {services.map((service, index) => (
              <ServiceCard key={service.id || `${service.title}-${index}`} service={service} index={index} isAuthenticated={isAuthenticated} navigate={navigate} />
            ))}
            {!services.length ? <p className="text-base text-slate-600">Services are being updated. Please contact support for assistance.</p> : null}
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="mx-auto max-w-[90rem]">
          <div className="grid gap-12 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:gap-20">
            <div>
              <Reveal>
                <SectionLabel index="02">The experience</SectionLabel>
                <SectionTitle firstLine="A calmer way to handle" secondLine="important details." />
                <p className="mb-0 mt-6 max-w-[38rem] text-base leading-8 text-slate-600 sm:text-lg">
                  Identity work carries enough pressure already. The interface keeps context close, actions clear, and account activity easy to revisit.
                </p>
              </Reveal>

              <div className="mt-9 space-y-5">
                {[
                  [UserRoundCheck, "Guided from the first click", "Focused screens help you understand what is needed before you submit."],
                  [History, "A record you can return to", "Verification activity and wallet movement stay visible in your workspace."],
                  [Headphones, "Support stays within reach", "Send the details of an issue from the page whenever you need assistance."],
                ].map(([Icon, title, copy], index) => (
                  <Reveal key={title} delay={index * 0.1} className="flex gap-4 border-t border-[#e1e7e2] pt-5 first:border-t-0 first:pt-0">
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#edf5ee] text-emerald-800">
                      <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="m-0 text-base font-extrabold text-[#173027]">{title}</h3>
                      <p className="mb-0 mt-1 text-sm leading-6 text-slate-600">{copy}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal direction="left" className="premium-experience-visual relative min-h-[31rem] overflow-hidden rounded-[2rem] bg-[#dfe8dd] p-3 sm:min-h-[38rem] sm:p-5">
              <img
                src="/assets/marketing/laptop-tablet-workflow.webp"
                alt="Person reviewing a digital workflow on a laptop"
                width="1600"
                height="1067"
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#071c15]/80 via-[#071c15]/10 to-transparent" aria-hidden="true" />

              <div className="absolute bottom-3 left-3 right-3 rounded-[1.35rem] border border-white/20 bg-[#0b2119]/90 p-5 text-white shadow-2xl backdrop-blur-lg sm:bottom-5 sm:left-5 sm:right-auto sm:w-[22rem] sm:p-6">
                <div className="flex items-center justify-between">
                  <p className="m-0 text-[0.68rem] font-bold uppercase tracking-[0.15em] text-emerald-200">Workspace activity</p>
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10"><History className="h-3.5 w-3.5" aria-hidden="true" /></span>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    ["NIN verification", "Completed", CheckCircle2],
                    ["Wallet funding", "Recorded", Banknote],
                    ["Support request", "Open", MessageCircle],
                  ].map(([title, status, Icon], index) => (
                    <Reveal key={title} direction="left" delay={0.15 + index * 0.1} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-3">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-[#b8f34a]"><Icon className="h-4 w-4" aria-hidden="true" /></div>
                      <div className="min-w-0 flex-1">
                        <p className="m-0 truncate text-xs font-bold text-white">{title}</p>
                        <p className="mb-0 mt-0.5 text-[0.68rem] text-white/50">{index === 0 ? "Today" : index === 1 ? "Yesterday" : "Recent"}</p>
                      </div>
                      <span className="text-[0.68rem] font-bold text-emerald-200">{status}</span>
                    </Reveal>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0b2119] px-5 py-20 text-white sm:px-8 sm:py-28 lg:px-12">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(184,243,74,0.1),transparent_62%)]" aria-hidden="true" />
        <div className="relative mx-auto max-w-[90rem]">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Reveal>
              <SectionLabel index="03" light>How it works</SectionLabel>
              <SectionTitle firstLine="Three clear steps." secondLine="One continuous flow." className="text-white" />
              <p className="mb-0 mt-6 max-w-md text-base leading-8 text-white/62">
                Start with an account, choose the service, and keep the outcome connected to your activity history.
              </p>
            </Reveal>

            <ol className="m-0 list-none border-t border-white/15 p-0">
              {WORKFLOW_STEPS.map((step, index) => (
                <Reveal as="li" key={step.number} direction="left" delay={index * 0.12} className="premium-workflow-step group grid gap-4 border-b border-white/15 py-7 sm:grid-cols-[4rem_1fr_auto] sm:items-start sm:gap-6">
                  <span className="premium-step-number font-mono text-xs font-bold tracking-[0.14em] text-[#b8f34a]">{step.number}</span>
                  <div>
                    <h3 className="m-0 font-['Outfit'] text-2xl font-semibold tracking-[-0.025em] text-white">{step.title}</h3>
                    <p className="mb-0 mt-2 max-w-xl text-sm leading-7 text-white/58">{step.copy}</p>
                  </div>
                  <div className="hidden h-10 w-10 place-items-center rounded-full border border-white/15 text-white/40 transition duration-200 group-hover:border-[#b8f34a]/50 group-hover:text-[#b8f34a] sm:grid">
                    {index === WORKFLOW_STEPS.length - 1 ? <Check className="h-4 w-4" aria-hidden="true" /> : <ArrowRight className="h-4 w-4" aria-hidden="true" />}
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="testimonies" className="scroll-mt-[4.25rem] bg-[#f5f7f2] px-5 py-20 sm:px-8 sm:py-28 md:scroll-mt-20 lg:px-12">
        <div className="mx-auto max-w-[90rem]">
          <Reveal className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 lg:flex-1">
              <SectionLabel index="04">Client experience</SectionLabel>
              <SectionTitle firstLine="Clarity people" secondLine="can feel." />
            </div>
            <p className="m-0 max-w-md text-base leading-8 text-slate-600">
              The best identity workflow is the one people can understand, complete, and confidently return to.
            </p>
          </Reveal>

          <TestimonialCarousel testimonials={TESTIMONIALS} />
        </div>
      </section>

      <section id="contact" className="scroll-mt-[4.25rem] bg-white px-5 py-20 sm:px-8 sm:py-28 md:scroll-mt-20 lg:px-12">
        <div className="mx-auto grid max-w-[90rem] gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20">
          <div>
            <Reveal>
              <SectionLabel index="05">Questions</SectionLabel>
              <SectionTitle firstLine="Everything you need to know" secondLine="before you begin." compact />
            </Reveal>

            <div className="mt-10 border-t border-[#dfe6df]">
              {FAQS.map((item, index) => {
                const isOpen = activeFaq === index;
                const answerId = `landing-faq-answer-${index}`;
                return (
                  <Reveal key={item.question} delay={index * 0.06} className="border-b border-[#dfe6df]">
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? -1 : index)}
                      aria-expanded={isOpen}
                      aria-controls={answerId}
                      className="flex min-h-[4.75rem] w-full cursor-pointer items-center justify-between gap-6 py-4 text-left font-bold text-[#173027] transition hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/15"
                    >
                      <span>{item.question}</span>
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition duration-200 ${isOpen ? "rotate-180 border-emerald-700 bg-emerald-800 text-white" : "border-[#d8e2da] text-slate-500"}`}>
                        <ChevronDown className="h-4 w-4" aria-hidden="true" />
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.div
                          id={answerId}
                          initial={reduceMotion ? false : { opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={reduceMotion ? undefined : { opacity: 0, height: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden"
                        >
                          <p className="mb-6 mt-0 max-w-[42rem] pr-12 text-sm leading-7 text-slate-600 sm:text-base">{item.answer}</p>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </Reveal>
                );
              })}
            </div>
          </div>

          <Reveal className="h-fit rounded-[1.75rem] border border-[#dce5de] bg-[#f5f7f2] p-6 shadow-[0_24px_70px_rgba(16,36,28,0.08)] sm:p-8 lg:sticky lg:top-28">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="m-0 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">Support desk</p>
                <h3 className="mb-0 mt-3 font-['Outfit'] text-xl font-semibold tracking-[-0.035em] text-[#10241c] sm:text-2xl">Need a human hand?</h3>
              </div>
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#0b2119] text-[#b8f34a]">
                <Headphones className="h-5 w-5" aria-hidden="true" />
              </div>
            </div>
            <p className="mb-0 mt-4 text-sm leading-7 text-slate-600">
              Share the request or payment issue you are facing. The support team can follow up using your email address.
            </p>
            <SupportForm
              form={supportForm}
              setForm={setSupportForm}
              state={supportState}
              onSubmit={(event) => {
                event.preventDefault();
                void submitSupportMessage({
                  form: supportForm,
                  channel: "Homepage Form",
                  setState: setSupportState,
                  reset: () => setSupportForm(emptyForm),
                });
              }}
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-white px-5 pb-20 sm:px-8 sm:pb-28 lg:px-12">
        <Reveal className="relative mx-auto max-w-[90rem] overflow-hidden rounded-[2rem] bg-[#b8f34a] px-6 py-12 text-[#0b2119] sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          <div className="absolute -right-20 -top-28 h-80 w-80 rounded-full border-[52px] border-[#0b2119]/[0.06]" aria-hidden="true" />
          <div className="absolute -bottom-24 right-[24%] h-56 w-56 rounded-full border-[42px] border-white/20" aria-hidden="true" />
          <div className="relative flex flex-col gap-9 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0 lg:flex-1">
              <p className="m-0 text-xs font-bold uppercase tracking-[0.18em] text-emerald-950/60">Your next request starts here</p>
              <SectionTitle firstLine="Make identity work" secondLine="feel straightforward." className="mt-4" />
            </div>
            <ArrowButton tone="dark" onClick={() => navigate(primaryAction.path)} className="shrink-0 self-start lg:self-auto">
              {primaryAction.label}
            </ArrowButton>
          </div>
        </Reveal>
      </section>

      <button
        ref={chatLauncherRef}
        type="button"
        onClick={() => (chatOpen ? closeChat() : setChatOpen(true))}
        aria-expanded={chatOpen}
        aria-controls="landing-support-chat"
        aria-label={chatOpen ? "Close support message panel" : "Open support message panel"}
        className="fixed bottom-5 right-5 z-[90] grid h-14 w-14 cursor-pointer place-items-center rounded-full border border-white/20 bg-[#0b2119] text-[#b8f34a] shadow-[0_18px_45px_rgba(11,33,25,0.28)] transition duration-200 hover:-translate-y-1 hover:bg-[#123c2e] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/30 sm:bottom-6 sm:right-6"
      >
        {chatOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <MessageCircle className="h-5 w-5" aria-hidden="true" />}
      </button>

      <AnimatePresence>
        {chatOpen ? (
          <motion.aside
            id="landing-support-chat"
            role="dialog"
            aria-modal="false"
            aria-labelledby="landing-support-chat-title"
            initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 right-4 z-[89] max-h-[calc(100dvh-6.75rem)] w-[min(25rem,calc(100vw-2rem))] overflow-y-auto overscroll-contain rounded-[1.5rem] border border-[#dce5de] bg-[#f7f9f5] p-5 text-[#10241c] shadow-[0_28px_80px_rgba(5,25,18,0.28)] sm:right-6 sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="m-0 text-[0.66rem] font-bold uppercase tracking-[0.15em] text-emerald-800">Support message</p>
                <h2 id="landing-support-chat-title" className="mb-0 mt-1 font-['Outfit'] text-xl font-semibold text-[#10241c]">How can we help?</h2>
              </div>
              <button
                type="button"
                onClick={closeChat}
                aria-label="Close support message panel"
                className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-full border border-[#d8e2da] bg-white text-slate-600 transition hover:text-[#10241c] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/20"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <form
              className="mt-5 space-y-3"
              onSubmit={(event) => {
                event.preventDefault();
                void submitSupportMessage({
                  form: chatForm,
                  channel: "Live Chat",
                  setState: setChatState,
                  reset: () => setChatForm(emptyForm),
                });
              }}
            >
              <div>
                <label htmlFor="chat-name" className="sr-only">Full name</label>
                <input
                  ref={chatNameRef}
                  id="chat-name"
                  type="text"
                  autoComplete="name"
                  value={chatForm.name}
                  onChange={(event) => setChatForm((current) => ({ ...current, name: event.target.value }))}
                  className="min-h-11 w-full rounded-xl border border-[#d8e2da] bg-white px-3.5 text-base outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <label htmlFor="chat-email" className="sr-only">Email address</label>
                <input
                  id="chat-email"
                  type="email"
                  autoComplete="email"
                  value={chatForm.email}
                  onChange={(event) => setChatForm((current) => ({ ...current, email: event.target.value }))}
                  className="min-h-11 w-full rounded-xl border border-[#d8e2da] bg-white px-3.5 text-base outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                  placeholder="Email address"
                  required
                />
              </div>
              <div>
                <label htmlFor="chat-message" className="sr-only">Support message</label>
                <textarea
                  id="chat-message"
                  rows="3"
                  value={chatForm.message}
                  onChange={(event) => setChatForm((current) => ({ ...current, message: event.target.value }))}
                  className="w-full resize-y rounded-xl border border-[#d8e2da] bg-white px-3.5 py-3 text-base outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                  placeholder="Tell us what happened"
                  required
                />
              </div>

              <div aria-live="polite" aria-atomic="true">
                {chatState.message ? (
                  <p className={`m-0 rounded-lg px-3 py-2 text-xs font-semibold ${chatState.message.tone === "success" ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-800"}`}>
                    {chatState.message.text}
                  </p>
                ) : null}
              </div>

              <button
                type="submit"
                disabled={chatState.loading}
                className="inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#0b2119] px-4 text-sm font-bold text-white transition hover:bg-[#123c2e] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/25 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {chatState.loading ? "Sending…" : "Send message"}
                <Send className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
