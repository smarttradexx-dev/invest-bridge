import { getDictionary, translate } from "@/i18n";

import { formatUSD, normalizePhone } from "./format";
import type { Language, Order } from "./types";

/**
 * One-click WhatsApp quote delivery.
 *
 * Builds a localized, formatted message and a wa.me deep link that opens
 * WhatsApp with the text pre-filled.
 */

export interface QuoteMessageInput {
  order: Pick<
    Order,
    | "order_code"
    | "product_title"
    | "product_url"
    | "size"
    | "color"
    | "quantity"
    | "customer_name"
    | "phone"
    | "city"
    | "product_cost"
    | "shipping_cost"
    | "service_fee"
    | "net_profit"
    | "final_price"
  >;
  language: Language;
  trackUrl?: string;
}

export function buildQuoteMessage({ order, language, trackUrl }: QuoteMessageInput): string {
  const dictionary = getDictionary(language);
  const t = (path: string, values?: Record<string, string | number>) =>
    translate(dictionary, path, values);

  const lines: string[] = [];

  lines.push(t("whatsapp.greeting", { name: order.customer_name }));
  lines.push(`*${t("whatsapp.quoteTitle")}*`);
  lines.push("");
  lines.push(`${t("whatsapp.orderId")}: *${order.order_code}*`);

  if (order.product_title) {
    lines.push(`${t("whatsapp.product")}: ${order.product_title}`);
  }

  const variants = [
    order.size ? `${t("whatsapp.size")}: ${order.size}` : null,
    order.color ? `${t("whatsapp.color")}: ${order.color}` : null,
    `${t("whatsapp.quantity")}: ${order.quantity}`,
  ].filter(Boolean) as string[];
  if (variants.length) lines.push(variants.join(" · "));

  lines.push(`${t("whatsapp.link")}: ${order.product_url}`);
  lines.push("");
  lines.push(`*${t("whatsapp.breakdown")}*`);
  lines.push(`${t("whatsapp.productCost")}: ${formatUSD(order.product_cost)}`);
  lines.push(`${t("whatsapp.shipping")}: ${formatUSD(order.shipping_cost)}`);
  lines.push(`${t("whatsapp.serviceFee")}: ${formatUSD(order.service_fee)}`);
  lines.push(`*${t("whatsapp.total")}: ${formatUSD(order.final_price)}*`);
  lines.push("");
  lines.push(`*${t("whatsapp.paymentTitle")}*`);
  lines.push(t("whatsapp.paymentBody"));
  lines.push("");
  lines.push(t("whatsapp.batchNote"));
  if (trackUrl) lines.push(t("whatsapp.trackNote", { url: trackUrl }));
  lines.push("");
  lines.push(t("whatsapp.closing"));

  return lines.join("\n");
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const digits = normalizePhone(phone);
  const safeDigits = digits || "905000000000";
  return `https://wa.me/${safeDigits}?text=${encodeURIComponent(message)}`;
}

/** Full quote payload used by the admin panel's "Send quote" action. */
export function buildQuoteDelivery(input: QuoteMessageInput): {
  url: string;
  message: string;
} {
  const message = buildQuoteMessage(input);
  return {
    message,
    url: buildWhatsAppLink(input.order.phone, message),
  };
}
