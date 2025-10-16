'use client';

/**
 * Results Gallery Component
 *
 * Displays generated character library images with download options.
 * Shows thumbnails, metadata, and provides individual/bulk download.
 */

import React, { useState } from 'react';
import Image from 'next/image';

interface ShotResult {
  shotType: string;
  aspectRatio: string;
  imagePath?: string;
  success: boolean;
  error?: string;
}

interface ResultsGalleryProps {
  characterName: string;
  results: ShotResult[];
  outputLocation: string;
  metadata?: {
    totalImages: number;
    successfulImages: number;
    successRate: string;
    shotTypes: string[];
    greenScreenShots: string[];
  };
}

export default function ResultsGallery({
  characterName,
  results,
  outputLocation,
  metadata
}: ResultsGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ShotResult | null>(null);

  const getShotName = (shotType: string): string => {
    const names: Record<string, string> = {
      'full-body-standing': 'Full Body Standing',
      'full-body-seated': 'Full Body Seated',
      'three-quarter-standing': 'Three-Quarter Standing',
      'professional-headshot': 'Professional Headshot'
    };
    return names[shotType] || shotType;
  };

  const getPlatformIcon = (shotType: string): string => {
    const platforms: Record<string, string> = {
      'full-body-standing': '📱 TikTok/Reels',
      'full-body-seated': '🎬 YouTube',
      'three-quarter-standing': '📷 Instagram',
      'professional-headshot': '💼 LinkedIn'
    };
    return platforms[shotType] || '🖼️ General';
  };

  const successfulResults = results.filter(r => r.success);

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              🎉 {characterName} Character Library
            </h2>
            <p className="mt-1 text-gray-600">
              {metadata?.successfulImages || successfulResults.length} professional shots generated
            </p>
          </div>
          {metadata && (
            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {metadata.successRate}
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          )}
        </div>
      </div>

      {/* Image Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {successfulResults.map((result, index) => (
          <div
            key={index}
            className="group relative bg-white rounded-xl border-2 border-gray-200 overflow-hidden hover:border-blue-400 hover:shadow-xl transition-all cursor-pointer"
            onClick={() => setSelectedImage(result)}
          >
            {/* Image Preview */}
            <div className="aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
              {result.imagePath ? (
                <div className="relative w-full h-full">
                  {/* Real generated image from character library */}
                  <img
                    src={`/character-library/${outputLocation.split('/').pop()}/${result.imagePath}`}
                    alt={`${characterName} - ${result.shotType}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image not found
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" font-size="40"%3E👤%3C/text%3E%3C/svg%3E';
                    }}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400">No image</div>
              )}
            </div>

            {/* Shot Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900">
                {getShotName(result.shotType)}
              </h3>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-gray-600">{result.aspectRatio}</span>
                <span className="text-xs text-gray-500">{getPlatformIcon(result.shotType)}</span>
              </div>

              {/* Green Screen Badge */}
              {metadata?.greenScreenShots.includes(result.shotType) && (
                <div className="mt-2 inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                  🟢 Green Screen
                </div>
              )}

              {/* Download Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // In production, trigger download
                  alert(`Download: ${result.imagePath}`);
                }}
                className="mt-3 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Failed Results */}
      {results.some(r => !r.success) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-semibold text-red-800 mb-2">Failed Generations</h3>
          <ul className="space-y-1 text-sm text-red-700">
            {results.filter(r => !r.success).map((result, index) => (
              <li key={index}>
                • {getShotName(result.shotType)}: {result.error || 'Unknown error'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Bulk Actions */}
      <div className="flex items-center justify-between bg-gray-50 rounded-xl border border-gray-200 p-4">
        <div className="text-sm text-gray-600">
          📁 Files saved to: <span className="font-mono text-xs">{outputLocation}</span>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => alert('Download all images + metadata')}
            className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            Download All (.zip)
          </button>
          <button
            onClick={() => alert('Open folder location')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
          >
            Open Folder
          </button>
        </div>
      </div>

      {/* Usage Guide */}
      {metadata && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">💡 How to Use Your Character Library</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-semibold mb-2">Platform Optimization</h4>
              <ul className="space-y-1">
                <li>• TikTok/Reels: Use 9:16 standing shot</li>
                <li>• YouTube: Use 16:9 seated shot</li>
                <li>• Instagram: Use 4:5 three-quarter shot</li>
                <li>• LinkedIn: Use 1:1 headshot</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Green Screen Benefits</h4>
              <ul className="space-y-1">
                <li>• Easy background replacement</li>
                <li>• VEO3 video generation ready</li>
                <li>• Professional chroma keying</li>
                <li>• Versatile content creation</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  {getShotName(selectedImage.shotType)}
                </h3>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Large Image Preview */}
              <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center mb-4">
                <div className="text-center">
                  <div className="text-8xl mb-4">👤</div>
                  <div className="text-lg font-medium text-gray-700">{selectedImage.aspectRatio}</div>
                  <div className="text-sm text-gray-500 mt-2">{getPlatformIcon(selectedImage.shotType)}</div>
                </div>
              </div>

              <button
                onClick={() => alert(`Download: ${selectedImage.imagePath}`)}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Download High Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}