import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Shield,
  Code,
  CheckSquare,
  Zap,
  Kanban,
  Activity,
  Bug
} from 'lucide-react';

export const OnboardingTourModal = () => {
  const { currentUser, currentRole, completeTour, isOnboardingOpen, setIsOnboardingOpen } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOnboardingOpen) return null;

  const roleTourSteps = {
    MANAGER: [
      {
        title: 'Welcome to StandupFlow Manager Console',
        desc: 'As a Manager or Team Lead, you have complete visibility over sprint progress, team workload, project health, and appraisals.',
        icon: Shield,
        color: 'from-blue-600 to-indigo-800'
      },
      {
        title: 'Sprint Planning & Burndown Velocity',
        desc: 'Track active sprints, create sprint goals, and view real-time burndown charts comparing ideal vs actual story points.',
        icon: Zap,
        color: 'from-amber-600 to-orange-700'
      },
      {
        title: 'Team Activity & Workload Balancing',
        desc: 'Monitor team capacity with automated workload indicators (Balanced, High, Overloaded) and live chronological activity logs.',
        icon: Activity,
        color: 'from-emerald-600 to-teal-800'
      }
    ],
    DEVELOPER: [
      {
        title: 'Welcome to Developer Workspace',
        desc: 'Manage your active task queue, track sprint assignments, add work notes, and submit code for review.',
        icon: Code,
        color: 'from-indigo-600 to-purple-800'
      },
      {
        title: 'Kanban & Table Task Queue',
        desc: 'Easily transition tasks between Backlog, In Progress, and In Review. Use Task Details drawer to check subtasks & comments.',
        icon: Kanban,
        color: 'from-blue-600 to-indigo-700'
      },
      {
        title: 'Bug Fix Triage & Submit Review',
        desc: 'View defect bugs assigned to you by QA testers and submit work for testing with a single click.',
        icon: Bug,
        color: 'from-red-600 to-rose-800'
      }
    ],
    TESTER: [
      {
        title: 'Welcome to QA / Tester Workspace',
        desc: 'Review developer task submissions, run test suites, attach screenshot evidence, and report defects.',
        icon: CheckSquare,
        color: 'from-fuchsia-600 to-pink-800'
      },
      {
        title: 'Testing Queue & QA Triage',
        desc: 'Filter tasks by Pending Testing, In Testing, Passed, and Failed. Validate developer work items with one-click actions.',
        icon: CheckCircle2,
        color: 'from-emerald-600 to-teal-800'
      },
      {
        title: 'Screenshot Evidence Bug Reporting',
        desc: 'Log bugs with steps to reproduce, expected vs actual results, severity triage, and screenshot file previews.',
        icon: Bug,
        color: 'from-red-600 to-rose-800'
      }
    ]
  };

  const steps = roleTourSteps[currentRole] || roleTourSteps.MANAGER;
  const stepInfo = steps[currentStep] || steps[0];
  const StepIcon = stepInfo.icon;

  const handleSkip = () => {
    completeTour();
    setIsOnboardingOpen(false);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header Hero Gradient */}
        <div className={`p-6 bg-gradient-to-r ${stepInfo.color} text-white relative`}>
          <button
            onClick={handleSkip}
            className="absolute top-3 right-3 text-white/70 hover:text-white p-1 rounded-md text-xs font-semibold hover:bg-white/10 transition-colors flex items-center space-x-1"
          >
            <span>Skip Tutorial</span>
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-3">
            <StepIcon className="w-6 h-6 text-white" />
          </div>

          <h2 className="text-lg font-bold tracking-tight">{stepInfo.title}</h2>
          <p className="text-xs text-white/90 mt-1 leading-relaxed">{stepInfo.desc}</p>
        </div>

        {/* Step Indicators */}
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-center space-x-2">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep ? 'w-6 bg-blue-600' : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Navigation Bar */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1 transition-colors ${
                currentStep === 0 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleSkip}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 underline"
            >
              Skip Tutorial
            </button>

            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md text-xs shadow-2xs transition-colors flex items-center space-x-1"
            >
              <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
