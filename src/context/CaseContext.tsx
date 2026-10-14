import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CaseRecord,
  Question,
  QuestionnaireTemplate,
  ReporterInfo,
  PatientInfo,
  ProductInfo,
  EventInfo,
  ActivityLogItem,
  AuditHistoryRecord,
  MedicalSourceDocument,
  FAQItem
} from '../types/onepv';

export const SYSTEM_TEMPLATES: QuestionnaireTemplate[] = [
  {
    id: 'tmpl-1',
    name: 'Initial Adverse Event Template',
    questions: [
      { id: 'tq-1-1', fieldType: 'Yes/No', question: 'Did reaction abate after stopping drug?' },
      { id: 'tq-1-2', fieldType: 'Yes/No', question: 'Did reaction reappear after reintroduction?' },
    ],
  },
  {
    id: 'tmpl-2',
    name: 'Concomitant Medication Template',
    questions: [
      { id: 'tq-2-1', fieldType: 'Yes/No', question: 'Was patient taking any other medication?' },
      { id: 'tq-2-2', fieldType: 'Text', question: 'Were any drug interactions suspected?' },
    ],
  },
  {
    id: 'tmpl-3',
    name: 'Hospitalization Follow-up Template',
    questions: [
      { id: 'tq-3-1', fieldType: 'Text', question: 'Admission Date and Facility Name' },
      { id: 'tq-3-2', fieldType: 'Yes/No', question: 'Discharge Summary Available?' },
    ],
  },
];

export const MEDICAL_SOURCE_DOCUMENTS: MedicalSourceDocument[] = [
  {
    id: 'DOC-CV-001',
    title: 'Clinevo-Vax Clinical Safety Summary & Pharmacology Datasheet',
    productName: 'Clinevo-Vax 500mg',
    url: '/medical-source-document',
    downloadFileName: 'Product_Medical_Information_Source.pdf',
  },
  {
    id: 'DOC-CS-002',
    title: 'CardioSafe Efficacy & Toxicity Monograph',
    productName: 'CardioSafe 10mg',
    url: '/medical-source-document',
    downloadFileName: 'CardioSafe_Monograph.pdf',
  },
  {
    id: 'DOC-NC-003',
    title: 'NeuroCalm Pharmacology & Tolerability Profile',
    productName: 'NeuroCalm 25mg',
    url: '/medical-source-document',
    downloadFileName: 'NeuroCalm_Datasheet.pdf',
  },
];

export const FAQ_LIST: FAQItem[] = [
  {
    id: 'FAQ-001',
    productName: 'Clinevo-Vax 500mg',
    question: 'Is fever expected after administration of Clinevo-Vax 500mg?',
    answer: 'Mild to moderate transient fever (Pyrexia) is a known adverse drug reaction typically resolving within 24 to 48 hours without medical intervention. Hydration and antipyretics may be considered if symptoms persist.',
  },
  {
    id: 'FAQ-002',
    productName: 'Clinevo-Vax 500mg',
    question: 'What is the recommended dosage for adult patients experiencing pyrexia?',
    answer: 'The recommended adult dosage of Paracetamol is 500mg orally every 4 to 6 hours as needed, not exceeding 4000mg in any 24-hour window.',
  },
  {
    id: 'FAQ-003',
    productName: 'CardioSafe 10mg',
    question: 'Can CardioSafe be administered concurrently with ACE inhibitors?',
    answer: 'Yes, CardioSafe (Amlodipine Besylate) can be safely co-administered with ACE inhibitors under clinical supervision with blood pressure monitoring.',
  },
  {
    id: 'FAQ-004',
    productName: 'NeuroCalm 25mg',
    question: 'Does NeuroCalm cause somnolence or dizziness upon initiation?',
    answer: 'Somnolence and dizziness are recognized common reactions during titration. Patients are advised to refrain from operating machinery until tolerance is established.',
  },
];

const INITIAL_REPORTER: ReporterInfo = {
  title: '',
  firstName: '',
  lastName: '',
  sexCode: '',
  isPrimaryReporter: true,
  relationshipWithPatientCode: '',
  reporterTypeCode: '',
  isReporterHealthCareProfessional: false,
  address1: '',
  address2: '',
  city: '',
  state: '',
  countryCode: '',
  zipcode: '',
  fax: '',
  contactNumber: '',
  emailAddress: '',
};

