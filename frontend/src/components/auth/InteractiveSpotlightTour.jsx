import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  MousePointerClick,
  CheckCircle2,
  Info
} from 'lucide-react';

export const InteractiveSpotlightTour = () => {
  const { currentUser, currentRole, completeTour, isOnboardingOpen, setIsOnboardingOpen } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  const tourSteps = [
    {
      targetId: 'brand-logo',
      title: 'StandupFlow Console Header',
      content: 'This top bar displays your active company workspace, system version, and role-assigned badge.',
      position: 'bottom-left'
    },
    {
      targetId: 'project-switcher',
      title: 'Active Project Registry',
      content: 'Click here to switch between active software repositories (E-Commerce Platform, Payment Gateway, Security Console).',
      position: 'bottom-left'
    },
    {
      targetId: 'action-btn',
      title: 'Quick Action Button',
      content: 'Use this primary action button to create new sprint tasks or report QA defect bugs instantly.',
      position: 'bottom-right'
    },
    {
      targetId: 'sidebar-nav',
      title: 'Role Navigation Rail',
      content: 'Access your role-authorized workspace, Kanban boards, issue registries, sprints, and health monitors.',
      position: 'right'
    },
    {
      targetId: 'notifications-btn',
      title: 'Notification & Activity Hub',
      content: 'Receive real-time alerts for task assignments, code review requests, and sprint deadlines.',
      position: 'bottom-right'
    },
    {
      targetId: 'profile-menu',
      title: 'Profile Settings & Manager Join Code',
      content: 'Click your avatar to open Settings where you can edit your profile, change passwords, or join a Manager Team Code.',
      position: 'bottom-right'
    }
  ];

  const currentStepData = tourSteps[currentStep] || tourSteps[0];

  useEffect(() => {
    if (!isOnboardingOpen) return;

    const updateSpotlight = () => {
      const el = document.getElementById(currentStepData.targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        setTargetRect({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        setTargetRect(null);
      }
    };

    updateSpotlight();
    window.addEventListener('resize', updateSpotlight);
    return () => window.removeEventListener('resize', updateSpotlight);
  }, [currentStep, isOnboardingOpen]);

  if (!isOnboardingOpen) return null;

  const handleSkip = () => {
    completeTour();
    setIsOnboardingOpen(false);
  };

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
      setIsOnboardingOpen(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-auto select-none">
      {/* Dark Scrim Backdrop with Cutout Spotlight */}
      <div className="absolute inset-0 bg-slate-950/70 transition-all duration-300" />

      {/* Target Element Glowing Ring */}
      {targetRect && (
        <div
          className="absolute border-2 border-blue-500 rounded-lg shadow-[0_0_25px_rgba(37,99,235,0.8)] transition-all duration-300 pointer-events-none animate-pulse"
          style={{
            top: `${targetRect.top - 4}px`,
            left: `${targetRect.left - 4}px`,
            width: `${targetRect.width + 8}px`,
            height: `${targetRect.height + 8}px`
          }}
        />
      )}

      {/* Interactive Tooltip Popover */}
      <div
        className="absolute z-50 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200"
        style={{
          top: targetRect ? Math.min(window.innerHeight - 240, Math.max(20, targetRect.top + targetRect.height + 12)) : '30%',
          left: targetRect ? Math.min(window.innerWidth - 340, Math.max(20, targetRect.left)) : '35%'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
              {currentStep + 1}
            </div>
            <span className="text-xs font-bold text-slate-900">{currentStepData.title}</span>
          </div>

          <button
            onClick={handleSkip}
            className="text-slate-400 hover:text-slate-700 p-0.5 rounded text-[11px] font-semibold flex items-center"
          >
            <span>Skip Tour</span>
            <X className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {/* Content */}
        <p className="text-xs text-slate-600 leading-relaxed">
          {currentStepData.content}
        </p>

        {/* Footer Navigation Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
          <span className="text-[10px] text-slate-400 font-mono">
            {currentStep + 1} of {tourSteps.length}
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center space-x-1 ${
                currentStep === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-2xs transition-colors flex items-center space-x-1"
            >
              <span>{currentStep === tourSteps.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
