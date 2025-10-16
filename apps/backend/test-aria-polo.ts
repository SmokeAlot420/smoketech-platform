import { quoteMotoInfluencer } from './src/characters/quotemoto-baddie';
import { vertexAINanoBananaService } from './src/services/vertexAINanoBanana';
import { SkinRealismEngine } from './src/enhancement/skinRealism';
import { CharacterConsistencyEngine } from './src/enhancement/characterConsistency';

async function generateAriaInPolo() {
  console.log('🔵 Generating Aria in QuoteMoto blue polo with logo...');

  const ariaIdentity = quoteMotoInfluencer.characterIdentity;
  const consistencyAnchors = quoteMotoInfluencer.consistencyAnchors;
  const skinRealism = SkinRealismEngine.createSophiaSkinRealism();

  const poloPrompt = `Ultra-photorealistic portrait of Aria, stunning 26-year-old QuoteMoto insurance expert.

PRESERVE EXACT CHARACTER IDENTITY:
- Mixed Latina/Mediterranean heritage with warm olive skin and golden undertones
- Large almond-shaped amber-brown eyes with golden flecks
- High defined cheekbones and strong feminine jawline
- Naturally full lips with perfect cupid's bow
- Small beauty mark near left eye above cheekbone
- Long layered honey-brown hair with caramel highlights
- Same facial structure and features as reference

CLOTHING & BRANDING:
- Wearing professional QuoteMoto blue polo shirt (#0074c9 color)
- QuoteMoto logo clearly visible on left chest area
- Polo shirt fits professionally and appropriately
- Clean, crisp appearance with proper collar positioning
- Professional insurance advisor styling

SKIN REALISM ENHANCEMENTS:
${skinRealism.promptEnhancements.join('\n- ')}

SETTING & EXPRESSION:
- Professional business environment or office setting
- Confident, approachable smile showing insurance expertise
- Professional lighting enhancing the blue polo color
- Same personality and energy as established character
- Magnetic presence with professional authority

TECHNICAL QUALITY:
- Ultra-photorealistic 8K resolution
- Perfect skin texture with natural imperfections
- Professional photography lighting standards
- Character consistency maintained across generation`;

  const consistencyEngine = new CharacterConsistencyEngine();
  const finalPrompt = consistencyEngine.buildConsistencyPrompt(
    poloPrompt,
    ariaIdentity,
    'frontal',
    consistencyAnchors
  );

  const result = await vertexAINanoBananaService.generateImage(finalPrompt, {
    temperature: 0.3,
    numImages: 1
  });

  if (result && result.length > 0) {
    console.log('🎉 SUCCESS! Aria in QuoteMoto polo generated');
    console.log(`📁 Image saved to: ${result[0].imagePath}`);
    console.log(`⭐ Quality Score: ${result[0].metadata.qualityScore}/10`);
    console.log(`💰 Cost: $${result[0].metadata.cost}`);
    return result[0].imagePath;
  } else {
    console.log('❌ Failed to generate polo variation');
    return null;
  }
}

generateAriaInPolo().catch(console.error);