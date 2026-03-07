"use client";
// FILE PATH: src/app/page.js
// This is the COMPLETE dashboard — drop it in and it works.
// It calls /api/analyse (the route.js file) which holds your API key server-side.

import { useState, useEffect, useRef } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtPrice(n) {
  if (!n || isNaN(n)) return "—";
  if (n >= 1000) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 1) return n.toFixed(4);
  return n.toFixed(6);
}

// ─── PulseDot ─────────────────────────────────────────────────────────────────
function PulseDot() {
  const [op, setOp] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setOp((o) => (o === 1 ? 0.3 : 1)), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <div
      style={{
        width: 8, height: 8, borderRadius: "50%",
        background: "#00ff88", boxShadow: "0 0 8px #00ff88",
        opacity: op, transition: "opacity 0.6s", flexShrink: 0,
      }}
    />
  );
}

// ─── Loader ───────────────────────────────────────────────────────────────────
const LOAD_MSGS = [
  "FETCHING LIVE PRICE DATA...",
  "SCANNING MARKET CONDITIONS...",
  "COMPUTING TECHNICAL INDICATORS...",
  "ANALYSING RSI, MACD, BOLLINGER...",
  "DETECTING SUPPORT & RESISTANCE...",
  "GENERATING AI ANALYSIS...",
  "ALMOST DONE...",
];

function Loader({ step }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "70px 20px", gap: 14 }}>
      <div style={{ width: 280, height: 2, background: "#1a2030", overflow: "hidden" }}>
        <div
          style={{
            width: "40%", height: "100%",
            background: "#00ff88", boxShadow: "0 0 8px #00ff88",
            animation: "apexSlide 1s infinite linear",
          }}
        />
      </div>
      <div style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#00ff88", letterSpacing: 2 }}>
        {LOAD_MSGS[step % LOAD_MSGS.length]}
      </div>
    </div>
  );
}

