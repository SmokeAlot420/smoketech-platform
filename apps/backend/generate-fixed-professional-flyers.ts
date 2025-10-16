import dotenv from 'dotenv';
dotenv.config();

import sharp from 'sharp';
import * as fs from 'fs/promises';

/**
 * Generate FIXED Professional Landscaping Flyers
 * Middle section only covers HALF width - shows hydrangea image through center
 */

interface FixedFlyerStyle {
  id: number;
  name: string;
  description: string;
  style: (width: number, height: number) => string;
}

const fixedFlyers: FixedFlyerStyle[] = [
  {
    id: 1,
    name: "Classic Nursery - Side Panel",
    description: "Middle content on left side only - hydrangea shows through center/right",
    style: (width, height) => `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <!-- Professional header banner (full width) -->
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

        <!-- LEFT SIDE PANEL ONLY - hydrangea shows through right side -->
        <rect x="40" y="${height * 0.15}" width="${width * 0.45}" height="${height * 0.4}"
              fill="rgba(255,255,255,0.95)" stroke="#2c5234" stroke-width="2"/>
        <rect x="40" y="${height * 0.15}" width="${width * 0.45}" height="50"
              fill="#2c5234"/>
        <text x="${40 + (width * 0.45)/2}" y="${height * 0.15 + 32}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#fff">
          WHY CHOOSE FLORABUNDA?
        </text>

        <text x="80" y="${height * 0.15 + 80}"
              font-family="Arial, sans-serif" font-size="16" fill="#333">
          ✓ Full sun performance
        </text>
        <text x="80" y="${height * 0.15 + 110}"
              font-family="Arial, sans-serif" font-size="16" fill="#333">
          ✓ Uniform, healthy growth
        </text>
        <text x="80" y="${height * 0.15 + 140}"
              font-family="Arial, sans-serif" font-size="16" fill="#333">
          ✓ Residential &amp; landscaping ready
        </text>
        <text x="80" y="${height * 0.15 + 170}"
              font-family="Arial, sans-serif" font-size="16" fill="#333">
          ✓ Fall planting for spring roots
        </text>
        <text x="80" y="${height * 0.15 + 200}"
              font-family="Arial, sans-serif" font-size="16" fill="#333">
          ✓ Local quality guarantee
        </text>

        <!-- Pricing section (full width) -->
        <rect x="40" y="${height * 0.6}" width="${width - 80}" height="120"
              fill="rgba(74,124,89,0.95)"/>
        <text x="${width/2}" y="${height * 0.6 + 30}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#fff">
          COMPETITIVE PRICING
        </text>
        <text x="${width/2}" y="${height * 0.6 + 60}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="20" font-weight="600" fill="#fff">
          🌿 16" Deco containers — $50.00 each
        </text>
        <text x="${width/2}" y="${height * 0.6 + 90}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="20" font-weight="600" fill="#fff">
          🌿 3-gallon assortment — $27.50 each
        </text>

        <!-- Contact footer (full width) -->
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
    name: "Modern - Right Side Panel",
    description: "Middle content on right side only - hydrangea shows through center/left",
    style: (width, height) => `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <!-- Modern header with angled design (full width) -->
        <polygon points="0,0 ${width},0 ${width},120 0,160"
                fill="rgba(44,82,52,0.9)"/>
        <text x="60" y="50"
              font-family="Arial, sans-serif" font-size="32" font-weight="900" fill="#fff">
          LANDSCAPE-GRADE
        </text>
        <text x="60" y="85"
              font-family="Arial, sans-serif" font-size="32" font-weight="900" fill="#fff">
          HYDRANGEAS
        </text>
        <text x="60" y="115"
              font-family="Arial, sans-serif" font-size="16" fill="#a8d5a8">
          FULL SUN GROWN • READY FOR LANDSCAPES
        </text>

        <!-- RIGHT SIDE PANEL ONLY - hydrangea shows through left side -->
        <rect x="${width * 0.5}" y="${height * 0.2}" width="${width * 0.45}" height="${height * 0.45}"
              fill="rgba(255,255,255,0.92)" rx="8" stroke="#4a7c59" stroke-width="1"/>

        <!-- Feature title bar -->
        <rect x="${width * 0.5}" y="${height * 0.2}" width="${width * 0.45}" height="60"
              fill="#4a7c59" rx="8 8 0 0"/>
        <text x="${width * 0.5 + (width * 0.45)/2}" y="${height * 0.2 + 38}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#fff">
          QUALITY ADVANTAGES
        </text>

        <!-- Feature list with icons -->
        <text x="${width * 0.5 + 30}" y="${height * 0.2 + 90}"
              font-family="Arial, sans-serif" font-size="14" fill="#2c5234">
          🌞 Full sun performance
        </text>
        <text x="${width * 0.5 + 30}" y="${height * 0.2 + 120}"
              font-family="Arial, sans-serif" font-size="14" fill="#2c5234">
          📏 Uniform growth patterns
        </text>
        <text x="${width * 0.5 + 30}" y="${height * 0.2 + 150}"
              font-family="Arial, sans-serif" font-size="14" fill="#2c5234">
          🏠 Landscape ready
        </text>
        <text x="${width * 0.5 + 30}" y="${height * 0.2 + 180}"
              font-family="Arial, sans-serif" font-size="14" fill="#2c5234">
          🍂 Fall planting optimal
        </text>
        <text x="${width * 0.5 + 30}" y="${height * 0.2 + 210}"
              font-family="Arial, sans-serif" font-size="14" fill="#2c5234">
          ✅ Local quality guaranteed
        </text>

        <!-- Pricing callout box (full width) -->
        <rect x="60" y="${height * 0.72}" width="${width - 120}" height="100"
              fill="#2c5234" rx="8"/>
        <text x="${width/2}" y="${height * 0.72 + 25}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#fff">
          PRICING INFORMATION
        </text>
        <text x="${width/2}" y="${height * 0.72 + 50}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="18" fill="#a8d5a8">
          16" Decorative Containers — $50.00 each
        </text>
        <text x="${width/2}" y="${height * 0.72 + 75}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="18" fill="#a8d5a8">
          3-gallon Assortment — $27.50 each
        </text>

        <!-- Contact strip (full width) -->
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
    name: "Premium - Minimal Overlay",
    description: "Transparent overlay with minimal coverage - maximum hydrangea visibility",
    style: (width, height) => `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="premiumGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#2c5234;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#4a7c59;stop-opacity:1" />
          </linearGradient>
        </defs>

        <!-- Elegant header with gradient (full width) -->
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

        <!-- MINIMAL LEFT CORNER - tiny features box -->
        <rect x="40" y="${height * 0.25}" width="${width * 0.35}" height="${height * 0.3}"
              fill="rgba(255,255,255,0.85)" rx="12" stroke="#2c5234" stroke-width="1"/>

        <text x="60" y="${height * 0.25 + 30}"
              font-family="Georgia, serif" font-size="16" font-weight="bold" fill="#2c5234">
          Premium Features:
        </text>

        <text x="60" y="${height * 0.25 + 60}"
              font-family="Georgia, serif" font-size="14" fill="#333">
          • Full sun cultivated
        </text>
        <text x="60" y="${height * 0.25 + 85}"
              font-family="Georgia, serif" font-size="14" fill="#333">
          • Uniform growth
        </text>
        <text x="60" y="${height * 0.25 + 110}"
              font-family="Georgia, serif" font-size="14" fill="#333">
          • Landscape ready
        </text>
        <text x="60" y="${height * 0.25 + 135}"
              font-family="Georgia, serif" font-size="14" fill="#333">
          • Fall planting optimal
        </text>
        <text x="60" y="${height * 0.25 + 160}"
              font-family="Georgia, serif" font-size="14" fill="#333">
          • Local quality guaranteed
        </text>

        <!-- Minimal pricing strip -->
        <rect x="40" y="${height * 0.75}" width="${width - 80}" height="80"
              fill="rgba(44,82,52,0.9)" rx="8"/>
        <text x="${width/2}" y="${height * 0.75 + 25}" text-anchor="middle"
              font-family="Georgia, serif" font-size="16" font-weight="bold" fill="#fff">
          16" Containers $50.00 • 3-gallon $27.50
        </text>
        <text x="${width/2}" y="${height * 0.75 + 55}" text-anchor="middle"
              font-family="Georgia, serif" font-size="14" fill="rgba(255,255,255,0.9)">
          Escondido, CA • (760) 420-2273 • Francisco@florabundanursery.com
        </text>
      </svg>
    `
  }
];

