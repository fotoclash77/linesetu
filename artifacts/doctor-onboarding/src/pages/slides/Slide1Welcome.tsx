const base = import.meta.env.BASE_URL;

export default function Slide1Welcome() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#0A1A19" }}
    >
      <img
        src={`${base}clinic-hero.png`}
        crossOrigin="anonymous"
        alt="Clinic background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: 0.35 }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, rgba(10,26,25,0.97) 0%, rgba(13,148,136,0.25) 60%, rgba(10,26,25,0.9) 100%)",
        }}
      />

      <div
        className="absolute top-0 right-0 w-[50vw] h-[50vh] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(13,148,136,0.18) 0%, transparent 70%)",
          transform: "translate(15%, -15%)",
        }}
      />

      <div className="relative z-10 flex h-full items-center">
        <div className="pl-[8vw]" style={{ width: "60%" }}>
          <div
            className="inline-block px-[1.2vw] py-[0.5vh] rounded-full mb-[3vh]"
            style={{ background: "rgba(13,148,136,0.2)", border: "1px solid rgba(13,148,136,0.5)" }}
          >
            <span className="font-body font-medium" style={{ fontSize: "1.5vw", color: "#2DD4BF", letterSpacing: "0.1em" }}>
              DOCTOR ONBOARDING — 2026
            </span>
          </div>
          <div className="font-display font-black" style={{ fontSize: "3vw", color: "rgba(255,255,255,0.55)", letterSpacing: "0.02em" }}>
            Welcome to
          </div>
          <div className="font-display font-black" style={{ fontSize: "8vw", color: "#FFFFFF", lineHeight: 0.95, letterSpacing: "-0.03em", marginTop: "0.5vh" }}>
            LINE<span style={{ color: "#2DD4BF" }}>SETU</span>
          </div>
          <div className="font-body font-medium mt-[2.5vh]" style={{ fontSize: "1.85vw", color: "rgba(255,255,255,0.7)", lineHeight: 1.55, maxWidth: "40vw" }}>
            India's smartest token management system — designed so your patients wait less and you earn more.
          </div>
        </div>

        <div className="flex flex-col justify-center pr-[8vw]" style={{ width: "40%" }}>
          <div className="flex flex-col gap-[2.5vh]">
            <div
              className="rounded-2xl px-[2.2vw] py-[2.5vh]"
              style={{ background: "rgba(13,148,136,0.15)", border: "1px solid rgba(45,212,191,0.25)" }}
            >
              <div className="font-display font-bold" style={{ fontSize: "3.2vw", color: "#2DD4BF" }}>&#8377;10–20</div>
              <div className="font-body" style={{ fontSize: "1.5vw", color: "rgba(255,255,255,0.6)" }}>Earned per token booked</div>
            </div>
            <div
              className="rounded-2xl px-[2.2vw] py-[2.5vh]"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="font-display font-bold" style={{ fontSize: "3.2vw", color: "#FFFFFF" }}>Zero</div>
              <div className="font-body" style={{ fontSize: "1.5vw", color: "rgba(255,255,255,0.6)" }}>Manual paperwork or forms</div>
            </div>
            <div
              className="rounded-2xl px-[2.2vw] py-[2.5vh]"
              style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)" }}
            >
              <div className="font-display font-bold" style={{ fontSize: "3.2vw", color: "#FCD34D" }}>Weekly</div>
              <div className="font-body" style={{ fontSize: "1.5vw", color: "rgba(255,255,255,0.6)" }}>Auto payouts to your bank</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
