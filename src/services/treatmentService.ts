import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { TreatmentPlan } from '../types';

const TREATMENT_KEY = 'ukiana_treatment';

export const getTreatmentPlan = async (patientId?: string): Promise<TreatmentPlan | undefined> => {
  if (isSupabaseConfigured && patientId) {
    const { data, error } = await supabase
      .from('treatment_plans')
      .select('*')
      .eq('patient_id', patientId)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        patientId: data.patient_id,
        primaryDiagnosis: data.primary_diagnosis,
        icdCode: data.icd_code,
        dsmCode: data.dsm_code,
        orientation: data.orientation,
        generalObjective: data.general_objective,
        specificGoals: data.specific_goals || [],
        phases: data.phases || [],
        updatedAt: data.updated_at
      };
    }
  }

  const saved = localStorage.getItem(TREATMENT_KEY);
  if (!saved) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(saved);
    if (patientId && parsed.patientId !== patientId) {
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
};

export const updateTreatmentPlan = async (plan: TreatmentPlan): Promise<void> => {
  if (isSupabaseConfigured) {
    await supabase.from('treatment_plans').upsert([{
      patient_id: plan.patientId,
      primary_diagnosis: plan.primaryDiagnosis,
      icd_code: plan.icdCode,
      dsm_code: plan.dsmCode,
      orientation: plan.orientation,
      general_objective: plan.generalObjective,
      specific_goals: plan.specificGoals,
      phases: plan.phases,
      updated_at: new Date().toISOString()
    }], { onConflict: 'patient_id' });
    return;
  }

  localStorage.setItem(TREATMENT_KEY, JSON.stringify(plan));
};
