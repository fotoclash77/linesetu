export function Splash() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#060E12]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-[390px] h-[844px] relative overflow-hidden bg-[#060E12] flex flex-col items-center justify-center">

        {/* Radial glow background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(13,148,136,0.35) 0%, transparent 70%)" }} />
          <div className="absolute top-[-80px] right-[-60px] w-[220px] h-[220px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(45,212,191,0.12) 0%, transparent 70%)" }} />
          <div className="absolute bottom-[60px] left-[-40px] w-[180px] h-[180px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)" }} />
        </div>

        {/* Grid dot pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, #2DD4BF 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        {/* Status bar */}
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 pt-4 pb-2">
          <span className="text-[13px] font-semibold text-white/40">9:41</span>
          <div className="flex items-center gap-1.5">
            {[0.35, 0.6, 0.85, 1].map((op, i) => (
              <div key={i} className="w-[3px] bg-white rounded-sm" style={{ height: `${6 + i * 2}px`, opacity: op }} />
            ))}
            <div className="w-[22px] h-[11px] rounded-[3px] border border-white/25 ml-1.5 flex items-center px-0.5">
              <div className="w-[13px] h-[7px] bg-white/80 rounded-[2px]" />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center">

          {/* Logo mark */}
          <div className="relative mb-8">
            {/* Outer ring */}
            <div className="w-[140px] h-[140px] rounded-full border border-[#2DD4BF]/20 flex items-center justify-center">
              {/* Inner ring */}
              <div className="w-[108px] h-[108px] rounded-full border border-[#2DD4BF]/30 flex items-center justify-center"
                style={{ background: "radial-gradient(circle, rgba(13,148,136,0.25) 0%, rgba(13,148,136,0.05) 100%)" }}>
                {/* Core */}
                <div className="w-[76px] h-[76px] rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #0D9488 0%, #0F766E 100%)", boxShadow: "0 0 40px rgba(13,148,136,0.5)" }}>
                  {/* Cross / Medical */}
                  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                    <rect x="14" y="5" width="8" height="26" rx="3" fill="white" />
                    <rect x="5" y="14" width="26" height="8" rx="3" fill="white" />
                  </svg>
                </div>
              </div>
            </div>
            {/* Orbit dot */}
            <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-[#2DD4BF]"
              style={{ boxShadow: "0 0 10px #2DD4BF" }} />
          </div>

          {/* Brand name */}
          <div className="text-center mb-3">
            <h1 className="text-[36px] font-black text-white tracking-[-1px] leading-none">LINESETU</h1>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="h-[1px] w-8 bg-[#2DD4BF]/40" />
              <span className="text-[11px] font-bold text-[#2DD4BF] tracking-[3px]">DOCTOR PORTAL</span>
              <div className="h-[1px] w-8 bg-[#2DD4BF]/40" />
            </div>
          </div>

          {/* Tagline */}
          <p className="text-[15px] text-white/45 font-medium mt-2 text-center px-10 leading-relaxed">
            Manage your clinic queue.<br />Serve patients smarter.
          </p>

          {/* Trust badges */}
          <div className="flex items-center gap-3 mt-8">
            {["500+ Clinics", "12K+ Doctors", "MCI Verified"].map((badge) => (
              <div key={badge} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.07] bg-white/[0.03]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]" />
                <span className="text-[10px] text-white/40 font-semibold">{badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom loading */}
        <div className="absolute bottom-14 left-0 right-0 flex flex-col items-center gap-3">
          {/* Progress bar */}
          <div className="w-20 h-[3px] bg-white/10 rounded-full overflow-hidden">
            <div className="w-3/4 h-full bg-gradient-to-r from-[#0D9488] to-[#2DD4BF] rounded-full" />
          </div>
          <p className="text-[11px] text-white/20 font-medium">Loading your dashboard…</p>
        </div>

        {/* Bottom home indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-28 h-[5px] bg-white/15 rounded-full" />
      </div>
    </div>
  );
}
