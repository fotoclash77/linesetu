const TEAL = "#0D9488";
const TEAL_LT = "#2DD4BF";
const BG = "#060E12";

const patients = [
  { num: 1, name: "Rajan Mehta", status: "In Consultation", active: true },
  { num: 2, name: "Priya Sharma", status: "Next Up", active: false },
  { num: 3, name: "Amit Verma", status: "Waiting", active: false },
  { num: 4, name: "Sunita Patel", status: "Waiting", active: false },
];
const stats = [
  { v: "~12 min", l: "avg wait" },
  { v: "18", l: "seen today" },
  { v: "4.8★", l: "rating" },
];

export default function Queue() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, fontFamily: "system-ui, sans-serif", padding: "24px 24px 80px" }}>
      <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.3, marginBottom: 8 }}>
        Smart Queue<br/><span style={{ color: TEAL_LT }}>Management</span>
      </div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.55, marginBottom: 20 }}>
        Your clinic queue, organised and visible at a glance. No chaos, no confusion — just smooth patient flow.
      </div>

      <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)", overflow: "hidden", marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: TEAL_LT }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>Live Queue</span>
          </div>
          <div style={{ backgroundColor: "rgba(13,148,136,0.2)", padding: "4px 8px", borderRadius: 20 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: TEAL_LT }}>4 waiting</span>
          </div>
        </div>
        {patients.map(p => (
          <div key={p.num} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", backgroundColor: p.active ? "rgba(13,148,136,0.1)" : "transparent" }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: p.active ? TEAL : "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: p.active ? "#fff" : "rgba(255,255,255,0.35)" }}>{p.num}</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{p.name}</div>
              <div style={{ fontSize: 10, fontWeight: 500, color: p.active ? TEAL_LT : "rgba(255,255,255,0.3)", marginTop: 1 }}>{p.status}</div>
            </div>
            {p.active && <div style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: TEAL_LT }} />}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {stats.map(({ v, l }) => (
          <div key={l} style={{ flex: 1, borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.03)", padding: "8px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{v}</div>
            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontWeight: 500, marginTop: 2 }}>{l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
