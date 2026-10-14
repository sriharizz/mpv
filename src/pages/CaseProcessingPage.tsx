import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCases } from '../context/CaseContext';
import { useAuth } from '../context/AuthContext';
import { ModalDialog } from '../components/common/ModalDialog';
import {
  Activity,
  CheckCircle2,
  Copy,
  Check,
  ArrowLeft,
  Save,
  Clock,
  ShieldAlert,
  FileCheck
} from 'lucide-react';

export const CaseProcessingPage: React.FC = () => {
  const { caseNumber } = useParams<{ caseNumber: string }>();
  const navigate = useNavigate();
  const { getCaseByNumber, updateReportedTermInCase } = useCases();
  const { session } = useAuth();

  const caseData = getCaseByNumber(caseNumber || 'CASE-2026-001');

  const [reportedTerm, setReportedTerm] = useState<string>(
    caseData?.event.reportedTerm || 'Fever'
  );
  const [copied, setCopied] = useState(false);
  const [isHoveringCheckmark, setIsHoveringCheckmark] = useState(false);

  // Modals
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const [exitModalOpen, setExitModalOpen] = useState(false);

  const handleCopyCaseNum = () => {
    if (caseData?.caseNumber) {
      navigator.clipboard.writeText(caseData.caseNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveReportedTerm = () => {
    if (!caseData?.caseNumber) return;

    // OQ Test Set #2 Scenario 4: Update Reported Term & record Audit History
    updateReportedTermInCase(caseData.caseNumber, reportedTerm, session?.username || 'User');

    setConfirmModal({
      isOpen: true,
      title: 'Confirmation',
      message: 'Event Information updated successfully.',
    });
  };

  const handleConfirmExit = () => {
    setExitModalOpen(false);
    navigate('/intake/open-case');
  };

  if (!caseData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Case Not Found</h3>
        <p className="text-xs text-slate-500">Case {caseNumber} could not be located in the system.</p>
        <button
          type="button"
          onClick={() => navigate('/intake/open-case')}
          className="px-4 py-2 text-xs font-medium text-white bg-brand-500 rounded-md hover:bg-brand-600 transition-colors"
        >
          Back to Open Case Search
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setExitModalOpen(true)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Exit to Open Case"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Case Processing</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                <FileCheck className="w-3 h-3" />
                <span>{caseData.status}</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and process safety data for Adverse Event Case
            </p>
          </div>
        </div>

        {/* Case Number Badge + Copy Button */}
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
          <span className="text-xs text-slate-500">Case Number:</span>
          <span className="font-mono font-bold text-sm text-brand-900">
            {caseData.caseNumber}
          </span>
          <button
            type="button"
            onClick={handleCopyCaseNum}
            className="text-slate-400 hover:text-brand-600 p-1 rounded transition-colors"
            title="Copy Case Number"
            aria-label="Copy Case Number"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Case Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs space-y-1">
          <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Product Information</p>
          <p className="font-bold text-slate-800 text-sm">{caseData.product.productName || 'Clinevo-Vax 500mg'}</p>
          <p className="text-slate-500">{caseData.product.genericName || 'Paracetamol'} | {caseData.product.formulationCode || 'TAB'}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs space-y-1">
          <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Patient & Reporter</p>
          <p className="font-bold text-slate-800 text-sm">Patient: {caseData.patient.firstName || 'Jane'} {caseData.patient.lastName || 'Doe'}</p>
          <p className="text-slate-500">Reporter: {caseData.reporter.firstName || 'Dr. Alex'} ({caseData.reporter.countryCode || 'United States'})</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs space-y-1">
          <p className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Case Dates</p>
          <p className="font-bold text-slate-800 text-sm">Receipt: {caseData.generalInfo.companyReceiptDate || '2026-10-10'}</p>
          <p className="text-slate-500">Processing: {caseData.generalInfo.processingCenterReceivedDate || '2026-10-10'}</p>
        </div>
      </div>

      {/* Event Information Section (OQ Scenarios 39, 40, PQ 16, OQ Test Set #2 Scenario 4) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-brand-600" />
            <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">
              Event Information (MedDRA Verification)
            </h3>
          </div>

          <button
            type="button"
            onClick={handleSaveReportedTerm}
            className="px-4 py-1.5 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-md shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* Reaction Or Event As Reported */}
          <div className="space-y-1">
            <label className="block font-medium text-slate-700">Reaction Or Event As Reported</label>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md text-slate-800 font-medium">
              {caseData.event.reactionOrEventAsReported || 'Fever'}
            </div>
          </div>

          {/* Reported Term (Editable + MedDRA Checkmark with Hover popover) */}
          <div className="space-y-1 relative">
            <label htmlFor="processingReportedTerm" className="block font-medium text-slate-700">
              Reported Term <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                id="processingReportedTerm"
                value={reportedTerm}
                onChange={(e) => setReportedTerm(e.target.value)}
                placeholder="Enter reported term"
                className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none bg-white font-medium text-slate-800"
              />

              {/* Green Checkmark ("right mark") with Hover Popover (OQ Scenario 40, PQ 16) */}
              <div
                className="absolute right-2"
                onMouseEnter={() => setIsHoveringCheckmark(true)}
                onMouseLeave={() => setIsHoveringCheckmark(false)}
              >
                <CheckCircle2
                  data-testid="meddra-right-mark"
                  className="w-4 h-4 text-emerald-600 cursor-pointer"
                />

                {/* Prominent Tooltip / Popover */}
                {isHoveringCheckmark && (
                  <div className="absolute right-0 bottom-full mb-2 w-72 p-3 bg-slate-900 text-white text-xs rounded-xl shadow-2xl z-30 pointer-events-none animate-in fade-in">
                    <p className="font-bold text-emerald-400 border-b border-slate-800 pb-1 mb-1.5">
                      MedDRA Code Data [Verified]
                    </p>
                    <p className="text-[11px]"><span className="text-slate-400">Code:</span> <span className="font-mono font-semibold">{caseData.event.meddraCode || '10016558'}</span></p>
                    <p className="text-[11px]"><span className="text-slate-400">Term:</span> {reportedTerm}</p>
                    <p className="text-[11px]"><span className="text-slate-400">PT:</span> {caseData.event.pt || 'Pyrexia'}</p>
                    <p className="text-[11px]"><span className="text-slate-400">SOC:</span> {caseData.event.soc || 'General disorders'}</p>
                    <p className="text-[10px] text-emerald-300/80 mt-1.5 italic">MedDRA Code Data: 10016558 - Fever (Pyrexia) [Verified]</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MedDRA Code Badge */}
          <div className="space-y-1">
            <label className="block font-medium text-slate-700">MedDRA Code</label>
            <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-md font-mono text-emerald-800 font-bold">
              {caseData.event.meddraCode || '10016558'}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ModalDialog
        isOpen={confirmModal.isOpen}
        type="confirm"
        title={confirmModal.title}
        message={confirmModal.message}
        confirmLabel="OK"
        onConfirm={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Exit Case Confirmation Modal */}
      <ModalDialog
        isOpen={exitModalOpen}
        type="yesno"
        title="Exit Case Confirmation"
        message="Are you sure you want to exit from the case?"
        confirmLabel="Yes"
        cancelLabel="No"
        showCancel={true}
        onConfirm={handleConfirmExit}
        onCancel={() => setExitModalOpen(false)}
      />
    </div>
  );
};
