-- =========================================================================
-- UKIANA - MIGRACIÓN Y ACTUALIZACIÓN DE TABLAS EN SUPABASE
-- Ejecuta este script completo en el SQL Editor de tu panel de Supabase
-- =========================================================================

-- 1. AGREGAR COLUMNAS FALTANTES A LA TABLA PATIENTS
ALTER TABLE public.patients 
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS id_number TEXT,
  ADD COLUMN IF NOT EXISTS has_autonomy_limitation BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS family_info JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS perinatal_history JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS therapist TEXT DEFAULT 'Médico Responsable';

-- 2. AGREGAR COLUMNAS FALTANTES A LA TABLA CLINICAL_NOTES
ALTER TABLE public.clinical_notes
  ADD COLUMN IF NOT EXISTS start_time TEXT,
  ADD COLUMN IF NOT EXISTS end_time TEXT,
  ADD COLUMN IF NOT EXISTS modality TEXT DEFAULT 'Presencial',
  ADD COLUMN IF NOT EXISTS emotional_state_categories TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS affect_notes TEXT,
  ADD COLUMN IF NOT EXISTS applies_techniques BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS techniques_list JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS diagnoses_list JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS next_session_date TEXT,
  ADD COLUMN IF NOT EXISTS next_session_time TEXT,
  ADD COLUMN IF NOT EXISTS recommended_frequency TEXT,
  ADD COLUMN IF NOT EXISTS therapist_signature TEXT;

-- 3. REMOVER RESTRICCIONES RÍGIDAS (CHECK / NOT NULL) QUE PUEDAN BLOQUEAR VALORES VÁLIDOS
ALTER TABLE public.patients ALTER COLUMN email DROP NOT NULL;
ALTER TABLE public.patients ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE public.patients ALTER COLUMN emergency_contact DROP NOT NULL;
ALTER TABLE public.clinical_notes DROP CONSTRAINT IF EXISTS clinical_notes_type_check;
ALTER TABLE public.clinical_notes DROP CONSTRAINT IF EXISTS clinical_notes_emotional_state_check;
ALTER TABLE public.psycho_resources DROP CONSTRAINT IF EXISTS psycho_resources_category_check;
ALTER TABLE public.timeline_items DROP CONSTRAINT IF EXISTS timeline_items_category_check;

-- 4. POLÍTICAS ROW LEVEL SECURITY (RLS)
-- Asegurar acceso total para desarrollo/MVP (tanto para rol anon como authenticated)
DROP POLICY IF EXISTS "Acceso total a patients" ON public.patients;
CREATE POLICY "Acceso total a patients" ON public.patients FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total a clinical_notes" ON public.clinical_notes;
CREATE POLICY "Acceso total a clinical_notes" ON public.clinical_notes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total a timeline_items" ON public.timeline_items;
CREATE POLICY "Acceso total a timeline_items" ON public.timeline_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total a treatment_plans" ON public.treatment_plans;
CREATE POLICY "Acceso total a treatment_plans" ON public.treatment_plans FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total a legal_documents" ON public.legal_documents;
CREATE POLICY "Acceso total a legal_documents" ON public.legal_documents FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total a psycho_resources" ON public.psycho_resources;
CREATE POLICY "Acceso total a psycho_resources" ON public.psycho_resources FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total a clinic_alerts" ON public.clinic_alerts;
CREATE POLICY "Acceso total a clinic_alerts" ON public.clinic_alerts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total a appointments" ON public.appointments;
CREATE POLICY "Acceso total a appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso total a initial_interviews" ON public.initial_interviews;
CREATE POLICY "Acceso total a initial_interviews" ON public.initial_interviews FOR ALL USING (true) WITH CHECK (true);

-- 5. REFRESCAR CACHÉ DEL SCHEMA DE SUPABASE (POSTGREST)
NOTIFY pgrst, 'reload schema';
