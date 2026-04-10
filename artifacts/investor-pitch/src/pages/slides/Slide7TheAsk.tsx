const base = import.meta.env.BASE_URL;

export default function Slide7TheAsk() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#070C1B" }}
    >
      <img
        src={`${base}hero.png`}
        crossOrigin="anonymous"
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.18 }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(160deg, rgba(7,12,27,0.95) 30%, rgba(10,18,36,0.85) 100%)",
        }}
      />

      <div className="relative z-10 flex h-full">
        <div className="flex flex-col justify-center pl-[7vw]" style={{ width: "55%" }}>
          <div
            className="inline-block px-[1.1vw] py-[0.4vh] rounded-full mb-[3vh]"
            style={{ background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.3)" }}
          >
            <span className="font-body font-semibold text-primary" style={{ fontSize: "1.4vw", letterSpacing: "0.1em" }}>
              THE ASK
            </span>
          </div>
          <div className="font-display font-extrabold text-text" style={{ fontSize: "5vw", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
            Join us at the <span className="text-primary">ground floor.</span>
          </div>
          <div className="font-body text-muted mt-[2.5vh]" style={{ fontSize: "1.7vw", lineHeight: 1.65, maxWidth: "40vw" }}>
            We are raising a pre-seed round to fund development, pilot launch, and city-wide expansion across India's outpatient clinic ecosystem.
          </div>

          <div className="mt-[4vh] flex gap-[3vw]">
            <div>
              <div className="font-display font-extrabold text-primary" style={{ fontSize: "4.5vw", letterSpacing: "-0.03em" }}>
                &#8377;50L
              </div>
              <div className="font-body text-muted" style={{ fontSize: "1.45vw" }}>Pre-seed target</div>
            </div>
            <div style={{ width: "1px", background: "rgba(255,255,255,0.1)", alignSelf: "stretch" }} />
            <div>
              <div className="font-display font-extrabold text-text" style={{ fontSize: "4.5vw", letterSpacing: "-0.03em" }}>
                18 mo
              </div>
              <div className="font-body text-muted" style={{ fontSize: "1.45vw" }}>Runway to 1,000 clinics</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center pr-[7vw]" style={{ width: "45%" }}>
          <div
            className="rounded-2xl p-[3.5vh]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)" }}
          >
            <div className="font-display font-bold text-text mb-[2.5vh]" style={{ fontSize: "1.9vw" }}>
              Use of Funds
            </div>
            <div className="flex flex-col gap-[1.8vh]">
              <div className="flex justify-between items-center">
                <span className="font-body text-muted" style={{ fontSize: "1.5vw" }}>Product Development</span>
                <span className="font-display font-bold text-text" style={{ fontSize: "1.75vw" }}>40%</span>
              </div>
              <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
              <div className="flex justify-between items-center">
                <span className="font-body text-muted" style={{ fontSize: "1.5vw" }}>Pilot Operations</span>
                <span className="font-display font-bold text-text" style={{ fontSize: "1.75vw" }}>25%</span>
              </div>
              <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
              <div className="flex justify-between items-center">
                <span className="font-body text-muted" style={{ fontSize: "1.5vw" }}>Doctor Acquisition</span>
                <span className="font-display font-bold text-text" style={{ fontSize: "1.75vw" }}>25%</span>
              </div>
              <div style={{ height: "1px", background: "rgba(255,255,255,0.06)" }} />
              <div className="flex justify-between items-center">
                <span className="font-body text-muted" style={{ fontSize: "1.5vw" }}>Ops & Infra</span>
                <span className="font-display font-bold text-primary" style={{ fontSize: "1.75vw" }}>10%</span>
              </div>
            </div>

            <div
              className="mt-[3vh] pt-[2.5vh]"
              style={{ borderTop: "1px solid rgba(245,166,35,0.2)" }}
            >
              <div className="font-display font-bold text-primary" style={{ fontSize: "2vw" }}>
                LINE<span className="text-text">SETU</span>
              </div>
              <div className="font-body text-muted mt-[0.5vh]" style={{ fontSize: "1.4vw" }}>
                linesetu.com · hello@linesetu.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
