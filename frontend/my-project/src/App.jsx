import { useState, useEffect, useCallback } from "react";
import OrderForm from "./components/OrderForm";
import OrderBook from "./components/OrderBook";
import AuditLog from "./components/AuditLog";
import StatusToast from "./components/StatusToast";
import PortfolioCard from "./components/PortfolioCard";

const API = "http://127.0.0.1:5000";
const USER_ID = "user1";

export default function App() {
  const [depth, setDepth] = useState({});
  const [audit, setAudit] = useState([]);
  const [balance, setBalance] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [backendOnline, setBackendOnline] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [depthRes, auditRes, balRes] = await Promise.all([
        fetch(`${API}/api/depth`),
        fetch(`${API}/api/audit?limit=10`),
        fetch(`${API}/api/balance/${USER_ID}`),
      ]);
      const [depthData, auditData, balData] = await Promise.all([
        depthRes.json(),
        auditRes.json(),
        balRes.json(),
      ]);
      setDepth(depthData.depth ?? {});
      setAudit(auditData.entries ?? []);
      setBalance(balData);
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
    const interval = setInterval(fetchAll, 5000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return (
    <div className="min-h-screen bg-[#080808] text-white font-sans">
      {/* Subtle grid texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
      />

      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-[#141414] bg-[#080808]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-emerald-500 flex items-center justify-center">
              <span className="text-black text-[10px] font-black">TG</span>
            </div>
            <span className="font-semibold text-sm tracking-tight">TradeGuard</span>
            <span className="text-[#333] text-sm">/</span>
            <span className="text-[#555] text-sm">dashboard</span>
          </div>

          <div className="flex items-center gap-4">
            {backendOnline !== null && (
              <span
                className={`flex items-center gap-1.5 text-[11px] font-medium ${
                  backendOnline ? "text-emerald-400" : "text-red-400"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    backendOnline ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                  }`}
                />
                {backendOnline ? "Backend online" : "Backend offline"}
              </span>
            )}
            <div className="text-[#555] text-xs border border-[#1e1e1e] rounded-md px-2.5 py-1 font-mono">
              {USER_ID}
            </div>
          </div>
        </div>
      </header>

      {/* Hero strip */}
      <div className="border-b border-[#141414] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#555] mb-2">TradeGuard Dashboard</p>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white leading-none">
            Guard the trade<br className="md:hidden" />{" "}
            <span className="text-[#333]">before it reaches the market.</span>
          </h1>
        </div>
      </div>

      {/* Main layout */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            <OrderForm onOrderResult={setLastResult} onRefresh={fetchAll} />
            <OrderBook depth={depth} />
            <AuditLog entries={audit} />
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            <PortfolioCard balance={balance} />
          </div>
        </div>
      </main>

      <StatusToast result={lastResult} onDismiss={() => setLastResult(null)} />

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn { animation: slideIn 0.2s ease-out; }
      `}</style>
    </div>
  );
}