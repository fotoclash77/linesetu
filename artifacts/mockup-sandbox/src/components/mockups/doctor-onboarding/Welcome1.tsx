export function Welcome1() {
  const patients = [
    { num: 1, name: "Rajan Mehta", status: "In Consultation", active: true },
    { num: 2, name: "Priya Sharma", status: "Next Up", active: false },
    { num: 3, name: "Amit Verma", status: "Waiting", active: false },
    { num: 4, name: "Sunita Patel", status: "Waiting", active: false },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#060E12]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-[390px] h-[844px] relative overflow-hidden bg-[#060E12] flex flex-col">

        {/* Glow orbs */}
        <div className="absolute top-[-60px] left-[-40px] w-[260px] h-[260px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(13,148,136,0.22) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[100px] right-[-50px] w-[200px] h-[200px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)" }} />

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
              style={{ background: "linear-gradient(135deg, #0D9488, #0891B2)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 6h16M4 12h10M4 18h6" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <circle cx="19" cy="17" r="3" fill="white" fillOpacity="0.3" stroke="white" strokeWidth="1.5" />
                <path d="M19 16v1l1 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#2DD4BF] tracking-[2px]">FEATURE 01</div>
              <div className="text-[12px] text-white/40 font-medium">What you get</div>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-[28px] font-black text-white leading-tight mb-2">
            Smart Queue<br />
            <span className="text-[#2DD4BF]">Management</span>
          </h2>
          <p className="text-[13px] text-white/45 leading-relaxed mb-8">
            Your clinic queue, organised and visible at a glance. No chaos, no confusion — just smooth patient flow.
          </p>

          {/* Live queue card */}
          <div className="rounded-2xl border border-white/[0.08] overflow-hidden mb-6"
            style={{ background: "rgba(255,255,255,0.03)" }}>
            {/* Card header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#2DD4BF]" style={{ boxShadow: "0 0 6px #2DD4BF" }} />
                <span className="text-[12px] font-bold text-white">Live Queue</span>
              </div>
              <span className="text-[10px] text-[#2DD4BF] font-semibold bg-[#0D9488]/20 px-2 py-1 rounded-full">
                4 waiting
              </span>
            </div>

            {/* Patient rows */}
            <div className="divide-y divide-white/[0.04]">
              {patients.map((p) => (
                <div key={p.num} className={`flex items-center gap-3 px-4 py-3 ${p.active ? "bg-[#0D9488]/10" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-black flex-shrink-0 ${p.active ? "bg-[#0D9488] text-white" : "bg-white/[0.06] text-white/40"}`}>
                    {p.num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-white truncate">{p.name}</div>
                    <div className={`text-[11px] font-medium ${p.active ? "text-[#2DD4BF]" : "text-white/30"}`}>{p.status}</div>
                  </div>
                  {p.active && (
                    <div className="w-2 h-2 rounded-full bg-[#2DD4BF] flex-shrink-0"
                      style={{ boxShadow: "0 0 8px #2DD4BF" }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-3">
            {[
              { v: "~12 min", l: "avg wait time" },
              { v: "18", l: "seen today" },
              { v: "4.8★", l: "patient rating" },
            ].map(({ v, l }) => (
              <div key={l} className="flex-1 rounded-xl px-3 py-2.5 border border-white/[0.07] bg-white/[0.03] text-center">
                <div className="text-[15px] font-black text-white">{v}</div>
                <div className="text-[10px] text-white/30 font-medium mt-0.5">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom nav dots */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-2">
          {[true, false, false].map((active, i) => (
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
