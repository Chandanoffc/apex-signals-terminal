import { useState, useEffect, useRef } from "react";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtPrice(n) {
  if (!n || isNaN(n)) return "—";
  if (n >= 1000) return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (n >= 1) return n.toFixed(4);
  return n.toFixed(6);
}

const C = {
  bg:      "#080a0f",
  panel:   "#0d1017",
  border:  "#1a2030",
  border2: "#2a3550",
  green:   "#00ff88",
  red:     "#ff3355",
  yellow:  "#ffcc00",
  blue:    "#4488ff",
  purple:  "#b060ff",
  cyan:    "#00d4ff",
  muted:   "#4a5a72",
  text:    "#c8d4e8",
  bright:  "#e8f0ff",
};

// ─── PulseDot ────────────────────────────────────────────────────────────────
function PulseDot({ color = "#00ff88" }) {
  const [op, setOp] = useState(1);
  useEffect(() => {
    const t = setInterval(() => setOp((o) => (o === 1 ? 0.3 : 1)), 900);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{
      width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
      background: color, boxShadow: `0 0 8px ${color}`,
      opacity: op, transition: "opacity 0.6s",
    }} />
  );
}

// ─── Loader ──────────────────────────────────────────────────────────────────
const LOAD_MSGS = [
  "FETCHING LIVE PRICE DATA...",
  "SCANNING MARKET CONDITIONS...",
  "COMPUTING TECHNICAL INDICATORS...",
  "ANALYSING RSI, MACD, BOLLINGER...",
  "DETECTING SUPPORT & RESISTANCE...",
  "SCANNING WHALE ACTIVITY...",
  "ANALYSING FUNDING & SENTIMENT...",
  "DETECTING SMART MONEY FLOWS...",
  "GENERATING AI ANALYSIS...",
  "ALMOST DONE...",
];
function Loader({ step }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "70px 20px", gap: 14 }}>
      <div style={{ width: 280, height: 2, background: C.border, overflow: "hidden" }}>
        <div style={{
          width: "40%", height: "100%",
          background: C.green, boxShadow: `0 0 8px ${C.green}`,
          animation: "apexSlide 1s infinite linear",
        }} />
      </div>
      <div style={{ fontFamily: "monospace", fontSize: "0.7rem", color: C.green, letterSpacing: 2 }}>
        {LOAD_MSGS[step % LOAD_MSGS.length]}
      </div>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────
function Section({ label, accent }) {
  return (
    <div style={{
      fontFamily: "monospace", fontSize: "0.58rem",
      color: accent || C.muted,
      letterSpacing: 3, textTransform: "uppercase", marginBottom: 10,
      display: "flex", alignItems: "center", gap: 10,
    }}>
      {label}
      <div style={{ flex: 1, height: 1, background: accent ? `linear-gradient(90deg,${accent}44,transparent)` : C.border }} />
    </div>
  );
}