async function generateFixedProfessionalFlyers() {
  console.log('🌿 Generating FIXED Professional Landscaping Flyers...\n');
  console.log('📋 Middle sections only cover HALF width - hydrangea shows through!\n');

  try {
    // Use YOUR actual image as background
    const imagePath = 'E:\\v2 repo\\viral\\logo\\hydrangea-nursery.jpeg';
    const imageBuffer = await fs.readFile(imagePath);
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const width = metadata.width || 1024;
    const height = metadata.height || 1024;

    console.log(`📸 Using your hydrangea image: ${imagePath} (${width}x${height})\n`);

    // Generate each FIXED flyer
    for (let i = 0; i < fixedFlyers.length; i++) {
      const flyer = fixedFlyers[i];
      console.log(`🏢 Generating ${flyer.id}/3: ${flyer.name}`);
      console.log(`📝 ${flyer.description}\n`);

      // Create FIXED SVG overlay
      const svgOverlay = flyer.style(width, height);
      const textOverlay = Buffer.from(svgOverlay);

      // Composite the FIXED text over your image
      const finalImage = await image
        .composite([{ input: textOverlay, top: 0, left: 0 }])
        .jpeg({ quality: 95 })
        .toBuffer();

      // Save the FIXED flyer
      const outputPath = `hydrangea_FIXED_${flyer.id.toString().padStart(2, '0')}_${flyer.name.toLowerCase().replace(/\s+/g, '_')}.jpg`;
      await fs.writeFile(outputPath, finalImage);

      console.log(`✅ Generated: ${outputPath}\n`);
    }

    console.log('🏢 SUCCESS! All 3 FIXED professional flyers created!');
    console.log(`📊 Final resolution: ${width}x${height}`);
    console.log('📁 Files saved in current directory');
    console.log('🎯 Middle sections now only cover HALF width - hydrangea visible!');

  } catch (error) {
    console.error('❌ Failed:', error);
    throw error;
  }
}

// Run it
generateFixedProfessionalFlyers()
  .then(() => console.log('🌿 FIXED professional flyers ready!'))
  .catch(error => console.error('💥 Error:', error.message));