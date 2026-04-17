const TEAL = "#0D9488";
const TEAL_LT = "#2DD4BF";
const BG = "#060E12";

const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
const values = [28, 34, 31, 42, 38, 51];
const features = [
  { icon: "💸", title: "Digital Payments", desc: "Razorpay-powered instant payouts" },
  { icon: "📋", title: "Booking History", desc: "Full record of every consultation" },
  { icon: "⭐", title: "Patient Reviews", desc: "Build reputation, earn trust" },
];

export default function Growth() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: BG, fontFamily: "system-ui, sans-serif", padding: "24px 24px 80px" }}>
      <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1.3, marginBottom: 8 }}>
        Grow Your<br/><span style={{ color: TEAL_LT }}>Practice</span>
      </div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.55, marginBottom: 20 }}>
        Transparent earnings, instant payouts, and tools to attract more patients — all in one place.
      </div>

      <div style={{ borderRadius: 16, padding: 14, border: "1px solid rgba(13,148,136,0.25)", background: "linear-gradient(135deg, rgba(13,148,136,0.15), rgba(15,118,110,0.06))", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 9, fontWeight: 700, color: TEAL_LT, letterSpacing: 2 }}>MARCH EARNINGS</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#fff", marginTop: 2 }}>₹51,000</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: TEAL_LT, marginTop: 2 }}>↑ +34% vs last month</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>Payout due</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Apr 1</div>
            <div style={{ fontSize: 10, color: TEAL_LT, marginTop: 2 }}>Auto-transfer ✓</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", height: 44, gap: 3 }}>
          {values.map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <div style={{ width: "100%", height: (v / 51) * 36, borderRadius: 2, background: i === 5 ? `linear-gradient(to top, ${TEAL}, ${TEAL_LT})` : "rgba(255,255,255,0.08)" }} />
              <span style={{ fontSize: 7, color: "rgba(255,255,255,0.25)" }}>{months[i]}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {features.map(({ icon, title, desc }) => (
          <div key={title} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.025)" }}>
            <span style={{ fontSize: 18 }}>{icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{title}</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 500 }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
