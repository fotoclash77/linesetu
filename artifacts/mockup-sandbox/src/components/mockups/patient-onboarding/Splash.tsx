export function Splash() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#060A14]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-[390px] h-[844px] relative overflow-hidden bg-[#060A14] flex flex-col items-center justify-center">

        {/* Layered radial glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(79,70,229,0.3) 0%, transparent 70%)" }} />
          <div className="absolute top-[-60px] right-[-50px] w-[240px] h-[240px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />
          <div className="absolute bottom-[80px] left-[-50px] w-[200px] h-[200px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)" }} />
        </div>

        {/* Grid dot pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, #818CF8 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

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
            {/* Orbit dot */}
            <div className="absolute top-3 right-3 w-3 h-3 rounded-full bg-[#818CF8]"
              style={{ boxShadow: "0 0 10px #818CF8" }} />
            {/* Second orbit dot */}
            <div className="absolute bottom-4 left-2 w-2 h-2 rounded-full bg-[#06B6D4]/70"
              style={{ boxShadow: "0 0 8px #06B6D4" }} />
          </div>

          {/* Brand name */}
          <div className="text-center mb-3">
            <h1 className="text-[36px] font-black text-white tracking-[-1px] leading-none">LINESETU</h1>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="h-[1px] w-8 bg-[#818CF8]/40" />
              <span className="text-[11px] font-bold text-[#818CF8] tracking-[3px]">PATIENT APP</span>
              <div className="h-[1px] w-8 bg-[#818CF8]/40" />
            </div>
          </div>

          {/* Tagline */}
          <p className="text-[15px] text-white/45 font-medium mt-2 text-center px-10 leading-relaxed">
            No early morning lines.<br />Book your token instantly.
          </p>

          {/* Trust badges */}
          <div className="flex items-center gap-3 mt-8">
            {["50K+ Patients", "100% Secure"].map((badge) => (
              <div key={badge} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/[0.07] bg-white/[0.03]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#818CF8]" />
                <span className="text-[10px] text-white/40 font-semibold">{badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom loading */}
        <div className="absolute bottom-14 left-0 right-0 flex flex-col items-center gap-3">
          <div className="w-20 h-[3px] bg-white/10 rounded-full overflow-hidden">
            <div className="w-2/3 h-full rounded-full"
              style={{ background: "linear-gradient(90deg, #4F46E5, #818CF8)" }} />
          </div>
          <p className="text-[11px] text-white/20 font-medium">Finding doctors near you…</p>
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-28 h-[5px] bg-white/15 rounded-full" />
      </div>
    </div>
  );
}
