import dotenv from 'dotenv';
dotenv.config();

import sharp from 'sharp';
import * as fs from 'fs/promises';

/**
 * Generate PROFESSIONAL Landscaping Business Flyers
 * Based on real nursery/landscaping business marketing patterns
 * Uses YOUR actual image and YOUR specific text
 */

interface ProfessionalFlyerStyle {
  id: number;
  name: string;
  description: string;
  style: (width: number, height: number) => string;
}

const professionalFlyers: ProfessionalFlyerStyle[] = [
  {
    id: 1,
    name: "Classic Nursery Professional",
    description: "Traditional nursery business layout with clean sections",
    style: (width, height) => `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <!-- Professional header banner -->
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

        <!-- Why Choose Us section -->
        <rect x="40" y="${height * 0.15}" width="${width - 80}" height="${height * 0.4}"
              fill="rgba(255,255,255,0.95)" stroke="#2c5234" stroke-width="2"/>
        <rect x="40" y="${height * 0.15}" width="${width - 80}" height="50"
              fill="#2c5234"/>
        <text x="${width/2}" y="${height * 0.15 + 32}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="22" font-weight="bold" fill="#fff">
          WHY CHOOSE FLORABUNDA HYDRANGEAS?
        </text>

        <text x="80" y="${height * 0.15 + 80}"
              font-family="Arial, sans-serif" font-size="18" fill="#333">
          ✓ Grown tough in full sun for strong performance
        </text>
        <text x="80" y="${height * 0.15 + 110}"
              font-family="Arial, sans-serif" font-size="18" fill="#333">
          ✓ Uniform, healthy growth
        </text>
        <text x="80" y="${height * 0.15 + 140}"
              font-family="Arial, sans-serif" font-size="18" fill="#333">
          ✓ Ideal for residential &amp; landscaping projects
        </text>
        <text x="80" y="${height * 0.15 + 170}"
              font-family="Arial, sans-serif" font-size="18" fill="#333">
          ✓ Perfect to plant in the fall so roots establish for spring
        </text>
        <text x="80" y="${height * 0.15 + 200}"
              font-family="Arial, sans-serif" font-size="18" fill="#333">
          ✓ Locally grown quality and consistency
        </text>

        <!-- Pricing section -->
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

        <!-- Contact footer -->
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
    name: "Modern Landscaping Business",
    description: "Contemporary professional landscaping company design",
    style: (width, height) => `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <!-- Modern header with angled design -->
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

        <!-- Professional features panel -->
        <rect x="50" y="${height * 0.2}" width="${width - 100}" height="${height * 0.45}"
              fill="rgba(255,255,255,0.92)" rx="8" stroke="#4a7c59" stroke-width="1"/>

        <!-- Feature title bar -->
        <rect x="50" y="${height * 0.2}" width="${width - 100}" height="60"
              fill="#4a7c59" rx="8 8 0 0"/>
        <text x="${width/2}" y="${height * 0.2 + 38}" text-anchor="middle"
              font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#fff">
          PROFESSIONAL QUALITY ADVANTAGES
        </text>

        <!-- Feature list with icons -->
        <text x="90" y="${height * 0.2 + 90}"
              font-family="Arial, sans-serif" font-size="17" fill="#2c5234">
          🌞 FULL SUN PERFORMANCE: Grown tough for strong performance
        </text>
        <text x="90" y="${height * 0.2 + 120}"
              font-family="Arial, sans-serif" font-size="17" fill="#2c5234">
          📏 UNIFORM GROWTH: Consistent, healthy development patterns
        </text>
        <text x="90" y="${height * 0.2 + 150}"
              font-family="Arial, sans-serif" font-size="17" fill="#2c5234">
          🏠 LANDSCAPE READY: Ideal for residential &amp; commercial projects
        </text>
        <text x="90" y="${height * 0.2 + 180}"
              font-family="Arial, sans-serif" font-size="17" fill="#2c5234">
          🍂 FALL PLANTING: Perfect timing for spring root establishment
        </text>
        <text x="90" y="${height * 0.2 + 210}"
              font-family="Arial, sans-serif" font-size="17" fill="#2c5234">
          ✅ LOCAL QUALITY: Grown locally with guaranteed consistency
        </text>

        <!-- Pricing callout box -->
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

        <!-- Contact strip -->
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
    name: "Premium Nursery Brochure",
    description: "High-end nursery brochure style with elegant layout",
    style: (width, height) => `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="premiumGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#2c5234;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#4a7c59;stop-opacity:1" />
          </linearGradient>
        </defs>

        <!-- Elegant header with gradient -->
        <rect x="0" y="0" width="${width}" height="200"
              fill="url(#premiumGreen)"/>
        <rect x="60" y="40" width="${width - 120}" height="120"
              fill="rgba(255,255,255,0.15)" rx="10" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>

        <text x="${width/2}" y="80" text-anchor="middle"
              font-family="Georgia, serif" font-size="38" font-weight="bold" fill="#fff">
          FLORABUNDA NURSERY
        </text>
        <text x="${width/2}" y="110" text-anchor="middle"
              font-family="Georgia, serif" font-size="24" font-style="italic" fill="#fff">
          Landscape-Grade Hydrangeas
        </text>
        <text x="${width/2}" y="135" text-anchor="middle"
              font-family="Georgia, serif" font-size="16" fill="rgba(255,255,255,0.9)">
          Premium Quality • Full Sun Grown • Landscape Ready
        </text>

        <!-- Premium content area -->
        <rect x="40" y="240" width="${width - 80}" height="${height * 0.5}"
              fill="rgba(255,255,255,0.95)" rx="12" stroke="#2c5234" stroke-width="1"/>

        <!-- Elegant section divider -->
        <rect x="60" y="260" width="${width - 120}" height="3" fill="#2c5234"/>
        <text x="${width/2}" y="290" text-anchor="middle"
              font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#2c5234">
          Premium Quality Features
        </text>

        <!-- Feature list with elegant styling -->
        <text x="80" y="330"
              font-family="Georgia, serif" font-size="18" fill="#333">
          • Cultivated in full sun conditions for superior resilience
        </text>
        <text x="80" y="360"
              font-family="Georgia, serif" font-size="18" fill="#333">
          • Meticulously maintained for uniform, healthy growth
        </text>
        <text x="80" y="390"
              font-family="Georgia, serif" font-size="18" fill="#333">
          • Expertly suited for residential and landscaping applications
        </text>
        <text x="80" y="420"
              font-family="Georgia, serif" font-size="18" fill="#333">
          • Optimal fall planting schedule for spring establishment
        </text>
        <text x="80" y="450"
              font-family="Georgia, serif" font-size="18" fill="#333">
          • Locally sourced with guaranteed quality standards
        </text>

        <!-- Premium pricing section -->
        <rect x="40" y="${height * 0.78}" width="${width - 80}" height="140"
              fill="rgba(44,82,52,0.05)" rx="12" stroke="#2c5234" stroke-width="2"/>
        <text x="${width/2}" y="${height * 0.78 + 30}" text-anchor="middle"
              font-family="Georgia, serif" font-size="22" font-weight="bold" fill="#2c5234">
          INVESTMENT PRICING
        </text>

        <rect x="80" y="${height * 0.78 + 50}" width="${width - 160}" height="70"
              fill="rgba(74,124,89,0.1)" rx="8"/>
        <text x="${width/2}" y="${height * 0.78 + 75}" text-anchor="middle"
              font-family="Georgia, serif" font-size="20" font-weight="600" fill="#2c5234">
          16" Premium Decorative Containers — $50.00
        </text>
        <text x="${width/2}" y="${height * 0.78 + 100}" text-anchor="middle"
              font-family="Georgia, serif" font-size="20" font-weight="600" fill="#2c5234">
          3-gallon Professional Assortment — $27.50
        </text>

        <!-- Professional contact footer -->
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

async function generateProfessionalLandscapingFlyers() {
  console.log('🌿 Generating PROFESSIONAL Landscaping Business Flyers...\n');
  console.log('📋 Using YOUR actual image and YOUR specific text\n');
  console.log('🎯 Professional business marketing layouts\n');

  try {
    // Use YOUR actual image as background
    const imagePath = 'E:\\v2 repo\\viral\\logo\\hydrangea-nursery.jpeg';
    const imageBuffer = await fs.readFile(imagePath);
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    const width = metadata.width || 1024;
    const height = metadata.height || 1024;

    console.log(`📸 Using your hydrangea image: ${imagePath} (${width}x${height})\n`);

    // Generate each professional flyer
    for (let i = 0; i < professionalFlyers.length; i++) {
      const flyer = professionalFlyers[i];
      console.log(`🏢 Generating ${flyer.id}/3: ${flyer.name}`);
      console.log(`📝 ${flyer.description}\n`);

      // Create professional SVG overlay
      const svgOverlay = flyer.style(width, height);
      const textOverlay = Buffer.from(svgOverlay);

      // Composite the professional text over your image
      const finalImage = await image
        .composite([{ input: textOverlay, top: 0, left: 0 }])
        .jpeg({ quality: 95 })
        .toBuffer();

      // Save the professional flyer
      const outputPath = `hydrangea_PROFESSIONAL_${flyer.id.toString().padStart(2, '0')}_${flyer.name.toLowerCase().replace(/\s+/g, '_')}.jpg`;
      await fs.writeFile(outputPath, finalImage);

      console.log(`✅ Generated: ${outputPath}\n`);
    }

    console.log('🏢 SUCCESS! All 3 professional landscaping business flyers created!');
    console.log(`📊 Final resolution: ${width}x${height}`);
    console.log('📁 Files saved in current directory');
    console.log('🎯 Professional business marketing quality!');

  } catch (error) {
    console.error('❌ Failed:', error);
    throw error;
  }
}

// Run it
generateProfessionalLandscapingFlyers()
  .then(() => console.log('🌿 Professional flyers ready!'))
  .catch(error => console.error('💥 Error:', error.message));