import { useEffect, useEffectEvent, useState, useTransition } from 'react'
import { AuditTable } from './components/AuditTable'
import { MarketDepth } from './components/MarketDepth'
import { OrderEntryCard } from './components/OrderEntryCard'
import { RightPanel } from './components/RightPanel'
import { Sidebar } from './components/Sidebar'
import { StatusBanner } from './components/StatusBanner'
import { fetchAudit, fetchBalance, fetchDepth, fetchHealth, submitOrder } from './lib/api'
import { formatCurrency, formatNumber, normalizeDepth } from './lib/format'

const DEFAULT_FORM = {
  userId: 'user1',
  ticker: 'GOOGL',
  side: 'bid',
  price: '100.00',
  qty: '10',
}

function App() {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [account, setAccount] = useState({ balanceUsd: 0, shares: 0 })
  const [depth, setDepth] = useState({ bids: [], asks: [] })
  const [auditEntries, setAuditEntries] = useState([])
  const [systemStatus, setSystemStatus] = useState({
    ok: false,
    label: 'Connecting',
    detail: 'Looking for the Flask risk service.',
  })
  const [banner, setBanner] = useState({
    tone: 'info',
    title: 'Desk ready',
    message: 'Submit a ticket to validate it against the TradeGuard gate.',
  })
  const [lastUpdated, setLastUpdated] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRefreshing, startRefreshTransition] = useTransition()

  const hydrateDashboard = useEffectEvent(async ({ silent = false } = {}) => {
    try {
      const [healthPayload, balancePayload, depthPayload, auditPayload] = await Promise.all([
        fetchHealth(),
        fetchBalance(DEFAULT_FORM.userId),
        fetchDepth(),
        fetchAudit(5),
      ])

      startRefreshTransition(() => {
        setAccount({
          balanceUsd: balancePayload.balance_usd ?? 0,
          shares: balancePayload.shares ?? 0,
        })
        setDepth(normalizeDepth(depthPayload.depth))
        setAuditEntries(auditPayload.entries ?? [])
        setSystemStatus({
          ok: healthPayload.status === 'ok',
          label: healthPayload.status === 'ok' ? 'Live' : 'Degraded',
          detail:
            healthPayload.status === 'ok'
              ? 'Risk checks, book updates, and audit logging are reachable.'
              : 'One or more backend services may be unavailable.',
        })
        setLastUpdated(new Date().toISOString())
      })
    } catch (error) {
      setSystemStatus({
        ok: false,
        label: 'Offline',
        detail: error.message,
      })

      if (!silent) {
        setBanner({
          tone: 'warning',
          title: 'Backend connection issue',
          message: `${error.message}. Start the Flask API to stream live balance, depth, and audit data.`,
        })
      }
    }
  })

  useEffect(() => {
    hydrateDashboard()

    const intervalId = window.setInterval(() => {
      hydrateDashboard({ silent: true })
    }, 5000)

    return () => window.clearInterval(intervalId)
  }, [hydrateDashboard])

  function handleFieldChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  function handleSideChange(side) {
    setForm((current) => ({ ...current, side }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const payload = {
        user_id: form.userId,
        ticker: form.ticker.trim().toUpperCase(),
        side: form.side,
        qty: Number.parseInt(form.qty, 10),
        price: Number(form.price).toFixed(2),
      }

      const result = await submitOrder(payload)
      const isApproved = result.status === 'APPROVED'

      setBanner({
        tone: isApproved ? 'success' : 'danger',
        title: isApproved ? 'Order accepted' : 'Risk violation',
        message: isApproved
          ? `${payload.side.toUpperCase()} ${payload.qty} ${payload.ticker} at ${formatCurrency(Number(payload.price))}. Filled ${result.filled_qty}, resting ${result.remaining_qty}.`
          : result.reason || 'The order was rejected by the gate.',
      })

      await hydrateDashboard()
    } catch (error) {
      setBanner({
        tone: 'danger',
        title: 'Submission failed',
        message: error.message,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const bestBid = depth.bids[0]?.price ?? 0
  const bestAsk = depth.asks[0]?.price ?? 0

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-5 md:px-8 md:py-8">
      <div className="pointer-events-none absolute left-[-10rem] top-[-8rem] h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl glow-orb" />
      <div className="pointer-events-none absolute bottom-[-8rem] right-[-8rem] h-80 w-80 rounded-full bg-emerald-300/30 blur-3xl glow-orb [animation-delay:-2s]" />

      <div className="mx-auto max-w-[1560px]">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">TradeGuard dashboard</p>
            <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              Guard the trade before it reaches the market.
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Inspired by the reference layout, but rebuilt for your risk-first trading workflow with explicit gate, book,
              and audit surfaces.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-white/60 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Cash</p>
              <p className="mt-1 font-heading text-2xl font-semibold text-slate-950">{formatCurrency(account.balanceUsd)}</p>
            </div>
            <div className="rounded-[24px] border border-white/60 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Best bid</p>
              <p className="mt-1 font-heading text-2xl font-semibold text-slate-950">{formatCurrency(bestBid)}</p>
            </div>
            <div className="rounded-[24px] border border-white/60 bg-white/70 px-4 py-3 shadow-sm backdrop-blur">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Best ask</p>
              <p className="mt-1 font-heading text-2xl font-semibold text-slate-950">{formatCurrency(bestAsk)}</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[36px] border border-white/70 bg-white/65 shadow-[0_30px_80px_rgba(15,23,42,0.16)] backdrop-blur">
          <div className="grid xl:grid-cols-[280px_minmax(0,1fr)_340px]">
            <Sidebar />

            <main className="space-y-6 px-5 py-6 xl:px-8 xl:py-8">
              <div className="grid gap-4 lg:grid-cols-[1.1fr_auto] lg:items-center">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Command center</p>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Current user: <span className="font-semibold text-slate-950">{DEFAULT_FORM.userId}</span>. Shares held:{' '}
                    <span className="font-semibold text-slate-950">{formatNumber(account.shares)}</span>. Refresh state:{' '}
                    <span className="font-semibold text-slate-950">{isRefreshing ? 'Syncing' : 'Stable'}</span>.
                  </p>
                </div>

                <div className="rounded-[24px] border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Backend health</p>
                  <p className="mt-1 font-heading text-xl font-semibold text-slate-950">{systemStatus.label}</p>
                  <p className="mt-1 text-sm text-slate-500">{systemStatus.detail}</p>
                </div>
              </div>

              <StatusBanner banner={banner} />
              <OrderEntryCard
                form={form}
                onFieldChange={handleFieldChange}
                onSideChange={handleSideChange}
                onSubmit={handleSubmit}
                isSubmitting={isSubmitting}
                account={account}
              />
              <MarketDepth bids={depth.bids} asks={depth.asks} />
              <AuditTable entries={auditEntries} />
            </main>

            <RightPanel
              account={account}
              systemStatus={systemStatus}
              banner={banner}
              entries={auditEntries}
              lastUpdated={lastUpdated}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
