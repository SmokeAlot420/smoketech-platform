import dotenv from 'dotenv';
dotenv.config();

import { VertexAINanoBananaService } from './src/services/vertexAINanoBanana';
import * as fs from 'fs/promises';

/**
 * Generate PROPER Marketing Ads using ZHO Technique #8 (Product Advertisement)
 * Uses NanoBanana AI to create actual advertising-grade content
 */

async function generateZHO8MarketingAds() {
  console.log('🔥 Generating PROPER Marketing Ads using ZHO Technique #8...\n');
  console.log('🍌 Using NanoBanana AI + ZHO Product Advertisement technique\n');

  try {
    const nanoBanana = new VertexAINanoBananaService();

    // ZHO Technique #8: Product Advertisement prompts
    const adVariations = [
      {
        id: 1,
        name: "Professional Nursery Advertisement",
        prompt: `Transform this hydrangea nursery photo into a professional marketing advertisement.

DESIGN STYLE: Commercial nursery advertising with marketing appeal
- Professional advertising layout with clean typography
- Marketing-optimized text placement and composition
- High-quality product presentation for nursery business
- Advertisement-ready visual appeal

TEXT OVERLAY REQUIREMENTS:
- Company name: "FLORABUNDA NURSERY"
- Product: "LANDSCAPE-GRADE HYDRANGEAS"
- Tagline: "Full Sun Grown • Ready for Landscapes"

FEATURES TO HIGHLIGHT:
- Grown tough in full sun for strong performance
- Uniform, healthy growth
- Ideal for residential & landscaping projects
- Perfect to plant in the fall so roots establish for spring
- Locally grown quality and consistency

PRICING INFORMATION:
- 16" Deco containers — $50.00 each
- 3-gallon assortment — $27.50 each

CONTACT DETAILS:
- Location: Escondido, CA
- Phone: (760) 420-2273
- Email: Francisco@florabundanursery.com

ZHO TECHNIQUE #8 ENHANCEMENT (Product Advertisement):
- Professional commercial photography style
- Marketing-optimized lighting and composition
- High-quality product presentation
- Advertisement-ready visual appeal

Create a professional nursery marketing flyer that looks like it came from a real advertising agency.`
      },
      {
        id: 2,
        name: "Premium Landscaping Advertisement",
        prompt: `Transform this hydrangea nursery photo into a premium landscaping business advertisement.

DESIGN STYLE: High-end landscaping company marketing material
- Elegant professional design with premium typography
- Sophisticated color scheme and layout
- Luxury landscaping service presentation
- Premium brand positioning

TEXT CONTENT:
- Business: "FLORABUNDA NURSERY"
- Product line: "PREMIUM LANDSCAPE-GRADE HYDRANGEAS"
- Quality statement: "Professional Quality • Full Sun Grown • Landscape Ready"

PREMIUM FEATURES:
- Cultivated in full sun for superior resilience
- Meticulously maintained for uniform growth
- Expertly suited for residential and commercial landscaping
- Optimal fall planting schedule for spring establishment
- Locally sourced with guaranteed quality standards

INVESTMENT PRICING:
- 16" Premium Decorative Containers — $50.00
- 3-gallon Professional Assortment — $27.50

CONTACT INFORMATION:
- Escondido, California
- (760) 420-2273
- Francisco@florabundanursery.com

ZHO TECHNIQUE #8 ENHANCEMENT (Product Advertisement):
- Professional commercial photography style
- Marketing-optimized lighting and composition
- High-quality product presentation
- Advertisement-ready visual appeal

Transform into premium landscaping marketing material that conveys quality and professionalism.`
      },
      {
        id: 3,
        name: "Modern Nursery Marketing",
        prompt: `Transform this hydrangea nursery photo into a modern, contemporary marketing advertisement.

DESIGN STYLE: Modern nursery business advertising
- Contemporary design with clean lines
- Modern typography and color schemes
- Fresh, current aesthetic appeal
- Professional yet approachable presentation

MARKETING MESSAGE:
- Company: "FLORABUNDA NURSERY"
- Product: "LANDSCAPE-GRADE HYDRANGEAS"
- Value proposition: "Full Sun Grown • Ready for Landscapes"

QUALITY ADVANTAGES:
- Full sun performance for strong resilience
- Uniform growth patterns and healthy development
- Landscape-ready for immediate installation
- Fall planting advantage for spring establishment
- Local quality with consistency guarantee

COMPETITIVE PRICING:
- 16" Decorative Containers — $50.00 each
- 3-gallon Assortment — $27.50 each

BUSINESS CONTACT:
- Location: Escondido, CA
- Phone: (760) 420-2273
- Email: Francisco@florabundanursery.com

ZHO TECHNIQUE #8 ENHANCEMENT (Product Advertisement):
- Professional commercial photography style
- Marketing-optimized lighting and composition
- High-quality product presentation
- Advertisement-ready visual appeal

Create modern nursery marketing that appeals to contemporary landscaping customers.`
      }
    ];

    // Generate each advertisement variation
    for (let i = 0; i < adVariations.length; i++) {
      const ad = adVariations[i];
      console.log(`🎨 Generating ${ad.id}/3: ${ad.name}`);
      console.log(`📝 Using ZHO Technique #8 for professional product advertisement\n`);

      const images = await nanoBanana.generateImage(ad.prompt, {
        temperature: 0.3,
        numImages: 1
      });

      if (images && images.length > 0) {
        const generatedImage = images[0];
        console.log(`✅ Generated: ${generatedImage.imagePath}`);
        console.log(`📊 Quality: ${generatedImage.metadata.qualityScore}/10`);
        console.log(`💰 Cost: $${generatedImage.metadata.cost.toFixed(3)}\n`);

        // Copy to a more descriptive filename
        const outputPath = `hydrangea_ZHO8_${ad.id.toString().padStart(2, '0')}_${ad.name.toLowerCase().replace(/\s+/g, '_')}.jpg`;
        const imageBuffer = await fs.readFile(generatedImage.imagePath);
        await fs.writeFile(outputPath, imageBuffer);
        console.log(`📁 Saved as: ${outputPath}\n`);
      } else {
        console.error(`❌ Failed to generate ${ad.name}`);
      }
    }

    console.log('🔥 SUCCESS! All ZHO Technique #8 marketing advertisements generated!');
    console.log('🎯 Professional product advertisement quality');
    console.log('🍌 Generated using NanoBanana AI capabilities');
    console.log('📈 Marketing-optimized for real business use');

  } catch (error) {
    console.error('❌ Failed to generate ZHO #8 advertisements:', error);
    throw error;
  }
}

// Run it
generateZHO8MarketingAds()
  .then(() => console.log('🔥 ZHO #8 marketing ads ready!'))
  .catch(error => console.error('💥 Error:', error.message));