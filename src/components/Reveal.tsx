"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Scroll-reveal wrapper — adds a soft fade-up as the element enters the
 * viewport. Purely decorative, so it degrades to "always visible" when
 * IntersectionObserver is unavailable.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "li" | "article";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let observer: IntersectionObserver | undefined;

    // The CSS `.js` guard keeps content visible when JS is unavailable; with
    // JS but no IntersectionObserver (very old browsers) the safety timeout
    // below reveals the section instead.
    if (typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setVisible(true);
              observer?.disconnect();
            }
          }
        },
        { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
      );
      observer.observe(node);
    }

    // Safety net: never leave content hidden if the observer misbehaves.
    const fallback = window.setTimeout(() => setVisible(true), 2500);

    return () => {
      observer?.disconnect();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <Tag
      ref={ref as never}
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </Tag>
  );
}
