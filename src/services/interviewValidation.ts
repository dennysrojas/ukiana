import { z } from 'zod';
import { InitialInterviewData } from '../types';

export const OrientacionEnum = z.enum([
  'Orientado en tiempo, espacio y persona',
  'Desorientación témporo-espacial parcial',
  'Desorientación global'
]);

export const TipoAfectoEnum = z.enum([
  'Eutímico',
  'Aplanado / Embotado',
  'Lábil',
  'Ansioso / Angustiado',
  'Depresivo / Disfórico',
  'Inapropiado / Incongruente'
]);

export const DerivacionTipoEnum = z.enum([
  'Iniciativa propia',
  'Derivación médica / Psiquiatría',
  'Derivación escolar / laboral',
  'Familiar / Terceros',
  'Judicial / Pericial'
]);

export const LineaTiempoSintomaEnum = z.enum([
  'Agudo (< 1 mes)',
  'Subagudo (1-6 meses)',
  'Crónico (> 6 meses)',
  'Recurrente / Episódico'
]);

export const RitmoPsicomotorEnum = z.enum([
  'Normal / Eutímico',
  'Inquietud / Agitación psicomotriz',
  'Enlentecimiento / Inhibición',
  'Bloqueos / Congelamiento'
]);

export const ApetitoPesoEnum = z.enum([
  'Conservado / Estable',
  'Hiporexia (disminución apetito)',
  'Hiperfagia / Atracones',
  'Pérdida de peso significativa',
  'Aumento de peso significativo'
]);

export const EnergiaCorporalEnum = z.enum([
  'Nivel óptimo / Normal',
  'Fatiga leve vespertina',
  'Astenia marcada / Cansancio constante',
  'Hiperactivación / Agotamiento paradójico'
]);

export const ClimaFamiliarEnum = z.enum([
  'Armónico y protector',
  'Conflictivo / Hostil',
  'Rígido y sobreexigente',
  'Negligente / Ausente',
  'Inestable / Caótico'
]);

export const RolAsumidoEnum = z.enum([
  'El cuidador / Parentificado',
  'El pacificador',
  'La oveja negra / Señalado',
  'El exitoso / Responsable',
  'El invisible / Silencioso',
  'Hijo/a promedio / Sin rol forzado'
]);

export const ValidacionEmocionalEnum = z.enum([
  'Alta validación y escucha',
  'Validación selectiva / Condicionada',
  'Invalidación constante / Represión emocional',
  'Castigo de la expresión emocional'
]);

export const AdaptacionSocialEnum = z.enum([
  'Buena integración y rendimiento',
  'Aislamiento / Dificultades sociales',
  'Víctima de acoso escolar (Bullying)',
  'Conductas disruptivas / Bajo rendimiento'
]);

export const AtencionConcentracionEnum = z.enum([
  'Conservada / Buena concentración',
  'Distraibilidad leve por preocupación',
  'Déficit atencional marcado',
  'Confusión / Lentitud en procesamiento'
]);

export const DinamicaVincularEnum = z.enum([
  'Apego seguro / Relaciones estables',
  'Apego ansioso / Dependencia afectiva',
  'Apego evitativo / Aislamiento social',
  'Apego desorganizado / Relaciones inestables e intensas'
]);

export const AnhedoniaNivelEnum = z.enum([
  'Capacidad de goce conservada',
  'Anhedonia parcial / Pérdida de interés en hobbies',
  'Anhedonia total / Apatía severa'
]);

export const VitalRiskLevelEnum = z.enum([
  'sin_riesgo',
  'ideacion_pasiva',
  'ideacion_activa_plan',
  'autolesiones'
]);

