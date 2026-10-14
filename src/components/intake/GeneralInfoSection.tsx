import React, { useState } from 'react';
import { useCases } from '../../context/CaseContext';
import { useSimulation } from '../../context/SimulationContext';
import { ModalDialog } from '../common/ModalDialog';
import { AlertCircle, Lock } from 'lucide-react';

interface GeneralInfoSectionProps {
  onCaseRegistered?: (tempId: string) => void;
}

export const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({ onCaseRegistered }) => {
  const { currentCase, updateGeneralInfo, clearGeneralInfo } = useCases();
  const { mode } = useSimulation();

  const [classification, setClassification] = useState(currentCase.generalInfo.caseClassificationCode);
  const [intakeSource, setIntakeSource] = useState(currentCase.generalInfo.caseIntakeSourceCode);
  const [companyReceiptDate, setCompanyReceiptDate] = useState(currentCase.generalInfo.companyReceiptDate);
  const [processingCenterDate, setProcessingCenterDate] = useState(currentCase.generalInfo.processingCenterReceivedDate);

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'error' | 'confirm';
    title: string;
    message: string;
    onOk?: () => void;
  }>({
    isOpen: false,
    type: 'confirm',
    title: '',
    message: '',
  });

  const handleSave = () => {
    // If BLOCKED mode is active
    if (mode === 'BLOCKED') {
      return;
    }

    // OQ Scenario 5: Case Classification, Intake Source, and Company Receipt Date are empty (only processing center entered)
    if (!classification && !intakeSource && !companyReceiptDate) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Error: Case Classifications Code, Case Intake Source Code, and Company Receipt Date cannot be empty.',
      });
      return;
    }

    // OQ Scenario 6: Case Intake Source and Company Receipt Date empty
    if (!intakeSource && !companyReceiptDate) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Error: Case Intake Source Code and Company Receipt Date cannot be empty.',
      });
      return;
    }

    // OQ Scenario 7: Company Receipt Date empty
    if (!companyReceiptDate) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Error: Company Receipt Date cannot be empty.',
      });
      return;
    }

    // OQ Scenario 8: Classification does not match Adverse Event registration
    if (classification === 'General Inquiry') {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Error: Case Classification does not match Adverse Event registration.',
      });
      return;
    }

    // Valid save (OQ Scenario 9 / PQ Scenario 4)
    const tempId = updateGeneralInfo({
      caseClassificationCode: classification,
      caseIntakeSourceCode: intakeSource,
      companyReceiptDate,
      processingCenterReceivedDate: processingCenterDate,
    });

    if (onCaseRegistered) {
      onCaseRegistered(tempId);
    }

    setModalState({
      isOpen: true,
      type: 'confirm',
      title: 'Registration Confirmation',
      message: `Case registered successfully. Case ID: ${tempId} created.`,
    });
  };

  const handleClear = () => {
    setClassification('');
    setIntakeSource('');
    setCompanyReceiptDate('');
    setProcessingCenterDate('');
    clearGeneralInfo();
  };

  return (
    <div className="relative bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
      {/* Simulation BLOCKED overlay if mode === 'BLOCKED' */}
      {mode === 'BLOCKED' && (
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] z-20 rounded-xl flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-white p-4 rounded-xl shadow-xl max-w-sm border border-amber-300">
            <Lock className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h4 className="font-semibold text-slate-800 text-sm">Environment Service Unavailable (503)</h4>
            <p className="text-xs text-slate-600 mt-1">Control Locked: Case registration service is temporarily unavailable.</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">General Info</h3>
        {currentCase.temporaryCaseId && (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-brand-50 text-brand-700 border border-brand-200">
            Temporary Case ID: {currentCase.temporaryCaseId}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Case Classifications Code */}
        <div className="space-y-1.5">
          <label htmlFor="caseClassificationCode" className="block text-xs font-medium text-slate-700">
            Case Classifications Code <span className="text-red-500">*</span>
          </label>
          <select
            id="caseClassificationCode"
            name="caseClassificationCode"
            value={classification}
            onChange={(e) => setClassification(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="">Select Classification</option>
            <option value="Adverse Event">Adverse Event</option>
            <option value="General Inquiry">General Inquiry</option>
            <option value="Product Quality Complaint">Product Quality Complaint</option>
          </select>
        </div>

        {/* Case Intake Source Code */}
        <div className="space-y-1.5">
          <label htmlFor="caseIntakeSourceCode" className="block text-xs font-medium text-slate-700">
            Case Intake Source Code <span className="text-red-500">*</span>
          </label>
          <select
            id="caseIntakeSourceCode"
            name="caseIntakeSourceCode"
            value={intakeSource}
            onChange={(e) => setIntakeSource(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="">Select Intake Source</option>
            <option value="Spontaneous">Spontaneous</option>
            <option value="Other">Other</option>
            <option value="Clinical Trial">Clinical Trial</option>
            <option value="Literature">Literature</option>
          </select>
        </div>

        {/* Company Receipt Date */}
        <div className="space-y-1.5">
          <label htmlFor="companyReceiptDate" className="block text-xs font-medium text-slate-700">
            Company Receipt Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="companyReceiptDate"
            name="companyReceiptDate"
            value={companyReceiptDate}
            onChange={(e) => setCompanyReceiptDate(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>

        {/* Processing Center Received Date */}
        <div className="space-y-1.5">
          <label htmlFor="processingCenterReceivedDate" className="block text-xs font-medium text-slate-700">
            Processing Center Received Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="processingCenterReceivedDate"
            name="processingCenterReceivedDate"
            value={processingCenterDate}
            onChange={(e) => setProcessingCenterDate(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end space-x-2.5 pt-2">
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
        >
          Clear
        </button>
        {mode !== 'BLOCKED' && (
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-md shadow-sm transition-colors"
          >
            Save
          </button>
        )}
      </div>

      {/* Pop-up Modal */}
      <ModalDialog
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        confirmLabel="OK"
        onConfirm={() => {
          setModalState((prev) => ({ ...prev, isOpen: false }));
          if (modalState.onOk) modalState.onOk();
        }}
      />
    </div>
  );
};
