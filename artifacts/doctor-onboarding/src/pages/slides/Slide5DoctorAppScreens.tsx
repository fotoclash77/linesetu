export default function Slide5DoctorAppScreens() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "linear-gradient(135deg, #060B17 0%, #0A1220 100%)" }}
    >
      <div
        className="absolute top-0 right-0 w-[60vw] h-[60vh] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(13,148,136,0.09) 0%, transparent 70%)",
          transform: "translate(20%, -20%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[40vw] h-[40vh] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(45,212,191,0.05) 0%, transparent 70%)",
          transform: "translate(-15%, 15%)",
        }}
      />

      <div className="relative z-10 flex h-full">
        <div className="flex flex-col justify-center pl-[6vw]" style={{ width: "35%" }}>
          <div
            className="inline-block px-[1.1vw] py-[0.45vh] rounded-full mb-[2.5vh]"
            style={{ background: "rgba(45,212,191,0.12)", border: "1px solid rgba(45,212,191,0.35)" }}
          >
            <span className="font-body font-semibold" style={{ fontSize: "1.3vw", color: "#2DD4BF", letterSpacing: "0.12em" }}>
              DOCTOR APP
            </span>
          </div>
          <div className="font-display font-extrabold" style={{ fontSize: "3.6vw", color: "#FFFFFF", lineHeight: 1.1, letterSpacing: "-0.025em" }}>
            Your clinic in your pocket.
          </div>
          <div className="font-body mt-[2.5vh]" style={{ fontSize: "1.5vw", color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>
            A purpose-built dark dashboard. Manage live queues, track earnings, and control your shifts — all from one teal-accented screen.
          </div>
          <div className="mt-[3.5vh] flex flex-col gap-[1.6vh]">
            <div className="flex items-center gap-[1.2vw]">
              <div className="w-[2vw] h-[2vw] rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(13,148,136,0.25)", border: "1px solid rgba(45,212,191,0.4)" }}>
                <span style={{ fontSize: "1vw", color: "#2DD4BF", fontWeight: 700 }}>&#10003;</span>
              </div>
              <span className="font-body" style={{ fontSize: "1.45vw", color: "rgba(255,255,255,0.7)" }}>Live queue — always up to date</span>
            </div>
            <div className="flex items-center gap-[1.2vw]">
              <div className="w-[2vw] h-[2vw] rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(13,148,136,0.25)", border: "1px solid rgba(45,212,191,0.4)" }}>
                <span style={{ fontSize: "1vw", color: "#2DD4BF", fontWeight: 700 }}>&#10003;</span>
              </div>
              <span className="font-body" style={{ fontSize: "1.45vw", color: "rgba(255,255,255,0.7)" }}>Daily earnings auto-calculated</span>
            </div>
            <div className="flex items-center gap-[1.2vw]">
              <div className="w-[2vw] h-[2vw] rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(13,148,136,0.25)", border: "1px solid rgba(45,212,191,0.4)" }}>
                <span style={{ fontSize: "1vw", color: "#2DD4BF", fontWeight: 700 }}>&#10003;</span>
              </div>
              <span className="font-body" style={{ fontSize: "1.45vw", color: "rgba(255,255,255,0.7)" }}>Emergency tokens flagged first</span>
            </div>
            <div className="flex items-center gap-[1.2vw]">
              <div className="w-[2vw] h-[2vw] rounded-full flex-shrink-0 flex items-center justify-center" style={{ background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.4)" }}>
                <span style={{ fontSize: "1vw", color: "#FCD34D", fontWeight: 700 }}>&#10003;</span>
              </div>
              <span className="font-body" style={{ fontSize: "1.45vw", color: "rgba(255,255,255,0.7)" }}>Weekly payout status at a glance</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-[2.5vw] pr-[4vw]" style={{ width: "65%" }}>
          <div
            className="relative rounded-[3vw] flex-shrink-0"
            style={{
              width: "18vw",
              height: "80vh",
              background: "#0A0F1C",
              border: "1.5px solid rgba(45,212,191,0.35)",
              boxShadow: "0 0 40px rgba(13,148,136,0.25), inset 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            <div className="absolute top-[1.5vh] left-[50%]" style={{ transform: "translateX(-50%)", width: "4vw", height: "0.6vh", background: "rgba(255,255,255,0.15)", borderRadius: "9999px" }} />
            <div className="absolute inset-x-0 bottom-0 top-[3.5vh] overflow-hidden rounded-b-[3vw]" style={{ padding: "0 0.6vw" }}>
              <div className="h-full overflow-hidden" style={{ borderRadius: "0 0 2.4vw 2.4vw" }}>
                <div
                  className="w-full h-full"
                  style={{ background: "linear-gradient(180deg, #070B14 0%, #0A0F1C 100%)", padding: "1.5vh 0.8vw 1vh" }}
                >
                  <div style={{ marginBottom: "1.4vh" }}>
                    <div className="font-body" style={{ fontSize: "0.85vw", color: "rgba(255,255,255,0.45)", marginBottom: "0.3vh" }}>Good morning,</div>
                    <div className="font-display font-bold" style={{ fontSize: "1.15vw", color: "#FFFFFF" }}>Dr. Sharma</div>
                    <div className="font-body" style={{ fontSize: "0.75vw", color: "rgba(45,212,191,0.8)", marginTop: "0.3vh" }}>Morning Shift · Active</div>
                  </div>

                  <div className="flex gap-[0.5vw]" style={{ marginBottom: "1.4vh" }}>
                    <div className="flex-1 rounded-xl p-[0.8vh] text-center" style={{ background: "rgba(13,148,136,0.15)", border: "1px solid rgba(45,212,191,0.2)" }}>
                      <div className="font-display font-bold" style={{ fontSize: "1.4vw", color: "#2DD4BF" }}>42</div>
                      <div className="font-body" style={{ fontSize: "0.7vw", color: "rgba(255,255,255,0.45)" }}>Done</div>
                    </div>
                    <div className="flex-1 rounded-xl p-[0.8vh] text-center" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)" }}>
                      <div className="font-display font-bold" style={{ fontSize: "1.4vw", color: "#FCD34D" }}>8</div>
                      <div className="font-body" style={{ fontSize: "0.7vw", color: "rgba(255,255,255,0.45)" }}>Pending</div>
                    </div>
                    <div className="flex-1 rounded-xl p-[0.8vh] text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <div className="font-display font-bold" style={{ fontSize: "1.1vw", color: "#FFFFFF" }}>&#8377;420</div>
                      <div className="font-body" style={{ fontSize: "0.7vw", color: "rgba(255,255,255,0.45)" }}>Today</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: "1.2vh" }}>
                    <div className="font-body font-semibold" style={{ fontSize: "0.8vw", color: "rgba(255,255,255,0.55)", marginBottom: "0.6vh", letterSpacing: "0.05em" }}>RECENT QUEUE</div>
                    <div className="flex flex-col gap-[0.6vh]">
                      <div className="rounded-xl px-[0.6vw] py-[0.8vh] flex items-center justify-between" style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.25)" }}>
                        <div>
                          <div className="font-body font-semibold" style={{ fontSize: "0.8vw", color: "#FCA5A5" }}>#43 Priya Mehta</div>
                          <div className="font-body" style={{ fontSize: "0.7vw", color: "rgba(255,255,255,0.4)" }}>Emergency · In Consult</div>
                        </div>
                        <div className="rounded-full px-[0.4vw] py-[0.2vh]" style={{ background: "rgba(248,113,113,0.2)", fontSize: "0.65vw", color: "#FCA5A5", fontWeight: 600 }}>URGENT</div>
                      </div>
                      <div className="rounded-xl px-[0.6vw] py-[0.8vh] flex items-center justify-between" style={{ background: "rgba(45,212,191,0.08)", border: "1px solid rgba(45,212,191,0.18)" }}>
                        <div>
                          <div className="font-body font-semibold" style={{ fontSize: "0.8vw", color: "#FFFFFF" }}>#44 Rajan Patel</div>
                          <div className="font-body" style={{ fontSize: "0.7vw", color: "rgba(255,255,255,0.4)" }}>Normal · Next up</div>
                        </div>
                        <div className="rounded-full px-[0.4vw] py-[0.2vh]" style={{ background: "rgba(45,212,191,0.2)", fontSize: "0.65vw", color: "#2DD4BF", fontWeight: 600 }}>NEXT</div>
                      </div>
                      <div className="rounded-xl px-[0.6vw] py-[0.8vh] flex items-center justify-between" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <div>
                          <div className="font-body font-semibold" style={{ fontSize: "0.8vw", color: "rgba(255,255,255,0.7)" }}>#45 Sita Devi</div>
                          <div className="font-body" style={{ fontSize: "0.7vw", color: "rgba(255,255,255,0.35)" }}>Normal · Waiting</div>
                        </div>
                        <div className="font-body" style={{ fontSize: "0.7vw", color: "rgba(255,255,255,0.35)" }}>~12 min</div>
                      </div>
                      <div className="rounded-xl px-[0.6vw] py-[0.8vh] flex items-center justify-between" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <div>
                          <div className="font-body font-semibold" style={{ fontSize: "0.8vw", color: "rgba(255,255,255,0.7)" }}>#46 Arjun Kumar</div>
                          <div className="font-body" style={{ fontSize: "0.7vw", color: "rgba(255,255,255,0.35)" }}>Normal · Waiting</div>
                        </div>
                        <div className="font-body" style={{ fontSize: "0.7vw", color: "rgba(255,255,255,0.35)" }}>~24 min</div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl px-[0.6vw] py-[1vh] flex items-center justify-between" style={{ background: "linear-gradient(135deg, rgba(13,148,136,0.25), rgba(13,148,136,0.12))", border: "1px solid rgba(45,212,191,0.3)" }}>
                    <div>
                      <div className="font-body" style={{ fontSize: "0.7vw", color: "rgba(255,255,255,0.5)" }}>Weekly Payout</div>
                      <div className="font-display font-bold" style={{ fontSize: "1.1vw", color: "#2DD4BF" }}>&#8377;17,950</div>
                    </div>
                    <div className="rounded-full px-[0.5vw] py-[0.25vh]" style={{ background: "rgba(245,158,11,0.2)", border: "1px solid rgba(245,158,11,0.3)", fontSize: "0.65vw", color: "#FCD34D", fontWeight: 600 }}>PENDING</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="relative rounded-[3vw] flex-shrink-0"
            style={{
              width: "18vw",
              height: "80vh",
              background: "#0A0F1C",
              border: "1.5px solid rgba(45,212,191,0.2)",
              boxShadow: "0 0 30px rgba(13,148,136,0.15), inset 0 0 0 1px rgba(255,255,255,0.03)",
            }}
          >
            <div className="absolute top-[1.5vh] left-[50%]" style={{ transform: "translateX(-50%)", width: "4vw", height: "0.6vh", background: "rgba(255,255,255,0.12)", borderRadius: "9999px" }} />
            <div className="absolute inset-x-0 bottom-0 top-[3.5vh] overflow-hidden rounded-b-[3vw]" style={{ padding: "0 0.6vw" }}>
              <div className="h-full overflow-hidden" style={{ borderRadius: "0 0 2.4vw 2.4vw" }}>
                <div
                  className="w-full h-full"
                  style={{ background: "#070B14", padding: "1.5vh 0.8vw 1vh" }}
                >
                  <div className="flex items-center justify-between" style={{ marginBottom: "0.5vh" }}>
                    <div>
                      <div className="font-display font-bold" style={{ fontSize: "1.1vw", color: "#FFFFFF" }}>Live Queue</div>
                      <div className="font-body" style={{ fontSize: "0.75vw", color: "rgba(45,212,191,0.8)" }}>8 patients waiting</div>
                    </div>
                    <div className="rounded-full px-[0.5vw] py-[0.25vh]" style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", fontSize: "0.65vw", color: "#4ADE80", fontWeight: 600 }}>LIVE</div>
                  </div>

                  <div
                    style={{ height: "1px", background: "rgba(255,255,255,0.07)", margin: "1.2vh 0" }}
                  />

                  <div className="flex flex-col gap-[0.75vh]">
                    <div className="rounded-xl px-[0.6vw] py-[1vh]" style={{ background: "linear-gradient(135deg, rgba(248,113,113,0.15), rgba(248,113,113,0.08))", border: "1px solid rgba(248,113,113,0.3)" }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-[0.5vw]">
                          <div className="w-[2.2vw] h-[2.2vw] rounded-full flex items-center justify-center font-display font-bold" style={{ background: "#F87171", fontSize: "0.85vw", color: "#FFFFFF" }}>43</div>
                          <div>
                            <div className="font-body font-semibold" style={{ fontSize: "0.8vw", color: "#FCA5A5" }}>Priya Mehta</div>
                            <div className="font-body" style={{ fontSize: "0.65vw", color: "rgba(255,255,255,0.4)" }}>Emergency · In Consult</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl px-[0.6vw] py-[1vh]" style={{ background: "rgba(45,212,191,0.1)", border: "1.5px solid rgba(45,212,191,0.35)" }}>
                      <div className="flex items-center gap-[0.5vw]">
                        <div className="w-[2.2vw] h-[2.2vw] rounded-full flex items-center justify-center font-display font-bold" style={{ background: "rgba(45,212,191,0.25)", fontSize: "0.85vw", color: "#2DD4BF" }}>44</div>
                        <div>
                          <div className="font-body font-semibold" style={{ fontSize: "0.8vw", color: "#FFFFFF" }}>Rajan Patel</div>
                          <div className="font-body" style={{ fontSize: "0.65vw", color: "#2DD4BF" }}>Normal · Call Now</div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl px-[0.6vw] py-[0.9vh]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="flex items-center gap-[0.5vw]">
                        <div className="w-[2.2vw] h-[2.2vw] rounded-full flex items-center justify-center font-display font-bold" style={{ background: "rgba(255,255,255,0.08)", fontSize: "0.85vw", color: "rgba(255,255,255,0.6)" }}>45</div>
                        <div>
                          <div className="font-body font-semibold" style={{ fontSize: "0.8vw", color: "rgba(255,255,255,0.7)" }}>Sita Devi</div>
                          <div className="font-body" style={{ fontSize: "0.65vw", color: "rgba(255,255,255,0.35)" }}>Normal · ~12 min</div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl px-[0.6vw] py-[0.9vh]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="flex items-center gap-[0.5vw]">
                        <div className="w-[2.2vw] h-[2.2vw] rounded-full flex items-center justify-center font-display font-bold" style={{ background: "rgba(255,255,255,0.08)", fontSize: "0.85vw", color: "rgba(255,255,255,0.6)" }}>46</div>
                        <div>
                          <div className="font-body font-semibold" style={{ fontSize: "0.8vw", color: "rgba(255,255,255,0.7)" }}>Arjun Kumar</div>
                          <div className="font-body" style={{ fontSize: "0.65vw", color: "rgba(255,255,255,0.35)" }}>Normal · ~24 min</div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl px-[0.6vw] py-[0.9vh]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="flex items-center gap-[0.5vw]">
                        <div className="w-[2.2vw] h-[2.2vw] rounded-full flex items-center justify-center font-display font-bold" style={{ background: "rgba(255,255,255,0.08)", fontSize: "0.85vw", color: "rgba(255,255,255,0.6)" }}>47</div>
                        <div>
                          <div className="font-body font-semibold" style={{ fontSize: "0.8vw", color: "rgba(255,255,255,0.7)" }}>Meena Rao</div>
                          <div className="font-body" style={{ fontSize: "0.65vw", color: "rgba(255,255,255,0.35)" }}>Normal · ~36 min</div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl px-[0.6vw] py-[0.9vh]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="flex items-center gap-[0.5vw]">
                        <div className="w-[2.2vw] h-[2.2vw] rounded-full flex items-center justify-center font-display font-bold" style={{ background: "rgba(255,255,255,0.08)", fontSize: "0.85vw", color: "rgba(255,255,255,0.6)" }}>48</div>
                        <div>
                          <div className="font-body font-semibold" style={{ fontSize: "0.8vw", color: "rgba(255,255,255,0.7)" }}>Suresh Babu</div>
                          <div className="font-body" style={{ fontSize: "0.65vw", color: "rgba(255,255,255,0.35)" }}>Normal · ~48 min</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="rounded-xl mt-[1.2vh] flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #0D9488, #0F766E)", padding: "1vh 0" }}
                  >
                    <span className="font-display font-bold" style={{ fontSize: "0.9vw", color: "#FFFFFF" }}>Call Next Patient</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
