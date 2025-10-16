'use client';

/**
 * Template Selector Component
 *
 * UI for choosing video generation templates:
 * - Single Video
 * - Video Series
 * - Screen Recording (No Human)
 * - Asset Animation
 */

import React, { useState } from 'react';

export type TemplateType = 'single' | 'series' | 'no-human' | 'asset-animation';

interface TemplateSelectorProps {
  value: TemplateType;
  onChange: (templateType: TemplateType) => void;
}

interface TemplateOption {
  id: TemplateType;
  name: string;
  description: string;
  icon: string;
  examples: string[];
  features: string[];
}

const TEMPLATE_OPTIONS: TemplateOption[] = [
  {
    id: 'single',
    name: 'Single Video',
    description: 'Generate one video with optional character',
    icon: '🎬',
    examples: ['Product Demo', 'SOP Tutorial', 'How-To Guide'],
    features: [
      'Optional character generation',
      'Natural lighting',
      'Professional quality',
      '8-second format'
    ]
  },
  {
    id: 'series',
    name: 'Video Series',
    description: 'Multiple videos with same character',
    icon: '📽️',
    examples: ['Trilogy', 'Multi-Part Tutorial', 'Content Series'],
    features: [
      'Character consistency',
      'Batch generation',
      'Same person across all',
      'Cost-efficient'
    ]
  },
  {
    id: 'no-human',
    name: 'Screen Recording',
    description: 'Software demo without human',
    icon: '🖥️',
    examples: ['Digital Takeoff', 'Software Tutorial', 'UI Demo'],
    features: [
      'No character needed',
      'Slow animations',
      'Perfect text clarity',
      'Professional UI'
    ]
  },
  {
    id: 'asset-animation',
    name: 'Asset Animation',
    description: 'Generate asset first, then animate',
    icon: '📐',
    examples: ['Blueprint Demo', 'Product Viz', 'Technical Drawing'],
    features: [
      'Two-step approach',
      'Clean asset first',
      'UI overlays separate',
      'Ultra-clear'
    ]
  }
];

export default function TemplateSelector({ value, onChange }: TemplateSelectorProps) {
  const [hoveredId, setHoveredId] = useState<TemplateType | null>(null);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Template Type
        </label>
        <p className="text-sm text-gray-500 mb-4">
          Choose the workflow pattern that best fits your content needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEMPLATE_OPTIONS.map((template) => {
          const isSelected = value === template.id;
          const isHovered = hoveredId === template.id;

          return (
            <div
              key={template.id}
              onClick={() => onChange(template.id)}
              onMouseEnter={() => setHoveredId(template.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`
                relative p-6 rounded-lg border-2 cursor-pointer transition-all
                ${isSelected
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
                }
              `}
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{template.icon}</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {template.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {template.description}
                  </p>
                </div>
                {isSelected && (
                  <div className="text-blue-500">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Examples */}
              <div className="mb-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Examples:</p>
                <div className="flex flex-wrap gap-1">
                  {template.examples.map((example, idx) => (
                    <span
                      key={idx}
                      className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded"
                    >
                      {example}
                    </span>
                  ))}
                </div>
              </div>

              {/* Features */}
              {(isSelected || isHovered) && (
                <div className="space-y-1 pt-3 border-t border-gray-200">
                  {template.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
