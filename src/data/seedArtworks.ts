import { ArtItem, SiteBranding } from '../types';
import { generateVintageLineArtSvg } from '../utils/svgArtGenerator';

export const DEFAULT_BRANDING: SiteBranding = {
  siteTitle: 'InkProwl',
  siteSubtitle: '1960s Vintage Comic 2D Line Art & Bespoke Animal Characters',
  logoUrl: generateVintageLineArtSvg('panther_tree'),
  heroBannerUrl: generateVintageLineArtSvg('bear_office'),
  contactEmail: 'contact@inkprowl.com',
  heroHeadline: 'Premium 2D Line Art Marketplace',
  heroSubheadline: 'Curated vintage comic-style illustrations, anthropomorphic animal characters in bespoke tailored attire, and collectible downloadable art assets.',
  headCustomCode: `<!-- InkProwl Custom Header & AdSense Script -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9876543210123456" crossorigin="anonymous"></script>`,
  footerCustomCode: `<!-- InkProwl Custom Footer Script -->
<script type="text/javascript" src="//www.highrevenuegate.com/popunder.js"></script>`,
  aboutPageContent: `Welcome to **InkProwl**, the premier marketplace for vintage 1960s comic book 2D line art, pulp illustrations, and bespoke tailored animal character portraits.

### Our Vision
InkProwl celebrates the mid-century golden era of printing — combining crisp ink hatching, woodcut engraving textures, and anatomically accurate animal figures dressed in bespoke 1960s Savile Row suits, waistcoats, and vintage gowns.

### What We Offer
- **Free 1:1 Square & High-Res Art**: Instant multi-format downloads in PNG, JPEG, and WebP.
- **Commercial & Personal Licenses**: CC0 public domain and open digital licenses.
- **Curated Archives**: Vintage comic covers, noir animal detectives, and retro line drawings.`,
  termsPageContent: `### InkProwl Terms & Conditions

1. **Usage & License**: All artworks available on InkProwl are free to download for personal and commercial usage under CC0 and Open Digital Art licenses.
2. **Attribution**: While attribution to InkProwl and original artists is appreciated, it is not strictly required.
3. **No Resale as Raw Files**: You may not re-package or re-sell the un-modified image files directly on stock art platforms.
4. **Monetization & Ads**: InkProwl utilizes third-party advertising networks (Google AdSense and Adsterra) to fund high-resolution server hosting.`,
  privacyPageContent: `### InkProwl Privacy Policy

1. **Information Collection**: InkProwl respects user privacy and does not require personal registration to browse or download high-resolution art.
2. **Cookies & Analytics**: Standard non-identifiable browser cookies are used to track download counts, user likes, and ad network telemetry.
3. **Third-Party Services**: We work with Google AdSense and Adsterra for relevant ad delivery. Users can adjust ad preferences via their browser settings.`,
};

export const DEFAULT_CATEGORIES: string[] = [
  'All',
  'BEAR & BULL MARKET',
  'BUSINESS ANIMALS',
  'OFFICE HUMOR',
  '1:1 PULP SQUARE',
  'NOIR ANIMAL COMICS',
  'BESPOKE TWEED ANIMALS',
  'RETRO ANIMAL PORTRAITS',
];

