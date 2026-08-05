// Vintage 1960s Comic 2D Line Art Vector Generators (SVG Data URLs)

export function generateVintageLineArtSvg(type: 'bear_office' | 'bear_punch' | 'bear_rage' | 'bear_tired' | 'bull_office' | 'panther_tree' | 'fox_tweed' | 'owl_scholar' | 'wolf_savile' | 'badger_gown'): string {
  let innerSvg = '';

  switch (type) {
    case 'bear_office':
      innerSvg = `
        <rect width="800" height="800" fill="#F7F2E8"/>
        <!-- Halftone texture dots -->
        <pattern id="ht" width="8" height="8" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#D4C5A9" opacity="0.4"/>
        </pattern>
        <rect width="800" height="800" fill="url(#ht)"/>
        <!-- Desk -->
        <path d="M120,480 L680,450 L720,650 L80,680 Z" fill="#EAD9C0" stroke="#000" stroke-width="5"/>
        <path d="M120,480 L120,720 M680,450 L680,720 M80,680 L80,780" stroke="#000" stroke-width="5"/>
        <!-- Computer Monitor -->
        <rect x="180" y="320" width="160" height="130" rx="6" fill="#DCD3C1" stroke="#000" stroke-width="5"/>
        <rect x="195" y="335" width="130" height="90" fill="#FFFDF7" stroke="#000" stroke-width="3"/>
        <!-- Chart on Monitor -->
        <path d="M210,400 L240,370 L270,390 L310,350" fill="none" stroke="#C2410C" stroke-width="4"/>
        <rect x="235" y="380" width="12" height="20" fill="#991B1B"/>
        <rect x="265" y="365" width="12" height="35" fill="#991B1B"/>
        <path d="M250,450 L270,450 L265,480 L255,480 Z" fill="#444" stroke="#000" stroke-width="4"/>
        <!-- Coffee Mug -->
        <rect x="360" y="440" width="35" height="40" rx="3" fill="#FFF" stroke="#000" stroke-width="4"/>
        <path d="M395,448 C410,448 410,472 395,472" fill="none" stroke="#000" stroke-width="4"/>
        <!-- Bear Body & Bespoke Vest/Tie -->
        <path d="M350,220 C330,180 400,120 480,130 C550,140 590,190 570,240 C620,280 660,340 640,460 L380,480 C360,400 330,300 350,220 Z" fill="#8C6D46" stroke="#000" stroke-width="6"/>
        <!-- Bear Snout & Face Line Art -->
        <ellipse cx="440" cy="230" rx="55" ry="45" fill="#D9C2A3" stroke="#000" stroke-width="4"/>
        <ellipse cx="420" cy="215" rx="14" ry="10" fill="#000"/>
        <!-- Bear Eyes & Fur Hatching -->
        <circle cx="430" cy="180" r="7" fill="#000"/>
        <path d="M470,170 C480,165 490,175 480,185" fill="none" stroke="#000" stroke-width="4"/>
        <path d="M410,245 C430,265 460,265 470,245" fill="none" stroke="#000" stroke-width="5"/>
        <!-- Bear Ears -->
        <circle cx="390" cy="140" r="24" fill="#8C6D46" stroke="#000" stroke-width="5"/>
        <circle cx="530" cy="150" r="22" fill="#8C6D46" stroke="#000" stroke-width="5"/>
        <!-- Shirt Collar & Necktie -->
        <path d="M420,270 L460,330 L500,270 Z" fill="#FFF" stroke="#000" stroke-width="4"/>
        <path d="M450,285 L470,285 L475,410 L455,430 L445,410 Z" fill="#991B1B" stroke="#000" stroke-width="4"/>
        <!-- Suspenders -->
        <path d="M390,320 L405,480 M515,320 L500,480" stroke="#000" stroke-width="8"/>
        <!-- Pointing Bear Paw -->
        <path d="M400,360 L280,380 C260,385 250,370 270,360 L370,330 Z" fill="#8C6D46" stroke="#000" stroke-width="5"/>
        <!-- Vintage Ink Line Hatching Shade -->
        <path d="M540,260 L620,380 M550,280 L625,395 M560,300 L630,410" stroke="#000" stroke-width="2"/>
        <text x="400" y="750" text-anchor="middle" font-family="serif" font-weight="900" font-size="28" fill="#000" letter-spacing="3">BEAR OFFICE HUMOR VINTAGE</text>
      `;
      break;

    case 'bear_punch':
      innerSvg = `
        <rect width="800" height="800" fill="#F7F2E8"/>
        <pattern id="ht2" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.2" fill="#CBBBA0" opacity="0.5"/>
        </pattern>
        <rect width="800" height="800" fill="url(#ht2)"/>
        <!-- Bear Punch Pose in Trenchcoat -->
        <path d="M220,780 L280,520 L320,350 L400,140 C480,120 560,160 580,240 C650,280 720,400 680,780 Z" fill="#B3A286" stroke="#000" stroke-width="6"/>
        <!-- Trenchcoat Lapels -->
        <path d="M350,280 L480,450 L300,560 L240,420 Z" fill="#D9CBB5" stroke="#000" stroke-width="5"/>
        <path d="M500,280 L380,450 L560,560 L620,420 Z" fill="#C9BB9E" stroke="#000" stroke-width="5"/>
        <!-- Fist in Foreground (Punch) -->
        <circle cx="320" cy="280" r="65" fill="#7A5C36" stroke="#000" stroke-width="7"/>
        <path d="M280,250 C290,230 340,230 350,250 M270,280 C280,260 350,260 360,280" fill="none" stroke="#000" stroke-width="5"/>
        <!-- Bear Head -->
        <circle cx="510" cy="180" r="75" fill="#7A5C36" stroke="#000" stroke-width="6"/>
        <ellipse cx="480" cy="195" rx="40" ry="30" fill="#C4A882" stroke="#000" stroke-width="4"/>
        <polygon points="460,185 480,180 475,198" fill="#000"/>
        <circle cx="515" cy="165" r="8" fill="#000"/>
        <path d="M460,210 Q490,230 520,205" fill="none" stroke="#000" stroke-width="5"/>
        <!-- Ink Hatching Lines -->
        <path d="M550,200 L640,300 M560,220 L650,320 M570,240 L660,340" stroke="#000" stroke-width="2.5"/>
        <text x="400" y="750" text-anchor="middle" font-family="serif" font-weight="900" font-size="28" fill="#000" letter-spacing="2">BEAR PUNCH BESPOKE VINTAGE</text>
      `;
      break;

    case 'bear_rage':
      innerSvg = `
        <rect width="800" height="800" fill="#F7F2E8"/>
        <!-- Presentation Board -->
        <rect x="80" y="100" width="380" height="420" fill="#FFFDF7" stroke="#000" stroke-width="6"/>
        <path d="M120,520 L80,720 M420,520 L460,720 M270,520 L270,750" stroke="#000" stroke-width="6"/>
        <!-- Chart on Board -->
        <text x="270" y="145" text-anchor="middle" font-family="sans-serif" font-weight="900" font-size="18" fill="#000">PRODUCTIVITY vs. ANGER</text>
        <line x1="120" y1="460" x2="420" y2="460" stroke="#000" stroke-width="4"/>
        <line x1="120" y1="170" x2="120" y2="460" stroke="#000" stroke-width="4"/>
        <!-- Spiking Line -->
        <path d="M130,420 L200,380 L280,440 L380,200" fill="none" stroke="#B91C1C" stroke-width="6"/>
        <text x="220" y="320" font-family="sans-serif" font-weight="bold" font-size="14" fill="#000">Q3 RAGE INDEX</text>
        <rect x="140" y="480" width="260" height="30" fill="#FEF08A" stroke="#000" stroke-width="2"/>
        <text x="270" y="500" text-anchor="middle" font-family="monospace" font-weight="bold" font-size="12" fill="#991B1B">THE PRINTERS MUST DIE</text>
        <!-- Angry Bear Presenter -->
        <path d="M420,260 C400,200 480,140 560,150 C620,160 660,220 640,280 C700,320 740,420 720,720 L460,740 Z" fill="#8C6D46" stroke="#000" stroke-width="6"/>
        <circle cx="530" cy="190" r="60" fill="#8C6D46" stroke="#000" stroke-width="5"/>
        <ellipse cx="500" cy="205" rx="35" ry="25" fill="#D9C2A3" stroke="#000" stroke-width="4"/>
        <polygon points="480,195 500,190 495,208" fill="#000"/>
        <!-- Angry Mouth & Teeth -->
        <path d="M480,215 Q510,240 540,215 Z" fill="#991B1B" stroke="#000" stroke-width="4"/>
        <!-- Pointer Stick in Paw -->
        <line x1="330" y1="260" x2="520" y2="340" stroke="#000" stroke-width="6"/>
        <text x="400" y="770" text-anchor="middle" font-family="serif" font-weight="900" font-size="24" fill="#000">BEAR RAGE &amp; ANGER INK BLEED</text>
      `;
      break;

    case 'bull_office':
      innerSvg = `
        <rect width="800" height="800" fill="#F7F2E8"/>
        <!-- Bull Head with Horns -->
        <path d="M250,220 L150,130 C120,110 110,160 160,200 L240,280 Z" fill="#EAD9C0" stroke="#000" stroke-width="6"/>
        <path d="M550,220 L650,130 C680,110 690,160 640,200 L560,280 Z" fill="#EAD9C0" stroke="#000" stroke-width="6"/>
        <ellipse cx="400" cy="300" rx="150" ry="120" fill="#57412A" stroke="#000" stroke-width="7"/>
        <ellipse cx="400" cy="340" rx="90" ry="60" fill="#C9B499" stroke="#000" stroke-width="5"/>
        <circle cx="360" cy="345" r="14" fill="#000"/>
        <circle cx="440" cy="345" r="14" fill="#000"/>
        <!-- Nose Ring -->
        <circle cx="400" cy="390" r="22" fill="none" stroke="#D97706" stroke-width="6"/>
        <!-- Bull Eyes -->
        <circle cx="330" cy="270" r="10" fill="#000"/>
        <circle cx="470" cy="270" r="10" fill="#000"/>
        <!-- Bespoke Suit & Tie -->
        <path d="M200,420 L400,780 L600,420 Z" fill="#1E293B" stroke="#000" stroke-width="7"/>
        <path d="M340,420 L400,520 L460,420 Z" fill="#FFF" stroke="#000" stroke-width="4"/>
        <path d="M390,440 L410,440 L415,640 L400,660 L385,640 Z" fill="#B91C1C" stroke="#000" stroke-width="4"/>
        <text x="400" y="750" text-anchor="middle" font-family="serif" font-weight="900" font-size="28" fill="#000" letter-spacing="2">BULL OFFICE WORK 2D LINE ART</text>
      `;
      break;

    case 'panther_tree':
      innerSvg = `
        <rect width="800" height="800" fill="#F7F2E8"/>
        <!-- Tree Branch Woodcut Engraving -->
        <path d="M50,750 C200,600 350,550 500,400 C620,280 700,150 780,50" fill="none" stroke="#000" stroke-width="40"/>
        <path d="M50,750 C200,600 350,550 500,400 C620,280 700,150 780,50" fill="none" stroke="#3D2E1E" stroke-width="32"/>
        <!-- Panther on Branch -->
        <path d="M220,520 C260,420 380,350 480,360 C580,370 640,440 600,520 C560,560 420,580 300,570 Z" fill="#121212" stroke="#000" stroke-width="6"/>
        <!-- Panther Tail -->
        <path d="M230,530 C180,550 160,620 200,660 C230,690 280,660 260,630" fill="none" stroke="#121212" stroke-width="20" stroke-linecap="round"/>
        <path d="M230,530 C180,550 160,620 200,660 C230,690 280,660 260,630" fill="none" stroke="#000" stroke-width="24" stroke-linecap="round"/>
        <!-- Panther Head -->
        <circle cx="580" cy="380" r="50" fill="#121212" stroke="#000" stroke-width="5"/>
        <ellipse cx="610" cy="390" rx="25" ry="18" fill="#222" stroke="#000" stroke-width="3"/>
        <circle cx="595" cy="370" r="6" fill="#F59E0B"/>
        <!-- INKPROWL Text carved on Panther flank -->
        <text x="420" y="470" font-family="serif" font-weight="900" font-size="32" fill="#FFF" letter-spacing="4" transform="rotate(-12, 420, 470)">INKPROWL</text>
        <!-- Vintage Leaves & Tree Hatching -->
        <path d="M120,400 C100,350 140,320 180,360 Z" fill="#4B5563" stroke="#000" stroke-width="3"/>
        <path d="M280,250 C260,200 310,180 340,230 Z" fill="#4B5563" stroke="#000" stroke-width="3"/>
        <text x="400" y="750" text-anchor="middle" font-family="serif" font-weight="900" font-size="28" fill="#000" letter-spacing="3">SLEUTH PANTHER WOODCUT</text>
      `;
      break;

    default:
      innerSvg = `
        <rect width="800" height="800" fill="#F7F2E8"/>
        <circle cx="400" cy="400" r="280" fill="#8C6D46" stroke="#000" stroke-width="8"/>
        <text x="400" y="420" text-anchor="middle" font-family="serif" font-weight="900" font-size="36" fill="#FFF">VINTAGE LINE ART</text>
      `;
  }

  const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">${innerSvg}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svgStr)}`;
}
