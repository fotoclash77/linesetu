export function Welcome3() {
  const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
  const values = [28000, 34000, 31000, 42000, 38000, 51000];
  const maxVal = 55000;

  const formatInr = (n: number) =>
    n >= 1000 ? `₹${(n / 1000).toFixed(0)}K` : `₹${n}`;

  const features = [
    { icon: "💸", title: "Digital Payments", desc: "Razorpay-powered instant payouts" },
    { icon: "📋", title: "Booking History", desc: "Full record of every consultation" },
    { icon: "⭐", title: "Patient Reviews", desc: "Build reputation, earn trust" },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#060E12]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-[390px] h-[844px] relative overflow-hidden bg-[#060E12] flex flex-col">

        {/* Glow orbs */}
        <div className="absolute top-[50px] left-[-60px] w-[260px] h-[260px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(13,148,136,0.25) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[80px] right-[-40px] w-[220px] h-[220px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(45,212,191,0.12) 0%, transparent 70%)" }} />

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
              style={{ background: "linear-gradient(135deg, #0F766E, #0D9488)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 17l5-5 4 4 5-6 4 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 6l-4 1 1 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#2DD4BF] tracking-[2px]">FEATURE 03</div>
              <div className="text-[12px] text-white/40 font-medium">Grow & earn</div>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-[28px] font-black text-white leading-tight mb-2">
            Grow Your<br />
            <span className="text-[#2DD4BF]">Practice</span>
          </h2>
          <p className="text-[13px] text-white/45 leading-relaxed mb-6">
            Transparent earnings, instant payouts, and tools to attract more patients — all in one place.
          </p>

          {/* Earnings card */}
          <div className="rounded-2xl p-4 mb-4 border border-[#0D9488]/25"
            style={{ background: "linear-gradient(135deg, rgba(13,148,136,0.12), rgba(15,118,110,0.06))" }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="text-[11px] text-[#2DD4BF] font-bold tracking-wide">MARCH EARNINGS</div>
                <div className="text-[30px] font-black text-white leading-none mt-1">₹51,000</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <div className="w-4 h-4 rounded-full bg-[#2DD4BF]/20 flex items-center justify-center">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M5 7.5V2.5M5 2.5L2.5 5M5 2.5L7.5 5" stroke="#2DD4BF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold text-[#2DD4BF]">+34% vs last month</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-white/30">Payout due</div>
                <div className="text-[13px] font-bold text-white mt-0.5">Apr 1</div>
                <div className="text-[10px] text-[#2DD4BF] mt-1 font-semibold">Auto-transfer ✓</div>
              </div>
            </div>

            {/* Earnings mini chart */}
            <div className="flex items-end gap-1.5 h-[52px]">
              {values.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full rounded-t-sm"
                    style={{
                      height: `${(v / maxVal) * 44}px`,
                      background: i === 5
                        ? "linear-gradient(to top, #0D9488, #2DD4BF)"
                        : "rgba(255,255,255,0.08)"
                    }} />
                  <span className="text-[8px] text-white/25 font-medium">{months[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feature pills */}
          <div className="flex flex-col gap-2">
            {features.map(({ icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/[0.07] bg-white/[0.025]">
                <span className="text-[20px] flex-shrink-0">{icon}</span>
                <div>
                  <div className="text-[12px] font-bold text-white">{title}</div>
                  <div className="text-[10px] text-white/35 font-medium">{desc}</div>
                </div>
                <div className="ml-auto w-4 h-4 rounded-full border border-[#2DD4BF]/40 flex items-center justify-center flex-shrink-0">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4h5M4 1.5L6.5 4 4 6.5" stroke="#2DD4BF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom nav dots */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-2">
          {[false, false, true].map((active, i) => (
            <div key={i} className={`rounded-full transition-all ${active ? "w-5 h-2 bg-[#0D9488]" : "w-2 h-2 bg-white/20"}`} />
          ))}
        </div>

        {/* Bottom CTA — final screen gets "Get Started" */}
        <div className="absolute bottom-[60px] left-6 right-6">
          <button className="w-full py-4 rounded-2xl text-[15px] font-black text-white"
            style={{ background: "linear-gradient(135deg, #0D9488 0%, #0891B2 100%)", boxShadow: "0 8px 32px rgba(13,148,136,0.4)" }}>
            Get Started →
          </button>
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-28 h-[5px] bg-white/15 rounded-full" />
      </div>
    </div>
  );
}
