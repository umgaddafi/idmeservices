import React, { useEffect, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const AUTOPLAY_INTERVAL = 4000;

export default function TestimonialCarousel({ testimonials = [] }) {
  const rootRef = useRef(null);
  const [reducedMotion, setReducedMotion] = useState(() => typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  const [viewportRef, carousel] = useEmblaCarousel({
    align: "start",
    loop: true,
    slidesToScroll: 1,
    duration: 35,
  });
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => typeof document === "undefined" || !document.hidden);
  const count = testimonials.length;

  // Extra visual copies give Embla enough slides to loop with three cards visible.
  // Only the original set is exposed to assistive technology.
  const slides = count > 1 ? [...testimonials, ...testimonials, ...testimonials] : testimonials;
  const autoplayEnabled = count > 1 && reducedMotion === false;
  const autoplayRunning = autoplayEnabled && !hovered && !focused && !dragging && visible && pageVisible;

  useEffect(() => {
    const handleVisibility = () => setPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", handleVisibility);
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionPreference = () => setReducedMotion(motionPreference.matches);
    handleMotionPreference();
    motionPreference.addEventListener("change", handleMotionPreference);

    const element = rootRef.current;
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setHasEntered(true);
      },
      { threshold: 0.15 },
    );
    if (element && observer) observer.observe(element);
    else {
      setVisible(true);
      setHasEntered(true);
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      motionPreference.removeEventListener("change", handleMotionPreference);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!carousel) return undefined;

    const handlePointerDown = () => setDragging(true);
    const handlePointerUp = () => setDragging(false);
    carousel.on("pointerDown", handlePointerDown);
    carousel.on("pointerUp", handlePointerUp);

    return () => {
      carousel.off("pointerDown", handlePointerDown);
      carousel.off("pointerUp", handlePointerUp);
    };
  }, [carousel]);

  useEffect(() => {
    if (!carousel || !autoplayRunning) return undefined;
    const timer = window.setInterval(() => carousel.scrollNext(), AUTOPLAY_INTERVAL);
    return () => window.clearInterval(timer);
  }, [carousel, autoplayRunning]);

  if (!count) return null;

  return (
    <div
      ref={rootRef}
      dir="ltr"
      className="mt-12 min-w-0"
      role="region"
      aria-roledescription="carousel"
      aria-label="Client testimonials"
      onPointerEnter={(event) => {
        if (event.pointerType !== "touch") setHovered(true);
      }}
      onPointerLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <div ref={viewportRef} className="overflow-hidden rounded-[1.6rem]">
        <div className="flex touch-pan-y gap-4" aria-live="off">
          {slides.map((testimonial, index) => {
            const originalIndex = index % count;
            const featured = originalIndex === 1;
            const duplicate = index >= count;
            return (
              <div
                key={`${testimonial.name}-${index}`}
                className="min-w-0 flex-[0_0_88%] sm:flex-[0_0_calc((100%-1rem)/2)] lg:flex-[0_0_calc((100%-2rem)/3)]"
                role={duplicate ? undefined : "group"}
                aria-roledescription={duplicate ? undefined : "slide"}
                aria-label={duplicate ? undefined : `${originalIndex + 1} of ${count}`}
                aria-hidden={duplicate ? true : undefined}
              >
                <motion.article
                  initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                  animate={reducedMotion || hasEntered ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
                  transition={{ duration: reducedMotion ? 0 : 0.5, delay: reducedMotion ? 0 : Math.min(originalIndex, 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
                  className={`flex h-full min-h-[19rem] flex-col rounded-[1.6rem] border p-6 sm:p-7 ${featured ? "border-emerald-900 bg-[#0b2119] text-white" : "border-[#dfe6df] bg-white text-[#11271f]"}`}
                >
                  <Quote className={`h-7 w-7 shrink-0 ${featured ? "text-[#b8f34a]" : "text-emerald-700"}`} strokeWidth={1.7} aria-hidden="true" />
                  <blockquote className={`mb-0 mt-8 font-['Outfit'] text-[1.2rem] font-medium leading-8 tracking-[-0.02em] sm:text-[1.35rem] ${featured ? "text-white" : "text-[#183229]"}`}>
                    “{testimonial.quote}”
                  </blockquote>
                  <div className="mt-auto pt-8">
                    <p className={`m-0 text-sm font-extrabold ${featured ? "text-white" : "text-[#173027]"}`}>{testimonial.name}</p>
                    <p className={`mb-0 mt-1 text-xs ${featured ? "text-white/70" : "text-slate-500"}`}>{testimonial.detail}</p>
                  </div>
                </motion.article>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
