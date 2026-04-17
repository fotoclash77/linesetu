export default function Slide4Earnings() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#F0FDF9" }}
    >
      <div
        className="absolute top-0 left-0 right-0"
        style={{ height: "0.5vh", background: "linear-gradient(90deg, #0D9488, #2DD4BF, #0D9488)" }}
      />
      <div
        className="absolute bottom-0 right-0 w-[55vw] h-[55vh] rounded-full"
        style={{
          background: "radial-gradient(ellipse, rgba(13,148,136,0.06) 0%, transparent 70%)",
          transform: "translate(15%, 15%)",
        }}
      />

      <div className="relative z-10 flex h-full">
        <div className="flex flex-col justify-center pl-[7vw]" style={{ width: "46%" }}>
          <div
            className="inline-block px-[1.1vw] py-[0.4vh] rounded-full mb-[2.5vh]"
            style={{ background: "rgba(13,148,136,0.1)", border: "1px solid rgba(13,148,136,0.3)" }}
          >
            <span className="font-body font-semibold text-primary" style={{ fontSize: "1.4vw", letterSpacing: "0.1em" }}>
              YOUR EARNINGS
            </span>
          </div>
          <div className="font-display font-extrabold text-text" style={{ fontSize: "4.2vw", lineHeight: 1.1, letterSpacing: "-0.025em" }}>
            Every token is money you've already earned.
          </div>
          <div className="font-body text-muted mt-[2.5vh]" style={{ fontSize: "1.65vw", lineHeight: 1.65 }}>
            Patients pay upfront when booking. You receive your cut every Tuesday — no chasing, no delays, no unpaid walk-ins.
          </div>

          <div className="mt-[3.5vh] flex gap-[3vw]">
            <div>
              <div className="font-display font-extrabold text-primary" style={{ fontSize: "4.5vw", letterSpacing: "-0.03em" }}>
                &#8377;10
              </div>
              <div className="font-body text-muted" style={{ fontSize: "1.45vw" }}>per Normal Token</div>
            </div>
            <div style={{ width: "1px", background: "rgba(13,148,136,0.2)", alignSelf: "stretch" }} />
            <div>
              <div className="font-display font-extrabold" style={{ fontSize: "4.5vw", letterSpacing: "-0.03em", color: "#F59E0B" }}>
                &#8377;20
              </div>
              <div className="font-body text-muted" style={{ fontSize: "1.45vw" }}>per Emergency Token</div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center pr-[7vw]" style={{ width: "54%" }}>
          <div className="flex flex-col gap-[2.2vh]">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(13,148,136,0.2)" }}
            >
              <div
                className="px-[2.5vw] py-[1.5vh]"
                style={{ background: "rgba(13,148,136,0.08)" }}
              >
                <span className="font-display font-bold text-primary" style={{ fontSize: "1.6vw" }}>
                  Normal Token (Online)
                </span>
              </div>
              <div className="px-[2.5vw] py-[2vh] flex justify-between" style={{ background: "#FFFFFF" }}>
                <div>
                  <div className="font-body text-muted" style={{ fontSize: "1.35vw" }}>Patient pays</div>
                  <div className="font-display font-bold text-text" style={{ fontSize: "2.2vw" }}>&#8377;20</div>
                </div>
                <div style={{ width: "1px", background: "rgba(13,148,136,0.1)" }} />
                <div>
                  <div className="font-body text-muted" style={{ fontSize: "1.35vw" }}>You receive</div>
                  <div className="font-display font-bold text-primary" style={{ fontSize: "2.2vw" }}>&#8377;10</div>
                </div>
                <div style={{ width: "1px", background: "rgba(13,148,136,0.1)" }} />
                <div>
                  <div className="font-body text-muted" style={{ fontSize: "1.35vw" }}>Platform fee</div>
                  <div className="font-display font-bold text-muted" style={{ fontSize: "2.2vw" }}>&#8377;10</div>
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(245,158,11,0.3)" }}
            >
              <div
                className="px-[2.5vw] py-[1.5vh]"
                style={{ background: "rgba(245,158,11,0.1)" }}
              >
                <span className="font-display font-bold text-accent" style={{ fontSize: "1.6vw" }}>
                  Emergency Token (Online)
                </span>
              </div>
              <div className="px-[2.5vw] py-[2vh] flex justify-between" style={{ background: "#FFFFFF" }}>
                <div>
                  <div className="font-body text-muted" style={{ fontSize: "1.35vw" }}>Patient pays</div>
                  <div className="font-display font-bold text-text" style={{ fontSize: "2.2vw" }}>&#8377;30</div>
                </div>
                <div style={{ width: "1px", background: "rgba(245,158,11,0.15)" }} />
                <div>
                  <div className="font-body text-muted" style={{ fontSize: "1.35vw" }}>You receive</div>
                  <div className="font-display font-bold text-accent" style={{ fontSize: "2.2vw" }}>&#8377;20</div>
                </div>
                <div style={{ width: "1px", background: "rgba(245,158,11,0.15)" }} />
                <div>
                  <div className="font-body text-muted" style={{ fontSize: "1.35vw" }}>Platform fee</div>
                  <div className="font-display font-bold text-muted" style={{ fontSize: "2.2vw" }}>&#8377;10</div>
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl px-[2.5vw] py-[2.2vh] flex items-center justify-between"
              style={{ background: "rgba(13,148,136,0.07)", border: "1px solid rgba(13,148,136,0.2)" }}
            >
              <div>
                <div className="font-body text-muted" style={{ fontSize: "1.35vw" }}>Payout schedule</div>
                <div className="font-display font-bold text-text" style={{ fontSize: "1.7vw" }}>Every Tuesday, auto-settlement</div>
              </div>
              <div style={{ width: "1px", height: "5vh", background: "rgba(13,148,136,0.2)" }} />
              <div>
                <div className="font-body text-muted" style={{ fontSize: "1.35vw" }}>At 60 tokens/day</div>
                <div className="font-display font-bold text-primary" style={{ fontSize: "1.7vw" }}>&#8377;600+/day earned</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
