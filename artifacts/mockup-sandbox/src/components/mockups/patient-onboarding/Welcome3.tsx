export function Welcome3() {
  const methods = [
    { label: "UPI", icon: "⚡", sub: "GPay, PhonePe, Paytm", accent: "#22C55E" },
    { label: "Cards", icon: "💳", sub: "Visa, Mastercard, RuPay", accent: "#3B82F6" },
    { label: "Net Banking", icon: "🏦", sub: "100+ banks supported", accent: "#F59E0B" },
  ];

  const receipts = [
    { doc: "Dr. Ananya Sharma", date: "Mar 28", amt: "₹500", status: "Paid" },
    { doc: "Dr. Priya Nair", date: "Mar 15", amt: "₹600", status: "Paid" },
    { doc: "Dr. Vikram Patel", date: "Mar 3", amt: "₹400", status: "Paid" },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#060A14]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-[390px] h-[844px] relative overflow-hidden bg-[#060A14] flex flex-col">

        {/* Glow orbs */}
        <div className="absolute top-[60px] right-[-50px] w-[240px] h-[240px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(34,197,94,0.14) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[60px] left-[-40px] w-[220px] h-[220px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(79,70,229,0.18) 0%, transparent 70%)" }} />

        {/* Content */}
        <div className="flex-1 flex flex-col px-6 pt-6 pb-6">

          {/* Heading */}
          <h2 className="text-[28px] font-black text-white leading-tight mb-2">
            Pay Securely,<br />
            <span className="text-[#4ADE80]">Every Time</span>
          </h2>
          <p className="text-[13px] text-white/45 leading-relaxed mb-5">
            Pay consultation fees online with UPI, cards, or net banking. Instant receipts, zero cash hassle.
          </p>

          {/* Payment methods */}
          <div className="flex gap-2 mb-5">
            {methods.map(({ label, icon, sub, accent }) => (
              <div key={label} className="flex-1 rounded-2xl p-3 border border-white/[0.07] flex flex-col items-center text-center"
                style={{ background: "rgba(255,255,255,0.025)" }}>
                <span className="text-[22px] mb-1">{icon}</span>
                <div className="text-[11px] font-bold text-white">{label}</div>
                <div className="text-[9px] text-white/30 font-medium mt-0.5 leading-tight">{sub}</div>
              </div>
            ))}
          </div>

          {/* Security badge */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-5 border border-green-500/20"
            style={{ background: "rgba(34,197,94,0.07)" }}>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(34,197,94,0.2)" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L3 4v4c0 3 2.5 5.5 5 6 2.5-.5 5-3 5-6V4L8 2z" stroke="#4ADE80" strokeWidth="1.3" />
                <path d="M5.5 8l2 2 3-3" stroke="#4ADE80" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <div className="text-[11px] font-bold text-white">256-bit SSL Encrypted</div>
              <div className="text-[10px] text-white/35">Powered by Razorpay · PCI-DSS Compliant</div>
            </div>
          </div>

          {/* Recent receipts */}
          <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: "rgba(255,255,255,0.025)" }}>
            <div className="px-4 py-2.5 border-b border-white/[0.05]">
              <span className="text-[11px] font-bold text-white/60">Recent Consultations</span>
            </div>
            {receipts.map((r, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.04] last:border-0">
                <div>
                  <div className="text-[11px] font-semibold text-white">{r.doc}</div>
                  <div className="text-[9px] text-white/30">{r.date}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-white">{r.amt}</span>
                  <span className="text-[9px] font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">{r.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom nav dots */}
        <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-2">
          {[false, false, true].map((active, i) => (
            <div key={i} className={`rounded-full ${active ? "w-5 h-2 bg-[#4F46E5]" : "w-2 h-2 bg-white/20"}`} />
          ))}
        </div>

        {/* Final CTA */}
        <div className="absolute bottom-[60px] left-6 right-6">
          <button className="w-full py-4 rounded-2xl text-[15px] font-black text-white"
            style={{ background: "linear-gradient(135deg, #4F46E5 0%, #6366F1 100%)", boxShadow: "0 8px 32px rgba(79,70,229,0.4)" }}>
            Get Started →
          </button>
        </div>

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-28 h-[5px] bg-white/15 rounded-full" />
      </div>
    </div>
  );
}
