import { useState, useCallback } from "react";

const BACKEND = "https://sisa-backend-lovat.vercel.app";

const RISK_META = {
  none:     { color: "#10b981", bg: "#064e3b22", label: "NONE",     glow: "#10b98133" },
  low:      { color: "#3b82f6", bg: "#1e3a5f22", label: "LOW",      glow: "#3b82f633" },
  medium:   { color: "#f59e0b", bg: "#451a0322", label: "MEDIUM",   glow: "#f59e0b33" },
  high:     { color: "#f97316", bg: "#431a0022", label: "HIGH",     glow: "#f9731633" },
  critical: { color: "#ef4444", bg: "#450a0a22", label: "CRITICAL", glow: "#ef444433" },
};

const TYPE_ICONS = {
  email: "✉",
  phone: "☎",
  api_key: "🔑",
  password: "🔒",
  token: "🎟",
  aws_key: "☁",
  private_key: "🗝",
  stack_trace: "⚠",
  ip_address: "🌐",
  jwt_token: "🪙",
  sql_injection: "💉",
  xss_attack: "🕷",
  command_injection: "💀",
  path_traversal: "🗂",
  hardcoded_credentials: "👤",
};

function RiskBadge({ risk, small }) {
  const m = RISK_META[risk] || RISK_META.low;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      background: m.bg, color: m.color,
      border: `1px solid ${m.color}44`,
      padding: small ? "2px 8px" : "3px 12px",
      borderRadius: 20,
      fontSize: small ? 10 : 11,
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 700,
      letterSpacing: "0.08em",
      whiteSpace: "nowrap",
    }}>
      {m.label}
    </span>
  );
}

function RiskGauge({ score, level }) {
  const m = RISK_META[level] || RISK_META.none;
  const pct = (score / 10) * 100;
  const r = 36, cx = 44, cy = 44;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <svg width={88} height={88} viewBox="0 0 88 88">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#1e293b" strokeWidth={8} />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={m.color} strokeWidth={8}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ filter: `drop-shadow(0 0 6px ${m.glow})`, transition: "stroke-dasharray 0.6s ease" }}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fill={m.color}
        fontSize={18} fontWeight={800} fontFamily="'JetBrains Mono', monospace">{score}</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="#475569"
        fontSize={9} fontFamily="sans-serif" letterSpacing="0.05em">SCORE</text>
    </svg>
  );
}