// Esquema Zod Base con validaciones individuales
export const initialInterviewSchema = z.object({
  id: z.string().optional(),
  
  // Paso 0: Metadatos y Examen de Entrada
  meta_paciente_id: z.string().min(1, 'El ID del paciente es requerido.'),
  meta_terapeuta_id: z.string().min(1, 'El ID del terapeuta es requerido.'),
  meta_terapeuta_nombre: z.string().optional(),
  meta_fecha: z.string().min(1, 'La fecha de evaluación es requerida.'),
  eval_orientacion: OrientacionEnum,
  eval_orientacion_detalle: z.string().optional(),
  eval_tipo_afecto: TipoAfectoEnum,
  eval_motivo_consulta: z.string().min(5, 'El motivo de consulta debe tener al menos 5 caracteres.'),
  eval_derivacion_tipo: DerivacionTipoEnum,

  // Paso 1: Sintomatología y Fenomenología
  sint_experiencia_actual: z.string().min(5, 'La descripción de la experiencia sintomática actual es obligatoria.'),
  sint_linea_tiempo: LineaTiempoSintomaEnum,
  sint_ritmo_psicomotor: RitmoPsicomotorEnum,
  sint_desencadenantes: z.array(z.string()).min(1, 'Seleccione al menos un factor desencadenante (o "Ninguno identificable").'),

  // Paso 2: Examen Fisiológico y Somático
  somat_patron_sueno: z.array(z.string()).min(1, 'Seleccione al menos una condición del patrón de sueño.'),
  somat_apetito_peso: ApetitoPesoEnum,
  somat_energia_corporal: EnergiaCorporalEnum,
  somat_somatizaciones: z.array(z.string()).min(1, 'Seleccione al menos una opción en somatizaciones.'),
  somat_somatizaciones_otros: z.string().optional(),

  // Paso 3: Memoria Biográfica y Trauma
  bio_narrativa_infancia: z.string().min(5, 'La narrativa de historia de infancia y desarrollo es requerida.'),
  bio_clima_familiar: ClimaFamiliarEnum,
  bio_rol_asumido: RolAsumidoEnum,
  bio_validacion_emocional: ValidacionEmocionalEnum,
  bio_adaptacion_social: AdaptacionSocialEnum,
  bio_narrativa_trauma: z.string().optional().default(''),
  bio_criterios_tept: z.boolean().default(false),

  // Paso 4: Esfera Cognitiva, Autopercepción y Riesgo
  cog_pensamiento_predominante: z.string().min(5, 'Describa el patrón o contenido del pensamiento predominante.'),
  cog_foco_cognitivo: z.array(z.string()).min(1, 'Seleccione al menos un foco de distorsión cognitiva o estilo.'),
  cog_atencion: AtencionConcentracionEnum,
  riesgo_vital_nivel: VitalRiskLevelEnum,
  riesgo_detalle_evaluacion: z.string().optional(),

  // Paso 5: Red Social y Cotidianeidad
  soc_vinculos_red_apoyo: z.string().min(3, 'Describa la red de apoyo y vínculos sociales significativos.'),
  soc_dinamica_vincular: DinamicaVincularEnum,
  soc_anhedonia: AnhedoniaNivelEnum,

  // Paso 6: Antecedentes y Consumos
  ant_historia_previa: z.array(z.string()).min(1, 'Indique antecedentes clínicos previos o "Sin antecedentes".'),
  ant_enfermedad_medica_flag: z.boolean().default(false),
  ant_enfermedad_medica_detalle: z.string().optional(),
  ant_farmacos_flag: z.boolean().default(false),
  ant_farmacos_detalle: z.string().optional(),
  ant_sustancias_consumo: z.array(z.string()).min(1, 'Indique consumo de sustancias o "Ninguno".'),

  // Control
  is_draft: z.boolean().default(false),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  completed_at: z.string().optional()
})
// Validaciones Condicionales (Refinements)
.superRefine((data, ctx) => {
  // 1. Orientación detalle si no está totalmente orientado
  if (data.eval_orientacion !== 'Orientado en tiempo, espacio y persona') {
    if (!data.eval_orientacion_detalle || data.eval_orientacion_detalle.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debe especificar el detalle de la desorientación témporo-espacial.',
        path: ['eval_orientacion_detalle']
      });
    }
  }

  // 2. Somatizaciones Otros detalle si se seleccionó 'Otros'
  if (data.somat_somatizaciones.includes('Otros')) {
    if (!data.somat_somatizaciones_otros || data.somat_somatizaciones_otros.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Especifique los otros síntomas somáticos o manifestaciones físicas.',
        path: ['somat_somatizaciones_otros']
      });
    }
  }

  // 3. Enfermedad médica detalle si el flag está activo
  if (data.ant_enfermedad_medica_flag) {
    if (!data.ant_enfermedad_medica_detalle || data.ant_enfermedad_medica_detalle.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debe especificar la enfermedad médica diagnosticada o en tratamiento.',
        path: ['ant_enfermedad_medica_detalle']
      });
    }
  }

  // 4. Fármacos detalle si el flag está activo
  if (data.ant_farmacos_flag) {
    if (!data.ant_farmacos_detalle || data.ant_farmacos_detalle.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debe especificar la medicación / psicofármacos actuales, dosis o pauta.',
        path: ['ant_farmacos_detalle']
      });
    }
  }

  // 5. Detalle de riesgo si se detecta ideación o autolesiones
  if (data.riesgo_vital_nivel !== 'sin_riesgo') {
    if (!data.riesgo_detalle_evaluacion || data.riesgo_detalle_evaluacion.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Es obligatorio documentar la valoración de riesgo vital y medidas del protocolo de seguridad.',
        path: ['riesgo_detalle_evaluacion']
      });
    }
  }
});

