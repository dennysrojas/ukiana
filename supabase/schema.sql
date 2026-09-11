-- Ukiana - Gestión Clínica Psicológica
-- Schema SQL completo para PostgreSQL en Supabase

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Terapeutas / Usuarios Profesionales
CREATE TABLE IF NOT EXISTS public.therapists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  therapist_id UUID REFERENCES public.therapists(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  age INT NOT NULL,
  gender TEXT NOT NULL,
  avatar TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  emergency_contact JSONB NOT NULL DEFAULT '{}'::jsonb,
  occupation TEXT,
  status TEXT NOT NULL CHECK (status IN ('Activo', 'En Pausa', 'Alta Clínica', 'En Crisis')) DEFAULT 'Activo',
  risk_level TEXT NOT NULL CHECK (risk_level IN ('Bajo', 'Moderado', 'Elevado', 'Crítico')) DEFAULT 'Bajo',
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  session_number INT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INT DEFAULT 50,
  type TEXT NOT NULL CHECK (type IN ('Sesión Regular', 'Evaluación Inicial', 'Intervención Crisis', 'Cierre/Seguimiento')),
  subjective TEXT NOT NULL,
  objective TEXT NOT NULL,
  assessment TEXT NOT NULL,
  plan TEXT NOT NULL,
  emotional_state TEXT CHECK (emotional_state IN ('Estable', 'Ansioso', 'Depresivo', 'Eufórico', 'Lábil')),
  bdi_score INT,
  bai_score INT,
  suicide_risk BOOLEAN DEFAULT FALSE,
  private_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de Línea del Tiempo Terapéutica
CREATE TABLE IF NOT EXISTS public.timeline_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Sesiones', 'Crisis', 'Medicación', 'Evaluaciones', 'Legal')),
  description TEXT NOT NULL,
  author TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  severity TEXT CHECK (severity IN ('Baja', 'Media', 'Alta')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabla de Planes de Tratamiento
CREATE TABLE IF NOT EXISTS public.treatment_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID UNIQUE NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('Consentimiento Informado', 'Protección de Datos RGPD', 'Contrato de Terapia', 'Acuerdo de Honorarios')),
  status TEXT NOT NULL CHECK (status IN ('Firmado', 'Pendiente', 'Enviado', 'Sin Archivo')) DEFAULT 'Pendiente',
  signed_date TIMESTAMPTZ,
  sent_date TIMESTAMPTZ,
  file_url TEXT,
  version TEXT DEFAULT '1.0',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabla de Recursos Psicoeducativos
CREATE TABLE IF NOT EXISTS public.psycho_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Respiración', 'Registro Cognitivo', 'Lecturas', 'Mindfulness', 'Técnicas Conductuales')),
  type TEXT NOT NULL CHECK (type IN ('PDF', 'Audio', 'Hoja de Trabajo', 'Guía')),
  estimated_minutes INT DEFAULT 10,
  description TEXT NOT NULL,
  thumbnail_url TEXT,
  downloads_count INT DEFAULT 0,
  assigned_patients_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabla de Alertas Clínicas
CREATE TABLE IF NOT EXISTS public.clinic_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_avatar TEXT,
  level TEXT NOT NULL CHECK (level IN ('Crítica', 'Legal', 'Inactividad', 'Recordatorio')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_required TEXT NOT NULL,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Tabla de Agenda de Citas
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_avatar TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Presencial', 'Online (Videollamada)')),
  status TEXT NOT NULL CHECK (status IN ('Confirmada', 'Pendiente', 'Completada', 'Cancelada')) DEFAULT 'Confirmada',
  room TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Tabla de Entrevistas Iniciales y Evaluación Clínica Semiestructurada
CREATE TABLE IF NOT EXISTS public.initial_interviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES public.therapists(id) ON DELETE SET NULL,
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
  riesgo_vital_nivel TEXT NOT NULL CHECK (riesgo_vital_nivel IN ('sin_riesgo', 'ideacion_pasiva', 'ideacion_activa_plan', 'autolesiones')) DEFAULT 'sin_riesgo',
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

-- Habilitar Row Level Security (RLS) en todas las tablas
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

-- Politicas RLS (Permitir lectura y escritura a usuarios autenticados)
CREATE POLICY "Permitir todo a usuarios autenticados en therapists" ON public.therapists FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a usuarios autenticados en patients" ON public.patients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a usuarios autenticados en clinical_notes" ON public.clinical_notes FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a usuarios autenticados en timeline_items" ON public.timeline_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a usuarios autenticados en treatment_plans" ON public.treatment_plans FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a usuarios autenticados en legal_documents" ON public.legal_documents FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a usuarios autenticados en psycho_resources" ON public.psycho_resources FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a usuarios autenticados en clinic_alerts" ON public.clinic_alerts FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a usuarios autenticados en appointments" ON public.appointments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Permitir todo a usuarios autenticados en initial_interviews" ON public.initial_interviews FOR ALL USING (auth.role() = 'authenticated');

