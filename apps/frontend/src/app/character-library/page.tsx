'use client';

/**
 * Character Library Generation Page
 *
 * Main page for the one-click character library generation system.
 * Combines all components into a step-by-step wizard interface.
 */

import React, { useState, useEffect } from 'react';
import PresetSelector from '@/components/character-library/PresetSelector';
import CharacterCustomizer, { CharacterCustomization } from '@/components/character-library/CharacterCustomizer';
import ShotTypeSelector from '@/components/character-library/ShotTypeSelector';
import GenerationProgress from '@/components/character-library/GenerationProgress';
import ResultsGallery from '@/components/character-library/ResultsGallery';

type Step = 'preset' | 'customize' | 'shots' | 'generating' | 'results';

interface PresetData {
  id: string;
  name: string;
  defaultProfession: string;
}

export default function CharacterLibraryPage() {
  const [currentStep, setCurrentStep] = useState<Step>('preset');
  const [selectedPreset, setSelectedPreset] = useState<PresetData | null>(null);
  const [customization, setCustomization] = useState<CharacterCustomization | null>(null);
  const [shotSelection, setShotSelection] = useState<'all' | string[]>('all');
  const [operationId, setOperationId] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<any>(null);
  const [results, setResults] = useState<any>(null);

  // Preset mapping
  const presetDefaults: Record<string, string> = {
    'business-executive': 'Senior Business Executive',
    'lifestyle-influencer': 'Lifestyle Content Creator',
    'insurance-specialist': 'Insurance Advisor',
    'healthcare-professional': 'Healthcare Professional',
    'tech-entrepreneur': 'Tech Entrepreneur',
    'creative-director': 'Creative Director'
  };

  const handlePresetSelect = (presetId: string) => {
    setSelectedPreset({
      id: presetId,
      name: presetId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      defaultProfession: presetDefaults[presetId] || 'Professional'
    });
  };

  const handleNextStep = () => {
    const steps: Step[] = ['preset', 'customize', 'shots', 'generating', 'results'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const handlePreviousStep = () => {
    const steps: Step[] = ['preset', 'customize', 'shots', 'generating', 'results'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const startGeneration = async () => {
    if (!selectedPreset || !customization) {
      alert('Please complete all steps');
      return;
    }

    // Get user's API key from localStorage
    const userApiKey = localStorage.getItem("gemini_api_key");

    if (!userApiKey) {
      alert('API Key Required. Please set your Google Gemini API key in settings.');
      return;
    }

    setCurrentStep('generating');

    try {
      // Start generation
      const response = await fetch('/api/generate-character-library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          presetId: selectedPreset.id,
          customizations: customization,
          shotSelection,
          options: {
            greenScreen: true,
            generateMetadata: true,
            generateUsageGuide: true,
            temperature: 0.3,
            apiKey: userApiKey
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      setOperationId(data.operationId);
      setGenerationStatus(data);

      // Start polling for status
      pollGenerationStatus(data.operationId);

    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to start generation: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setCurrentStep('shots');
    }
  };

  const pollGenerationStatus = async (opId: string) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/generate-character-library?operationId=${opId}`);
        const data = await response.json();

        setGenerationStatus(data);

        if (data.status === 'completed') {
          clearInterval(interval);
          setResults(data);
          setCurrentStep('results');
        } else if (data.status === 'failed') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Status check error:', error);
      }
    }, 2000); // Poll every 2 seconds

    // Clean up on unmount
    return () => clearInterval(interval);
  };

  const canProceed = () => {
    if (currentStep === 'preset') return selectedPreset !== null;
    if (currentStep === 'customize') return customization !== null && customization.name.length > 0;
    if (currentStep === 'shots') return shotSelection === 'all' || (Array.isArray(shotSelection) && shotSelection.length > 0);
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Character Library Generator
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Create professional 4-shot character libraries with one click
              </p>
            </div>
            <div className="text-sm text-gray-500">
              Powered by SmokeTech Studio 🚬
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      {currentStep !== 'results' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center space-x-4">
            {[
              { id: 'preset', label: 'Choose Preset', icon: '📋' },
              { id: 'customize', label: 'Customize', icon: '✏️' },
              { id: 'shots', label: 'Select Shots', icon: '🎬' },
              { id: 'generating', label: 'Generate', icon: '🎨' }
            ].map((step, index) => {
              const isActive = currentStep === step.id;
              const isCompleted = ['preset', 'customize', 'shots', 'generating'].indexOf(currentStep) > index;

              return (
                <React.Fragment key={step.id}>
                  <div className={`flex items-center ${isActive ? 'scale-110' : ''} transition-transform`}>
                    <div className={`
                      flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all
                      ${isCompleted ? 'bg-green-500 border-green-500 text-white' : ''}
                      ${isActive ? 'bg-blue-600 border-blue-600 text-white' : ''}
                      ${!isActive && !isCompleted ? 'bg-white border-gray-300 text-gray-400' : ''}
                    `}>
                      {isCompleted ? '✓' : step.icon}
                    </div>
                    <div className={`ml-3 ${isActive ? 'font-semibold' : ''}`}>
                      <div className={`text-sm ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                        Step {index + 1}
                      </div>
                      <div className={`text-xs ${isActive ? 'text-gray-900' : 'text-gray-600'}`}>
                        {step.label}
                      </div>
                    </div>
                  </div>
                  {index < 3 && (
                    <div className={`w-16 h-1 transition-colors ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'preset' && (
          <PresetSelector
            onPresetSelect={handlePresetSelect}
            selectedPresetId={selectedPreset?.id}
          />
        )}

        {currentStep === 'customize' && selectedPreset && (
          <CharacterCustomizer
            presetName={selectedPreset.name}
            defaultProfession={selectedPreset.defaultProfession}
            onCustomizationChange={setCustomization}
          />
        )}

        {currentStep === 'shots' && (
          <ShotTypeSelector onShotSelectionChange={setShotSelection} />
        )}

        {currentStep === 'generating' && operationId && generationStatus && (
          <GenerationProgress
            operationId={operationId}
            characterName={customization?.name || 'Character'}
            status={generationStatus.status}
            progress={generationStatus.progress}
            elapsedTime={generationStatus.elapsedTime || 0}
            error={generationStatus.error}
          />
        )}

        {currentStep === 'results' && results && (
          <ResultsGallery
            characterName={customization?.name || 'Character'}
            results={results.results || []}
            outputLocation={results.outputLocation || ''}
            metadata={results.metadata}
          />
        )}

        {/* Navigation Buttons */}
        {currentStep !== 'generating' && currentStep !== 'results' && (
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={handlePreviousStep}
              disabled={currentStep === 'preset'}
              className={`
                px-6 py-3 rounded-lg font-medium transition-colors
                ${currentStep === 'preset'
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }
              `}
            >
              ← Previous
            </button>

            <div className="text-sm text-gray-500">
              {currentStep === 'preset' && 'Select a character preset to begin'}
              {currentStep === 'customize' && 'Customize your character details'}
              {currentStep === 'shots' && 'Choose which shots to generate'}
            </div>

            {currentStep !== 'shots' ? (
              <button
                onClick={handleNextStep}
                disabled={!canProceed()}
                className={`
                  px-6 py-3 rounded-lg font-medium transition-colors
                  ${canProceed()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                Next →
              </button>
            ) : (
              <button
                onClick={startGeneration}
                disabled={!canProceed()}
                className={`
                  px-8 py-3 rounded-lg font-semibold transition-all
                  ${canProceed()
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                🎨 Generate Character Library
              </button>
            )}
          </div>
        )}

        {/* Start Over Button (Results Page) */}
        {currentStep === 'results' && (
          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setCurrentStep('preset');
                setSelectedPreset(null);
                setCustomization(null);
                setShotSelection('all');
                setOperationId(null);
                setGenerationStatus(null);
                setResults(null);
              }}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Generate Another Character
            </button>
          </div>
        )}
      </div>
    </div>
  );
}