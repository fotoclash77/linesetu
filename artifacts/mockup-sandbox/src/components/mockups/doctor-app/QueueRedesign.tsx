import { useState } from "react";

const TEAL = "#0D9488";
const TEAL_LT = "#2DD4BF";
const BG = "#070B14";
const AMBER = "#F59E0B";
const AMBER_LT = "#FCD34D";
const RED = "#EF4444";
const CYAN = "#67E8F9";
const GREEN = "#4ADE80";
const PURPLE = "#A78BFA";

const glass = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.09)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  borderRadius: 16,
};

const glassGlow = (color: string) => ({
  ...glass,
  boxShadow: `0 0 20px ${color}22, 0 4px 24px rgba(0,0,0,0.4)`,
  border: `1px solid ${color}44`,
});

type Tab = "normal" | "emergency" | "skipped" | "consulted";

interface Patient {
  id: number;
  token: number;
  name: string;
  age: number;
  gender: "M" | "F";
  type: "normal" | "emergency";
  source: "walkin" | "online";
  status: "consulting" | "waiting" | "skipped" | "consulted";
}

const MOCK_PATIENTS: Patient[] = [
  { id: 1, token: 3, name: "Rajesh Kumar",   age: 45, gender: "M", type: "normal",    source: "online",  status: "consulting" },
  { id: 2, token: 4, name: "Priya Sharma",   age: 32, gender: "F", type: "normal",    source: "walkin",  status: "waiting"    },
  { id: 3, token: 5, name: "Amit Verma",     age: 58, gender: "M", type: "emergency", source: "walkin",  status: "waiting"    },
  { id: 4, token: 6, name: "Sunita Devi",    age: 27, gender: "F", type: "normal",    source: "online",  status: "waiting"    },
  { id: 5, token: 7, name: "Vikram Singh",   age: 62, gender: "M", type: "normal",    source: "walkin",  status: "waiting"    },
  { id: 6, token: 8, name: "Meena Gupta",    age: 38, gender: "F", type: "emergency", source: "online",  status: "waiting"    },
  { id: 7, token: 1, name: "Rohit Joshi",    age: 24, gender: "M", type: "normal",    source: "online",  status: "skipped"    },
  { id: 8, token: 2, name: "Kavita Pal",     age: 51, gender: "F", type: "normal",    source: "walkin",  status: "consulted"  },
];

function TypeBadge({ type, source }: { type: string; source: string }) {
  if (type === "emergency") {
    return (
      <span style={{ background: "rgba(239,68,68,0.18)", border: "1px solid rgba(239,68,68,0.4)", color: RED, borderRadius: 99, padding: "2px 8px", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
        🚨 EMERGENCY
      </span>
    );
  }
  if (source === "walkin") {
    return (
      <span style={{ background: "rgba(103,232,249,0.12)", border: "1px solid rgba(103,232,249,0.3)", color: CYAN, borderRadius: 99, padding: "2px 8px", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
        WALK-IN
      </span>
    );
  }
  return (
    <span style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)", color: GREEN, borderRadius: 99, padding: "2px 8px", fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
      E-TOKEN
    </span>
  );
}

function TokenChip({ token, type, size = "sm" }: { token: number; type: string; size?: "sm" | "lg" }) {
  const isE = type === "emergency";
  const color = isE ? RED : TEAL_LT;
  const bg = isE ? "rgba(239,68,68,0.18)" : "rgba(13,148,136,0.2)";
  const border = isE ? "rgba(239,68,68,0.4)" : "rgba(45,212,191,0.4)";
  const num = isE ? `E${String(token).padStart(2, "0")}` : `#${String(token).padStart(2, "0")}`;
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: size === "lg" ? "6px 14px" : "4px 10px", display: "inline-flex", flexDirection: "column", alignItems: "center", minWidth: size === "lg" ? 64 : 50 }}>
      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 9, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>TOKEN</span>
      <span style={{ color, fontSize: size === "lg" ? 22 : 16, fontWeight: 800, lineHeight: 1.1 }}>{num}</span>
    </div>
  );
}

