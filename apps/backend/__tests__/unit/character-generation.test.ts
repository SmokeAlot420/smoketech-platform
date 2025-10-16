/**
 * Unit tests for character generation logic
 */

describe('Character Generation', () => {
  // Helper function (extracted from web-server.ts for testing)
  function generateCharacterFromRequest(
    characterName: string,
    userRequest: string,
    _style: string
  ) {
    let profession = 'Influencer';
    let industry = 'General';
    let companyName = `${characterName}Co`;
    let contentType = 'testimonial';

    if (userRequest.toLowerCase().includes('insurance') || userRequest.toLowerCase().includes('car')) {
      profession = 'Insurance Advisor';
      industry = 'Insurance';
      companyName = 'QuoteMoto';
      contentType = 'product-review';
    } else if (userRequest.toLowerCase().includes('tech') || userRequest.toLowerCase().includes('gadget')) {
      profession = 'Tech Expert';
      industry = 'Technology';
      companyName = 'TechFlow';
      contentType = 'product-review';
    } else if (userRequest.toLowerCase().includes('fitness') || userRequest.toLowerCase().includes('workout')) {
      profession = 'Fitness Coach';
      industry = 'Health & Fitness';
      companyName = 'FitLife';
      contentType = 'motivational-message';
    } else if (userRequest.toLowerCase().includes('food') || userRequest.toLowerCase().includes('recipe')) {
      profession = 'Chef';
      industry = 'Food & Cooking';
      companyName = 'CulinaryMasters';
      contentType = 'tutorial';
    }

    const descriptions: Record<string, string> = {
      'Insurance Advisor': 'Professional, trustworthy insurance expert with friendly demeanor',
      'Tech Expert': 'Young, enthusiastic technology expert with modern casual style',
      'Fitness Coach': 'Athletic, energetic fitness expert with motivational personality',
      'Chef': 'Professional chef with warm, approachable demeanor and culinary expertise'
    };

    const dialogue = `"Hi everyone! I'm ${characterName} from ${companyName}. ${userRequest}"`;

    return {
      characterName,
      profession,
      companyName,
      industry,
      description: descriptions[profession] || 'Professional expert in their field',
      dialogue,
      contentType
    };
  }

  describe('generateCharacterFromRequest', () => {
    it('should generate insurance advisor for insurance-related requests', () => {
      const result = generateCharacterFromRequest(
        'Pedro',
        'I help people save on car insurance',
        'professional'
      );

      expect(result.profession).toBe('Insurance Advisor');
      expect(result.industry).toBe('Insurance');
      expect(result.companyName).toBe('QuoteMoto');
      expect(result.contentType).toBe('product-review');
    });

    it('should generate tech expert for tech-related requests', () => {
      const result = generateCharacterFromRequest(
        'Sarah',
        'I review the latest tech gadgets and apps',
        'modern'
      );

      expect(result.profession).toBe('Tech Expert');
      expect(result.industry).toBe('Technology');
      expect(result.companyName).toBe('TechFlow');
      expect(result.contentType).toBe('product-review');
    });

    it('should generate fitness coach for fitness-related requests', () => {
      const result = generateCharacterFromRequest(
        'Mike',
        'I share high-energy workout routines',
        'athletic'
      );

      expect(result.profession).toBe('Fitness Coach');
      expect(result.industry).toBe('Health & Fitness');
      expect(result.companyName).toBe('FitLife');
      expect(result.contentType).toBe('motivational-message');
    });

    it('should generate chef for food-related requests', () => {
      const result = generateCharacterFromRequest(
        'Julia',
        'I share delicious recipes and cooking tips',
        'professional'
      );

      expect(result.profession).toBe('Chef');
      expect(result.industry).toBe('Food & Cooking');
      expect(result.companyName).toBe('CulinaryMasters');
      expect(result.contentType).toBe('tutorial');
    });

    it('should default to influencer for generic requests', () => {
      const result = generateCharacterFromRequest(
        'Alex',
        'I create amazing content',
        'casual'
      );

      expect(result.profession).toBe('Influencer');
      expect(result.industry).toBe('General');
      expect(result.companyName).toBe('AlexCo');
      expect(result.contentType).toBe('testimonial');
    });

    it('should generate proper dialogue with character name and request', () => {
      const result = generateCharacterFromRequest(
        'Maria',
        'I help families find affordable insurance',
        'friendly'
      );

      expect(result.dialogue).toContain('Maria');
      expect(result.dialogue).toContain('QuoteMoto');
      expect(result.dialogue).toContain('I help families find affordable insurance');
    });

    it('should provide appropriate description for each profession', () => {
      const insuranceResult = generateCharacterFromRequest(
        'Test',
        'car insurance',
        'professional'
      );
      expect(insuranceResult.description).toBe(
        'Professional, trustworthy insurance expert with friendly demeanor'
      );

      const techResult = generateCharacterFromRequest(
        'Test',
        'tech gadget',
        'modern'
      );
      expect(techResult.description).toBe(
        'Young, enthusiastic technology expert with modern casual style'
      );
    });
  });
});