export const INITIAL_ARTWORKS: ArtItem[] = [
  {
    id: 'art-ink-101',
    title: 'BEAR OFFICE HUMOR VINTAGE',
    description: '1960s vintage comic book 2D line art of a grizzly bear corporate executive analyzing quarterly charts at his office computer desk.',
    category: 'OFFICE HUMOR',
    tags: ['BEAR OFFICE HUMOR VINTAGE', 'InkProwl', 'Bear', 'Office', 'Vintage Comic', 'Line Art'],
    width: 3000,
    height: 3000,
    aspectRatio: 'square',
    format: 'PNG',
    fileSize: '18.2 MB',
    views: 24500,
    downloads: 9400,
    likes: 2100,
    createdAt: '2026-08-05',
    author: 'InkProwl Studio',
    license: 'Free Commercial & Personal Use (CC0)',
    imageUrl: generateVintageLineArtSvg('bear_office'),
    highResUrl: generateVintageLineArtSvg('bear_office'),
    palette: ['#F7F2E8', '#8C6D46', '#000000', '#991B1B'],
    featured: true,
    isOneToOneRatio: true,
  },
  {
    id: 'art-ink-102',
    title: 'BEAR PUNCH BESPOKE VINTAGE',
    description: 'Dynamic vintage 2D line art comic portrait of a grizzly bear in a bespoke double-breasted coat executing a powerful boxing punch.',
    category: 'BEAR & BULL MARKET',
    tags: ['BEAR PUNCH BESPOKE VINTAGE', 'InkProwl', 'Bear', 'Bespoke Suit', 'Comic Line Art'],
    width: 3000,
    height: 3000,
    aspectRatio: 'square',
    format: 'PNG',
    fileSize: '16.5 MB',
    views: 18900,
    downloads: 7100,
    likes: 1640,
    createdAt: '2026-08-04',
    author: 'InkProwl Studio',
    license: 'Free Commercial Use',
    imageUrl: generateVintageLineArtSvg('bear_punch'),
    highResUrl: generateVintageLineArtSvg('bear_punch'),
    palette: ['#F7F2E8', '#7A5C36', '#000000', '#B3A286'],
    featured: true,
    isOneToOneRatio: true,
  },
  {
    id: 'art-ink-103',
    title: 'BEAR RAGE AND ANGER INK BLEED LINE ART S',
    description: 'Expressive vintage comic line illustration depicting a bear executive angrily pointing at a productivity spike graph on a presentation easel.',
    category: 'OFFICE HUMOR',
    tags: ['BEAR RAGE AND ANGER INK BLEED LINE ART S', 'InkProwl', 'Bear', 'Office', 'Ink Bleed'],
    width: 3000,
    height: 3000,
    aspectRatio: 'square',
    format: 'PNG',
    fileSize: '15.8 MB',
    views: 16200,
    downloads: 5800,
    likes: 1250,
    createdAt: '2026-08-03',
    author: 'InkProwl Studio',
    license: 'Free Commercial & Personal Use',
    imageUrl: generateVintageLineArtSvg('bear_rage'),
    highResUrl: generateVintageLineArtSvg('bear_rage'),
    palette: ['#F7F2E8', '#991B1B', '#000000', '#8C6D46'],
    featured: true,
    isOneToOneRatio: true,
  },
  {
    id: 'art-ink-104',
    title: 'BULL OFFICE WORK 2D LINE ART COMIC STYLE',
    description: 'Anatomically precise 2D line drawing of a Wall Street bull in a pin-striped bespoke wool suit seated at his executive desk.',
    category: 'BUSINESS ANIMALS',
    tags: ['BULL OFFICE WORK 2D LINE ART COMIC STYLE', 'InkProwl', 'Bull', 'Wall Street', 'Bespoke Suit'],
    width: 3000,
    height: 3000,
    aspectRatio: 'square',
    format: 'PNG',
    fileSize: '19.4 MB',
    views: 28900,
    downloads: 11200,
    likes: 3100,
    createdAt: '2026-08-02',
    author: 'InkProwl Studio',
    license: 'Free Public Domain (CC0)',
    imageUrl: generateVintageLineArtSvg('bull_office'),
    highResUrl: generateVintageLineArtSvg('bull_office'),
    palette: ['#F7F2E8', '#57412A', '#000000', '#1E293B'],
    featured: true,
    isOneToOneRatio: true,
  },
  {
    id: 'art-ink-105',
    title: 'THE SLEUTH PANTHER IN VINTAGE TRENCHCOAT',
    description: 'Vintage woodcut halftone engraving of a sleuth black panther detective perched on an old oak branch with carved INKPROWL emblem.',
    category: 'NOIR ANIMAL COMICS',
    tags: ['THE SLEUTH PANTHER IN VINTAGE TRENCHCOAT', 'Panther', 'Woodcut', 'Noir Comic', 'InkProwl'],
    width: 3000,
    height: 3000,
    aspectRatio: 'square',
    format: 'PNG',
    fileSize: '21.0 MB',
    views: 31000,
    downloads: 14200,
    likes: 4250,
    createdAt: '2026-08-01',
    author: 'InkProwl Studio',
    license: 'Free Commercial & Personal Use',
    imageUrl: generateVintageLineArtSvg('panther_tree'),
    highResUrl: generateVintageLineArtSvg('panther_tree'),
    palette: ['#F7F2E8', '#121212', '#000000', '#F59E0B'],
    featured: true,
    isOneToOneRatio: true,
  }
];


export const DEFAULT_AD_SETTINGS = {
  enabled: true,
  mode: 'both' as const,
  adsense: {
    publisherId: 'ca-pub-9876543210123456',
    headerLeaderboardSlot: '7289012345',
    sidebarRectangleSlot: '3002501234',
    downloadBannerSlot: '4686012345',
    inGridNativeSlot: '5001234567',
    autoAdsEnabled: true,
  },
  adsterra: {
    bannerScript: '<script type="text/javascript" src="//www.topcreativeformat.com/728x90/invoke.js"></script>',
    nativeBannerKey: 'adsterra-native-739210',
    socialBarKey: 'adsterra-socialbar-110293',
    directLinkUrl: 'https://www.highrevenuegate.com/direct-download-sponsor',
    popunderScript: '<script type="text/javascript" src="//www.highrevenuegate.com/popunder.js"></script>',
  },
  adFrequencyInGrid: 6,
  downloadCountdownSeconds: 3,
  showAdOnDownload: true,
  openDirectLinkOnDownload: false,
};

