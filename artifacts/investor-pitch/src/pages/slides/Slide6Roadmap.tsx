export default function Slide6Roadmap() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "linear-gradient(155deg, #0A1020 0%, #070C1B 100%)" }}
    >
      <div
        className="absolute bottom-0 right-0 w-[50vw] h-[50vh] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 70%)",
          transform: "translate(20%, 20%)",
        }}
      />

      <div className="relative z-10 px-[7vw] pt-[6vh]">
        <div
          className="inline-block px-[1.1vw] py-[0.4vh] rounded-full mb-[2vh]"
          style={{ background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.3)" }}
        >
          <span className="font-body font-semibold text-primary" style={{ fontSize: "1.4vw", letterSpacing: "0.1em" }}>
            TRACTION & ROADMAP
          </span>
        </div>
        <div className="font-display font-extrabold text-text" style={{ fontSize: "4vw", lineHeight: 1.1, letterSpacing: "-0.025em" }}>
          From prototype to production in <span className="text-primary">6 weeks.</span>
        </div>
        <div className="font-body text-muted mt-[1.5vh]" style={{ fontSize: "1.6vw" }}>
          Full UI prototypes completed. Firebase backend architecture defined. Razorpay integration mapped.
        </div>
      </div>

      <div className="relative z-10 px-[7vw] mt-[4vh]">
        <div className="relative flex items-stretch gap-0">
          <div
            className="absolute top-[3.5vh] left-0 right-0"
            style={{ height: "2px", background: "rgba(245,166,35,0.2)" }}
          />

          <div className="flex-1 relative flex flex-col items-center">
            <div
              className="relative z-10 w-[3.5vw] h-[3.5vw] rounded-full flex items-center justify-center font-display font-bold text-text"
              style={{ background: "#F5A623", fontSize: "1.4vw" }}
            >
              1
            </div>
            <div
              className="mt-[2vh] rounded-2xl p-[2.2vh] w-full"
              style={{ background: "rgba(245,166,35,0.08)", border: "1px solid rgba(245,166,35,0.2)" }}
            >
              <div className="font-body text-primary font-semibold" style={{ fontSize: "1.35vw" }}>Weeks 1–2</div>
              <div className="font-display font-bold text-text mt-[0.5vh]" style={{ fontSize: "1.65vw" }}>
                Firebase Setup
              </div>
              <div className="font-body text-muted mt-[0.8vh]" style={{ fontSize: "1.35vw", lineHeight: 1.5 }}>
                Auth, Firestore schema, Cloud Functions, FCM push infra
              </div>
            </div>
          </div>

          <div className="flex-1 relative flex flex-col items-center">
            <div
              className="relative z-10 w-[3.5vw] h-[3.5vw] rounded-full flex items-center justify-center font-display font-bold"
              style={{ background: "rgba(14,165,233,0.8)", color: "#fff", fontSize: "1.4vw" }}
            >
              2
            </div>
            <div
              className="mt-[2vh] rounded-2xl p-[2.2vh] w-full"
              style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.2)" }}
            >
              <div className="font-body text-accent font-semibold" style={{ fontSize: "1.35vw" }}>Weeks 3–4</div>
              <div className="font-display font-bold text-text mt-[0.5vh]" style={{ fontSize: "1.65vw" }}>
                Payments & Apps
              </div>
              <div className="font-body text-muted mt-[0.8vh]" style={{ fontSize: "1.35vw", lineHeight: 1.5 }}>
                Razorpay integration, React Native apps, live queue engine
              </div>
            </div>
          </div>

          <div className="flex-1 relative flex flex-col items-center">
            <div
              className="relative z-10 w-[3.5vw] h-[3.5vw] rounded-full flex items-center justify-center font-display font-bold"
              style={{ background: "rgba(167,139,250,0.8)", color: "#fff", fontSize: "1.4vw" }}
            >
              3
            </div>
            <div
              className="mt-[2vh] rounded-2xl p-[2.2vh] w-full"
              style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.2)" }}
            >
              <div className="font-body font-semibold" style={{ fontSize: "1.35vw", color: "#A78BFA" }}>Week 5</div>
              <div className="font-display font-bold text-text mt-[0.5vh]" style={{ fontSize: "1.65vw" }}>
                Pilot Launch
              </div>
              <div className="font-body text-muted mt-[0.8vh]" style={{ fontSize: "1.35vw", lineHeight: 1.5 }}>
                5 clinics in Tier-1 city, beta patients, earnings tracking live
              </div>
            </div>
          </div>

          <div className="flex-1 relative flex flex-col items-center">
            <div
              className="relative z-10 w-[3.5vw] h-[3.5vw] rounded-full flex items-center justify-center font-display font-bold"
              style={{ background: "rgba(34,197,94,0.8)", color: "#fff", fontSize: "1.4vw" }}
            >
              4
            </div>
            <div
              className="mt-[2vh] rounded-2xl p-[2.2vh] w-full"
              style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.2)" }}
            >
              <div className="font-body font-semibold" style={{ fontSize: "1.35vw", color: "#4ADE80" }}>Week 6+</div>
              <div className="font-display font-bold text-text mt-[0.5vh]" style={{ fontSize: "1.65vw" }}>
                Scale
              </div>
              <div className="font-body text-muted mt-[0.8vh]" style={{ fontSize: "1.35vw", lineHeight: 1.5 }}>
                City-wide rollout, doctor onboarding campaigns, admin panel live
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-[7vw] mt-[3.5vh]">
        <div
          className="rounded-2xl px-[3vw] py-[2.2vh] flex items-center justify-between"
          style={{ background: "rgba(245,166,35,0.07)", border: "1px solid rgba(245,166,35,0.2)" }}
        >
          <div className="font-body text-muted" style={{ fontSize: "1.5vw" }}>
            Current status: <span className="text-text font-semibold">Full UI prototypes complete</span> · Firebase stack selected · Team assembled
          </div>
          <div className="font-display font-bold text-primary" style={{ fontSize: "1.65vw" }}>
            Day Zero → Production: 6 Weeks
          </div>
        </div>
      </div>
    </div>
  );
}
