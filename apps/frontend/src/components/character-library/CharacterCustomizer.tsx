'use client';

/**
 * Character Customizer Component
 *
 * Form for customizing character details based on selected preset.
 * Includes fields for name, age, gender, ethnicity, and physical features.
 */

import React, { useState } from 'react';

export interface CharacterCustomization {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'non-binary';
  ethnicity?: string;
  profession?: string;
  physicalFeatures?: {
    eyeColor?: string;
    hairColor?: string;
    hairStyle?: string;
    skinTone?: string;
    height?: string;
    buildType?: string;
  };
}

interface CharacterCustomizerProps {
  presetName: string;
  defaultProfession: string;
  onCustomizationChange: (customization: CharacterCustomization) => void;
}

export default function CharacterCustomizer({
  presetName,
  defaultProfession,
  onCustomizationChange
}: CharacterCustomizerProps) {
  const [customization, setCustomization] = useState<CharacterCustomization>({
    name: '',
    age: 30,
    gender: 'female',
    ethnicity: 'Caucasian',
    profession: defaultProfession,
    physicalFeatures: {
      eyeColor: 'Brown',
      hairColor: 'Brown',
      hairStyle: 'Professional',
      skinTone: 'Medium',
      height: '5\'8"',
      buildType: 'Athletic'
    }
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateCustomization = (updates: Partial<CharacterCustomization>) => {
    const newCustomization = { ...customization, ...updates };
    setCustomization(newCustomization);
    onCustomizationChange(newCustomization);
  };

  const updatePhysicalFeature = (feature: string, value: string) => {
    const newCustomization = {
      ...customization,
      physicalFeatures: {
        ...customization.physicalFeatures,
        [feature]: value
      }
    };
    setCustomization(newCustomization);
    onCustomizationChange(newCustomization);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Customize Your Character
        </h2>
        <p className="text-gray-600">
          Personalize {presetName} character with your details
        </p>
      </div>

      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 space-y-6">
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Character Name *
              </label>
              <input
                type="text"
                id="name"
                value={customization.name}
                onChange={(e) => updateCustomization({ name: e.target.value })}
                placeholder="e.g., Sarah Johnson"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <input
                type="number"
                id="age"
                value={customization.age}
                onChange={(e) => updateCustomization({ age: parseInt(e.target.value) })}
                min="18"
                max="70"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                id="gender"
                value={customization.gender}
                onChange={(e) => updateCustomization({ gender: e.target.value as 'male' | 'female' | 'non-binary' })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-Binary</option>
              </select>
            </div>

            {/* Ethnicity */}
            <div>
              <label htmlFor="ethnicity" className="block text-sm font-medium text-gray-700 mb-2">
                Ethnicity
              </label>
              <input
                type="text"
                id="ethnicity"
                value={customization.ethnicity}
                onChange={(e) => updateCustomization({ ethnicity: e.target.value })}
                placeholder="e.g., Caucasian, Asian, Hispanic"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Profession */}
          <div className="mt-4">
            <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-2">
              Profession
            </label>
            <input
              type="text"
              id="profession"
              value={customization.profession}
              onChange={(e) => updateCustomization({ profession: e.target.value })}
              placeholder={defaultProfession}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Advanced Physical Features (Collapsible) */}
        <div>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              Physical Features (Optional)
            </h3>
            <svg
              className={`h-5 w-5 text-gray-500 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {/* Eye Color */}
              <div>
                <label htmlFor="eyeColor" className="block text-sm font-medium text-gray-700 mb-2">
                  Eye Color
                </label>
                <input
                  type="text"
                  id="eyeColor"
                  value={customization.physicalFeatures?.eyeColor}
                  onChange={(e) => updatePhysicalFeature('eyeColor', e.target.value)}
                  placeholder="e.g., Blue, Brown, Green"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Hair Color */}
              <div>
                <label htmlFor="hairColor" className="block text-sm font-medium text-gray-700 mb-2">
                  Hair Color
                </label>
                <input
                  type="text"
                  id="hairColor"
                  value={customization.physicalFeatures?.hairColor}
                  onChange={(e) => updatePhysicalFeature('hairColor', e.target.value)}
                  placeholder="e.g., Blonde, Black, Red"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Hair Style */}
              <div>
                <label htmlFor="hairStyle" className="block text-sm font-medium text-gray-700 mb-2">
                  Hair Style
                </label>
                <input
                  type="text"
                  id="hairStyle"
                  value={customization.physicalFeatures?.hairStyle}
                  onChange={(e) => updatePhysicalFeature('hairStyle', e.target.value)}
                  placeholder="e.g., Short, Long, Curly"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Skin Tone */}
              <div>
                <label htmlFor="skinTone" className="block text-sm font-medium text-gray-700 mb-2">
                  Skin Tone
                </label>
                <input
                  type="text"
                  id="skinTone"
                  value={customization.physicalFeatures?.skinTone}
                  onChange={(e) => updatePhysicalFeature('skinTone', e.target.value)}
                  placeholder="e.g., Fair, Medium, Dark"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Height */}
              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-2">
                  Height
                </label>
                <input
                  type="text"
                  id="height"
                  value={customization.physicalFeatures?.height}
                  onChange={(e) => updatePhysicalFeature('height', e.target.value)}
                  placeholder="e.g., 5 ft 8 in, 6 ft 2 in"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Build Type */}
              <div>
                <label htmlFor="buildType" className="block text-sm font-medium text-gray-700 mb-2">
                  Build Type
                </label>
                <input
                  type="text"
                  id="buildType"
                  value={customization.physicalFeatures?.buildType}
                  onChange={(e) => updatePhysicalFeature('buildType', e.target.value)}
                  placeholder="e.g., Athletic, Slim, Average"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Character Preview Summary */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">Character Summary</h4>
          <p className="text-sm text-blue-800">
            {customization.name || '[Character Name]'}, {customization.age} years old, {customization.gender},{' '}
            {customization.ethnicity} {customization.profession || defaultProfession}
          </p>
        </div>
      </div>
    </div>
  );
}