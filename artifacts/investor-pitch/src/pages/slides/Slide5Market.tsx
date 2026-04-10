export default function Slide5Market() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#070C1B" }}
    >
      <div
        className="absolute"
        style={{
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80vw",
          height: "80vw",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(14,165,233,0.04) 0%, transparent 65%)",
        }}
      />
      <div
        className="absolute left-0 top-0 bottom-0"
        style={{ width: "5px", background: "linear-gradient(180deg, transparent, rgba(245,166,35,0.5), transparent)" }}
      />

      <div className="relative z-10 px-[7vw] pt-[6vh]">
        <div
          className="inline-block px-[1.1vw] py-[0.4vh] rounded-full mb-[2vh]"
          style={{ background: "rgba(14,165,233,0.12)", border: "1px solid rgba(14,165,233,0.3)" }}
        >
          <span className="font-body font-semibold" style={{ fontSize: "1.4vw", color: "#38BDF8", letterSpacing: "0.1em" }}>
            MARKET OPPORTUNITY
          </span>
        </div>
        <div className="font-display font-extrabold text-text" style={{ fontSize: "4.2vw", lineHeight: 1.1, letterSpacing: "-0.025em" }}>
          A massive, <span className="text-accent">under-served</span> market.
        </div>
      </div>

      <div className="relative z-10 px-[7vw] mt-[3.5vh] flex gap-[3vw]">
        <div
          className="flex-1 rounded-2xl p-[3vh] text-center"
          style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.2)" }}
        >
          <div className="font-display font-extrabold text-accent" style={{ fontSize: "5.5vw", letterSpacing: "-0.03em" }}>
            13.5L+
          </div>
          <div className="font-body font-semibold text-text mt-[0.5vh]" style={{ fontSize: "1.55vw" }}>Registered Doctors</div>
          <div className="font-body text-muted mt-[0.5vh]" style={{ fontSize: "1.35vw" }}>in India (MCI / NMC data)</div>
        </div>

        <div
          className="flex-1 rounded-2xl p-[3vh] text-center"
          style={{ background: "rgba(245,166,35,0.06)", border: "1px solid rgba(245,166,35,0.2)" }}
        >
          <div className="font-display font-extrabold text-primary" style={{ fontSize: "5.5vw", letterSpacing: "-0.03em" }}>
            8.5L+
          </div>
          <div className="font-body font-semibold text-text mt-[0.5vh]" style={{ fontSize: "1.55vw" }}>Outpatient Clinics</div>
          <div className="font-body text-muted mt-[0.5vh]" style={{ fontSize: "1.35vw" }}>operating independently</div>
        </div>

        <div
          className="flex-1 rounded-2xl p-[3vh] text-center"
          style={{ background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.2)" }}
        >
          <div className="font-display font-extrabold" style={{ fontSize: "5.5vw", letterSpacing: "-0.03em", color: "#A78BFA" }}>
            3B+
          </div>
          <div className="font-body font-semibold text-text mt-[0.5vh]" style={{ fontSize: "1.55vw" }}>OPD visits/year</div>
          <div className="font-body text-muted mt-[0.5vh]" style={{ fontSize: "1.35vw" }}>in India annually</div>
        </div>
      </div>

      <div className="relative z-10 px-[7vw] mt-[3.5vh] flex gap-[3vw]">
        <div
          className="flex-1 rounded-2xl px-[2.5vw] py-[2.5vh] flex items-center justify-between"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div>
            <div className="font-body text-muted" style={{ fontSize: "1.45vw" }}>Serviceable Addressable Market</div>
            <div className="font-display font-bold text-text" style={{ fontSize: "2.8vw" }}>&#8377;3,000 Cr</div>
          </div>
          <div
            className="px-[1.2vw] py-[0.6vh] rounded-full"
            style={{ background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.25)" }}
          >
            <span className="font-body text-primary font-semibold" style={{ fontSize: "1.35vw" }}>SAM</span>
          </div>
        </div>

        <div
          className="flex-1 rounded-2xl px-[2.5vw] py-[2.5vh] flex items-center justify-between"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div>
            <div className="font-body text-muted" style={{ fontSize: "1.45vw" }}>Total Addressable Market</div>
            <div className="font-display font-bold text-text" style={{ fontSize: "2.8vw" }}>&#8377;30,000 Cr</div>
          </div>
          <div
            className="px-[1.2vw] py-[0.6vh] rounded-full"
            style={{ background: "rgba(14,165,233,0.12)", border: "1px solid rgba(14,165,233,0.25)" }}
          >
            <span className="font-body text-accent font-semibold" style={{ fontSize: "1.35vw" }}>TAM</span>
          </div>
        </div>

        <div
          className="flex-1 rounded-2xl px-[2.5vw] py-[2.5vh] flex items-center justify-between"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div>
            <div className="font-body text-muted" style={{ fontSize: "1.45vw" }}>Digital health CAGR</div>
            <div className="font-display font-bold text-primary" style={{ fontSize: "2.8vw" }}>22% CAGR</div>
          </div>
          <div
            className="px-[1.2vw] py-[0.6vh] rounded-full"
            style={{ background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.25)" }}
          >
            <span className="font-body text-primary font-semibold" style={{ fontSize: "1.35vw" }}>Growth</span>
          </div>
        </div>
      </div>
    </div>
  );
}
