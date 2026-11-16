import { getDictionary, translate } from "@/i18n";

import type { Language, OrderStatus } from "@/lib/types";

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending_quote: "bg-info-soft text-info ring-info/20",
  quoted: "bg-warning-soft text-warning ring-warning/20",
  awaiting_payment: "bg-warning-soft text-warning ring-warning/20",
  paid: "bg-success-soft text-success ring-success/20",
  shipped_turkey: "bg-gold-100 text-gold-600 ring-gold-400/30",
  arrived_syria: "bg-gold-100 text-gold-600 ring-gold-400/30",
  delivered: "bg-obsidian-900 text-gold-300 ring-obsidian-900/10",
  cancelled: "bg-danger-soft text-danger ring-danger/20",
};

/** Localized label for an order status. */
export function statusLabel(status: OrderStatus, language: Language): string {
  return translate(getDictionary(language), `status.${status}`);
}

export function StatusBadge({
  status,
  language,
  className = "",
}: {
  status: OrderStatus;
  language: Language;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ring-1 ring-inset ${STATUS_STYLES[status]} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {statusLabel(status, language)}
    </span>
  );
}
