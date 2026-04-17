export default function Slide3HowItWorks() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0C1A19 0%, #0F2820 100%)" }}
    >
      <div
        className="absolute top-0 right-0 w-[60vw] h-[60vh] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(13,148,136,0.1) 0%, transparent 70%)",
          transform: "translate(20%, -20%)",
        }}
      />

      <div className="relative z-10 px-[7vw] pt-[6vh]">
        <div
          className="inline-block px-[1.1vw] py-[0.4vh] rounded-full mb-[2vh]"
          style={{ background: "rgba(45,212,191,0.12)", border: "1px solid rgba(45,212,191,0.3)" }}
        >
          <span className="font-body font-semibold" style={{ fontSize: "1.4vw", color: "#2DD4BF", letterSpacing: "0.1em" }}>
            HOW IT WORKS
          </span>
        </div>
        <div className="font-display font-extrabold" style={{ fontSize: "4.2vw", color: "#FFFFFF", lineHeight: 1.1, letterSpacing: "-0.025em" }}>
          Simple for patients. <span style={{ color: "#2DD4BF" }}>Powerful for you.</span>
        </div>
        <div className="font-body" style={{ fontSize: "1.6vw", color: "rgba(255,255,255,0.55)", marginTop: "1.5vh" }}>
          LINESETU handles the entire patient journey — you just focus on seeing them.
        </div>
      </div>

      <div className="relative z-10 px-[7vw] mt-[4vh]">
        <div className="relative flex items-start gap-0">
          <div
            className="absolute"
            style={{
              top: "3.8vh",
              left: "3.5vw",
              right: "3.5vw",
              height: "2px",
              background: "linear-gradient(90deg, rgba(13,148,136,0.6), rgba(13,148,136,0.6))",
            }}
          />

          <div className="flex-1 flex flex-col items-center relative">
            <div
              className="relative z-10 w-[7.5vw] h-[7.5vw] rounded-full flex flex-col items-center justify-center"
              style={{ background: "linear-gradient(135deg, #0D9488, #0F766E)", border: "3px solid rgba(45,212,191,0.4)" }}
            >
              <span className="font-display font-black" style={{ fontSize: "2.2vw", color: "#FFFFFF" }}>1</span>
            </div>
            <div
              className="mt-[2.5vh] rounded-2xl p-[2.5vh] w-[85%]"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(45,212,191,0.2)" }}
            >
              <div className="font-display font-bold" style={{ fontSize: "1.75vw", color: "#2DD4BF", marginBottom: "1vh" }}>
                Patient Books Online
              </div>
              <div className="font-body" style={{ fontSize: "1.45vw", color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>
                Patient opens the LINESETU app, selects your clinic, picks Normal or Emergency token, and pays via UPI — instantly confirmed.
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center relative">
            <div
              className="relative z-10 w-[7.5vw] h-[7.5vw] rounded-full flex flex-col items-center justify-center"
              style={{ background: "linear-gradient(135deg, #0F766E, #115E59)", border: "3px solid rgba(45,212,191,0.3)" }}
            >
              <span className="font-display font-black" style={{ fontSize: "2.2vw", color: "#FFFFFF" }}>2</span>
            </div>
            <div
              className="mt-[2.5vh] rounded-2xl p-[2.5vh] w-[85%]"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(45,212,191,0.15)" }}
            >
              <div className="font-display font-bold" style={{ fontSize: "1.75vw", color: "#FFFFFF", marginBottom: "1vh" }}>
                You See Your Live Queue
              </div>
              <div className="font-body" style={{ fontSize: "1.45vw", color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>
                Your Doctor App shows every token in real-time — name, type, position. Call the next patient with one tap. Emergency tokens jump the queue automatically.
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center relative">
            <div
              className="relative z-10 w-[7.5vw] h-[7.5vw] rounded-full flex flex-col items-center justify-center"
              style={{ background: "linear-gradient(135deg, #F59E0B, #D97706)", border: "3px solid rgba(245,158,11,0.4)" }}
            >
              <span className="font-display font-black" style={{ fontSize: "2.2vw", color: "#FFFFFF" }}>3</span>
            </div>
            <div
              className="mt-[2.5vh] rounded-2xl p-[2.5vh] w-[85%]"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(245,158,11,0.25)" }}
            >
              <div className="font-display font-bold" style={{ fontSize: "1.75vw", color: "#FCD34D", marginBottom: "1vh" }}>
                Earnings Settle Weekly
              </div>
              <div className="font-body" style={{ fontSize: "1.45vw", color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>
                Every Tuesday, your earnings from the previous week land in your bank account automatically — via Razorpay, zero manual steps.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