const INITIAL_PATIENT: PatientInfo = {
  initials: '',
  isReporterAsPatient: 'No',
  title: '',
  firstName: '',
  lastName: '',
  occupation: '',
  dateOfBirth: '',
  sexCode: '',
  address1: '',
  address2: '',
  city: '',
  state: '',
  countryCode: '',
  zipCode: '',
  contactNumber: '',
  emailAddress: '',
};

const INITIAL_PRODUCT: ProductInfo = {
  productName: '',
  genericName: '',
  formulationCode: '',
  additionalDrugInfo: '',
  saved: false,
};

const INITIAL_EVENT: EventInfo = {
  reactionOrEventAsReported: '',
  reportedTerm: '',
  meddraCode: '',
  pt: '',
  soc: '',
  startDate: '',
  endDate: '',
  assessment: {
    caseSeriousReporterCode: '',
    caseSeriousCompanyCode: '',
    outcomeCode: '',
    lackOfEfficacy: '',
  },
  seriousness: {
    death: '',
    hospitalization: '',
    lifeThreatening: '',
    disabling: '',
    congenitalAnomaly: '',
    interventionRequired: '',
    medicallySignificant: '',
    others: '',
  },
  saved: false,
};

const PRE_SEEDED_CASE: CaseRecord = {
  id: 'case-seeded-001',
  temporaryCaseId: 'TMP-CASE-1001',
  caseNumber: 'CASE-2026-001',
  status: 'Submitted',
  generalInfo: {
    caseClassificationCode: 'Adverse Event',
    caseIntakeSourceCode: 'Other',
    companyReceiptDate: '2026-10-10',
    processingCenterReceivedDate: '2026-10-10',
  },
  questionnaires: [
    {
      id: 'q-seed-1',
      fieldType: 'Yes/No',
      question: 'Did reaction abate after stopping drug?',
      response: 'Yes',
      source: 'template',
      templateId: 'tmpl-1',
      templateName: 'Initial Adverse Event Template',
    },
    {
      id: 'q-seed-2',
      fieldType: 'Yes/No',
      question: 'Did reaction reappear after reintroduction?',
      response: 'No',
      source: 'template',
      templateId: 'tmpl-1',
      templateName: 'Initial Adverse Event Template',
    },
  ],
  importedTemplateIds: ['tmpl-1'],
  reporter: {
    title: 'Dr.',
    firstName: 'Alex',
    lastName: 'Morgan',
    sexCode: 'Male',
    isPrimaryReporter: true,
    relationshipWithPatientCode: 'Physician',
    reporterTypeCode: 'Physician',
    isReporterHealthCareProfessional: true,
    address1: '100 Medical Plaza',
    address2: 'Suite 400',
    city: 'Boston',
    state: 'MA',
    countryCode: 'United States',
    zipcode: '02115',
    fax: '617-555-0199',
    contactNumber: '617-555-0100',
    emailAddress: 'alex.morgan@hospital.org',
  },
  patient: {
    initials: 'JM',
    isReporterAsPatient: 'No',
    title: 'Mr.',
    firstName: 'James',
    lastName: 'Miller',
    occupation: 'Teacher',
    dateOfBirth: '1985-05-15',
    sexCode: 'Male',
    address1: '45 Elm Street',
    address2: '',
    city: 'Cambridge',
    state: 'MA',
    countryCode: 'United States',
    zipCode: '02138',
    contactNumber: '617-555-0144',
    emailAddress: 'jmiller@example.com',
  },
  product: {
    productName: 'Clinevo-Vax 500mg',
    genericName: 'Paracetamol',
    formulationCode: 'TAB - Film-Coated Tablet',
    additionalDrugInfo: 'Batch #CV-2026-88',
    saved: true,
  },
  event: {
    reactionOrEventAsReported: 'Fever',
    reportedTerm: 'Fever',
    meddraCode: '10016558',
    pt: 'Pyrexia',
    soc: 'General disorders',
    startDate: '2026-10-09',
    endDate: '2026-10-11',
    assessment: {
      caseSeriousReporterCode: 'No',
      caseSeriousCompanyCode: 'No',
      outcomeCode: 'Recovered/Resolved',
      lackOfEfficacy: 'No',
    },
    seriousness: {
      death: 'No',
      hospitalization: 'No',
      lifeThreatening: 'No',
      disabling: 'No',
      congenitalAnomaly: 'No',
      interventionRequired: 'No',
      medicallySignificant: 'No',
      others: 'No',
    },
    saved: true,
  },
  activityLogs: [
    {
      id: 'log-seed-1',
      openDate: '2026-10-10',
      closeDate: '2026-10-11',
      type: 'Case Review',
      comments: 'Initial medical review completed. Causality assessed as probable.',
    },
  ],
  createdAt: '10-Oct-2026 09:30:00',
  updatedAt: '14-Oct-2026 12:00:00',
};

