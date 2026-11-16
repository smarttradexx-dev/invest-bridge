"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useI18n } from "@/i18n/I18nProvider";
import { SYRIAN_CITIES } from "@/lib/types";

interface OgData {
  title: string | null;
  image: string | null;
  siteName: string | null;
  price: string | null;
  description: string | null;
  url: string;
}

type PreviewState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; data: OgData }
  | { status: "failed" };

const URL_PATTERN = /^https?:\/\/[^\s]+\.[^\s]{2,}$/i;

export function OrderByLinkForm() {
  const { t, language } = useI18n();

  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<PreviewState>({ status: "idle" });
  const [manualTitle, setManualTitle] = useState("");

  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderCode, setOrderCode] = useState<string | null>(null);

  const requestId = useRef(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* --------------------- auto preview engine --------------------- */

  const runPreview = useCallback(async (target: string) => {
    const id = ++requestId.current;
    setPreview({ status: "loading" });

    try {
      const response = await fetch(`/api/fetch-meta?url=${encodeURIComponent(target)}`);
      const payload = (await response.json()) as {
        ok: boolean;
        data: OgData | null;
      };

      if (id !== requestId.current) return; // a newer request superseded this one

      if (payload.ok && payload.data) {
        setPreview({ status: "ready", data: payload.data });
        if (payload.data.title) setManualTitle("");
      } else {
        setPreview({ status: "failed" });
      }
    } catch {
      if (id !== requestId.current) return;
      setPreview({ status: "failed" });
    }
  }, []);

  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    const trimmed = url.trim();
    if (!URL_PATTERN.test(trimmed)) {
      // Nothing to preview — the rendered state is derived from the URL below,
      // so there is no state to reset here.
      return;
    }

    debounceTimer.current = setTimeout(() => {
      void runPreview(trimmed);
    }, 650);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [url, runPreview]);

  /* --------------------------- helpers --------------------------- */

  /**
   * The preview panel is only meaningful while the field holds a valid URL.
   * Deriving it here (instead of resetting state in an effect) keeps the
   * "idle" state accurate without an extra render pass.
   */
  const activePreview: PreviewState = URL_PATTERN.test(url.trim())
    ? preview
    : { status: "idle" };

  const cityName = useMemo(
    () => (city: (typeof SYRIAN_CITIES)[number]) =>
      language === "ar" ? city.ar : language === "tr" ? city.tr : city.en,
    [language],
  );

  const detectedTitle =
    activePreview.status === "ready" ? activePreview.data.title : null;
  const productTitle = detectedTitle ?? (manualTitle.trim() || null);

  const validate = () => {
    const next: Record<string, string> = {};
    if (!url.trim()) next.url = t("form.errors.urlRequired");
    else if (!URL_PATTERN.test(url.trim())) next.url = t("form.errors.urlInvalid");
    if (!customerName.trim()) next.customerName = t("form.errors.nameRequired");
    if (!phone.trim()) next.phone = t("form.errors.phoneRequired");
    else if (phone.replace(/\D/g, "").length < 8) next.phone = t("form.errors.phoneInvalid");
    if (!city) next.city = t("form.errors.cityRequired");
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty < 1) next.quantity = t("form.errors.quantityInvalid");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productUrl: url.trim(),
          productTitle: productTitle,
          productImage: activePreview.status === "ready" ? activePreview.data.image : null,
          productPrice:
            activePreview.status === "ready" && activePreview.data.price
              ? Number(activePreview.data.price)
              : null,
          size: size.trim() || null,
          color: color.trim() || null,
          quantity: Number(quantity),
          customerName: customerName.trim(),
          phone: phone.trim(),
          city,
          address: address.trim() || null,
          notes: notes.trim() || null,
          language,
        }),
      });

      const payload = (await response.json()) as {
        ok: boolean;
        order?: { order_code: string };
      };

      if (!response.ok || !payload.ok || !payload.order) {
        setSubmitError(t("form.errors.generic"));
        return;
      }

      setOrderCode(payload.order.order_code);
    } catch {
      setSubmitError(t("form.errors.generic"));
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setOrderCode(null);
    setUrl("");
    setPreview({ status: "idle" });
    setManualTitle("");
    setSize("");
    setColor("");
    setQuantity("1");
    setCustomerName("");
    setPhone("");
    setCity("");
    setAddress("");
    setNotes("");
    setErrors({});
    setSubmitError(null);
  };

  /* --------------------------- success --------------------------- */

  if (orderCode) {
    return (
      <div className="card-luxe overflow-hidden p-7 text-center sm:p-10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success-soft">
          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8 text-success"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m5 13 4 4L19 7" />
          </svg>
        </div>

        <h3 className="mt-5 font-display text-2xl font-semibold text-obsidian-900">
          {t("form.success.title")}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-obsidian-600">
          {t("form.success.body")}
        </p>

        <div className="mx-auto mt-6 inline-flex flex-col items-center gap-1 rounded-2xl border border-dashed border-gold-400/60 bg-gold-400/8 px-8 py-4">
          <span className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-gold-600">
            {t("form.success.orderId")}
          </span>
          <span className="font-mono text-xl font-semibold tracking-wider text-obsidian-900" dir="ltr">
            {orderCode}
          </span>
        </div>

        <p className="mx-auto mt-5 max-w-md text-xs text-slate-mid">{t("form.success.note")}</p>
        <p className="mx-auto mt-1 max-w-md text-xs text-slate-mid">
          {t("form.success.whatsappNote")}
        </p>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <a href="/track" className="btn btn-obsidian px-6 py-3 text-sm">
            {t("nav.track")}
          </a>
          <button type="button" onClick={reset} className="btn btn-ghost px-6 py-3 text-sm">
            {t("form.success.another")}
          </button>
        </div>
      </div>
    );
  }

  /* ----------------------------- form ----------------------------- */

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* ----------------------- product link ----------------------- */}
      <div>
        <label className="label" htmlFor="product-url">
          {t("form.fields.url")}
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 start-3.5 grid place-items-center text-slate-mid/70">
            <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.1 1.1" />
              <path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.1-1.1" />
            </svg>
          </span>
          <input
            id="product-url"
            type="url"
            dir="ltr"
            inputMode="url"
            autoComplete="off"
            className="field ps-11 text-start"
            placeholder={t("form.fields.urlPlaceholder")}
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            aria-invalid={errors.url ? "true" : "false"}
            aria-describedby={errors.url ? "url-error" : undefined}
          />
        </div>
        {errors.url && (
          <p id="url-error" className="mt-1.5 text-xs font-medium text-danger">
            {errors.url}
          </p>
        )}
      </div>

      {/* ------------------------ preview card ----------------------- */}
      {activePreview.status !== "idle" && (
        <div className="animate-fade-up overflow-hidden rounded-2xl border border-obsidian-900/8 bg-mist/60">
          <div className="flex items-center justify-between border-b border-obsidian-900/6 px-4 py-2.5">
            <span className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-slate-mid">
              {t("form.preview.title")}
            </span>
            {activePreview.status === "ready" && (
              <span className="inline-flex items-center gap-1.5 text-[0.68rem] font-semibold text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                {t("form.preview.detected")}
              </span>
            )}
          </div>

          {activePreview.status === "loading" && (
            <div className="flex items-center gap-4 p-4">
              <div className="skeleton h-20 w-20 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2.5">
                <div className="skeleton h-3.5 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
              <span className="shrink-0 text-xs text-slate-mid">{t("form.preview.detecting")}</span>
            </div>
          )}

          {activePreview.status === "failed" && (
            <div className="p-4">
              <p className="text-sm font-medium text-obsidian-800">
                {t("form.preview.failed")}
              </p>
              <p className="mt-1 text-xs text-slate-mid">{t("form.preview.failedHint")}</p>
              <div className="mt-3">
                <label className="label" htmlFor="manual-title">
                  {t("form.preview.manualTitle")}
                </label>
                <input
                  id="manual-title"
                  type="text"
                  className="field"
                  placeholder={t("form.preview.manualTitlePlaceholder")}
                  value={manualTitle}
                  onChange={(event) => setManualTitle(event.target.value)}
                />
              </div>
            </div>
          )}

          {activePreview.status === "ready" && (
            <div className="flex flex-col gap-4 p-4 sm:flex-row">
              <div className="h-28 w-full shrink-0 overflow-hidden rounded-xl border border-obsidian-900/8 bg-white sm:h-24 sm:w-24">
                {activePreview.data.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activePreview.data.image}
                    alt={activePreview.data.title ?? t("form.preview.title")}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-contain"
                    onError={(event) => {
                      (event.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <span className="grid h-full w-full place-items-center text-xs text-slate-mid">
                    {t("form.preview.noImage")}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="line-clamp-3 text-sm font-semibold leading-snug text-obsidian-900">
                  {activePreview.data.title ?? t("form.preview.noImage")}
                </p>
                {activePreview.data.siteName && (
                  <p className="mt-1 text-xs text-slate-mid">{activePreview.data.siteName}</p>
                )}
                {activePreview.data.description && (
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-obsidian-600">
                    {activePreview.data.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------ product spec ----------------------- */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="size">
            {t("form.fields.size")}
          </label>
          <input
            id="size"
            type="text"
            className="field"
            placeholder={t("form.fields.sizePlaceholder")}
            value={size}
            onChange={(event) => setSize(event.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="color">
            {t("form.fields.color")}
          </label>
          <input
            id="color"
            type="text"
            className="field"
            placeholder={t("form.fields.colorPlaceholder")}
            value={color}
            onChange={(event) => setColor(event.target.value)}
          />
        </div>

        <div>
          <label className="label" htmlFor="quantity">
            {t("form.fields.quantity")}
          </label>
          <input
            id="quantity"
            type="number"
            min={1}
            max={50}
            dir="ltr"
            className="field text-start"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            aria-invalid={errors.quantity ? "true" : "false"}
          />
          {errors.quantity && (
            <p className="mt-1.5 text-xs font-medium text-danger">{errors.quantity}</p>
          )}
        </div>
      </div>

      {/* ------------------------ customer info ---------------------- */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="customer-name">
            {t("form.fields.name")}
          </label>
          <input
            id="customer-name"
            type="text"
            autoComplete="name"
            className="field"
            placeholder={t("form.fields.namePlaceholder")}
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            aria-invalid={errors.customerName ? "true" : "false"}
          />
          {errors.customerName && (
            <p className="mt-1.5 text-xs font-medium text-danger">{errors.customerName}</p>
          )}
        </div>

        <div>
          <label className="label" htmlFor="phone">
            {t("form.fields.phone")}
          </label>
          <input
            id="phone"
            type="tel"
            dir="ltr"
            autoComplete="tel"
            className="field text-start"
            placeholder={t("form.fields.phonePlaceholder")}
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            aria-invalid={errors.phone ? "true" : "false"}
          />
          {errors.phone && (
            <p className="mt-1.5 text-xs font-medium text-danger">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="label" htmlFor="city">
            {t("form.fields.city")}
          </label>
          <div className="relative">
            <select
              id="city"
              className="field appearance-none pe-10"
              value={city}
              onChange={(event) => setCity(event.target.value)}
              aria-invalid={errors.city ? "true" : "false"}
            >
              <option value="">{t("form.fields.cityPlaceholder")}</option>
              {SYRIAN_CITIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {cityName(item)}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute inset-y-0 end-3.5 grid place-items-center text-slate-mid">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </span>
          </div>
          {errors.city && (
            <p className="mt-1.5 text-xs font-medium text-danger">{errors.city}</p>
          )}
        </div>

        <div>
          <label className="label" htmlFor="address">
            {t("form.fields.address")}{" "}
            <span className="font-normal text-slate-mid/70">({t("common.optional")})</span>
          </label>
          <input
            id="address"
            type="text"
            className="field"
            placeholder={t("form.fields.addressPlaceholder")}
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="notes">
          {t("form.fields.notes")}{" "}
          <span className="font-normal text-slate-mid/70">({t("common.optional")})</span>
        </label>
        <textarea
          id="notes"
          rows={3}
          className="field resize-y"
          placeholder={t("form.fields.notesPlaceholder")}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
        />
      </div>

      {submitError && (
        <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn btn-gold w-full px-7 py-4 text-base"
      >
        {submitting ? (
          <>
            <svg viewBox="0 0 24 24" className="h-4 w-4 animate-spin" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity=".25" />
              <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            {t("form.submitting")}
          </>
        ) : (
          <>
            {t("form.submit")}
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 rtl:-scale-x-100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </>
        )}
      </button>
    </form>
  );
}
