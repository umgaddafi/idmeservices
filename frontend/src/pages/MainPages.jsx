import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleDollarSign,
  CircleHelp,
  Copy,
  Download,
  FileSearch,
  Fingerprint,
  Globe2,
  Landmark,
  LayoutGrid,
  Mail,
  MessageSquareWarning,
  RefreshCcw,
  Settings2,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import { apiRequest } from "../lib/api.js";
import { ADMIN_MEMBERS, ADMIN_SUPPORT_TICKETS, ADMIN_VERIFICATIONS, DUMMY_TRANSACTIONS, FRONTEND_TEST_MODE, publicApiDocs, quickServices } from "../lib/appData.js";
import { buildFallbackAdminSettings } from "../lib/appData.js";
import { formatDate, formatMoney } from "../lib/appUtils.js";
import { MessageBanner } from "../components/common/CommonComponents.jsx";
import { MemberDashboardHero } from "../components/member-dashboard/MemberDashboardHero.jsx";
import { MemberDashboardRecentActivity } from "../components/member-dashboard/MemberDashboardRecentActivity.jsx";
import { MemberDashboardServices } from "../components/member-dashboard/MemberDashboardServices.jsx";
import { WelcomeNotificationModal } from "../components/member-dashboard/WelcomeNotificationModal.jsx";

