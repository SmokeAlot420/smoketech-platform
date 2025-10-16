"use client";

import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  ctaText: string;
  onClick: () => void;
  gradient?: string;
  badge?: string;
}

export function ActionCard({
  icon: Icon,
  title,
  description,
  ctaText,
  onClick,
  gradient = "from-blue-500/10 to-indigo-500/10",
  badge
}: ActionCardProps) {
  return (
    <div className="group relative bg-white dark:bg-slate-950 dark:hover:bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 border border-transparent dark:border-slate-700/50 shadow-sm dark:shadow-none hover:border-transparent dark:hover:border-slate-600 hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 dark:hover:shadow-blue-500/10">
      {/* Glass effect overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />

      {/* Content */}
      <div className="relative z-10">
        {/* Icon with badge */}
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-gray-50 dark:bg-slate-700/30 rounded-xl group-hover:bg-gray-100 dark:group-hover:bg-slate-600/40 transition-all">
            <Icon className="w-7 h-7 text-gray-600 dark:text-gray-300" />
          </div>
          {badge && (
            <span className="text-xs font-bold px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full shadow-lg">
              {badge}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
          {description}
        </p>

        {/* CTA Button */}
        <Button
          onClick={onClick}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg hover:shadow-xl transition-all font-semibold"
        >
          {ctaText}
        </Button>
      </div>
    </div>
  );
}
