-- Ukiana - Gestión Clínica Psicológica
-- Schema SQL completo y alineado con el frontend y servicios para Supabase PostgreSQL

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Terapeutas / Usuarios Profesionales
CREATE TABLE IF NOT EXISTS public.therapists (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  professional_license TEXT,
  specialization TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de Pacientes
CREATE TABLE IF NOT EXISTS public.patients (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  therapist_id TEXT,
  full_name TEXT NOT NULL,
  birth_date DATE,
  id_number TEXT,
  age INT NOT NULL,
  gender TEXT NOT NULL,
  avatar TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  has_autonomy_limitation BOOLEAN DEFAULT FALSE,
  family_info JSONB DEFAULT '{}'::jsonb,
  perinatal_history JSONB DEFAULT '{}'::jsonb,
  emergency_contact JSONB NOT NULL DEFAULT '{}'::jsonb,
  occupation TEXT,
  status TEXT NOT NULL DEFAULT 'Activo',
  risk_level TEXT NOT NULL DEFAULT 'Bajo',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  therapist TEXT DEFAULT 'Médico Responsable',
  primary_diagnosis TEXT,
  icd10_code TEXT,
  dsm5_code TEXT,
  total_sessions INT DEFAULT 0,
  adherence_rate INT DEFAULT 100,
  last_session_date DATE,
  next_session_date TEXT,
  antecedents JSONB DEFAULT '{"medical":[], "psychiatric":[], "family":[], "allergies":[], "medication":[]}'::jsonb,
  active_goals_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla de Notas Clínicas SOAP
CREATE TABLE IF NOT EXISTS public.clinical_notes (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  session_number INT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TEXT,
  end_time TEXT,
  duration_minutes INT DEFAULT 50,
  modality TEXT DEFAULT 'Presencial',
  type TEXT NOT NULL DEFAULT 'Sesión Regular',
  emotional_state_categories TEXT[] DEFAULT '{}',
  affect_notes TEXT,
  emotional_state TEXT DEFAULT 'Estable',
  subjective TEXT NOT NULL,
  objective TEXT NOT NULL,
  assessment TEXT NOT NULL,
  plan TEXT NOT NULL,
  applies_techniques BOOLEAN DEFAULT FALSE,
  techniques_list JSONB DEFAULT '[]'::jsonb,
  diagnoses_list JSONB DEFAULT '[]'::jsonb,
  next_session_date TEXT,
  next_session_time TEXT,
  recommended_frequency TEXT,
  therapist_signature TEXT,
  bdi_score TEXT,
  bai_score TEXT,
  suicide_risk BOOLEAN DEFAULT FALSE,
  private_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Línea del Tiempo Terapéutica
CREATE TABLE IF NOT EXISTS public.timeline_items (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  author TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  severity TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Planes de Tratamiento
CREATE TABLE IF NOT EXISTS public.treatment_plans (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  patient_id TEXT UNIQUE NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  primary_diagnosis TEXT NOT NULL,
  icd_code TEXT,
  dsm_code TEXT,
  orientation TEXT NOT NULL,
  general_objective TEXT NOT NULL,
  specific_goals JSONB DEFAULT '[]'::jsonb,
  phases JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla de Documentos Legales y Consentimientos RGPD
CREATE TABLE IF NOT EXISTS public.legal_documents (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pendiente',
  signed_date TIMESTAMPTZ,
  sent_date TIMESTAMPTZ,
  file_url TEXT,
  version TEXT DEFAULT '1.0',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabla de Recursos Psicoeducativos
CREATE TABLE IF NOT EXISTS public.psycho_resources (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL,
  estimated_minutes INT DEFAULT 10,
  description TEXT NOT NULL,
  thumbnail_url TEXT,
  downloads_count INT DEFAULT 0,
  assigned_patients_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabla de Alertas Clínicas
CREATE TABLE IF NOT EXISTS public.clinic_alerts (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_avatar TEXT,
  level TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_required TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabla de Agenda de Citas
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_avatar TEXT,
  date DATE NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Presencial',
  status TEXT NOT NULL DEFAULT 'Confirmada',
  room TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Tabla de Entrevistas Iniciales y Evaluación Clínica Semiestructurada
CREATE TABLE IF NOT EXISTS public.initial_interviews (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  patient_id TEXT NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  therapist_id TEXT,
  therapist_name TEXT,
  evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,

  -- Examen de Entrada
  eval_orientacion TEXT NOT NULL DEFAULT 'Orientado en tiempo, espacio y persona',
  eval_orientacion_detalle TEXT,
  eval_tipo_afecto TEXT NOT NULL DEFAULT 'Eutímico',
  eval_motivo_consulta TEXT NOT NULL,
  eval_derivacion_tipo TEXT NOT NULL DEFAULT 'Iniciativa propia',

  -- Sintomatología y Fenomenología
  sint_experiencia_actual TEXT NOT NULL,
  sint_linea_tiempo TEXT NOT NULL DEFAULT 'Subagudo (1-6 meses)',
  sint_ritmo_psicomotor TEXT NOT NULL DEFAULT 'Normal / Eutímico',
  sint_desencadenantes TEXT[] DEFAULT '{}',

  -- Examen Fisiológico y Somático
  somat_patron_sueno TEXT[] DEFAULT '{}',
  somat_apetito_peso TEXT NOT NULL DEFAULT 'Conservado / Estable',
  somat_energia_corporal TEXT NOT NULL DEFAULT 'Nivel óptimo / Normal',
  somat_somatizaciones TEXT[] DEFAULT '{}',
  somat_somatizaciones_otros TEXT,

  -- Memoria Biográfica y Trauma
  bio_narrativa_infancia TEXT,
  bio_clima_familiar TEXT NOT NULL DEFAULT 'Armónico y protector',
  bio_rol_asumido TEXT NOT NULL DEFAULT 'Hijo/a promedio / Sin rol forzado',
  bio_validacion_emocional TEXT NOT NULL DEFAULT 'Alta validación y escucha',
  bio_adaptacion_social TEXT NOT NULL DEFAULT 'Buena integración y rendimiento',
  bio_narrativa_trauma TEXT,
  bio_criterios_tept BOOLEAN DEFAULT FALSE,

  -- Esfera Cognitiva y Riesgo
  cog_pensamiento_predominante TEXT,
  cog_foco_cognitivo TEXT[] DEFAULT '{}',
  cog_atencion TEXT NOT NULL DEFAULT 'Conservada / Buena concentración',
  riesgo_vital_nivel TEXT NOT NULL DEFAULT 'sin_riesgo',
  riesgo_detalle_evaluacion TEXT,

  -- Red Social y Cotidianeidad
  soc_vinculos_red_apoyo TEXT,
  soc_dinamica_vincular TEXT NOT NULL DEFAULT 'Apego seguro / Relaciones estables',
  soc_anhedonia TEXT NOT NULL DEFAULT 'Capacidad de goce conservada',

  -- Antecedentes y Consumos
  ant_historia_previa TEXT[] DEFAULT '{}',
  ant_enfermedad_medica_flag BOOLEAN DEFAULT FALSE,
  ant_enfermedad_medica_detalle TEXT,
  ant_farmacos_flag BOOLEAN DEFAULT FALSE,
  ant_farmacos_detalle TEXT,
  ant_sustancias_consumo TEXT[] DEFAULT '{}',

  -- Estado
  is_draft BOOLEAN DEFAULT TRUE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- POLÍTICAS DE SEGURIDAD ROW LEVEL SECURITY (RLS)
-- Habilitar RLS en todas las tablas
-- ========================================================
ALTER TABLE public.therapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psycho_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.initial_interviews ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso completo (Permite operar con anon y con usuarios autenticados para MVP y Demo)
CREATE POLICY "Acceso total a therapists" ON public.therapists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a patients" ON public.patients FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a clinical_notes" ON public.clinical_notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a timeline_items" ON public.timeline_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a treatment_plans" ON public.treatment_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a legal_documents" ON public.legal_documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a psycho_resources" ON public.psycho_resources FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a clinic_alerts" ON public.clinic_alerts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total a initial_interviews" ON public.initial_interviews FOR ALL USING (true) WITH CHECK (true);
