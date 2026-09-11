export type NavigationTab = 
  | 'patients' 
  | 'interview'
  | 'timeline' 
  | 'treatment' 
  | 'legal' 
  | 'reports' 
  | 'resources';

export type PatientStatus = 'Activo' | 'En Pausa' | 'Alta Clínica' | 'En Crisis';

export type RiskLevel = 'Bajo' | 'Moderado' | 'Elevado' | 'Crítico';

export interface FamilyInfo {
  livingArrangement: 'Solo' | 'Acompañado' | 'Residencia / Centro' | 'Otro';
  totalFamilyMembersCount?: number | string;
  familyRelationships?: string[];
}

export interface PerinatalDevelopmentHistory {
  pregnancyPlanned?: boolean;
  gestationalTerm?: 'A término' | 'Prematuro' | 'Post-término';
  birthType?: 'Parto Normal / Vaginal' | 'Cesárea' | 'Con Fórceps / Ventosa' | 'Otro';
  pregnancyComplications?: string[];
  pregnancyComplicationsOther?: string;
  partnerSupport?: boolean;
  familySupport?: boolean;
  birthComplications?: string[];
  birthComplicationsOther?: string;

  headSupportAgeMonths?: number | string;
  headSupportMonths?: number | string;
  crawlingAgeMonths?: number | string;
  crawlingMonths?: number | string;
  walkingAgeMonths?: number | string;
  walkingMonths?: number | string;
  weaningAgeMonths?: number | string;
  weaningMonths?: number | string;
  complementaryFeedingAgeMonths?: number | string;
  complementaryFeedingMonths?: number | string;
  diaperWeaningAgeMonths?: number | string;
  diaperWeaningMonths?: number | string;
  pottyTrainingAgeMonths?: number | string;
  sphincterRegressions?: string;
}

export interface Patient {
  id: string;
  fullName: string;
  birthDate?: string;
  idNumber?: string;
  age: number;
  gender: 'Masculino' | 'Femenino' | 'Otro';
  avatar: string;
  email: string;
  phone: string;

  hasAutonomyLimitation?: boolean;
  familyInfo?: FamilyInfo;
  perinatalHistory?: PerinatalDevelopmentHistory;

  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  occupation: string;
  status: PatientStatus;
  riskLevel: RiskLevel;
  startDate: string;
  therapist: string;
  primaryDiagnosis: string;
  icd10Code: string;
  dsm5Code: string;
  totalSessions: number;
  adherenceRate: number;
  lastSessionDate: string;
  nextSessionDate?: string;
  antecedents: {
    medical: string[];
    psychiatric: string[];
    family: string[];
    allergies?: string[];
    medication?: string[];
  };
  activeGoalsCount: number;
}

export interface SessionTechniqueItem {
  instrument: string;
  result: string;
}

export interface SessionDiagnosisItem {
  name: string;
  code: string;
  type: 'PRE' | 'DEF';
}

export interface ClinicalNote {
  id: string;
  patientId: string;
  sessionNumber: number;
  date: string;
  startTime?: string;
  endTime?: string;
  durationMinutes: number;
  modality?: 'Presencial' | 'Virtual';
  type: string;
  
  // Sección 2: Estado Emocional & Mental
  emotionalStateCategories?: string[];
  affectNotes?: string;
  emotionalState: 'Estable' | 'Ansioso' | 'Depresivo' | 'Lábil' | 'Irritable' | 'Euforico';

  // Sección 3: Contenido & Evolución
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;

  // Sección 4: Técnicas e Instrumentos
  appliesTechniques?: boolean;
  techniquesList?: SessionTechniqueItem[];

  // Sección 5: Matriz Diagnóstica
  diagnosesList?: SessionDiagnosisItem[];

  // Sección 6: Próxima Sesión
  nextSessionDate?: string;
  nextSessionTime?: string;
  recommendedFrequency?: string;

  // Sección 7: Profesional & Firma
  therapistSignature?: string;

  bdiScore?: number | string;
  baiScore?: number | string;
  suicideRisk: boolean;
  privateNotes?: string;
}

export type TimelineCategory = 'Crisis' | 'Sesiones' | 'Medicación' | 'Hito Clínico' | 'Evaluación' | 'Evaluaciones' | 'Legal';

export interface TimelineItem {
  id: string;
  patientId: string;
  date: string;
  title: string;
  category: TimelineCategory;
  description: string;
  author: string;
  tags: string[];
  severity?: 'Baja' | 'Media' | 'Alta';
}

export interface TreatmentGoal {
  id: string;
  description: string;
  category: 'Sintomático' | 'Conductual' | 'Cognitivo' | 'Relacional';
  completed: boolean;
  targetDate: string;
}

export interface TreatmentPhase {
  id: string;
  title: string;
  description: string;
  status: 'Completada' | 'En Proceso' | 'Pendiente';
  estimatedSessions: string;
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  primaryDiagnosis: string;
  icdCode: string;
  dsmCode: string;
  orientation: string;
  generalObjective: string;
  specificGoals: TreatmentGoal[];
  phases: TreatmentPhase[];
  updatedAt: string;
}

export interface LegalDocumentItem {
  id: string;
  patientId: string;
  patientName: string;
  documentType: 'Consentimiento Informado TCC' | 'Autorización Protección de Datos (RGPD)' | 'Acuerdo de Honorarios y Cancelación' | 'Revocación de Consentimiento';
  status: 'Firmado' | 'Pendiente' | 'Enviado';
  signedDate?: string;
  sentDate: string;
  fileUrl: string;
  version: string;
}

