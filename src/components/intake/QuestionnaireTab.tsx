import React, { useState } from 'react';
import { useCases, SYSTEM_TEMPLATES } from '../../context/CaseContext';
import { QuestionFieldType, QuestionnaireTemplate } from '../../types/onepv';
import { Plus, Trash2, FileText, X } from 'lucide-react';
import { ModalDialog } from '../common/ModalDialog';

export const QuestionnaireTab: React.FC = () => {
  const {
    currentCase,
    addQuestionManual,
    addTemplateQuestions,
    updateQuestionResponse,
    deleteQuestion,
    deleteTemplate,
  } = useCases();

  // Active view tab: 'all' | 'manual' | templateId
  const [activeSubTab, setActiveSubTab] = useState<string>('manual');

  // Additional Questions Pop-up State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addMode, setAddMode] = useState<'manual' | 'template'>('manual');

  // Manual Question fields
  const [manualFieldType, setManualFieldType] = useState<QuestionFieldType>('');
  const [manualQuestionText, setManualQuestionText] = useState('');

  // Template selection
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

  // Delete with Reason Modal
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

  // Filter questions based on activeSubTab
  const visibleQuestions = currentCase.questionnaires.filter((q) => {
    if (activeSubTab === 'manual') return q.source === 'manual';
    return q.templateId === activeSubTab;
  });

  const handleOpenAddModal = () => {
    setAddMode('manual');
    setManualFieldType('');
    setManualQuestionText('');
    setSelectedTemplateId(SYSTEM_TEMPLATES[0].id);
    setIsAddModalOpen(true);
  };

  const handleSaveManualQuestion = () => {
    // OQ Scenario 10: Mandatory field check
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

    // OQ Scenario 11 / PQ Scenario 5 confirmation
    setModalState({
      isOpen: true,
      type: 'confirm',
      title: 'Confirmation',
      message: 'Question added manually successfully.',
    });
  };

  const handleSelectTemplate = () => {
    // OQ Scenario 16 / 17: Duplicate template restriction
    const success = addTemplateQuestions(selectedTemplateId);

    if (!success) {
      // Show duplicate error modal.
      // Notice: Do NOT close isAddModalOpen so the user can click OK and then click Cancel on the Additional Questions popup!
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Error: Cannot import the same Questionnaire template more than once.',
      });
      return;
    }

    // Success (OQ Scenario 14 / PQ Scenario 7)
    setIsAddModalOpen(false);
    setActiveSubTab(selectedTemplateId);

    setModalState({
      isOpen: true,
      type: 'confirm',
      title: 'Confirmation',
      message: 'Template added successfully.',
    });
  };

  const handleSaveQuestionnaire = () => {
    // OQ Scenario 12 / 15 / PQ Scenario 6 / 8
    setModalState({
      isOpen: true,
      type: 'confirm',
      title: 'Confirmation',
      message: 'Questionnaire data saved successfully.',
    });
  };

  // Open delete modal
  const handleOpenDeleteQuestion = (id: string, text: string) => {
    setDeleteModalState({
      isOpen: true,
      targetType: 'question',
      targetId: id,
      targetName: text,
      reason: '',
    });
  };

  const handleOpenDeleteTemplate = (templateId: string, name: string) => {
    setDeleteModalState({
      isOpen: true,
      targetType: 'template',
      targetId: templateId,
      targetName: name,
      reason: '',
    });
  };

  const handleConfirmDelete = () => {
    // OQ Scenario 13 Step 1: Reason for delete check
    if (!deleteModalState.reason.trim()) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Error: Please enter the Reason for delete.',
      });
      return;
    }

    // OQ Scenario 13 Step 2 / Scenario 18: Execute delete
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

  // List of imported template objects
  const importedTemplates = SYSTEM_TEMPLATES.filter((t) =>
    currentCase.importedTemplateIds.includes(t.id)
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
      {/* Header and Add button */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-brand-600" />
          <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Questionnaire</h3>
        </div>

        <button
          type="button"
          data-testid="add-questions-btn"
          onClick={handleOpenAddModal}
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-md shadow-sm transition-colors flex items-center space-x-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Questions</span>
        </button>
      </div>

      {/* Sub Tabs: Manual Questions and each Imported Template */}
      <div className="flex items-center space-x-1 border-b border-slate-200 text-xs">
        <button
          type="button"
          onClick={() => setActiveSubTab('manual')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeSubTab === 'manual'
              ? 'border-brand-600 text-brand-700 bg-brand-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Manual Questions (
          {currentCase.questionnaires.filter((q) => q.source === 'manual').length}
          )
        </button>

        {importedTemplates.map((t) => (
          <div key={t.id} className="flex items-center">
            <button
              type="button"
              onClick={() => setActiveSubTab(t.id)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors flex items-center space-x-1.5 ${
                activeSubTab === t.id
                  ? 'border-brand-600 text-brand-700 bg-brand-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>{t.name}</span>
            </button>
            <button
              type="button"
              onClick={() => handleOpenDeleteTemplate(t.id, t.name)}
              title={`Delete ${t.name} Template`}
              className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
              aria-label={`Delete ${t.name}`}
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Questions Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold uppercase tracking-wider">
            <tr>
              <th className="px-4 py-2.5 w-1/3">Question</th>
              <th className="px-4 py-2.5 w-1/6">Field Type</th>
              <th className="px-4 py-2.5 w-1/3">Response</th>
              <th className="px-4 py-2.5 w-1/12 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {visibleQuestions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-400 italic">
                  No questions added in this tab. Click "Add Questions" to create or import questions.
                </td>
              </tr>
            ) : (
              visibleQuestions.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-2.5 font-medium text-slate-800">{q.question}</td>
                  <td className="px-4 py-2.5 text-slate-600">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 font-mono">
                      {q.fieldType}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {q.fieldType === 'Yes/No' ? (
                      <select
                        aria-label={`Response for ${q.question}`}
                        value={q.response}
                        onChange={(e) => updateQuestionResponse(q.id, e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-brand-500 focus:outline-none"
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
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-brand-500 focus:outline-none"
                      />
                    ) : (
                      <input
                        type="text"
                        aria-label={`Response for ${q.question}`}
                        placeholder="Enter response"
                        value={q.response}
                        onChange={(e) => updateQuestionResponse(q.id, e.target.value)}
                        className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-brand-500 focus:outline-none"
                      />
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <button
                      type="button"
                      aria-label="Delete Question"
                      onClick={() => handleOpenDeleteQuestion(q.id, q.question)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded transition-colors"
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

      {/* Save Questionnaire Button */}
      <div className="flex justify-end pt-1">
        <button
          type="button"
          data-testid="save-questionnaire-btn"
          onClick={handleSaveQuestionnaire}
          className="px-5 py-2 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-md shadow-sm transition-colors"
        >
          Save
        </button>
      </div>

      {/* ADDITIONAL QUESTIONS POP-UP MODAL (OQ Scenarios 10, 11, 14, 16) */}
      {isAddModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            {/* Modal Header */}
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

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {/* Radio options */}
              <div className="flex items-center space-x-6 pb-2 border-b border-slate-100 text-xs font-medium">
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

              {/* Mode: Manual */}
              {addMode === 'manual' ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label htmlFor="manualFieldType" className="block text-xs font-medium text-slate-700">
                      Field Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="manualFieldType"
                      value={manualFieldType}
                      onChange={(e) => setManualFieldType(e.target.value as QuestionFieldType)}
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-brand-500 focus:outline-none"
                    >
                      <option value="">Select Field Type</option>
                      <option value="Text">Text</option>
                      <option value="Yes/No">Yes/No</option>
                      <option value="Date">Date</option>
                      <option value="Number">Number</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="manualQuestionText" className="block text-xs font-medium text-slate-700">
                      Question <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="manualQuestionText"
                      rows={3}
                      value={manualQuestionText}
                      onChange={(e) => setManualQuestionText(e.target.value)}
                      placeholder="Enter question text"
                      className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                /* Mode: Template */
                <div className="space-y-2">
                  <p className="text-xs text-slate-600 font-medium">Select a system template to import:</p>
                  <div className="space-y-2 border border-slate-200 rounded-lg p-2 max-h-56 overflow-y-auto">
                    {SYSTEM_TEMPLATES.map((tmpl) => {
                      const isAlreadyImported = currentCase.importedTemplateIds.includes(tmpl.id);
                      return (
                        <label
                          key={tmpl.id}
                          className={`flex items-start space-x-2.5 p-2 rounded-md border text-xs cursor-pointer transition-colors ${
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

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>

              {addMode === 'manual' ? (
                <button
                  type="button"
                  onClick={handleSaveManualQuestion}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-md shadow-sm"
                >
                  Save
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSelectTemplate}
                  className="px-4 py-1.5 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-md shadow-sm"
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

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600">
                Are you sure you want to delete <span className="font-semibold text-slate-800">"{deleteModalState.targetName}"</span>?
              </p>

              <div className="space-y-1">
                <label htmlFor="reasonForDelete" className="block text-xs font-semibold text-slate-700">
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
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setDeleteModalState((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm"
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
