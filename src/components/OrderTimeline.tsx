import { getDictionary, translate } from "@/i18n";

import type { Language, OrderStatus } from "@/lib/types";
import { TRACKING_FLOW } from "@/lib/types";

/**
 * Seven-step fulfilment timeline shown to customers on the tracking page.
 */
export function OrderTimeline({
  status,
  language,
}: {
  status: OrderStatus;
  language: Language;
}) {
  const dictionary = getDictionary(language);
  const cancelled = status === "cancelled";
  const currentIndex = TRACKING_FLOW.indexOf(status);

  if (cancelled) {
    return (
      <div className="rounded-2xl border border-danger/25 bg-danger-soft/60 p-5">
        <p className="text-sm font-semibold text-danger">
          {translate(dictionary, "status.cancelled")}
        </p>
        <p className="mt-1 text-sm text-obsidian-600">
          {translate(dictionary, "track.needHelp")}
        </p>
      </div>
    );
  }

  return (
    <ol className="relative space-y-0">
      {TRACKING_FLOW.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        const isLast = index === TRACKING_FLOW.length - 1;

        return (
          <li key={step} className="relative flex gap-4 pb-7 last:pb-0">
            {!isLast && (
              <span
                aria-hidden="true"
                className={`absolute top-7 h-full w-px ${
                  done ? "bg-gold-400/70" : "bg-obsidian-900/12"
                }`}
                style={{ insetInlineStart: "0.8125rem" }}
              />
            )}

            <span
              aria-hidden="true"
              className={`relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full ring-4 ring-alabaster transition-colors duration-500 ${
                done
                  ? "bg-gold-400 text-obsidian-950"
                  : active
                    ? "bg-obsidian-900 text-gold-300 animate-pulse-dot"
                    : "bg-obsidian-900/8 text-slate-mid"
              }`}
            >
              {done ? (
                <svg
                  viewBox="0 0 24 24"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="m5 13 4 4L19 7" />
                </svg>
              ) : (
                <span className="text-[0.65rem] font-bold">{index + 1}</span>
              )}
            </span>

            <span className="pt-1">
              <span
                className={`block text-sm font-semibold transition-colors duration-500 ${
                  done || active ? "text-obsidian-900" : "text-slate-mid/70"
                }`}
              >
                {translate(dictionary, `status.${step}`)}
              </span>
              {active && (
                <span className="mt-1 inline-block rounded-full bg-gold-400/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-gold-600">
                  ●
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
