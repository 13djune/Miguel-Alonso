const fs = require('fs');

function measure(str) {
  let s = str;
  s = s.replace(/\{isES \? <Clickable text="([^"]+)" [^>]+> : <Clickable text="([^"]+)" [^>]+> \}/g, "$2");
  s = s.replace(/<Clickable text="([^"]+)" [^>]+>\/?>/g, "$1");
  s = s.replace(/&gt;/g, ">");
  s = s.replace(/&lt;/g, "<");
  return s;
}

let hLines = [];
const C = (t, fn) => `{isES ? <Clickable text="${t.replace('CORE', 'NÚCLEO').replace('CREATIVE', 'CREATIVO').replace('INDUSTRY', 'INDUSTRIA')}" onClick={${fn}} /> : <Clickable text="${t}" onClick={${fn}} />}`;
const P = (t, idx) => `&gt;<Clickable text="${t}" onClick={() => handleProject(${idx})} />&lt;`;

hLines.push("                                   ╔═════════════════════╗");
hLines.push("                                   ║ " + C("[ SYS.VOID CORE   ]", "handleNucleo") + " ║");
hLines.push("                                   ╚══════════╦══════════╝");
hLines.push("                                              ║");
hLines.push("                           ┌──────────────────╨──────────────────┐");
hLines.push("                           │                                     │");
hLines.push("                           ▼                                     ▼");
hLines.push("              ┌────────────────────────┐              ┌────────────────────────┐");
hLines.push("              │ " + C("[ UNIV: CREATIVE     ]", "handleCreative") + " │              │ " + C("[ UNIV: INDUSTRY     ]", "handleIndustry") + " │");
hLines.push("              └────────────┬───────────┘              └────────────┬───────────┘");
hLines.push("                           │                                       │");
hLines.push("        ┌───────────┬──────┴─────┬───────────┐  ┌───────────┬──────┴─────┬───────────┐");
hLines.push("        │           │            │           │  │           │            │           │");
hLines.push("        ▼           ▼            ▼           ▼  ▼           ▼            ▼           ▼");
hLines.push("     " + P("SYS.VOID", 0) + "  " + P("NEO-GRAV", 1) + "   " + P("AURA-MSH", 2) + "   " + P("LUMINO-W", 3) + "  " + P("MONOLITH", 4) + "  " + P("EXO-ARMR", 5) + "   " + P("MECHA-WR", 6) + "   " + P("SYNTH-SK", 7));


console.log("Lengths:");
hLines.forEach(l => {
  let m = measure(l);
  console.log(m.length, m);
});
