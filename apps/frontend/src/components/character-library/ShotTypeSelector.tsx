'use client';

/**
 * Shot Type Selector Component
 *
 * Allows users to select which shot types to generate (or all 4).
 * Shows shot previews, aspect ratios, and platform recommendations.
 */

import React, { useState } from 'react';

interface ShotType {
  id: string;
  name: string;
  aspectRatio: string;
  platform: string;
  description: string;
  useGreenScreen: boolean;
}

const SHOT_TYPES: ShotType[] = [
  {
    id: 'full-body-standing',
    name: 'Full Body Standing',
    aspectRatio: '9:16',
    platform: 'TikTok / Instagram Reels',
    description: 'Full body professional standing shot, perfect for vertical video content',
    useGreenScreen: true
  },
  {
    id: 'full-body-seated',
    name: 'Full Body Seated',
    aspectRatio: '16:9',
    platform: 'YouTube',
    description: 'Seated professional shot, ideal for horizontal video content and presentations',
    useGreenScreen: true
  },
  {
    id: 'three-quarter-standing',
    name: 'Three-Quarter Standing',
    aspectRatio: '4:5',
    platform: 'Instagram Feed',
    description: 'Three-quarter view standing shot, optimized for Instagram posts',
    useGreenScreen: true
  },
  {
    id: 'professional-headshot',
    name: 'Professional Headshot',
    aspectRatio: '1:1',
    platform: 'LinkedIn / Profile',
    description: 'Close-up professional headshot, perfect for profiles and avatars',
    useGreenScreen: false
  }
];

interface ShotTypeSelectorProps {
  onShotSelectionChange: (selection: 'all' | string[]) => void;
}

export default function ShotTypeSelector({ onShotSelectionChange }: ShotTypeSelectorProps) {
  const [selectAll, setSelectAll] = useState(true);
  const [selectedShots, setSelectedShots] = useState<string[]>([]);

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedShots([]);
      onShotSelectionChange('all');
    } else {
      const allShots = SHOT_TYPES.map(st => st.id);
      setSelectedShots(allShots);
      onShotSelectionChange(allShots);
    }
  };

  const handleShotToggle = (shotId: string) => {
    if (selectAll) {
      // If "all" is selected, uncheck it and select all except this one
      setSelectAll(false);
      const newSelection = SHOT_TYPES.filter(st => st.id !== shotId).map(st => st.id);
      setSelectedShots(newSelection);
      onShotSelectionChange(newSelection);
    } else {
      // Toggle individual shot
      const newSelection = selectedShots.includes(shotId)
        ? selectedShots.filter(id => id !== shotId)
        : [...selectedShots, shotId];

      setSelectedShots(newSelection);

      // If all are selected, switch back to "all"
      if (newSelection.length === SHOT_TYPES.length) {
        setSelectAll(true);
        setSelectedShots([]);
        onShotSelectionChange('all');
      } else {
        onShotSelectionChange(newSelection);
      }
    }
  };

  const isShotSelected = (shotId: string) => {
    return selectAll || selectedShots.includes(shotId);
  };

  const selectedCount = selectAll ? 4 : selectedShots.length;
  const estimatedCost = selectedCount * 0.039;
  const estimatedTime = Math.round((selectedCount * 10 + (selectedCount - 1) * 3) / 60);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Select Shot Types
        </h2>
        <p className="text-gray-600">
          Choose which shots to generate for your character library
        </p>
      </div>

      {/* Select All Option */}
      <div className="bg-blue-50 rounded-xl border-2 border-blue-200 p-6">
        <label className="flex items-start cursor-pointer">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="ml-4">
            <div className="flex items-center">
              <span className="text-lg font-semibold text-blue-900">
                Generate All Shots (Recommended)
              </span>
              <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white">
                Best Value
              </span>
            </div>
            <p className="mt-1 text-sm text-blue-700">
              Get all 4 professional shots optimized for every major platform. Complete character library with maximum versatility.
            </p>
          </div>
        </label>
      </div>

      {/* Individual Shot Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SHOT_TYPES.map((shot) => {
          const isSelected = isShotSelected(shot.id);

          return (
            <div
              key={shot.id}
              className={`
                relative rounded-xl border-2 p-5 transition-all cursor-pointer
                ${isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
                }
              `}
              onClick={() => handleShotToggle(shot.id)}
            >
              <label className="cursor-pointer">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="ml-3 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                        {shot.name}
                      </h3>
                      {shot.useGreenScreen && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                          🟢 Green Screen
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex items-center text-sm text-gray-600">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {shot.aspectRatio}
                    </div>

                    <p className={`mt-2 text-sm ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                      {shot.description}
                    </p>

                    <div className="mt-3 flex items-center text-xs font-medium text-gray-500">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                      </svg>
                      {shot.platform}
                    </div>
                  </div>
                </div>
              </label>
            </div>
          );
        })}
      </div>

      {/* Cost & Time Estimate */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Generation Summary</h3>
            <p className="mt-1 text-sm text-gray-600">
              {selectedCount} {selectedCount === 1 ? 'shot' : 'shots'} selected
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              ${estimatedCost.toFixed(3)}
            </div>
            <p className="text-sm text-gray-600">
              ~{estimatedTime} {estimatedTime === 1 ? 'minute' : 'minutes'}
            </p>
          </div>
        </div>

        {selectedCount === 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium">
              ⚠️ Please select at least one shot type to continue
            </p>
          </div>
        )}
      </div>
    </div>
  );
}