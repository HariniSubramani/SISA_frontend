import React, { useState } from "react";
import "./App.css";

const RISK_COLORS = {
  none: "#22c55e",
  low: "#3b82f6",
  medium: "#f59e0b",
  high: "#f97316",
  critical: "#ef4444",
};

const RISK_BADGE = {
  none: { bg: "#dcfce7", color: "#166534" },
  low: { bg: "#dbeafe", color: "#1e40af" },
  medium: { bg: "#fef3c7", color: "#92400e" },
  high: { bg: "#ffedd5", color: "#9a3412" },
  critical: { bg: "#fee2e2", color: "#991b1b" },
};

function Badge({ risk }) {
  const style = RISK_BADGE[risk] || RISK_BADGE["low"];
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        padding: "2px 10px",
        borderRadius: 12,
        fontSize: 12,
        fontWeight: 600,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      {risk}
    </span>
  );
}

export default function App() {
  const [tab, setTab] = useState("text");
  const [textInput, setTextInput] = useState("");
  const [inputType, setInputType] = useState("log");
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  // ── Analyze text ──
  const analyzeText = async () => {
    if (!textInput.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input_type: inputType,
          content: textInput,
          options: { mask: true, block_high_risk: false, log_analysis: true },
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError("Could not connect to backend. Make sure it's running on port 8000.");
    }
    setLoading(false);
  };

  // ── Analyze file ──
  const analyzeFile = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("http://localhost:8000/analyze/file", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError("Could not connect to backend. Make sure it's running on port 8000.");
    }
    setLoading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) setFile(dropped);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", fontFamily: "sans-serif" }}>

      {/* ── Responsive styles injected ── */}
      <style>{`
        * { box-sizing: border-box; }

        .header {
          background: #1e293b;
          border-bottom: 1px solid #334155;
          padding: 16px 32px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .main-container {
          max-width: 900px;
          margin: 32px auto;
          padding: 0 16px;
        }

        .tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .input-panel {
          background: #1e293b;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .input-type-buttons {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
          flex-wrap: wrap;
        }

        .textarea-input {
          width: 100%;
          height: 180px;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 8px;
          color: #e2e8f0;
          font-size: 14px;
          padding: 12px;
          resize: vertical;
          font-family: monospace;
        }

        .analyze-btn {
          margin-top: 12px;
          padding: 10px 28px;
          background: #6366f1;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          width: auto;
        }

        .risk-card {
          background: #1e293b;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 16px;
          display: flex;
          align-items: flex-start;
          gap: 24px;
          flex-wrap: wrap;
        }

        .risk-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .risk-info {
          flex-shrink: 0;
        }

        .risk-summary {
          flex: 1;
          min-width: 200px;
          margin-left: 0;
        }

        .findings-card {
          background: #1e293b;
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 16px;
        }

        .finding-item {
          background: #0f172a;
          border-radius: 8px;
          padding: 10px 14px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          flex-wrap: wrap;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .insights-card {
          background: #1e293b;
          border-radius: 12px;
          padding: 24px;
        }

        /* ── Tablet ── */
        @media (max-width: 768px) {
          .header {
            padding: 12px 16px;
          }

          .main-container {
            margin: 16px auto;
            padding: 0 12px;
          }

          .risk-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 16px;
            padding: 16px;
          }

          .risk-summary {
            margin-left: 0;
            width: 100%;
          }

          .insights-grid {
            grid-template-columns: 1fr;
          }

          .analyze-btn {
            width: 100%;
            text-align: center;
          }

          .input-panel {
            padding: 16px;
          }

          .textarea-input {
            height: 140px;
          }
        }

        /* ── Mobile ── */
        @media (max-width: 480px) {
          .header {
            padding: 10px 12px;
            gap: 8px;
          }

          .header-title {
            font-size: 14px !important;
          }

          .header-subtitle {
            font-size: 11px !important;
          }

          .tabs button {
            padding: 6px 14px !important;
            font-size: 12px !important;
          }

          .input-type-buttons button {
            padding: 4px 10px !important;
            font-size: 12px !important;
          }

          .risk-circle {
            width: 64px;
            height: 64px;
          }

          .risk-circle-score {
            font-size: 18px !important;
          }

          .findings-card {
            padding: 16px;
          }

          .finding-item {
            flex-direction: column;
            gap: 6px;
          }

          .insights-card {
            padding: 16px;
          }

          .analyze-btn {
            font-size: 14px !important;
            padding: 10px 20px !important;
          }
        }
      `}</style>

      {/* ── Header ── */}
      <div className="header">
        <div style={{
          width: 36, height: 36, background: "#6366f1", borderRadius: 8,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, flexShrink: 0
        }}>🛡</div>
        <div>
          <div className="header-title" style={{ fontWeight: 700, fontSize: 18 }}>
            AI Secure Data Intelligence Platform
          </div>
          <div className="header-subtitle" style={{ fontSize: 12, color: "#94a3b8" }}>
            Powered by Groq · Llama 3
          </div>
        </div>
      </div>

      {/* ── Main Container ── */}
      <div className="main-container">

        {/* ── Tabs ── */}
        <div className="tabs">
          {["text", "file"].map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setResult(null); setError(""); }}
              style={{
                padding: "8px 24px", borderRadius: 8, border: "none", cursor: "pointer",
                fontWeight: 600, fontSize: 14,
                background: tab === t ? "#6366f1" : "#1e293b",
                color: tab === t ? "#fff" : "#94a3b8",
              }}
            >
              {t === "text" ? "📝 Text / Log Input" : "📁 File Upload"}
            </button>
          ))}
        </div>

        {/* ── Input Panel ── */}
        <div className="input-panel">
          {tab === "text" ? (
            <>
              <div className="input-type-buttons">
                {["text", "log", "sql", "chat"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setInputType(t)}
                    style={{
                      padding: "4px 14px", borderRadius: 6, border: "1px solid #334155",
                      cursor: "pointer", fontSize: 13,
                      background: inputType === t ? "#334155" : "transparent",
                      color: inputType === t ? "#e2e8f0" : "#64748b",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <textarea
                className="textarea-input"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste your log, text, SQL or chat content here..."
              />
              <button
                className="analyze-btn"
                onClick={analyzeText}
                disabled={loading || !textInput.trim()}
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "Analyzing..." : "🔍 Analyze"}
              </button>
            </>
          ) : (
            <>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById("fileInput").click()}
                style={{
                  border: `2px dashed ${dragOver ? "#6366f1" : "#334155"}`,
                  borderRadius: 12, padding: "32px 20px", textAlign: "center",
                  cursor: "pointer",
                  background: dragOver ? "#1e1b4b" : "#0f172a", transition: "all 0.2s"
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 8 }}>📂</div>
                <div style={{ color: "#94a3b8", fontSize: 14, wordBreak: "break-word" }}>
                  {file ? `Selected: ${file.name}` : "Drag & drop or click to upload .log, .txt, .pdf, .docx"}
                </div>
                <input
                  id="fileInput" type="file" accept=".log,.txt,.pdf,.docx"
                  style={{ display: "none" }}
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
              <button
                className="analyze-btn"
                onClick={analyzeFile}
                disabled={loading || !file}
                style={{ marginTop: 16, opacity: loading ? 0.6 : 1 }}
              >
                {loading ? "Scanning..." : "🔍 Scan File"}
              </button>
            </>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div style={{
            background: "#450a0a", border: "1px solid #ef4444", borderRadius: 8,
            padding: 16, marginBottom: 24, color: "#fca5a5", fontSize: 14,
            wordBreak: "break-word"
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Results ── */}
        {result && (
          <>
            {/* Risk Score Card */}
            <div className="risk-card">
              <div
                className="risk-circle"
                style={{ border: `4px solid ${RISK_COLORS[result.risk_level]}` }}
              >
                <div className="risk-circle-score" style={{
                  fontSize: 22, fontWeight: 800,
                  color: RISK_COLORS[result.risk_level]
                }}>
                  {result.risk_score}
                </div>
                <div style={{ fontSize: 10, color: "#64748b" }}>score</div>
              </div>

              <div className="risk-info">
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>Risk Level</div>
                <Badge risk={result.risk_level} />
                <div style={{ marginTop: 8, fontSize: 13, color: "#94a3b8" }}>
                  Action: <strong style={{ color: "#e2e8f0" }}>{result.action}</strong>
                </div>
              </div>

              <div className="risk-summary">
                <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4 }}>AI Summary</div>
                <div style={{ fontSize: 14, color: "#e2e8f0", lineHeight: 1.6 }}>
                  {result.summary}
                </div>
              </div>
            </div>

            {/* Findings */}
            {result.findings?.length > 0 && (
              <div className="findings-card">
                <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>
                  🔎 Findings ({result.findings.length})
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.findings.map((f, i) => (
                    <div key={i} className="finding-item">
                      <Badge risk={f.risk} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ fontWeight: 600, color: "#e2e8f0", fontSize: 14 }}>{f.type}</span>
                        <span style={{ color: "#64748b", fontSize: 13, marginLeft: 8 }}>Line {f.line}</span>
                        <div style={{
                          fontFamily: "monospace", fontSize: 12, color: "#94a3b8",
                          marginTop: 4, wordBreak: "break-all", overflowWrap: "anywhere"
                        }}>
                          {f.snippet}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights & Recommendations */}
            <div className="insights-grid">
              <div className="insights-card">
                <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 16 }}>💡 AI Insights</div>
                {result.insights?.map((ins, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 8, marginBottom: 10,
                    fontSize: 14, color: "#cbd5e1", lineHeight: 1.5
                  }}>
                    <span style={{ color: "#f59e0b", flexShrink: 0 }}>▸</span> {ins}
                  </div>
                ))}
              </div>
              <div className="insights-card">
                <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 16 }}>✅ Recommendations</div>
                {result.recommendations?.map((rec, i) => (
                  <div key={i} style={{
                    display: "flex", gap: 8, marginBottom: 10,
                    fontSize: 14, color: "#cbd5e1", lineHeight: 1.5
                  }}>
                    <span style={{ color: "#22c55e", flexShrink: 0 }}>✓</span> {rec}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}