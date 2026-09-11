import { initialInterviewSchema } from '../../src/services/interviewValidation';
import { supabase, isSupabaseConfigured } from '../../src/lib/supabase';

export default async function handler(req: any, res: any) {
  const { id } = req.query || {};

  if (req.method === 'GET') {
    if (!id) {
      return res.status(400).json({ error: 'El parámetro patient_id es obligatorio.' });
    }

    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('initial_interviews')
          .select('*')
          .eq('patient_id', id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ interview: data });
      }

      return res.status(200).json({ message: 'Modo local activo.' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  }

  if (req.method === 'POST') {
    try {
      // Validación con Zod
      const parseResult = initialInterviewSchema.safeParse(req.body);
      if (!parseResult.success) {
        return res.status(422).json({
          error: 'Validación de datos fallida.',
          details: parseResult.error.flatten()
        });
      }

      const interviewData = parseResult.data;

      if (isSupabaseConfigured) {
        const payload = {
          patient_id: interviewData.meta_paciente_id,
          therapist_id: interviewData.meta_terapeuta_id,
          therapist_name: interviewData.meta_terapeuta_nombre || 'Dr. Alejandro Reyes',
          evaluation_date: interviewData.meta_fecha,
          eval_orientacion: interviewData.eval_orientacion,
          eval_orientacion_detalle: interviewData.eval_orientacion_detalle,
          eval_tipo_afecto: interviewData.eval_tipo_afecto,
          eval_motivo_consulta: interviewData.eval_motivo_consulta,
          eval_derivacion_tipo: interviewData.eval_derivacion_tipo,
          sint_experiencia_actual: interviewData.sint_experiencia_actual,
          sint_linea_tiempo: interviewData.sint_linea_tiempo,
          sint_ritmo_psicomotor: interviewData.sint_ritmo_psicomotor,
          sint_desencadenantes: interviewData.sint_desencadenantes,
          somat_patron_sueno: interviewData.somat_patron_sueno,
          somat_apetito_peso: interviewData.somat_apetito_peso,
          somat_energia_corporal: interviewData.somat_energia_corporal,
          somat_somatizaciones: interviewData.somat_somatizaciones,
          somat_somatizaciones_otros: interviewData.somat_somatizaciones_otros,
          bio_narrativa_infancia: interviewData.bio_narrativa_infancia,
          bio_clima_familiar: interviewData.bio_clima_familiar,
          bio_rol_asumido: interviewData.bio_rol_asumido,
          bio_validacion_emocional: interviewData.bio_validacion_emocional,
          bio_adaptacion_social: interviewData.bio_adaptacion_social,
          bio_narrativa_trauma: interviewData.bio_narrativa_trauma,
          bio_criterios_tept: interviewData.bio_criterios_tept,
          cog_pensamiento_predominante: interviewData.cog_pensamiento_predominante,
          cog_foco_cognitivo: interviewData.cog_foco_cognitivo,
          cog_atencion: interviewData.cog_atencion,
          riesgo_vital_nivel: interviewData.riesgo_vital_nivel,
          riesgo_detalle_evaluacion: interviewData.riesgo_detalle_evaluacion,
          soc_vinculos_red_apoyo: interviewData.soc_vinculos_red_apoyo,
          soc_dinamica_vincular: interviewData.soc_dinamica_vincular,
          soc_anhedonia: interviewData.soc_anhedonia,
          ant_historia_previa: interviewData.ant_historia_previa,
          ant_enfermedad_medica_flag: interviewData.ant_enfermedad_medica_flag,
          ant_enfermedad_medica_detalle: interviewData.ant_enfermedad_medica_detalle,
          ant_farmacos_flag: interviewData.ant_farmacos_flag,
          ant_farmacos_detalle: interviewData.ant_farmacos_detalle,
          ant_sustancias_consumo: interviewData.ant_sustancias_consumo,
          is_draft: interviewData.is_draft,
          completed_at: interviewData.is_draft ? null : new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
          .from('initial_interviews')
          .insert([payload])
          .select()
          .single();

        if (error) {
          return res.status(500).json({ error: error.message });
        }

        return res.status(201).json({ success: true, interview: data });
      }

      return res.status(200).json({ success: true, interview: interviewData });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Internal Server Error' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