// ─── Card ────────────────────────────────────────────────────────────────────
function Card({ label, accent, children, style: extraStyle = {} }) {
  const accentColor = accent || C.border2;
  return (
    <div style={{
      background: C.panel, border: `1px solid ${C.border}`,
      padding: 16, position: "relative", overflow: "hidden", ...extraStyle,
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg,transparent,${accentColor},transparent)`, opacity: 0.7,
      }} />
      {label && (
        <div style={{ fontFamily: "monospace", fontSize: "0.58rem", color: C.muted, letterSpacing: 2, marginBottom: 8 }}>
          {label}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────────────────
function Badge({ label, color }) {
  return (
    <span style={{
      fontFamily: "monospace", fontSize: "0.55rem", letterSpacing: 2,
      color, background: color + "18", border: `1px solid ${color}33`,
      padding: "2px 8px",
    }}>{label}</span>
  );
}

// ─── MiniBar ─────────────────────────────────────────────────────────────────
function MiniBar({ pct, color }) {
  return (
    <div style={{ flex: 1, height: 4, background: C.border }}>
      <div style={{ width: `${Math.min(100, Math.max(0, pct))}%`, height: "100%", background: color }} />
    </div>
  );
}

// ─── FundingPanel ────────────────────────────────────────────────────────────
function FundingPanel({ data }) {
  if (!data) return null;
  const rate = parseFloat(data.fundingRate) || 0;
  const rateColor = rate > 0.05 ? C.red : rate < -0.01 ? C.green : C.yellow;
  const sentColor = (data.sentiment === "GREED" || data.sentiment === "EXTREME GREED") ? C.red
    : (data.sentiment === "FEAR" || data.sentiment === "EXTREME FEAR") ? C.green : C.yellow;
  const oi = data.openInterestChange || 0;

  return (
    <div>
      <Section label="FUNDING RATE & MARKET SENTIMENT" accent={C.blue} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
        <Card label="FUNDING RATE (8H)" accent={rateColor}>
          <div style={{ fontFamily: "monospace", fontSize: "1.5rem", fontWeight: 700, color: rateColor }}>
            {rate >= 0 ? "+" : ""}{rate.toFixed(4)}%
          </div>
          <div style={{ fontSize: "0.7rem", color: C.muted, marginTop: 6, lineHeight: 1.5 }}>
            {rate > 0.05 ? "LONGS PAY SHORTS · CROWDED LONG" : rate < -0.01 ? "SHORTS PAY LONGS · CROWDED SHORT" : "BALANCED · NEUTRAL POSITIONING"}
          </div>
        </Card>

        <Card label="MARKET SENTIMENT" accent={sentColor}>
          <div style={{ fontFamily: "monospace", fontSize: "1.1rem", fontWeight: 700, color: sentColor }}>
            {data.sentiment || "—"}
          </div>
          <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontFamily: "monospace", fontSize: "0.62rem", color: C.muted }}>F&G</span>
              <MiniBar pct={data.fearGreedIndex || 50} color={sentColor} />
              <span style={{ fontFamily: "monospace", fontSize: "0.7rem", color: sentColor }}>{data.fearGreedIndex || "—"}</span>
            </div>
          </div>
        </Card>

        <Card label="OPEN INTEREST CHANGE" accent={oi >= 0 ? C.green : C.red}>
          <div style={{ fontFamily: "monospace", fontSize: "1.5rem", fontWeight: 700, color: oi >= 0 ? C.green : C.red }}>
            {oi >= 0 ? "▲" : "▼"} {Math.abs(oi).toFixed(1)}%
          </div>
          <div style={{ fontSize: "0.7rem", color: C.muted, marginTop: 6 }}>{data.openInterestUSD || "—"} TOTAL OI</div>
        </Card>

        <Card label="LONG / SHORT RATIO" accent={C.blue}>
          <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
            <div style={{ flex: data.longPct || 50, height: 8, background: C.green }} />
            <div style={{ flex: 100 - (data.longPct || 50), height: 8, background: C.red }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "monospace", fontSize: "0.72rem", color: C.green }}>▲ {data.longPct || "—"}%</span>
            <span style={{ fontFamily: "monospace", fontSize: "0.72rem", color: C.red }}>▼ {data.shortPct || "—"}%</span>
          </div>
        </Card>
      </div>

      {data.fundingNote && (
        <div style={{
          background: "#0a0e16", border: `1px solid ${C.border}`,
          borderLeft: `3px solid ${rateColor}`, padding: "10px 14px", marginBottom: 14,
          fontFamily: "monospace", fontSize: "0.68rem", color: C.text, lineHeight: 1.7,
        }}>
          <span style={{ color: rateColor, letterSpacing: 1 }}>◆ FUNDING INSIGHT — </span>{data.fundingNote}
        </div>
      )}
    </div>
  );
}

// ─── WhalePanel ──────────────────────────────────────────────────────────────
function WhalePanel({ data }) {
  if (!data) return null;
  const typeColor = (type) => (type === "BUY" || type === "LONG") ? C.green : C.red;
  const typeArrow = (type) => (type === "BUY" || type === "LONG") ? "▲" : "▼";

  return (
    <div>
      <Section label="WHALE ORDERS & LARGE TRANSACTIONS" accent={C.purple} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <Card label="LARGE TRANSACTIONS (RECENT)" accent={C.purple}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {(data.largeTxns || []).map((tx, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "7px 0", borderBottom: `1px solid ${C.border}`,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontFamily: "monospace", fontSize: "0.65rem", fontWeight: 700, color: typeColor(tx.type), minWidth: 60 }}>
                    {typeArrow(tx.type)} {tx.type}
                  </span>
                  <span style={{ fontFamily: "monospace", fontSize: "0.62rem", color: C.muted }}>{tx.exchange || "CEX"}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: C.bright }}>{tx.size}</div>
                  <div style={{ fontFamily: "monospace", fontSize: "0.58rem", color: C.muted }}>{tx.timeAgo}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Card label="ORDER BOOK PRESSURE" accent={C.purple}>
            <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 24,
                  background: i < Math.round((data.bidPressure || 50) / 10) ? C.green + "88" : C.red + "44",
                }} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color: C.green }}>BID {data.bidPressure || "—"}%</span>
              <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color: C.red }}>ASK {data.askPressure || "—"}%</span>
            </div>
          </Card>

          <Card label="LIQUIDATION LEVELS" accent={C.yellow}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontFamily: "monospace", fontSize: "0.62rem", color: C.muted }}>LONGS LIQ ZONE</span>
                <span style={{ fontFamily: "monospace", fontSize: "0.72rem", color: C.red }}>{data.longLiqZone || "—"}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0" }}>
                <span style={{ fontFamily: "monospace", fontSize: "0.62rem", color: C.muted }}>SHORTS LIQ ZONE</span>
                <span style={{ fontFamily: "monospace", fontSize: "0.72rem", color: C.green }}>{data.shortLiqZone || "—"}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {data.whaleNote && (
        <div style={{
          background: "#0a0e16", border: `1px solid ${C.border}`,
          borderLeft: `3px solid ${C.purple}`, padding: "10px 14px", marginBottom: 14,
          fontFamily: "monospace", fontSize: "0.68rem", color: C.text, lineHeight: 1.7,
        }}>
          <span style={{ color: C.purple, letterSpacing: 1 }}>◆ WHALE INSIGHT — </span>{data.whaleNote}
        </div>
      )}
    </div>
  );
}

// ─── SmartMoneyPanel ─────────────────────────────────────────────────────────
function SmartMoneyPanel({ data }) {
  if (!data) return null;
  const flowColor = data.netFlow === "INFLOW" ? C.red : data.netFlow === "OUTFLOW" ? C.green : C.yellow;
  const instColor = data.institutionalBias === "BULLISH" ? C.green : data.institutionalBias === "BEARISH" ? C.red : C.yellow;

  return (
    <div>
      <Section label="SMART MONEY & INSTITUTIONAL FLOW" accent={C.cyan} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
        <Card label="EXCHANGE NET FLOW" accent={flowColor}>
          <div style={{ fontFamily: "monospace", fontSize: "1.3rem", fontWeight: 700, color: flowColor }}>
            {data.netFlow || "—"}
          </div>
          <div style={{ fontSize: "0.7rem", color: C.muted, marginTop: 6 }}>{data.flowAmount || "—"}</div>
          <div style={{ fontSize: "0.65rem", color: C.text, marginTop: 4, lineHeight: 1.5 }}>
            {data.netFlow === "INFLOW"
              ? "Coins moving to exchanges — sell pressure possible"
              : data.netFlow === "OUTFLOW"
              ? "Coins leaving exchanges — accumulation signal"
              : "Neutral exchange flow"}
          </div>
        </Card>

        <Card label="INSTITUTIONAL BIAS" accent={instColor}>
          <div style={{ fontFamily: "monospace", fontSize: "1.3rem", fontWeight: 700, color: instColor }}>
            {data.institutionalBias || "—"}
          </div>
          <div style={{ fontSize: "0.7rem", color: C.muted, marginTop: 6 }}>{data.institutionalNote || "—"}</div>
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            {(data.institutionalSignals || []).map((s, i) => (
              <Badge key={i} label={s.label} color={s.bullish ? C.green : C.red} />
            ))}
          </div>
        </Card>

        <Card label="DERIVATIVES SIGNAL" accent={C.cyan}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(data.derivativeSignals || []).map(([label, val, col], i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "5px 0", borderBottom: `1px solid ${C.border}`,
              }}>
                <span style={{ fontFamily: "monospace", fontSize: "0.62rem", color: C.muted }}>{label}</span>
                <span style={{ fontFamily: "monospace", fontSize: "0.72rem", color: col || C.bright }}>{val}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card label="ON-CHAIN ACTIVITY SUMMARY" accent={C.cyan} style={{ marginBottom: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {(data.onChain || []).map(([label, val, sub, col], i) => (
            <div key={i}>
              <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: C.muted, letterSpacing: 2, marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: "monospace", fontSize: "1rem", fontWeight: 700, color: col || C.bright }}>{val}</div>
              <div style={{ fontSize: "0.65rem", color: C.muted, marginTop: 2 }}>{sub}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ─── MarketScreenerPanel ─────────────────────────────────────────────────────
function MarketScreenerPanel({ data }) {
  if (!data) return null;
  return (
    <div>
      <Section label="MARKET SCREENER — TOP MOVERS" accent={C.yellow} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <Card label="TOP BULLISH SETUPS" accent={C.green}>
          {(data.topBullish || []).map((coin, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "9px 0", borderBottom: `1px solid ${C.border}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: C.muted, minWidth: 14 }}>#{i + 1}</span>
                <div>
                  <div style={{ fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 700, color: C.green }}>{coin.symbol}</div>
                  <div style={{ fontFamily: "monospace", fontSize: "0.58rem", color: C.muted }}>{coin.reason}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: C.green }}>▲ {coin.change24h}</div>
                <div style={{ fontFamily: "monospace", fontSize: "0.6rem", color: C.muted }}>{coin.signal}</div>
              </div>
            </div>
          ))}
        </Card>

        <Card label="TOP BEARISH SETUPS" accent={C.red}>
          {(data.topBearish || []).map((coin, i) => (
            <div key={i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "9px 0", borderBottom: `1px solid ${C.border}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: C.muted, minWidth: 14 }}>#{i + 1}</span>
                <div>
                  <div style={{ fontFamily: "monospace", fontSize: "0.8rem", fontWeight: 700, color: C.red }}>{coin.symbol}</div>
                  <div style={{ fontFamily: "monospace", fontSize: "0.58rem", color: C.muted }}>{coin.reason}</div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: C.red }}>▼ {coin.change24h}</div>
                <div style={{ fontFamily: "monospace", fontSize: "0.6rem", color: C.muted }}>{coin.signal}</div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {data.sectorRotation && (
        <Card label="SECTOR ROTATION & MARKET NARRATIVE" accent={C.yellow} style={{ marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: C.muted, letterSpacing: 2, marginBottom: 8 }}>LEADING SECTORS</div>
              {(data.sectorRotation.leading || []).map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontFamily: "monospace", fontSize: "0.7rem", color: C.text }}>{s.name}</span>
                  <span style={{ fontFamily: "monospace", fontSize: "0.7rem", color: C.green }}>▲ {s.change}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: C.muted, letterSpacing: 2, marginBottom: 8 }}>LAGGING SECTORS</div>
              {(data.sectorRotation.lagging || []).map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <span style={{ fontFamily: "monospace", fontSize: "0.7rem", color: C.text }}>{s.name}</span>
                  <span style={{ fontFamily: "monospace", fontSize: "0.7rem", color: C.red }}>▼ {s.change}</span>
                </div>
              ))}
            </div>
          </div>
          {data.sectorRotation.narrative && (
            <div style={{
              marginTop: 12, padding: "10px 12px",
              background: C.bg, borderLeft: `3px solid ${C.yellow}`,
              fontSize: "0.78rem", color: C.text, lineHeight: 1.7,
            }}>{data.sectorRotation.narrative}</div>
          )}
        </Card>
      )}
    </div>
  );
}

// ─── OutlookPanel ────────────────────────────────────────────────────────────
function OutlookPanel({ o, symbol }) {
  if (!o) return null;
  const isBull = o.momentum === "BULLISH";
  const isBear = o.momentum === "BEARISH";
  const mainColor    = isBull ? C.green : isBear ? C.red : C.yellow;
  const bgColor      = isBull ? "rgba(0,255,136,0.04)" : isBear ? "rgba(255,51,85,0.04)" : "rgba(255,204,0,0.04)";
  const borderCol    = isBull ? "rgba(0,255,136,0.25)" : isBear ? "rgba(255,51,85,0.25)" : "rgba(255,204,0,0.25)";
  const arrow        = isBull ? "▲" : isBear ? "▼" : "◆";
  const strengthColor = o.strength === "STRONG" ? mainColor : o.strength === "MODERATE" ? C.yellow : C.muted;
  const conf = Math.min(100, Math.max(0, o.confidencePct || 50));

  return (
    <div style={{
      border: `1px solid ${borderCol}`, background: bgColor,
      padding: 24, marginBottom: 14, position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg,transparent,${mainColor},transparent)`, opacity: 0.7,
      }} />
      <div style={{
        position: "absolute", top: 14, right: 14,
        fontFamily: "monospace", fontSize: "0.55rem", color: mainColor,
        background: mainColor + "18", border: `1px solid ${mainColor}33`,
        padding: "3px 8px", letterSpacing: 2,
      }}>EDUCATIONAL</div>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "monospace", fontSize: "0.58rem", color: C.muted, letterSpacing: 3, marginBottom: 6 }}>
            CURRENT MOMENTUM OUTLOOK · {symbol}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              fontFamily: "monospace", fontSize: "2.4rem", fontWeight: 700,
              color: mainColor, lineHeight: 1, textShadow: `0 0 30px ${mainColor}66`,
            }}>{arrow} {o.momentum}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{
                fontFamily: "monospace", fontSize: "0.65rem", color: strengthColor,
                border: `1px solid ${strengthColor}44`, padding: "2px 10px", letterSpacing: 2,
              }}>{o.strength}</div>
              <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: C.muted, letterSpacing: 1 }}>SIGNAL STRENGTH</div>
            </div>
          </div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right", minWidth: 120 }}>
          <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: C.muted, letterSpacing: 2, marginBottom: 6 }}>CONFIDENCE</div>
          <div style={{ fontFamily: "monospace", fontSize: "2rem", fontWeight: 700, color: mainColor, lineHeight: 1 }}>{conf}%</div>
          <div style={{ width: 120, height: 4, background: C.border, marginTop: 6, marginLeft: "auto" }}>
            <div style={{ width: `${conf}%`, height: "100%", background: mainColor }} />
          </div>
        </div>
      </div>

      <div style={{
        background: C.bg, border: `1px solid ${borderCol}`,
        borderLeft: `3px solid ${mainColor}`, padding: "14px 16px", marginBottom: 16,
      }}>
        <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: C.muted, letterSpacing: 2, marginBottom: 6 }}>VERDICT</div>
        <div style={{ fontSize: "0.88rem", color: C.bright, lineHeight: 1.7 }}>{o.verdict}</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
        {[
          ["ENTRY ZONE",  o.entryZone,  C.blue],
          ["TARGET ZONE", o.targetZone, C.green],
          ["STOP ZONE",   o.stopZone,   C.red],
        ].map(([lbl, val, col]) => (
          <div key={lbl} style={{
            background: C.bg, border: `1px solid ${C.border}`,
            borderTop: `2px solid ${col}44`, padding: "12px 14px",
          }}>
            <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: C.muted, letterSpacing: 2, marginBottom: 6 }}>{lbl}</div>
            <div style={{ fontFamily: "monospace", fontSize: "0.8rem", color: col, fontWeight: 700 }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: C.muted, letterSpacing: 2, marginBottom: 10 }}>KEY REASONS</div>
        {(o.reasons || []).map((r, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
            <span style={{ color: mainColor, fontFamily: "monospace", fontSize: "0.7rem", marginTop: 1, flexShrink: 0 }}>◆</span>
            <span style={{ fontSize: "0.82rem", color: C.text, lineHeight: 1.6 }}>{r}</span>
          </div>
        ))}
      </div>

      {o.watchOut && (
        <div style={{ background: "rgba(255,204,0,0.05)", border: "1px solid rgba(255,204,0,0.2)", padding: "10px 14px" }}>
          <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: C.yellow, letterSpacing: 1 }}>⚠ WATCH OUT — </span>
          <span style={{ fontSize: "0.8rem", color: C.text }}>{o.watchOut}</span>
        </div>
      )}
      <div style={{ marginTop: 14, fontFamily: "monospace", fontSize: "0.58rem", color: "#2a3550", lineHeight: 1.6 }}>
        ※ This outlook is for internal educational analysis only. It does not constitute financial advice or a trade recommendation.
      </div>
    </div>
  );
}

