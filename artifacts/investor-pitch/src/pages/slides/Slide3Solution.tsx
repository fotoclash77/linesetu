export default function Slide3Solution() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "linear-gradient(135deg, #070C1B 0%, #0A1020 100%)" }}
    >
      <div
        className="absolute top-0 right-0 w-[55vw] h-[55vh] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 70%)",
          transform: "translate(20%, -20%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[45vw] h-[45vh] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(245,166,35,0.05) 0%, transparent 70%)",
          transform: "translate(-15%, 20%)",
        }}
      />

      <div className="relative z-10 px-[7vw] pt-[6vh]">
        <div
          className="inline-block px-[1.1vw] py-[0.4vh] rounded-full mb-[1.5vh]"
          style={{ background: "rgba(14,165,233,0.12)", border: "1px solid rgba(14,165,233,0.3)" }}
        >
          <span className="font-body font-semibold" style={{ fontSize: "1.4vw", color: "#38BDF8", letterSpacing: "0.1em" }}>
            THE SOLUTION
          </span>
        </div>
        <div className="font-display font-extrabold text-text" style={{ fontSize: "4vw", lineHeight: 1.1, letterSpacing: "-0.025em" }}>
          One platform. Three apps. <span className="text-primary">Zero queues.</span>
        </div>
        <div className="font-body text-muted mt-[1.5vh]" style={{ fontSize: "1.6vw" }}>
          LINESETU is a full-stack token management system built for Indian outpatient clinics.
        </div>
      </div>

      <div className="relative z-10 px-[7vw] mt-[3.5vh] flex gap-[2.5vw]">
        <div
          className="flex-1 rounded-2xl p-[2.8vh]"
          style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.22)" }}
        >
          <div
            className="inline-flex items-center justify-center rounded-xl mb-[2vh]"
            style={{ width: "4.5vw", height: "4.5vw", background: "rgba(245,166,35,0.12)" }}
          >
            <span className="font-display font-bold text-primary" style={{ fontSize: "1.8vw" }}>P</span>
          </div>
          <div className="font-display font-bold text-text" style={{ fontSize: "1.85vw", marginBottom: "1.2vh" }}>
            Patient App
          </div>
          <div className="font-body text-muted" style={{ fontSize: "1.45vw", lineHeight: 1.6 }}>
            Book tokens online, track real-time queue position, receive smart notifications, and pay with UPI — all from their phone.
          </div>
          <div
            className="mt-[2vh] pt-[2vh]"
            style={{ borderTop: "1px solid rgba(245,166,35,0.15)" }}
          >
            <div className="font-body text-primary font-semibold" style={{ fontSize: "1.35vw" }}>8 screens · Dark glass UI</div>
          </div>
        </div>

        <div
          className="flex-1 rounded-2xl p-[2.8vh]"
          style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.22)" }}
        >
          <div
            className="inline-flex items-center justify-center rounded-xl mb-[2vh]"
            style={{ width: "4.5vw", height: "4.5vw", background: "rgba(14,165,233,0.12)" }}
          >
            <span className="font-display font-bold text-accent" style={{ fontSize: "1.8vw" }}>D</span>
          </div>
          <div className="font-display font-bold text-text" style={{ fontSize: "1.85vw", marginBottom: "1.2vh" }}>
            Doctor App
          </div>
          <div className="font-body text-muted" style={{ fontSize: "1.45vw", lineHeight: 1.6 }}>
            Manage live queues, control clinic hours, track daily earnings per token, and view patient history — from one teal dashboard.
          </div>
          <div
            className="mt-[2vh] pt-[2vh]"
            style={{ borderTop: "1px solid rgba(14,165,233,0.15)" }}
          >
            <div className="font-body text-accent font-semibold" style={{ fontSize: "1.35vw" }}>8 screens · Teal dark UI</div>
          </div>
        </div>

        <div
          className="flex-1 rounded-2xl p-[2.8vh]"
          style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.22)" }}
        >
          <div
            className="inline-flex items-center justify-center rounded-xl mb-[2vh]"
            style={{ width: "4.5vw", height: "4.5vw", background: "rgba(167,139,250,0.12)" }}
          >
            <span className="font-display font-bold" style={{ fontSize: "1.8vw", color: "#A78BFA" }}>A</span>
          </div>
          <div className="font-display font-bold text-text" style={{ fontSize: "1.85vw", marginBottom: "1.2vh" }}>
            Admin Panel
          </div>
          <div className="font-body text-muted" style={{ fontSize: "1.45vw", lineHeight: 1.6 }}>
            Platform-wide oversight — onboard clinics, monitor live queues across cities, track platform revenue, and flag disputes.
          </div>
          <div
            className="mt-[2vh] pt-[2vh]"
            style={{ borderTop: "1px solid rgba(167,139,250,0.15)" }}
          >
            <div className="font-body font-semibold" style={{ fontSize: "1.35vw", color: "#A78BFA" }}>6 pages · Desktop web</div>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-[7vw] mt-[3.5vh]">
        <div
          className="rounded-2xl px-[3vw] py-[2vh] flex items-center justify-between"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="font-body text-muted" style={{ fontSize: "1.5vw" }}>
            Built on <span className="text-text font-semibold">Firebase</span> · Powered by <span className="text-text font-semibold">Razorpay</span> · Delivered via <span className="text-text font-semibold">FCM Push Notifications</span>
          </div>
          <div className="font-display font-bold text-primary" style={{ fontSize: "1.6vw" }}>
            Launch-ready in 6 weeks
          </div>
        </div>
      </div>
    </div>
  );
}
