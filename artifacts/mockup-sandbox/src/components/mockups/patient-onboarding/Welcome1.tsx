export function Welcome1() {
  const doctors = [
    { name: "Dr. Ananya Sharma", spec: "Cardiologist", wait: "12 min", fee: "₹500", token: 47, rating: 4.9, accent: "#EF4444", initials: "AS" },
    { name: "Dr. Vikram Patel", spec: "Dermatologist", wait: "8 min", fee: "₹400", token: 12, rating: 4.8, accent: "#3B82F6", initials: "VP" },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#060A14]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-[390px] h-[844px] relative overflow-hidden bg-[#060A14] flex flex-col">

        {/* Glow orbs */}
        <div className="absolute top-[-40px] right-[-60px] w-[260px] h-[260px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(79,70,229,0.22) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[120px] left-[-40px] w-[200px] h-[200px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)" }} />

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

          {/* Icon badge */}
          <div className="mb-6 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="16" rx="3" stroke="white" strokeWidth="1.8" />
                <path d="M8 4V2M16 4V2M3 9h18" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M8 14h2M12 14h4M8 17h2M12 17h2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#818CF8] tracking-[2px]">FEATURE 01</div>
              <div className="text-[12px] text-white/40 font-medium">How it works</div>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-[28px] font-black text-white leading-tight mb-2">
            Book a Token<br />
            <span className="text-[#818CF8]">Instantly</span>
          </h2>
          <p className="text-[13px] text-white/45 leading-relaxed mb-7">
            Choose your doctor, grab a token, and show up right on time. Zero paperwork, no long waits.
          </p>

          {/* Search bar mockup */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-5 border border-white/[0.08]"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="#818CF8" strokeWidth="1.5" />
              <path d="M11 11l3 3" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span className="text-[13px] text-white/25 flex-1">Search doctors, specialities…</span>
            <div className="w-7 h-7 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(79,70,229,0.3)" }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 3h8M3 6h6M4 9h4" stroke="#818CF8" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Doctor cards */}
          <div className="flex flex-col gap-3">
            {doctors.map((doc) => (
              <div key={doc.name} className="rounded-2xl p-4 border border-white/[0.07]"
                style={{ background: "rgba(255,255,255,0.03)" }}>
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-[14px] font-black flex-shrink-0"
                    style={{ background: `${doc.accent}22`, border: `1.5px solid ${doc.accent}44`, color: doc.accent }}>
                    {doc.initials}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-bold text-white truncate">{doc.name}</div>
                    <div className="text-[11px] text-white/40 font-medium">{doc.spec}</div>
                  </div>
                  {/* Rating */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-[10px] text-yellow-400">★</span>
                    <span className="text-[11px] font-bold text-white/70">{doc.rating}</span>
                  </div>
                </div>

                {/* Bottom row */}
                <div className="flex items-center gap-2 mt-3">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04]">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-[10px] text-white/50 font-semibold">{doc.wait} wait</span>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-white/[0.04]">
                    <span className="text-[10px] text-white/50 font-semibold">{doc.fee}</span>
                  </div>
                  <div className="ml-auto px-4 py-1.5 rounded-xl text-[11px] font-bold text-white"
                    style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}>
                    Book #{doc.token}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom nav dots */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-2">
          {[true, false, false].map((active, i) => (
            <div key={i} className={`rounded-full ${active ? "w-5 h-2 bg-[#4F46E5]" : "w-2 h-2 bg-white/20"}`} />
          ))}
        </div>

        {/* CTA */}
        <div className="absolute bottom-[60px] left-6 right-6 flex items-center justify-between">
          <button className="text-[13px] text-white/30 font-semibold">Skip</button>
          <button className="px-6 py-3 rounded-2xl text-[14px] font-bold text-white flex items-center gap-2"
            style={{ background: "linear-gradient(135deg, #4F46E5, #6366F1)" }}>
            Next
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-28 h-[5px] bg-white/15 rounded-full" />
      </div>
    </div>
  );
}
