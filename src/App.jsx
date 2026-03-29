import { useState, useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const POLYGON_KEY = import.meta.env.VITE_POLYGON_KEY;

const HOLDINGS = [
  { t: "NVDA", n: "Nvidia", sh: 42, p: 875.32, c: 0, col: "#5dcaa5", bg: "rgba(29,158,117,0.15)" },
  { t: "AAPL", n: "Apple", sh: 115, p: 189.4, c: 0, col: "#7f77dd", bg: "rgba(127,119,221,0.15)" },
  { t: "MSFT", n: "Microsoft", sh: 58, p: 412.87, c: 0, col: "#378add", bg: "rgba(55,138,221,0.15)" },
  { t: "AMZN", n: "Amazon", sh: 22, p: 185.7, c: 0, col: "#d85a30", bg: "rgba(216,90,48,0.15)" },
  { t: "SPY", n: "S&P 500 ETF", sh: 88, p: 521.14, c: 0, col: "#888780", bg: "rgba(136,135,128,0.15)" },
];

const ALLOCS = [
  { nm: "Technology", pc: 51, col: "#7f77dd" },
  { nm: "Crypto", pc: 17, col: "#ef9f27" },
  { nm: "ETFs", pc: 16, col: "#5dcaa5" },
  { nm: "Consumer", pc: 9, col: "#378add" },
  { nm: "Cash", pc: 7, col: "#5f5e5a" },
];

const NEWS = [
  { src: "Reuters", h: "Fed signals patience as inflation data cools further", t: "12m" },
  { src: "Bloomberg", h: "NVDA reports record datacenter revenue in Q1 2026", t: "35m" },
  { src: "WSJ", h: "Bitcoin ETFs see record inflows for third straight week", t: "1h" },
  { src: "FT", h: "Apple Vision Pro 2 unveiled at spring event", t: "2h" },
];

const INSIGHTS = [
  "Your portfolio outperformed the S&P 500 by 2.3% this week. NVDA is your star — consider trimming 10% to lock in gains.",
  "Concentration alert: 51% in tech. If rates rise, you could see amplified downside. Consider adding defensive positions.",
  "BTC is approaching key resistance at $68,500. Your position could see a 12% move in either direction this week.",
  "Tax-loss opportunity: MSFT is down today. A small trim could offset gains and reduce your cap gains exposure.",
];

const s = {
  app: { background: "#09090f", color: "#edeaf8", fontFamily: "'DM Mono', monospace", minHeight: "100vh", display: "flex", flexDirection: "column" },
  topbar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "0.5px solid rgba(255,255,255,0.06)", flexShrink: 0 },
  logo: { fontFamily: "'Syne', sans-serif", fontSize: 17, fontWeight: 800, display: "flex", alignItems: "center", gap: 8 },
  logoMark: { width: 22, height: 22, borderRadius: 6, background: "#7f77dd", display: "flex", alignItems: "center", justifyContent: "center" },
  navTabsWrap: { display: "flex", gap: 2, background: "#111118", border: "0.5px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: 3 },
  navTab: { fontSize: 11, padding: "5px 12px", borderRadius: 5, border: "none", background: "transparent", color: "#6b6a80", cursor: "pointer" },
  navTabOn: { fontSize: 11, padding: "5px 12px", borderRadius: 5, border: "0.5px solid rgba(255,255,255,0.11)", background: "#1c1c28", color: "#edeaf8", cursor: "pointer" },
  livePill: { fontSize: 10, color: "#5dcaa5", background: "rgba(93,202,165,0.07)", border: "0.5px solid rgba(93,202,165,0.25)", padding: "3px 8px", borderRadius: 4, display: "flex", alignItems: "center", gap: 5 },
  body: { display: "grid", gridTemplateColumns: "200px 1fr 210px", flex: 1, minHeight: 0 },
  sidebar: { borderRight: "0.5px solid rgba(255,255,255,0.06)", padding: "16px 0", display: "flex", flexDirection: "column", overflowY: "auto" },
  navGroup: { padding: "0 12px", marginBottom: 24 },
  navLabel: { fontSize: 9, textTransform: "uppercase", letterSpacing: "0.14em", color: "#4a4960", marginBottom: 6, padding: "0 4px" },
  si: { display: "flex", alignItems: "center", gap: 9, padding: "7px 8px", borderRadius: 6, fontSize: 11, color: "#6b6a80", cursor: "pointer", marginBottom: 1 },
  siOn: { display: "flex", alignItems: "center", gap: 9, padding: "7px 8px", borderRadius: 6, fontSize: 11, color: "#7f77dd", cursor: "pointer", marginBottom: 1, background: "rgba(127,119,221,0.08)", borderLeft: "2px solid #7f77dd", marginLeft: -2, paddingLeft: 10 },
  main: { overflowY: "auto", padding: "18px 20px", background: "#09090f" },
  rp: { borderLeft: "0.5px solid rgba(255,255,255,0.06)", padding: "16px 14px", display: "flex", flexDirection: "column", gap: 16, overflowY: "auto" },
  card: { background: "#111118", border: "0.5px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 16px", marginBottom: 14 },
  chip: (up) => ({ fontSize: 11, padding: "3px 9px", borderRadius: 4, background: up ? "rgba(93,202,165,0.14)" : "rgba(226,75,74,0.13)", color: up ? "#5dcaa5" : "#e24b4a", border: `0.5px solid ${up ? "rgba(93,202,165,0.2)" : "rgba(226,75,74,0.2)"}` }),
  statRow: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 },
  stat: { background: "#111118", border: "0.5px solid rgba(255,255,255,0.06)", borderRadius: 8, padding: "12px 14px" },
  hRow: { display: "grid", gridTemplateColumns: "32px 1fr 70px 80px 60px", alignItems: "center", gap: 8, padding: "9px 4px", borderBottom: "0.5px solid rgba(255,255,255,0.06)", cursor: "pointer" },
  secHdr: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  aiPanel: { background: "rgba(127,119,221,0.07)", border: "0.5px solid rgba(127,119,221,0.2)", borderRadius: 10, padding: 16, marginBottom: 16 },
  bottomBar: { borderTop: "0.5px solid rgba(255,255,255,0.06)", padding: "10px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#09090f" },
};

