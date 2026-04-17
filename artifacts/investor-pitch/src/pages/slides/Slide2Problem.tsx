export default function Slide2Problem() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "linear-gradient(160deg, #070C1B 0%, #0E1628 100%)" }}
    >
      <div
        className="absolute top-0 left-0 w-[60vw] h-[60vh] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(220,38,38,0.08) 0%, transparent 70%)",
          transform: "translate(-20%, -20%)",
        }}
      />

      <div className="absolute inset-0 flex">
        <div className="flex flex-col justify-center pl-[7vw]" style={{ width: "52%" }}>
          <div
            className="inline-block px-[1.1vw] py-[0.4vh] rounded-full mb-[2.5vh]"
            style={{ background: "rgba(220,38,38,0.12)", border: "1px solid rgba(220,38,38,0.3)" }}
          >
            <span className="font-body font-semibold" style={{ fontSize: "1.4vw", color: "#F87171", letterSpacing: "0.1em" }}>
              THE PROBLEM
            </span>
          </div>
          <div className="font-display font-extrabold text-text" style={{ fontSize: "4.8vw", lineHeight: 1.1, letterSpacing: "-0.025em" }}>
            Clinic visits are broken for everyone.
          </div>
          <div className="font-body text-muted mt-[3vh]" style={{ fontSize: "1.7vw", lineHeight: 1.65, maxWidth: "38vw" }}>
            Patients stand in chaotic queues with no estimated wait time. Doctors lose 40 minutes daily to crowd management instead of care.
          </div>
        </div>

        <div className="flex flex-col justify-center items-center" style={{ width: "48%" }}>
          <div className="text-center mb-[3vh]">
            <div className="font-display font-extrabold" style={{ fontSize: "11vw", color: "#F87171", lineHeight: 1, letterSpacing: "-0.04em" }}>
              47
            </div>
            <div className="font-display font-light text-text" style={{ fontSize: "2.2vw", marginTop: "-1vh" }}>
              minutes average wait time
            </div>
            <div className="font-body text-muted mt-[0.8vh]" style={{ fontSize: "1.45vw" }}>
              per outpatient clinic visit in India
            </div>
          </div>

          <div
            className="w-[72%] rounded-2xl p-[2.5vh] mt-[1vh]"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex justify-between items-center mb-[1.8vh]">
              <span className="font-body text-muted" style={{ fontSize: "1.45vw" }}>Avg. patients seen per day</span>
              <span className="font-display font-bold text-text" style={{ fontSize: "1.8vw" }}>60–80</span>
            </div>
            <div
              className="w-full"
              style={{ height: "1px", background: "rgba(255,255,255,0.07)" }}
            />
            <div className="flex justify-between items-center mt-[1.8vh]">
              <span className="font-body text-muted" style={{ fontSize: "1.45vw" }}>Time lost to crowd mgmt</span>
              <span className="font-display font-bold" style={{ fontSize: "1.8vw", color: "#F87171" }}>40 min/day</span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-[4.5vh] left-[7vw] right-[7vw] flex gap-[4vw]"
      >
        <div className="flex items-start gap-[1.2vw]">
          <div className="w-[2.5vw] h-[2.5vw] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(220,38,38,0.15)" }}>
            <span className="font-display font-bold" style={{ fontSize: "1.3vw", color: "#F87171" }}>1</span>
          </div>
          <div>
            <div className="font-body font-semibold text-text" style={{ fontSize: "1.5vw" }}>No transparency</div>
            <div className="font-body text-muted" style={{ fontSize: "1.35vw" }}>Patients don't know their place in line</div>
          </div>
        </div>
        <div className="flex items-start gap-[1.2vw]">
          <div className="w-[2.5vw] h-[2.5vw] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(220,38,38,0.15)" }}>
            <span className="font-display font-bold" style={{ fontSize: "1.3vw", color: "#F87171" }}>2</span>
          </div>
          <div>
            <div className="font-body font-semibold text-text" style={{ fontSize: "1.5vw" }}>No-shows = lost revenue</div>
            <div className="font-body text-muted" style={{ fontSize: "1.35vw" }}>Walk-in chaos disrupts the entire flow</div>
          </div>
        </div>
        <div className="flex items-start gap-[1.2vw]">
          <div className="w-[2.5vw] h-[2.5vw] rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "rgba(220,38,38,0.15)" }}>
            <span className="font-display font-bold" style={{ fontSize: "1.3vw", color: "#F87171" }}>3</span>
          </div>
          <div>
            <div className="font-body font-semibold text-text" style={{ fontSize: "1.5vw" }}>Zero data capture</div>
            <div className="font-body text-muted" style={{ fontSize: "1.35vw" }}>Doctors have no insight into their earnings</div>
          </div>
        </div>
      </div>
    </div>
  );
}
