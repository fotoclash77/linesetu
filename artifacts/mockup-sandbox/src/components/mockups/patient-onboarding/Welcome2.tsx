export function Welcome2() {
  const queue = [
    { num: 38, label: "Ahead", done: true },
    { num: 39, label: "Ahead", done: true },
    { num: 40, label: "Now", active: true },
    { num: 41, label: "You", you: true },
    { num: 42, label: "Next", done: false },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#060A14]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-[390px] h-[844px] relative overflow-hidden bg-[#060A14] flex flex-col">

        {/* Glow orbs */}
        <div className="absolute top-[80px] left-[-60px] w-[260px] h-[260px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[80px] right-[-40px] w-[200px] h-[200px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 70%)" }} />

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
              style={{ background: "linear-gradient(135deg, #0891B2, #06B6D4)" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.8" />
                <path d="M12 8v4l3 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="1.5" fill="white" />
              </svg>
            </div>
            <div>
              <div className="text-[10px] font-bold text-[#22D3EE] tracking-[2px]">FEATURE 02</div>
              <div className="text-[12px] text-white/40 font-medium">Live tracking</div>
            </div>
          </div>

          {/* Heading */}
          <h2 className="text-[28px] font-black text-white leading-tight mb-2">
            Track Your<br />
            <span className="text-[#22D3EE]">Turn Live</span>
          </h2>
          <p className="text-[13px] text-white/45 leading-relaxed mb-7">
            Watch the queue move in real-time. Arrive exactly when it's your turn — no more sitting in a crowded waiting room.
          </p>

          {/* Live position card */}
          <div className="rounded-2xl p-4 mb-4 border border-[#06B6D4]/25"
            style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.1), rgba(8,145,178,0.06))" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[10px] font-bold text-[#22D3EE] tracking-wide">YOUR POSITION</div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-[42px] font-black text-white leading-none">41</span>
                  <span className="text-[14px] text-white/40 font-semibold">/ 58</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-white/30">Estimated wait</div>
                <div className="text-[22px] font-black text-white mt-0.5">~6 min</div>
                <div className="flex items-center gap-1 mt-1 justify-end">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#22D3EE]" style={{ boxShadow: "0 0 6px #22D3EE" }} />
                  <span className="text-[10px] text-[#22D3EE] font-semibold">Updating live</span>
                </div>
              </div>
            </div>

            {/* Queue track */}
            <div className="flex items-center gap-1">
              {queue.map((q, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className={`w-full h-7 rounded-lg flex items-center justify-center text-[12px] font-black relative
                    ${q.done ? "bg-white/[0.06] text-white/25" : ""}
                    ${q.active ? "text-white" : ""}
                    ${q.you ? "text-white" : ""}
                    ${!q.done && !q.active && !q.you ? "bg-white/[0.04] text-white/20" : ""}
                  `}
                    style={q.active ? { background: "rgba(6,182,212,0.25)", border: "1.5px solid rgba(6,182,212,0.5)" }
                      : q.you ? { background: "rgba(79,70,229,0.35)", border: "1.5px solid rgba(99,102,241,0.6)" }
                      : {}}>
                    {q.done ? <span className="text-[10px] text-green-500/50">✓</span> : q.num}
                    {q.active && <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#22D3EE]" style={{ boxShadow: "0 0 6px #22D3EE" }} />}
                  </div>
                  <span className={`text-[8px] font-bold ${q.you ? "text-[#818CF8]" : q.active ? "text-[#22D3EE]" : "text-white/20"}`}>
                    {q.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Notification preview */}
          <div className="rounded-2xl p-3.5 border border-white/[0.07]" style={{ background: "rgba(255,255,255,0.025)" }}>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(79,70,229,0.25)" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2a5 5 0 015 5v1l1 2H2L3 8V7a5 5 0 015-5z" stroke="#818CF8" strokeWidth="1.3" />
                  <path d="M6 13a2 2 0 004 0" stroke="#818CF8" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <div className="text-[11px] font-bold text-white">Your turn is almost here!</div>
                <div className="text-[10px] text-white/40 mt-0.5 leading-relaxed">
                  Token #41 · Dr. Ananya Sharma's clinic · Please be ready.
                </div>
                <div className="text-[9px] text-[#818CF8] font-semibold mt-1">Just now</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom nav dots */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-2">
          {[false, true, false].map((active, i) => (
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
