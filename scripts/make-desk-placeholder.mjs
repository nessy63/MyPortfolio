/* One-off: renders public/desk.jpg (1600×1060) matching the site's dark theme. */
import sharp from "sharp";

const W = 1600;
const H = 1060;

// Code "lines" inside the monitor screen: x, y, w, color
const codeLines = [
  [620, 260, 180, "#f59e0b"],
  [620, 300, 320, "#3b82f6"],
  [660, 340, 260, "#8b9bb4"],
  [620, 380, 140, "#34d399"],
  [700, 380, 200, "#8b9bb4"],
  [620, 420, 300, "#8b9bb4"],
  [660, 460, 120, "#a78bfa"],
  [620, 500, 240, "#3b82f6"],
  [620, 540, 90, "#f59e0b"],
  [660, 540, 160, "#8b9bb4"],
];

const svg = `
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="glow" cx="30%" cy="20%" r="80%">
      <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.10"/>
      <stop offset="60%" stop-color="#f59e0b" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="screen" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#10151f"/>
      <stop offset="100%" stop-color="#0c1018"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="#0d1017"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <!-- desk surface -->
  <rect x="0" y="740" width="${W}" height="320" fill="#141926"/>
  <rect x="0" y="740" width="${W}" height="4" fill="#242e42"/>

  <!-- monitor -->
  <rect x="540" y="170" width="520" height="500" rx="20" fill="#0a0d13" stroke="#2a3240" stroke-width="3"/>
  <rect x="566" y="196" width="468" height="448" rx="8" fill="url(#screen)"/>
  <!-- amber status dot on bezel -->
  <circle cx="800" cy="183" r="4" fill="#f59e0b" opacity="0.9"/>

  ${codeLines
    .map(
      ([x, y, w, c]) =>
        `<rect x="${x}" y="${y}" width="${w}" height="14" rx="7" fill="${c}" opacity="0.85"/>`
    )
    .join("\n  ")}

  <!-- monitor stand -->
  <rect x="776" y="670" width="48" height="70" fill="#1a2130"/>
  <rect x="700" y="736" width="200" height="14" rx="7" fill="#1a2130"/>

  <!-- keyboard -->
  <rect x="580" y="790" width="440" height="46" rx="10" fill="#1a2130" stroke="#2a3240" stroke-width="2"/>
  ${[0, 1, 2]
    .map(
      (row) =>
        `<rect x="600" y="${800 + row * 12}" width="${400 - row * 30}" height="6" rx="3" fill="#2a3240"/>`
    )
    .join("\n  ")}

  <!-- coffee mug + steam -->
  <path d="M 1130 640 q 10 -30 0 -55 M 1165 640 q 12 -35 0 -65" stroke="#8b9bb4" stroke-width="6" fill="none" opacity="0.35" stroke-linecap="round"/>
  <rect x="1105" y="660" width="80" height="84" rx="12" fill="#1a2130" stroke="#2a3240" stroke-width="2"/>
  <path d="M 1185 680 q 40 8 0 44" stroke="#2a3240" stroke-width="10" fill="none"/>
  <ellipse cx="1145" cy="660" rx="40" ry="8" fill="#0d1017"/>

  <!-- plant -->
  <ellipse cx="330" cy="640" rx="26" ry="60" fill="#2f5d4a" transform="rotate(-25 330 640)"/>
  <ellipse cx="390" cy="630" rx="26" ry="66" fill="#3f7a5f" transform="rotate(15 390 630)"/>
  <ellipse cx="360" cy="610" rx="24" ry="72" fill="#2f5d4a"/>
  <path d="M 320 690 L 400 690 L 386 770 L 334 770 Z" fill="#1a2130" stroke="#2a3240" stroke-width="2"/>

  <!-- notebook -->
  <rect x="1180" y="800" width="220" height="150" rx="10" fill="#161d2c" transform="rotate(6 1290 875)" stroke="#2a3240" stroke-width="2"/>
  <rect x="1210" y="830" width="150" height="8" rx="4" fill="#2a3240" transform="rotate(6 1290 875)"/>
  <rect x="1210" y="852" width="120" height="8" rx="4" fill="#2a3240" transform="rotate(6 1290 875)"/>
</svg>`;

await sharp(Buffer.from(svg))
  .jpeg({ quality: 82, mozjpeg: true })
  .toFile("public/desk.jpg");

console.log("wrote public/desk.jpg (1600x1060)");
