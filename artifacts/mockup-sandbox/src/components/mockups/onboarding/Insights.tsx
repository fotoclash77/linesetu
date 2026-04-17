const TEAL = "#0D9488";
const TEAL_LT = "#2DD4BF";
const BG = "#060E12";

const hours = ["9", "10", "11", "12", "1", "2", "3"];
const counts = [5, 12, 18, 14, 20, 16, 8];
const max = 20;

export default function Insights() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, fontFamily: "system-ui, sans-serif", padding: "24px 24px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ width: 48, height: 48, borderRadius: 16, background: "linear-gradient(135deg, #0891B2, #2DD4BF)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 20, height: 20, borderRadius: "50%", border: "1.5px solid white", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 1.5, height: 8, backgroundColor: "white", borderRadius: 1 }} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 9, fontWeight: 700, color: TEAL_LT, letterSpacing: 2 }}>FEATURE 02</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>Insights & tracking</div>
        </div>
      </div>

      <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.3, marginBottom: 8 }}>
        Real-time Patient<br/><span style={{ color: TEAL_LT }}>Insights</span>
      </div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.55, marginBottom: 20 }}>
        Track your patient flow throughout the day. See peaks, plan better, and reduce wait times dramatically.
      </div>

      <div style={{ borderRadius: 16, padding: 14, border: "1px solid rgba(13,148,136,0.25)", background: "linear-gradient(135deg, rgba(13,148,136,0.18), rgba(8,145,178,0.08))", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: TEAL_LT, letterSpacing: 2 }}>NOW CONSULTING</div>
            <div style={{ fontSize: 17, fontWeight: 900, color: "#fff", marginTop: 2 }}>Priya Sharma</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>Token #7 · Est. 8 min remaining</div>
          </div>
          <div style={{ width: 46, height: 46, borderRadius: "50%", border: "1.5px solid rgba(45,212,191,0.4)", backgroundColor: "rgba(13,148,136,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 18, fontWeight: 900, color: TEAL_LT }}>7</span>
          </div>
        </div>
        <div style={{ height: 5, backgroundColor: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
          <div style={{ width: "60%", height: "100%", borderRadius: 3, background: `linear-gradient(90deg, ${TEAL}, ${TEAL_LT})` }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Started</span>
          <span style={{ fontSize: 10, color: TEAL_LT }}>~8 min left</span>
        </div>
      </div>

      <div style={{ borderRadius: 16, border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.025)", padding: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.6)" }}>Today's Patient Flow</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: TEAL_LT }}>93 total</span>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", height: 60, gap: 4 }}>
          {counts.map((c, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{ width: "100%", height: (c / max) * 50, borderRadius: 2, background: i === 4 ? `linear-gradient(to top, ${TEAL}, ${TEAL_LT})` : "rgba(45,212,191,0.18)" }} />
              <span style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", fontWeight: 600 }}>{hours[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
