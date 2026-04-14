import { formatCurrency, formatNumber } from '../lib/format'

function DepthColumn({ title, accentClass, rows, emptyText }) {
  const totalQuantity = rows.reduce((sum, row) => sum + row.quantity, 0)

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-semibold uppercase tracking-[0.22em] ${accentClass}`}>{title}</p>
          <p className="mt-2 text-sm text-slate-500">{rows.length ? `${rows.length} active levels` : emptyText}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-3 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Volume</p>
          <p className="mt-1 font-heading text-xl font-semibold text-slate-950">{formatNumber(totalQuantity)}</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {rows.length ? (
          rows.slice(0, 5).map((row) => (
            <div key={`${title}-${row.price}`} className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Price</p>
                  <p className="mt-1 font-heading text-2xl font-semibold text-slate-950">
                    {formatCurrency(row.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Qty</p>
                  <p className="mt-1 text-lg font-semibold text-slate-950">{formatNumber(row.quantity)}</p>
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                <div
                  className={`h-full rounded-full ${accentClass.includes('emerald') ? 'bg-emerald-400' : 'bg-rose-400'}`}
                  style={{ width: `${Math.min(100, row.quantity * 12)}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
            {emptyText}
          </div>
        )}
      </div>
    </div>
  )
}

export function MarketDepth({ bids, asks }) {
  const bestBid = bids[0]?.price ?? 0
  const bestAsk = asks[0]?.price ?? 0
  const spread = bestBid && bestAsk ? bestAsk - bestBid : 0

  return (
    <section className="dashboard-reveal rounded-[30px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur xl:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Live Orderbook</p>
          <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-slate-950">Market depth</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Depth updates from the in-memory book, with bids ranked high-to-low and asks low-to-high.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Best bid</p>
            <p className="mt-1 font-heading text-xl font-semibold text-slate-950">{formatCurrency(bestBid)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Best ask</p>
            <p className="mt-1 font-heading text-xl font-semibold text-slate-950">{formatCurrency(bestAsk)}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Spread</p>
            <p className="mt-1 font-heading text-xl font-semibold text-slate-950">{formatCurrency(spread)}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <DepthColumn
          title="Bids"
          accentClass="text-emerald-600"
          rows={bids}
          emptyText="No buy orders are resting on the book."
        />
        <DepthColumn
          title="Asks"
          accentClass="text-rose-600"
          rows={asks}
          emptyText="No sell orders are resting on the book."
        />
      </div>
    </section>
  )
}
