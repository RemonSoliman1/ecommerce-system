const sharp = require('sharp');
const fs = require('fs');

const svgCode = `
<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
  <!-- Outer circle with border -->
  <circle cx="150" cy="150" r="140" fill="none" stroke="black" stroke-width="6" opacity="0.6"/>
  <circle cx="150" cy="150" r="130" fill="none" stroke="black" stroke-width="2" opacity="0.6"/>
  
  <!-- Inner filled circle -->
  <circle cx="150" cy="150" r="120" fill="black" opacity="0.65"/>
  
  <!-- Text paths -->
  <path id="topArc" fill="none" d="M 50 150 A 100 100 0 0 1 250 150" />
  <path id="bottomArc" fill="none" d="M 60 150 A 90 90 0 0 0 240 150" />
  
  <text fill="white" font-family="Times New Roman, serif" font-weight="bold" font-size="28" letter-spacing="4">
    <textPath href="#topArc" startOffset="50%" text-anchor="middle">CIGAR LOUNGE</textPath>
  </text>
  
  <!-- Stars -->
  <text x="150" y="140" fill="white" font-size="20" text-anchor="middle" letter-spacing="6">★★★★★</text>
  
  <!-- Center Text -->
  <text x="150" y="180" fill="white" font-family="Times New Roman, serif" font-weight="900" font-size="36" text-anchor="middle" letter-spacing="2">CIGAR</text>
  <text x="150" y="210" fill="white" font-family="Times New Roman, serif" font-size="20" text-anchor="middle" letter-spacing="6">CLUB</text>
  
  <!-- Small bottom text -->
  <text fill="white" font-family="Arial, sans-serif" font-size="16" letter-spacing="3">
    <textPath href="#bottomArc" startOffset="50%" text-anchor="middle">EST. 2026</textPath>
  </text>
</svg>
`;

async function makeStamp() {
    await sharp(Buffer.from(svgCode))
        .png()
        .toFile('stamp.png');
    console.log("Stamp created successfully.");
}

makeStamp();
