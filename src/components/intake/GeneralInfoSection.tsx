import React, { useState, useEffect } from 'react';
import { useCases, SYSTEM_TEMPLATES } from '../../context/CaseContext';
import { useSimulation } from '../../context/SimulationContext';
import { QuestionFieldType, QuestionnaireTemplate } from '../../types/onepv';
import { ModalDialog } from '../common/ModalDialog';
import { Info, Plus, Trash2, FileText, Lock, X } from 'lucide-react';

interface GeneralInfoSectionProps {
  onFocusSection?: (section: 'general' | 'questionnaire') => void;
  registerSaveHandler?: (handlers: {
    saveGeneral: () => void;
    saveQuestionnaire: () => void;
    clearGeneral: () => void;
  }) => void;
}

export const GeneralInfoSection: React.FC<GeneralInfoSectionProps> = ({
  onFocusSection,
  registerSaveHandler,
}) => {
  const {
    currentCase,
    updateGeneralInfo,
    clearGeneralInfo,
    addQuestionManual,
    addTemplateQuestions,
    updateQuestionResponse,
    deleteQuestion,
    deleteTemplate,
  } = useCases();

  const { mode } = useSimulation();

  // Internal Tabs: 'general' | 'questionnaire'
  const [activeTab, setActiveTab] = useState<'general' | 'questionnaire'>('general');

  // General Info Form fields
  const [classification, setClassification] = useState(currentCase.generalInfo.caseClassificationCode);
  const [intakeSource, setIntakeSource] = useState(currentCase.generalInfo.caseIntakeSourceCode);
  const [companyReceiptDate, setCompanyReceiptDate] = useState(currentCase.generalInfo.companyReceiptDate);
  const [processingCenterDate, setProcessingCenterDate] = useState(currentCase.generalInfo.processingCenterReceivedDate);

  // Questionnaire Sub-Tabs & Modal states
  const [activeSubTab, setActiveSubTab] = useState<string>('manual');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<'manual' | 'template'>('manual');
  const [manualFieldType, setManualFieldType] = useState<QuestionFieldType>('');
  const [manualQuestionText, setManualQuestionText] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(SYSTEM_TEMPLATES[0].id);

  // General Notification / Error Modals
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

  // Delete Question / Template with Reason Modal
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    targetType: 'question' | 'template';
    targetId: string;
    targetName: string;
    reason: string;
  }>({
    isOpen: false,
    targetType: 'question',
    targetId: '',
    targetName: '',
    reason: '',
  });

  // Handle General Info Save (OQ Scenarios 5-9 / PQ Scenario 4)
  const handleSaveGeneral = () => {
    if (mode === 'BLOCKED') return;

    // OQ Scenario 5
    if (!classification && !intakeSource && !companyReceiptDate) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Error: Case Classifications Code, Case Intake Source Code, and Company Receipt Date cannot be empty.',
      });
      return;
    }

    // OQ Scenario 6
    if (!intakeSource && !companyReceiptDate) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Error: Case Intake Source Code and Company Receipt Date cannot be empty.',
      });
      return;
    }

    // OQ Scenario 7
    if (!companyReceiptDate) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Error: Company Receipt Date cannot be empty.',
      });
      return;
    }

    // OQ Scenario 8
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

    setModalState({
      isOpen: true,
      type: 'confirm',
      title: 'Registration Confirmation',
      message: `Case registered successfully. Case ID: ${tempId} created.`,
    });
  };

  const handleClearGeneral = () => {
    setClassification('');
    setIntakeSource('');
    setCompanyReceiptDate('');
    setProcessingCenterDate('');
    clearGeneralInfo();
  };

  // Handle Questionnaire Save (OQ Scenario 12 / 15 / PQ Scenario 6 / 8)
  const handleSaveQuestionnaire = () => {
    setModalState({
      isOpen: true,
      type: 'confirm',
      title: 'Confirmation',
      message: 'Questionnaire data saved successfully.',
    });
  };

  // Register save handlers with parent
  useEffect(() => {
    if (registerSaveHandler) {
      registerSaveHandler({
        saveGeneral: handleSaveGeneral,
        saveQuestionnaire: handleSaveQuestionnaire,
        clearGeneral: handleClearGeneral,
      });
    }
  }, [classification, intakeSource, companyReceiptDate, processingCenterDate, mode, registerSaveHandler]);

  // Sync state if currentCase changes
  useEffect(() => {
    setClassification(currentCase.generalInfo.caseClassificationCode);
    setIntakeSource(currentCase.generalInfo.caseIntakeSourceCode);
    setCompanyReceiptDate(currentCase.generalInfo.companyReceiptDate);
    setProcessingCenterDate(currentCase.generalInfo.processingCenterReceivedDate);
  }, [currentCase.generalInfo]);

  // Questionnaire helpers
  const handleOpenAddModal = () => {
    setAddMode('manual');
    setManualFieldType('');
    setManualQuestionText('');
    setSelectedTemplateId(SYSTEM_TEMPLATES[0].id);
    setIsAddModalOpen(true);
  };

  const handleSaveManualQuestion = () => {
    if (!manualFieldType || !manualQuestionText.trim()) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Error: Field Type and Question are mandatory.',
      });
      return;
    }

    addQuestionManual(manualFieldType, manualQuestionText.trim());
    setIsAddModalOpen(false);
    setActiveSubTab('manual');

    setModalState({
      isOpen: true,
      type: 'confirm',
      title: 'Confirmation',
      message: 'Question added manually successfully.',
    });
  };

  const handleSelectTemplate = () => {
    const success = addTemplateQuestions(selectedTemplateId);
    if (!success) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Error: Cannot import the same Questionnaire template more than once.',
      });
      return;
    }

    setIsAddModalOpen(false);
    setActiveSubTab(selectedTemplateId);

    setModalState({
      isOpen: true,
      type: 'confirm',
      title: 'Confirmation',
      message: 'Template added successfully.',
    });
  };

  const handleConfirmDelete = () => {
    if (!deleteModalState.reason.trim()) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Error: Please enter the Reason for delete.',
      });
      return;
    }

    if (deleteModalState.targetType === 'question') {
      deleteQuestion(deleteModalState.targetId, deleteModalState.reason);
    } else {
      deleteTemplate(deleteModalState.targetId, deleteModalState.reason);
      setActiveSubTab('manual');
    }

    setDeleteModalState((prev) => ({ ...prev, isOpen: false }));
    setModalState({
      isOpen: true,
      type: 'confirm',
      title: 'Confirmation',
      message: 'Deleted successfully.',
    });
  };

  const visibleQuestions = currentCase.questionnaires.filter((q) => {
    if (activeSubTab === 'manual') return q.source === 'manual';
    return q.templateId === activeSubTab;
  });

  const importedTemplates = SYSTEM_TEMPLATES.filter((t) =>
    currentCase.importedTemplateIds.includes(t.id)
  );

  return (
    <div
      className="space-y-4"
      onClick={() => onFocusSection && onFocusSection(activeTab)}
    >
      {/* Simulation BLOCKED overlay */}
      {mode === 'BLOCKED' && activeTab === 'general' && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 flex items-center space-x-3 mb-2">
          <Lock className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Environment Service Unavailable (503):</span> Control Locked: Case registration service is temporarily unavailable.
          </div>
        </div>
      )}

      {/* Sub-Tabs: General Information vs Questionnaire */}
      <div className="flex items-center space-x-1 border-b border-slate-200 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setActiveTab('general');
            if (onFocusSection) onFocusSection('general');
          }}
          className={`px-4 py-2.5 border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'general'
              ? 'border-brand-600 text-brand-700 bg-brand-50/60 rounded-t-md font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <Info className="w-3.5 h-3.5" />
          <span>General Information</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('questionnaire');
            if (onFocusSection) onFocusSection('questionnaire');
          }}
          className={`px-4 py-2.5 border-b-2 transition-all flex items-center space-x-1.5 ${
            activeTab === 'questionnaire'
              ? 'border-brand-600 text-brand-700 bg-brand-50/60 rounded-t-md font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Questionnaire ({currentCase.questionnaires.length})</span>
        </button>

        {/* Hidden button aliases for Playwright locators targeting data-testid */}
        <button
          type="button"
          data-testid="save-general-info-btn"
          onClick={handleSaveGeneral}
          className="sr-only"
          tabIndex={-1}
        >
          Save General Info
        </button>
        <button
          type="button"
          data-testid="clear-general-info-btn"
          onClick={handleClearGeneral}
          className="sr-only"
          tabIndex={-1}
        >
          Clear General Info
        </button>
        <button
          type="button"
          data-testid="save-questionnaire-btn"
          onClick={handleSaveQuestionnaire}
          className="sr-only"
          tabIndex={-1}
        >
          Save Questionnaire
        </button>
      </div>

      {/* Tab 1: General Information Content */}
      {activeTab === 'general' && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs pt-1"
          onFocus={() => onFocusSection && onFocusSection('general')}
        >
          {/* Case Classifications Code */}
          <div className="space-y-1.5">
            <label htmlFor="caseClassificationCode" className="block font-medium text-slate-700">
              Case Classifications Code <span className="text-red-500">*</span>
            </label>
            <select
              id="caseClassificationCode"
              name="caseClassificationCode"
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
            >
              <option value="">Select Classification</option>
              <option value="Adverse Event">Adverse Event</option>
              <option value="General Inquiry">General Inquiry</option>
              <option value="Product Quality Complaint">Product Quality Complaint</option>
            </select>
          </div>

          {/* Case Intake Source Code */}
          <div className="space-y-1.5">
            <label htmlFor="caseIntakeSourceCode" className="block font-medium text-slate-700">
              Case Intake Source Code <span className="text-red-500">*</span>
            </label>
            <select
              id="caseIntakeSourceCode"
              name="caseIntakeSourceCode"
              value={intakeSource}
              onChange={(e) => setIntakeSource(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
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
            <label htmlFor="companyReceiptDate" className="block font-medium text-slate-700">
              Company Receipt Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="companyReceiptDate"
              name="companyReceiptDate"
              value={companyReceiptDate}
              onChange={(e) => setCompanyReceiptDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>

          {/* Processing Center Received Date */}
          <div className="space-y-1.5">
            <label htmlFor="processingCenterReceivedDate" className="block font-medium text-slate-700">
              Processing Center Received Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              id="processingCenterReceivedDate"
              name="processingCenterReceivedDate"
              value={processingCenterDate}
              onChange={(e) => setProcessingCenterDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-brand-500 focus:border-brand-500"
            />
          </div>
        </div>
      )}

      {/* Tab 2: Questionnaire Content */}
      {activeTab === 'questionnaire' && (
        <div
          className="space-y-4 pt-1 text-xs"
          onFocus={() => onFocusSection && onFocusSection('questionnaire')}
        >
          {/* Header and Add button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-1.5">
              <button
                type="button"
                onClick={() => setActiveSubTab('manual')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  activeSubTab === 'manual'
                    ? 'bg-brand-50 text-brand-700 border border-brand-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Manual Questions ({currentCase.questionnaires.filter((q) => q.source === 'manual').length})
              </button>

              {importedTemplates.map((t) => (
                <div key={t.id} className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setActiveSubTab(t.id)}
                    className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                      activeSubTab === t.id
                        ? 'bg-brand-50 text-brand-700 border border-brand-200'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{t.name}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteModalState({
                      isOpen: true,
                      targetType: 'template',
                      targetId: t.id,
                      targetName: t.name,
                      reason: '',
                    })}
                    className="p-1 text-slate-400 hover:text-red-600 rounded"
                    title={`Delete ${t.name}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              data-testid="add-questions-btn"
              onClick={handleOpenAddModal}
              className="px-3 py-1.5 font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-md shadow-sm transition-colors flex items-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Questions</span>
            </button>
          </div>

          {/* Questions Table */}
          <div className="border border-slate-200 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2 w-1/3">Question</th>
                  <th className="px-4 py-2 w-1/6">Field Type</th>
                  <th className="px-4 py-2 w-1/3">Response</th>
                  <th className="px-4 py-2 w-1/12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {visibleQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-400 italic">
                      No questions in this tab. Click "Add Questions" to create or import questions.
                    </td>
                  </tr>
                ) : (
                  visibleQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-2 font-medium text-slate-800">{q.question}</td>
                      <td className="px-4 py-2 text-slate-600">
                        <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 font-mono">
                          {q.fieldType}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        {q.fieldType === 'Yes/No' ? (
                          <select
                            aria-label={`Response for ${q.question}`}
                            value={q.response}
                            onChange={(e) => updateQuestionResponse(q.id, e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-brand-500 focus:outline-none"
                          >
                            <option value="">Select Response</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                            <option value="Unknown">Unknown</option>
                          </select>
                        ) : q.fieldType === 'Date' ? (
                          <input
                            type="date"
                            aria-label={`Response for ${q.question}`}
                            value={q.response}
                            onChange={(e) => updateQuestionResponse(q.id, e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-brand-500 focus:outline-none"
                          />
                        ) : (
                          <input
                            type="text"
                            aria-label={`Response for ${q.question}`}
                            placeholder="Enter response"
                            value={q.response}
                            onChange={(e) => updateQuestionResponse(q.id, e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-brand-500 focus:outline-none"
                          />
                        )}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          type="button"
                          aria-label="Delete Question"
                          onClick={() => setDeleteModalState({
                            isOpen: true,
                            targetType: 'question',
                            targetId: q.id,
                            targetName: q.question,
                            reason: '',
                          })}
                          className="text-slate-400 hover:text-red-600 p-1 rounded"
                          title="Delete question"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADDITIONAL QUESTIONS POP-UP MODAL (OQ Scenarios 10, 11, 14, 16) */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-semibold text-sm text-slate-800">Additional Questions</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center space-x-6 pb-2 border-b border-slate-100 font-medium">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="addQuestionsMode"
                    checked={addMode === 'manual'}
                    onChange={() => setAddMode('manual')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-slate-800">Add Questions Manually</span>
                </label>

                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="addQuestionsMode"
                    checked={addMode === 'template'}
                    onChange={() => setAddMode('template')}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <span className="text-slate-800">Add Questions from Template</span>
                </label>
              </div>

              {addMode === 'manual' ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label htmlFor="manualFieldType" className="block font-medium text-slate-700">
                      Field Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="manualFieldType"
                      value={manualFieldType}
                      onChange={(e) => setManualFieldType(e.target.value as QuestionFieldType)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-brand-500 focus:outline-none"
                    >
                      <option value="">Select Field Type</option>
                      <option value="Text">Text</option>
                      <option value="Yes/No">Yes/No</option>
                      <option value="Date">Date</option>
                      <option value="Number">Number</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="manualQuestionText" className="block font-medium text-slate-700">
                      Question <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="manualQuestionText"
                      rows={3}
                      value={manualQuestionText}
                      onChange={(e) => setManualQuestionText(e.target.value)}
                      placeholder="Enter question text"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-slate-600 font-medium">Select a system template to import:</p>
                  <div className="space-y-2 border border-slate-200 rounded-lg p-2 max-h-56 overflow-y-auto">
                    {SYSTEM_TEMPLATES.map((tmpl) => {
                      const isAlreadyImported = currentCase.importedTemplateIds.includes(tmpl.id);
                      return (
                        <label
                          key={tmpl.id}
                          className={`flex items-start space-x-2.5 p-2 rounded-md border cursor-pointer transition-colors ${
                            selectedTemplateId === tmpl.id
                              ? 'border-brand-500 bg-brand-50/40 text-brand-900'
                              : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="systemTemplateSelection"
                            checked={selectedTemplateId === tmpl.id}
                            onChange={() => setSelectedTemplateId(tmpl.id)}
                            className="mt-0.5 text-brand-600 focus:ring-brand-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{tmpl.name}</span>
                              {isAlreadyImported && (
                                <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                                  Already Imported
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {tmpl.questions.length} questions: "{tmpl.questions[0].question}"
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-1.5 font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>

              {addMode === 'manual' ? (
                <button
                  type="button"
                  onClick={handleSaveManualQuestion}
                  className="px-4 py-1.5 font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-md shadow-sm"
                >
                  Save
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSelectTemplate}
                  className="px-4 py-1.5 font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-md shadow-sm"
                >
                  Select
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DELETE WITH REASON MODAL (OQ Scenario 13 & 18) */}
      {deleteModalState.isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-3.5 border-b border-red-100 bg-red-50 text-red-800 flex items-center justify-between">
              <h3 className="font-semibold text-sm">
                Delete {deleteModalState.targetType === 'question' ? 'Question' : 'Template'}
              </h3>
              <button
                type="button"
                onClick={() => setDeleteModalState((prev) => ({ ...prev, isOpen: false }))}
                className="text-red-400 hover:text-red-600 p-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <p className="text-slate-600">
                Are you sure you want to delete <span className="font-semibold text-slate-800">"{deleteModalState.targetName}"</span>?
              </p>

              <div className="space-y-1">
                <label htmlFor="reasonForDelete" className="block font-semibold text-slate-700">
                  Reason for delete <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="reasonForDelete"
                  value={deleteModalState.reason}
                  onChange={(e) =>
                    setDeleteModalState((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  placeholder="Enter reason for delete"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setDeleteModalState((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-1.5 font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* General Information / Validation Modal */}
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
