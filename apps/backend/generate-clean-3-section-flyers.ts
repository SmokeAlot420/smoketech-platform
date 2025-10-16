import dotenv from 'dotenv';
dotenv.config();

import sharp from 'sharp';
import * as fs from 'fs/promises';

/**
 * Generate CLEAN 3-Section Professional Flyers
 * Top header + Left panel (features + pricing) + Footer
 * Hydrangea image shows through center/right
 */

interface Clean3SectionStyle {
  id: number;
  name: string;
  description: string;
  style: (width: number, height: number) => string;
}

const clean3Sections: Clean3SectionStyle[] = [
  {
    id: 1,
    name: "Classic 3-Section",
    description: "Clean top + left panel + footer layout",
    style: (width, height) => `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <!-- TOP HEADER (full width) -->
        <rect x="0" y="0" width="${width}" height="140"
              fill="rgba(44,82,52,0.95)"/>
        <text x="${width/2}" y="50" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#fff">
          FLORABUNDA NURSERY
        </text>
        <text x="${width/2}" y="80" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="24" font-weight="600" fill="#a8d5a8">
          LANDSCAPE-GRADE HYDRANGEAS
        </text>
        <text x="${width/2}" y="110" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="16" fill="#fff">
          Full Sun Grown • Ready for Landscapes
        </text>

        <!-- LEFT PANEL (features + pricing) -->
        <rect x="40" y="180" width="${width * 0.45}" height="${height - 280}"
              fill="rgba(255,255,255,0.95)" stroke="#2c5234" stroke-width="2"/>

        <!-- Why Choose section -->
        <rect x="40" y="180" width="${width * 0.45}" height="50"
              fill="#2c5234"/>
        <text x="${40 + (width * 0.45)/2}" y="210" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#fff">
          WHY CHOOSE FLORABUNDA HYDRANGEAS?
        </text>

        <text x="70" y="250"
              font-family="Arial, sans-serif" font-size="16" fill="#333">
          ✓ Grown tough in full sun for strong performance
        </text>
        <text x="70" y="280"
              font-family="Arial, sans-serif" font-size="16" fill="#333">
          ✓ Uniform, healthy growth
        </text>
        <text x="70" y="310"
              font-family="Arial, sans-serif" font-size="16" fill="#333">
          ✓ Ideal for residential &amp; landscaping projects
        </text>
        <text x="70" y="340"
              font-family="Arial, sans-serif" font-size="16" fill="#333">
          ✓ Perfect to plant in fall for spring establishment
        </text>
        <text x="70" y="370"
              font-family="Arial, sans-serif" font-size="16" fill="#333">
          ✓ Locally grown quality and consistency
        </text>

        <!-- Pricing section within left panel -->
        <rect x="60" y="420" width="${width * 0.45 - 40}" height="80"
              fill="#4a7c59"/>
        <text x="${60 + (width * 0.45 - 40)/2}" y="445" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#fff">
          PRICING
        </text>
        <text x="${60 + (width * 0.45 - 40)/2}" y="470" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="16" fill="#fff">
          🌿 16" Deco containers — $50.00 each
        </text>
        <text x="${60 + (width * 0.45 - 40)/2}" y="490" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="16" fill="#fff">
          🌿 3-gallon assortment — $27.50 each
        </text>

        <!-- FOOTER (full width, touching bottom) -->
        <rect x="0" y="${height - 100}" width="${width}" height="100"
              fill="#2c5234"/>
        <text x="${width/2}" y="${height - 70}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#fff">
          📍 Escondido, CA
        </text>
        <text x="${width/2}" y="${height - 40}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="18" fill="#a8d5a8">
          📞 (760) 420-2273 • ✉️ Francisco@florabundanursery.com
        </text>
      </svg>
    `
  },
  {
    id: 2,
    name: "Modern 3-Section",
    description: "Modern styling with angled header",
    style: (width, height) => `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <!-- TOP HEADER with modern angle -->
        <polygon points="0,0 ${width},0 ${width},120 0,160"
                fill="rgba(44,82,52,0.9)"/>
        <text x="60" y="50"
              font-family="Arial, sans-serif" font-size="32" font-weight="900" fill="#fff">
          LANDSCAPE-GRADE HYDRANGEAS
        </text>
        <text x="60" y="85"
              font-family="Arial, sans-serif" font-size="20" fill="#a8d5a8">
          FLORABUNDA NURSERY
        </text>
        <text x="60" y="115"
              font-family="Arial, sans-serif" font-size="16" fill="#a8d5a8">
          Full Sun Grown • Ready for Landscapes
        </text>

        <!-- LEFT PANEL (modern styling) -->
        <rect x="50" y="200" width="${width * 0.4}" height="${height - 300}"
              fill="rgba(255,255,255,0.92)" rx="8" stroke="#4a7c59" stroke-width="1"/>

        <!-- Features section -->
        <rect x="50" y="200" width="${width * 0.4}" height="60"
              fill="#4a7c59" rx="8 8 0 0"/>
        <text x="${50 + (width * 0.4)/2}" y="235" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#fff">
          PROFESSIONAL QUALITY ADVANTAGES
        </text>

        <text x="80" y="280"
              font-family="Arial, sans-serif" font-size="15" fill="#2c5234">
          🌞 FULL SUN PERFORMANCE: Grown tough for strength
        </text>
        <text x="80" y="310"
              font-family="Arial, sans-serif" font-size="15" fill="#2c5234">
          📏 UNIFORM GROWTH: Consistent development
        </text>
        <text x="80" y="340"
              font-family="Arial, sans-serif" font-size="15" fill="#2c5234">
          🏠 LANDSCAPE READY: Residential &amp; commercial
        </text>
        <text x="80" y="370"
              font-family="Arial, sans-serif" font-size="15" fill="#2c5234">
          🍂 FALL PLANTING: Perfect spring establishment
        </text>
        <text x="80" y="400"
              font-family="Arial, sans-serif" font-size="15" fill="#2c5234">
          ✅ LOCAL QUALITY: Guaranteed consistency
        </text>

        <!-- Pricing callout within panel -->
        <rect x="70" y="440" width="${width * 0.4 - 40}" height="90"
              fill="#2c5234" rx="8"/>
        <text x="${70 + (width * 0.4 - 40)/2}" y="465" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#fff">
          PRICING INFORMATION
        </text>
        <text x="${70 + (width * 0.4 - 40)/2}" y="490" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="14" fill="#a8d5a8">
          16" Decorative Containers — $50.00
        </text>
        <text x="${70 + (width * 0.4 - 40)/2}" y="510" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="14" fill="#a8d5a8">
          3-gallon Assortment — $27.50
        </text>

        <!-- FOOTER (touching bottom) -->
        <rect x="0" y="${height - 80}" width="${width}" height="80"
              fill="rgba(74,124,89,0.95)"/>
        <text x="${width/2}" y="${height - 50}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="18" font-weight="600" fill="#fff">
          FLORABUNDA NURSERY • Escondido, CA
        </text>
        <text x="${width/2}" y="${height - 25}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="16" fill="#fff">
          (760) 420-2273 • Francisco@florabundanursery.com
        </text>
      </svg>
    `
  },
  {
    id: 3,
    name: "Premium 3-Section",
    description: "Elegant premium styling with gradient header",
    style: (width, height) => `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="premiumGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#2c5234;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#4a7c59;stop-opacity:1" />
          </linearGradient>
        </defs>

        <!-- TOP HEADER (elegant gradient) -->
        <rect x="0" y="0" width="${width}" height="180"
              fill="url(#premiumGreen)"/>
        <rect x="60" y="30" width="${width - 120}" height="120"
              fill="rgba(255,255,255,0.15)" rx="10" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>

        <text x="${width/2}" y="70" text-anchor="middle"
              font-family="Georgia, serif" font-size="32" font-weight="bold" fill="#fff">
          FLORABUNDA NURSERY
        </text>
        <text x="${width/2}" y="100" text-anchor="middle"
              font-family="Georgia, serif" font-size="20" font-style="italic" fill="#fff">
          Landscape-Grade Hydrangeas
        </text>
        <text x="${width/2}" y="125" text-anchor="middle"
              font-family="Georgia, serif" font-size="14" fill="rgba(255,255,255,0.9)">
          Premium Quality • Full Sun Grown • Landscape Ready
        </text>

        <!-- LEFT PANEL (premium styling) -->
        <rect x="40" y="220" width="${width * 0.42}" height="${height - 320}"
              fill="rgba(255,255,255,0.88)" rx="12" stroke="#2c5234" stroke-width="1"/>

        <text x="70" y="260"
              font-family="Georgia, serif" font-size="18" font-weight="bold" fill="#2c5234">
          Premium Quality Features
        </text>

        <text x="70" y="300"
              font-family="Georgia, serif" font-size="16" fill="#333">
          • Cultivated in full sun for superior resilience
        </text>
        <text x="70" y="330"
              font-family="Georgia, serif" font-size="16" fill="#333">
          • Meticulously maintained for uniform growth
        </text>
        <text x="70" y="360"
              font-family="Georgia, serif" font-size="16" fill="#333">
          • Expertly suited for landscaping applications
        </text>
        <text x="70" y="390"
              font-family="Georgia, serif" font-size="16" fill="#333">
          • Optimal fall planting for spring establishment
        </text>
        <text x="70" y="420"
              font-family="Georgia, serif" font-size="16" fill="#333">
          • Locally sourced with quality guarantee
        </text>

        <!-- Premium pricing section -->
        <rect x="60" y="460" width="${width * 0.42 - 40}" height="100"
              fill="rgba(44,82,52,0.1)" rx="8" stroke="#2c5234" stroke-width="2"/>
        <text x="${60 + (width * 0.42 - 40)/2}" y="485" text-anchor="middle"
              font-family="Georgia, serif" font-size="16" font-weight="bold" fill="#2c5234">
          INVESTMENT PRICING
        </text>
        <text x="${60 + (width * 0.42 - 40)/2}" y="510" text-anchor="middle"
              font-family="Georgia, serif" font-size="15" fill="#2c5234">
          16" Premium Containers — $50.00
        </text>
        <text x="${60 + (width * 0.42 - 40)/2}" y="535" text-anchor="middle"
              font-family="Georgia, serif" font-size="15" fill="#2c5234">
          3-gallon Professional — $27.50
        </text>

        <!-- FOOTER (premium contact) -->
        <rect x="0" y="${height - 90}" width="${width}" height="90"
              fill="url(#premiumGreen)"/>
        <text x="${width/2}" y="${height - 60}" text-anchor="middle"
              font-family="Georgia, serif" font-size="20" font-weight="600" fill="#fff">
          FLORABUNDA NURSERY
        </text>
        <text x="${width/2}" y="${height - 35}" text-anchor="middle"
              font-family="Georgia, serif" font-size="16" fill="rgba(255,255,255,0.9)">
          Escondido, California
        </text>
        <text x="${width/2}" y="${height - 10}" text-anchor="middle"
              font-family="Georgia, serif" font-size="16" fill="rgba(255,255,255,0.9)">
          (760) 420-2273 • Francisco@florabundanursery.com
        </text>
      </svg>
    `
  }
];

