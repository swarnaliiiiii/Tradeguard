import { formatCurrency, formatNumber, formatTimestamp } from '../lib/format'

function statusTone(ok) {
  return ok
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border-amber-200 bg-amber-50 text-amber-700'
}

export function RightPanel({ account, systemStatus, banner, entries, lastUpdated }) {
  const checks = [
    { label: 'Gate', ok: systemStatus.ok, value: systemStatus.label },
    { label: 'Book', ok: true, value: 'Streaming' },
    { label: 'Audit', ok: true, value: 'Persisting' },
  ]

  return (
    <aside className="border-t border-slate-200/80 bg-[#f7fbfd]/80 p-5 backdrop-blur xl:border-t-0 xl:border-l xl:p-6">
      <div className="space-y-5">
        <div className="rounded-[30px] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-5 text-white shadow-[0_28px_60px_rgba(8,15,32,0.35)]">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-200">Portfolio</p>
          <p className="mt-3 font-heading text-4xl font-semibold tracking-tight">
            {formatCurrency(account.balanceUsd)}
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-2xl bg-white/8 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/80">Shares held</p>
              <p className="mt-2 text-xl font-semibold">{formatNumber(account.shares)}</p>
            </div>
            <div className="rounded-2xl bg-white/8 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100/80">Last sync</p>
              <p className="mt-2 text-base font-semibold">{formatTimestamp(lastUpdated)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-heading text-xl font-semibold text-slate-950">Service checks</p>
          <div className="mt-4 space-y-3">
            {checks.map((check) => (
              <div key={check.label} className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${statusTone(check.ok)}`}>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em]">{check.label}</p>
                  <p className="mt-1 text-sm opacity-80">{check.value}</p>
                </div>
                <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]">
                  {check.ok ? 'ok' : 'warn'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="font-heading text-xl font-semibold text-slate-950">Latest feedback</p>
          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">{banner.title}</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{banner.message}</p>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="font-heading text-xl font-semibold text-slate-950">Recent activity</p>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Last 4
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {entries.length ? (
              entries.slice(0, 4).map((entry) => (
                <div key={`activity-${entry.id}`} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {entry.side.toUpperCase()} {entry.qty} {entry.ticker}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
                        {formatTimestamp(entry.timestamp)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${
                        entry.status === 'APPROVED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {entry.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    {entry.reason || `${formatCurrency(entry.trade_value_usd)} routed successfully.`}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                Activity cards will appear after the first order attempt.
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
