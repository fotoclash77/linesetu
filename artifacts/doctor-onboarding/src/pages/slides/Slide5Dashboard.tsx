export default function Slide5Dashboard() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#F0FDF9" }}
    >
      <div
        className="absolute top-0 left-0 w-[45vw] h-[45vh]"
        style={{
          background: "radial-gradient(ellipse, rgba(13,148,136,0.07) 0%, transparent 70%)",
          transform: "translate(-10%, -10%)",
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0"
        style={{ width: "0.5vw", background: "linear-gradient(180deg, transparent, #0D9488, transparent)" }}
      />

      <div className="relative z-10 px-[7vw] pt-[6vh]">
        <div
          className="inline-block px-[1.1vw] py-[0.4vh] rounded-full mb-[2vh]"
          style={{ background: "rgba(13,148,136,0.1)", border: "1px solid rgba(13,148,136,0.3)" }}
        >
          <span className="font-body font-semibold text-primary" style={{ fontSize: "1.4vw", letterSpacing: "0.1em" }}>
            YOUR DASHBOARD
          </span>
        </div>
        <div className="font-display font-extrabold text-text" style={{ fontSize: "4.2vw", lineHeight: 1.1, letterSpacing: "-0.025em" }}>
          Your clinic, at a glance.
        </div>
        <div className="font-body text-muted mt-[1.5vh]" style={{ fontSize: "1.6vw" }}>
          Everything you need to manage your day — in four clean screens.
        </div>
      </div>

      <div className="relative z-10 px-[7vw] mt-[3.5vh] flex gap-[2.5vw]">
        <div
          className="flex-1 rounded-2xl p-[3vh]"
          style={{ background: "#FFFFFF", border: "1px solid rgba(13,148,136,0.15)" }}
        >
          <div
            className="w-[3.5vw] h-[3.5vw] rounded-xl flex items-center justify-center mb-[1.8vh]"
            style={{ background: "rgba(13,148,136,0.1)" }}
          >
            <span className="font-display font-black text-primary" style={{ fontSize: "1.6vw" }}>H</span>
          </div>
          <div className="font-display font-bold text-text" style={{ fontSize: "1.75vw", marginBottom: "1vh" }}>
            Home Dashboard
          </div>
          <div className="font-body text-muted" style={{ fontSize: "1.4vw", lineHeight: 1.55 }}>
            Today's token count, earnings summary, and clinic shift status — all in one view. Morning and Evening shifts supported.
          </div>
        </div>

        <div
          className="flex-1 rounded-2xl p-[3vh]"
          style={{ background: "#FFFFFF", border: "1px solid rgba(13,148,136,0.15)" }}
        >
          <div
            className="w-[3.5vw] h-[3.5vw] rounded-xl flex items-center justify-center mb-[1.8vh]"
            style={{ background: "rgba(13,148,136,0.1)" }}
          >
            <span className="font-display font-black text-primary" style={{ fontSize: "1.6vw" }}>Q</span>
          </div>
          <div className="font-display font-bold text-text" style={{ fontSize: "1.75vw", marginBottom: "1vh" }}>
            Manage Queue
          </div>
          <div className="font-body text-muted" style={{ fontSize: "1.4vw", lineHeight: 1.55 }}>
            Live queue list. Call the next patient, skip, or mark as seen. Emergency tokens surface at the top automatically.
          </div>
        </div>

        <div
          className="flex-1 rounded-2xl p-[3vh]"
          style={{ background: "#FFFFFF", border: "1px solid rgba(13,148,136,0.15)" }}
        >
          <div
            className="w-[3.5vw] h-[3.5vw] rounded-xl flex items-center justify-center mb-[1.8vh]"
            style={{ background: "rgba(245,158,11,0.1)" }}
          >
            <span className="font-display font-black text-accent" style={{ fontSize: "1.6vw" }}>&#8377;</span>
          </div>
          <div className="font-display font-bold text-text" style={{ fontSize: "1.75vw", marginBottom: "1vh" }}>
            Earnings Screen
          </div>
          <div className="font-body text-muted" style={{ fontSize: "1.4vw", lineHeight: 1.55 }}>
            Filter by Today, This Week, This Month, Last Month, or Lifetime. See exactly what's pending, processing, and paid out.
          </div>
        </div>

        <div
          className="flex-1 rounded-2xl p-[3vh]"
          style={{ background: "#FFFFFF", border: "1px solid rgba(13,148,136,0.15)" }}
        >
          <div
            className="w-[3.5vw] h-[3.5vw] rounded-xl flex items-center justify-center mb-[1.8vh]"
            style={{ background: "rgba(139,92,246,0.08)" }}
          >
            <span className="font-display font-black" style={{ fontSize: "1.6vw", color: "#8B5CF6" }}>S</span>
          </div>
          <div className="font-display font-bold text-text" style={{ fontSize: "1.75vw", marginBottom: "1vh" }}>
            Settings & Profile
          </div>
          <div className="font-body text-muted" style={{ fontSize: "1.4vw", lineHeight: 1.55 }}>
            Update clinic hours, set shift schedule, manage bank account for payouts, toggle visibility to new patients.
          </div>
        </div>
      </div>

      <div className="relative z-10 px-[7vw] mt-[3vh]">
        <div
          className="rounded-2xl px-[3vw] py-[2.2vh] flex items-center justify-between"
          style={{ background: "rgba(13,148,136,0.07)", border: "1px solid rgba(13,148,136,0.18)" }}
        >
          <div className="font-body text-muted" style={{ fontSize: "1.5vw" }}>
            Available on <span className="text-text font-semibold">Android and iOS</span> · Works even on 4G · Offline queue view supported
          </div>
          <div className="font-display font-bold text-primary" style={{ fontSize: "1.6vw" }}>
            Dark glassmorphic UI · Built for speed
          </div>
        </div>
      </div>
    </div>
  );
}
