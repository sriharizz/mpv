import React, { useState } from 'react';
import { useCases } from '../../context/CaseContext';
import { ActivityLogItem } from '../../types/onepv';
import { Clock, Plus, Edit, Trash2, X } from 'lucide-react';
import { ModalDialog } from '../common/ModalDialog';

export const ActivityLogSection: React.FC = () => {
  const { currentCase, addActivityLog, updateActivityLog, deleteActivityLog } = useCases();

  // Add / Edit Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [openDate, setOpenDate] = useState('');
  const [closeDate, setCloseDate] = useState('');
  const [type, setType] = useState('');
  const [comments, setComments] = useState('');

  // Delete Modal state (OQ Scenario 38)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteReason, setDeleteReason] = useState('');

  // Confirmation Modals
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'error' | 'confirm';
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: 'confirm',
    title: '',
    message: '',
  });

  const handleOpenAdd = () => {
    setEditingId(null);
    setOpenDate(new Date().toISOString().split('T')[0]);
    setCloseDate('');
    setType('Case Review');
    setComments('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (log: ActivityLogItem) => {
    setEditingId(log.id);
    setOpenDate(log.openDate);
    setCloseDate(log.closeDate);
    setType(log.type);
    setComments(log.comments);
    setIsFormOpen(true);
  };

  const handleSaveOrUpdate = () => {
    if (editingId) {
      updateActivityLog({
        id: editingId,
        openDate,
        closeDate,
        type,
        comments,
      });
      setIsFormOpen(false);
      setModalState({
        isOpen: true,
        type: 'confirm',
        title: 'Confirmation',
        message: 'Activity log updated successfully.',
      });
    } else {
      addActivityLog({
        openDate,
        closeDate,
        type,
        comments,
      });
      setIsFormOpen(false);
      setModalState({
        isOpen: true,
        type: 'confirm',
        title: 'Confirmation',
        message: 'Activity log added successfully.',
      });
    }
  };

  // OQ Scenario 38: Delete activity log
  const handleOpenDelete = (id: string) => {
    setDeleteTargetId(id);
    setDeleteReason('');
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteReason.trim()) {
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Validation Error',
        message: 'Error: Reason for delete is required to delete activity log.',
      });
      return;
    }

    if (deleteTargetId) {
      deleteActivityLog(deleteTargetId, deleteReason);
    }
    setIsDeleteOpen(false);

    setModalState({
      isOpen: true,
      type: 'confirm',
      title: 'Confirmation',
      message: 'Log deleted successfully.',
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-brand-600" />
          <h3 className="font-bold text-slate-800 text-sm tracking-wide uppercase">Activity Log</h3>
        </div>

        <button
          type="button"
          data-testid="add-activity-log-btn"
          onClick={handleOpenAdd}
          className="px-3.5 py-1.5 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-md shadow-sm transition-colors flex items-center space-x-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add</span>
        </button>
      </div>

      {/* Activity Log Table */}
      <div className="border border-slate-200 rounded-lg overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-2.5">Open Date</th>
              <th className="px-4 py-2.5">Close Date</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5 w-1/2">Comments</th>
              <th className="px-4 py-2.5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {currentCase.activityLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400 italic">
                  No activity logs recorded. Click "Add" to record a log.
                </td>
              </tr>
            ) : (
              currentCase.activityLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-slate-700">{log.openDate || '-'}</td>
                  <td className="px-4 py-2.5 font-mono text-slate-700">{log.closeDate || '-'}</td>
                  <td className="px-4 py-2.5">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-brand-50 text-brand-700 border border-brand-200 font-medium">
                      {log.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-slate-800">{log.comments}</td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        type="button"
                        aria-label="Edit Activity Log"
                        onClick={() => handleOpenEdit(log)}
                        className="text-slate-400 hover:text-brand-600 p-1 rounded"
                        title="Edit log"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label="Delete Activity Log"
                        onClick={() => handleOpenDelete(log.id)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT ACTIVITY LOG MODAL */}
      {isFormOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-semibold text-sm text-slate-800">
                {editingId ? 'Update Activity Log' : 'Add Activity Log'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label htmlFor="logOpenDate" className="block font-medium text-slate-700">
                    Open Date
                  </label>
                  <input
                    type="date"
                    id="logOpenDate"
                    value={openDate}
                    onChange={(e) => setOpenDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="logCloseDate" className="block font-medium text-slate-700">
                    Close Date
                  </label>
                  <input
                    type="date"
                    id="logCloseDate"
                    value={closeDate}
                    onChange={(e) => setCloseDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="logType" className="block font-medium text-slate-700">
                  Type
                </label>
                <select
                  id="logType"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-brand-500 focus:outline-none"
                >
                  <option value="">Select Type</option>
                  <option value="Case Review">Case Review</option>
                  <option value="Medical Inquiry">Medical Inquiry</option>
                  <option value="Follow-Up">Follow-Up</option>
                  <option value="Quality Audit">Quality Audit</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="logComments" className="block font-medium text-slate-700">
                  Comments
                </label>
                <textarea
                  id="logComments"
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Enter comments"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveOrUpdate}
                className="px-4 py-1.5 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-md shadow-sm"
              >
                {editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE ACTIVITY LOG MODAL (OQ Scenario 38) */}
      {isDeleteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4"
        >
          <div className="bg-white rounded-xl shadow-2xl border border-red-200 w-full max-w-md overflow-hidden">
            <div className="px-5 py-3.5 border-b border-red-100 bg-red-50 text-red-800 flex items-center justify-between">
              <h3 className="font-semibold text-sm">Delete Activity Log</h3>
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
                className="text-red-400 hover:text-red-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs">
              <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-md text-amber-800 font-medium">
                Error: Reason for delete is required to delete activity log.
              </div>

              <div className="space-y-1">
                <label htmlFor="activityLogDeleteReason" className="block font-semibold text-slate-700">
                  Reason for delete <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="activityLogDeleteReason"
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  placeholder="Enter reason for delete"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsDeleteOpen(false)}
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

      {/* Confirmation Modal */}
      <ModalDialog
        isOpen={modalState.isOpen}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        confirmLabel="OK"
        onConfirm={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
