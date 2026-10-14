import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCases } from '../context/CaseContext';
import { useSimulation } from '../context/SimulationContext';
import { GeneralInfoSection } from '../components/intake/GeneralInfoSection';
import { ReporterSection } from '../components/intake/ReporterSection';
import { PatientSection } from '../components/intake/PatientSection';
import { ProductSection } from '../components/intake/ProductSection';
import { EventSection } from '../components/intake/EventSection';
import { ActivityLogSection } from '../components/intake/ActivityLogSection';
import { ModalDialog } from '../components/common/ModalDialog';
import {
  Save,
  Send,
  CheckSquare,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Eraser,
  Info,
  UserCheck,
  User,
  Package,
  Activity,
  Clock,
  CheckCircle2
} from 'lucide-react';

export type ActiveSectionType = 'general' | 'questionnaire' | 'reporter' | 'patient' | 'product' | 'event';

export const ManualCasePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentCase, submitCase, resetCurrentCase } = useCases();
  const { mode } = useSimulation();

  // Track the most recently active / focused section
  const [activeSection, setActiveSection] = useState<ActiveSectionType>('general');

  // Accordion open/collapse state for all 6 sections (all expanded by default for full accessibility)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    general: true,
    reporter: true,
    patient: true,
    product: true,
    event: true,
    activity: true,
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const areAllExpanded = Object.values(expandedSections).every(Boolean);

  const toggleAllSections = () => {
    const nextState = !areAllExpanded;
    setExpandedSections({
      general: nextState,
      reporter: nextState,
      patient: nextState,
      product: nextState,
      event: nextState,
      activity: nextState,
    });
  };

  // Section Save Handlers Registry
  const saveHandlers = useRef<{
    saveGeneral?: () => void;
    saveQuestionnaire?: () => void;
    clearGeneral?: () => void;
    saveReporter?: () => void;
    savePatient?: () => void;
    saveProduct?: () => void;
    saveEvent?: () => void;
  }>({});

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

  // Centralized Save Button in the Sticky Action Bar
  const handleCentralSave = () => {
    // If case has no Temporary Case ID yet, saving defaults to General Info registration
    if (!currentCase.temporaryCaseId && (activeSection === 'general' || activeSection === 'questionnaire')) {
      if (saveHandlers.current.saveGeneral) {
        saveHandlers.current.saveGeneral();
        return;
      }
    }

    switch (activeSection) {
      case 'general':
        if (saveHandlers.current.saveGeneral) saveHandlers.current.saveGeneral();
        break;
      case 'questionnaire':
        if (saveHandlers.current.saveQuestionnaire) saveHandlers.current.saveQuestionnaire();
        break;
      case 'reporter':
        if (saveHandlers.current.saveReporter) saveHandlers.current.saveReporter();
        break;
      case 'patient':
        if (saveHandlers.current.savePatient) saveHandlers.current.savePatient();
        break;
      case 'product':
        if (saveHandlers.current.saveProduct) saveHandlers.current.saveProduct();
        break;
      case 'event':
        if (saveHandlers.current.saveEvent) saveHandlers.current.saveEvent();
        break;
      default:
        if (saveHandlers.current.saveGeneral) saveHandlers.current.saveGeneral();
        break;
    }
  };

  const handleClearGeneral = () => {
    if (saveHandlers.current.clearGeneral) {
      saveHandlers.current.clearGeneral();
    }
  };

  // Global Submit validation logic (OQ Scenarios 4, 19, 20, 21, 22)
  const handleValidateAndSubmit = (isSaveAndSubmit: boolean = false) => {
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

  const getSectionFriendlyName = (sec: ActiveSectionType) => {
    switch (sec) {
      case 'general':
        return 'General Info';
      case 'questionnaire':
        return 'Questionnaire';
      case 'reporter':
        return 'Reporter';
      case 'patient':
        return 'Patient Info';
      case 'product':
        return 'Product Info';
      case 'event':
        return 'Event Info';
      default:
        return 'General Info';
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* ============================================================== */}
      {/* 1. CASE HEADER & ACTION TOOLBAR                                */}
      {/* ============================================================== */}
      <div className="bg-white border border-slate-200 rounded-lg px-5 py-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3 mb-2">
        {/* Left: Title & Status Badges */}
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <h2 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
              Manual Case Registration
            </h2>
            {currentCase.temporaryCaseId && (
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-amber-50 text-amber-800 border border-amber-200 shadow-xs">
                Temp ID: {currentCase.temporaryCaseId}
              </span>
            )}
            {currentCase.caseNumber && (
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
                Case #: {currentCase.caseNumber}
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
            <span>Adverse Event Case Intake</span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center space-x-1.5 text-slate-600">
              <span>Section:</span>
              <span className="font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded text-[11px] border border-brand-200">
                {getSectionFriendlyName(activeSection)}
              </span>
            </span>
          </div>
        </div>

        {/* Right: Primary Case Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Expand / Collapse All */}
          <button
            type="button"
            onClick={toggleAllSections}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors flex items-center space-x-1"
            title={areAllExpanded ? 'Collapse All Sections' : 'Expand All Sections'}
          >
            <ChevronsUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">{areAllExpanded ? 'Collapse All' : 'Expand All'}</span>
          </button>

          {/* Reset button */}
          <button
            type="button"
            data-testid="top-reset-btn"
            onClick={handleResetForm}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors flex items-center space-x-1"
            title="Reset unsaved fields"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset</span>
          </button>

          {/* Clear General Info */}
          <button
            type="button"
            data-testid="clear-general-info-btn"
            onClick={handleClearGeneral}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors flex items-center space-x-1"
            title="Clear General Info fields"
          >
            <Eraser className="w-3.5 h-3.5 text-slate-500" />
            <span>Clear</span>
          </button>

          {/* ONE PRIMARY SAVE BUTTON */}
          <button
            type="button"
            data-testid="top-save-btn"
            onClick={handleCentralSave}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-[#5c8db8] hover:bg-[#4a7ea8] rounded-md shadow-sm transition-colors flex items-center space-x-1.5 focus:ring-2 focus:ring-brand-400"
            title={`Save ${getSectionFriendlyName(activeSection)}`}
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>

          {/* Submit */}
          <button
            type="button"
            data-testid="top-submit-btn"
            onClick={() => handleValidateAndSubmit(false)}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-md shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <Send className="w-3.5 h-3.5 text-slate-200" />
            <span>Submit</span>
          </button>

          {/* Save and Submit */}
          <button
            type="button"
            data-testid="top-save-and-submit-btn"
            onClick={() => handleValidateAndSubmit(true)}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-md shadow-sm transition-colors flex items-center space-x-1.5"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Save and Submit</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. COLLAPSIBLE ACCORDION SECTIONS                              */}
      {/* ============================================================== */}
      <div className="space-y-4">
        {/* Accordion 1: General Information & Questionnaire */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden transition-all">
          <div
            onClick={() => {
              toggleSection('general');
              setActiveSection('general');
            }}
            className="px-5 py-3.5 bg-slate-50/80 hover:bg-slate-100/70 border-b border-slate-200 cursor-pointer flex items-center justify-between select-none"
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-1 rounded bg-brand-100/70 text-brand-700">
                <Info className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-xs tracking-wide uppercase">
                1. General Information & Questionnaire
              </h3>
              {currentCase.temporaryCaseId ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Registered</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  Required
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {activeSection === 'general' && (
                <span className="text-[10px] font-bold text-brand-700 uppercase bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  Active
                </span>
              )}
              {expandedSections.general ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </div>

          {expandedSections.general && (
            <div className="p-5">
              <GeneralInfoSection
                onFocusSection={(sec) => setActiveSection(sec)}
                registerSaveHandler={(handlers) => {
                  saveHandlers.current.saveGeneral = handlers.saveGeneral;
                  saveHandlers.current.saveQuestionnaire = handlers.saveQuestionnaire;
                  saveHandlers.current.clearGeneral = handlers.clearGeneral;
                }}
              />
            </div>
          )}
        </div>

        {/* Accordion 2: Reporter Information */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden transition-all">
          <div
            onClick={() => {
              toggleSection('reporter');
              setActiveSection('reporter');
            }}
            className="px-5 py-3.5 bg-slate-50/80 hover:bg-slate-100/70 border-b border-slate-200 cursor-pointer flex items-center justify-between select-none"
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-1 rounded bg-brand-100/70 text-brand-700">
                <UserCheck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-xs tracking-wide uppercase">
                2. Reporter Information
              </h3>
              {currentCase.reporter.firstName && currentCase.reporter.countryCode ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Completed</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                  Mandatory
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {activeSection === 'reporter' && (
                <span className="text-[10px] font-bold text-brand-700 uppercase bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  Active
                </span>
              )}
              {expandedSections.reporter ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </div>

          {expandedSections.reporter && (
            <div className="p-5">
              <ReporterSection
                onFocusSection={(sec) => setActiveSection(sec)}
                registerSaveHandler={(handler) => {
                  saveHandlers.current.saveReporter = handler;
                }}
              />
            </div>
          )}
        </div>

        {/* Accordion 3: Patient Information */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden transition-all">
          <div
            onClick={() => {
              toggleSection('patient');
              setActiveSection('patient');
            }}
            className="px-5 py-3.5 bg-slate-50/80 hover:bg-slate-100/70 border-b border-slate-200 cursor-pointer flex items-center justify-between select-none"
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-1 rounded bg-brand-100/70 text-brand-700">
                <User className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-xs tracking-wide uppercase">
                3. Patient Information
              </h3>
              {currentCase.patient.firstName ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Completed</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                  Mandatory
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {activeSection === 'patient' && (
                <span className="text-[10px] font-bold text-brand-700 uppercase bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  Active
                </span>
              )}
              {expandedSections.patient ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </div>

          {expandedSections.patient && (
            <div className="p-5">
              <PatientSection
                onFocusSection={(sec) => setActiveSection(sec)}
                registerSaveHandler={(handler) => {
                  saveHandlers.current.savePatient = handler;
                }}
              />
            </div>
          )}
        </div>

        {/* Accordion 4: Product Information */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden transition-all">
          <div
            onClick={() => {
              toggleSection('product');
              setActiveSection('product');
            }}
            className="px-5 py-3.5 bg-slate-50/80 hover:bg-slate-100/70 border-b border-slate-200 cursor-pointer flex items-center justify-between select-none"
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-1 rounded bg-brand-100/70 text-brand-700">
                <Package className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-xs tracking-wide uppercase">
                4. Product Information
              </h3>
              {currentCase.product.productName ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Selected</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                  Mandatory
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {activeSection === 'product' && (
                <span className="text-[10px] font-bold text-brand-700 uppercase bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  Active
                </span>
              )}
              {expandedSections.product ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </div>

          {expandedSections.product && (
            <div className="p-5">
              <ProductSection
                onFocusSection={(sec) => setActiveSection(sec)}
                registerSaveHandler={(handler) => {
                  saveHandlers.current.saveProduct = handler;
                }}
              />
            </div>
          )}
        </div>

        {/* Accordion 5: Event Information */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden transition-all">
          <div
            onClick={() => {
              toggleSection('event');
              setActiveSection('event');
            }}
            className="px-5 py-3.5 bg-slate-50/80 hover:bg-slate-100/70 border-b border-slate-200 cursor-pointer flex items-center justify-between select-none"
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-1 rounded bg-brand-100/70 text-brand-700">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-xs tracking-wide uppercase">
                5. Event Information & MedDRA Coding
              </h3>
              {currentCase.event.reportedTerm ? (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Coded</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">
                  Mandatory
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {activeSection === 'event' && (
                <span className="text-[10px] font-bold text-brand-700 uppercase bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  Active
                </span>
              )}
              {expandedSections.event ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </div>

          {expandedSections.event && (
            <div className="p-5">
              <EventSection
                onFocusSection={(sec) => setActiveSection(sec)}
                registerSaveHandler={(handler) => {
                  saveHandlers.current.saveEvent = handler;
                }}
              />
            </div>
          )}
        </div>

        {/* Accordion 6: Activity Log */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden transition-all">
          <div
            onClick={() => toggleSection('activity')}
            className="px-5 py-3.5 bg-slate-50/80 hover:bg-slate-100/70 border-b border-slate-200 cursor-pointer flex items-center justify-between select-none"
          >
            <div className="flex items-center space-x-2.5">
              <div className="p-1 rounded bg-brand-100/70 text-brand-700">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-xs tracking-wide uppercase">
                6. Activity Log ({currentCase.activityLogs.length})
              </h3>
            </div>

            <div className="flex items-center space-x-2">
              {expandedSections.activity ? (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-slate-400" />
              )}
            </div>
          </div>

          {expandedSections.activity && (
            <div className="p-5">
              <ActivityLogSection />
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. MODALS                                                      */}
      {/* ============================================================== */}
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