const PRE_SEEDED_AUDIT: AuditHistoryRecord[] = [
  {
    id: 'audit-seed-1',
    caseNumber: 'CASE-2026-001',
    fieldName: 'Reported Term',
    oldValue: 'Fever',
    newValue: 'Pyrexia (Updated)',
    updatedBy: 'Safety Officer',
    timestamp: '14-Oct-2026 12:00:00',
  },
  {
    id: 'audit-seed-2',
    caseNumber: 'CASE-2026-001',
    fieldName: 'Additional Drug Information',
    oldValue: '',
    newValue: 'Batch #CV-2026-88',
    updatedBy: 'Safety Officer',
    timestamp: '14-Oct-2026 11:30:00',
  },
];

interface CaseContextType {
  cases: CaseRecord[];
  currentCase: CaseRecord;
  auditHistory: AuditHistoryRecord[];
  updateGeneralInfo: (info: CaseRecord['generalInfo']) => string; // returns tempId
  clearGeneralInfo: () => void;
  addQuestionManual: (fieldType: Question['fieldType'], questionText: string) => void;
  addTemplateQuestions: (templateId: string) => boolean; // returns false if duplicate
  updateQuestionResponse: (id: string, response: string) => void;
  deleteQuestion: (id: string, reason: string) => void;
  deleteTemplate: (templateId: string, reason: string) => void;
  updateReporter: (reporter: ReporterInfo) => void;
  updatePatient: (patient: PatientInfo) => void;
  updateProduct: (product: ProductInfo) => void;
  updateEvent: (event: EventInfo, user?: string) => void;
  addActivityLog: (log: Omit<ActivityLogItem, 'id'>) => void;
  updateActivityLog: (log: ActivityLogItem) => void;
  deleteActivityLog: (id: string, reason: string) => void;
  submitCase: () => string; // returns generated Case Number
  updateReportedTermInCase: (caseNumber: string, newReportedTerm: string, user: string) => void;
  resetCurrentCase: () => void;
  getCaseByNumber: (caseNumber: string) => CaseRecord | undefined;
}

