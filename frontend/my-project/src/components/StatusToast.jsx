import { useEffect } from "react";

export default function StatusToast({ result, onDismiss }) {
  useEffect(() => {
    if (!result) return;
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [result]);

  if (!result) return null;

  const isApproved = result.status === "APPROVED";

  return (
    <div
      className={`fixed top-5 right-5 z-50 flex items-start gap-3 px-5 py-4 rounded-xl border shadow-2xl max-w-sm animate-slideIn ${
        isApproved
          ? "bg-[#0a1a0f] border-emerald-500/30 shadow-emerald-500/10"
          : "bg-[#1a0a0a] border-red-500/30 shadow-red-500/10"
      }`}
    >
      <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${isApproved ? "bg-emerald-400" : "bg-red-400"}`} style={{ marginTop: 6 }} />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${isApproved ? "text-emerald-400" : "text-red-400"}`}>
          {isApproved ? "Order Approved" : "Order Rejected"}
        </p>
        {isApproved ? (
          <p className="text-xs text-[#666] mt-1">
            Filled {result.filled_qty} · Remaining {result.remaining_qty} · Balance ${result.balance_usd?.toLocaleString()}
          </p>
        ) : (
          <p className="text-xs text-[#666] mt-1">{result.reason}</p>
        )}
      </div>
      <button onClick={onDismiss} className="text-[#555] hover:text-white text-lg leading-none flex-shrink-0">×</button>
    </div>
  );
}