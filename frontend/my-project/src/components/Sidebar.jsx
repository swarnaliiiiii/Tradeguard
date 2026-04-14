const navigation = [
  { label: 'Overview', active: true, hint: 'Desk' },
  { label: 'Order Entry', active: false, hint: 'Gate' },
  { label: 'Market Depth', active: false, hint: 'Book' },
  { label: 'Audit Trail', active: false, hint: 'Log' },
  { label: 'Controls', active: false, hint: 'Rules' },
]

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v4" strokeLinecap="round" />
      <path d="M12 17v4" strokeLinecap="round" />
      <path d="M3 12h4" strokeLinecap="round" />
      <path d="M17 12h4" strokeLinecap="round" />
      <path d="m6.2 6.2 2.8 2.8" strokeLinecap="round" />
      <path d="m15 15 2.8 2.8" strokeLinecap="round" />
      <path d="m6.2 17.8 2.8-2.8" strokeLinecap="round" />
      <path d="m15 9 2.8-2.8" strokeLinecap="round" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  )
}

export function Sidebar() {
  return (
    <aside className="relative overflow-hidden bg-[#07111f] px-5 py-6 text-slate-100 xl:px-6">
      <div className="absolute inset-x-8 top-0 h-40 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="relative flex h-full flex-col gap-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 via-teal-300 to-emerald-300 text-[#07111f] shadow-lg shadow-cyan-500/20">
            <SparkIcon />
          </div>
          <div>
            <p className="font-heading text-lg font-semibold tracking-tight text-white">TradeGuard</p>
            <p className="text-sm text-slate-400">Execution safety desk</p>
          </div>
        </div>

        <nav className="space-y-2">
          {navigation.map((item) => (
            <button
              key={item.label}
              type="button"
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                item.active
                  ? 'border-cyan-300/40 bg-white/10 text-white shadow-lg shadow-black/20'
                  : 'border-transparent bg-transparent text-slate-300 hover:border-white/10 hover:bg-white/5'
              }`}
            >
              <span className="font-medium">{item.label}</span>
              <span className="rounded-full bg-white/8 px-2 py-0.5 text-xs uppercase tracking-[0.2em] text-slate-400">
                {item.hint}
              </span>
            </button>
          ))}
        </nav>

        <div className="rounded-[28px] border border-cyan-300/15 bg-gradient-to-br from-cyan-400/15 via-teal-300/10 to-emerald-300/5 p-5 shadow-2xl shadow-cyan-950/20">
          <p className="font-heading text-xl font-semibold text-white">Gate status</p>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Max ticket and solvency checks are enforced before anything touches the book.
          </p>
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
              <span className="text-sm text-slate-300">Max trade size</span>
              <span className="font-semibold text-cyan-200">$10,000</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-white/5 px-4 py-3">
              <span className="text-sm text-slate-300">Book capacity</span>
              <span className="font-semibold text-cyan-200">100 / side</span>
            </div>
          </div>
        </div>

        <div className="mt-auto rounded-[28px] border border-white/10 bg-white/5 p-5">
          <p className="font-heading text-base font-semibold text-white">Why this layout</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Clear boundaries keep the risk gate, live depth, and audit evidence visible at the same time.
          </p>
        </div>
      </div>
    </aside>
  )
}
