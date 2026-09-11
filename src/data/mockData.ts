import { 
  Patient, 
  ClinicalNote, 
  TimelineItem, 
  TreatmentPlan, 
  LegalDocumentItem, 
  PsychoResource, 
  ClinicAlert, 
  Appointment, 
  ScheduleConfig 
} from '../types';

export const MOCK_PATIENTS: Patient[] = [];
export const MOCK_CLINICAL_NOTES: ClinicalNote[] = [];
export const MOCK_TIMELINE: TimelineItem[] = [];
export const MOCK_TREATMENT_PLAN: TreatmentPlan | undefined = undefined;
export const MOCK_LEGAL_DOCUMENTS: LegalDocumentItem[] = [];
export const MOCK_RESOURCES: PsychoResource[] = [];
export const MOCK_ALERTS: ClinicAlert[] = [];
export const MOCK_APPOINTMENTS: Appointment[] = [];

export const DEFAULT_SCHEDULE_CONFIG: ScheduleConfig = {
  days: [
    { day: 'Lunes', active: true, slots: [{ start: '09:00', end: '18:00' }] },
    { day: 'Martes', active: true, slots: [{ start: '09:00', end: '18:00' }] },
    { day: 'Miércoles', active: true, slots: [{ start: '09:00', end: '18:00' }] },
    { day: 'Jueves', active: true, slots: [{ start: '09:00', end: '18:00' }] },
    { day: 'Viernes', active: true, slots: [{ start: '09:00', end: '18:00' }] },
    { day: 'Sábado', active: false, slots: [] },
    { day: 'Domingo', active: false, slots: [] }
  ],
  blockedDates: [],
  googleCalendarSynced: false,
  outlookSynced: false,
  autoRemindersWhatsApp: true,
  autoRemindersEmail: true,
  reminderLeadHours: 24
};

export const MOCK_SCHEDULE_CONFIG: ScheduleConfig = DEFAULT_SCHEDULE_CONFIG;

export const MOCK_ANALYTICS = {
  kpis: {
    activePatients: 0,
    activePatientsChange: '0%',
    adherenceRate: 0,
    adherenceRateChange: '0%',
    completedSessions: 0,
    completedSessionsChange: '0 este mes',
    avgRecoveryTimeWeeks: 0,
    avgRecoveryTimeChange: '0 semanas'
  },
  recoveryTrendData: [],
  diagnosisDistribution: [],
  retentionCohort: []
};
