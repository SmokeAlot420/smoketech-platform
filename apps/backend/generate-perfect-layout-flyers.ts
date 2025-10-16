import dotenv from 'dotenv';
dotenv.config();

import sharp from 'sharp';
import * as fs from 'fs/promises';

/**
 * Generate PERFECT Layout Professional Flyers
 * Top + LEFT side panel + RIGHT side panel + Footer touching bottom
 */

interface PerfectLayoutStyle {
  id: number;
  name: string;
  description: string;
  style: (width: number, height: number) => string;
}

const perfectLayouts: PerfectLayoutStyle[] = [
  {
    id: 1,
    name: "Classic Dual Panels",
    description: "Left and right side panels with footer touching bottom",
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

        <!-- LEFT SIDE PANEL -->
        <rect x="40" y="${height * 0.15}" width="${width * 0.35}" height="${height * 0.5}"
              fill="rgba(255,255,255,0.95)" stroke="#2c5234" stroke-width="2"/>
        <rect x="40" y="${height * 0.15}" width="${width * 0.35}" height="50"
              fill="#2c5234"/>
        <text x="${40 + (width * 0.35)/2}" y="${height * 0.15 + 32}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#fff">
          WHY CHOOSE US?
        </text>

        <text x="60" y="${height * 0.15 + 80}"
              font-family="Arial, sans-serif" font-size="15" fill="#333">
          ✓ Full sun performance
        </text>
        <text x="60" y="${height * 0.15 + 110}"
              font-family="Arial, sans-serif" font-size="15" fill="#333">
          ✓ Uniform growth
        </text>
        <text x="60" y="${height * 0.15 + 140}"
              font-family="Arial, sans-serif" font-size="15" fill="#333">
          ✓ Landscape ready
        </text>
        <text x="60" y="${height * 0.15 + 170}"
              font-family="Arial, sans-serif" font-size="15" fill="#333">
          ✓ Fall planting optimal
        </text>
        <text x="60" y="${height * 0.15 + 200}"
              font-family="Arial, sans-serif" font-size="15" fill="#333">
          ✓ Local quality
        </text>

        <!-- RIGHT SIDE PANEL -->
        <rect x="${width * 0.6}" y="${height * 0.15}" width="${width * 0.35}" height="${height * 0.5}"
              fill="rgba(255,255,255,0.95)" stroke="#4a7c59" stroke-width="2"/>
        <rect x="${width * 0.6}" y="${height * 0.15}" width="${width * 0.35}" height="50"
              fill="#4a7c59"/>
        <text x="${width * 0.6 + (width * 0.35)/2}" y="${height * 0.15 + 32}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#fff">
          PRICING INFO
        </text>

        <text x="${width * 0.6 + 20}" y="${height * 0.15 + 90}"
              font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#2c5234">
          🌿 16" Containers
        </text>
        <text x="${width * 0.6 + 20}" y="${height * 0.15 + 120}"
              font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#4a7c59">
          $50.00 each
        </text>

        <text x="${width * 0.6 + 20}" y="${height * 0.15 + 170}"
              font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#2c5234">
          🌿 3-gallon
        </text>
        <text x="${width * 0.6 + 20}" y="${height * 0.15 + 200}"
              font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#4a7c59">
          $27.50 each
        </text>

        <!-- Contact footer - TOUCHES BOTTOM -->
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
    name: "Modern Dual Panels",
    description: "Sleek left and right panels with modern styling",
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

        <!-- LEFT SIDE PANEL -->
        <rect x="50" y="${height * 0.2}" width="${width * 0.3}" height="${height * 0.5}"
              fill="rgba(255,255,255,0.92)" rx="8" stroke="#4a7c59" stroke-width="1"/>
        <rect x="50" y="${height * 0.2}" width="${width * 0.3}" height="60"
              fill="#4a7c59" rx="8 8 0 0"/>
        <text x="${50 + (width * 0.3)/2}" y="${height * 0.2 + 38}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#fff">
          QUALITY FEATURES
        </text>

        <text x="70" y="${height * 0.2 + 90}"
              font-family="Arial, sans-serif" font-size="13" fill="#2c5234">
          🌞 Full sun grown
        </text>
        <text x="70" y="${height * 0.2 + 120}"
              font-family="Arial, sans-serif" font-size="13" fill="#2c5234">
          📏 Uniform growth
        </text>
        <text x="70" y="${height * 0.2 + 150}"
              font-family="Arial, sans-serif" font-size="13" fill="#2c5234">
          🏠 Landscape ready
        </text>
        <text x="70" y="${height * 0.2 + 180}"
              font-family="Arial, sans-serif" font-size="13" fill="#2c5234">
          🍂 Fall planting
        </text>
        <text x="70" y="${height * 0.2 + 210}"
              font-family="Arial, sans-serif" font-size="13" fill="#2c5234">
          ✅ Local quality
        </text>

        <!-- RIGHT SIDE PANEL -->
        <rect x="${width * 0.65}" y="${height * 0.2}" width="${width * 0.3}" height="${height * 0.5}"
              fill="rgba(255,255,255,0.92)" rx="8" stroke="#2c5234" stroke-width="1"/>
        <rect x="${width * 0.65}" y="${height * 0.2}" width="${width * 0.3}" height="60"
              fill="#2c5234" rx="8 8 0 0"/>
        <text x="${width * 0.65 + (width * 0.3)/2}" y="${height * 0.2 + 38}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#fff">
          PRICING
        </text>

        <text x="${width * 0.65 + 20}" y="${height * 0.2 + 100}"
              font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#2c5234">
          16" Decorative
        </text>
        <text x="${width * 0.65 + 20}" y="${height * 0.2 + 125}"
              font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#4a7c59">
          $50.00
        </text>

        <text x="${width * 0.65 + 20}" y="${height * 0.2 + 170}"
              font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#2c5234">
          3-gallon
        </text>
        <text x="${width * 0.65 + 20}" y="${height * 0.2 + 195}"
              font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#4a7c59">
          $27.50
        </text>

        <!-- Contact strip - TOUCHES BOTTOM -->
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
    name: "Premium Dual Panels",
    description: "Elegant left and right panels with premium styling",
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

        <!-- LEFT SIDE PANEL -->
        <rect x="40" y="${height * 0.22}" width="${width * 0.32}" height="${height * 0.48}"
              fill="rgba(255,255,255,0.85)" rx="12" stroke="#2c5234" stroke-width="1"/>

        <text x="60" y="${height * 0.22 + 30}"
              font-family="Georgia, serif" font-size="16" font-weight="bold" fill="#2c5234">
          Premium Features:
        </text>

        <text x="60" y="${height * 0.22 + 60}"
              font-family="Georgia, serif" font-size="14" fill="#333">
          • Full sun cultivated
        </text>
        <text x="60" y="${height * 0.22 + 85}"
              font-family="Georgia, serif" font-size="14" fill="#333">
          • Uniform growth patterns
        </text>
        <text x="60" y="${height * 0.22 + 110}"
              font-family="Georgia, serif" font-size="14" fill="#333">
          • Landscape ready plants
        </text>
        <text x="60" y="${height * 0.22 + 135}"
              font-family="Georgia, serif" font-size="14" fill="#333">
          • Fall planting optimal
        </text>
        <text x="60" y="${height * 0.22 + 160}"
              font-family="Georgia, serif" font-size="14" fill="#333">
          • Local quality guaranteed
        </text>

        <!-- RIGHT SIDE PANEL -->
        <rect x="${width * 0.64}" y="${height * 0.22}" width="${width * 0.32}" height="${height * 0.48}"
              fill="rgba(255,255,255,0.85)" rx="12" stroke="#4a7c59" stroke-width="1"/>

        <text x="${width * 0.64 + 20}" y="${height * 0.22 + 30}"
              font-family="Georgia, serif" font-size="16" font-weight="bold" fill="#2c5234">
          Investment Pricing:
        </text>

        <text x="${width * 0.64 + 20}" y="${height * 0.22 + 70}"
              font-family="Georgia, serif" font-size="14" fill="#333">
          16" Premium Containers
        </text>
        <text x="${width * 0.64 + 20}" y="${height * 0.22 + 95}"
              font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#4a7c59">
          $50.00 each
        </text>

        <text x="${width * 0.64 + 20}" y="${height * 0.22 + 140}"
              font-family="Georgia, serif" font-size="14" fill="#333">
          3-gallon Professional
        </text>
        <text x="${width * 0.64 + 20}" y="${height * 0.22 + 165}"
              font-family="Georgia, serif" font-size="20" font-weight="bold" fill="#4a7c59">
          $27.50 each
        </text>

        <!-- Professional contact footer - TOUCHES BOTTOM -->
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

async function generatePerfectLayoutFlyers() {
  console.log('🌿 Generating PERFECT Layout Professional Flyers...\n');
  console.log('📋 Top + LEFT panel + RIGHT panel + Footer touching bottom!\n');

  try {
    // Use YOUR actual image as background
    const imagePath = 'E:\\v2 repo\\viral\\logo\\hydrangea-nursery.jpeg';
    const imageBuffer = await fs.readFile(imagePath);
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const width = metadata.width || 1024;
    const height = metadata.height || 1024;

    console.log(`📸 Using your hydrangea image: ${imagePath} (${width}x${height})\n`);

    // Generate each PERFECT layout flyer
    for (let i = 0; i < perfectLayouts.length; i++) {
      const flyer = perfectLayouts[i];
      console.log(`🏢 Generating ${flyer.id}/3: ${flyer.name}`);
      console.log(`📝 ${flyer.description}\n`);

      // Create PERFECT SVG overlay
      const svgOverlay = flyer.style(width, height);
      const textOverlay = Buffer.from(svgOverlay);

      // Composite the PERFECT text over your image
      const finalImage = await image
        .composite([{ input: textOverlay, top: 0, left: 0 }])
        .jpeg({ quality: 95 })
        .toBuffer();

      // Save the PERFECT flyer
      const outputPath = `hydrangea_PERFECT_${flyer.id.toString().padStart(2, '0')}_${flyer.name.toLowerCase().replace(/\s+/g, '_')}.jpg`;
      await fs.writeFile(outputPath, finalImage);

      console.log(`✅ Generated: ${outputPath}\n`);
    }

    console.log('🏢 SUCCESS! All 3 PERFECT layout flyers created!');
    console.log(`📊 Final resolution: ${width}x${height}`);
    console.log('📁 Files saved in current directory');
    console.log('🎯 Perfect layout: Top + LEFT panel + RIGHT panel + Footer touching bottom!');

  } catch (error) {
    console.error('❌ Failed:', error);
    throw error;
  }
}

// Run it
generatePerfectLayoutFlyers()
  .then(() => console.log('🌿 PERFECT layout flyers ready!'))
  .catch(error => console.error('💥 Error:', error.message));