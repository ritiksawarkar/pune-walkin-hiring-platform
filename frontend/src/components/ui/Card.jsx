export function Card({
  children,
  className = "",
  header,
  footer,
  title,
  subtitle,
  actions,
  padding = "p-6",
}) {
  return (
    <div
      className={`rounded-xl border border-slate-200/90 bg-white shadow-xs transition-shadow ${className}`}
    >
      {(header || title) && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 px-6 py-4">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            )}
            {subtitle && (
              <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
            )}
            {header}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}

      <div className={padding}>{children}</div>

      {footer && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-3 rounded-b-xl">
          {footer}
        </div>
      )}
    </div>
  );
}
