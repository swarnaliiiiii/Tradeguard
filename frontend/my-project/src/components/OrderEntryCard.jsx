import { formatCurrency, formatNumber } from '../lib/format'

function sideLabel(side) {
  return side === 'bid' ? 'Buy' : 'Sell'
}

export function OrderEntryCard({
  form,
  onFieldChange,
  onSideChange,
  onSubmit,
  isSubmitting,
  account,
}) {
  const price = Number(form.price)
  const quantity = Number(form.qty)
  const notional = Number.isFinite(price) && Number.isFinite(quantity) ? price * quantity : 0

  return (
    <section className="dashboard-reveal rounded-[30px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur xl:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Order Entry</p>
            <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-slate-950">
              Route a guarded order
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Every ticket is validated before it updates balances, the in-memory book, and the persisted audit trail.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Available cash</p>
              <p className="mt-2 font-heading text-2xl font-semibold text-slate-950">
                {formatCurrency(account.balanceUsd)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Position</p>
              <p className="mt-2 font-heading text-2xl font-semibold text-slate-950">
                {formatNumber(account.shares)} <span className="text-base font-medium text-slate-500">shares</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {['bid', 'ask'].map((side) => (
            <button
              key={side}
              type="button"
              onClick={() => onSideChange(side)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                form.side === side
                  ? 'bg-slate-950 text-white shadow-lg shadow-slate-950/20'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {sideLabel(side)}
            </button>
          ))}
        </div>

        <form className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr_auto]" onSubmit={onSubmit}>
          <label className="rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Ticker</span>
            <input
              name="ticker"
              value={form.ticker}
              onChange={onFieldChange}
              className="mt-2 w-full border-none bg-transparent text-lg font-semibold text-slate-950 outline-none"
              placeholder="GOOGL"
              autoComplete="off"
            />
          </label>

          <label className="rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Price</span>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={onFieldChange}
              className="mt-2 w-full border-none bg-transparent text-lg font-semibold text-slate-950 outline-none"
              placeholder="100.00"
            />
          </label>

          <label className="rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-left">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Quantity</span>
            <input
              name="qty"
              type="number"
              min="1"
              step="1"
              value={form.qty}
              onChange={onFieldChange}
              className="mt-2 w-full border-none bg-transparent text-lg font-semibold text-slate-950 outline-none"
              placeholder="1"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-[24px] bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 px-6 py-4 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_rgba(34,211,238,0.28)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Routing...' : `Place ${sideLabel(form.side)} Order`}
          </button>
        </form>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Order notional</p>
            <p className="mt-2 font-heading text-2xl font-semibold text-slate-950">{formatCurrency(notional)}</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Hard limit</p>
            <p className="mt-2 font-heading text-2xl font-semibold text-slate-950">$10,000.00</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Guardrail</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {form.side === 'bid'
                ? 'Buy orders must remain solvent against the live USD balance.'
                : 'Sell orders are still audited and reconciled through the book.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
