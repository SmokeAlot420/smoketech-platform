"use client";

import { FilmIcon, SlidersHorizontalIcon, UsersIcon } from 'lucide-react';
import { ActionCard } from './action-card';

interface ActionCardsProps {
  onGenerateVideo: () => void;
  onWorkflowGenerator: () => void;
  onCharacterLibrary: () => void;
}

export function ActionCards({
  onGenerateVideo,
  onWorkflowGenerator,
  onCharacterLibrary
}: ActionCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {/* Generate Video Card */}
      <ActionCard
        icon={FilmIcon}
        title="Generate Video"
        description="Create professional AI-generated videos with Simple Mode (quick setup) or Power Mode (50+ advanced controls per segment)."
        ctaText="Start Creating"
        onClick={onGenerateVideo}
        gradient="from-purple-500/10 to-blue-500/10"
        badge="New!"
      />

      {/* Workflow Generator Card */}
      <ActionCard
        icon={SlidersHorizontalIcon}
        title="Workflow Generator"
        description="Build custom video workflows with drag-and-drop simplicity. Choose from 3 modes: Quick, Custom, or Advanced JSON editing."
        ctaText="Build Workflow"
        onClick={onWorkflowGenerator}
        gradient="from-blue-500/10 to-cyan-500/10"
        badge="3 Modes"
      />

      {/* Character Library Card */}
      <ActionCard
        icon={UsersIcon}
        title="Character Library"
        description="Browse and manage your ultra-realistic AI characters. Create consistent characters across all your video projects."
        ctaText="Browse Library"
        onClick={onCharacterLibrary}
        gradient="from-green-500/10 to-emerald-500/10"
      />
    </div>
  );
}
