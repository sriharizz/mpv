import React, { useState } from 'react';
import { useCases } from '../../context/CaseContext';
import { useAuth } from '../../context/AuthContext';
import { EventInfo } from '../../types/onepv';
import { Activity, Search, CheckCircle2, X } from 'lucide-react';
import { ModalDialog } from '../common/ModalDialog';

const STANDARD_MEDDRA_TERMS = [
  {
    reportedTerm: 'Fever',
    meddraCode: '10016558',
    pt: 'Pyrexia',
    soc: 'General disorders',
  },
  {
    reportedTerm: 'Headache',
    meddraCode: '10019211',
    pt: 'Headache',
    soc: 'Nervous system disorders',
  },
  {
    reportedTerm: 'Nausea',
    meddraCode: '10028813',
    pt: 'Nausea',
    soc: 'Gastrointestinal disorders',
  },
  {
    reportedTerm: 'Rash',
    meddraCode: '10037844',
    pt: 'Rash',
    soc: 'Skin and subcutaneous tissue disorders',
  },
];

export const EventSection: React.FC = () => {
  const { currentCase, updateEvent } = useCases();
  const { session } = useAuth();

  const [formData, setFormData] = useState<EventInfo>(currentCase.event);
  const [hasSavedBefore, setHasSavedBefore] = useState<boolean>(currentCase.event.saved);

  // MedDRA Search Modal
  const [isMeddraModalOpen, setIsMeddraModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeddraIdx, setSelectedMeddraIdx] = useState<number>(0);
  const [isHoveringCheckmark, setIsHoveringCheckmark] = useState(false);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const handleOpenMeddraSearch = () => {
    setSearchQuery(formData.reportedTerm || formData.reactionOrEventAsReported || '');
    setSelectedMeddraIdx(0);
    setIsMeddraModalOpen(true);
  };

  // Build candidate MedDRA list (including dynamic match for any typed term)
  const candidateList = [...STANDARD_MEDDRA_TERMS];
  if (
    searchQuery.trim() &&
    !candidateList.some((t) => t.reportedTerm.toLowerCase() === searchQuery.trim().toLowerCase())
  ) {
    candidateList.unshift({
      reportedTerm: searchQuery.trim(),
      meddraCode: '10054321',
      pt: searchQuery.trim(),
      soc: 'General disorders and administration site conditions',
    });
  }

  const handleSelectMeddra = () => {
    const chosen = candidateList[selectedMeddraIdx] || candidateList[0];
    setFormData((prev) => ({
      ...prev,
      reportedTerm: chosen.reportedTerm,
      meddraCode: chosen.meddraCode,
      pt: chosen.pt,
      soc: chosen.soc,
    }));
    setIsMeddraModalOpen(false);
  };

  const handleSaveEvent = () => {
    updateEvent(formData, session?.username || 'User');
    const wasSaved = hasSavedBefore;
    setHasSavedBefore(true);

    setModalState({
      isOpen: true,
      title: 'Event Confirmation',
      message: wasSaved
        ? 'Event updated successfully.'
        : 'Event Information saved successfully.',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
      <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
        <Activity className="w-4 h-4 text-brand-600" />
        <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Event Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        {/* Reaction Or Event As Reported */}
        <div className="space-y-1">
          <label htmlFor="reactionOrEventAsReported" className="block font-medium text-slate-700">
            Reaction Or Event As Reported <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="reactionOrEventAsReported"
            value={formData.reactionOrEventAsReported}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, reactionOrEventAsReported: e.target.value }))
            }
            placeholder="e.g. Fever"
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        {/* Reported Term + MedDRA Search + Green Right Mark */}
        <div className="space-y-1 relative">
          <div className="flex items-center justify-between">
            <label htmlFor="reportedTerm" className="block font-medium text-slate-700">
              Reported Term <span className="text-red-500">*</span>
            </label>
            {formData.meddraCode && (
              <span
                data-testid="meddra-code-display"
                className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200"
              >
                Code: {formData.meddraCode}
              </span>
            )}
          </div>

          <div className="relative flex items-center">
            <input
              type="text"
              id="reportedTerm"
              value={formData.reportedTerm}
              onChange={(e) => setFormData((prev) => ({ ...prev, reportedTerm: e.target.value }))}
              placeholder="e.g. Fever"
              className="w-full pl-3 pr-14 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />

            {/* MedDRA Search Icon */}
            <button
              type="button"
              aria-label="Search Reported Term"
              data-testid="reported-term-search-icon"
              onClick={handleOpenMeddraSearch}
              className="absolute right-7 text-slate-400 hover:text-brand-600 p-1"
              title="Search MedDRA Code"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Green Checkmark ("right mark") with Hover Popover (OQ Scenarios 32, 33, PQ 12, 13) */}
            {formData.meddraCode && (
              <div
                className="absolute right-2"
                onMouseEnter={() => setIsHoveringCheckmark(true)}
                onMouseLeave={() => setIsHoveringCheckmark(false)}
              >
                <CheckCircle2
                  data-testid="meddra-right-mark"
                  className="w-4 h-4 text-emerald-600 cursor-pointer"
                />

                {/* Tooltip / Popover */}
                {isHoveringCheckmark && (
                  <div className="absolute right-0 bottom-full mb-1.5 w-64 p-2.5 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl z-30 pointer-events-none animate-in fade-in">
                    <p className="font-semibold text-emerald-400">MedDRA Coding Verified</p>
                    <p className="mt-0.5"><span className="text-slate-400">Code:</span> {formData.meddraCode}</p>
                    <p><span className="text-slate-400">Reported Term:</span> {formData.reportedTerm}</p>
                    <p><span className="text-slate-400">PT:</span> {formData.pt || formData.reportedTerm}</p>
                    <p><span className="text-slate-400">SOC:</span> {formData.soc || 'General disorders'}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-1">
          <label htmlFor="eventStartDate" className="block font-medium text-slate-700">
            Start Date
          </label>
          <input
            type="date"
            id="eventStartDate"
            value={formData.startDate}
            onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        {/* End Date */}
        <div className="space-y-1">
          <label htmlFor="eventEndDate" className="block font-medium text-slate-700">
            End Date
          </label>
          <input
            type="date"
            id="eventEndDate"
            value={formData.endDate}
            onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Assessment Subsection (4 Dropdowns) */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Assessment</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="space-y-1">
            <label htmlFor="caseSeriousReporterCode" className="block font-medium text-slate-700">
              Case Serious Reporter Code
            </label>
            <select
              id="caseSeriousReporterCode"
              value={formData.assessment.caseSeriousReporterCode}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  assessment: { ...prev.assessment, caseSeriousReporterCode: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-brand-500 focus:outline-none"
            >
              <option value="">Select Option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="caseSeriousCompanyCode" className="block font-medium text-slate-700">
              Case Serious Company Code
            </label>
            <select
              id="caseSeriousCompanyCode"
              value={formData.assessment.caseSeriousCompanyCode}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  assessment: { ...prev.assessment, caseSeriousCompanyCode: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-brand-500 focus:outline-none"
            >
              <option value="">Select Option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="outcomeCode" className="block font-medium text-slate-700">
              Outcome Code
            </label>
            <select
              id="outcomeCode"
              value={formData.assessment.outcomeCode}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  assessment: { ...prev.assessment, outcomeCode: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-brand-500 focus:outline-none"
            >
              <option value="">Select Outcome</option>
              <option value="Recovered/Resolved">Recovered/Resolved</option>
              <option value="Recovering/Resolving">Recovering/Resolving</option>
              <option value="Not Recovered">Not Recovered</option>
              <option value="Fatal">Fatal</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>

          <div className="space-y-1">
            <label htmlFor="lackOfEfficacy" className="block font-medium text-slate-700">
              Lack Of Efficacy
            </label>
            <select
              id="lackOfEfficacy"
              value={formData.assessment.lackOfEfficacy}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  assessment: { ...prev.assessment, lackOfEfficacy: e.target.value },
                }))
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-brand-500 focus:outline-none"
            >
              <option value="">Select Option</option>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
        </div>
      </div>

      {/* Seriousness Subsection (8 Dropdowns) */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Seriousness Criteria</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
          {[
            { key: 'death', label: 'Death' },
            { key: 'hospitalization', label: 'Hospitalization' },
            { key: 'lifeThreatening', label: 'Life Threatening' },
            { key: 'disabling', label: 'Disabling' },
            { key: 'congenitalAnomaly', label: 'Congenital Anomaly' },
            { key: 'interventionRequired', label: 'Intervention Required' },
            { key: 'medicallySignificant', label: 'Medically Significant' },
            { key: 'others', label: 'Others' },
          ].map(({ key, label }) => (
            <div key={key} className="space-y-1">
              <label htmlFor={key} className="block text-[11px] font-medium text-slate-700 truncate" title={label}>
                {label}
              </label>
              <select
                id={key}
                value={(formData.seriousness as any)[key]}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    seriousness: { ...prev.seriousness, [key]: e.target.value },
                  }))
                }
                className="w-full px-2 py-1.5 border border-slate-300 rounded-md bg-white text-xs focus:ring-1 focus:ring-brand-500 focus:outline-none"
              >
                <option value="">Select</option>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          data-testid="save-event-btn"
          onClick={handleSaveEvent}
          className="px-5 py-2 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-md shadow-sm transition-colors"
        >
          Save
        </button>
      </div>

      {/* MEDDRA CODING SEARCH MODAL */}
      {isMeddraModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-semibold text-sm text-slate-800">MedDRA Coding Search</h3>
              <button
                type="button"
                onClick={() => setIsMeddraModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Enter medical term"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600"
                >
                  Search
                </button>
              </div>

              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 w-12 text-center">Select</th>
                      <th className="px-3 py-2">Reported Term</th>
                      <th className="px-3 py-2">MedDRA Code</th>
                      <th className="px-3 py-2">Preferred Term (PT)</th>
                      <th className="px-3 py-2">SOC</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {candidateList.map((m, idx) => (
                      <tr
                        key={`${m.meddraCode}-${idx}`}
                        onClick={() => setSelectedMeddraIdx(idx)}
                        className={`cursor-pointer transition-colors ${
                          selectedMeddraIdx === idx ? 'bg-emerald-50/60' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="px-3 py-2 text-center">
                          <input
                            type="radio"
                            name="meddraRadio"
                            checked={selectedMeddraIdx === idx}
                            onChange={() => setSelectedMeddraIdx(idx)}
                            className="text-brand-600 focus:ring-brand-500"
                          />
                        </td>
                        <td className="px-3 py-2 font-medium text-slate-800">{m.reportedTerm}</td>
                        <td className="px-3 py-2 font-mono text-emerald-700 font-semibold">
                          {m.meddraCode}
                        </td>
                        <td className="px-3 py-2 text-slate-600">{m.pt}</td>
                        <td className="px-3 py-2 text-slate-500 text-[11px]">{m.soc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsMeddraModalOpen(false)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSelectMeddra}
                className="px-4 py-1.5 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-md shadow-sm"
              >
                Select
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ModalDialog
        isOpen={modalState.isOpen}
        type="confirm"
        title={modalState.title}
        message={modalState.message}
        confirmLabel="OK"
        onConfirm={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