// ─── Results ─────────────────────────────────────────────────────────────────
function Results({ d }) {
  const bias       = d.bias || "neutral";
  const biasColor  = bias === "bullish" ? C.green : bias === "bearish" ? C.red : C.yellow;
  const biasLabel  = bias === "bullish" ? "▲ BULLISH" : bias === "bearish" ? "▼ BEARISH" : "◆ NEUTRAL";
  const rangePos   = d.high24h && d.low24h
    ? Math.min(100, Math.max(0, ((d.currentPrice - d.low24h) / (d.high24h - d.low24h)) * 100))
    : 50;
  const bullBars   = Math.round(((d.bullPct || 50) / 100) * 10);
  const indicators = d.indicators || [];

  return (
    <div>
      {/* Token header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        marginBottom: 20, paddingBottom: 18, borderBottom: `1px solid ${C.border}`,
        flexWrap: "wrap", gap: 12,
      }}>
        <div>
          <div style={{ fontFamily: "monospace", fontSize: "2rem", fontWeight: 700, letterSpacing: 4, color: biasColor }}>
            {d.symbol}
          </div>
          <div style={{ fontFamily: "monospace", fontSize: "0.6rem", color: C.muted, letterSpacing: 2, marginTop: 4 }}>
            PERPETUAL FUTURES · USDT MARGINED
          </div>
        </div>
        <div>
          <div style={{
            fontFamily: "monospace", fontWeight: 700, fontSize: "1.1rem", letterSpacing: 3,
            padding: "10px 22px", border: `2px solid ${biasColor}`,
            color: biasColor, background: biasColor + "18", textAlign: "center",
          }}>{biasLabel}</div>
          <div style={{ fontFamily: "monospace", fontSize: "0.58rem", color: C.muted, textAlign: "center", marginTop: 5 }}>
            {d.bullScore}B / {d.bearScore}Be SIGNALS
          </div>
        </div>
      </div>

      {/* ── ORIGINAL PANELS ── */}
      <Section label="PRICE OVERVIEW" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
        <Card label="CURRENT PRICE" accent={d.priceChange24h >= 0 ? C.green : C.red}>
          <div style={{ fontFamily: "monospace", fontSize: "1.4rem", fontWeight: 700, color: d.priceChange24h >= 0 ? C.green : C.red }}>
            ${fmtPrice(d.currentPrice)}
          </div>
          <div style={{ fontSize: "0.72rem", color: C.muted, marginTop: 6 }}>
            {d.priceChange24h >= 0 ? "▲" : "▼"} {Math.abs(d.priceChange24h || 0).toFixed(2)}% (24H)
          </div>
        </Card>
        <Card label="24H RANGE" accent={C.border2}>
          <div style={{ fontFamily: "monospace", fontSize: "0.9rem", color: C.bright, marginTop: 4 }}>
            ${fmtPrice(d.low24h)} — ${fmtPrice(d.high24h)}
          </div>
          <div style={{ fontSize: "0.72rem", color: C.muted, marginTop: 6 }}>Spread: {d.spread || "—"}%</div>
        </Card>
        <Card label="24H VOLUME" accent={C.yellow}>
          <div style={{ fontFamily: "monospace", fontSize: "1.4rem", fontWeight: 700, color: C.yellow }}>
            {d.volume24h || "—"}
          </div>
          <div style={{ fontSize: "0.72rem", color: C.muted, marginTop: 6 }}>ATR(14): ${fmtPrice(d.atr)}</div>
        </Card>
      </div>

      <Section label="INTRADAY POSITION" />
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, padding: 16, marginBottom: 14 }}>
        <div style={{ fontFamily: "monospace", fontSize: "0.58rem", color: C.muted, letterSpacing: 2, marginBottom: 14 }}>
          PRICE POSITION IN 24H RANGE
        </div>
        <div style={{ position: "relative", margin: "10px 0 6px" }}>
          <div style={{ height: 8, background: "linear-gradient(90deg,#ff3355,#ffcc00,#00ff88)" }} />
          <div style={{
            position: "absolute", top: "50%", left: `${rangePos}%`,
            transform: "translate(-50%,-50%)",
            width: 14, height: 14, background: "#fff",
            border: `2px solid ${C.bg}`, borderRadius: "50%",
            boxShadow: "0 0 10px rgba(255,255,255,0.6)",
          }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
          <div style={{ fontFamily: "monospace", fontSize: "0.68rem", color: C.red }}>
            ▼ ${fmtPrice(d.low24h)}<br /><span style={{ color: C.muted, fontSize: "0.55rem" }}>24H LOW</span>
          </div>
          <div style={{ fontFamily: "monospace", fontSize: "0.68rem", color: C.bright, textAlign: "center" }}>
            ◆ ${fmtPrice(d.currentPrice)}<br /><span style={{ color: C.muted, fontSize: "0.55rem" }}>{rangePos.toFixed(0)}% OF RANGE</span>
          </div>
          <div style={{ fontFamily: "monospace", fontSize: "0.68rem", color: C.green, textAlign: "right" }}>
            ▲ ${fmtPrice(d.high24h)}<br /><span style={{ color: C.muted, fontSize: "0.55rem" }}>24H HIGH</span>
          </div>
        </div>
      </div>

      <Section label="PROJECTED INTRADAY RANGES (ATR-BASED)" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <Card label="BEARISH PROJECTION" accent={C.red}>
          <div style={{ fontFamily: "monospace", fontSize: "1.4rem", fontWeight: 700, color: C.red }}>${fmtPrice(d.bearTarget)}</div>
          <div style={{ fontSize: "0.72rem", color: C.muted, marginTop: 6 }}>Extreme: ${fmtPrice(d.extremeBear)} · 2–3.5× ATR down</div>
        </Card>
        <Card label="BULLISH PROJECTION" accent={C.green}>
          <div style={{ fontFamily: "monospace", fontSize: "1.4rem", fontWeight: 700, color: C.green }}>${fmtPrice(d.bullTarget)}</div>
          <div style={{ fontSize: "0.72rem", color: C.muted, marginTop: 6 }}>Extreme: ${fmtPrice(d.extremeBull)} · 2–3.5× ATR up</div>
        </Card>
      </div>

      <Section label="SUPPORT & RESISTANCE" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <Card label="RESISTANCE LEVELS" accent={C.red}>
          {(d.resistance || []).map(([tag, val], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontFamily: "monospace", fontSize: "0.72rem" }}>
              <span style={{ color: C.muted }}>{tag}</span>
              <span style={{ color: `rgba(255,51,85,${1 - i * 0.2})` }}>${fmtPrice(val)}</span>
            </div>
          ))}
        </Card>
        <Card label="SUPPORT LEVELS" accent={C.green}>
          {(d.support || []).map(([tag, val], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${C.border}`, fontFamily: "monospace", fontSize: "0.72rem" }}>
              <span style={{ color: C.muted }}>{tag}</span>
              <span style={{ color: `rgba(0,255,136,${1 - i * 0.2})` }}>${fmtPrice(val)}</span>
            </div>
          ))}
        </Card>
      </div>

      <Section label="TECHNICAL INDICATORS" />
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, padding: 16, marginBottom: 14 }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <tbody>
            {indicators.map(([name, val, sig, col], i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ fontFamily: "monospace", fontSize: "0.65rem", color: C.muted, padding: "9px 6px", width: "35%" }}>{name}</td>
                <td style={{ fontFamily: "monospace", fontSize: "0.75rem", color: C.bright, padding: "9px 6px" }}>{val}</td>
                <td style={{ fontFamily: "monospace", fontSize: "0.62rem", color: col, padding: "9px 6px", textAlign: "right" }}>{sig}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Section label="SIGNAL STRENGTH" />
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, padding: 16, marginBottom: 14 }}>
        <div style={{ fontFamily: "monospace", fontSize: "0.58rem", color: C.muted, letterSpacing: 2, marginBottom: 10 }}>
          BULL / BEAR METER — {d.bullScore} BULLISH vs {d.bearScore} BEARISH SIGNALS
        </div>
        <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: 6, background: i < bullBars ? biasColor : C.border }} />
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontFamily: "monospace", fontSize: "0.6rem", color: C.muted, whiteSpace: "nowrap" }}>BULL CONFIDENCE</span>
          <div style={{ flex: 1, height: 4, background: C.border }}>
            <div style={{ width: `${d.bullPct}%`, height: "100%", background: biasColor }} />
          </div>
          <span style={{ fontFamily: "monospace", fontSize: "0.7rem", color: biasColor }}>{d.bullPct}%</span>
        </div>
      </div>

      {/* ── NEW PANELS ── */}
      <FundingPanel data={d.funding} />
      <WhalePanel data={d.whale} />
      <SmartMoneyPanel data={d.smartMoney} />
      <MarketScreenerPanel data={d.screener} />

      {/* AI analysis */}
      <Section label="AI ANALYSIS — POWERED BY CLAUDE" />
      <div style={{ background: C.panel, border: `1px solid ${C.border}`, padding: 22, marginBottom: 14, position: "relative" }}>
        <div style={{
          position: "absolute", top: 14, right: 14,
          fontFamily: "monospace", fontSize: "0.6rem", color: C.green,
          background: "rgba(0,255,136,0.08)", padding: "3px 8px",
          border: "1px solid rgba(0,255,136,0.2)", letterSpacing: 2,
        }}>AI ◈</div>
        <div style={{ fontSize: "0.86rem", lineHeight: 1.9, color: C.text, whiteSpace: "pre-wrap" }}>{d.analysis}</div>
      </div>

      <Section label="EDUCATIONAL OUTLOOK SUMMARY" />
      <OutlookPanel o={d.outlook} symbol={d.symbol} />

      <div style={{ fontFamily: "monospace", fontSize: "0.6rem", color: C.muted, textAlign: "right", paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
        GENERATED: {d.timestamp} · AI: CLAUDE SONNET · DATA: LIVE WEB
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
const QUICK = ["BTC", "ETH", "SOL", "BNB", "XRP", "DOGE", "AVAX", "ADA"];

export default function App() {
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
    let sym = token.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (!sym) return;
    if (!sym.endsWith("USDT")) sym += "USDT";

    setLoading(true);
    setError(null);
    setResult(null);
    setLoadStep(0);

    stepRef.current = setInterval(() => setLoadStep((s) => Math.min(s + 1, 9)), 1400);

    try {
      const res  = await fetch(`https://apex-signals-terminal.onrender.com/analysis/${sym}`);
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || "Analysis failed");
      setResult(data);
    } catch (e) {
      setError(e.message || "Analysis failed");
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
        body { background: ${C.bg}; }
        @keyframes apexSlide { 0% { transform: translateX(-200%); } 100% { transform: translateX(600%); } }
        input:focus { border-color: ${C.green} !important; box-shadow: 0 0 16px rgba(0,255,136,0.1) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: ${C.bg}; }
        ::-webkit-scrollbar-thumb { background: ${C.border2}; }
      `}</style>

      <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px" }}>

          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            borderBottom: `1px solid ${C.border}`, paddingBottom: 20, marginBottom: 24,
          }}>
            <div>
              <div style={{
                fontFamily: "monospace", fontSize: "2rem", fontWeight: 700,
                letterSpacing: 4, color: C.green, textShadow: "0 0 24px rgba(0,255,136,0.4)",
              }}>APEX SIGNALS</div>
              <div style={{ fontFamily: "monospace", fontSize: "0.6rem", color: C.muted, letterSpacing: 3, marginTop: 3 }}>
                CRYPTO ANALYSIS TERMINAL · AI POWERED
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <PulseDot />
              <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color: C.green, letterSpacing: 2 }}>LIVE</span>
              <span style={{ fontFamily: "monospace", fontSize: "0.7rem", color: C.muted }}>{clock}</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <input
              style={{
                flex: 1, background: C.panel, border: `1px solid ${C.border2}`,
                color: C.bright, fontFamily: "monospace", fontSize: "1.1rem",
                letterSpacing: 3, padding: "14px 18px", outline: "none", textTransform: "uppercase",
              }}
              value={token}
              onChange={(e) => setToken(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && !loading && analyse()}
              placeholder="ENTER PAIR — BTC, ETH, SOL…"
              maxLength={20}
            />
            <button
              style={{
                background: loading ? C.border2 : C.green,
                color: loading ? C.muted : "#000",
                border: "none", fontFamily: "monospace", fontWeight: 700,
                fontSize: "0.9rem", letterSpacing: 3, padding: "14px 28px",
                cursor: loading ? "not-allowed" : "pointer", whiteSpace: "nowrap",
              }}
              onClick={analyse}
              disabled={loading}
            >{loading ? "ANALYSING…" : "ANALYSE ▶"}</button>
          </div>

          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
            {QUICK.map((q) => (
              <span key={q} style={{
                fontFamily: "monospace", fontSize: "0.62rem", color: C.muted,
                border: `1px solid ${C.border}`, padding: "4px 10px",
                cursor: "pointer", letterSpacing: 1,
              }} onClick={() => setToken(q)}>{q}</span>
            ))}
          </div>

          <div style={{
            background: "rgba(255,204,0,0.06)", border: "1px solid rgba(255,204,0,0.2)",
            padding: "10px 14px", marginBottom: 22,
            fontFamily: "monospace", fontSize: "0.65rem", color: C.yellow, lineHeight: 1.6,
          }}>
            ⚠ DISCLAIMER — For educational &amp; informational purposes only. Not financial advice.
            Crypto is highly volatile. Always DYOR. Never trade more than you can afford to lose.
          </div>

          {loading && <Loader step={loadStep} />}

          {!loading && error && (
            <div style={{
              background: "rgba(255,51,85,0.08)", border: "1px solid rgba(255,51,85,0.3)",
              color: C.red, fontFamily: "monospace", fontSize: "0.78rem",
              padding: 16, marginBottom: 14, lineHeight: 1.7,
            }}>⚠ ERROR: {error}</div>
          )}

          {!loading && !result && !error && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", padding: "70px 20px",
              border: `1px dashed ${C.border}`, gap: 12,
            }}>
              <div style={{ fontSize: "2.5rem", opacity: 0.15 }}>◈</div>
              <div style={{ fontFamily: "monospace", fontSize: "0.7rem", color: C.muted, letterSpacing: 2 }}>
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