function PatientInfo({ p, large = false }: { p: Patient; large?: boolean }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ color: "#fff", fontSize: large ? 18 : 15, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
      <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 2 }}>
        {p.age} yr • {p.gender === "M" ? "Male" : "Female"}
      </div>
      <div style={{ marginTop: 5, display: "flex", gap: 6, flexWrap: "wrap" }}>
        <TypeBadge type={p.type} source={p.source} />
      </div>
    </div>
  );
}

function InConsultationCard({ p, onSkip, onDone }: { p: Patient; onSkip: () => void; onDone: () => void }) {
  return (
    <div style={{ ...glassGlow(TEAL_LT), padding: 16, margin: "0 16px 4px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: TEAL_LT, boxShadow: `0 0 8px ${TEAL_LT}` }} />
        <span style={{ color: TEAL_LT, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>In Consultation</span>
      </div>

      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <TokenChip token={p.token} type={p.type} size="lg" />
        <PatientInfo p={p} large />
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button
          onClick={onSkip}
          style={{ flex: 1, background: "rgba(239,68,68,0.18)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 12, padding: "12px 0", color: "#FCA5A5", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5 }}
        >
          ⏭ Skip
        </button>
        <button
          onClick={onDone}
          style={{ flex: 2, background: `linear-gradient(135deg, ${TEAL}CC, ${TEAL_LT}CC)`, border: `1px solid ${TEAL_LT}55`, borderRadius: 12, padding: "12px 0", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5, boxShadow: `0 4px 16px ${TEAL}55` }}
        >
          ✓ Consulted & Call Next
        </button>
      </div>
    </div>
  );
}

function UpNextCard({ p }: { p: Patient }) {
  return (
    <div style={{ ...glassGlow(TEAL_LT), padding: "12px 16px", margin: "0 16px 4px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <div style={{ width: 7, height: 7, borderRadius: "50%", background: TEAL_LT, boxShadow: `0 0 6px ${TEAL}` }} />
        <span style={{ color: TEAL_LT, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Up Next</span>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <TokenChip token={p.token} type={p.type} size="sm" />
        <PatientInfo p={p} />
        <span style={{ color: TEAL_LT, fontSize: 22, fontWeight: 300 }}>›</span>
      </div>
    </div>
  );
}

const TABS: { key: Tab; label: string; color: string }[] = [
  { key: "normal",    label: "Normal",    color: GREEN  },
  { key: "emergency", label: "Emergency", color: RED    },
  { key: "skipped",   label: "Skipped",   color: AMBER  },
  { key: "consulted", label: "Consulted", color: PURPLE },
];

function WaitingCard({ p }: { p: Patient }) {
  const [sent, setSent] = useState(false);

  if (p.status === "consulted") {
    return (
      <div style={{ ...glass, padding: "12px 14px", marginBottom: 8, opacity: 0.72, display: "flex", gap: 12, alignItems: "center" }}>
        <TokenChip token={p.token} type={p.type} size="sm" />
        <PatientInfo p={p} />
        <span style={{ color: GREEN, fontSize: 18 }}>✓</span>
      </div>
    );
  }

  if (p.status === "skipped") {
    return (
      <div style={{ ...glass, padding: "12px 14px", marginBottom: 8, opacity: 0.65, display: "flex", gap: 12, alignItems: "center" }}>
        <TokenChip token={p.token} type={p.type} size="sm" />
        <PatientInfo p={p} />
        <span style={{ color: AMBER, fontSize: 14 }}>Skipped</span>
      </div>
    );
  }

  return (
    <div style={{ ...glass, padding: "12px 14px", marginBottom: 8, display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <TokenChip token={p.token} type={p.type} size="sm" />
        <PatientInfo p={p} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button
          onClick={() => setSent(true)}
          style={{
            flex: 1, padding: "9px 0",
            background: sent ? "rgba(74,222,128,0.15)" : `rgba(13,148,136,0.22)`,
            border: `1px solid ${sent ? "rgba(74,222,128,0.35)" : "rgba(45,212,191,0.35)"}`,
            borderRadius: 10, color: sent ? GREEN : TEAL_LT,
            fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}
        >
          {sent ? "✓ Set as Next" : "▶ Send Next"}
        </button>
        <button
          style={{
            flex: 1, padding: "9px 0",
            background: "rgba(245,158,11,0.15)",
            border: "1px solid rgba(245,158,11,0.3)",
            borderRadius: 10, color: AMBER_LT,
            fontSize: 12, fontWeight: 700, cursor: "pointer",
          }}
        >
          🔔 Send Alert
        </button>
      </div>
    </div>
  );
}

function StatsBar({ patients }: { patients: Patient[] }) {
  const total = patients.filter(p => p.status !== "consulting").length + 1;
  const waiting = patients.filter(p => p.status === "waiting").length;
  const done = patients.filter(p => p.status === "consulted").length;
  const skipped = patients.filter(p => p.status === "skipped").length;
  const stats = [
    { label: "Total", val: total, color: TEAL_LT },
    { label: "Waiting", val: waiting, color: AMBER_LT },
    { label: "Done", val: done, color: GREEN },
    { label: "Skipped", val: skipped, color: PURPLE },
  ];
  return (
    <div style={{ display: "flex", gap: 0, margin: "0 16px 4px", background: "rgba(255,255,255,0.04)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.07)", overflow: "hidden" }}>
      {stats.map((s, i) => (
        <div key={s.label} style={{ flex: 1, padding: "10px 0", textAlign: "center", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
          <div style={{ color: s.color, fontSize: 20, fontWeight: 800 }}>{s.val}</div>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.8 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

export function QueueRedesign() {
  const [tab, setTab] = useState<Tab>("normal");
  const [patients, setPatients] = useState<Patient[]>(MOCK_PATIENTS);

  const consulting = patients.find(p => p.status === "consulting");
  const waiting = patients.filter(p => p.status === "waiting");
  const upNext = waiting.sort((a, b) => {
    if (a.type === "emergency" && b.type !== "emergency") return -1;
    if (b.type === "emergency" && a.type !== "emergency") return 1;
    return a.token - b.token;
  })[0];

  const handleSkip = () => {
    if (!consulting) return;
    setPatients(prev => prev.map(p => p.id === consulting.id ? { ...p, status: "skipped" } : p));
    if (upNext) {
      setPatients(prev => prev.map(p => p.id === upNext.id ? { ...p, status: "consulting" } : p));
    }
  };

  const handleDone = () => {
    if (!consulting) return;
    setPatients(prev => prev.map(p => p.id === consulting.id ? { ...p, status: "consulted" } : p));
    if (upNext) {
      setPatients(prev => prev.map(p => p.id === upNext.id ? { ...p, status: "consulting" } : p));
    }
  };

  const tabPatients = (() => {
    if (tab === "normal")    return patients.filter(p => p.type === "normal" && p.status === "waiting");
    if (tab === "emergency") return patients.filter(p => p.type === "emergency" && p.status === "waiting");
    if (tab === "skipped")   return patients.filter(p => p.status === "skipped");
    if (tab === "consulted") return patients.filter(p => p.status === "consulted");
    return [];
  })();

  const tabCounts: Record<Tab, number> = {
    normal:    patients.filter(p => p.type === "normal"    && p.status === "waiting").length,
    emergency: patients.filter(p => p.type === "emergency" && p.status === "waiting").length,
    skipped:   patients.filter(p => p.status === "skipped").length,
    consulted: patients.filter(p => p.status === "consulted").length,
  };

  return (
    <div style={{ width: 390, height: 844, background: BG, fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative" }}>
      {/* Orb accents */}
      <div style={{ position: "absolute", top: -60, right: -60, width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle, ${TEAL}22 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 120, left: -80, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${AMBER}15 0%, transparent 70%)`, pointerEvents: "none" }} />

      {/* Header */}
      <div style={{ padding: "48px 16px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, textTransform: "uppercase", letterSpacing: 1.5 }}>Master Queue</div>
          <div style={{ color: "#fff", fontSize: 17, fontWeight: 700, marginTop: 2 }}>Dr. Rajesh Sharma</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ background: "rgba(245,158,11,0.18)", border: "1px solid rgba(245,158,11,0.35)", borderRadius: 20, padding: "4px 12px", color: AMBER_LT, fontSize: 12, fontWeight: 700 }}>
            ☀ Morning
          </div>
          <div style={{ width: 36, height: 36, borderRadius: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
            🔔
          </div>
        </div>
      </div>

      {/* Stats — sticky, always visible */}
      <StatsBar patients={patients} />

      {/* ── STICKY TOP: In Consultation ────────────────────────── */}
      <div style={{ flexShrink: 0, paddingTop: 8, background: BG, zIndex: 10 }}>
        {consulting
          ? <InConsultationCard p={consulting} onSkip={handleSkip} onDone={handleDone} />
          : (
            <div style={{ ...glass, margin: "0 16px", padding: "14px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.2)" }} />
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>No patient in consultation</span>
            </div>
          )
        }
      </div>

      {/* ── STICKY: Up Next ────────────────────────────────────── */}
      <div style={{ flexShrink: 0, paddingTop: 8, background: BG, zIndex: 10 }}>
        {upNext
          ? <UpNextCard p={upNext} />
          : (
            <div style={{ ...glass, margin: "0 16px", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "rgba(45,212,191,0.3)" }} />
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>No patients waiting</span>
            </div>
          )
        }
      </div>

      {/* ── SCROLLABLE: Waiting List ────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", paddingTop: 8, scrollbarWidth: "none" }}>

        {/* Divider + header */}
        <div style={{ margin: "0 16px 6px", borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase" }}>Waiting List</span>
          <span style={{ color: TEAL_LT, fontSize: 11, fontWeight: 700 }}>{waiting.length} patients</span>
        </div>

        {/* Toggle Tabs */}
        <div style={{ display: "flex", gap: 6, padding: "0 16px 8px", flexShrink: 0 }}>
          {TABS.map(t => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  flex: 1, padding: "7px 0",
                  background: active ? `${t.color}20` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${active ? t.color + "55" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 10,
                  color: active ? t.color : "rgba(255,255,255,0.35)",
                  fontSize: 10, fontWeight: 700, cursor: "pointer",
                  position: "relative",
                }}
              >
                <div>{t.label}</div>
                {tabCounts[t.key] > 0 && (
                  <div style={{ position: "absolute", top: -6, right: -4, background: t.color, borderRadius: 99, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: BG }}>
                    {tabCounts[t.key]}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Waiting Cards */}
        <div style={{ padding: "0 16px 8px" }}>
          {tabPatients.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 0", color: "rgba(255,255,255,0.2)", fontSize: 13 }}>
              No patients in this category
            </div>
          ) : (
            tabPatients.map(p => <WaitingCard key={p.id} p={p} />)
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <div style={{ height: 64, background: "rgba(7,11,20,0.95)", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", flexShrink: 0 }}>
        {[
          { icon: "🏠", label: "Home",     active: false },
          { icon: "📋", label: "Queue",    active: true  },
          { icon: "💰", label: "Earnings", active: false },
          { icon: "⚙️", label: "Settings", active: false },
        ].map(item => (
          <div key={item.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer" }}>
            <span style={{ fontSize: 20 }}>{item.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: item.active ? TEAL_LT : "rgba(255,255,255,0.3)" }}>{item.label}</span>
            {item.active && <div style={{ width: 4, height: 4, borderRadius: "50%", background: TEAL_LT }} />}
          </div>
        ))}
      </div>
    </div>
  );
}