function FindingRow({ f, i }) {
  const icon = TYPE_ICONS[f.type] || "•";
  const m = RISK_META[f.risk] || RISK_META.low;
  return (
    <div style={{
      display: "flex", gap: 12, alignItems: "flex-start",
      padding: "10px 14px",
      background: "#0a0f1a",
      border: `1px solid ${m.color}22`,
      borderLeft: `3px solid ${m.color}`,
      borderRadius: 8,
      marginBottom: 8,
      animation: `fadeSlide 0.3s ease ${i * 0.05}s both`,
    }}>
      <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>{icon}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 4 }}>
          <span style={{ fontWeight: 700, color: "#e2e8f0", fontSize: 13,
            fontFamily: "'JetBrains Mono', monospace" }}>
            {f.type.replace(/_/g, " ")}
          </span>
          <RiskBadge risk={f.risk} small />
          <span style={{ color: "#475569", fontSize: 11 }}>Line {f.line}</span>
        </div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
          color: "#64748b", wordBreak: "break-all",
          background: "#111827", padding: "4px 8px", borderRadius: 4,
        }}>
          {f.snippet}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("text");
  const [inputType, setInputType] = useState("log");
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const analyzeText = async () => {
    if (!text.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res = await fetch(`${BACKEND}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_type: inputType,
          content: text,
          options: { mask: true, block_high_risk: false, log_analysis: true },
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setResult(await res.json());
    } catch (e) {
      setError(`Backend unreachable: ${e.message}`);
    }
    setLoading(false);
  };

  const analyzeFile = async () => {
    if (!file) return;
    setLoading(true); setError(""); setResult(null);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await fetch(`${BACKEND}/analyze/file`, { method: "POST", body: fd });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setResult(await res.json());
    } catch (e) {
      setError(`Backend unreachable: ${e.message}`);
    }
    setLoading(false);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) setFile(f);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#060b14", color: "#e2e8f0",
      fontFamily: "'Inter', 'SF Pro Display', sans-serif" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0f1a; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }

        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 #6366f122; }
          50%       { box-shadow: 0 0 0 6px #6366f111; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        .tab-btn {
          padding: 8px 20px; border-radius: 8px; border: 1px solid #1e293b;
          cursor: pointer; font-weight: 600; font-size: 13px; transition: all 0.2s;
          letter-spacing: 0.02em;
        }
        .tab-btn:hover { border-color: #334155; }
        .tab-btn.active { background: #6366f1; color: #fff; border-color: #6366f1;
          box-shadow: 0 0 16px #6366f144; }
        .tab-btn.inactive { background: #0d1421; color: #64748b; }

        .type-btn {
          padding: 5px 14px; border-radius: 6px; border: 1px solid #1e293b;
          cursor: pointer; font-size: 12px; font-family: 'JetBrains Mono', monospace;
          transition: all 0.15s; letter-spacing: 0.03em;
        }
        .type-btn.active  { background: #1e293b; color: #e2e8f0; border-color: #334155; }
        .type-btn.inactive { background: transparent; color: #475569; }

        .analyze-btn {
          padding: 11px 28px; border-radius: 10px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff; font-weight: 700; font-size: 14px; letter-spacing: 0.02em;
          transition: all 0.2s;
          box-shadow: 0 4px 20px #6366f133;
        }
        .analyze-btn:hover:not(:disabled) {
          transform: translateY(-1px); box-shadow: 0 6px 28px #6366f155;
        }
        .analyze-btn:disabled {
          opacity: 0.45; cursor: not-allowed; transform: none;
        }

        .card {
          background: #0d1421;
          border: 1px solid #1a2540;
          border-radius: 14px;
          padding: 24px;
          margin-bottom: 16px;
          animation: fadeSlide 0.4s ease both;
        }

        .section-title {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 14px;
          letter-spacing: 0.06em; text-transform: uppercase;
          color: #64748b; margin-bottom: 16px;
          display: flex; align-items: center; gap: 8px;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .insight-item {
          display: flex; gap: 10px; margin-bottom: 10px;
          font-size: 13.5px; color: #94a3b8; line-height: 1.65;
          padding: 8px 10px; border-radius: 8px;
          background: #060b14;
          border: 1px solid #1a2540;
          transition: border-color 0.2s;
        }
        .insight-item:hover { border-color: #334155; }

        .drop-zone {
          border: 2px dashed #1e293b; border-radius: 14px;
          padding: 40px 24px; text-align: center; cursor: pointer;
          background: #0a0f1a; transition: all 0.2s;
        }
        .drop-zone.over {
          border-color: #6366f1; background: #1e1b4b22;
          box-shadow: 0 0 24px #6366f122;
        }

        .noise-bg {
          position: fixed; inset: 0; pointer-events: none; z-index: 0; opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
        }

        @media (max-width: 720px) {
          .grid-2 { grid-template-columns: 1fr; }
          .card { padding: 16px; }
          .risk-row { flex-direction: column !important; gap: 16px !important; }
          .analyze-btn { width: 100%; }
        }
      `}</style>

      <div className="noise-bg" />

      {/* ── Header ── */}
      <header style={{
        background: "#0a0f1a",
        borderBottom: "1px solid #1a2540",
        padding: "16px 32px",
        display: "flex", alignItems: "center", gap: 14,
        position: "sticky", top: 0, zIndex: 100,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{
          width: 38, height: 38,
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          borderRadius: 10, display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: 20,
          boxShadow: "0 0 20px #6366f144", flexShrink: 0,
        }}>🛡</div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: "'Syne', sans-serif", fontWeight: 800,
            fontSize: 17, letterSpacing: "-0.02em", color: "#f1f5f9",
          }}>
            AI Secure Data Intelligence
          </div>
          <div style={{ fontSize: 11, color: "#475569", letterSpacing: "0.04em",
            fontFamily: "'JetBrains Mono', monospace" }}>
            POWERED BY GROQ · LLAMA 3.3 · REGEX ENGINE
          </div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "5px 12px", borderRadius: 20,
          background: "#064e3b22", border: "1px solid #10b98133",
        }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#10b981",
            animation: "pulse-glow 2s infinite" }} />
          <span style={{ fontSize: 11, color: "#10b981",
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>LIVE</span>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: 920, margin: "32px auto", padding: "0 20px", position: "relative", zIndex: 1 }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {[["text", "📝  Text / Log"], ["file", "📁  File Upload"]].map(([key, label]) => (
            <button key={key} className={`tab-btn ${tab === key ? "active" : "inactive"}`}
              onClick={() => { setTab(key); setResult(null); setError(""); }}>
              {label}
            </button>
          ))}
        </div>

        {/* Input Card */}
        <div className="card" style={{ marginBottom: 20 }}>
          {tab === "text" ? (
            <>
              <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
                {["text", "log", "sql", "chat"].map((t) => (
                  <button key={t} className={`type-btn ${inputType === t ? "active" : "inactive"}`}
                    onClick={() => setInputType(t)}>
                    {t.toUpperCase()}
                  </button>
                ))}
              </div>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={`Paste your ${inputType} content here to scan for sensitive data, injection attacks, credentials...`}
                style={{
                  width: "100%", height: 200,
                  background: "#060b14",
                  border: "1px solid #1a2540",
                  borderRadius: 10, color: "#cbd5e1",
                  fontSize: 13, padding: 14, resize: "vertical",
                  fontFamily: "'JetBrains Mono', monospace",
                  lineHeight: 1.7, outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                onBlur={(e) => e.target.style.borderColor = "#1a2540"}
              />
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                <button className="analyze-btn" onClick={analyzeText}
                  disabled={loading || !text.trim()}>
                  {loading
                    ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 14, height: 14, border: "2px solid #ffffff44",
                          borderTop: "2px solid #fff", borderRadius: "50%",
                          display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                        Analyzing...
                      </span>
                    : "🔍  Analyze Content"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div
                className={`drop-zone ${dragOver ? "over" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("__fi").click()}
              >
                <div style={{ fontSize: 42, marginBottom: 10 }}>
                  {file ? "📄" : "📂"}
                </div>
                <div style={{ color: "#64748b", fontSize: 14, lineHeight: 1.6 }}>
                  {file
                    ? <><span style={{ color: "#a5b4fc", fontWeight: 600 }}>{file.name}</span>
                        <br /><span style={{ fontSize: 12 }}>{(file.size / 1024).toFixed(1)} KB</span></>
                    : <>Drag & drop or <span style={{ color: "#a5b4fc" }}>click to browse</span>
                        <br /><span style={{ fontSize: 12 }}>.log · .txt · .pdf · .docx</span></>}
                </div>
                <input id="__fi" type="file" accept=".log,.txt,.pdf,.docx"
                  style={{ display: "none" }}
                  onChange={(e) => setFile(e.target.files[0])} />
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
                <button className="analyze-btn" onClick={analyzeFile}
                  disabled={loading || !file}>
                  {loading
                    ? <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 14, height: 14, border: "2px solid #ffffff44",
                          borderTop: "2px solid #fff", borderRadius: "50%",
                          display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                        Scanning...
                      </span>
                    : "🔍  Scan File"}
                </button>
              </div>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "#450a0a22", border: "1px solid #ef444444",
            borderRadius: 10, padding: "14px 18px", marginBottom: 20,
            color: "#fca5a5", fontSize: 13, display: "flex", gap: 10,
            alignItems: "flex-start", animation: "fadeSlide 0.3s ease both",
          }}>
            <span style={{ flexShrink: 0 }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Results */}
        {result && (() => {
          const m = RISK_META[result.risk_level] || RISK_META.none;
          return (
            <>
              {/* Risk Overview */}
              <div className="card">
                <div className="section-title">
                  <span>◈</span> Risk Overview
                </div>
                <div className="risk-row" style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
                  <RiskGauge score={result.risk_score} level={result.risk_level} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <RiskBadge risk={result.risk_level} />
                      <span style={{ fontSize: 12, color: "#475569",
                        fontFamily: "'JetBrains Mono', monospace" }}>
                        action: <span style={{ color: m.color }}>{result.action?.toUpperCase()}</span>
                      </span>
                      {result.filename && (
                        <span style={{ fontSize: 12, color: "#475569",
                          fontFamily: "'JetBrains Mono', monospace" }}>
                          · {result.filename}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 14, color: "#94a3b8", lineHeight: 1.7, maxWidth: 580 }}>
                      {result.summary}
                    </div>
                    <div style={{ display: "flex", gap: 14, marginTop: 4, flexWrap: "wrap" }}>
                      {[
                        ["Findings", result.findings?.length ?? 0],
                        ["Risk Score", `${result.risk_score}/10`],
                        ["Type", result.content_type],
                      ].map(([lbl, val]) => (
                        <div key={lbl} style={{
                          background: "#060b14", border: "1px solid #1a2540",
                          borderRadius: 8, padding: "6px 14px",
                          display: "flex", flexDirection: "column", gap: 2,
                        }}>
                          <span style={{ fontSize: 10, color: "#475569",
                            fontFamily: "'JetBrains Mono', monospace",
                            textTransform: "uppercase", letterSpacing: "0.06em" }}>{lbl}</span>
                          <span style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Findings */}
              {result.findings?.length > 0 && (
                <div className="card">
                  <div className="section-title">
                    <span>◈</span> Detected Issues
                    <span style={{ marginLeft: "auto", fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12, color: "#334155", fontWeight: 400 }}>
                      {result.findings.length} finding{result.findings.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {result.findings.map((f, i) => <FindingRow key={i} f={f} i={i} />)}
                </div>
              )}

              {/* Insights + Recommendations */}
              {(result.insights?.length > 0 || result.recommendations?.length > 0) && (
                <div className="grid-2">
                  <div className="card" style={{ marginBottom: 0 }}>
                    <div className="section-title"><span>◈</span> AI Insights</div>
                    {result.insights?.map((ins, i) => (
                      <div key={i} className="insight-item">
                        <span style={{ color: "#f59e0b", flexShrink: 0, marginTop: 2 }}>▸</span>
                        <span>{ins}</span>
                      </div>
                    ))}
                  </div>
                  <div className="card" style={{ marginBottom: 0 }}>
                    <div className="section-title"><span>◈</span> Recommendations</div>
                    {result.recommendations?.map((rec, i) => (
                      <div key={i} className="insight-item">
                        <span style={{ color: "#10b981", flexShrink: 0, marginTop: 2 }}>✓</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </main>
    </div>
  );
}