export function Welcome2() {
  const hours = ["9", "10", "11", "12", "1", "2", "3"];
  const patientCounts = [5, 12, 18, 14, 20, 16, 8];
  const max = 20;

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#060E12]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-[390px] h-[844px] relative overflow-hidden bg-[#060E12] flex flex-col">

        {/* Glow orbs */}
        <div className="absolute top-[100px] right-[-60px] w-[280px] h-[280px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[60px] left-[-30px] w-[200px] h-[200px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(13,148,136,0.15) 0%, transparent 70%)" }} />

        {/* Status bar */}
        <div className="flex justify-between items-center px-6 pt-4 pb-2 flex-shrink-0">
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

        {/* Content */}
        <div className="flex-1 flex flex-col px-6 pt-6 pb-6">

          {/* Icon */}
          <div className="mb-6 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #0891B2, #2DD4BF)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" fill="white" />
                <path d="M12 5v2M12 17v2M5 12H3M21 12h-2" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.5" strokeDasharray="3 2" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#2DD4BF] tracking-[2px]">FEATURE 02</div>
              <div className="text-[12px] text-white/40 font-medium">Insights & tracking</div>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-[28px] font-black text-white leading-tight mb-2">
            Real-time Patient<br />
            <span className="text-[#2DD4BF]">Insights</span>
          </h2>
          <p className="text-[13px] text-white/45 leading-relaxed mb-6">
            Track your patient flow throughout the day. See peaks, plan better, and reduce patient wait times dramatically.
          </p>

          {/* Current status card */}
          <div className="rounded-2xl p-4 mb-4 border border-[#0D9488]/30"
            style={{ background: "linear-gradient(135deg, rgba(13,148,136,0.15), rgba(8,145,178,0.08))" }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[11px] text-[#2DD4BF] font-bold tracking-wide">NOW CONSULTING</div>
                <div className="text-[18px] font-black text-white mt-0.5">Priya Sharma</div>
                <div className="text-[12px] text-white/40">Token #7 · Est. 8 min remaining</div>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-[#2DD4BF]/40 flex items-center justify-center"
                style={{ background: "rgba(13,148,136,0.2)" }}>
                <span className="text-[18px] font-black text-[#2DD4BF]">7</span>
              </div>
            </div>
            {/* Progress */}
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full w-[60%] rounded-full"
                style={{ background: "linear-gradient(90deg, #0D9488, #2DD4BF)" }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-white/30">Started</span>
              <span className="text-[10px] text-[#2DD4BF] font-semibold">~8 min left</span>
            </div>
          </div>

          {/* Hourly chart */}
          <div className="rounded-2xl p-4 border border-white/[0.07]" style={{ background: "rgba(255,255,255,0.025)" }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[12px] font-bold text-white/70">Today's Patient Flow</span>
              <span className="text-[10px] text-[#2DD4BF] font-semibold">93 total</span>
            </div>
            <div className="flex items-end gap-2 h-[70px]">
              {patientCounts.map((count, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full rounded-t-sm relative overflow-hidden"
                    style={{
                      height: `${(count / max) * 60}px`,
                      background: i === 4
                        ? "linear-gradient(to top, #0D9488, #2DD4BF)"
                        : "rgba(45,212,191,0.2)"
                    }}>
                    {i === 4 && <div className="absolute top-0 right-0 w-1 h-1 rounded-full bg-[#2DD4BF] m-0.5" />}
                  </div>
                  <span className="text-[9px] text-white/30 font-medium">{hours[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom nav dots */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-2">
          {[false, true, false].map((active, i) => (
            <div key={i} className={`rounded-full transition-all ${active ? "w-5 h-2 bg-[#0D9488]" : "w-2 h-2 bg-white/20"}`} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="absolute bottom-[60px] left-6 right-6">
          <div className="flex items-center justify-between">
            <button className="text-[13px] text-white/30 font-semibold">Skip</button>
            <button className="px-6 py-3 rounded-2xl text-[14px] font-bold text-white flex items-center gap-2"
              style={{ background: "linear-gradient(135deg, #0D9488, #0891B2)" }}>
              Next
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-28 h-[5px] bg-white/15 rounded-full" />
      </div>
    </div>
  );
}