async function generateClean3SectionFlyers() {
  console.log('🌿 Generating CLEAN 3-Section Professional Flyers...\n');
  console.log('📋 Simple layout: Top + Left panel + Footer\n');
  console.log('🎯 Hydrangea image shows through center/right!\n');

  try {
    // Use YOUR actual image as background
    const imagePath = 'E:\\v2 repo\\viral\\logo\\hydrangea-nursery.jpeg';
    const imageBuffer = await fs.readFile(imagePath);
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const width = metadata.width || 1024;
    const height = metadata.height || 1024;

    console.log(`📸 Using your hydrangea image: ${imagePath} (${width}x${height})\n`);

    // Generate each CLEAN 3-section flyer
    for (let i = 0; i < clean3Sections.length; i++) {
      const flyer = clean3Sections[i];
      console.log(`🏢 Generating ${flyer.id}/3: ${flyer.name}`);
      console.log(`📝 ${flyer.description}\n`);

      // Create CLEAN SVG overlay
      const svgOverlay = flyer.style(width, height);
      const textOverlay = Buffer.from(svgOverlay);

      // Composite the CLEAN text over your image
      const finalImage = await image
        .composite([{ input: textOverlay, top: 0, left: 0 }])
        .jpeg({ quality: 95 })
        .toBuffer();

      // Save the CLEAN flyer
      const outputPath = `hydrangea_CLEAN_${flyer.id.toString().padStart(2, '0')}_${flyer.name.toLowerCase().replace(/\s+/g, '_')}.jpg`;
      await fs.writeFile(outputPath, finalImage);

      console.log(`✅ Generated: ${outputPath}\n`);
    }

    console.log('🏢 SUCCESS! All 3 CLEAN 3-section flyers created!');
    console.log(`📊 Final resolution: ${width}x${height}`);
    console.log('📁 Files saved in current directory');
    console.log('🎯 Simple & clean: Top + Left panel + Footer!');

  } catch (error) {
    console.error('❌ Failed:', error);
    throw error;
  }
}

// Run it
generateClean3SectionFlyers()
  .then(() => console.log('🌿 CLEAN 3-section flyers ready!'))
  .catch(error => console.error('💥 Error:', error.message));