function fmt(n) { return "$" + Math.round(n).toLocaleString(); }

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [holdings, setHoldings] = useState(HOLDINGS);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState("simulated");
  const [portVal, setPortVal] = useState(0);
  const [clock, setClock] = useState("");
  const [insightIdx, setInsightIdx] = useState(0);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [tf, setTf] = useState("1W");
  const [tradeType, setTradeType] = useState("buy");
  const [tradeSym, setTradeSym] = useState("NVDA");
  const [tradeQty, setTradeQty] = useState(10);
  const [aiInput, setAiInput] = useState("");
  const [aiMessages, setAiMessages] = useState([{ from: "vault", text: "Good morning. Loading your real portfolio data now..." }]);

  async function fetchRealPrices() {
    try {
      const updated = [...HOLDINGS];
      for (let i = 0; i < updated.length; i++) {
        const h = updated[i];
        const res = await fetch(
          `https://api.polygon.io/v2/aggs/ticker/${h.t}/prev?adjusted=true&apiKey=${POLYGON_KEY}`
        );
        const data = await res.json();
        if (data.results && data.results[0]) {
          const result = data.results[0];
          const price = result.c;
          const open = result.o;
          const change = ((price - open) / open) * 100;
          updated[i] = { ...h, p: price, c: parseFloat(change.toFixed(2)) };
        }
      }
      setHoldings(updated);
      const total = updated.reduce((sum, h) => sum + h.p * h.sh, 0);
      setPortVal(Math.round(total));
      setDataSource("live");
      setAiMessages([{ from: "vault", text: `Live data loaded. Your portfolio is worth ${fmt(total)} based on yesterday's closing prices. NVDA is ${updated[0].c >= 0 ? "up" : "down"} ${Math.abs(updated[0].c).toFixed(2)}% — your biggest position.` }]);
    } catch (err) {
      const total = HOLDINGS.reduce((sum, h) => sum + h.p * h.sh, 0);
      setPortVal(Math.round(total));
      setDataSource("simulated");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRealPrices();
    const clkInt = setInterval(() => {
      const n = new Date();
      setClock([n.getHours(), n.getMinutes(), n.getSeconds()].map(x => String(x).padStart(2, "0")).join(":"));
    }, 1000);
    const insightInt = setInterval(() => setInsightIdx(i => (i + 1) % INSIGHTS.length), 6000);
    const tickInt = setInterval(() => {
      setPortVal(v => Math.round(v + (Math.random() - 0.48) * 220));
    }, 2600);
    return () => { clearInterval(clkInt); clearInterval(insightInt); clearInterval(tickInt); };
  }, []);

  useEffect(() => {
    if (page !== "dashboard" || !chartRef.current || portVal === 0) return;
    const cfgs = { "1D": { pts: 28, base: portVal * 0.985, v: portVal * 0.004 }, "1W": { pts: 35, base: portVal * 0.96, v: portVal * 0.012 }, "1M": { pts: 40, base: portVal * 0.92, v: portVal * 0.02 }, "3M": { pts: 50, base: portVal * 0.86, v: portVal * 0.034 }, "1Y": { pts: 52, base: portVal * 0.76, v: portVal * 0.06 } };
    const cfg = cfgs[tf] || cfgs["1W"];
    const data = []; let v = cfg.base;
    for (let i = 0; i < cfg.pts; i++) { v += (Math.random() - 0.42) * cfg.v; data.push(Math.round(v)); }
    data.push(portVal);
    if (chartInstance.current) chartInstance.current.destroy();
    if (!chartRef.current) return;
    chartInstance.current = new Chart(chartRef.current, {
      type: "line",
      data: { labels: data.map((_, i) => i), datasets: [{ data, borderColor: "#5dcaa5", borderWidth: 1.5, fill: false, tension: 0.35, pointRadius: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: "#1c1c28", bodyColor: "#edeaf8", bodyFont: { size: 12 }, callbacks: { title: () => "", label: c => "$" + c.parsed.y.toLocaleString() } } }, scales: { x: { display: false }, y: { display: true, position: "right", grid: { color: "rgba(255,255,255,0.04)" }, ticks: { color: "#4a4960", callback: v => "$" + Math.round(v / 1000) + "k", maxTicksLimit: 4 }, border: { display: false } } } },
    });
  }, [tf, page, portVal]);

  const tradePrice = holdings.find(h => h.t === tradeSym.toUpperCase())?.p || 200;
  const tradeTotal = (tradeQty * tradePrice).toLocaleString("en-US", { style: "currency", currency: "USD" });
  const dayChange = holdings.reduce((sum, h) => sum + (h.p * h.c / 100) * h.sh, 0);

  function sendAI() {
    if (!aiInput.trim()) return;
    const q = aiInput;
    setAiMessages(m => [...m, { from: "user", text: q }, { from: "vault", text: `Analyzing "${q}" in context of your ${dataSource === "live" ? "live" : "simulated"} portfolio worth ${fmt(portVal)}. Your largest position is NVDA at ${Math.round(holdings[0].p * holdings[0].sh / portVal * 100)}% of total value. Consider your risk tolerance before making changes.` }]);
    setAiInput("");
  }

  return (
    <div style={s.app}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap" rel="stylesheet" />
      <style>{`body{margin:0;background:#09090f;} @keyframes blink{0%,100%{opacity:1;}50%{opacity:0.2;}}`}</style>

      <div style={s.topbar}>
        <div style={s.logo}>
          <div style={s.logoMark}><svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 10 L6 2 L10 10" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M3.5 7.5h5" stroke="white" strokeWidth="1.4" strokeLinecap="round" /></svg></div>
          VAULT
        </div>
        <div style={s.navTabsWrap}>
          {["dashboard", "trade", "ai", "goals"].map(p => (
            <button key={p} style={page === p ? s.navTabOn : s.navTab} onClick={() => setPage(p)}>{p.charAt(0).toUpperCase() + p.slice(1)}</button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ ...s.livePill, color: dataSource === "live" ? "#5dcaa5" : "#ef9f27", borderColor: dataSource === "live" ? "rgba(93,202,165,0.25)" : "rgba(239,159,39,0.25)" }}>
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: dataSource === "live" ? "#5dcaa5" : "#ef9f27", animation: "blink 1.3s infinite" }} />
            {dataSource === "live" ? "Live data" : "Simulated"}
          </div>
          <span style={{ fontSize: 11, color: "#6b6a80" }}>{clock}</span>
        </div>
      </div>

      <div style={s.body}>
        <div style={s.sidebar}>
          <div style={s.navGroup}>
            <div style={s.navLabel}>Portfolio</div>
            {[["dashboard", "Dashboard"], ["trade", "Trade"], ["ai", "AI Advisor"], ["goals", "Goals"]].map(([id, label]) => (
              <div key={id} style={page === id ? s.siOn : s.si} onClick={() => setPage(id)}>{label}</div>
            ))}
          </div>
          <div style={s.navGroup}>
            <div style={s.navLabel}>Watchlist</div>
            {holdings.slice(0, 4).map(h => (
              <div key={h.t} style={{ display: "flex", justifyContent: "space-between", padding: "6px 8px", fontSize: 11, cursor: "pointer" }}>
                <span>{h.t}</span>
                <span style={{ color: h.c >= 0 ? "#5dcaa5" : "#e24b4a" }}>{h.c >= 0 ? "+" : ""}{h.c.toFixed(2)}%</span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "auto", padding: 12 }}>
            <div style={{ background: "rgba(127,119,221,0.08)", border: "0.5px solid rgba(127,119,221,0.18)", borderRadius: 9, padding: 13, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "#7f77dd", marginBottom: 3 }}>VAULT PRO</div>
              <div style={{ fontSize: 9, color: "#6b6a80", lineHeight: 1.5, marginBottom: 9 }}>AI signals · Options flow · $9/mo</div>
              <div style={{ fontSize: 11, background: "#7f77dd", color: "#fff", borderRadius: 5, padding: 7, cursor: "pointer" }}>Upgrade now</div>
            </div>
          </div>
        </div>

        <div style={s.main}>
          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#6b6a80", fontSize: 12 }}>
              <div style={{ marginBottom: 8 }}>Fetching live market data...</div>
              <div style={{ fontSize: 10, color: "#4a4960" }}>Connecting to Polygon.io</div>
            </div>
          )}

          {!loading && page === "dashboard" && (
            <>
              <div style={s.aiPanel}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#7f77dd", animation: "blink 2s infinite" }} />
                  <span style={{ fontSize: 10, color: "#7f77dd", textTransform: "uppercase", letterSpacing: "0.1em" }}>Vault AI · Market Pulse</span>
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.6 }}>{INSIGHTS[insightIdx]}</div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: "#6b6a80", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Total portfolio value</div>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 40, fontWeight: 800, letterSpacing: -2, lineHeight: 1 }}>{fmt(portVal)}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                  <span style={s.chip(dayChange >= 0)}>{dayChange >= 0 ? "+" : ""}{fmt(dayChange)} today</span>
                  <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 4, background: "#16161f", color: "#6b6a80" }}>{dataSource === "live" ? "Real prices" : "Simulated"}</span>
                </div>
              </div>
              <div style={s.card}>
                <div style={{ display: "flex", gap: 3, marginBottom: 10 }}>
                  {["1D", "1W", "1M", "3M", "1Y"].map(t => (
                    <button key={t} onClick={() => setTf(t)} style={{ fontSize: 10, padding: "4px 9px", borderRadius: 4, border: tf === t ? "0.5px solid rgba(255,255,255,0.11)" : "none", background: tf === t ? "#1c1c28" : "transparent", color: tf === t ? "#edeaf8" : "#6b6a80", cursor: "pointer" }}>{t}</button>
                  ))}
                </div>
                <div style={{ height: 140 }}><canvas ref={chartRef} /></div>
              </div>
              <div style={s.statRow}>
                {[
                  ["Day P&L", `${dayChange >= 0 ? "+" : ""}${fmt(dayChange)}`, `${(dayChange / portVal * 100).toFixed(2)}%`, dayChange >= 0 ? "#5dcaa5" : "#e24b4a"],
                  ["Portfolio", fmt(portVal), `${holdings.length} positions`, "#edeaf8"],
                  ["Sharpe", "1.87", "Excellent", "#edeaf8"],
                  ["Beta", "1.14", "vs S&P 500", "#edeaf8"]
                ].map(([l, v, sub, col]) => (
                  <div key={l} style={s.stat}><div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: "#6b6a80", marginBottom: 5 }}>{l}</div><div style={{ fontSize: 19, fontFamily: "'DM Mono',monospace", fontWeight: 700, color: col }}>{v}</div><div style={{ fontSize: 10, color: "#6b6a80", marginTop: 2 }}>{sub}</div></div>
                ))}
              </div>
              <div style={s.secHdr}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 13, fontWeight: 600 }}>
                  Holdings {dataSource === "live" && <span style={{ fontSize: 10, color: "#5dcaa5", marginLeft: 6 }}>● live</span>}
                </div>
              </div>
              {holdings.map(h => (
                <div key={h.t} style={s.hRow}>
                  <div style={{ width: 32, height: 32, borderRadius: 7, background: h.bg, color: h.col, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9 }}>{h.t.slice(0, 3)}</div>
                  <div><div style={{ fontSize: 12, fontWeight: 500 }}>{h.t}</div><div style={{ fontSize: 10, color: "#6b6a80" }}>{h.n}</div></div>
                  <div style={{ fontSize: 10, color: "#6b6a80", textAlign: "right" }}>{h.sh < 1 ? h.sh.toFixed(2) : h.sh} sh</div>
                  <div style={{ fontSize: 12, textAlign: "right" }}>${h.p.toFixed(2)}</div>
                  <div style={{ fontSize: 11, textAlign: "right", color: h.c >= 0 ? "#5dcaa5" : "#e24b4a" }}>{h.c >= 0 ? "+" : ""}{h.c.toFixed(2)}%</div>
                </div>
              ))}
            </>
          )}

          {!loading && page === "trade" && (
            <>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 14 }}>Trade center</div>
              <div style={s.card}>
                <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
                  {["buy", "sell"].map(t => (
                    <button key={t} onClick={() => setTradeType(t)} style={{ flex: 1, padding: 8, borderRadius: 6, fontSize: 12, border: "0.5px solid rgba(255,255,255,0.1)", background: tradeType === t ? (t === "buy" ? "rgba(93,202,165,0.14)" : "rgba(226,75,74,0.13)") : "transparent", color: tradeType === t ? (t === "buy" ? "#5dcaa5" : "#e24b4a") : "#6b6a80", cursor: "pointer" }}>{t.charAt(0).toUpperCase() + t.slice(1)}</button>
                  ))}
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: "#6b6a80", marginBottom: 5 }}>Symbol</div>
                  <input value={tradeSym} onChange={e => setTradeSym(e.target.value)} style={{ width: "100%", background: "#16161f", border: "0.5px solid rgba(255,255,255,0.11)", borderRadius: 6, padding: "8px 10px", color: "#edeaf8", fontFamily: "'DM Mono',monospace", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, color: "#6b6a80", marginBottom: 5 }}>Shares</div>
                  <input type="number" value={tradeQty} onChange={e => setTradeQty(Number(e.target.value))} style={{ width: "100%", background: "#16161f", border: "0.5px solid rgba(255,255,255,0.11)", borderRadius: 6, padding: "8px 10px", color: "#edeaf8", fontFamily: "'DM Mono',monospace", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b6a80", marginBottom: 5 }}><span>Price {dataSource === "live" ? "(live)" : "(est.)"}</span><span>${tradePrice.toFixed(2)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 5 }}><span style={{ color: "#6b6a80" }}>Total cost</span><span>{tradeTotal}</span></div>
                <button style={{ width: "100%", padding: 10, borderRadius: 7, border: "none", background: tradeType === "buy" ? "#5dcaa5" : "#e24b4a", color: tradeType === "buy" ? "#04342c" : "#fff", fontFamily: "'DM Mono',monospace", fontSize: 12, cursor: "pointer", marginTop: 10 }}>Preview {tradeType} order</button>
              </div>
            </>
          )}

          {!loading && page === "ai" && (
            <>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 14 }}>AI advisor</div>
              <div style={{ ...s.card, minHeight: 200 }}>
                {aiMessages.map((m, i) => (
                  <div key={i} style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em", color: m.from === "vault" ? "#7f77dd" : "#6b6a80", marginBottom: 4 }}>{m.from === "vault" ? "VAULT AI" : "You"}</div>
                    <div style={{ fontSize: 11, lineHeight: 1.6 }}>{m.text}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input value={aiInput} onChange={e => setAiInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendAI()} placeholder="Ask anything about your portfolio..." style={{ flex: 1, background: "#16161f", border: "0.5px solid rgba(255,255,255,0.11)", borderRadius: 6, padding: "8px 10px", color: "#edeaf8", fontFamily: "'DM Mono',monospace", fontSize: 11, outline: "none" }} />
                <button onClick={sendAI} style={{ padding: "8px 14px", background: "#7f77dd", color: "#fff", border: "none", borderRadius: 6, fontFamily: "'DM Mono',monospace", fontSize: 11, cursor: "pointer" }}>Send</button>
              </div>
            </>
          )}

          {!loading && page === "goals" && (
            <>
              <div style={{ fontFamily: "'Syne',sans-serif", fontSize: 20, fontWeight: 700, marginBottom: 14 }}>Financial goals</div>
              {[{ nm: "Retirement fund", cur: portVal, tgt: 500000, col: "#7f77dd", yr: 2045 }, { nm: "Down payment", cur: 48200, tgt: 80000, col: "#5dcaa5", yr: 2027 }, { nm: "Emergency fund", cur: 22000, tgt: 25000, col: "#ef9f27", yr: 2026 }].map(g => {
                const pc = Math.min(100, Math.round(g.cur / g.tgt * 100));
                return (
                  <div key={g.nm} style={{ ...s.card, marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <div><div style={{ fontSize: 13, fontWeight: 600, fontFamily: "'Syne',sans-serif" }}>{g.nm}</div><div style={{ fontSize: 10, color: "#6b6a80", marginTop: 2 }}>Target: {g.yr}</div></div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: g.col }}>{pc}%</span>
                    </div>
                    <div style={{ height: 5, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}><div style={{ width: `${pc}%`, height: "100%", background: g.col, borderRadius: 3 }} /></div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#6b6a80" }}><span>{fmt(g.cur)} saved</span><span>Goal: {fmt(g.tgt)}</span></div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        <div style={s.rp}>
          <div>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.13em", color: "#4a4960", marginBottom: 8 }}>Allocation</div>
            {ALLOCS.map(a => (
              <div key={a.nm} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}><span style={{ fontSize: 11 }}>{a.nm}</span><span style={{ fontSize: 11, color: "#6b6a80" }}>{a.pc}%</span></div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}><div style={{ width: `${a.pc}%`, height: "100%", background: a.col, borderRadius: 2 }} /></div>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 9, textTransform: "uppercase", letterSpacing: "0.13em", color: "#4a4960", marginBottom: 8 }}>News</div>
            {NEWS.map((n, i) => (
              <div key={i} style={{ paddingBottom: 10, marginBottom: 10, borderBottom: i < NEWS.length - 1 ? "0.5px solid rgba(255,255,255,0.06)" : "none" }}>
                <div style={{ fontSize: 9, color: "#7f77dd", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 3 }}>{n.src}</div>
                <div style={{ fontSize: 11, lineHeight: 1.45 }}>{n.h}</div>
                <div style={{ fontSize: 10, color: "#6b6a80", marginTop: 2 }}>{n.t} ago</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={s.bottomBar}>
        <div style={{ display: "flex", gap: 20 }}>
          {holdings.slice(0, 4).map(h => (
            <div key={h.t} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 10, color: "#6b6a80" }}>{h.t}</span>
              <span style={{ fontSize: 11 }}>${h.p.toFixed(2)}</span>
              <span style={{ fontSize: 10, color: h.c >= 0 ? "#5dcaa5" : "#e24b4a" }}>{h.c >= 0 ? "+" : ""}{h.c.toFixed(2)}%</span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: "#4a4960" }}>
          {dataSource === "live" ? "Powered by Polygon.io" : "Simulated data"} · Not financial advice
        </div>
      </div>
    </div>
  );
}
