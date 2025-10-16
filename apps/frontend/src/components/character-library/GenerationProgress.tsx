'use client';

/**
 * Generation Progress Tracker Component
 *
 * Real-time progress tracking for character library generation.
 * Shows current shot, completion status, time elapsed, and estimated time remaining.
 */

import React from 'react';

interface ProgressData {
  totalShots: number;
  completedShots: number;
  currentShot: string | null;
  estimatedTimeRemaining: number;
}

interface GenerationProgressProps {
  operationId: string;
  characterName: string;
  status: 'processing' | 'completed' | 'failed';
  progress: ProgressData;
  elapsedTime: number;
  error?: string;
}

export default function GenerationProgress({
  operationId,
  characterName,
  status,
  progress,
  elapsedTime,
  error
}: GenerationProgressProps) {
  // Defensive: Handle missing progress data
  if (!progress) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">⚠️ Progress Data Unavailable</h2>
          <p className="mt-2 text-gray-600">Unable to track generation progress</p>
        </div>
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">Error: {error}</p>
          </div>
        )}
      </div>
    );
  }

  const progressPercentage = progress.totalShots > 0
    ? Math.round((progress.completedShots / progress.totalShots) * 100)
    : 0;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getShotName = (shotId: string | null): string => {
    if (!shotId) return '';
    const names: Record<string, string> = {
      'full-body-standing': 'Full Body Standing',
      'full-body-seated': 'Full Body Seated',
      'three-quarter-standing': 'Three-Quarter Standing',
      'professional-headshot': 'Professional Headshot'
    };
    return names[shotId] || shotId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">
          {status === 'processing' && '🎨 Generating Character Library'}
          {status === 'completed' && '✅ Generation Complete!'}
          {status === 'failed' && '❌ Generation Failed'}
        </h2>
        <p className="mt-2 text-gray-600">
          {characterName}
        </p>
      </div>

      <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
        {/* Progress Ring or Status Icon */}
        <div className="flex justify-center mb-6">
          {status === 'processing' && (
            <div className="relative">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#E5E7EB"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="#3B82F6"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercentage / 100)}`}
                  strokeLinecap="round"
                  className="transition-all duration-500"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {progressPercentage}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {progress.completedShots}/{progress.totalShots}
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === 'completed' && (
            <div className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-16 h-16 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}

          {status === 'failed' && (
            <div className="w-32 h-32 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-16 h-16 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        {/* Current Status */}
        {status === 'processing' && (
          <div className="space-y-4">
            {progress.currentShot && (
              <div className="text-center">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                  <div className="mr-2 h-2 w-2 rounded-full bg-blue-600 animate-pulse"></div>
                  Currently generating: {getShotName(progress.currentShot)}
                </div>
              </div>
            )}

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>

            {/* Shot Checklist */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              {['full-body-standing', 'full-body-seated', 'three-quarter-standing', 'professional-headshot'].slice(0, progress.totalShots).map((shotId, index) => {
                const isCompleted = index < progress.completedShots;
                const isCurrent = progress.currentShot === shotId;

                return (
                  <div
                    key={shotId}
                    className={`
                      p-3 rounded-lg border-2 text-center transition-all
                      ${isCompleted ? 'border-green-500 bg-green-50' : ''}
                      ${isCurrent ? 'border-blue-500 bg-blue-50 animate-pulse' : ''}
                      ${!isCompleted && !isCurrent ? 'border-gray-200 bg-gray-50' : ''}
                    `}
                  >
                    <div className="text-2xl mb-1">
                      {isCompleted && '✅'}
                      {isCurrent && '🎨'}
                      {!isCompleted && !isCurrent && '⏳'}
                    </div>
                    <div className={`text-xs font-medium ${isCompleted ? 'text-green-800' : isCurrent ? 'text-blue-800' : 'text-gray-500'}`}>
                      Shot {index + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Time Information */}
        <div className="mt-6 flex items-center justify-center space-x-8 text-sm">
          <div className="text-center">
            <div className="text-gray-500">Elapsed</div>
            <div className="font-semibold text-gray-900">{formatTime(elapsedTime)}</div>
          </div>

          {status === 'processing' && progress.estimatedTimeRemaining > 0 && (
            <>
              <div className="h-8 w-px bg-gray-300"></div>
              <div className="text-center">
                <div className="text-gray-500">Remaining</div>
                <div className="font-semibold text-blue-600">{formatTime(progress.estimatedTimeRemaining)}</div>
              </div>
            </>
          )}
        </div>

        {/* Error Message */}
        {status === 'failed' && error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 font-medium">Error: {error}</p>
          </div>
        )}

        {/* Completion Message */}
        {status === 'completed' && (
          <div className="mt-6 text-center">
            <p className="text-lg font-semibold text-green-600">
              All {progress.totalShots} shots generated successfully! 🎉
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Total generation time: {formatTime(elapsedTime)}
            </p>
          </div>
        )}

        {/* Operation ID (for debugging) */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <details className="text-xs text-gray-500">
            <summary className="cursor-pointer hover:text-gray-700">Operation Details</summary>
            <div className="mt-2 font-mono bg-gray-50 p-2 rounded">
              Operation ID: {operationId}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}