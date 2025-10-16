"use client";

import { ContentGrid } from "@/components/content-grid";
import { ErrorBoundary } from "@/components/error-boundary";
import { GenerateVideoDialog } from "@/components/generate-video-dialog";
import { ActionCards } from "@/components/action-cards";
import { useState, useCallback } from "react";
import { ImageModel } from "@/lib/model-types";
import { CharacterPanel } from "@/components/omega/CharacterPanel";
import { useCharacterSelection } from "@/components/omega/character-selector";
import { usePresetSelection } from "@/components/omega/preset-dropdown";
import { useTheme } from "@/hooks/use-theme";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Moon, Sun } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useTheme();
  const [generateHandler, setGenerateHandler] = useState<((type: "image" | "video" | "omega" | "veo3", prompt: string, options?: any) => void) | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isGenerateVideoDialogOpen, setIsGenerateVideoDialogOpen] = useState(false);
  const { selectedCharacter, setSelectedCharacter } = useCharacterSelection();
  const { selectedPreset, setSelectedPreset } = usePresetSelection();

  const handleSetGenerator = useCallback((handler: (type: "image" | "video" | "omega" | "veo3", prompt: string, options?: any) => void) => {
    setGenerateHandler(() => handler);
  }, []);

  const handleSetImageToVideo = useCallback(() => {
    // Handler is set up in ContentGrid component
  }, []);

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:bg-none dark:bg-slate-950 transition-colors duration-300">
        {/* Header with Logo and Title */}
        <header className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-gray-100 dark:border-transparent">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-8">
              {/* SmokeTech Logo - Left Side */}
              <div className="flex-shrink-0 text-center">
                <Image
                  src="/SmokeTech Logo-min.png"
                  alt="SmokeTech"
                  width={120}
                  height={120}
                  className="h-24 w-auto mx-auto"
                />
                <h2 className="mt-2 text-sm font-bold tracking-wider bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                  SMOKETECH STUDIO
                </h2>
              </div>

              {/* Page Title - Centered */}
              <div className="flex-1 text-center pt-6">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-wider bg-gradient-to-r from-gray-300 via-gray-400 to-gray-500 dark:from-gray-300 dark:via-gray-400 dark:to-gray-500 from-gray-600 via-gray-700 to-gray-800 bg-clip-text text-transparent">
                  Infinite Creation, One Studio
                </h1>
              </div>

              {/* Theme Toggle */}
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="flex-shrink-0 p-3 rounded-lg bg-gray-100 dark:bg-slate-800/50 hover:bg-gray-200 dark:hover:bg-slate-700/50 transition-all border border-gray-300 dark:border-slate-700"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? (
                    <Sun className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Moon className="w-5 h-5 text-slate-700" />
                  )}
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Action Cards */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <ActionCards
            onGenerateVideo={() => setIsGenerateVideoDialogOpen(true)}
            onWorkflowGenerator={() => router.push('/workflow-generator')}
            onCharacterLibrary={() => router.push('/character-library')}
          />
        </section>

        {/* Main content area */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <ContentGrid
            onNewGeneration={handleSetGenerator}
            onImageToVideo={handleSetImageToVideo}
          />
        </main>
      </div>

      {/* Character Settings Panel - Rendered at root level for proper fixed positioning */}
      <CharacterPanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        selectedCharacter={selectedCharacter}
        onCharacterChange={setSelectedCharacter}
        selectedPreset={selectedPreset}
        onPresetChange={setSelectedPreset}
      />

      {/* Generate Video Dialog */}
      <GenerateVideoDialog
        open={isGenerateVideoDialogOpen}
        onOpenChange={setIsGenerateVideoDialogOpen}
      />
    </ErrorBoundary>
  );
}
