'use client';

import React, { useEffect, useState } from 'react';
import { useWorkflowProgress, WorkflowProgress, WorkflowResult } from '../hooks/useWorkflowProgress';
import VideoResultModal from './VideoResultModal';

interface ProgressPanelProps {
  operationId: string | null;
  prompt?: string;
  onClose: () => void;
  onRegenerate?: () => void;
}

export default function ProgressPanel({ operationId, prompt, onClose, onRegenerate }: ProgressPanelProps) {
  const { progress, isLoading, error, startTracking, stopTracking } = useWorkflowProgress();
  const [showResultModal, setShowResultModal] = useState(false);
  const [workflowResult, setWorkflowResult] = useState<WorkflowResult | undefined>(undefined);

  useEffect(() => {
    if (operationId) {
      // Pass onComplete callback to show modal when workflow finishes
      startTracking(operationId, (result) => {
        setWorkflowResult(result);
        setShowResultModal(true);
      });
    }
    return () => {
      stopTracking();
    };
  }, [operationId, startTracking, stopTracking]);

  const handleDownload = () => {
    if (workflowResult?.videoUrl) {
      // Create download link
      const link = document.createElement('a');
      link.href = workflowResult.videoUrl;
      link.download = `video-${operationId}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleRegenerate = () => {
    setShowResultModal(false);
    setWorkflowResult(undefined);
    onRegenerate?.();
  };

  const handleCloseModal = () => {
    setShowResultModal(false);
  };

  const handleExtend = (extendedVideoUrl: string) => {
    // Update the workflow result with the extended video
    setWorkflowResult((prev) => ({
      ...prev,
      success: true,
      videoUrl: extendedVideoUrl,
    }));
  };

  if (!operationId) return null;

  return (
    <div className="fixed bottom-0 right-0 w-96 bg-white border-l border-t border-gray-200 shadow-2xl rounded-tl-xl overflow-hidden z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="animate-pulse">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
            </svg>
          </div>
          <span className="font-semibold">Video Generation Progress</span>
        </div>
        <button
          onClick={onClose}
          className="text-white hover:bg-white/20 rounded p-1 transition-colors"
          aria-label="Close progress panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="h-[400px] overflow-y-auto">
        {error && (
          <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-semibold text-red-900">Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {isLoading && !progress && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Connecting to workflow...</p>
            </div>
          </div>
        )}

        {progress && (
          <div className="p-4 space-y-4">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <StatusBadge progress={progress} />
              <div className="text-xs text-gray-500 font-mono">
                ID: {progress.operationId.slice(-8)}
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm font-semibold text-blue-600">{progress.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ease-out ${
                    progress.isFailed
                      ? 'bg-red-500'
                      : progress.isCompleted
                      ? 'bg-green-500'
                      : 'bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse'
                  }`}
                  style={{ width: `${progress.progress}%` }}
                />
              </div>
            </div>

            {/* Current Stage */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Current Stage</div>
              <div className="flex items-center gap-2">
                <StageIcon stage={progress.currentStage} />
                <span className="font-medium text-gray-900 capitalize">
                  {progress.currentStage.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            {/* Activity Log */}
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2">Activity Log</div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {progress.activityLog.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 text-sm bg-white border border-gray-200 rounded p-2 animate-fadeIn"
                  >
                    <div className="mt-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    </div>
                    <span className="text-gray-700 flex-1">{activity}</span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow Details */}
            {progress.details && (
              <div className="pt-4 border-t border-gray-200">
                <div className="text-xs font-semibold text-gray-500 uppercase mb-2">Details</div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Workflow Type:</span>
                    <span className="font-mono text-gray-900">{progress.details.workflowType}</span>
                  </div>
                  {progress.details.startTime && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Started:</span>
                      <span className="font-mono text-gray-900">
                        {new Date(progress.details.startTime).toLocaleTimeString()}
                      </span>
                    </div>
                  )}
                  {progress.details.historyLength && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Events:</span>
                      <span className="font-mono text-gray-900">{progress.details.historyLength}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Completion Message */}
            {progress.isCompleted && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-800">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold">Video Generation Complete!</h4>
                    <p className="text-sm mt-1">Your video has been successfully generated.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Failure Message */}
            {progress.isFailed && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold">Workflow Failed</h4>
                    <p className="text-sm mt-1">An error occurred during video generation.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video Result Modal */}
      <VideoResultModal
        isOpen={showResultModal}
        videoUrl={workflowResult?.videoUrl}
        thumbnailUrl={workflowResult?.thumbnailUrl}
        operationId={operationId || ''}
        prompt={prompt}
        metadata={workflowResult?.metadata}
        onDownload={handleDownload}
        onRegenerate={handleRegenerate}
        onExtend={handleExtend}
        onClose={handleCloseModal}
      />
    </div>
  );
}

// Status Badge Component
function StatusBadge({ progress }: { progress: WorkflowProgress }) {
  if (progress.isCompleted) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        Completed
      </div>
    );
  }

  if (progress.isFailed) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        Failed
      </div>
    );
  }

  if (progress.isRunning) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Running
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
      Queued
    </div>
  );
}

// Stage Icon Component
function StageIcon({ stage }: { stage: string }) {
  const icons: Record<string, JSX.Element> = {
    queued: (
      <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
    starting: (
      <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
      </svg>
    ),
    generating_character: (
      <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    ),
    generating_video: (
      <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 20 20">
        <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
      </svg>
    ),
    completed: (
      <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    failed: (
      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
  };

  return icons[stage] || icons.queued;
}
