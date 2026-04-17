export default function Slide4BusinessModel() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#070C1B" }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(135deg, #070C1B 40%, #0C1422 100%)",
        }}
      />
      <div
        className="absolute top-[10vh] right-[5vw] w-[40vw] h-[40vh] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(245,166,35,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex h-full">
        <div className="flex flex-col justify-center pl-[7vw]" style={{ width: "44%" }}>
          <div
            className="inline-block px-[1.1vw] py-[0.4vh] rounded-full mb-[2.5vh]"
            style={{ background: "rgba(245,166,35,0.12)", border: "1px solid rgba(245,166,35,0.3)" }}
          >
            <span className="font-body font-semibold text-primary" style={{ fontSize: "1.4vw", letterSpacing: "0.1em" }}>
              BUSINESS MODEL
            </span>
          </div>
          <div className="font-display font-extrabold text-text" style={{ fontSize: "4.2vw", lineHeight: 1.1, letterSpacing: "-0.025em" }}>
            Every token is a revenue event.
          </div>
          <div className="font-body text-muted mt-[2.5vh]" style={{ fontSize: "1.6vw", lineHeight: 1.65 }}>
            LINESETU earns a fixed platform fee on every appointment booked. No subscription. No hidden charges. Pure transaction revenue.
          </div>
          <div
            className="mt-[3.5vh] rounded-2xl px-[2vw] py-[2.5vh]"
            style={{ background: "rgba(245,166,35,0.07)", border: "1px solid rgba(245,166,35,0.18)" }}
          >
            <div className="font-body text-muted" style={{ fontSize: "1.45vw" }}>At 100 tokens/clinic/day · 1,000 clinics</div>
            <div className="font-display font-extrabold text-primary mt-[0.8vh]" style={{ fontSize: "3.2vw" }}>
              &#8377;1 Cr+ / day
            </div>
            <div className="font-body text-muted" style={{ fontSize: "1.35vw" }}>platform revenue potential</div>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center pr-[7vw]" style={{ width: "56%" }}>
          <div className="w-full flex flex-col gap-[2.5vh]">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(245,166,35,0.25)" }}
            >
              <div
                className="px-[2.5vw] py-[1.8vh] flex items-center justify-between"
                style={{ background: "rgba(245,166,35,0.12)" }}
              >
                <div className="font-display font-bold text-primary" style={{ fontSize: "1.75vw" }}>
                  Online Normal Token
                </div>
                <div
                  className="px-[1vw] py-[0.3vh] rounded-full font-body font-semibold"
                  style={{ background: "rgba(245,166,35,0.2)", color: "#F5A623", fontSize: "1.3vw" }}
                >
                  Standard
                </div>
              </div>
              <div className="px-[2.5vw] py-[2vh] flex justify-between">
                <div>
                  <div className="font-body text-muted" style={{ fontSize: "1.35vw" }}>Patient pays</div>
                  <div className="font-display font-bold text-text" style={{ fontSize: "2.2vw" }}>&#8377;20</div>
                </div>
                <div
                  style={{ width: "1px", background: "rgba(255,255,255,0.07)" }}
                />
                <div>
                  <div className="font-body text-muted" style={{ fontSize: "1.35vw" }}>Doctor earns</div>
                  <div className="font-display font-bold text-text" style={{ fontSize: "2.2vw" }}>&#8377;10</div>
                </div>
                <div
                  style={{ width: "1px", background: "rgba(255,255,255,0.07)" }}
                />
                <div>
                  <div className="font-body text-muted" style={{ fontSize: "1.35vw" }}>Platform fee</div>
                  <div className="font-display font-bold text-primary" style={{ fontSize: "2.2vw" }}>&#8377;10</div>
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: "1px solid rgba(248,113,113,0.25)" }}
            >
              <div
                className="px-[2.5vw] py-[1.8vh] flex items-center justify-between"
                style={{ background: "rgba(248,113,113,0.1)" }}
              >
                <div className="font-display font-bold" style={{ fontSize: "1.75vw", color: "#F87171" }}>
                  Online Emergency Token
                </div>
                <div
                  className="px-[1vw] py-[0.3vh] rounded-full font-body font-semibold"
                  style={{ background: "rgba(248,113,113,0.2)", color: "#F87171", fontSize: "1.3vw" }}
                >
                  Priority
                </div>
              </div>
              <div className="px-[2.5vw] py-[2vh] flex justify-between">
                <div>
                  <div className="font-body text-muted" style={{ fontSize: "1.35vw" }}>Patient pays</div>
                  <div className="font-display font-bold text-text" style={{ fontSize: "2.2vw" }}>&#8377;30</div>
                </div>
                <div
                  style={{ width: "1px", background: "rgba(255,255,255,0.07)" }}
                />
                <div>
                  <div className="font-body text-muted" style={{ fontSize: "1.35vw" }}>Doctor earns</div>
                  <div className="font-display font-bold text-text" style={{ fontSize: "2.2vw" }}>&#8377;20</div>
                </div>
                <div
                  style={{ width: "1px", background: "rgba(255,255,255,0.07)" }}
                />
                <div>
                  <div className="font-body text-muted" style={{ fontSize: "1.35vw" }}>Platform fee</div>
                  <div className="font-display font-bold" style={{ fontSize: "2.2vw", color: "#F87171" }}>&#8377;10</div>
                </div>
              </div>
            </div>

            <div
              className="rounded-2xl px-[2.5vw] py-[2vh] flex items-center gap-[2vw]"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div>
                <div className="font-body text-muted" style={{ fontSize: "1.35vw" }}>Payouts</div>
                <div className="font-display font-semibold text-text" style={{ fontSize: "1.6vw" }}>Weekly · Every Tuesday</div>
              </div>
              <div style={{ width: "1px", height: "5vh", background: "rgba(255,255,255,0.1)" }} />
              <div>
                <div className="font-body text-muted" style={{ fontSize: "1.35vw" }}>Settlement</div>
                <div className="font-display font-semibold text-text" style={{ fontSize: "1.6vw" }}>Auto via Razorpay</div>
              </div>
              <div style={{ width: "1px", height: "5vh", background: "rgba(255,255,255,0.1)" }} />
              <div>
                <div className="font-body text-muted" style={{ fontSize: "1.35vw" }}>Payment</div>
                <div className="font-display font-semibold text-text" style={{ fontSize: "1.6vw" }}>UPI · Cards</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
