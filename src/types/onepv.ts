export type SimulationMode = 'PASS' | 'FAIL' | 'BLOCKED';

export interface GeneralInfo {
  caseClassificationCode: string;
  caseIntakeSourceCode: string;
  companyReceiptDate: string;
  processingCenterReceivedDate: string;
}

export type QuestionFieldType = 'Text' | 'Yes/No' | 'Date' | 'Number' | '';

export interface Question {
  id: string;
  fieldType: QuestionFieldType;
  question: string;
  response: string;
  source: 'manual' | 'template';
  templateId?: string;
  templateName?: string;
}

export interface QuestionnaireTemplate {
  id: string;
  name: string;
  questions: {
    id: string;
    fieldType: QuestionFieldType;
    question: string;
  }[];
}

export interface ReporterInfo {
  title: string;
  firstName: string;
  lastName: string;
  sexCode: string;
  isPrimaryReporter: boolean;
  relationshipWithPatientCode: string;
  reporterTypeCode: string;
  isReporterHealthCareProfessional: boolean;
  address1: string;
  address2: string;
  city: string;
  state: string;
  countryCode: string;
  zipcode: string;
  fax: string;
  contactNumber: string;
  emailAddress: string;
}

export interface PatientInfo {
  initials: string;
  isReporterAsPatient: string; // 'No' | 'Yes'
  title: string;
  firstName: string;
  lastName: string;
  occupation: string;
  dateOfBirth: string;
  sexCode: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  countryCode: string;
  zipCode: string;
  contactNumber: string;
  emailAddress: string;
}

export interface ProductInfo {
  productName: string;
  genericName: string;
  formulationCode: string;
  additionalDrugInfo: string;
  saved: boolean;
}

export interface EventAssessment {
  caseSeriousReporterCode: string;
  caseSeriousCompanyCode: string;
  outcomeCode: string;
  lackOfEfficacy: string;
}

export interface EventSeriousness {
  death: string;
  hospitalization: string;
  lifeThreatening: string;
  disabling: string;
  congenitalAnomaly: string;
  interventionRequired: string;
  medicallySignificant: string;
  others: string;
}

export interface EventInfo {
  reactionOrEventAsReported: string;
  reportedTerm: string;
  meddraCode: string;
  pt: string;
  soc: string;
  startDate: string;
  endDate: string;
  assessment: EventAssessment;
  seriousness: EventSeriousness;
  saved: boolean;
}

export interface ActivityLogItem {
  id: string;
  openDate: string;
  closeDate: string;
  type: string;
  comments: string;
}

export interface AuditHistoryRecord {
  id: string;
  caseNumber: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  updatedBy: string;
  timestamp: string;
}

export interface CaseRecord {
  id: string;
  temporaryCaseId: string;
  caseNumber?: string;
  status: 'Registered' | 'Submitted';
  generalInfo: GeneralInfo;
  questionnaires: Question[];
  importedTemplateIds: string[];
  reporter: ReporterInfo;
  patient: PatientInfo;
  product: ProductInfo;
  event: EventInfo;
  activityLogs: ActivityLogItem[];
  createdAt: string;
  updatedAt: string;
}

export interface MedicalSourceDocument {
  id: string;
  title: string;
  productName: string;
  url: string;
  downloadFileName: string;
}

export interface FAQItem {
  id: string;
  productName: string;
  question: string;
  answer: string;
}
