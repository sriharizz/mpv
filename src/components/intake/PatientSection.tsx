import React, { useState, useEffect } from 'react';
import { useCases } from '../../context/CaseContext';
import { PatientInfo } from '../../types/onepv';
import { ModalDialog } from '../common/ModalDialog';

interface PatientSectionProps {
  onFocusSection?: (section: 'patient') => void;
  registerSaveHandler?: (handler: () => void) => void;
}

export const PatientSection: React.FC<PatientSectionProps> = ({
  onFocusSection,
  registerSaveHandler,
}) => {
  const { currentCase, updatePatient } = useCases();
  const [formData, setFormData] = useState<PatientInfo>(currentCase.patient);
  const [hasSavedBefore, setHasSavedBefore] = useState<boolean>(() => {
    return Boolean(currentCase.patient.firstName || currentCase.patient.initials);
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

  const handleChange = (field: keyof PatientInfo, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (onFocusSection) onFocusSection('patient');
  };

  const handleSave = () => {
    updatePatient(formData);
    const isUpdate = hasSavedBefore;
    setHasSavedBefore(true);

    setModalState({
      isOpen: true,
      title: 'Patient Confirmation',
      message: isUpdate
        ? 'Patient information updated successfully.'
        : 'Patient information added successfully.',
    });
  };

  useEffect(() => {
    if (registerSaveHandler) {
      registerSaveHandler(handleSave);
    }
  }, [formData, hasSavedBefore, registerSaveHandler]);

  useEffect(() => {
    setFormData(currentCase.patient);
  }, [currentCase.patient]);

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs"
      onClick={() => onFocusSection && onFocusSection('patient')}
      onFocus={() => onFocusSection && onFocusSection('patient')}
    >
      {/* Hidden button alias for Playwright locators */}
      <button
        type="button"
        data-testid="save-patient-btn"
        onClick={handleSave}
        className="sr-only"
        tabIndex={-1}
      >
        Save Patient
      </button>

      {/* Initials */}
      <div className="space-y-1">
        <label htmlFor="patientInitials" className="block font-medium text-slate-700">
          Initials
        </label>
        <input
          type="text"
          id="patientInitials"
          value={formData.initials}
          onChange={(e) => handleChange('initials', e.target.value)}
          placeholder="e.g. JD"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {/* Is Reporter As Patient */}
      <div className="space-y-1">
        <label htmlFor="isReporterAsPatient" className="block font-medium text-slate-700">
          Is Reporter As Patient
        </label>
        <select
          id="isReporterAsPatient"
          value={formData.isReporterAsPatient}
          onChange={(e) => handleChange('isReporterAsPatient', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-brand-500 focus:outline-none"
        >
          <option value="No">No</option>
          <option value="Yes">Yes</option>
        </select>
      </div>

      {/* Title */}
      <div className="space-y-1">
        <label htmlFor="patientTitle" className="block font-medium text-slate-700">
          Title
        </label>
        <select
          id="patientTitle"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:ring-1 focus:ring-brand-500 focus:outline-none"
        >
          <option value="">Select Title</option>
          <option value="Mr.">Mr.</option>
          <option value="Ms.">Ms.</option>
          <option value="Mrs.">Mrs.</option>
          <option value="Dr.">Dr.</option>
        </select>
      </div>

      {/* First Name */}
      <div className="space-y-1">
        <label htmlFor="patientFirstName" className="block font-medium text-slate-700">
          First Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="patientFirstName"
          value={formData.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          placeholder="Enter First Name"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {/* Last Name */}
      <div className="space-y-1">
        <label htmlFor="patientLastName" className="block font-medium text-slate-700">
          Last Name
        </label>
        <input
          type="text"
          id="patientLastName"
          value={formData.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
          placeholder="Enter Last Name"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {/* Occupation */}
      <div className="space-y-1">
        <label htmlFor="occupation" className="block font-medium text-slate-700">
          Occupation
        </label>
        <input
          type="text"
          id="occupation"
          value={formData.occupation}
          onChange={(e) => handleChange('occupation', e.target.value)}
          placeholder="Enter Occupation"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {/* Date of Birth */}
      <div className="space-y-1">
        <label htmlFor="dateOfBirth" className="block font-medium text-slate-700">
          Date of Birth
        </label>
        <input
          type="date"
          id="dateOfBirth"
          value={formData.dateOfBirth}
          onChange={(e) => handleChange('dateOfBirth', e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {/* Sex Code */}
      <div className="space-y-1">
        <label htmlFor="patientSexCode" className="block font-medium text-slate-700">
          Sex Code
        </label>
        <select
          id="patientSexCode"
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

      {/* Address 1 */}
      <div className="space-y-1">
        <label htmlFor="patientAddress1" className="block font-medium text-slate-700">
          Address 1
        </label>
        <input
          type="text"
          id="patientAddress1"
          value={formData.address1}
          onChange={(e) => handleChange('address1', e.target.value)}
          placeholder="Enter Address 1"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {/* Address 2 */}
      <div className="space-y-1">
        <label htmlFor="patientAddress2" className="block font-medium text-slate-700">
          Address 2
        </label>
        <input
          type="text"
          id="patientAddress2"
          value={formData.address2}
          onChange={(e) => handleChange('address2', e.target.value)}
          placeholder="Enter Address 2"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {/* City */}
      <div className="space-y-1">
        <label htmlFor="patientCity" className="block font-medium text-slate-700">
          City
        </label>
        <input
          type="text"
          id="patientCity"
          value={formData.city}
          onChange={(e) => handleChange('city', e.target.value)}
          placeholder="Enter City"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {/* State */}
      <div className="space-y-1">
        <label htmlFor="patientState" className="block font-medium text-slate-700">
          State
        </label>
        <input
          type="text"
          id="patientState"
          value={formData.state}
          onChange={(e) => handleChange('state', e.target.value)}
          placeholder="Enter State"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {/* Country Code */}
      <div className="space-y-1">
        <label htmlFor="patientCountryCode" className="block font-medium text-slate-700">
          Country Code
        </label>
        <select
          id="patientCountryCode"
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

      {/* Zip Code */}
      <div className="space-y-1">
        <label htmlFor="patientZipCode" className="block font-medium text-slate-700">
          Zip Code
        </label>
        <input
          type="text"
          id="patientZipCode"
          value={formData.zipCode}
          onChange={(e) => handleChange('zipCode', e.target.value)}
          placeholder="Enter Zip Code"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {/* Contact Number */}
      <div className="space-y-1">
        <label htmlFor="patientContactNumber" className="block font-medium text-slate-700">
          Contact Number
        </label>
        <input
          type="text"
          id="patientContactNumber"
          value={formData.contactNumber}
          onChange={(e) => handleChange('contactNumber', e.target.value)}
          placeholder="Enter Contact Number"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-1 focus:ring-brand-500 focus:outline-none"
        />
      </div>

      {/* Email Address */}
      <div className="space-y-1 md:col-span-2">
        <label htmlFor="patientEmailAddress" className="block font-medium text-slate-700">
          Email Address
        </label>
        <input
          type="email"
          id="patientEmailAddress"
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