export function OrderDetailsPage({ order, loading, message }) {
  return (
    <section className="panel">
      <div className="section-banner">Order Receipt</div>
      <MessageBanner tone={message?.tone}>{message?.text}</MessageBanner>
      {loading ? (
        <div className="empty-state">Loading your order...</div>
      ) : !order ? (
        <div className="empty-state">No order details are available yet.</div>
      ) : (
        <div className="wallet-grid">
          <article className="panel">
            <h2>{order.orderNumber}</h2>
            <p className="lede">Status: {order.status}</p>
            <div className="info-strip">Payment Reference: {order.paymentReference || "N/A"}</div>
            <div className="verify-result-grid verify-result-grid--compact">
              <div className="verify-result-item"><span>Items Total</span><strong>{formatMoney(order.itemsTotal)}</strong></div>
              <div className="verify-result-item"><span>Shipping Fee</span><strong>{formatMoney(order.shippingFee)}</strong></div>
              <div className="verify-result-item"><span>Total Paid</span><strong>{formatMoney(order.totalPaid)}</strong></div>
              <div className="verify-result-item verify-result-item--full"><span>Delivery Address</span><strong>{[order.deliveryName, order.deliveryAddress, order.deliveryPhone].filter(Boolean).join(", ")}</strong></div>
            </div>
          </article>
          <article className="panel">
            <div className="section-banner">Order Items</div>
            <table className="txn-table">
              <thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
              <tbody>
                {(order.items || []).map((item, index) => (
                  <tr key={`${item.name}-${index}`}>
                    <td data-label="Item">{item.name}</td>
                    <td data-label="Qty">{item.quantity}</td>
                    <td data-label="Unit Price">{formatMoney(item.unitPrice)}</td>
                    <td data-label="Subtotal">{formatMoney(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        </div>
      )}
    </section>
  );
}

export function HomePage({ navigate, isAuthenticated, services: managedServices = [], branding = {} }) {
  const systemName = branding?.systemName || "IDM e-Services";
  const [activeFaq, setActiveFaq] = useState(0);
  const emptySupportForm = { name: "", email: "", message: "" };
  const [supportForm, setSupportForm] = useState(emptySupportForm);
  const [supportState, setSupportState] = useState({ loading: false, message: null });
  const [chatOpen, setChatOpen] = useState(false);
  const [chatForm, setChatForm] = useState(emptySupportForm);
  const [chatState, setChatState] = useState({ loading: false, message: null });
  const trustStats = [
    { value: "24/7", label: "Verification access" },
    { value: "2 min", label: "Average onboarding flow" },
    { value: "Bank-grade", label: "Payment account funding" },
  ];
  const serviceHighlights = [
    { title: "All Verification Services in One Place", copy: "NIN checks, BVN confirmation, profile review, and wallet funding support in one client-ready portal." },
    { title: "Fast, Guided Processing", copy: "Move from registration to verification with a cleaner experience that reduces friction for first-time users." },
    { title: "Trackable Client Activity", copy: "Review wallet movement, verification attempts, and account activity from a single dashboard." },
  ];
  const services = [
    { icon: <ShieldCheckProxy />, title: "NIN Verification", copy: "Provide secure National Identification Number verification with a polished, trustworthy user journey.", image: "/assets/marketing/identity-phone.jpg", alt: "Smartphone identity verification interface" },
    { icon: <Fingerprint size={20} />, title: "BVN Verification", copy: "Cross-check BVN-linked customer details and keep verification records organized in one modern workspace.", image: "/assets/marketing/laptop-tablet-workflow.jpg", alt: "Professional using laptop and tablet in a modern workflow" },
    { icon: <Building2 size={20} />, title: "Wallet & Funding", copy: "Track wallet credits, verification charges, and client activity from a single trustworthy dashboard.", image: "/assets/marketing/nigerian-professional.jpg", alt: "Nigerian professional using a laptop for financial operations" },
    { icon: <Landmark size={20} />, title: "Template-Based Delivery", copy: "Let users choose between clean premium and regular template experiences before completing verification.", image: "/assets/marketing/brand-portrait.jpg", alt: "Professional laptop portrait for branded document delivery" },
  ];
  const homepageServices = managedServices.length
    ? managedServices
        .filter((service) => service.showOnHomepage !== false && String(service.status || "Live") === "Live")
        .map((service) => ({
          icon: <ShieldCheckProxy />,
          title: service.title,
          copy: service.description || `Admin-managed ${systemName} service.`,
          image: service.imageUrl || "/assets/marketing/identity-phone.jpg",
          alt: service.title,
        }))
    : services;
  const featureBullets = [
    "Manage NIN, BVN, and wallet-based operations in one place.",
    "Keep verification journeys clear, guided, and easier to trust.",
    "Track every deposit, debit, and verification request from the dashboard.",
    "Present a more professional identity-service experience from the first screen.",
  ];
  const benefitCards = [
    { icon: <ShieldCheckProxy small />, title: "Secure", copy: "Built for safer identity processing and dependable access to user activity records." },
    { icon: <Sparkles size={18} />, title: "Fast", copy: "Quick navigation and simplified flows for registration, funding, and verification." },
    { icon: <Globe2 size={18} />, title: "Convenient", copy: "Everything needed for identity workflows can be handled from one account." },
    { icon: <BadgeCheck size={18} />, title: "Trackable", copy: "Every verification and wallet event can be reviewed through recent activity and transaction history." },
  ];
  const workflowSteps = [
    { number: "1", title: "Create an Account", copy: "Sign up and open your personal verification workspace with wallet access and guided onboarding." },
    { number: "2", title: "Choose a Service", copy: "Pick NIN verification, BVN verification, or the appropriate template flow for the request." },
    { number: "3", title: "Fund Your Wallet", copy: "Use your wallet reference to request funding and keep balance updates traceable." },
    { number: "4", title: "Track and Complete", copy: "Monitor requests, balances, and account activity from a clean dashboard experience." },
  ];
  const faqs = [
    {
      question: "How do I create an account and start verification?",
      answer: "Click Get Started or Create Your Account on the homepage, complete your registration, then choose a verification flow from your dashboard.",
    },
    {
      question: `What services can I access on ${systemName}?`,
      answer: "You can access NIN verification, BVN verification, wallet funding support, transaction history, and template-based document delivery flows.",
    },
    {
      question: "How does wallet funding work?",
      answer: "Your account can be funded through the wallet reference flow so you have balance ready before starting paid verification requests.",
    },
    {
      question: "Can I track previous verifications and transactions?",
      answer: "Yes. The dashboard keeps your recent activity and transaction history visible so you can review completed checks, charges, and wallet movement.",
    },
    {
      question: "Is my identity data handled securely?",
      answer: "Yes. The platform is designed to present a cleaner, more trustworthy verification experience while keeping identity workflow access controlled inside your account.",
    },
  ];
  const advantages = [
    "Unified dashboard for NIN, BVN, and wallet-based actions.",
    "Dedicated account funding flow for cleaner payment tracking.",
    "Modern service presentation that improves user confidence.",
    "Real-time activity visibility for deposits and verification actions.",
    "Template-based verification flow for a more guided experience.",
    "Support-ready experience for onboarding, compliance, and identity operations.",
  ];
  const testimonials = [
    { name: "Amina Yusuf", date: "May 2, 2026", quote: "The verification flow feels fast and clear. I funded my wallet and completed my request without getting lost." },
    { name: "Chinedu Okeke", date: "May 1, 2026", quote: "I like how professional the template delivery looks. It gives the whole process more confidence." },
    { name: "Blessing Eze", date: "April 29, 2026", quote: "The dashboard made it easy to track my wallet balance and review previous verification activity in one place." },
    { name: "Fatima Bello", date: "April 27, 2026", quote: `${systemName} feels cleaner than most portals I have used. The steps are simple and the pages are easy to follow.` },
    { name: "Ibrahim Musa", date: "April 24, 2026", quote: "Funding and verification work together nicely here. I did not have to guess what came next." },
    { name: "Grace Nwosu", date: "April 22, 2026", quote: "The support section and transaction history are especially helpful when I need to confirm what I already paid for." },
    { name: "David Ojo", date: "April 19, 2026", quote: "Everything feels organized, from account creation to document delivery. That makes the service more trustworthy." },
    { name: "Khadija Sule", date: "April 18, 2026", quote: "I appreciate how quickly I can move from login to verification without too many distractions on the page." },
    { name: "Samuel Ade", date: "April 15, 2026", quote: "The interface looks modern and the wallet funding flow is straightforward. It is easy to recommend." },
    { name: "Ruth Ekanem", date: "April 12, 2026", quote: "The portal gives a much better experience on mobile than I expected. The main actions stay easy to reach." },
  ];
  const trustPillars = ["Structured identity checks", "Clean member wallet flow", "Audit-friendly activity trail", "Modern onboarding experience"];
  const primaryAction = isAuthenticated ? { label: "Open Dashboard", path: "/dashboard" } : { label: "Get Started", path: "/register" };
  const secondaryAction = isAuthenticated ? { label: "Start Verification", path: "/select_nin_template" } : { label: "Login", path: "/login" };
  const heroWallpaperUrl = branding?.homepageWallpaperUrl || "/assets/marketing/laptop-tablet-workflow.jpg";
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
      setState({ loading: false, message: { tone: "success", text: "Message sent successfully. Admin will reply to your email." } });
    } catch (error) {
      setState({ loading: false, message: { tone: "error", text: error.message || "Unable to send your message right now." } });
    }
  };

  return (
    <>
      <section id="home" className="marketing-hero">
        <img className="marketing-hero-background" src={heroWallpaperUrl} alt="Professionals using digital verification workflow tools" />
        <div className="marketing-hero-copy">
          <h1>Seamless Verification for NIN, BVN, NIN Modification and Birth Attestation</h1>
          <p className="marketing-lede">{systemName} helps users handle identity verification, phone checks, BVN, CAC and wallet funding from one clean, dependable portal.</p>
          <div className="marketing-actions">
            <button type="button" className="marketing-primary-button" onClick={() => navigate(primaryAction.path)}><span>{primaryAction.label}</span><ArrowRight size={18} /></button>
            <button type="button" className="marketing-secondary-button" onClick={() => navigate(secondaryAction.path)}>{secondaryAction.label}</button>
          </div>
        </div>
      </section>
      {/* <section className="marketing-section marketing-section--compact"><div className="marketing-mini-grid">{serviceHighlights.map((item) => <article key={item.title} className="marketing-mini-card"><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div></section> */}
      <section id="services" className="marketing-section"><div className="marketing-section-header"><p className="eyebrow">Our services</p><h2>Identity and account services arranged in one place.</h2><p className="lede">{systemName} offers a connected verification experience so users can move from registration to funding to identity confirmation without feeling lost.</p></div><HomeServicesCarousel services={homepageServices} /></section>
      {/* <section className="marketing-section marketing-section--split marketing-section--trust"><div className="marketing-story-card"><p className="eyebrow">Why IDM e-Services</p><h2>Built for speed, trust, and cleaner operations.</h2><p className="lede">Whether the user is confirming identity details or funding a wallet for verification charges, the platform keeps the experience modern, secure, and easy to follow.</p><div className="marketing-step-list">{featureBullets.map((step) => <div key={step} className="marketing-step-item"><span className="marketing-step-check"><CheckCircle2 size={18} /></span><p>{step}</p></div>)}</div></div><div className="marketing-benefit-grid">{benefitCards.map((item) => <article key={item.title} className="marketing-benefit-card"><span className="marketing-benefit-icon">{item.icon}</span><h3>{item.title}</h3><p>{item.copy}</p></article>)}</div></section> */}
      <section className="marketing-section"><div className="marketing-section-header"><p className="eyebrow">Workflow</p><h2>How it works</h2><p className="lede">A simple step-by-step process for clients to start, fund, and complete verification tasks.</p></div><div className="marketing-workflow-grid">{workflowSteps.map((step, index) => <RevealOnScroll key={step.number} as="article" className="marketing-workflow-card" delayMs={index * 90}><div className="marketing-workflow-head"><span className="marketing-workflow-number">{step.number}</span><h3>{step.title}</h3></div><p>{step.copy}</p></RevealOnScroll>)}</div></section>
      <section className="marketing-cta"><div><p className="eyebrow">Ready to start?</p><h2>Launch your verification journey from one platform.</h2><p className="lede">{systemName} helps users handle NIN, BVN, wallet funding, and identity confirmation with dashboard convenience.</p></div><div className="marketing-actions marketing-actions--cta"><button type="button" className="marketing-primary-button" onClick={() => navigate(primaryAction.path)}><span>{isAuthenticated ? "Go to Dashboard" : "Create Your Account"}</span><ArrowRight size={18} /></button></div></section>
      <section id="contact" className="marketing-section marketing-section--split marketing-section--faq"><RevealOnScroll className="marketing-story-card"><p className="eyebrow">FAQ</p><h2>Frequently asked questions</h2><p className="lede">Quick answers about {systemName} services, wallet usage, and dashboard flow.</p><div className="marketing-faq-list">{faqs.map((item, index) => { const isOpen = activeFaq === index; return <RevealOnScroll key={item.question} as="article" className={`marketing-faq-item ${isOpen ? "marketing-faq-item--open" : ""}`} delayMs={index * 80}><button type="button" className="marketing-faq-trigger" onClick={() => setActiveFaq((current) => current === index ? -1 : index)} aria-expanded={isOpen}><div className="marketing-faq-title-row"><span className="marketing-faq-icon"><CircleHelp size={18} /></span><h3>{item.question}</h3></div><span className="marketing-faq-chevron">{isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</span></button>{isOpen ? <div className="marketing-faq-answer"><p>{item.answer}</p></div> : null}</RevealOnScroll>; })}</div></RevealOnScroll><RevealOnScroll className="marketing-support-card" delayMs={120}><p className="eyebrow">Support</p><h2>Need help with any verification step?</h2><p className="lede">Send a quick message and we will get back to you about NIN checks, wallet funding, or any part of the verification flow.</p>{supportState.message ? <div className={`support-inline-message support-inline-message--${supportState.message.tone}`}>{supportState.message.text}</div> : null}<form className="marketing-support-form" onSubmit={(event) => { event.preventDefault(); void submitSupportMessage({ form: supportForm, channel: "Homepage Form", setState: setSupportState, reset: () => setSupportForm(emptySupportForm) }); }}><label className="marketing-support-field"><span>Name</span><input type="text" placeholder="Your name" value={supportForm.name} onChange={(event) => setSupportForm((current) => ({ ...current, name: event.target.value }))} required /></label><label className="marketing-support-field"><span>Email</span><input type="email" placeholder="Your email address" value={supportForm.email} onChange={(event) => setSupportForm((current) => ({ ...current, email: event.target.value }))} required /></label><label className="marketing-support-field"><span>Message</span><textarea rows="5" placeholder="Tell us how we can help" value={supportForm.message} onChange={(event) => setSupportForm((current) => ({ ...current, message: event.target.value }))} required /></label><button type="submit" className="marketing-support-submit" disabled={supportState.loading}>{supportState.loading ? "Sending..." : "Send Message"}</button></form></RevealOnScroll></section>
      <section id="testimonies" className="marketing-section marketing-section--testimonials"><div className="marketing-section-header"><p className="eyebrow">What Users Say</p><h2>Real comments from people using the platform.</h2><p className="lede">A few quick reactions from users who have gone through registration, funding, and verification on {systemName}.</p></div><TestimonialCarousel testimonials={testimonials} /></section>
      <section className="marketing-section marketing-section--advantages"><div className="marketing-section-header"><p className="eyebrow">Advantages</p><h2>Why choose {systemName}?</h2><p className="lede">A modern, unified identity-service platform designed to look professional and feel dependable.</p></div><div className="marketing-advantages-grid">{advantages.map((item, index) => <RevealOnScroll key={item} className="marketing-advantage-item" delayMs={index * 70}><BadgeCheck size={18} /><span>{item}</span></RevealOnScroll>)}</div></section>
      <button type="button" className="homepage-chat-launcher" aria-label="Open support chat" onClick={() => setChatOpen((current) => !current)}><Mail size={24} /></button>
      {chatOpen ? <div className="homepage-chatbox"><div className="homepage-chatbox-head"><div><strong>Support Chat</strong><span>Admin may not be online. Send your request and we will reply by email.</span></div><button type="button" onClick={() => setChatOpen(false)}>x</button></div>{chatState.message ? <div className={`support-inline-message support-inline-message--${chatState.message.tone}`}>{chatState.message.text}</div> : null}<form className="homepage-chatbox-form" onSubmit={(event) => { event.preventDefault(); void submitSupportMessage({ form: chatForm, channel: "Live Chat", setState: setChatState, reset: () => setChatForm(emptySupportForm) }); }}><input type="text" placeholder="Your name" value={chatForm.name} onChange={(event) => setChatForm((current) => ({ ...current, name: event.target.value }))} required /><input type="email" placeholder="Your email" value={chatForm.email} onChange={(event) => setChatForm((current) => ({ ...current, email: event.target.value }))} required /><textarea rows="4" placeholder="Type your message or issue" value={chatForm.message} onChange={(event) => setChatForm((current) => ({ ...current, message: event.target.value }))} required /><button type="submit" disabled={chatState.loading}>{chatState.loading ? "Sending..." : "Send to Admin"}</button></form></div> : null}
    </>
  );
}

function HomeServicesCarousel({ services = [] }) {
  const trackRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 768;
  });
  const shouldScroll = services.length > 4;

  const updateScrollState = () => {
    const track = trackRef.current;
    if (!track || !shouldScroll) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    setCanScrollLeft(track.scrollLeft > 4);
    setCanScrollRight(track.scrollLeft < maxScrollLeft - 4);
  };

  const scrollServices = (direction = 1) => {
    const track = trackRef.current;
    if (!track) return;

    const firstCard = track.querySelector(".marketing-feature-card");
    const cardWidth = firstCard?.getBoundingClientRect().width || track.clientWidth / 4;
    const gap = Number.parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap || "16") || 16;
    const maxScrollLeft = track.scrollWidth - track.clientWidth;

    if (direction > 0 && track.scrollLeft >= maxScrollLeft - 4) {
      track.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    track.scrollBy({
      left: direction * (cardWidth + gap),
      behavior: "smooth",
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const handleViewportChange = (event) => setIsMobile(event.matches);

    setIsMobile(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleViewportChange);

    return () => mediaQuery.removeEventListener("change", handleViewportChange);
  }, []);

  useEffect(() => {
    if (isMobile) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return undefined;
    }

    updateScrollState();

    const track = trackRef.current;
    if (!track || !shouldScroll) return undefined;

    const handleScroll = () => updateScrollState();
    const handleResize = () => updateScrollState();

    track.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    const intervalId = window.setInterval(() => {
      const maxScrollLeft = track.scrollWidth - track.clientWidth;

      if (track.scrollLeft >= maxScrollLeft - 4) {
        track.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }

      scrollServices(1);
    }, 3600);

    return () => {
      window.clearInterval(intervalId);
      track.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobile, services.length, shouldScroll]);

  if (isMobile) {
    return (
      <div className="marketing-feature-grid marketing-feature-grid--four marketing-feature-grid--stack">
        {services.map((item, index) => (
          <ServiceFeatureCard key={`${item.title}-${index}`} item={item} index={index} disableReveal />
        ))}
      </div>
    );
  }

  if (!shouldScroll) {
    return (
      <div className="marketing-feature-grid marketing-feature-grid--four">
        {services.map((item, index) => <ServiceFeatureCard key={`${item.title}-${index}`} item={item} index={index} />)}
      </div>
    );
  }

  return (
    <div className="marketing-services-carousel">
      {canScrollLeft ? (
        <button type="button" className="marketing-carousel-arrow marketing-carousel-arrow--left" aria-label="Previous services" onClick={() => scrollServices(-1)}>
          <ChevronLeft size={22} />
        </button>
      ) : null}
      <div ref={trackRef} className="marketing-services-track">
        {services.map((item, index) => <ServiceFeatureCard key={`${item.title}-${index}`} item={item} index={index} />)}
      </div>
      {canScrollRight ? (
        <button type="button" className="marketing-carousel-arrow marketing-carousel-arrow--right" aria-label="Next services" onClick={() => scrollServices(1)}>
          <ChevronRight size={22} />
        </button>
      ) : null}
    </div>
  );
}

function ServiceFeatureCard({ item, index, disableReveal = false }) {
  if (disableReveal) {
    return (
      <article className="marketing-feature-card">
        <div className="marketing-feature-media"><img src={item.image} alt={item.alt} /></div>
        <div className="marketing-feature-head"><span className="marketing-feature-icon">{item.icon}</span><h3>{item.title}</h3></div>
        <p>{item.copy}</p>
      </article>
    );
  }

  return (
    <RevealOnScroll as="article" className="marketing-feature-card" delayMs={index * 90}>
      <div className="marketing-feature-media"><img src={item.image} alt={item.alt} /></div>
      <div className="marketing-feature-head"><span className="marketing-feature-icon">{item.icon}</span><h3>{item.title}</h3></div>
      <p>{item.copy}</p>
    </RevealOnScroll>
  );
}

function RevealOnScroll({ as: Component = "div", children, className = "", delayMs = 0 }) {
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = elementRef.current;

    if (!node) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -48px 0px",
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={elementRef}
      className={`scroll-reveal ${isVisible ? "is-visible" : ""} ${className}`.trim()}
      style={{ transitionDelay: `${delayMs}ms` }}
    >
      {children}
    </Component>
  );
}

function TestimonialCarousel({ testimonials = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

  useEffect(() => {
    if (testimonials.length <= 1) return undefined;

    let resetTimerId = 0;

    const intervalId = window.setInterval(() => {
      setIsSliding(true);

      window.setTimeout(() => {
        setActiveIndex((current) => (current + 1) % testimonials.length);
        resetTimerId = window.setTimeout(() => setIsSliding(false), 40);
      }, 620);
    }, 4200);

    return () => {
      window.clearInterval(intervalId);
      window.clearTimeout(resetTimerId);
    };
  }, [testimonials.length]);

  const orderedCards = testimonials.map((_, offset) => testimonials[(activeIndex + offset) % testimonials.length]).slice(0, 4);

  return (
    <div className="marketing-testimonial-stepper">
      <div className={`marketing-testimonial-stage ${isSliding ? "is-sliding" : ""}`}>
        {orderedCards.map((item, index) => (
          <article key={`${item.name}-${item.date}-${index}`} className={`marketing-testimonial-card marketing-testimonial-card--slot-${index}`}>
            <span className="marketing-testimonial-quote">"</span>
            <p>{item.quote}</p>
            <div className="marketing-testimonial-meta">
              <strong>{item.name}</strong>
              <span>{item.date}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ShieldCheckProxy({ small = false }) {
  return <CheckCircle2 size={small ? 18 : 20} />;
}

function MemberDashboardSupportTickets({ tickets = [] }) {
  const getTicketPillClassName = (value) => {
    const normalized = String(value || "").toLowerCase();

    if (normalized.includes("resolved") || normalized.includes("closed")) {
      return "pill pill-success";
    }

    if (normalized.includes("investigating") || normalized.includes("open") || normalized.includes("pending")) {
      return "pill pill-warning";
    }

    return "pill";
  };

  return (
    <section className="dashboard-panel member-services-table-panel">
      <div className="split">
        <div>
          <div className="section-banner">Support Status</div>
          <p className="lede">Track the latest admin response status for your support tickets.</p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="txn-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Channel</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length ? tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td data-label="Ticket"><strong>{ticket.subject}</strong></td>
                <td data-label="Channel">{ticket.channel || "Portal"}</td>
                <td data-label="Priority"><span className={getTicketPillClassName(ticket.priority)}>{ticket.priority || "Medium"}</span></td>
                <td data-label="Status"><span className={getTicketPillClassName(ticket.status)}>{ticket.status || "Open"}</span></td>
                <td data-label="Updated">{ticket.updatedAt ? formatDate(ticket.updatedAt) : "N/A"}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5">
                  <div className="empty-state">No support ticket is open for your account yet.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function DashboardPage({ navigate, overview, refreshing, onRefresh, welcomeModalOpen, onCloseWelcomeModal, servicePricing, services = [] }) {
  const user = overview?.user;
  const activities = overview?.recentActivity || [];
  const supportTickets = overview?.supportTickets || [];

  return (
    <section className="member-dashboard-page">
      <WelcomeNotificationModal open={welcomeModalOpen} onClose={onCloseWelcomeModal} />
      <MemberDashboardHero navigate={navigate} onRefresh={onRefresh} refreshing={refreshing} user={user} />
      <MemberDashboardServices navigate={navigate} servicePricing={servicePricing} services={services} />
      <MemberDashboardRecentActivity activities={activities} navigate={navigate} />
      <MemberDashboardSupportTickets tickets={supportTickets} />
    </section>
  );
}

export function AdminDashboardPage({ user, navigate, transactions = [], members = [], logs = [], settings, loading = false, message = null }) {
  const [activeTab, setActiveTab] = useState("overview");
  const adminMenu = [
    { id: "overview", label: "Dashboard", icon: <LayoutGrid size={18} /> },
    { id: "users", label: "Users", icon: <Users size={18} /> },
    { id: "verifications", label: "Verifications", icon: <FileSearch size={18} /> },
    { id: "wallet", label: "Wallet Funding", icon: <CircleDollarSign size={18} /> },
    { id: "transactions", label: "Transactions", icon: <Activity size={18} /> },
    { id: "reports", label: "Reports", icon: <BarChart3 size={18} /> },
    { id: "support", label: "Support", icon: <MessageSquareWarning size={18} /> },
    { id: "settings", label: "Settings", icon: <Settings2 size={18} /> },
  ];
  const adminMembers = useMemo(() => {
    const currentMember = user ? [{ id: user.memberId || "ADM-MB-LIVE", name: user.name || "Current User", email: user.email || "user@example.com", phone: user.phone || "N/A", walletBalance: Number(user.walletBalance || 0), status: user.status || "Active", plan: user.role || "Member", joinedAt: user.joinDate || "2026-01-01" }] : [];
    const seededMembers = members.length ? members.map((member) => ({ id: member.id || member.memberId || member.email, name: member.name, email: member.email, phone: member.phone || "N/A", walletBalance: Number(member.walletBalance || 0), status: member.status || "Active", plan: member.role || "Member", joinedAt: member.joinDate || "N/A" })) : ADMIN_MEMBERS;
    return [...currentMember, ...seededMembers].filter((member, index, list) => list.findIndex((item) => item.email === member.email) === index);
  }, [members, user]);
  const transactionFeed = transactions.length ? transactions : DUMMY_TRANSACTIONS;
  const completedVerifications = ADMIN_VERIFICATIONS.filter((item) => item.status === "Completed").length;
  const auditLogs = logs.length ? logs : [];
  const pendingTickets = (auditLogs.length ? auditLogs : ADMIN_SUPPORT_TICKETS).filter((item) => {
    const status = String(item.status || "").toLowerCase();
    return status !== "closed" && status !== "verified";
  }).length;
  const activeMembers = adminMembers.filter((item) => item.status === "Active").length;
  const totalWalletFloat = adminMembers.reduce((sum, item) => sum + Number(item.walletBalance || 0), 0);
  const totalRevenue = transactionFeed.filter((item) => item.direction === "debit").reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const effectiveSettings = settings || buildFallbackAdminSettings();
  const renderStatusPill = (value) => {
    const normalized = String(value || "").toLowerCase();
    const className = normalized.includes("completed") || normalized.includes("active") || normalized.includes("connected") ? "pill pill-success" : normalized.includes("pending") || normalized.includes("review") || normalized.includes("investigating") ? "pill pill-warning" : "pill";
    return <span className={className}>{value}</span>;
  };
  const supportItems = auditLogs.length ? auditLogs.map((log) => ({ id: log.id, subject: log.action, customer: log.actor, priority: log.actorRole || "Staff", status: log.status, channel: log.target })) : ADMIN_SUPPORT_TICKETS;
  const settingsCards = [
    { label: "System Name", value: effectiveSettings.branding?.systemName || "IDM e-Services", note: "Current public-facing platform name" },
    { label: "Pool Liquidity", value: formatMoney(Number(effectiveSettings.totalPoolLiquidity || 0)), note: "Configured liquidity value from system settings" },
    { label: "Auto Debit", value: effectiveSettings.isAutoDebitActive ? "Enabled" : "Disabled", note: `Scheduled for day ${effectiveSettings.autoDebitDate || 1} of each month` },
    { label: "SMTP Sender", value: effectiveSettings.smtp?.fromEmail || "Not configured", note: effectiveSettings.smtp?.fromName || "Outgoing notification sender" },
  ];
  const activeContent = {
    overview: <>
      <MessageBanner tone={message?.tone}>{message?.text}</MessageBanner>
      <section className="admin-hero"><div><span className="section-banner admin-section-chip">Admin Workspace</span><h1>Operations dashboard for identity verification, funding, and support.</h1><p>Track member growth, verification volume, wallet health, and support pressure from one professional control room.</p></div><button type="button" className="dashboard-money-button" onClick={() => navigate("/dashboard")}>Open Member View</button></section>
      <section className="admin-stat-grid"><article className="admin-stat-card"><span>Total members</span><strong>{adminMembers.length}</strong><small>{activeMembers} active accounts</small></article><article className="admin-stat-card"><span>Wallet float</span><strong>{formatMoney(totalWalletFloat)}</strong><small>Across all tracked member balances</small></article><article className="admin-stat-card"><span>Completed verifications</span><strong>{completedVerifications}</strong><small>Across NIN and BVN requests</small></article><article className="admin-stat-card"><span>Support queue</span><strong>{pendingTickets}</strong><small>Open, escalated, or investigating</small></article></section>
    </>,
    users: <section className="panel admin-card"><div className="split"><div className="section-banner">User Management</div><button type="button" className="btn btn-primary" onClick={() => navigate("/register")}>Add Member</button></div><div className="table-wrap"><table className="txn-table"><thead><tr><th>Member ID</th><th>Name</th><th>Contact</th><th>Wallet</th><th>Status</th><th>Plan</th></tr></thead><tbody>{(loading ? [] : adminMembers).map((member) => <tr key={member.id}><td data-label="Member ID">{member.id}</td><td data-label="Name">{member.name}</td><td data-label="Contact">{member.email}<br />{member.phone}</td><td data-label="Wallet">{formatMoney(member.walletBalance)}</td><td data-label="Status">{renderStatusPill(member.status)}</td><td data-label="Plan">{member.plan}</td></tr>)}{!loading && !adminMembers.length ? <tr><td colSpan="6"><div className="empty-state">No member records are available for this admin account.</div></td></tr> : null}</tbody></table></div></section>,
    verifications: <section className="panel admin-card"><div className="split"><div className="section-banner">Verification</div>{renderStatusPill("4 requests")}</div><div className="table-wrap"><table className="txn-table"><thead><tr><th>Reference</th><th>Customer</th><th>Channel</th><th>Charge</th><th>Status</th><th>Created</th></tr></thead><tbody>{ADMIN_VERIFICATIONS.map((item) => <tr key={item.id}><td data-label="Reference">{item.reference}</td><td data-label="Customer">{item.customer}</td><td data-label="Channel">{item.channel}</td><td data-label="Charge">{formatMoney(item.amount)}</td><td data-label="Status">{renderStatusPill(item.status)}</td><td data-label="Created">{formatDate(item.createdAt)}</td></tr>)}</tbody></table></div></section>,
    wallet: <section className="admin-grid admin-grid--two"><article className="panel admin-card"><div className="section-banner">Wallet Funding Health</div><div className="admin-mini-grid"><div className="admin-kpi-box"><span>Tracked wallets</span><strong>{adminMembers.length}</strong></div><div className="admin-kpi-box"><span>Pending credits</span><strong>2</strong></div><div className="admin-kpi-box"><span>Funding reviews</span><strong>Open</strong></div><div className="admin-kpi-box"><span>Funding inflow</span><strong>{formatMoney(transactionFeed.filter((item) => item.direction === "credit").reduce((sum, item) => sum + item.amount, 0))}</strong></div></div></article><article className="panel admin-card"><div className="section-banner">Reconciliation Tasks</div><div className="admin-list"><div className="admin-list-item"><div className="admin-list-icon"><RefreshCcw size={16} /></div><div><strong>Review delayed wallet updates</strong><p>Check recent credits that still need confirmation in the member ledger.</p></div></div><div className="admin-list-item"><div className="admin-list-icon"><CircleDollarSign size={16} /></div><div><strong>Review manual funding requests</strong><p>Confirm customer references before approving manual wallet adjustments.</p></div></div></div></article></section>,
    transactions: <section className="panel admin-card"><div className="split"><div className="section-banner">Transaction Ledger</div><strong>{formatMoney(totalRevenue)} total verification revenue</strong></div><div className="table-wrap"><table className="txn-table"><thead><tr><th>Date</th><th>Type</th><th>Reference</th><th>Amount</th><th>Status</th><th>Description</th></tr></thead><tbody>{transactionFeed.map((item) => <tr key={item.id}><td data-label="Date">{formatDate(item.date)}</td><td data-label="Type">{item.type}</td><td data-label="Reference">{item.reference}</td><td data-label="Amount" className={item.direction === "credit" ? "money-positive" : "money-negative"}>{item.direction === "credit" ? "+" : "-"}{formatMoney(item.amount)}</td><td data-label="Status">{renderStatusPill(item.status)}</td><td data-label="Description">{item.description}</td></tr>)}</tbody></table></div></section>,
    reports: <section className="admin-grid admin-grid--three"><article className="panel admin-card"><div className="section-banner">Revenue Snapshot</div><strong className="admin-report-value">{formatMoney(totalRevenue)}</strong><p>Verification charges captured from completed debit transactions.</p></article><article className="panel admin-card"><div className="section-banner">Verification Mix</div><strong className="admin-report-value">50% / 50%</strong><p>Current request volume is balanced between NIN and BVN channels.</p></article><article className="panel admin-card"><div className="section-banner">Support Pressure</div><strong className="admin-report-value">{pendingTickets}</strong><p>Tickets remain open across authentication, funding, and verification issues.</p></article></section>,
    support: <section className="panel admin-card"><div className="section-banner">Support and Complaints</div><div className="admin-list">{supportItems.map((ticket) => <div key={ticket.id} className="admin-ticket"><div><strong>{ticket.subject}</strong><p>{ticket.customer} - {ticket.channel}</p></div><div className="admin-ticket-meta">{renderStatusPill(ticket.priority)}{renderStatusPill(ticket.status)}</div></div>)}</div></section>,
    settings: <section className="admin-grid admin-grid--two">{settingsCards.map((item) => <article key={item.label} className="panel admin-card"><div className="section-banner">{item.label}</div><strong className="admin-report-value">{item.value}</strong><p>{item.note}</p></article>)}</section>,
  }[activeTab];
  return <section className="admin-shell"><aside className="admin-sidebar"><div className="admin-sidebar-header"><span className="section-banner admin-section-chip">Administrator</span><h2>{user?.name || "Platform Admin"}</h2><p>Oversee operations, funding activity, and verification workflows.</p></div><nav className="admin-menu" aria-label="Admin sections">{adminMenu.map((item) => <button key={item.id} type="button" className={`admin-menu-button ${activeTab === item.id ? "active" : ""}`} onClick={() => setActiveTab(item.id)}><span>{item.icon}</span><span>{item.label}</span></button>)}</nav></aside><div className="admin-content">{activeContent}</div></section>;
}

export function TransactionsPage({ transactions, branding = {} }) {
  const systemName = branding?.systemName || "IDM e-Services";
  const downloadTransaction = (transaction) => {
    const lines = [
      `${systemName} Verification Receipt`,
      `Date: ${formatDate(transaction.date)}`,
      `Type: ${transaction.type}`,
      `Reference: ${transaction.reference}`,
      `Amount: ${transaction.direction === "credit" ? "+" : "-"}${formatMoney(transaction.amount)}`,
      `Status: ${transaction.status}`,
      `Description: ${transaction.description}`,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${transaction.type.toLowerCase().replace(/\s+/g, "-")}-${transaction.reference}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  };
  return <section className="panel panel-wide"><div className="section-banner">Transaction History</div><div className="table-wrap"><table className="txn-table"><thead><tr><th>Date</th><th>Type</th><th>Reference</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>{transactions.length ? transactions.map((transaction) => { const isDownloadable = /verification/i.test(transaction.type) || /verification/i.test(transaction.description || ""); return <tr key={transaction.id}><td data-label="Date">{formatDate(transaction.date)}</td><td data-label="Type">{transaction.type}</td><td data-label="Reference">{transaction.reference}</td><td data-label="Amount" className={transaction.direction === "credit" ? "money-positive" : ""}>{transaction.direction === "credit" ? "+" : "-"}{formatMoney(transaction.amount)}</td><td data-label="Status"><span className={`pill ${transaction.direction === "credit" ? "pill-success" : ""}`}>{transaction.status}</span></td><td data-label="Action">{isDownloadable ? <button type="button" className="txn-download-button" onClick={() => downloadTransaction(transaction)}><Download size={14} /><span>Download</span></button> : null}</td></tr>; }) : <tr><td colSpan="6"><div className="empty-state">No transactions have been recorded yet.</div></td></tr>}</tbody></table></div></section>;
}

export function WalletFundingPage({ user, transactions, navigate, token, onUserUpdate, onRefreshPortalData, branding = {} }) {
  const initialAccounts = user?.virtualAccounts || user?.walletProfile?.accounts || [];
  const [virtualAccounts, setVirtualAccounts] = useState(initialAccounts);
  const [walletState, setWalletState] = useState({ loading: false, message: null, copied: "" });
  const [paymentReference, setPaymentReference] = useState("");
  const deposits = transactions.filter((item) => item.direction === "credit");
  const refreshDashboardSnapshot = useCallback(async (successText = "Wallet balance refreshed.") => {
    if (!token || FRONTEND_TEST_MODE || !onRefreshPortalData) {
      return;
    }

    setWalletState((current) => ({ ...current, loading: true, message: null }));

    try {
      await apiRequest("/wallet/reconcile-paystack", { method: "POST", token }).catch(() => null);
      await onRefreshPortalData(token);
      setWalletState((current) => ({
        ...current,
        loading: false,
        message: { tone: "success", text: successText },
      }));
    } catch (error) {
      setWalletState((current) => ({
        ...current,
        loading: false,
        message: { tone: "error", text: error.message || "Unable to refresh wallet balance right now." },
      }));
    }
  }, [onRefreshPortalData, token]);

  useEffect(() => {
    setVirtualAccounts(initialAccounts);
  }, [user?.id, user?.virtualAccounts, user?.walletProfile?.accounts]);

  useEffect(() => {
    if (!token || FRONTEND_TEST_MODE) {
      return undefined;
    }

    let isMounted = true;
    setWalletState((current) => ({ ...current, loading: true, message: null }));

    apiRequest("/wallet/virtual-accounts", { token })
      .then(async (payload) => {
        if (!isMounted) return;
        setVirtualAccounts(payload.virtualAccounts || []);
        if (payload.user) {
          onUserUpdate?.(payload.user);
        }
        await onRefreshPortalData?.(token).catch(() => null);
        if (!isMounted) return;
        setWalletState((current) => ({ ...current, loading: false }));
      })
      .catch((error) => {
        if (!isMounted) return;
        setWalletState((current) => ({
          ...current,
          loading: false,
          message: { tone: "error", text: error.message || "Unable to load virtual account details right now." },
        }));
      });

    return () => {
      isMounted = false;
    };
  }, [onRefreshPortalData, onUserUpdate, token]);

  useEffect(() => {
    if (!token || FRONTEND_TEST_MODE || !onRefreshPortalData) {
      return undefined;
    }

    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") {
        onRefreshPortalData(token).catch(() => null);
      }
    };

    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [onRefreshPortalData, token]);

  const copyText = async (value) => {
    if (!value) return;
    try {
      let copied = false;
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(value);
          copied = true;
        } catch {
          copied = false;
        }
      }

      if (!copied) {
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.setAttribute("readonly", "readonly");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }
      setWalletState((current) => ({ ...current, copied: value }));
      onRefreshPortalData?.(token).catch(() => null);
      window.setTimeout(() => setWalletState((current) => ({ ...current, copied: "" })), 1800);
    } catch {
      setWalletState((current) => ({ ...current, message: { tone: "error", text: "Unable to copy this account number." } }));
    }
  };

  const downloadFundingReceipt = (account) => {
    const systemName = branding?.systemName || "IDM e-Services";
    const logoUrl = branding?.logoUrl || "/idmeservices-logo.svg";
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>${systemName} Funding Account</title><style>
      body{margin:0;background:#eef7f3;font-family:Inter,Arial,sans-serif;color:#10231c}
      .sheet{max-width:760px;margin:32px auto;background:white;border-radius:18px;overflow:hidden;box-shadow:0 24px 70px rgba(7,84,58,.16)}
      .head{background:linear-gradient(135deg,#063826,#08724e,#35c893);color:white;padding:28px 34px;display:flex;align-items:center;gap:18px}
      .logo{width:74px;height:74px;object-fit:contain;background:white;border-radius:16px;padding:8px}
      h1{margin:0;font-size:28px;line-height:1.15}.sub{margin:6px 0 0;color:rgba(255,255,255,.82)}
      .body{padding:32px 34px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
      .item{border:1px solid #d7ebe0;border-radius:14px;padding:16px;background:#f8fcfa}.item span{display:block;color:#60796f;font-size:12px;text-transform:uppercase;font-weight:800;margin-bottom:8px}.item strong{font-size:20px;color:#07543a}
      .number{grid-column:1/-1;background:#eefaf4;border-color:#a5ead0}.number strong{font-size:34px;letter-spacing:.08em}
      .foot{padding:20px 34px;background:#f3faf6;color:#60796f;font-size:13px;line-height:1.6}.badge{display:inline-block;padding:8px 12px;border-radius:999px;background:#dff7ea;color:#08724e;font-weight:800}
      @media print{body{background:white}.sheet{box-shadow:none;margin:0;max-width:none}}
    </style></head><body><main class="sheet"><section class="head"><img class="logo" src="${logoUrl}" alt=""><div><h1>Wallet Funding Account</h1><p class="sub">${systemName} secure payment reference</p></div></section><section class="body"><div class="grid"><div class="item number"><span>Account Number</span><strong>${account.accountNumber || "Pending"}</strong></div><div class="item"><span>Bank</span><strong>${account.bankName || account.providerSlug || "Paystack Bank"}</strong></div><div class="item"><span>Account Name</span><strong>${account.accountName || user?.name || systemName}</strong></div><div class="item"><span>Wallet Owner</span><strong>${user?.name || "Client"}</strong></div><div class="item"><span>Status</span><strong>${account.status || "pending"}</strong></div></div></section><section class="foot"><p><span class="badge">Important</span></p><p>Transfer only to this account to fund your ${systemName} wallet. Keep this receipt for your records. Generated ${new Date().toLocaleString()}.</p></section></main></body></html>`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${systemName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-funding-account.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const refreshVirtualAccounts = async () => {
    if (!token || FRONTEND_TEST_MODE) return;

    setWalletState((current) => ({ ...current, loading: true, message: null }));

    try {
      const payload = await apiRequest("/wallet/virtual-accounts", { method: "POST", token });
      setVirtualAccounts(payload.virtualAccounts || []);
      if (payload.user) {
        onUserUpdate?.(payload.user);
      }
      await apiRequest("/wallet/reconcile-paystack", { method: "POST", token }).catch(() => null);
      await onRefreshPortalData?.(token).catch(() => null);
      setWalletState((current) => ({
        ...current,
        loading: false,
        message: { tone: "success", text: "Payment account and wallet balance refreshed." },
      }));
    } catch (error) {
      setWalletState((current) => ({
        ...current,
        loading: false,
        message: { tone: "error", text: error.message || "Unable to refresh payment accounts right now." },
      }));
    }
  };

  const reconcilePaymentReference = async (event) => {
    event.preventDefault();

    const reference = paymentReference.trim();

    if (!reference || !token || FRONTEND_TEST_MODE) {
      setWalletState((current) => ({
        ...current,
        message: { tone: "error", text: "Enter your bank Session ID or Paystack reference first." },
      }));
      return;
    }

    setWalletState((current) => ({ ...current, loading: true, message: null }));

    try {
      const payload = await apiRequest("/wallet/reconcile-paystack/reference", {
        method: "POST",
        token,
        body: { reference },
      });
      if (payload.user) {
        onUserUpdate?.(payload.user);
      }
      await onRefreshPortalData?.(token).catch(() => null);
      setWalletState((current) => ({
        ...current,
        loading: false,
        message: { tone: payload.result?.credited || payload.result?.alreadyProcessed ? "success" : "info", text: payload.message || "Payment reference checked." },
      }));
    } catch (error) {
      setWalletState((current) => ({
        ...current,
        loading: false,
        message: { tone: "error", text: error.message || "Unable to check this payment reference right now." },
      }));
    }
  };

  const accountCards = virtualAccounts.filter((account) => account.accountNumber || account.status);

  return (
    <section className="wallet-funding-layout">
      <div className="panel wallet-payment-panel">
        <div className="wallet-payment-header">
          <div>
            <div className="section-banner">Your Payment Accounts</div>
            <p className="lede">Fund your wallet by transferring to your dedicated account number.</p>
          </div>
          <button type="button" className="wallet-refresh-button" onClick={refreshVirtualAccounts} disabled={walletState.loading || !token || FRONTEND_TEST_MODE} title="Refresh payment accounts">
            <RefreshCcw size={16} />
          </button>
        </div>
        <MessageBanner tone={walletState.message?.tone}>{walletState.message?.text}</MessageBanner>
        <div className="account-list payment-account-list">
          {accountCards.length ? accountCards.map((account) => {
            const isReady = account.accountNumber && account.status === "active";
            return (
              <article key={account.id || account.accountNumber || account.providerSlug} className={`payment-account-card ${isReady ? "payment-account-card--ready" : "payment-account-card--pending"}`}>
                <div className="payment-account-bank-mark"><Landmark size={22} /></div>
                <div className="payment-account-main">
                  <div className="payment-account-topline">
                    <h3>{account.bankName || account.providerSlug || "Paystack Bank"}</h3>
                    <span className={`pill ${isReady ? "pill-success" : account.status === "failed" ? "pill-danger" : "pill-warning"}`}>{account.status || "pending"}</span>
                  </div>
                  <div className="payment-account-number-row">
                    <strong>{account.accountNumber || "Account pending"}</strong>
                    {account.accountNumber ? (
                      <>
                        <button type="button" className="copy-badge copy-badge--icon" onClick={() => copyText(account.accountNumber)} title="Copy account number">
                          <Copy size={15} />
                          <span>{walletState.copied === account.accountNumber ? "Copied" : "Copy"}</span>
                        </button>
                        <button type="button" className="copy-badge copy-badge--icon copy-badge--receipt" onClick={() => downloadFundingReceipt(account)} title="Download funding receipt">
                          <Download size={15} />
                          <span>Receipt</span>
                        </button>
                      </>
                    ) : null}
                  </div>
                  <p>{account.accountName || account.customerName || user?.name || `${branding?.systemName || "IDM e-Services"} wallet`}</p>
                  {account.failureReason ? <small className="payment-account-error">{account.failureReason}</small> : null}
                </div>
              </article>
            );
          }) : (
            <div className="empty-state">{walletState.loading ? "Preparing your payment account..." : "Your payment account is being prepared. Use refresh to check again."}</div>
          )}
        </div>
        <div className="split">
          <button type="button" className="btn btn-secondary" onClick={() => refreshDashboardSnapshot()} disabled={walletState.loading || !token || FRONTEND_TEST_MODE}>Refresh balance</button>
        </div>
        <form className="wallet-reference-lookup" onSubmit={reconcilePaymentReference}>
          <label htmlFor="wallet-payment-reference">Bank Session ID or Paystack reference</label>
          <div className="wallet-reference-row">
            <input
              id="wallet-payment-reference"
              type="text"
              value={paymentReference}
              onChange={(event) => setPaymentReference(event.target.value)}
              placeholder="Paste the reference from your transfer receipt"
              disabled={walletState.loading || !token || FRONTEND_TEST_MODE}
            />
            <button type="submit" className="btn btn-primary" disabled={walletState.loading || !token || FRONTEND_TEST_MODE}>Confirm Payment</button>
          </div>
        </form>
        <div className="info-strip">A 1.5% transaction fee may apply. Minimum funding amount: {formatMoney(100)}.</div>
      </div>
      <div className="panel wallet-recent-panel">
        <div className="section-banner">Recent Transactions</div>
        <div className="deposit-list">{deposits.length ? deposits.slice(0, 5).map((deposit) => <div key={deposit.id} className="deposit-item"><div><strong>Deposit</strong><p>Via {deposit.reference}</p></div><div><strong className="money-positive">+{formatMoney(deposit.amount)}</strong><p>{formatDate(deposit.date)}</p></div></div>) : <div className="empty-state">No wallet credits have been recorded yet.</div>}</div>
        <div className="split"><button type="button" className="btn btn-secondary" onClick={() => navigate("/transactions")}>View all transactions</button></div>
      </div>
    </section>
  );
}

export function ApiDocsPage() {
  return <section className="panel panel-wide"><div className="section-banner">Public API Docs</div><div className="docs-grid">{publicApiDocs.map((item) => <article key={`${item.method}-${item.path}`} className="docs-card"><span className={`pill ${item.method === "GET" ? "pill-success" : ""}`}>{item.method}</span><code>{item.path}</code><p>{item.description}</p></article>)}</div></section>;
}

