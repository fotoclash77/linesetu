const base = import.meta.env.BASE_URL;

export default function Slide1Cover() {
  return (
    <div className="relative w-screen h-screen overflow-hidden" style={{ background: "#070C1B" }}>
      <img
        src={`${base}hero.png`}
        crossOrigin="anonymous"
        alt="Hero background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.45 }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, rgba(7,12,27,0.92) 0%, rgba(7,12,27,0.55) 60%, rgba(7,12,27,0.85) 100%)",
        }}
      />

      <div className="absolute left-[6vw] bottom-[8vh]">
        <div
          className="inline-block px-[1.2vw] py-[0.5vh] rounded-full mb-[2.5vh]"
          style={{ background: "rgba(245,166,35,0.18)", border: "1px solid rgba(245,166,35,0.45)" }}
        >
          <span className="font-body text-primary font-semibold" style={{ fontSize: "1.5vw", letterSpacing: "0.12em" }}>
            INVESTOR PRESENTATION — 2026
          </span>
        </div>
        <div className="font-display font-extrabold text-text" style={{ fontSize: "7.5vw", lineHeight: 1, letterSpacing: "-0.03em" }}>
          LINE<span className="text-primary">SETU</span>
        </div>
        <div className="font-display font-light text-text mt-[1.8vh]" style={{ fontSize: "2.4vw", opacity: 0.85, letterSpacing: "0.01em" }}>
          Smart Queue. Zero Wait.
        </div>
        <div className="font-body text-muted mt-[2.5vh]" style={{ fontSize: "1.65vw", maxWidth: "42vw", lineHeight: 1.6 }}>
          India's first end-to-end token management platform for outpatient clinics — built for doctors, loved by patients.
        </div>
      </div>

      <div
        className="absolute right-[6vw] top-[50%]"
        style={{ transform: "translateY(-50%)" }}
      >
        <div className="flex flex-col gap-[2.5vh]">
          <div className="text-right">
            <div className="font-display font-bold text-primary" style={{ fontSize: "3.8vw" }}>1.4B</div>
            <div className="font-body text-muted" style={{ fontSize: "1.55vw" }}>People in India</div>
          </div>
          <div
            className="self-end"
            style={{ width: "1px", height: "6vh", background: "rgba(245,166,35,0.3)" }}
          />
          <div className="text-right">
            <div className="font-display font-bold text-text" style={{ fontSize: "3.8vw" }}>13.5L+</div>
            <div className="font-body text-muted" style={{ fontSize: "1.55vw" }}>Registered Doctors</div>
          </div>
          <div
            className="self-end"
            style={{ width: "1px", height: "6vh", background: "rgba(245,166,35,0.3)" }}
          />
          <div className="text-right">
            <div className="font-display font-bold text-accent" style={{ fontSize: "3.8vw" }}>Zero</div>
            <div className="font-body text-muted" style={{ fontSize: "1.55vw" }}>Existing Solutions</div>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-[3.5vh] right-[6vw] font-body text-muted"
        style={{ fontSize: "1.3vw", opacity: 0.55 }}
      >
        Confidential · April 2026
      </div>
    </div>
  );
}
