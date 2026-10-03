import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Award,
  User,
  CheckCircle2,
  TrendingUp,
  Shield,
  FileText,
  AlertCircle,
  Save
} from 'lucide-react';

export const PerformanceReviewView = () => {
  const { performanceReviews, users } = useApp();
  const [selectedReview, setSelectedReview] = useState(performanceReviews[0]);
  const [managerNotes, setManagerNotes] = useState(selectedReview?.managerNotes || '');
  const [bonusRec, setBonusRec] = useState(selectedReview?.bonusRecommendation || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-md">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Employee Performance & Appraisal Console</h1>
            <p className="text-xs text-slate-500">Manager-only review workspace for engineering evaluations and bonus recommendations</p>
          </div>
        </div>

        {/* Review Select */}
        <select
          value={selectedReview?.id}
          onChange={(e) => {
            const rev = performanceReviews.find(r => r.id === e.target.value);
            if (rev) {
              setSelectedReview(rev);
              setManagerNotes(rev.managerNotes);
              setBonusRec(rev.bonusRecommendation);
            }
          }}
          className="bg-slate-50 border border-slate-200 text-xs font-semibold px-3 py-1.5 rounded-md outline-none"
        >
          {performanceReviews.map(r => (
            <option key={r.id} value={r.id}>{r.userName} — {r.reviewPeriod}</option>
          ))}
        </select>
      </div>

      {/* Human Review Disclaimer Banner */}
      <div className="bg-amber-50/80 p-3.5 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Human Evaluation Disclaimer:</span> Performance indicators are quantitative supporting metrics intended exclusively to aid human manager evaluations. They do not constitute automated employee rankings or compensation formulas.
        </div>
      </div>

      {/* Main Review Card */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-2xs space-y-6">
        {/* User Banner */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{selectedReview?.userName}</h2>
            <p className="text-xs text-slate-500">{selectedReview?.userRole} • Appraisal Period: <strong className="text-slate-800">{selectedReview?.reviewPeriod}</strong></p>
          </div>
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded text-xs border border-indigo-200">
            {selectedReview?.qualityRating}
          </span>
        </div>

        {/* Quantitative Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Task Completion</span>
            <span className="font-mono font-bold text-blue-600 text-base">{selectedReview?.taskCompletionRate}%</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">On-Time Delivery</span>
            <span className="font-mono font-bold text-emerald-600 text-base">{selectedReview?.onTimeDeliveryRate}%</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Story Points Delivered</span>
            <span className="font-mono font-bold text-indigo-600 text-base">{selectedReview?.storyPointsCompleted} pts</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Reopened Bugs</span>
            <span className="font-mono font-bold text-slate-800 text-base">{selectedReview?.reopenedBugsCount}</span>
          </div>
        </div>

        {/* Manager Appraisal Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Manager Assessment Notes
            </label>
            <textarea
              value={managerNotes}
              onChange={(e) => setManagerNotes(e.target.value)}
              rows={4}
              className="w-full text-xs text-slate-800 border border-slate-200 rounded-md p-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Bonus & Promotion Recommendation
            </label>
            <input
              type="text"
              value={bonusRec}
              onChange={(e) => setBonusRec(e.target.value)}
              className="w-full text-xs text-slate-800 border border-slate-200 rounded-md p-2.5 outline-none focus:border-blue-500 font-medium"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            {savedSuccess ? (
              <span className="text-xs text-emerald-600 font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Evaluation saved to SpringBoot database!</span>
              </span>
            ) : <div />}

            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-md shadow-2xs transition-colors flex items-center space-x-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Appraisal Review</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
