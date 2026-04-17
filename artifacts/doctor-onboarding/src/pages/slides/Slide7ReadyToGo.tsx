const base = import.meta.env.BASE_URL;

export default function Slide7ReadyToGo() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#F0FDF9" }}
    >
      <img
        src={`${base}clinic-hero.png`}
        crossOrigin="anonymous"
        alt="Clinic background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.12 }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, rgba(240,253,249,0.97) 0%, rgba(236,253,245,0.9) 100%)",
        }}
      />

      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: "0.6vh", background: "linear-gradient(90deg, transparent, #0D9488, #2DD4BF, #0D9488, transparent)" }}
      />

      <div className="relative z-10 flex h-full">
        <div className="flex flex-col justify-center pl-[8vw]" style={{ width: "58%" }}>
          <div
            className="inline-block px-[1.2vw] py-[0.5vh] rounded-full mb-[3vh]"
            style={{ background: "rgba(13,148,136,0.1)", border: "1px solid rgba(13,148,136,0.3)" }}
          >
            <span className="font-body font-semibold text-primary" style={{ fontSize: "1.5vw", letterSpacing: "0.08em" }}>
              YOU ARE ALL SET
            </span>
          </div>
          <div className="font-display font-black text-text" style={{ fontSize: "6vw", lineHeight: 0.95, letterSpacing: "-0.035em" }}>
            Your clinic,
          </div>
          <div className="font-display font-black" style={{ fontSize: "6vw", lineHeight: 0.95, letterSpacing: "-0.035em", color: "#0D9488" }}>
            upgraded.
          </div>
          <div className="font-body text-muted mt-[3vh]" style={{ fontSize: "1.7vw", lineHeight: 1.65, maxWidth: "40vw" }}>
            You now have a fully managed queue, automatic earnings tracking, and weekly bank settlements — without changing how you practice medicine.
          </div>
        </div>

        <div className="flex flex-col justify-center pr-[8vw]" style={{ width: "42%" }}>
          <div
            className="rounded-2xl p-[3.5vh]"
            style={{ background: "#FFFFFF", border: "1px solid rgba(13,148,136,0.2)" }}
          >
            <div className="font-display font-bold text-text mb-[2.5vh]" style={{ fontSize: "1.9vw" }}>
              Your LINESETU Summary
            </div>

            <div className="flex flex-col gap-[1.8vh]">
              <div className="flex justify-between items-center">
                <span className="font-body text-muted" style={{ fontSize: "1.5vw" }}>Token booking</span>
                <span className="font-display font-bold text-primary" style={{ fontSize: "1.65vw" }}>Online, 24/7</span>
              </div>
              <div style={{ height: "1px", background: "rgba(13,148,136,0.1)" }} />
              <div className="flex justify-between items-center">
                <span className="font-body text-muted" style={{ fontSize: "1.5vw" }}>Normal token earn</span>
                <span className="font-display font-bold text-text" style={{ fontSize: "1.65vw" }}>&#8377;10 / token</span>
              </div>
              <div style={{ height: "1px", background: "rgba(13,148,136,0.1)" }} />
              <div className="flex justify-between items-center">
                <span className="font-body text-muted" style={{ fontSize: "1.5vw" }}>Emergency earn</span>
                <span className="font-display font-bold text-accent" style={{ fontSize: "1.65vw" }}>&#8377;20 / token</span>
              </div>
              <div style={{ height: "1px", background: "rgba(13,148,136,0.1)" }} />
              <div className="flex justify-between items-center">
                <span className="font-body text-muted" style={{ fontSize: "1.5vw" }}>Payout day</span>
                <span className="font-display font-bold text-text" style={{ fontSize: "1.65vw" }}>Every Tuesday</span>
              </div>
              <div style={{ height: "1px", background: "rgba(13,148,136,0.1)" }} />
              <div className="flex justify-between items-center">
                <span className="font-body text-muted" style={{ fontSize: "1.5vw" }}>Support</span>
                <span className="font-display font-bold text-text" style={{ fontSize: "1.65vw" }}>Mon–Sat, 9–7</span>
              </div>
            </div>

            <div
              className="mt-[2.5vh] pt-[2vh]"
              style={{ borderTop: "1px solid rgba(13,148,136,0.15)" }}
            >
              <div className="font-display font-bold text-primary" style={{ fontSize: "1.85vw" }}>
                LINE<span className="text-text">SETU</span>
              </div>
              <div className="font-body text-muted mt-[0.4vh]" style={{ fontSize: "1.4vw" }}>
                linesetu.com · hello@linesetu.com
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