export type InitialInterviewSchemaType = z.infer<typeof initialInterviewSchema>;

/**
 * Valida un paso específico del formulario wizard (0 al 6)
 */
export const validateStep = (
  step: number,
  data: Partial<InitialInterviewData>
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  switch (step) {
    case 0:
      if (!data.eval_motivo_consulta || data.eval_motivo_consulta.trim().length < 5) {
        errors.eval_motivo_consulta = 'El motivo de consulta es requerido (mínimo 5 caracteres).';
      }
      if (
        data.eval_orientacion &&
        data.eval_orientacion !== 'Orientado en tiempo, espacio y persona' &&
        (!data.eval_orientacion_detalle || !data.eval_orientacion_detalle.trim())
      ) {
        errors.eval_orientacion_detalle = 'Especifique el grado y detalle de la desorientación.';
      }
      break;

    case 1:
      if (!data.sint_experiencia_actual || data.sint_experiencia_actual.trim().length < 5) {
        errors.sint_experiencia_actual = 'Describa la fenomenología y vivencia actual del paciente.';
      }
      if (!data.sint_desencadenantes || data.sint_desencadenantes.length === 0) {
        errors.sint_desencadenantes = 'Seleccione al menos un factor desencadenante o "Ninguno identificable".';
      }
      break;

    case 2:
      if (!data.somat_patron_sueno || data.somat_patron_sueno.length === 0) {
        errors.somat_patron_sueno = 'Indique las características del patrón de sueño.';
      }
      if (!data.somat_somatizaciones || data.somat_somatizaciones.length === 0) {
        errors.somat_somatizaciones = 'Seleccione al menos una opción de somatizaciones.';
      }
      if (
        data.somat_somatizaciones?.includes('Otros') &&
        (!data.somat_somatizaciones_otros || !data.somat_somatizaciones_otros.trim())
      ) {
        errors.somat_somatizaciones_otros = 'Especifique las somatizaciones adicionales.';
      }
      break;

    case 3:
      if (!data.bio_narrativa_infancia || data.bio_narrativa_infancia.trim().length < 5) {
        errors.bio_narrativa_infancia = 'Ingrese la narrativa de infancia y desarrollo temprano.';
      }
      break;

    case 4:
      if (!data.cog_pensamiento_predominante || data.cog_pensamiento_predominante.trim().length < 5) {
        errors.cog_pensamiento_predominante = 'Describa el contenido y estilo cognitivo predominante.';
      }
      if (!data.cog_foco_cognitivo || data.cog_foco_cognitivo.length === 0) {
        errors.cog_foco_cognitivo = 'Seleccione al menos un foco de distorsión o estilo cognitivo.';
      }
      if (
        data.riesgo_vital_nivel &&
        data.riesgo_vital_nivel !== 'sin_riesgo' &&
        (!data.riesgo_detalle_evaluacion || !data.riesgo_detalle_evaluacion.trim())
      ) {
        errors.riesgo_detalle_evaluacion = 'Obligatorio detallar la valoración y el protocolo de seguridad activado.';
      }
      break;

    case 5:
      if (!data.soc_vinculos_red_apoyo || data.soc_vinculos_red_apoyo.trim().length < 3) {
        errors.soc_vinculos_red_apoyo = 'Describa la red vincular y relaciones de apoyo.';
      }
      break;

    case 6:
      if (!data.ant_historia_previa || data.ant_historia_previa.length === 0) {
        errors.ant_historia_previa = 'Seleccione al menos un antecedente clínico previo.';
      }
      if (
        data.ant_enfermedad_medica_flag &&
        (!data.ant_enfermedad_medica_detalle || !data.ant_enfermedad_medica_detalle.trim())
      ) {
        errors.ant_enfermedad_medica_detalle = 'Especifique la condición médica activa.';
      }
      if (
        data.ant_farmacos_flag &&
        (!data.ant_farmacos_detalle || !data.ant_farmacos_detalle.trim())
      ) {
        errors.ant_farmacos_detalle = 'Especifique los psicofármacos o fármacos actuales.';
      }
      if (!data.ant_sustancias_consumo || data.ant_sustancias_consumo.length === 0) {
        errors.ant_sustancias_consumo = 'Indique el patrón de consumo de sustancias.';
      }
      break;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Valida la totalidad de la evaluación antes de finalizar
 */
export const validateCompleteInterview = (
  data: Partial<InitialInterviewData>
): { isValid: boolean; errors: Record<string, string> } => {
  const result = initialInterviewSchema.safeParse(data);
  if (result.success) {
    return { isValid: true, errors: {} };
  }

  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.');
    errors[path] = issue.message;
  });

  return { isValid: false, errors };
};
