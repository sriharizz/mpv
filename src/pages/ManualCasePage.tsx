import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCases } from '../context/CaseContext';
import { useSimulation } from '../context/SimulationContext';
import { GeneralInfoSection } from '../components/intake/GeneralInfoSection';
import { QuestionnaireTab } from '../components/intake/QuestionnaireTab';
import { ReporterSection } from '../components/intake/ReporterSection';
import { PatientSection } from '../components/intake/PatientSection';
import { ProductSection } from '../components/intake/ProductSection';
import { EventSection } from '../components/intake/EventSection';
import { ActivityLogSection } from '../components/intake/ActivityLogSection';
import { ModalDialog } from '../components/common/ModalDialog';
import { Save, Send, CheckSquare, RotateCcw } from 'lucide-react';

export const ManualCasePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentCase, submitCase, resetCurrentCase } = useCases();
  const { mode } = useSimulation();

  // Submission Yes/No Confirmation modal
  const [submissionSuccessModal, setSubmissionSuccessModal] = useState<{
    isOpen: boolean;
    caseNumber: string;
  }>({
    isOpen: false,
    caseNumber: '',
  });

  // Validation Error Modal
  const [errorModal, setErrorModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  // Global Submit validation logic
  const handleValidateAndSubmit = (isSaveAndSubmit: boolean = false) => {
    // FAIL Simulation Mode Defect A:
    // Clicking Submit on an empty form fails to display the required error message pop-up
    // or displays "System Status: 200 OK - No validation error"
    if (mode === 'FAIL') {
      const isAllEmpty =
        !currentCase.generalInfo.caseClassificationCode &&
        !currentCase.reporter.firstName &&
        !currentCase.patient.firstName &&
        !currentCase.product.productName &&
        !currentCase.event.reactionOrEventAsReported;

      if (isAllEmpty) {
        setErrorModal({
          isOpen: true,
          title: 'System Notice',
          message: 'System Status: 200 OK - No validation error',
        });
        return;
      }
    }

    const { generalInfo, reporter, patient, product, event } = currentCase;

    // OQ Scenario 4: All fields empty
    const hasAnyGeneral = Boolean(generalInfo.caseClassificationCode || generalInfo.caseIntakeSourceCode);
    const hasReporter = Boolean(reporter.firstName || reporter.countryCode);
    const hasPatient = Boolean(patient.firstName || patient.initials);
    const hasProduct = Boolean(product.productName);
    const hasEvent = Boolean(event.reactionOrEventAsReported || event.reportedTerm);

    if (!hasAnyGeneral && !hasReporter && !hasPatient && !hasProduct && !hasEvent) {
      setErrorModal({
        isOpen: true,
        title: 'Validation Error',
        message: 'Error: Cannot submit case without entering mandatory data.',
      });
      return;
    }

    // OQ Scenario 19: Reporter Country or First Name blank
    if (!reporter.countryCode || !reporter.firstName) {
      setErrorModal({
        isOpen: true,
        title: 'Validation Error',
        message: 'Error: Reporter Country and First Name are mandatory to submit the case.',
      });
      return;
    }

    // OQ Scenario 20: Patient First Name blank
    if (!patient.firstName) {
      setErrorModal({
        isOpen: true,
        title: 'Validation Error',
        message: 'Error: Patient First Name is mandatory to submit the case.',
      });
      return;
    }

    // OQ Scenario 21: Product Name blank
    if (!product.productName) {
      setErrorModal({
        isOpen: true,
        title: 'Validation Error',
        message: 'Error: Product Name is mandatory to submit the case.',
      });
      return;
    }

    // OQ Scenario 22: Reaction Or Event As Reported and Reported Term blank
    if (!event.reactionOrEventAsReported || !event.reportedTerm) {
      setErrorModal({
        isOpen: true,
        title: 'Validation Error',
        message: 'Error: Reaction Or Event As Reported and Reported Term are mandatory to submit the case.',
      });
      return;
    }

    // Valid Submit (OQ Scenario 39 / PQ Scenario 15)
    const generatedCaseNum = submitCase();
    setSubmissionSuccessModal({
      isOpen: true,
      caseNumber: generatedCaseNum,
    });
  };

  const handleConfirmOpenCaseProcessing = () => {
    const caseNum = submissionSuccessModal.caseNumber;
    setSubmissionSuccessModal({ isOpen: false, caseNumber: '' });
    navigate(`/intake/case-processing/${caseNum}`);
  };

  const handleDeclineOpenCaseProcessing = () => {
    setSubmissionSuccessModal({ isOpen: false, caseNumber: '' });
    navigate('/intake/open-case');
  };

  const handleResetForm = () => {
    resetCurrentCase();
  };

  return (
    <div className="space-y-6">
      {/* Top Page Action Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Manual Case Registration</h2>
          <div className="flex items-center space-x-2 mt-0.5">
            <span className="text-xs text-slate-500">Adverse Event Case Intake</span>
            {currentCase.temporaryCaseId && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-50 text-amber-800 border border-amber-200">
                Temp ID: {currentCase.temporaryCaseId}
              </span>
            )}
            {currentCase.caseNumber && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                Case #: {currentCase.caseNumber}
              </span>
            )}
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={handleResetForm}
            className="px-3.5 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors flex items-center space-x-1.5"
            title="Reset unsaved fields"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={() => handleValidateAndSubmit(false)}
            className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5 text-slate-600" />
            <span>Save</span>
          </button>

          <button
            type="button"
            onClick={() => handleValidateAndSubmit(false)}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-700 hover:bg-slate-800 rounded-md shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5 text-slate-200" />
            <span>Submit</span>
          </button>

          <button
            type="button"
            onClick={() => handleValidateAndSubmit(true)}
            className="px-5 py-2 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-md shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Save and Submit</span>
          </button>
        </div>
      </div>

      {/* Structured Sections */}
      <div className="space-y-6">
        {/* Section 1: General Info */}
        <GeneralInfoSection />

        {/* Sub-Tab / Section: Questionnaire */}
        <QuestionnaireTab />

        {/* Section 2: Reporter */}
        <ReporterSection />

        {/* Section 3: Patient Information */}
        <PatientSection />

        {/* Section 4: Product Information */}
        <ProductSection />

        {/* Section 5: Event Information */}
        <EventSection />

        {/* Section 6: Activity Log */}
        <ActivityLogSection />
      </div>

      {/* Validation Error Modal */}
      <ModalDialog
        isOpen={errorModal.isOpen}
        type="error"
        title={errorModal.title}
        message={errorModal.message}
        confirmLabel="OK"
        onConfirm={() => setErrorModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Submission Success Confirmation Modal (OQ Scenario 39 / PQ Scenario 15) */}
      <ModalDialog
        isOpen={submissionSuccessModal.isOpen}
        type="yesno"
        title="Case Submission Successful"
        message={`Case submitted successfully. Generated Case Number: ${submissionSuccessModal.caseNumber}. Do you want to open the case in Case Processing?`}
        confirmLabel="Yes"
        cancelLabel="No"
        showCancel={true}
        onConfirm={handleConfirmOpenCaseProcessing}
        onCancel={handleDeclineOpenCaseProcessing}
      />
    </div>
  );
};