const createFreshDraft = (): CaseRecord => ({
  id: `draft-${Date.now()}`,
  temporaryCaseId: '',
  status: 'Registered',
  generalInfo: {
    caseClassificationCode: '',
    caseIntakeSourceCode: '',
    companyReceiptDate: '',
    processingCenterReceivedDate: '',
  },
  questionnaires: [],
  importedTemplateIds: [],
  reporter: { ...INITIAL_REPORTER },
  patient: { ...INITIAL_PATIENT },
  product: { ...INITIAL_PRODUCT },
  event: { ...INITIAL_EVENT },
  activityLogs: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const CaseContext = createContext<CaseContextType | undefined>(undefined);

export const CaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cases, setCases] = useState<CaseRecord[]>(() => {
    const saved = localStorage.getItem('onepv_cases');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // Fall back to pre-seeded
      }
    }
    return [PRE_SEEDED_CASE];
  });

  const [auditHistory, setAuditHistory] = useState<AuditHistoryRecord[]>(() => {
    const saved = localStorage.getItem('onepv_audit_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // Fall back
      }
    }
    return PRE_SEEDED_AUDIT;
  });

  const [currentCase, setCurrentCase] = useState<CaseRecord>(() => {
    const saved = localStorage.getItem('onepv_current_case');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return createFreshDraft();
      }
    }
    return createFreshDraft();
  });

  useEffect(() => {
    localStorage.setItem('onepv_cases', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem('onepv_audit_history', JSON.stringify(auditHistory));
  }, [auditHistory]);

  useEffect(() => {
    localStorage.setItem('onepv_current_case', JSON.stringify(currentCase));
  }, [currentCase]);

  const addAuditRecord = (caseNum: string, field: string, oldVal: string, newVal: string, user: string = 'User') => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestamp = `${pad(now.getDate())}-${months[now.getMonth()]}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

    const newRecord: AuditHistoryRecord = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      caseNumber: caseNum,
      fieldName: field,
      oldValue: oldVal,
      newValue: newVal,
      updatedBy: user,
      timestamp,
    };
    setAuditHistory((prev) => [newRecord, ...prev]);
  };

  const updateGeneralInfo = (info: CaseRecord['generalInfo']) => {
    const tempId = currentCase.temporaryCaseId || `TMP-CASE-${Math.floor(1000 + Math.random() * 9000)}`;
    const updated = {
      ...currentCase,
      generalInfo: info,
      temporaryCaseId: tempId,
      updatedAt: new Date().toISOString(),
    };
    setCurrentCase(updated);
    return tempId;
  };

  const clearGeneralInfo = () => {
    setCurrentCase((prev) => ({
      ...prev,
      generalInfo: {
        caseClassificationCode: '',
        caseIntakeSourceCode: '',
        companyReceiptDate: '',
        processingCenterReceivedDate: '',
      },
    }));
  };

  const addQuestionManual = (fieldType: Question['fieldType'], questionText: string) => {
    const newQ: Question = {
      id: `q-man-${Date.now()}`,
      fieldType,
      question: questionText,
      response: '',
      source: 'manual',
    };
    setCurrentCase((prev) => ({
      ...prev,
      questionnaires: [...prev.questionnaires, newQ],
    }));
  };

  const addTemplateQuestions = (templateId: string): boolean => {
    if (currentCase.importedTemplateIds.includes(templateId)) {
      return false; // Already imported! Restrict duplicate (OQ 16)
    }
    const template = SYSTEM_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return false;

    const importedQuestions: Question[] = template.questions.map((q) => ({
      id: `q-tmpl-${template.id}-${q.id}-${Date.now()}`,
      fieldType: q.fieldType,
      question: q.question,
      response: '',
      source: 'template',
      templateId: template.id,
      templateName: template.name,
    }));

    setCurrentCase((prev) => ({
      ...prev,
      importedTemplateIds: [...prev.importedTemplateIds, template.id],
      questionnaires: [...prev.questionnaires, ...importedQuestions],
    }));
    return true;
  };

  const updateQuestionResponse = (id: string, response: string) => {
    setCurrentCase((prev) => ({
      ...prev,
      questionnaires: prev.questionnaires.map((q) => (q.id === id ? { ...q, response } : q)),
    }));
  };

  const deleteQuestion = (id: string, _reason: string) => {
    setCurrentCase((prev) => ({
      ...prev,
      questionnaires: prev.questionnaires.filter((q) => q.id !== id),
    }));
  };

  const deleteTemplate = (templateId: string, _reason: string) => {
    setCurrentCase((prev) => ({
      ...prev,
      importedTemplateIds: prev.importedTemplateIds.filter((id) => id !== templateId),
      questionnaires: prev.questionnaires.filter((q) => q.templateId !== templateId),
    }));
  };

  const updateReporter = (reporter: ReporterInfo) => {
    setCurrentCase((prev) => ({ ...prev, reporter }));
  };

  const updatePatient = (patient: PatientInfo) => {
    setCurrentCase((prev) => ({ ...prev, patient }));
  };

  const updateProduct = (product: ProductInfo) => {
    const prevDrugInfo = currentCase.product.additionalDrugInfo;
    if (prevDrugInfo && product.additionalDrugInfo && prevDrugInfo !== product.additionalDrugInfo) {
      const activeCaseNum = currentCase.caseNumber || currentCase.temporaryCaseId || 'NEW-CASE';
      addAuditRecord(activeCaseNum, 'Additional Drug Information', prevDrugInfo, product.additionalDrugInfo);
    }
    setCurrentCase((prev) => ({ ...prev, product: { ...product, saved: true } }));
  };

  const updateEvent = (event: EventInfo, user: string = 'User') => {
    const prevTerm = currentCase.event.reportedTerm;
    if (prevTerm && event.reportedTerm && prevTerm !== event.reportedTerm) {
      const activeCaseNum = currentCase.caseNumber || currentCase.temporaryCaseId || 'NEW-CASE';
      addAuditRecord(activeCaseNum, 'Reported Term', prevTerm, event.reportedTerm, user);
    }
    setCurrentCase((prev) => ({ ...prev, event: { ...event, saved: true } }));
  };

  const addActivityLog = (log: Omit<ActivityLogItem, 'id'>) => {
    const newLog: ActivityLogItem = {
      ...log,
      id: `log-${Date.now()}`,
    };
    setCurrentCase((prev) => ({
      ...prev,
      activityLogs: [newLog, ...prev.activityLogs],
    }));
  };

  const updateActivityLog = (updatedLog: ActivityLogItem) => {
    setCurrentCase((prev) => ({
      ...prev,
      activityLogs: prev.activityLogs.map((l) => (l.id === updatedLog.id ? updatedLog : l)),
    }));
  };

  const deleteActivityLog = (id: string, _reason: string) => {
    setCurrentCase((prev) => ({
      ...prev,
      activityLogs: prev.activityLogs.filter((l) => l.id !== id),
    }));
  };

  const submitCase = (): string => {
    // Generate permanent case number (e.g. CASE-2026-002)
    const existingCount = cases.filter((c) => c.caseNumber).length;
    const seq = (existingCount + 1).toString().padStart(3, '0');
    const caseNum = `CASE-2026-${seq}`;

    const submitted: CaseRecord = {
      ...currentCase,
      caseNumber: caseNum,
      status: 'Submitted',
      updatedAt: new Date().toISOString(),
    };

    // Upsert into cases list
    setCases((prev) => {
      const existingIdx = prev.findIndex((c) => c.id === submitted.id || (submitted.caseNumber && c.caseNumber === submitted.caseNumber));
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = submitted;
        return copy;
      }
      return [submitted, ...prev];
    });

    setCurrentCase(submitted);
    return caseNum;
  };

  const updateReportedTermInCase = (caseNumber: string, newReportedTerm: string, user: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.caseNumber === caseNumber) {
          const oldTerm = c.event.reportedTerm;
          addAuditRecord(caseNumber, 'Reported Term', oldTerm, newReportedTerm, user);
          return {
            ...c,
            event: {
              ...c.event,
              reportedTerm: newReportedTerm,
            },
          };
        }
        return c;
      })
    );

    if (currentCase.caseNumber === caseNumber) {
      setCurrentCase((prev) => ({
        ...prev,
        event: {
          ...prev.event,
          reportedTerm: newReportedTerm,
        },
      }));
    }
  };

  const resetCurrentCase = () => {
    const fresh = createFreshDraft();
    setCurrentCase(fresh);
    localStorage.removeItem('onepv_current_case');
  };

  const getCaseByNumber = (caseNumber: string) => {
    return cases.find((c) => c.caseNumber === caseNumber || c.temporaryCaseId === caseNumber);
  };

  return (
    <CaseContext.Provider
      value={{
        cases,
        currentCase,
        auditHistory,
        updateGeneralInfo,
        clearGeneralInfo,
        addQuestionManual,
        addTemplateQuestions,
        updateQuestionResponse,
        deleteQuestion,
        deleteTemplate,
        updateReporter,
        updatePatient,
        updateProduct,
        updateEvent,
        addActivityLog,
        updateActivityLog,
        deleteActivityLog,
        submitCase,
        updateReportedTermInCase,
        resetCurrentCase,
        getCaseByNumber,
      }}
    >
      {children}
    </CaseContext.Provider>
  );
};

export const useCases = () => {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCases must be used within a CaseProvider');
  }
  return context;
};
