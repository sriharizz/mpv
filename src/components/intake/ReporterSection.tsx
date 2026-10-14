import React, { useState, useEffect } from 'react';
import { useCases } from '../../context/CaseContext';
import { ReporterInfo } from '../../types/onepv';
import { ModalDialog } from '../common/ModalDialog';

interface ReporterSectionProps {
  onFocusSection?: (section: 'reporter') => void;
  registerSaveHandler?: (handler: () => void) => void;
}

export const ReporterSection: React.FC<ReporterSectionProps> = ({
  onFocusSection,
  registerSaveHandler,
}) => {
  const { currentCase, updateReporter } = useCases();
  const [formData, setFormData] = useState<ReporterInfo>(currentCase.reporter);
  const [hasSavedBefore, setHasSavedBefore] = useState<boolean>(() => {
    return Boolean(currentCase.reporter.firstName && currentCase.reporter.countryCode);
  });

  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const handleChange = (field: keyof ReporterInfo, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (onFocusSection) onFocusSection('reporter');
  };

  const handleSave = () => {
    updateReporter(formData);
    const isUpdate = hasSavedBefore;
    setHasSavedBefore(true);

    setModalState({
      isOpen: true,
      title: 'Reporter Confirmation',
      message: isUpdate
        ? 'Reporter updated successfully.'
        : 'Reporter data saved successfully.',
    });
  };

  useEffect(() => {
    if (registerSaveHandler) {
      registerSaveHandler(handleSave);
    }
  }, [formData, hasSavedBefore, registerSaveHandler]);

  useEffect(() => {
    setFormData(currentCase.reporter);
  }, [currentCase.reporter]);

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs"
      onClick={() => onFocusSection && onFocusSection('reporter')}
      onFocus={() => onFocusSection && onFocusSection('reporter')}
    >
      {/* Hidden button alias for Playwright locators */}
      <button
        type="button"
        data-testid="save-reporter-btn"
        onClick={handleSave}
        className="sr-only"
        tabIndex={-1}
      >
        Save Reporter
      </button>

      {/* Title */}
      <div className="space-y-1">
        <label htmlFor="reporterTitle" className="block font-medium text-slate-700">
          Title
        </label>
        <select
          id="reporterTitle"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-brand-500 focus:outline-none"
        >
          <option value="">Select Title</option>
          <option value="Mr.">Mr.</option>
          <option value="Ms.">Ms.</option>
          <option value="Mrs.">Mrs.</option>
          <option value="Dr.">Dr.</option>
          <option value="Prof.">Prof.</option>
        </select>
      </div>

      {/* First Name */}
      <div className="space-y-1">
        <label htmlFor="reporterFirstName" className="block font-medium text-slate-700">
          First Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="reporterFirstName"
          value={formData.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          placeholder="Enter First Name"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {/* Last Name */}
      <div className="space-y-1">
        <label htmlFor="reporterLastName" className="block font-medium text-slate-700">
          Last Name
        </label>
        <input
          type="text"
          id="reporterLastName"
          value={formData.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
          placeholder="Enter Last Name"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {/* Sex code */}
      <div className="space-y-1">
        <label htmlFor="reporterSexCode" className="block font-medium text-slate-700">
          Sex code
        </label>
        <select
          id="reporterSexCode"
          value={formData.sexCode}
          onChange={(e) => handleChange('sexCode', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-brand-500 focus:outline-none"
        >
          <option value="">Select Sex</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Unknown">Unknown</option>
        </select>
      </div>

      {/* Is Primary Reporter */}
      <div className="flex items-center space-x-2 pt-5">
        <input
          type="checkbox"
          id="isPrimaryReporter"
          checked={formData.isPrimaryReporter}
          onChange={(e) => handleChange('isPrimaryReporter', e.target.checked)}
          className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
        />
        <label htmlFor="isPrimaryReporter" className="font-medium text-slate-700 cursor-pointer">
          Is Primary Reporter
        </label>
      </div>

      {/* Relationship With Patient Code */}
      <div className="space-y-1">
        <label htmlFor="relationshipWithPatientCode" className="block font-medium text-slate-700">
          Relationship With Patient Code
        </label>
        <select
          id="relationshipWithPatientCode"
          value={formData.relationshipWithPatientCode}
          onChange={(e) => handleChange('relationshipWithPatientCode', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-brand-500 focus:outline-none"
        >
          <option value="">Select Relationship</option>
          <option value="Physician">Physician</option>
          <option value="Pharmacist">Pharmacist</option>
          <option value="Consumer">Consumer</option>
          <option value="Parent">Parent</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Reporter Type code */}
      <div className="space-y-1">
        <label htmlFor="reporterTypeCode" className="block font-medium text-slate-700">
          Reporter Type code
        </label>
        <select
          id="reporterTypeCode"
          value={formData.reporterTypeCode}
          onChange={(e) => handleChange('reporterTypeCode', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-brand-500 focus:outline-none"
        >
          <option value="">Select Reporter Type</option>
          <option value="Physician">Physician</option>
          <option value="Pharmacist">Pharmacist</option>
          <option value="Other Health Professional">Other Health Professional</option>
          <option value="Consumer">Consumer</option>
        </select>
      </div>

      {/* Is Reporter Health Care Professional */}
      <div className="flex items-center space-x-2 pt-5">
        <input
          type="checkbox"
          id="isReporterHealthCareProfessional"
          checked={formData.isReporterHealthCareProfessional}
          onChange={(e) => handleChange('isReporterHealthCareProfessional', e.target.checked)}
          className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
        />
        <label htmlFor="isReporterHealthCareProfessional" className="font-medium text-slate-700 cursor-pointer">
          Is Reporter Health Care Professional
        </label>
      </div>

      {/* Address1 */}
      <div className="space-y-1">
        <label htmlFor="address1" className="block font-medium text-slate-700">
          Address1
        </label>
        <input
          type="text"
          id="address1"
          value={formData.address1}
          onChange={(e) => handleChange('address1', e.target.value)}
          placeholder="Enter Address 1"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {/* Address2 */}
      <div className="space-y-1">
        <label htmlFor="address2" className="block font-medium text-slate-700">
          Address2
        </label>
        <input
          type="text"
          id="address2"
          value={formData.address2}
          onChange={(e) => handleChange('address2', e.target.value)}
          placeholder="Enter Address 2"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {/* City */}
      <div className="space-y-1">
        <label htmlFor="city" className="block font-medium text-slate-700">
          City
        </label>
        <input
          type="text"
          id="city"
          value={formData.city}
          onChange={(e) => handleChange('city', e.target.value)}
          placeholder="Enter City"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {/* State */}
      <div className="space-y-1">
        <label htmlFor="state" className="block font-medium text-slate-700">
          State
        </label>
        <input
          type="text"
          id="state"
          value={formData.state}
          onChange={(e) => handleChange('state', e.target.value)}
          placeholder="Enter State"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {/* Country code */}
      <div className="space-y-1">
        <label htmlFor="countryCode" className="block font-medium text-slate-700">
          Country code <span className="text-red-500">*</span>
        </label>
        <select
          id="countryCode"
          value={formData.countryCode}
          onChange={(e) => handleChange('countryCode', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-brand-500 focus:outline-none"
        >
          <option value="">Select Country</option>
          <option value="United States">United States</option>
          <option value="India">India</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="Germany">Germany</option>
          <option value="Canada">Canada</option>
        </select>
      </div>

      {/* Zipcode */}
      <div className="space-y-1">
        <label htmlFor="zipcode" className="block font-medium text-slate-700">
          Zipcode
        </label>
        <input
          type="text"
          id="zipcode"
          value={formData.zipcode}
          onChange={(e) => handleChange('zipcode', e.target.value)}
          placeholder="Enter Zipcode"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {/* Fax */}
      <div className="space-y-1">
        <label htmlFor="fax" className="block font-medium text-slate-700">
          Fax
        </label>
        <input
          type="text"
          id="fax"
          value={formData.fax}
          onChange={(e) => handleChange('fax', e.target.value)}
          placeholder="Enter Fax"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {/* Contact Number */}
      <div className="space-y-1">
        <label htmlFor="contactNumber" className="block font-medium text-slate-700">
          Contact Number
        </label>
        <input
          type="text"
          id="contactNumber"
          value={formData.contactNumber}
          onChange={(e) => handleChange('contactNumber', e.target.value)}
          placeholder="Enter Contact Number"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {/* Email Address */}
      <div className="space-y-1 md:col-span-2">
        <label htmlFor="emailAddress" className="block font-medium text-slate-700">
          Email Address
        </label>
        <input
          type="email"
          id="emailAddress"
          value={formData.emailAddress}
          onChange={(e) => handleChange('emailAddress', e.target.value)}
          placeholder="Enter Email Address"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>

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
