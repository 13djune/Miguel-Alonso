const P = (n) => " ".repeat(n);
const Pr = (t) => `>${t}<`;

let B = -3;
let hLines = [];
hLines.push(P(41 + B) + "┌─────────────────────┐");
hLines.push(P(41 + B) + "│ " + "[  SYS.VOID CORE  ]" + " │");
hLines.push(P(41 + B) + "└──────────┬──────────┘");
hLines.push(P(52 + B) + "│");
hLines.push(P(26 + B) + "┌─────────────────────────┴─────────────────────────┐");
hLines.push(P(26 + B) + "│" + P(51) + "│");
hLines.push(P(26 + B) + "▼" + P(51) + "▼");
hLines.push(P(15 + B) + "┌──────────────────────┐" + P(28) + "┌──────────────────────┐");
hLines.push(P(15 + B) + "│  " + "[ UNIV: CREATIVE ]" + "  │" + P(28) + "│  " + "[ UNIV: INDUSTRY ]" + "  │");
hLines.push(P(15 + B) + "└──────────┬───────────┘" + P(28) + "└──────────┬───────────┘");
hLines.push(P(26 + B) + "│" + P(51) + "│");
hLines.push(P(8 + B) + "┌───────────┬─────┴─────┬───────────┐" + P(15) + "┌───────────┬─────┴─────┬───────────┐");
hLines.push(P(8 + B) + "│" + P(11) + "│" + P(11) + "│" + P(11) + "│" + P(15) + "│" + P(11) + "│" + P(11) + "│" + P(11) + "│");
hLines.push(P(8 + B) + "▼" + P(11) + "▼" + P(11) + "▼" + P(11) + "▼" + P(15) + "▼" + P(11) + "▼" + P(11) + "▼" + P(11) + "▼");
hLines.push(
  P(3 + B) + Pr("SYS.VOID") + 
  P(2) + Pr("NEO-GRAV") + 
  P(2) + Pr("AURA-MSH") + 
  P(2) + Pr("LUMINO-W") + 
  P(6) + Pr("MONOLITH") + 
  P(2) + Pr("EXO-ARMR") + 
  P(2) + Pr("MECHA-WR") + 
  P(2) + Pr("SYNTH-SK")
);

for(let l of hLines) console.log(l);
