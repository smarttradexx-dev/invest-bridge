import type { CSSProperties } from "react";

/**
 * Brand marks for the partner-store directory.
 *
 * Each store is rendered as an original geometric glyph plus a wordmark in
 * the brand's own colour — crisp at any size, with no external image
 * dependencies (and no broken logos if a CDN goes down).
 */

interface StoreLogoProps {
  logo: string;
  name: string;
  accent: string;
  className?: string;
  style?: CSSProperties;
}

function Glyph({
  logo,
  accent,
  name,
}: {
  logo: string;
  accent: string;
  name: string;
}) {
  const initial = name.trim().charAt(0).toUpperCase();

  const shapes: Record<string, React.ReactNode> = {
    trendyol: (
      <>
        <rect x="14" y="14" width="36" height="36" rx="12" fill={accent} />
        <path
          d="M24 26h8.5a7.5 7.5 0 0 1 0 15H24V26zm6.2 4.4v6.2h2.2a3.1 3.1 0 0 0 0-6.2h-2.2z"
          fill="#fff"
        />
      </>
    ),
    shein: (
      <>
        <circle cx="32" cy="32" r="18" fill={accent} />
        <path
          d="M39.6 24.6c-2-2.4-5.6-3.6-9-2.6-3.3 1-5.7 3.6-6.4 7-.5 2.6.3 5.4 2 7.4l2.2-1.5a7.2 7.2 0 0 1-1.6-5.4c.5-2.4 2.3-4.2 4.7-4.9 2.4-.7 4.9 0 6.3 1.8l1.8-1.8z"
          fill="#fff"
        />
        <path
          d="M24.4 39.4c2 2.4 5.6 3.6 9 2.6 3.3-1 5.7-3.6 6.4-7 .5-2.6-.3-5.4-2-7.4l-2.2 1.5a7.2 7.2 0 0 1 1.6 5.4c-.5 2.4-2.3 4.2-4.7 4.9-2.4.7-4.9 0-6.3-1.8l-1.8 1.8z"
          fill="#fff"
          opacity=".85"
        />
      </>
    ),
    zara: (
      <>
        <rect
          x="14.5"
          y="14.5"
          width="35"
          height="35"
          rx="2"
          fill="none"
          stroke={accent}
          strokeWidth="2.4"
        />
        <path d="M23 23h18v3.6L28.4 41H41v-3.6H23v-3.4l12.6-7.4H23V23z" fill={accent} />
      </>
    ),
    aliexpress: (
      <>
        <path d="M32 12 52 32 32 52 12 32 32 12z" fill={accent} />
        <path
          d="M32 21.5 41.5 32 32 42.5 22.5 32 32 21.5zm0 6.4L26.9 32 32 36.6 37.1 32 32 27.9z"
          fill="#fff"
        />
      </>
    ),
    lcwaikiki: (
      <>
        <circle
          cx="32"
          cy="32"
          r="18"
          fill="none"
          stroke={accent}
          strokeWidth="2.4"
        />
        <path
          d="M27 24v16h11v-3.4h-7.4V24H27z"
          fill={accent}
        />
      </>
    ),
  };

  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className="h-full w-full">
      {shapes[logo] ?? (
        <>
          <circle cx="32" cy="32" r="18" fill={accent} />
          <text
            x="32"
            y="40"
            textAnchor="middle"
            fill="#fff"
            fontSize="22"
            fontWeight="700"
            fontFamily="inherit"
          >
            {initial}
          </text>
        </>
      )}
    </svg>
  );
}

export function StoreLogo({ logo, name, accent, className = "", style }: StoreLogoProps) {
  const wordmark: Record<string, React.ReactNode> = {
    trendyol: (
      <span className="font-black tracking-[-0.02em] lowercase" style={{ color: accent }}>
        trendyol
      </span>
    ),
    shein: (
      <span className="font-semibold tracking-[-0.01em] lowercase" style={{ color: accent }}>
        shein
      </span>
    ),
    zara: (
      <span
        className="font-display font-semibold tracking-[0.28em] uppercase"
        style={{ color: accent }}
      >
        zara
      </span>
    ),
    aliexpress: (
      <span className="font-bold tracking-[-0.01em]" style={{ color: accent }}>
        Ali<span className="font-extrabold">Express</span>
      </span>
    ),
    lcwaikiki: (
      <span
        className="font-bold tracking-[0.12em] uppercase text-[0.8rem]"
        style={{ color: accent }}
      >
        LC Waikiki
      </span>
    ),
  };

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`} style={style}>
      <span className="h-8 w-8 shrink-0">
        <Glyph logo={logo} accent={accent} name={name} />
      </span>
      <span className="leading-none">
        {wordmark[logo] ?? (
          <span className="font-semibold" style={{ color: accent }}>
            {name}
          </span>
        )}
      </span>
    </span>
  );
}

/** Compact square glyph only — used in dense admin tables. */
export function StoreGlyph({
  logo,
  accent,
  name,
  className = "h-7 w-7",
}: {
  logo: string;
  accent: string;
  name: string;
  className?: string;
}) {
  return (
    <span className={`inline-block shrink-0 ${className}`}>
      <Glyph logo={logo} accent={accent} name={name} />
    </span>
  );
}
