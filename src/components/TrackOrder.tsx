"use client";

import { useState } from "react";

import { useI18n } from "@/i18n/I18nProvider";
import { formatDate, formatUSD } from "@/lib/format";
import type { OrderStatus } from "@/lib/types";

import { OrderTimeline } from "@/components/OrderTimeline";
import { ProductThumb } from "@/components/ProductThumb";
import { StatusBadge } from "@/components/StatusBadge";

interface TrackedOrder {
  order_code: string;
  status: OrderStatus;
  product_title: string | null;
  product_image: string | null;
  product_url: string;
  size: string | null;
  color: string | null;
  quantity: number;
  city: string;
  customer_name: string;
  final_price: number | null;
  created_at: string;
  quote_sent_at: string | null;
  paid_at: string | null;
}

export function TrackOrder() {
  const { t, language } = useI18n();
  const [reference, setReference] = useState("");
  const [orders, setOrders] = useState<TrackedOrder[] | null>(null);
  const [selected, setSelected] = useState<TrackedOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const search = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = reference.trim();
    if (!value) return;

    setLoading(true);
    setNotFound(false);
    setSelected(null);

    try {
      const response = await fetch(`/api/orders?reference=${encodeURIComponent(value)}`);
      const payload = (await response.json()) as { ok: boolean; orders?: TrackedOrder[] };

      if (!payload.ok || !payload.orders || payload.orders.length === 0) {
        setOrders([]);
        setNotFound(true);
      } else {
        setOrders(payload.orders);
        setSelected(payload.orders.length === 1 ? payload.orders[0] : null);
      }
    } catch {
      setOrders([]);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* ------------------------------ search ------------------------------ */}
      <div className="lg:col-span-5">
        <div className="card-luxe p-6 sm:p-7">
          <form onSubmit={search} noValidate>
            <label className="label" htmlFor="track-reference">
              {t("track.inputLabel")}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 start-3.5 grid place-items-center text-slate-mid/70">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <circle cx="11" cy="11" r="6.5" />
                  <path d="m16 16 4.5 4.5" strokeLinecap="round" />
                </svg>
              </span>
              <input
                id="track-reference"
                type="text"
                dir="ltr"
                autoComplete="off"
                className="field ps-11 text-start"
                placeholder={t("track.inputPlaceholder")}
                value={reference}
                onChange={(event) => setReference(event.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-obsidian mt-4 w-full px-6 py-3 text-sm"
            >
              {loading ? t("track.searching") : t("track.submit")}
            </button>
          </form>

          {notFound && (
            <div className="animate-fade-up mt-5 rounded-xl bg-warning-soft px-4 py-3.5">
              <p className="text-sm font-semibold text-warning">{t("track.notFound")}</p>
              <p className="mt-1 text-xs text-obsidian-600">{t("track.notFoundHint")}</p>
            </div>
          )}

          {orders && orders.length > 1 && (
            <div className="mt-5">
              <p className="text-xs text-slate-mid">
                {t("track.multiple", { count: orders.length })}
              </p>
              <ul className="mt-3 space-y-2">
                {orders.map((order) => (
                  <li key={order.order_code}>
                    <button
                      type="button"
                      onClick={() => setSelected(order)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-start transition-colors ${
                        selected?.order_code === order.order_code
                          ? "border-gold-400 bg-gold-400/8"
                          : "border-obsidian-900/10 bg-white hover:border-gold-400/40"
                      }`}
                    >
                      <span>
                        <span className="block font-mono text-xs font-bold text-obsidian-900" dir="ltr">
                          {order.order_code}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-slate-mid">
                          {order.product_title ?? t("form.preview.noImage")}
                        </span>
                      </span>
                      <StatusBadge status={order.status} language={language} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ------------------------------ result ------------------------------ */}
      <div className="lg:col-span-7">
        {selected ? (
          <OrderDetail order={selected} />
        ) : (
          <div className="card-luxe flex h-full min-h-[18rem] flex-col items-center justify-center p-10 text-center">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gold-400/12 text-gold-600">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                <path d="M3 8h11v8H3zM14 11h4l3 3v2h-7zM7 19a1.8 1.8 0 1 0 0-3.6A1.8 1.8 0 0 0 7 19Zm11 0a1.8 1.8 0 1 0 0-3.6A1.8 1.8 0 0 0 18 19Z" />
              </svg>
            </span>
            <p className="mt-4 max-w-xs text-sm text-slate-mid">{t("track.subtitle")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderDetail({ order }: { order: TrackedOrder }) {
  const { t, language } = useI18n();

  const rows = [
    { label: t("track.product"), value: order.product_title ?? "—" },
    { label: t("track.size"), value: order.size ?? "—" },
    { label: t("track.color"), value: order.color ?? "—" },
    { label: t("track.quantity"), value: String(order.quantity) },
    { label: t("track.city"), value: order.city },
    { label: t("track.orderDate"), value: formatDate(order.created_at, language) },
  ];

  return (
    <div className="card-luxe overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-obsidian-900/7 bg-mist/50 px-6 py-5">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-mid">
            {t("track.orderSummary")}
          </p>
          <p className="mt-1 font-mono text-base font-bold text-obsidian-900" dir="ltr">
            {order.order_code}
          </p>
        </div>
        <StatusBadge status={order.status} language={language} />
      </div>

      <div className="grid gap-6 p-6 sm:grid-cols-12">
        <div className="sm:col-span-7">
          <div className="flex items-start gap-4">
            <ProductThumb
              image={order.product_image}
              title={order.product_title ?? order.order_code}
              className="h-24 w-24 shrink-0"
              rounded="rounded-2xl"
            />
            <dl className="min-w-0 flex-1 space-y-2">
              {rows.map((row) => (
                <div key={row.label} className="flex justify-between gap-4 text-sm">
                  <dt className="shrink-0 text-slate-mid">{row.label}</dt>
                  <dd className="truncate text-end font-medium text-obsidian-900">
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-5 flex items-center justify-between rounded-xl bg-obsidian-900 px-5 py-4">
            <span className="text-sm font-semibold text-alabaster">{t("track.finalPrice")}</span>
            <span className="font-display text-2xl font-semibold text-gold-300">
              {formatUSD(order.final_price)}
            </span>
          </div>

          <a
            href={order.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost mt-4 w-full justify-between px-5 py-2.5 text-xs"
          >
            {t("common.openLink")}
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 rtl:-scale-x-100" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M7 17 17 7M8 7h9v9" />
            </svg>
          </a>
        </div>

        <div className="sm:col-span-5">
          <h3 className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-slate-mid">
            {t("track.timeline")}
          </h3>
          <div className="mt-4">
            <OrderTimeline status={order.status} language={language} />
          </div>
        </div>
      </div>
    </div>
  );
}