// ─── Section divider ──────────────────────────────────────────────────────────
function Section({ label }) {
  return (
    <div
      style={{
        fontFamily: "monospace", fontSize: "0.58rem", color: "#4a5a72",
        letterSpacing: 3, textTransform: "uppercase", marginBottom: 10,
        display: "flex", alignItems: "center", gap: 10,
      }}
    >
      {label}
      <div style={{ flex: 1, height: 1, background: "#1a2030" }} />
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
function Card({ label, accent = "#2a3550", children }) {
  return (
    <div style={{ background: "#0d1017", border: "1px solid #1a2030", padding: 16, position: "relative", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg,transparent,${accent},transparent)`, opacity: 0.6,
        }}
      />
      <div style={{ fontFamily: "monospace", fontSize: "0.58rem", color: "#4a5a72", letterSpacing: 2, marginBottom: 8 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

// ─── Outlook Panel ────────────────────────────────────────────────────────────
function OutlookPanel({ o, symbol }) {
  if (!o) return null;
  const isBull = o.momentum === "BULLISH";
  const isBear = o.momentum === "BEARISH";
  const mainColor    = isBull ? "#00ff88" : isBear ? "#ff3355" : "#ffcc00";
  const bgColor      = isBull ? "rgba(0,255,136,0.04)" : isBear ? "rgba(255,51,85,0.04)" : "rgba(255,204,0,0.04)";
  const borderCol    = isBull ? "rgba(0,255,136,0.25)" : isBear ? "rgba(255,51,85,0.25)" : "rgba(255,204,0,0.25)";
  const arrow        = isBull ? "▲" : isBear ? "▼" : "◆";
  const strengthColor = o.strength === "STRONG" ? mainColor : o.strength === "MODERATE" ? "#ffcc00" : "#4a5a72";
  const conf = Math.min(100, Math.max(0, o.confidencePct || 50));

  return (
    <div
      style={{
        border: `1px solid ${borderCol}`, background: bgColor,
        padding: 24, marginBottom: 14, position: "relative", overflow: "hidden",
      }}
    >
      {/* Top glow */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: `linear-gradient(90deg,transparent,${mainColor},transparent)`, opacity: 0.7,
        }}
      />
      {/* EDU badge */}
      <div
        style={{
          position: "absolute", top: 14, right: 14,
          fontFamily: "monospace", fontSize: "0.55rem", color: mainColor,
          background: mainColor + "18", border: `1px solid ${mainColor}33`,
          padding: "3px 8px", letterSpacing: 2,
        }}
      >
        EDUCATIONAL
      </div>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "monospace", fontSize: "0.58rem", color: "#4a5a72", letterSpacing: 3, marginBottom: 6 }}>
            CURRENT MOMENTUM OUTLOOK · {symbol}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                fontFamily: "monospace", fontSize: "2.4rem", fontWeight: 700,
                color: mainColor, lineHeight: 1, textShadow: `0 0 30px ${mainColor}66`,
              }}
            >
              {arrow} {o.momentum}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div
                style={{
                  fontFamily: "monospace", fontSize: "0.65rem", color: strengthColor,
                  border: `1px solid ${strengthColor}44`, padding: "2px 10px", letterSpacing: 2,
                }}
              >
                {o.strength}
              </div>
              <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: "#4a5a72", letterSpacing: 1 }}>
                SIGNAL STRENGTH
              </div>
            </div>
          </div>
        </div>
        {/* Confidence */}
        <div style={{ marginLeft: "auto", textAlign: "right", minWidth: 120 }}>
          <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: "#4a5a72", letterSpacing: 2, marginBottom: 6 }}>CONFIDENCE</div>
          <div style={{ fontFamily: "monospace", fontSize: "2rem", fontWeight: 700, color: mainColor, lineHeight: 1 }}>{conf}%</div>
          <div style={{ width: 120, height: 4, background: "#1a2030", marginTop: 6, marginLeft: "auto" }}>
            <div style={{ width: `${conf}%`, height: "100%", background: mainColor }} />
          </div>
        </div>
      </div>

      {/* Verdict */}
      <div
        style={{
          background: "#080a0f", border: `1px solid ${borderCol}`,
          borderLeft: `3px solid ${mainColor}`, padding: "14px 16px", marginBottom: 16,
        }}
      >
        <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: "#4a5a72", letterSpacing: 2, marginBottom: 6 }}>VERDICT</div>
        <div style={{ fontSize: "0.88rem", color: "#e8f0ff", lineHeight: 1.7 }}>{o.verdict}</div>
      </div>

      {/* Entry / Target / Stop */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          ["ENTRY ZONE",  o.entryZone,  "#4488ff"],
          ["TARGET ZONE", o.targetZone, "#00ff88"],
          ["STOP ZONE",   o.stopZone,   "#ff3355"],
        ].map(([lbl, val, col]) => (
          <div
            key={lbl}
            style={{
              background: "#080a0f", border: "1px solid #1a2030",
              borderTop: `2px solid ${col}44`, padding: "12px 14px",
            }}
          >
            <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: "#4a5a72", letterSpacing: 2, marginBottom: 6 }}>{lbl}</div>
            <div style={{ fontFamily: "monospace", fontSize: "0.8rem", color: col, fontWeight: 700 }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Reasons */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: "#4a5a72", letterSpacing: 2, marginBottom: 10 }}>
          KEY REASONS FOR THIS OUTLOOK
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {(o.reasons || []).map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ color: mainColor, fontFamily: "monospace", fontSize: "0.7rem", marginTop: 1, flexShrink: 0 }}>◆</span>
              <span style={{ fontSize: "0.82rem", color: "#c8d4e8", lineHeight: 1.6 }}>{r}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Watch out */}
      {o.watchOut && (
        <div style={{ background: "rgba(255,204,0,0.05)", border: "1px solid rgba(255,204,0,0.2)", padding: "10px 14px" }}>
          <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#ffcc00", letterSpacing: 1 }}>⚠ WATCH OUT — </span>
          <span style={{ fontSize: "0.8rem", color: "#c8d4e8" }}>{o.watchOut}</span>
        </div>
      )}

      {/* Footer note */}
      <div style={{ marginTop: 14, fontFamily: "monospace", fontSize: "0.58rem", color: "#2a3550", lineHeight: 1.6 }}>
        ※ This outlook is for internal educational analysis only. It does not constitute financial advice or a trade
        recommendation. Always apply your own risk management.
      </div>
    </div>
  );
}

// ─── Results ──────────────────────────────────────────────────────────────────
function Results({ d }) {
  const bias       = d.bias || "neutral";
  const biasColor  = bias === "bullish" ? "#00ff88" : bias === "bearish" ? "#ff3355" : "#ffcc00";
  const biasLabel  = bias === "bullish" ? "▲ BULLISH" : bias === "bearish" ? "▼ BEARISH" : "◆ NEUTRAL";
  const rangePos   = d.high24h && d.low24h
    ? Math.min(100, Math.max(0, ((d.currentPrice - d.low24h) / (d.high24h - d.low24h)) * 100))
    : 50;
  const bullBars   = Math.round(((d.bullPct || 50) / 100) * 10);
  const indicators = d.indicators || [];

  return (
    <div>
      {/* Token header */}
      <div
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          marginBottom: 20, paddingBottom: 18, borderBottom: "1px solid #1a2030",
          flexWrap: "wrap", gap: 12,
        }}
      >
        <div>
          <div style={{ fontFamily: "monospace", fontSize: "2rem", fontWeight: 700, letterSpacing: 4, color: biasColor }}>
            {d.symbol}
          </div>
          <div style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#4a5a72", letterSpacing: 2, marginTop: 4 }}>
            PERPETUAL FUTURES · USDT MARGINED
          </div>
        </div>
        <div>
          <div
            style={{
              fontFamily: "monospace", fontWeight: 700, fontSize: "1.1rem", letterSpacing: 3,
              padding: "10px 22px", border: `2px solid ${biasColor}`,
              color: biasColor, background: biasColor + "18", textAlign: "center",
            }}
          >
            {biasLabel}
          </div>
          <div style={{ fontFamily: "monospace", fontSize: "0.58rem", color: "#4a5a72", textAlign: "center", marginTop: 5 }}>
            {d.bullScore}B / {d.bearScore}Be SIGNALS
          </div>
        </div>
      </div>

      {/* Price overview */}
      <Section label="PRICE OVERVIEW" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
        <Card label="CURRENT PRICE" accent={d.priceChange24h >= 0 ? "#00ff88" : "#ff3355"}>
          <div style={{ fontFamily: "monospace", fontSize: "1.4rem", fontWeight: 700, color: d.priceChange24h >= 0 ? "#00ff88" : "#ff3355" }}>
            ${fmtPrice(d.currentPrice)}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#4a5a72", marginTop: 6 }}>
            {d.priceChange24h >= 0 ? "▲" : "▼"} {Math.abs(d.priceChange24h || 0).toFixed(2)}% (24H)
          </div>
        </Card>
        <Card label="24H RANGE" accent="#2a3550">
          <div style={{ fontFamily: "monospace", fontSize: "0.9rem", color: "#e8f0ff", marginTop: 4 }}>
            ${fmtPrice(d.low24h)} — ${fmtPrice(d.high24h)}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#4a5a72", marginTop: 6 }}>Spread: {d.spread || "—"}%</div>
        </Card>
        <Card label="24H VOLUME" accent="#ffcc00">
          <div style={{ fontFamily: "monospace", fontSize: "1.4rem", fontWeight: 700, color: "#ffcc00" }}>
            {d.volume24h || "—"}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#4a5a72", marginTop: 6 }}>ATR(14): ${fmtPrice(d.atr)}</div>
        </Card>
      </div>

      {/* Range bar */}
      <Section label="INTRADAY POSITION" />
      <div style={{ background: "#0d1017", border: "1px solid #1a2030", padding: 16, marginBottom: 14 }}>
        <div style={{ fontFamily: "monospace", fontSize: "0.58rem", color: "#4a5a72", letterSpacing: 2, marginBottom: 14 }}>
          PRICE POSITION IN 24H RANGE
        </div>
        <div style={{ position: "relative", margin: "10px 0 6px" }}>
          <div style={{ height: 8, background: "linear-gradient(90deg,#ff3355,#ffcc00,#00ff88)" }} />
          <div
            style={{
              position: "absolute", top: "50%", left: `${rangePos}%`,
              transform: "translate(-50%,-50%)",
              width: 14, height: 14, background: "#fff",
              border: "2px solid #080a0f", borderRadius: "50%",
              boxShadow: "0 0 10px rgba(255,255,255,0.6)",
            }}
          />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <div style={{ fontFamily: "monospace", fontSize: "0.68rem", color: "#ff3355" }}>
            ▼ ${fmtPrice(d.low24h)}<br />
            <span style={{ color: "#4a5a72", fontSize: "0.55rem" }}>24H LOW</span>
          </div>
          <div style={{ fontFamily: "monospace", fontSize: "0.68rem", color: "#e8f0ff", textAlign: "center" }}>
            ◆ ${fmtPrice(d.currentPrice)}<br />
            <span style={{ color: "#4a5a72", fontSize: "0.55rem" }}>{rangePos.toFixed(0)}% OF RANGE</span>
          </div>
          <div style={{ fontFamily: "monospace", fontSize: "0.68rem", color: "#00ff88", textAlign: "right" }}>
            ▲ ${fmtPrice(d.high24h)}<br />
            <span style={{ color: "#4a5a72", fontSize: "0.55rem" }}>24H HIGH</span>
          </div>
        </div>
      </div>

      {/* Projected ranges */}
      <Section label="PROJECTED INTRADAY RANGES (ATR-BASED)" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <Card label="BEARISH PROJECTION" accent="#ff3355">
          <div style={{ fontFamily: "monospace", fontSize: "1.4rem", fontWeight: 700, color: "#ff3355" }}>
            ${fmtPrice(d.bearTarget)}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#4a5a72", marginTop: 6 }}>
            Extreme: ${fmtPrice(d.extremeBear)} · 2–3.5× ATR down
          </div>
        </Card>
        <Card label="BULLISH PROJECTION" accent="#00ff88">
          <div style={{ fontFamily: "monospace", fontSize: "1.4rem", fontWeight: 700, color: "#00ff88" }}>
            ${fmtPrice(d.bullTarget)}
          </div>
          <div style={{ fontSize: "0.72rem", color: "#4a5a72", marginTop: 6 }}>
            Extreme: ${fmtPrice(d.extremeBull)} · 2–3.5× ATR up
          </div>
        </Card>
      </div>

      {/* Support & Resistance */}
      <Section label="SUPPORT & RESISTANCE" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <Card label="RESISTANCE LEVELS" accent="#ff3355">
          {(d.resistance || []).map(([tag, val], i) => (
            <div
              key={i}
              style={{
                display: "flex", justifyContent: "space-between",
                padding: "8px 0", borderBottom: "1px solid #1a2030",
                fontFamily: "monospace", fontSize: "0.72rem",
              }}
            >
              <span style={{ color: "#4a5a72" }}>{tag}</span>
              <span style={{ color: `rgba(255,51,85,${1 - i * 0.2})` }}>${fmtPrice(val)}</span>
            </div>
          ))}
        </Card>
        <Card label="SUPPORT LEVELS" accent="#00ff88">
          {(d.support || []).map(([tag, val], i) => (
            <div
              key={i}
              style={{
                display: "flex", justifyContent: "space-between",
                padding: "8px 0", borderBottom: "1px solid #1a2030",
                fontFamily: "monospace", fontSize: "0.72rem",
              }}
            >
              <span style={{ color: "#4a5a72" }}>{tag}</span>
              <span style={{ color: `rgba(0,255,136,${1 - i * 0.2})` }}>${fmtPrice(val)}</span>
            </div>
          ))}
        </Card>
      </div>

      {/* Technical indicators */}
      <Section label="TECHNICAL INDICATORS" />
      <div style={{ background: "#0d1017", border: "1px solid #1a2030", padding: 16, marginBottom: 14 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {indicators.map(([name, val, sig, col], i) => (
              <tr key={i} style={{ borderBottom: "1px solid #1a2030" }}>
                <td style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "#4a5a72", padding: "9px 6px", width: "35%" }}>{name}</td>
                <td style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#e8f0ff", padding: "9px 6px" }}>{val}</td>
                <td style={{ fontFamily: "monospace", fontSize: "0.62rem", color: col, padding: "9px 6px", textAlign: "right" }}>{sig}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Signal meter */}
      <Section label="SIGNAL STRENGTH" />
      <div style={{ background: "#0d1017", border: "1px solid #1a2030", padding: 16, marginBottom: 14 }}>
        <div style={{ fontFamily: "monospace", fontSize: "0.58rem", color: "#4a5a72", letterSpacing: 2, marginBottom: 10 }}>
          BULL / BEAR METER — {d.bullScore} BULLISH vs {d.bearScore} BEARISH SIGNALS
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 6, background: i < bullBars ? biasColor : "#1a2030" }} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#4a5a72", whiteSpace: "nowrap" }}>
            BULL CONFIDENCE
          </span>
          <div style={{ flex: 1, height: 4, background: "#1a2030" }}>
            <div style={{ width: `${d.bullPct}%`, height: "100%", background: biasColor }} />
          </div>
          <span style={{ fontFamily: "monospace", fontSize: "0.7rem", color: biasColor }}>{d.bullPct}%</span>
        </div>
      </div>

      {/* AI analysis */}
      <Section label="AI ANALYSIS — POWERED BY CLAUDE" />
      <div style={{ background: "#0d1017", border: "1px solid #1a2030", padding: 22, marginBottom: 14, position: "relative" }}>
        <div
          style={{
            position: "absolute", top: 14, right: 14,
            fontFamily: "monospace", fontSize: "0.6rem", color: "#00ff88",
            background: "rgba(0,255,136,0.08)", padding: "3px 8px",
            border: "1px solid rgba(0,255,136,0.2)", letterSpacing: 2,
          }}
        >
          AI ◈
        </div>
        <div style={{ fontSize: "0.86rem", lineHeight: 1.9, color: "#c8d4e8", whiteSpace: "pre-wrap" }}>{d.analysis}</div>
      </div>

      {/* Educational outlook */}
      <Section label="EDUCATIONAL OUTLOOK SUMMARY" />
      <OutlookPanel o={d.outlook} symbol={d.symbol} />

      {/* Footer */}
      <div style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#4a5a72", textAlign: "right", paddingTop: 10, borderTop: "1px solid #1a2030" }}>
        GENERATED: {d.timestamp} · AI: CLAUDE SONNET · DATA: LIVE WEB
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const QUICK = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "DOGEUSDT", "AVAXUSDT", "ADAUSDT"];

export default function Page() {
  const [token,    setToken]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [loadStep, setLoadStep] = useState(0);
  const [result,   setResult]   = useState(null);
  const [error,    setError]    = useState(null);
  const [clock,    setClock]    = useState("");
  const stepRef = useRef(null);

  useEffect(() => {
    const t = setInterval(() => {
      const hms = new Date().toUTCString().match(/\d+:\d+:\d+/)?.[0] || "";
      setClock(hms + " UTC");
    }, 1000);
    return () => clearInterval(t);
  }, []);

  async function analyse() {
    const sym = token.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!sym) return;

    setLoading(true);
    setError(null);
    setResult(null);
    setLoadStep(0);

    stepRef.current = setInterval(() => setLoadStep((s) => Math.min(s + 1, 6)), 1400);

    try {
      // Calls your server-side API route — API key stays hidden
      const res  = await fetch("https://apex-signals.onrender.com/api/analyse"), {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ symbol: sym }),
      });
      const data = await res.json();

      if (!res.ok || data.error) throw new Error(data.error || "Analysis failed. Please try again.");

      setResult(data);
    } catch (e) {
      setError(e.message || "Analysis failed. Please try again.");
    } finally {
      clearInterval(stepRef.current);
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080a0f; }
        @keyframes apexSlide { 0% { transform: translateX(-200%); } 100% { transform: translateX(600%); } }
        input:focus { border-color: #00ff88 !important; box-shadow: 0 0 16px rgba(0,255,136,0.1) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #080a0f; }
        ::-webkit-scrollbar-thumb { background: #2a3550; }
      `}</style>

      <div style={{ background: "#080a0f", minHeight: "100vh", color: "#c8d4e8", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>

          {/* Header */}
          <div
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              borderBottom: "1px solid #1a2030", paddingBottom: 20, marginBottom: 24,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "monospace", fontSize: "2rem", fontWeight: 700,
                  letterSpacing: 4, color: "#00ff88",
                  textShadow: "0 0 24px rgba(0,255,136,0.4)",
                }}
              >
                APEX SIGNALS
              </div>
              <div style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#4a5a72", letterSpacing: 3, marginTop: 3 }}>
                CRYPTO ANALYSIS TERMINAL · AI POWERED
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <PulseDot />
              <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "#00ff88", letterSpacing: 2 }}>LIVE</span>
              <span style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#4a5a72" }}>{clock}</span>
            </div>
          </div>

          {/* Search */}
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <input
              style={{
                flex: 1, background: "#0d1017", border: "1px solid #2a3550",
                color: "#e8f0ff", fontFamily: "monospace", fontSize: "1.1rem",
                letterSpacing: 3, padding: "14px 18px", outline: "none", textTransform: "uppercase",
              }}
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && !loading && analyse()}
              placeholder="ENTER PAIR — BTCUSDT, ETHUSDT…"
              maxLength={20}
            />
            <button
              style={{
                background: loading ? "#2a3550" : "#00ff88",
                color:      loading ? "#4a5a72" : "#000",
                border: "none", fontFamily: "monospace", fontWeight: 700,
                fontSize: "0.9rem", letterSpacing: 3, padding: "14px 28px",
                cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap",
              }}
              onClick={analyse}
              disabled={loading}
            >
              {loading ? "ANALYSING…" : "ANALYSE ▶"}
            </button>
          </div>

          {/* Quick picks */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {QUICK.map((q) => (
              <span
                key={q}
                style={{
                  fontFamily: "monospace", fontSize: "0.62rem", color: "#4a5a72",
                  border: "1px solid #1a2030", padding: "4px 10px",
                  cursor: "pointer", letterSpacing: 1,
                }}
                onClick={() => setToken(q)}
              >
                {q}
              </span>
            ))}
          </div>

          {/* Disclaimer */}
          <div
            style={{
              background: "rgba(255,204,0,0.06)", border: "1px solid rgba(255,204,0,0.2)",
              padding: "10px 14px", marginBottom: 22,
              fontFamily: "monospace", fontSize: "0.65rem", color: "#ffcc00", lineHeight: 1.6,
            }}
          >
            ⚠ DISCLAIMER — For educational &amp; informational purposes only. Not financial advice.
            Crypto is highly volatile. Always DYOR. Never trade more than you can afford to lose.
          </div>

          {/* States */}
          {loading && <Loader step={loadStep} />}

          {!loading && error && (
            <div
              style={{
                background: "rgba(255,51,85,0.08)", border: "1px solid rgba(255,51,85,0.3)",
                color: "#ff3355", fontFamily: "monospace", fontSize: "0.78rem",
                padding: 16, marginBottom: 14, lineHeight: 1.7,
              }}
            >
              ⚠ ERROR: {error}
            </div>
          )}

          {!loading && !result && !error && (
            <div
              style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", padding: "70px 20px",
                border: "1px dashed #1a2030", gap: 12,
              }}
            >
              <div style={{ fontSize: "2.5rem", opacity: 0.15 }}>◈</div>
              <div style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#4a5a72", letterSpacing: 2 }}>
                ENTER A TOKEN PAIR TO BEGIN ANALYSIS
              </div>
            </div>
          )}

          {!loading && result && <Results d={result} />}

        </div>
      </div>
    </>
  );
}
