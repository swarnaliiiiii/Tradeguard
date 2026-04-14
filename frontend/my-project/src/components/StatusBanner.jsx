const toneStyles = {
  info: 'border-sky-200 bg-sky-50 text-sky-900',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  danger: 'border-rose-200 bg-rose-50 text-rose-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
}

export function StatusBanner({ banner }) {
  const toneClass = toneStyles[banner.tone] ?? toneStyles.info

  return (
    <div className={`rounded-[28px] border px-5 py-4 shadow-sm ${toneClass}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-heading text-lg font-semibold">{banner.title}</p>
          <p className="mt-1 text-sm leading-6 opacity-80">{banner.message}</p>
        </div>
        <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
          {banner.tone}
        </span>
      </div>
    </div>
  )
}
