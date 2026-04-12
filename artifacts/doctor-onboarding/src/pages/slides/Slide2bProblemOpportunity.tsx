import clinicCrowd from "../../assets/clinic-crowd.png";

export default function Slide2bProblemOpportunity() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex"
      style={{ background: "#060B17" }}
    >
      {/* ── LEFT: AI PHOTO + PROBLEM STATS ── */}
      <div className="relative flex-shrink-0 overflow-hidden" style={{ width: "50%" }}>
        <img
          src={clinicCrowd}
          alt="Overcrowded clinic waiting room"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(0.45) saturate(0.7)" }}
        />

        {/* Gradient overlay from photo into dark right side */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(6,11,23,0) 55%, rgba(6,11,23,1) 100%), linear-gradient(to bottom, rgba(6,11,23,0.4) 0%, rgba(6,11,23,0) 30%, rgba(6,11,23,0.6) 80%, rgba(6,11,23,0.95) 100%)",
          }}
        />

        {/* TOP badge */}
        <div className="absolute top-[5vh] left-[4vw]">
          <div
            className="inline-block px-[1vw] py-[0.5vh] rounded-full"
            style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.5)" }}
          >
            <span className="font-body font-bold" style={{ fontSize: "1.1vw", color: "#FCA5A5", letterSpacing: "0.1em" }}>
              THE DAILY REALITY
            </span>
          </div>
        </div>

        {/* Headline over photo */}
        <div className="absolute left-[4vw] right-0" style={{ bottom: "28vh" }}>
          <div
            className="font-display font-black"
            style={{ fontSize: "3.8vw", color: "#FFFFFF", lineHeight: 1.1, letterSpacing: "-0.03em" }}
          >
            They wait.
            <br />
            <span style={{ color: "#FCA5A5" }}>You lose.</span>
          </div>
        </div>

        {/* 3 stat pills at bottom */}
        <div className="absolute left-[4vw] right-[2vw] flex flex-col gap-[1.2vh]" style={{ bottom: "5vh" }}>
          <div
            className="flex items-center gap-[1.2vw] rounded-2xl px-[1.4vw] py-[1.4vh]"
            style={{ background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.35)", backdropFilter: "blur(12px)" }}
          >
            <div className="font-display font-black" style={{ fontSize: "2.8vw", color: "#F87171", lineHeight: 1 }}>47</div>
            <div>
              <div className="font-body font-semibold" style={{ fontSize: "1.2vw", color: "#FFFFFF" }}>minutes</div>
              <div className="font-body" style={{ fontSize: "1vw", color: "rgba(255,255,255,0.5)" }}>average patient wait time in Indian clinics</div>
            </div>
          </div>
          <div className="flex gap-[1vw]">
            <div
              className="flex-1 rounded-2xl px-[1.2vw] py-[1.2vh]"
              style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", backdropFilter: "blur(12px)" }}
            >
              <div className="font-display font-black" style={{ fontSize: "2vw", color: "#FCD34D" }}>1 in 5</div>
              <div className="font-body" style={{ fontSize: "0.95vw", color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>patients walk out without being seen</div>
            </div>
            <div
              className="flex-1 rounded-2xl px-[1.2vw] py-[1.2vh]"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}
            >
              <div className="font-display font-black" style={{ fontSize: "2vw", color: "#FFFFFF" }}>₹0</div>
              <div className="font-body" style={{ fontSize: "0.95vw", color: "rgba(255,255,255,0.5)", lineHeight: 1.4 }}>collected from no-shows today</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: OPPORTUNITY ── */}
      <div className="flex flex-col justify-center" style={{ width: "50%", padding: "0 5vw 0 4vw" }}>
        <div
          className="inline-block px-[1vw] py-[0.5vh] rounded-full mb-[2.5vh]"
          style={{ background: "rgba(45,212,191,0.12)", border: "1px solid rgba(45,212,191,0.35)" }}
        >
          <span className="font-body font-bold" style={{ fontSize: "1.1vw", color: "#2DD4BF", letterSpacing: "0.1em" }}>
            THE OPPORTUNITY
          </span>
        </div>

        <div
          className="font-display font-black"
          style={{ fontSize: "3.2vw", color: "#FFFFFF", lineHeight: 1.15, letterSpacing: "-0.025em", marginBottom: "1.5vh" }}
        >
          Every person in that line is a
          <span style={{ color: "#2DD4BF" }}> token.</span>
          <br />
          Every token pays
          <span style={{ color: "#FCD34D" }}> you.</span>
        </div>

        <div className="font-body" style={{ fontSize: "1.4vw", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: "3vh" }}>
          With LINESETU, patients pay upfront to book their slot — and a portion of every fee goes directly to you.
        </div>

        {/* Token type cards */}
        <div className="flex flex-col gap-[1.2vh]" style={{ marginBottom: "2.5vh" }}>
          <div
            className="rounded-2xl px-[1.5vw] py-[1.6vh] flex items-center justify-between"
            style={{ background: "rgba(45,212,191,0.08)", border: "1.5px solid rgba(45,212,191,0.28)" }}
          >
            <div>
              <div className="font-body font-semibold" style={{ fontSize: "1.3vw", color: "#FFFFFF" }}>Normal Token</div>
              <div className="font-body" style={{ fontSize: "1.1vw", color: "rgba(255,255,255,0.45)" }}>Patient pays ₹20 · Platform takes ₹10</div>
            </div>
            <div className="text-right">
              <div className="font-display font-black" style={{ fontSize: "2.2vw", color: "#2DD4BF" }}>+₹10</div>
              <div className="font-body" style={{ fontSize: "0.95vw", color: "rgba(255,255,255,0.4)" }}>per token for you</div>
            </div>
          </div>
          <div
            className="rounded-2xl px-[1.5vw] py-[1.6vh] flex items-center justify-between"
            style={{ background: "rgba(248,113,113,0.08)", border: "1.5px solid rgba(248,113,113,0.28)" }}
          >
            <div>
              <div className="font-body font-semibold" style={{ fontSize: "1.3vw", color: "#FFFFFF" }}>Emergency Token</div>
              <div className="font-body" style={{ fontSize: "1.1vw", color: "rgba(255,255,255,0.45)" }}>Patient pays ₹30 · Platform takes ₹10</div>
            </div>
            <div className="text-right">
              <div className="font-display font-black" style={{ fontSize: "2.2vw", color: "#FCA5A5" }}>+₹20</div>
              <div className="font-body" style={{ fontSize: "0.95vw", color: "rgba(255,255,255,0.4)" }}>per token for you</div>
            </div>
          </div>
        </div>

        {/* Earnings math strip */}
        <div
          className="rounded-2xl px-[1.8vw] py-[2vh]"
          style={{ background: "linear-gradient(135deg, rgba(13,148,136,0.18), rgba(13,148,136,0.08))", border: "1.5px solid rgba(45,212,191,0.3)" }}
        >
          <div className="font-body font-semibold" style={{ fontSize: "1.1vw", color: "rgba(255,255,255,0.5)", marginBottom: "1.2vh", letterSpacing: "0.06em" }}>
            AT 50 TOKENS PER DAY
          </div>
          <div className="flex items-end justify-between">
            <div className="text-center">
              <div className="font-display font-black" style={{ fontSize: "2vw", color: "#FFFFFF" }}>₹500</div>
              <div className="font-body" style={{ fontSize: "0.9vw", color: "rgba(255,255,255,0.4)" }}>Daily</div>
            </div>
            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "1.5vw" }}>→</div>
            <div className="text-center">
              <div className="font-display font-black" style={{ fontSize: "2vw", color: "#FFFFFF" }}>₹3,500</div>
              <div className="font-body" style={{ fontSize: "0.9vw", color: "rgba(255,255,255,0.4)" }}>Weekly</div>
            </div>
            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "1.5vw" }}>→</div>
            <div className="text-center">
              <div className="font-display font-black" style={{ fontSize: "2vw", color: "#2DD4BF" }}>₹14,000</div>
              <div className="font-body" style={{ fontSize: "0.9vw", color: "rgba(255,255,255,0.4)" }}>Monthly</div>
            </div>
            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: "1.5vw" }}>→</div>
            <div className="text-center">
              <div className="font-display font-black" style={{ fontSize: "2.2vw", color: "#FCD34D" }}>₹1L+</div>
              <div className="font-body" style={{ fontSize: "0.9vw", color: "rgba(255,255,255,0.4)" }}>Potential</div>
            </div>
          </div>
          <div
            className="mt-[1.5vh] rounded-xl px-[1vw] py-[0.7vh] text-center"
            style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" }}
          >
            <span className="font-body font-semibold" style={{ fontSize: "1.1vw", color: "#FCD34D" }}>
              Extra income — on top of your consultation fees. Zero extra effort.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
