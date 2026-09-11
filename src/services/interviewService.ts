import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { InitialInterviewData } from '../types';
import { validateCompleteInterview } from './interviewValidation';

const LOCAL_STORAGE_PREFIX = 'ukiana_initial_interview_';

/**
 * Obtiene la evaluación inicial de un paciente (sea borrador o completada)
 */
export const getInitialInterviewByPatientId = async (
  patientId: string
): Promise<InitialInterviewData | null> => {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('initial_interviews')
        .select('*')
        .eq('patient_id', patientId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          meta_paciente_id: data.patient_id,
          meta_terapeuta_id: data.therapist_id || '',
          meta_terapeuta_nombre: data.therapist_name || 'Dr. Alejandro Reyes',
          meta_fecha: data.evaluation_date || new Date().toISOString().split('T')[0],
          eval_orientacion: data.eval_orientacion,
          eval_orientacion_detalle: data.eval_orientacion_detalle || '',
          eval_tipo_afecto: data.eval_tipo_afecto,
          eval_motivo_consulta: data.eval_motivo_consulta,
          eval_derivacion_tipo: data.eval_derivacion_tipo,
          sint_experiencia_actual: data.sint_experiencia_actual,
          sint_linea_tiempo: data.sint_linea_tiempo,
          sint_ritmo_psicomotor: data.sint_ritmo_psicomotor,
          sint_desencadenantes: data.sint_desencadenantes || [],
          somat_patron_sueno: data.somat_patron_sueno || [],
          somat_apetito_peso: data.somat_apetito_peso,
          somat_energia_corporal: data.somat_energia_corporal,
          somat_somatizaciones: data.somat_somatizaciones || [],
          somat_somatizaciones_otros: data.somat_somatizaciones_otros || '',
          bio_narrativa_infancia: data.bio_narrativa_infancia || '',
          bio_clima_familiar: data.bio_clima_familiar,
          bio_rol_asumido: data.bio_rol_asumido,
          bio_validacion_emocional: data.bio_validacion_emocional,
          bio_adaptacion_social: data.bio_adaptacion_social,
          bio_narrativa_trauma: data.bio_narrativa_trauma || '',
          bio_criterios_tept: data.bio_criterios_tept || false,
          cog_pensamiento_predominante: data.cog_pensamiento_predominante || '',
          cog_foco_cognitivo: data.cog_foco_cognitivo || [],
          cog_atencion: data.cog_atencion,
          riesgo_vital_nivel: data.riesgo_vital_nivel,
          riesgo_detalle_evaluacion: data.riesgo_detalle_evaluacion || '',
          soc_vinculos_red_apoyo: data.soc_vinculos_red_apoyo || '',
          soc_dinamica_vincular: data.soc_dinamica_vincular,
          soc_anhedonia: data.soc_anhedonia,
          ant_historia_previa: data.ant_historia_previa || [],
          ant_enfermedad_medica_flag: data.ant_enfermedad_medica_flag || false,
          ant_enfermedad_medica_detalle: data.ant_enfermedad_medica_detalle || '',
          ant_farmacos_flag: data.ant_farmacos_flag || false,
          ant_farmacos_detalle: data.ant_farmacos_detalle || '',
          ant_sustancias_consumo: data.ant_sustancias_consumo || [],
          is_draft: data.is_draft,
          created_at: data.created_at,
          updated_at: data.updated_at,
          completed_at: data.completed_at
        };
      }
    } catch (err) {
      console.warn('Error al consultar entrevista en Supabase, utilizando fallback local:', err);
    }
  }

  // Fallback LocalStorage
  const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${patientId}`);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }

  return null;
};

/**
 * Guarda el borrador (Draft) de la entrevista en tiempo real
 */
export const saveInterviewDraft = async (
  data: InitialInterviewData
): Promise<InitialInterviewData> => {
  const updatedData: InitialInterviewData = {
    ...data,
    is_draft: true,
    updated_at: new Date().toISOString()
  };

  // Siempre persistir inmediatamente en localStorage para sincronización instantánea y resiliencia offline
  localStorage.setItem(
    `${LOCAL_STORAGE_PREFIX}${data.meta_paciente_id}`,
    JSON.stringify(updatedData)
  );

  if (isSupabaseConfigured) {
    try {
      const payload = {
        patient_id: data.meta_paciente_id,
        therapist_id: data.meta_terapeuta_id || null,
        therapist_name: data.meta_terapeuta_nombre || 'Dr. Alejandro Reyes',
        evaluation_date: data.meta_fecha,
        eval_orientacion: data.eval_orientacion,
        eval_orientacion_detalle: data.eval_orientacion_detalle,
        eval_tipo_afecto: data.eval_tipo_afecto,
        eval_motivo_consulta: data.eval_motivo_consulta,
        eval_derivacion_tipo: data.eval_derivacion_tipo,
        sint_experiencia_actual: data.sint_experiencia_actual,
        sint_linea_tiempo: data.sint_linea_tiempo,
        sint_ritmo_psicomotor: data.sint_ritmo_psicomotor,
        sint_desencadenantes: data.sint_desencadenantes,
        somat_patron_sueno: data.somat_patron_sueno,
        somat_apetito_peso: data.somat_apetito_peso,
        somat_energia_corporal: data.somat_energia_corporal,
        somat_somatizaciones: data.somat_somatizaciones,
        somat_somatizaciones_otros: data.somat_somatizaciones_otros,
        bio_narrativa_infancia: data.bio_narrativa_infancia,
        bio_clima_familiar: data.bio_clima_familiar,
        bio_rol_asumido: data.bio_rol_asumido,
        bio_validacion_emocional: data.bio_validacion_emocional,
        bio_adaptacion_social: data.bio_adaptacion_social,
        bio_narrativa_trauma: data.bio_narrativa_trauma,
        bio_criterios_tept: data.bio_criterios_tept,
        cog_pensamiento_predominante: data.cog_pensamiento_predominante,
        cog_foco_cognitivo: data.cog_foco_cognitivo,
        cog_atencion: data.cog_atencion,
        riesgo_vital_nivel: data.riesgo_vital_nivel,
        riesgo_detalle_evaluacion: data.riesgo_detalle_evaluacion,
        soc_vinculos_red_apoyo: data.soc_vinculos_red_apoyo,
        soc_dinamica_vincular: data.soc_dinamica_vincular,
        soc_anhedonia: data.soc_anhedonia,
        ant_historia_previa: data.ant_historia_previa,
        ant_enfermedad_medica_flag: data.ant_enfermedad_medica_flag,
        ant_enfermedad_medica_detalle: data.ant_enfermedad_medica_detalle,
        ant_farmacos_flag: data.ant_farmacos_flag,
        ant_farmacos_detalle: data.ant_farmacos_detalle,
        ant_sustancias_consumo: data.ant_sustancias_consumo,
        is_draft: true,
        updated_at: updatedData.updated_at
      };

      if (data.id) {
        await supabase
          .from('initial_interviews')
          .update(payload)
          .eq('id', data.id);
      } else {
        const { data: inserted } = await supabase
          .from('initial_interviews')
          .insert([payload])
          .select()
          .single();
        if (inserted) {
          updatedData.id = inserted.id;
          localStorage.setItem(
            `${LOCAL_STORAGE_PREFIX}${data.meta_paciente_id}`,
            JSON.stringify(updatedData)
          );
        }
      }
    } catch (err) {
      console.warn('Error guardando borrador en Supabase:', err);
    }
  }

  return updatedData;
};

/**
 * Guarda la entrevista como completada y definitiva
 */
export const completeInitialInterview = async (
  data: InitialInterviewData
): Promise<InitialInterviewData> => {
  const validation = validateCompleteInterview(data);
  if (!validation.isValid) {
    const firstKey = Object.keys(validation.errors)[0];
    throw new Error(validation.errors[firstKey] || 'Existen campos requeridos incompletos.');
  }

  const completedData: InitialInterviewData = {
    ...data,
    is_draft: false,
    completed_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Persistir en LocalStorage
  localStorage.setItem(
    `${LOCAL_STORAGE_PREFIX}${data.meta_paciente_id}`,
    JSON.stringify(completedData)
  );

  if (isSupabaseConfigured) {
    try {
      const payload = {
        patient_id: data.meta_paciente_id,
        therapist_id: data.meta_terapeuta_id || null,
        therapist_name: data.meta_terapeuta_nombre || 'Dr. Alejandro Reyes',
        evaluation_date: data.meta_fecha,
        eval_orientacion: data.eval_orientacion,
        eval_orientacion_detalle: data.eval_orientacion_detalle,
        eval_tipo_afecto: data.eval_tipo_afecto,
        eval_motivo_consulta: data.eval_motivo_consulta,
        eval_derivacion_tipo: data.eval_derivacion_tipo,
        sint_experiencia_actual: data.sint_experiencia_actual,
        sint_linea_tiempo: data.sint_linea_tiempo,
        sint_ritmo_psicomotor: data.sint_ritmo_psicomotor,
        sint_desencadenantes: data.sint_desencadenantes,
        somat_patron_sueno: data.somat_patron_sueno,
        somat_apetito_peso: data.somat_apetito_peso,
        somat_energia_corporal: data.somat_energia_corporal,
        somat_somatizaciones: data.somat_somatizaciones,
        somat_somatizaciones_otros: data.somat_somatizaciones_otros,
        bio_narrativa_infancia: data.bio_narrativa_infancia,
        bio_clima_familiar: data.bio_clima_familiar,
        bio_rol_asumido: data.bio_rol_asumido,
        bio_validacion_emocional: data.bio_validacion_emocional,
        bio_adaptacion_social: data.bio_adaptacion_social,
        bio_narrativa_trauma: data.bio_narrativa_trauma,
        bio_criterios_tept: data.bio_criterios_tept,
        cog_pensamiento_predominante: data.cog_pensamiento_predominante,
        cog_foco_cognitivo: data.cog_foco_cognitivo,
        cog_atencion: data.cog_atencion,
        riesgo_vital_nivel: data.riesgo_vital_nivel,
        riesgo_detalle_evaluacion: data.riesgo_detalle_evaluacion,
        soc_vinculos_red_apoyo: data.soc_vinculos_red_apoyo,
        soc_dinamica_vincular: data.soc_dinamica_vincular,
        soc_anhedonia: data.soc_anhedonia,
        ant_historia_previa: data.ant_historia_previa,
        ant_enfermedad_medica_flag: data.ant_enfermedad_medica_flag,
        ant_enfermedad_medica_detalle: data.ant_enfermedad_medica_detalle,
        ant_farmacos_flag: data.ant_farmacos_flag,
        ant_farmacos_detalle: data.ant_farmacos_detalle,
        ant_sustancias_consumo: data.ant_sustancias_consumo,
        is_draft: false,
        completed_at: completedData.completed_at,
        updated_at: completedData.updated_at
      };

      if (data.id) {
        await supabase
          .from('initial_interviews')
          .update(payload)
          .eq('id', data.id);
      } else {
        const { data: inserted } = await supabase
          .from('initial_interviews')
          .insert([payload])
          .select()
          .single();
        if (inserted) {
          completedData.id = inserted.id;
          localStorage.setItem(
            `${LOCAL_STORAGE_PREFIX}${data.meta_paciente_id}`,
            JSON.stringify(completedData)
          );
        }
      }
    } catch (err) {
      console.warn('Error completando entrevista en Supabase:', err);
    }
  }

  return completedData;
};
