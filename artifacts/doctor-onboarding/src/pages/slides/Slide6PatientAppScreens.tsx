export default function Slide6PatientAppScreens() {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0A0E1A 0%, #0D1322 100%)" }}
    >
      <div
        className="absolute top-0 left-0 w-[55vw] h-[55vh] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)",
          transform: "translate(-20%, -20%)",
        }}
      />
      <div
        className="absolute bottom-0 right-0 w-[40vw] h-[40vh] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)",
          transform: "translate(15%, 15%)",
        }}
      />

      <div className="relative z-10 flex h-full">
        <div className="flex items-center justify-center pl-[3vw] gap-[1.8vw]" style={{ width: "60%" }}>

          <div
            className="relative rounded-[3vw] flex-shrink-0"
            style={{
              width: "16vw",
              height: "82vh",
              background: "#090D1A",
              border: "1.5px solid rgba(99,102,241,0.3)",
              boxShadow: "0 0 35px rgba(99,102,241,0.15), inset 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            <div className="absolute top-[1.5vh] left-[50%]" style={{ transform: "translateX(-50%)", width: "3.5vw", height: "0.55vh", background: "rgba(255,255,255,0.12)", borderRadius: "9999px" }} />
            <div className="absolute inset-x-0 bottom-0 top-[3.5vh] overflow-hidden rounded-b-[3vw]" style={{ padding: "0 0.5vw" }}>
              <div className="h-full overflow-hidden" style={{ borderRadius: "0 0 2.5vw 2.5vw" }}>
                <div className="w-full h-full" style={{ background: "#0A0E1A", padding: "1.5vh 0.7vw" }}>
                  <div style={{ marginBottom: "1.5vh" }}>
                    <div className="font-display font-bold" style={{ fontSize: "1.1vw", color: "#FFFFFF" }}>Find a Doctor</div>
                    <div className="font-body" style={{ fontSize: "0.7vw", color: "rgba(255,255,255,0.4)" }}>Book your token now</div>
                  </div>
                  <div className="rounded-xl px-[0.5vw] py-[0.8vh] flex items-center gap-[0.5vw]" style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", marginBottom: "1.5vh" }}>
                    <span style={{ fontSize: "0.75vw", color: "rgba(255,255,255,0.35)" }}>Search clinics...</span>
                  </div>
                  <div className="font-body font-semibold" style={{ fontSize: "0.72vw", color: "rgba(255,255,255,0.4)", letterSpacing: "0.07em", marginBottom: "0.8vh" }}>NEARBY</div>
                  <div className="flex flex-col gap-[0.8vh]">
                    <div className="rounded-xl p-[0.8vh]" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.08))", border: "1.5px solid rgba(99,102,241,0.3)" }}>
                      <div className="font-body font-semibold" style={{ fontSize: "0.82vw", color: "#FFFFFF" }}>Dr. Rajesh Sharma</div>
                      <div className="font-body" style={{ fontSize: "0.68vw", color: "rgba(255,255,255,0.45)" }}>General Physician · 0.4 km</div>
                      <div className="flex items-center gap-[0.4vw] mt-[0.5vh]">
                        <div className="rounded-full px-[0.4vw] py-[0.15vh]" style={{ background: "rgba(34,197,94,0.15)", fontSize: "0.6vw", color: "#4ADE80" }}>8 slots left</div>
                        <span style={{ fontSize: "0.65vw", color: "rgba(255,255,255,0.3)" }}>Token &#8377;20</span>
                      </div>
                    </div>
                    <div className="rounded-xl p-[0.8vh]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="font-body font-semibold" style={{ fontSize: "0.82vw", color: "rgba(255,255,255,0.7)" }}>Dr. Priya Nair</div>
                      <div className="font-body" style={{ fontSize: "0.68vw", color: "rgba(255,255,255,0.35)" }}>Paediatrician · 1.2 km</div>
                      <div className="flex items-center gap-[0.4vw] mt-[0.5vh]">
                        <div className="rounded-full px-[0.4vw] py-[0.15vh]" style={{ background: "rgba(245,158,11,0.12)", fontSize: "0.6vw", color: "#FCD34D" }}>3 slots left</div>
                        <span style={{ fontSize: "0.65vw", color: "rgba(255,255,255,0.3)" }}>Token &#8377;20</span>
                      </div>
                    </div>
                    <div className="rounded-xl p-[0.8vh]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <div className="font-body font-semibold" style={{ fontSize: "0.82vw", color: "rgba(255,255,255,0.7)" }}>Dr. Arjun Mehta</div>
                      <div className="font-body" style={{ fontSize: "0.68vw", color: "rgba(255,255,255,0.35)" }}>Dermatologist · 2.1 km</div>
                      <div className="flex items-center gap-[0.4vw] mt-[0.5vh]">
                        <div className="rounded-full px-[0.4vw] py-[0.15vh]" style={{ background: "rgba(34,197,94,0.12)", fontSize: "0.6vw", color: "#4ADE80" }}>Full · Tomorrow open</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="relative rounded-[3vw] flex-shrink-0"
            style={{
              width: "16vw",
              height: "82vh",
              background: "#090D1A",
              border: "1.5px solid rgba(6,182,212,0.3)",
              boxShadow: "0 0 35px rgba(6,182,212,0.12), inset 0 0 0 1px rgba(255,255,255,0.04)",
            }}
          >
            <div className="absolute top-[1.5vh] left-[50%]" style={{ transform: "translateX(-50%)", width: "3.5vw", height: "0.55vh", background: "rgba(255,255,255,0.12)", borderRadius: "9999px" }} />
            <div className="absolute inset-x-0 bottom-0 top-[3.5vh] overflow-hidden rounded-b-[3vw]" style={{ padding: "0 0.5vw" }}>
              <div className="h-full overflow-hidden" style={{ borderRadius: "0 0 2.5vw 2.5vw" }}>
                <div className="w-full h-full" style={{ background: "#0A0E1A", padding: "1.5vh 0.7vw" }}>
                  <div style={{ marginBottom: "1.2vh" }}>
                    <div className="font-display font-bold" style={{ fontSize: "1.1vw", color: "#FFFFFF" }}>Book Token</div>
                    <div className="font-body" style={{ fontSize: "0.72vw", color: "rgba(255,255,255,0.4)" }}>Dr. Rajesh Sharma</div>
                  </div>
                  <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "1.2vh" }} />
                  <div className="font-body font-semibold" style={{ fontSize: "0.72vw", color: "rgba(255,255,255,0.4)", letterSpacing: "0.07em", marginBottom: "0.8vh" }}>SELECT TOKEN TYPE</div>
                  <div className="flex flex-col gap-[0.9vh]" style={{ marginBottom: "1.5vh" }}>
                    <div className="rounded-xl p-[1vh]" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.18), rgba(99,102,241,0.08))", border: "1.5px solid rgba(99,102,241,0.45)" }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-body font-semibold" style={{ fontSize: "0.85vw", color: "#FFFFFF" }}>Normal Token</div>
                          <div className="font-body" style={{ fontSize: "0.68vw", color: "rgba(255,255,255,0.45)" }}>Regular consultation</div>
                        </div>
                        <div className="font-display font-bold" style={{ fontSize: "1vw", color: "#A5B4FC" }}>&#8377;20</div>
                      </div>
                    </div>
                    <div className="rounded-xl p-[1vh]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-body font-semibold" style={{ fontSize: "0.85vw", color: "rgba(255,255,255,0.7)" }}>Emergency Token</div>
                          <div className="font-body" style={{ fontSize: "0.68vw", color: "rgba(255,255,255,0.35)" }}>Priority consultation</div>
                        </div>
                        <div className="font-display font-bold" style={{ fontSize: "1vw", color: "rgba(255,255,255,0.5)" }}>&#8377;30</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", marginBottom: "1.2vh" }} />
                  <div className="font-body font-semibold" style={{ fontSize: "0.72vw", color: "rgba(255,255,255,0.4)", letterSpacing: "0.07em", marginBottom: "0.8vh" }}>PAY VIA</div>
                  <div className="flex gap-[0.5vw]" style={{ marginBottom: "1.5vh" }}>
                    <div className="flex-1 rounded-lg p-[0.7vh] text-center" style={{ background: "rgba(34,197,94,0.15)", border: "1.5px solid rgba(34,197,94,0.4)", fontSize: "0.72vw", color: "#4ADE80", fontWeight: 600 }}>UPI</div>
                    <div className="flex-1 rounded-lg p-[0.7vh] text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.72vw", color: "rgba(255,255,255,0.4)" }}>Card</div>
                    <div className="flex-1 rounded-lg p-[0.7vh] text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "0.72vw", color: "rgba(255,255,255,0.4)" }}>Net Bank</div>
                  </div>
                  <div className="rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)", padding: "1.2vh 0" }}>
                    <span className="font-display font-bold" style={{ fontSize: "0.9vw", color: "#FFFFFF" }}>Pay &#8377;20 &amp; Confirm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="relative rounded-[3vw] flex-shrink-0"
            style={{
              width: "16vw",
              height: "82vh",
              background: "#090D1A",
              border: "1.5px solid rgba(34,197,94,0.25)",
              boxShadow: "0 0 35px rgba(34,197,94,0.1), inset 0 0 0 1px rgba(255,255,255,0.03)",
            }}
          >
            <div className="absolute top-[1.5vh] left-[50%]" style={{ transform: "translateX(-50%)", width: "3.5vw", height: "0.55vh", background: "rgba(255,255,255,0.12)", borderRadius: "9999px" }} />
            <div className="absolute inset-x-0 bottom-0 top-[3.5vh] overflow-hidden rounded-b-[3vw]" style={{ padding: "0 0.5vw" }}>
              <div className="h-full overflow-hidden" style={{ borderRadius: "0 0 2.5vw 2.5vw" }}>
                <div className="w-full h-full flex flex-col items-center" style={{ background: "#0A0E1A", padding: "2vh 0.7vw 1.5vh" }}>
                  <div className="w-full flex items-center justify-between" style={{ marginBottom: "1.8vh" }}>
                    <div className="font-display font-bold" style={{ fontSize: "1.1vw", color: "#FFFFFF" }}>My Token</div>
                    <div className="rounded-full px-[0.5vw] py-[0.2vh]" style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.35)", fontSize: "0.62vw", color: "#4ADE80", fontWeight: 600 }}>CONFIRMED</div>
                  </div>

                  <div className="w-full rounded-2xl flex flex-col items-center py-[2.5vh]" style={{ background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.07))", border: "1.5px solid rgba(99,102,241,0.3)", marginBottom: "1.5vh" }}>
                    <div className="font-body" style={{ fontSize: "0.72vw", color: "rgba(255,255,255,0.45)", marginBottom: "0.5vh" }}>Your Token Number</div>
                    <div className="font-display font-black" style={{ fontSize: "4vw", color: "#FFFFFF", lineHeight: 1 }}>47</div>
                    <div className="font-body" style={{ fontSize: "0.72vw", color: "rgba(255,255,255,0.4)", marginTop: "0.5vh" }}>Dr. Rajesh Sharma</div>
                  </div>

                  <div className="w-full rounded-xl px-[0.7vw] py-[1.2vh]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "1.2vh" }}>
                    <div className="flex items-center justify-between" style={{ marginBottom: "0.8vh" }}>
                      <span className="font-body" style={{ fontSize: "0.72vw", color: "rgba(255,255,255,0.45)" }}>Position in queue</span>
                      <span className="font-display font-bold" style={{ fontSize: "1vw", color: "#FFFFFF" }}>3 / 8</span>
                    </div>
                    <div className="w-full rounded-full" style={{ height: "0.5vh", background: "rgba(255,255,255,0.08)" }}>
                      <div className="rounded-full" style={{ width: "37%", height: "100%", background: "linear-gradient(90deg, #6366F1, #06B6D4)" }} />
                    </div>
                  </div>

                  <div className="w-full rounded-xl px-[0.7vw] py-[1.2vh]" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: "1.2vh" }}>
                    <div className="flex items-center justify-between">
                      <span className="font-body" style={{ fontSize: "0.72vw", color: "rgba(255,255,255,0.45)" }}>Est. wait time</span>
                      <span className="font-display font-bold" style={{ fontSize: "1vw", color: "#06B6D4" }}>~18 min</span>
                    </div>
                  </div>

                  <div className="w-full rounded-xl px-[0.7vw] py-[1vh]" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.2)", marginBottom: "1.2vh" }}>
                    <div className="font-body" style={{ fontSize: "0.68vw", color: "rgba(255,255,255,0.5)" }}>You'll be notified when</div>
                    <div className="font-body font-semibold" style={{ fontSize: "0.75vw", color: "#FCD34D" }}>Token #45 is called</div>
                  </div>

                  <div className="w-full rounded-xl px-[0.7vw] py-[1vh]" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                    <div className="font-body" style={{ fontSize: "0.68vw", color: "rgba(255,255,255,0.4)" }}>Normal Token · &#8377;20 paid</div>
                    <div className="font-body font-semibold" style={{ fontSize: "0.72vw", color: "#4ADE80" }}>Payment confirmed via UPI</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center pr-[6vw]" style={{ width: "40%" }}>
          <div
            className="inline-block px-[1.1vw] py-[0.45vh] rounded-full mb-[2.5vh]"
            style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.35)" }}
          >
            <span className="font-body font-semibold" style={{ fontSize: "1.3vw", color: "#A5B4FC", letterSpacing: "0.12em" }}>
              PATIENT APP
            </span>
          </div>
          <div className="font-display font-extrabold" style={{ fontSize: "3.6vw", color: "#FFFFFF", lineHeight: 1.1, letterSpacing: "-0.025em" }}>
            What your patients experience.
          </div>
          <div className="font-body mt-[2.5vh]" style={{ fontSize: "1.5vw", color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>
            Patients book from their phone — no calls, no crowds at your door. They track their queue position live and walk in right on time.
          </div>
          <div className="mt-[3.5vh] flex flex-col gap-[1.8vh]">
            <div
              className="rounded-2xl px-[1.5vw] py-[1.8vh]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(99,102,241,0.2)" }}
            >
              <div className="font-body font-semibold" style={{ fontSize: "1.45vw", color: "#FFFFFF", marginBottom: "0.5vh" }}>1 — Find &amp; Book</div>
              <div className="font-body" style={{ fontSize: "1.3vw", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>Searches your clinic, picks a slot, pays UPI in 30 seconds</div>
            </div>
            <div
              className="rounded-2xl px-[1.5vw] py-[1.8vh]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(6,182,212,0.2)" }}
            >
              <div className="font-body font-semibold" style={{ fontSize: "1.45vw", color: "#FFFFFF", marginBottom: "0.5vh" }}>2 — Track Queue Live</div>
              <div className="font-body" style={{ fontSize: "1.3vw", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>Real-time position counter and estimated wait time on screen</div>
            </div>
            <div
              className="rounded-2xl px-[1.5vw] py-[1.8vh]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(34,197,94,0.2)" }}
            >
              <div className="font-body font-semibold" style={{ fontSize: "1.45vw", color: "#FFFFFF", marginBottom: "0.5vh" }}>3 — Notified to Arrive</div>
              <div className="font-body" style={{ fontSize: "1.3vw", color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>Push notification when they're 2 tokens away — zero waiting at your door</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
