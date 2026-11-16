import { StoreGlyph } from "./StoreLogo";

/**
 * Product thumbnail with a graceful branded placeholder.
 * Retailer preview images can be blocked, slow or missing — the placeholder
 * keeps the layout stable and still looks intentional.
 */
export function ProductThumb({
  image,
  title,
  logo,
  accent,
  name,
  className = "h-16 w-16",
  rounded = "rounded-xl",
}: {
  image?: string | null;
  title?: string | null;
  logo?: string;
  accent?: string;
  name?: string;
  className?: string;
  rounded?: string;
}) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={title ?? "product"}
        loading="lazy"
        referrerPolicy="no-referrer"
        className={`${className} ${rounded} border border-obsidian-900/8 bg-white object-contain`}
      />
    );
  }

  return (
    <span
      className={`${className} ${rounded} grid place-items-center border border-obsidian-900/8 bg-gradient-to-br from-white to-mist`}
      aria-label={title ?? "product preview unavailable"}
      role="img"
    >
      {logo && accent && name ? (
        <StoreGlyph logo={logo} accent={accent} name={name} className="h-7 w-7" />
      ) : (
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6 text-slate-mid/60"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
          aria-hidden="true"
        >
          <path d="M6 7h12l1 13H5L6 7Z" />
          <path d="M9 7a3 3 0 0 1 6 0" />
        </svg>
      )}
    </span>
  );
}
