import { formatCurrency, formatTimestamp } from '../lib/format'

function statusClasses(status) {
  return status === 'APPROVED'
    ? 'bg-emerald-100 text-emerald-700'
    : 'bg-rose-100 text-rose-700'
}

export function AuditTable({ entries }) {
  return (
    <section className="dashboard-reveal rounded-[30px] border border-slate-200/80 bg-white/80 p-5 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur xl:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-cyan-700">Audit</p>
          <h2 className="mt-2 font-heading text-3xl font-semibold tracking-tight text-slate-950">Recent attempts</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            The last five submissions stay visible so failures are easy to diagnose without digging through logs.
          </p>
        </div>
        <p className="text-sm text-slate-500">{entries.length} rows loaded</p>
      </div>

      <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white text-left">
            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <tr>
                <th className="px-4 py-4">Time</th>
                <th className="px-4 py-4">Ticker</th>
                <th className="px-4 py-4">Side</th>
                <th className="px-4 py-4">Qty</th>
                <th className="px-4 py-4">Price</th>
                <th className="px-4 py-4">Status</th>
                <th className="px-4 py-4">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {entries.length ? (
                entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-4 whitespace-nowrap">{formatTimestamp(entry.timestamp)}</td>
                    <td className="px-4 py-4 font-semibold text-slate-950">{entry.ticker}</td>
                    <td className="px-4 py-4 uppercase">{entry.side}</td>
                    <td className="px-4 py-4">{entry.qty}</td>
                    <td className="px-4 py-4">{formatCurrency(entry.price_usd)}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(entry.status)}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-500">{entry.reason || 'Passed all checks'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-4 py-8 text-center text-slate-500" colSpan="7">
                    No audit entries yet. Submit an order to populate the trail.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
