export default function Slide2TheProblem() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#F0FDF9" }}
    >
      <div
        className="absolute top-0 left-0 w-[40vw] h-[40vh]"
        style={{
          background: "radial-gradient(ellipse, rgba(13,148,136,0.07) 0%, transparent 70%)",
          transform: "translate(-10%, -10%)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-[35vw] h-[35vh]"
        style={{
          background: "radial-gradient(ellipse, rgba(245,158,11,0.07) 0%, transparent 70%)",
          transform: "translate(10%, 10%)",
        }}
      />
      <div
        className="absolute left-0 top-0 bottom-0"
        style={{ width: "0.5vw", background: "linear-gradient(180deg, transparent, #0D9488, transparent)" }}
      />

      <div className="relative z-10 px-[7vw] pt-[6vh]">
        <div
          className="inline-block px-[1.1vw] py-[0.4vh] rounded-full mb-[2vh]"
          style={{ background: "rgba(13,148,136,0.1)", border: "1px solid rgba(13,148,136,0.3)" }}
        >
          <span className="font-body font-semibold text-primary" style={{ fontSize: "1.4vw", letterSpacing: "0.1em" }}>
            THE CURRENT REALITY
          </span>
        </div>
        <div className="font-display font-extrabold text-text" style={{ fontSize: "4.2vw", lineHeight: 1.1, letterSpacing: "-0.025em" }}>
          Today, your clinic runs on chaos.
        </div>
      </div>

      <div className="relative z-10 px-[7vw] mt-[4vh] flex gap-[2.5vw]">
        <div
          className="flex-1 rounded-2xl p-[3vh]"
          style={{ background: "#FFFFFF", border: "1px solid rgba(13,148,136,0.12)" }}
        >
          <div
            className="w-[4vw] h-[4vw] rounded-xl flex items-center justify-center mb-[2vh]"
            style={{ background: "rgba(239,68,68,0.1)" }}
          >
            <span className="font-display font-black" style={{ fontSize: "1.8vw", color: "#EF4444" }}>!</span>
          </div>
          <div className="font-display font-bold text-text" style={{ fontSize: "1.8vw", marginBottom: "1.2vh" }}>
            Patients arrive without notice
          </div>
          <div className="font-body text-muted" style={{ fontSize: "1.5vw", lineHeight: 1.6 }}>
            No advance booking. Crowd builds at the door. Staff spends the first hour managing the queue, not the patients.
          </div>
        </div>

        <div
          className="flex-1 rounded-2xl p-[3vh]"
          style={{ background: "#FFFFFF", border: "1px solid rgba(13,148,136,0.12)" }}
        >
          <div
            className="w-[4vw] h-[4vw] rounded-xl flex items-center justify-center mb-[2vh]"
            style={{ background: "rgba(245,158,11,0.1)" }}
          >
            <span className="font-display font-black text-accent" style={{ fontSize: "1.8vw" }}>&#8377;</span>
          </div>
          <div className="font-display font-bold text-text" style={{ fontSize: "1.8vw", marginBottom: "1.2vh" }}>
            Revenue leaks every day
          </div>
          <div className="font-body text-muted" style={{ fontSize: "1.5vw", lineHeight: 1.6 }}>
            No-shows cost you 10–15 tokens daily. Without upfront payment, cancellations are painless for patients — and painful for you.
          </div>
        </div>

        <div
          className="flex-1 rounded-2xl p-[3vh]"
          style={{ background: "#FFFFFF", border: "1px solid rgba(13,148,136,0.12)" }}
        >
          <div
            className="w-[4vw] h-[4vw] rounded-xl flex items-center justify-center mb-[2vh]"
            style={{ background: "rgba(139,92,246,0.1)" }}
          >
            <span className="font-display font-black" style={{ fontSize: "1.8vw", color: "#8B5CF6" }}>?</span>
          </div>
          <div className="font-display font-bold text-text" style={{ fontSize: "1.8vw", marginBottom: "1.2vh" }}>
            Zero visibility into earnings
          </div>
          <div className="font-body text-muted" style={{ fontSize: "1.5vw", lineHeight: 1.6 }}>
            How many tokens did you do this week? What did you earn last Tuesday? Most doctors have no idea. Paper records don't scale.
          </div>
        </div>
      </div>

      <div className="relative z-10 px-[7vw] mt-[3.5vh]">
        <div
          className="rounded-2xl px-[3vw] py-[2.5vh] flex items-center justify-between"
          style={{ background: "rgba(13,148,136,0.07)", border: "1px solid rgba(13,148,136,0.2)" }}
        >
          <div className="font-body text-muted" style={{ fontSize: "1.55vw" }}>
            The average Indian doctor loses <span className="text-text font-semibold">40 minutes per day</span> to pure queue management
          </div>
          <div className="font-display font-bold text-primary" style={{ fontSize: "2.2vw" }}>
            That ends today.
          </div>
        </div>
      </div>
    </div>
  );
}
