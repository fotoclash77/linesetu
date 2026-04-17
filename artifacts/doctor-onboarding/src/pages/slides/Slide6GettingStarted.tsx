export default function Slide6GettingStarted() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0C1A19 0%, #0D2420 100%)" }}
    >
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: "0.5vh", background: "linear-gradient(90deg, transparent, #2DD4BF, transparent)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-[55vw] h-[55vh] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(13,148,136,0.1) 0%, transparent 70%)",
          transform: "translate(15%, 20%)",
        }}
      />

      <div className="relative z-10 px-[7vw] pt-[6vh]">
        <div
          className="inline-block px-[1.1vw] py-[0.4vh] rounded-full mb-[2vh]"
          style={{ background: "rgba(45,212,191,0.12)", border: "1px solid rgba(45,212,191,0.3)" }}
        >
          <span className="font-body font-semibold" style={{ fontSize: "1.4vw", color: "#2DD4BF", letterSpacing: "0.1em" }}>
            GETTING STARTED
          </span>
        </div>
        <div className="font-display font-extrabold" style={{ fontSize: "4.2vw", color: "#FFFFFF", lineHeight: 1.1, letterSpacing: "-0.025em" }}>
          You can be live in <span style={{ color: "#2DD4BF" }}>10 minutes.</span>
        </div>
        <div className="font-body" style={{ fontSize: "1.6vw", color: "rgba(255,255,255,0.55)", marginTop: "1.5vh" }}>
          Three quick steps and your first token is ready to book.
        </div>
      </div>

      <div className="relative z-10 px-[7vw] mt-[4vh] flex gap-[2.5vw]">
        <div
          className="flex-1 rounded-2xl p-[3vh]"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(45,212,191,0.2)" }}
        >
          <div className="flex items-center gap-[1.2vw] mb-[2vh]">
            <div
              className="w-[3.5vw] h-[3.5vw] rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(45,212,191,0.15)", border: "1px solid rgba(45,212,191,0.4)" }}
            >
              <span className="font-display font-black" style={{ fontSize: "1.5vw", color: "#2DD4BF" }}>1</span>
            </div>
            <div className="font-display font-bold" style={{ fontSize: "1.8vw", color: "#2DD4BF" }}>
              Create Your Profile
            </div>
          </div>
          <div className="font-body" style={{ fontSize: "1.45vw", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
            Download the LINESETU Doctor App. Register with your mobile number. Add your name, specialization, and clinic address.
          </div>
          <div
            className="mt-[2vh] pt-[1.5vh]"
            style={{ borderTop: "1px solid rgba(45,212,191,0.1)" }}
          >
            <span className="font-body font-medium" style={{ fontSize: "1.35vw", color: "#2DD4BF" }}>
              &#10003; One-time setup · 3 minutes
            </span>
          </div>
        </div>

        <div
          className="flex-1 rounded-2xl p-[3vh]"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)" }}
        >
          <div className="flex items-center gap-[1.2vw] mb-[2vh]">
            <div
              className="w-[3.5vw] h-[3.5vw] rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.25)" }}
            >
              <span className="font-display font-black" style={{ fontSize: "1.5vw", color: "#FFFFFF" }}>2</span>
            </div>
            <div className="font-display font-bold" style={{ fontSize: "1.8vw", color: "#FFFFFF" }}>
              Set Your Shifts
            </div>
          </div>
          <div className="font-body" style={{ fontSize: "1.45vw", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
            Configure Morning and/or Evening clinic hours. Set a token limit per shift. Toggle your availability with one tap.
          </div>
          <div
            className="mt-[2vh] pt-[1.5vh]"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
          >
            <span className="font-body font-medium" style={{ fontSize: "1.35vw", color: "rgba(255,255,255,0.5)" }}>
              &#10003; Flexible · Change anytime
            </span>
          </div>
        </div>

        <div
          className="flex-1 rounded-2xl p-[3vh]"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(245,158,11,0.25)" }}
        >
          <div className="flex items-center gap-[1.2vw] mb-[2vh]">
            <div
              className="w-[3.5vw] h-[3.5vw] rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.4)" }}
            >
              <span className="font-display font-black" style={{ fontSize: "1.5vw", color: "#FCD34D" }}>3</span>
            </div>
            <div className="font-display font-bold" style={{ fontSize: "1.8vw", color: "#FCD34D" }}>
              Add Your Bank Account
            </div>
          </div>
          <div className="font-body" style={{ fontSize: "1.45vw", color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
            Link your IFSC and account number via Razorpay's secure KYC. All payouts will land here every Tuesday automatically.
          </div>
          <div
            className="mt-[2vh] pt-[1.5vh]"
            style={{ borderTop: "1px solid rgba(245,158,11,0.1)" }}
          >
            <span className="font-body font-medium" style={{ fontSize: "1.35vw", color: "#FCD34D" }}>
              &#10003; Secure · Bank-grade encryption
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-[7vw] mt-[3vh]">
        <div
          className="rounded-2xl px-[3vw] py-[2.5vh] flex items-center justify-between"
          style={{ background: "rgba(13,148,136,0.12)", border: "1px solid rgba(45,212,191,0.25)" }}
        >
          <div className="font-body" style={{ fontSize: "1.55vw", color: "rgba(255,255,255,0.65)" }}>
            Need help? Our onboarding team is available <span style={{ color: "#FFFFFF", fontWeight: 600 }}>Monday–Saturday, 9am–7pm</span>
          </div>
          <div className="font-display font-bold text-primary" style={{ fontSize: "1.6vw" }}>
            support@linesetu.com
          </div>
        </div>
      </div>
    </div>
  );
}
