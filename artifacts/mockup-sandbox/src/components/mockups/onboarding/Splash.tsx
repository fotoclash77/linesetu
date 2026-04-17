export default function Splash() {
  const badges = ["500+ Clinics", "12K+ Doctors"];
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#060E12", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", backgroundColor: "rgba(13,148,136,0.18)", top: "15%", left: "50%", transform: "translateX(-50%)" }} />
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0, zIndex: 1 }}>
        <div style={{ width: 240, height: 240, borderRadius: 40, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, boxShadow: "0 0 40px rgba(13,148,136,0.18)", overflow: "hidden" }}>
          <img src={`${import.meta.env.BASE_URL}assets/2.png`} alt="LINESETU logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
        </div>
        <div style={{ fontSize: 34, fontWeight: 900, color: "#fff", letterSpacing: -1, marginBottom: 8 }}>LINESETU</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <div style={{ width: 30, height: 1, backgroundColor: "rgba(45,212,191,0.3)" }} />
          <div style={{ fontSize: 10, fontWeight: 700, color: "#2DD4BF", letterSpacing: 3 }}>DOCTOR PORTAL</div>
          <div style={{ width: 30, height: 1, backgroundColor: "rgba(45,212,191,0.3)" }} />
        </div>
        <div style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", fontWeight: 500, textAlign: "center", lineHeight: 1.6, marginBottom: 28, padding: "0 20px" }}>
          Manage your clinic queue.<br/>Serve patients smarter.
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {badges.map(b => (
            <div key={b} style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 10px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "rgba(255,255,255,0.03)" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#2DD4BF" }} />
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>{b}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