export interface PsychoResource {
  id: string;
  title: string;
  category: 'Formatos Clínicos' | 'Respiración' | 'Registro Cognitivo' | 'Mindfulness' | 'Lecturas';
  type: 'Audio' | 'Hoja de Trabajo' | 'Lectura' | 'PDF';
  estimatedMinutes: number;
  description: string;
  thumbnailUrl: string;
  downloadsCount: number;
  assignedPatientsCount: number;
}

export interface ClinicAlert {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar: string;
  level: 'Alto' | 'Medio' | 'Informativo' | 'Crítica' | 'Legal';
  title: string;
  message: string;
  timestamp: string;
  actionRequired: string;
  resolved: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatar: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'Presencial' | 'Online Teleconsulta';
  status: 'Confirmada' | 'Pendiente' | 'Completada' | 'Cancelada';
  room?: string;
  notes?: string;
}

export interface ScheduleDay {
  day: string;
  active: boolean;
  slots: { start: string; end: string }[];
}

export interface ScheduleConfig {
  days: ScheduleDay[];
  blockedDates: string[];
  googleCalendarSynced: boolean;
  outlookSynced: boolean;
  autoRemindersWhatsApp: boolean;
  autoRemindersEmail: boolean;
  reminderLeadHours: number;
}

export type OrientacionType = 'Orientado en tiempo, espacio y persona' | 'Desorientado parcial' | 'Desorientado global';
export type TipoAfecto = 'Eutímico' | 'Deprimido' | 'Ansioso / Expansivo' | 'Aplanado / Embotado' | 'Irritable';
export type DerivacionTipo = 'Iniciativa propia' | 'Médico General / Psiquiatra' | 'Institución Educativa' | 'Familiar / Red de Apoyo';

export type LineaTiempoSintoma = 'Agudo (<1 mes)' | 'Subagudo (1-6 meses)' | 'Crónico (>6 meses)';
export type RitmoPsicomotor = 'Normal / Eutímico' | 'Agitación psicomotora' | 'Inhibición / Enlentecimiento';

export type ApetitoPeso = 'Conservado / Estable' | 'Hiporexia (Disminuido)' | 'Hiperfagia (Aumentado)';
export type EnergiaCorporal = 'Nivel óptimo / Normal' | 'Astenia / Fatiga marcadas' | 'Inquietud constante';

export type ClimaFamiliar = 'Armónico y protector' | 'Conflictivo / Hostil' | 'Distante / Desestructurado' | 'Monoparental con alta tensión';
export type RolAsumido = 'Hijo/a promedio / Sin rol forzado' | 'Cuidador/a prematuro' | 'Chivo expiatorio / Paciente identified' | 'Sostén económico';

export type ValidacionEmocional = 'Alta validación y escucha' | 'Invalidation / Minimización' | 'Negligencia afectiva';
export type AdaptacionSocial = 'Buena integración y rendimiento' | 'Aislamiento progresivo' | 'Conflictividad recurrente';

export type AtencionConcentracion = 'Conservada / Buena concentración' | 'Hipoprosexia (Dificultad de atención)' | 'Distraibilidad elevada';
export type DinamicaVincular = 'Apego seguro / Relaciones estables' | 'Apego ansioso / Ambivalente' | 'Apego evitativo' | 'Apego desorganizado';
export type AnhedoniaNivel = 'Capacidad de goce conservada' | 'Anhedonia parcial' | 'Anhedonia severa / Apatía generalizada';

export type VitalRiskLevel = 'sin_riesgo' | 'riesgo_bajo' | 'riesgo_medio' | 'riesgo_alto_inminente';

export interface InitialInterviewData {
  id?: string;
  meta_paciente_id: string;
  meta_terapeuta_id: string;
  meta_terapeuta_nombre: string;
  meta_fecha: string;

  eval_orientacion: OrientacionType;
  eval_orientacion_detalle?: string;
  eval_tipo_afecto: TipoAfecto;
  eval_motivo_consulta: string;
  eval_derivacion_tipo: DerivacionTipo;

  sint_experiencia_actual: string;
  sint_linea_tiempo: LineaTiempoSintoma;
  sint_ritmo_psicomotor: RitmoPsicomotor;
  sint_desencadenantes: string[];

  somat_patron_sueno: string[];
  somat_apetito_peso: ApetitoPeso;
  somat_energia_corporal: EnergiaCorporal;
  somat_somatizaciones: string[];
  somat_somatizaciones_otros?: string;

  bio_narrativa_infancia: string;
  bio_clima_familiar: ClimaFamiliar;
  bio_rol_asumido: RolAsumido;
  bio_validacion_emocional: ValidacionEmocional;
  bio_adaptacion_social: AdaptacionSocial;
  bio_narrativa_trauma?: string;
  bio_criterios_tept: boolean;

  cog_pensamiento_predominante: string;
  cog_foco_cognitivo: string[];
  cog_atencion: AtencionConcentracion;

  riesgo_vital_nivel: VitalRiskLevel;
  riesgo_detalle_evaluacion?: string;

  soc_vinculos_red_apoyo: string;
  soc_dinamica_vincular: DinamicaVincular;
  soc_anhedonia: AnhedoniaNivel;

  ant_historia_previa: string[];
  ant_enfermedad_medica_flag: boolean;
  ant_enfermedad_medica_detalle?: string;
  ant_farmacos_flag: boolean;
  ant_farmacos_detalle?: string;
  ant_sustancias_consumo: string[];

  imp_resumen_psicodinamico?: string;
  imp_hipotesis_diagnostica?: string;
  imp_plan_intervencion?: string;
  imp_recomendaciones?: string;

  is_draft?: boolean;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}
