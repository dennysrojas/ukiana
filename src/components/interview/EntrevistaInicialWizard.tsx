import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Patient, 
  InitialInterviewData, 
  VitalRiskLevel,
  OrientacionType,
  TipoAfecto,
  DerivacionTipo,
  LineaTiempoSintoma,
  RitmoPsicomotor,
  ApetitoPeso,
  EnergiaCorporal,
  ClimaFamiliar,
  RolAsumido,
  ValidacionEmocional,
  AdaptacionSocial,
  AtencionConcentracion,
  DinamicaVincular,
  AnhedoniaNivel
} from '../../types';
import { useAuth } from '../../context/AuthContext';
import { validateStep, validateCompleteInterview } from '../../services/interviewValidation';
import { getInitialInterviewByPatientId, saveInterviewDraft, completeInitialInterview } from '../../services/interviewService';
import { EntrevistaPdfModal } from './EntrevistaPdfModal';
import { 
  Check, 
  ChevronRight, 
  ChevronLeft, 
  Save, 
  FileCheck, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles, 
  Info, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Eye,
  HeartPulse,
  Brain,
  Activity,
  Users,
  Shield,
  Pill,
  ArrowRight
} from 'lucide-react';

interface EntrevistaInicialWizardProps {
  patient?: Patient;
  onFinish?: (interview: InitialInterviewData) => void;
  onCancel?: () => void;
}

const STEPS = [
  { id: 0, title: 'Metadatos & Examen', short: 'Entrada', icon: HeartPulse },
  { id: 1, title: 'Sintomatología', short: 'Síntomas', icon: Activity },
  { id: 2, title: 'Somático & Sueño', short: 'Fisiología', icon: HeartPulse },
  { id: 3, title: 'Biografía & Trauma', short: 'Historia', icon: Users },
  { id: 4, title: 'Cognitivo & Riesgo', short: 'Cognición', icon: Brain },
  { id: 5, title: 'Red Social & Afecto', short: 'Vínculos', icon: Users },
  { id: 6, title: 'Antecedentes & Medicación', short: 'Historial', icon: Pill }
];

export const EntrevistaInicialWizard: React.FC<EntrevistaInicialWizardProps> = ({
  patient,
  onFinish,
  onCancel
}) => {
  if (!patient) {
    return (
      <div className="max-w-2xl mx-auto p-10 bg-white rounded-3xl border border-slate-200 shadow-xs text-center space-y-4 font-sans my-8">
        <div className="w-14 h-14 rounded-2xl bg-[#F8F0FC] text-[#620092] flex items-center justify-center mx-auto border border-[#E6D2F3]">
          <Sparkles className="w-7 h-7 text-[#620092]" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-extrabold text-[#2D2832]">No hay paciente seleccionado</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed font-medium">
            Para realizar la Entrevista Inicial guiada en el sistema, primero seleccione a un paciente de su directorio o cree uno nuevo.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onCancel}
            className="px-5 py-2.5 bg-[#620092] hover:bg-[#4E0075] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95"
          >
            Regresar al Directorio
          </button>
        </div>
      </div>
    );
  }

  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [autoSaveStatus, setAutoSaveStatus] = useState<string>('Listo');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);
  const [showRiskModal, setShowRiskModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const defaultInterviewState: InitialInterviewData = {
    meta_paciente_id: patient.id,
    meta_terapeuta_id: user?.id || 'dr-reyes',
    meta_terapeuta_nombre: user?.name || 'Dr. Alejandro Reyes',
    meta_fecha: new Date().toISOString().split('T')[0],
    eval_orientacion: 'Orientado en tiempo, espacio y persona',
    eval_orientacion_detalle: '',
    eval_tipo_afecto: 'Eutímico',
    eval_motivo_consulta: '',
    eval_derivacion_tipo: 'Iniciativa propia',
    sint_experiencia_actual: '',
    sint_linea_tiempo: 'Subagudo (1-6 meses)',
    sint_ritmo_psicomotor: 'Normal / Eutímico',
    sint_desencadenantes: ['Estrés laboral/académico'],
    somat_patron_sueno: ['Conservado / Reparador'],
    somat_apetito_peso: 'Conservado / Estable',
    somat_energia_corporal: 'Nivel óptimo / Normal',
    somat_somatizaciones: ['Ninguna'],
    somat_somatizaciones_otros: '',
    bio_narrativa_infancia: '',
    bio_clima_familiar: 'Armónico y protector',
    bio_rol_asumido: 'Hijo/a promedio / Sin rol forzado',
    bio_validacion_emocional: 'Alta validación y escucha',
    bio_adaptacion_social: 'Buena integración y rendimiento',
    bio_narrativa_trauma: '',
    bio_criterios_tept: false,
    cog_pensamiento_predominante: '',
    cog_foco_cognitivo: ['Anticipación ansiosa'],
    cog_atencion: 'Conservada / Buena concentración',
    riesgo_vital_nivel: 'sin_riesgo',
    riesgo_detalle_evaluacion: '',
    soc_vinculos_red_apoyo: '',
    soc_dinamica_vincular: 'Apego seguro / Relaciones estables',
    soc_anhedonia: 'Capacidad de goce conservada',
    ant_historia_previa: ['Sin antecedentes previos relevantes'],
    ant_enfermedad_medica_flag: false,
    ant_enfermedad_medica_detalle: '',
    ant_farmacos_flag: false,
    ant_farmacos_detalle: '',
    ant_sustancias_consumo: ['Ninguno'],
    is_draft: true
  };

  const [formData, setFormData] = useState<InitialInterviewData>(defaultInterviewState);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Cargar borrador o entrevista existente al montar
  useEffect(() => {
    const loadInterview = async () => {
      const existing = await getInitialInterviewByPatientId(patient.id);
      if (existing) {
        setFormData({
          ...defaultInterviewState,
          ...existing,
          meta_paciente_id: patient.id,
          meta_terapeuta_id: user?.id || existing.meta_terapeuta_id || 'dr-reyes',
          meta_terapeuta_nombre: user?.name || existing.meta_terapeuta_nombre || 'Dr. Alejandro Reyes'
        });
      }
    };
    loadInterview();
  }, [patient.id, user]);

  // Auto-guardado con Debounce de 600ms
  const triggerDebouncedAutoSave = useCallback((dataToSave: InitialInterviewData) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setAutoSaveStatus('Guardando...');
    debounceTimerRef.current = setTimeout(async () => {
      try {
        await saveInterviewDraft(dataToSave);
        setAutoSaveStatus('Borrador guardado');
      } catch (err) {
        setAutoSaveStatus('Guardado localmente');
      }
    }, 600);
  }, []);

  const updateField = <K extends keyof InitialInterviewData>(field: K, value: InitialInterviewData[K]) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      triggerDebouncedAutoSave(next);
      return next;
    });

    // Limpiar error del campo modificado si existe
    if (stepErrors[field as string]) {
      setStepErrors(prev => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  // Auto-resizing en textareas
  const handleAutoResizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  // Checkbox con exclusión mutua
  const handleCheckboxToggle = (
    field: 'sint_desencadenantes' | 'somat_patron_sueno' | 'somat_somatizaciones' | 'cog_foco_cognitivo' | 'ant_historia_previa' | 'ant_sustancias_consumo',
    value: string,
    exclusiveOption?: string
  ) => {
    const currentList = formData[field] || [];
    let updatedList: string[];

    if (exclusiveOption && value === exclusiveOption) {
      // Si selecciona la opción exclusiva, limpia todas las demás
      updatedList = currentList.includes(exclusiveOption) ? [] : [exclusiveOption];
    } else {
      // Si selecciona una opción normal, quita la opción exclusiva si existía
      const withoutExclusive = exclusiveOption ? currentList.filter(item => item !== exclusiveOption) : currentList;
      if (withoutExclusive.includes(value)) {
        updatedList = withoutExclusive.filter(item => item !== value);
      } else {
        updatedList = [...withoutExclusive, value];
      }
    }

    updateField(field, updatedList);
  };

  // Navegación de pasos con validación
  const handleNextStep = () => {
    const validation = validateStep(currentStep, formData);
    if (!validation.isValid) {
      setStepErrors(validation.errors);
      showToast('Por favor completa los campos requeridos antes de continuar.');
      return;
    }

    setStepErrors({});
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrevStep = () => {
    setStepErrors({});
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Atajo de Teclado: Ctrl + Enter / Cmd + Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (currentStep === STEPS.length - 1) {
          handleFinalizeInterview();
        } else {
          handleNextStep();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, formData]);

  // Guardar Borrador Manual
  const handleSaveDraftManual = async () => {
    setIsSaving(true);
    try {
      await saveInterviewDraft(formData);
      showToast('Borrador guardado exitosamente.');
      setAutoSaveStatus('Borrador guardado');
    } catch (err) {
      showToast('Error al guardar el borrador.');
    } finally {
      setIsSaving(false);
    }
  };

  // Finalizar Entrevista
  const handleFinalizeInterview = async () => {
    const completeValidation = validateCompleteInterview(formData);
    if (!completeValidation.isValid) {
      setStepErrors(completeValidation.errors);
      showToast('Existen campos obligatorios incompletos. Revisa las secciones marcadas.');
      // Ir al primer paso con error
      const firstErrorField = Object.keys(completeValidation.errors)[0];
      if (firstErrorField.startsWith('eval_') || firstErrorField.startsWith('meta_')) setCurrentStep(0);
      else if (firstErrorField.startsWith('sint_')) setCurrentStep(1);
      else if (firstErrorField.startsWith('somat_')) setCurrentStep(2);
      else if (firstErrorField.startsWith('bio_')) setCurrentStep(3);
      else if (firstErrorField.startsWith('cog_') || firstErrorField.startsWith('riesgo_')) setCurrentStep(4);
      else if (firstErrorField.startsWith('soc_')) setCurrentStep(5);
      else if (firstErrorField.startsWith('ant_')) setCurrentStep(6);
      return;
    }

    setIsSaving(true);
    try {
      const finalized = await completeInitialInterview(formData);
      setFormData(finalized);
      showToast('¡Entrevista Inicial completada con éxito!');
      setShowPdfModal(true);
      if (onFinish) {
        onFinish(finalized);
      }
    } catch (err: any) {
      showToast(err.message || 'Error al finalizar la entrevista.');
    } finally {
      setIsSaving(false);
    }
  };

  // Manejador del cambio de riesgo vital con alerta inmediata
  const handleRiskLevelChange = (level: VitalRiskLevel) => {
    updateField('riesgo_vital_nivel', level);
    if (level !== 'sin_riesgo') {
      setShowRiskModal(true);
    }
  };

  const progressPercentage = Math.round(((currentStep + 1) / STEPS.length) * 100);

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans pb-16">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 bg-[#1E1B24] text-white px-5 py-3 rounded-2xl shadow-2xl z-50 text-xs font-bold animate-bounce flex items-center gap-2 border border-[#322B3D]">
          <Sparkles className="w-4 h-4 text-[#FFCD69]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal Alerta de Riesgo Vital Crítico */}
      {showRiskModal && (
        <div className="fixed inset-0 bg-[#1E1B24]/80 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-2 border-red-500 space-y-4 relative">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-2">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-black text-red-900 uppercase tracking-tight">
                Alerta Crítica: Protocolo de Seguridad Clínica
              </h3>
              <p className="text-xs text-red-700 font-bold">
                Se ha registrado un nivel de riesgo: <span className="underline">{formData.riesgo_vital_nivel.replace(/_/g, ' ')}</span>
              </p>
            </div>

            <div className="bg-red-50 rounded-2xl p-4 text-[11px] text-red-800 space-y-2 border border-red-200">
              <p className="font-bold">Recordatorio de Protocolo Obligatorio:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Verificar presencia de red de apoyo y no dejar solo al paciente.</li>
                <li>Evaluar letalidad, disponibilidad de medios y plan activo.</li>
                <li>Contactar al contacto de emergencia: <strong>{patient.emergencyContact?.name} ({patient.emergencyContact?.phone})</strong>.</li>
                <li>Documentar las medidas de contención en el campo de detalle clínico.</li>
              </ul>
            </div>

            <button
              type="button"
              onClick={() => setShowRiskModal(false)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-xs transition-all shadow-md shadow-red-600/30 cursor-pointer active:scale-95"
            >
              Comprendido y Activado en Consulta
            </button>
          </div>
        </div>
      )}

      {/* Header Card del Wizard */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs relative overflow-hidden space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src={patient.avatar}
              alt={patient.fullName}
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#F8F0FC] shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-[#2D2832] tracking-tight">
                  Entrevista Inicial · {patient.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F8F0FC] text-[#620092] border border-[#E6D2F3]">
                  {patient.age} años · {patient.gender}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium flex items-center gap-2 mt-0.5">
                <span>Terapeuta: {user?.name || formData.meta_terapeuta_nombre}</span>
                <span>•</span>
                <span>Fecha: {formData.meta_fecha}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right hidden md:block">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Estado</span>
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                {autoSaveStatus}
              </span>
            </div>

            <button
              onClick={handleSaveDraftManual}
              disabled={isSaving}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>Guardar Borrador</span>
            </button>

            {onCancel && (
              <button
                onClick={onCancel}
                className="px-3 py-2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
              >
                Cerrar
              </button>
            )}
          </div>
        </div>

        {/* Step Progress Bar & Indicators */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-[#620092]">
            <span>Paso {currentStep + 1} de {STEPS.length}: {STEPS[currentStep].title}</span>
            <span>{progressPercentage}% Completado</span>
          </div>

          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#620092] transition-all duration-300 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {/* Stepper Navigation Pills */}
          <div className="grid grid-cols-7 gap-1.5 pt-2">
            {STEPS.map((step) => {
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;
              const Icon = step.icon;

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setStepErrors({});
                    setCurrentStep(step.id);
                  }}
                  className={`p-2 rounded-xl text-center transition-all cursor-pointer flex flex-col items-center gap-1 border ${
                    isCurrent 
                      ? 'bg-[#F8F0FC] border-[#620092] text-[#620092] font-black shadow-xs' 
                      : isCompleted 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' 
                      : 'bg-white border-slate-200 text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-center">
                    {isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Icon className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <span className="text-[9px] truncate max-w-full font-bold hidden sm:inline">
                    {step.short}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Step Form Container */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-xs space-y-6">
        
        {/* ========================================================= */}
        {/* PASO 0: Metadatos y Examen de Entrada                     */}
        {/* ========================================================= */}
        {currentStep === 0 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-[#2D2832]">Paso 0: Metadatos y Examen de Entrada</h2>
              <p className="text-xs text-slate-500 font-medium">Filiación general, orientación témporo-espacial y motivo expreso de consulta</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2D2832] mb-1">Profesional Evaluador</label>
                <input
                  type="text"
                  disabled
                  value={formData.meta_terapeuta_nombre || user?.name}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2832] mb-1">Fecha de la Entrevista</label>
                <input
                  type="date"
                  value={formData.meta_fecha}
                  onChange={e => updateField('meta_fecha', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#2D2832] focus:ring-2 focus:ring-[#620092]/20 focus:border-[#620092]"
                />
              </div>
            </div>

            {/* Vía de derivación */}
            <div>
              <label className="block text-xs font-bold text-[#2D2832] mb-2">Vía de Derivación *</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  'Iniciativa propia',
                  'Derivación médica / Psiquiatría',
                  'Derivación escolar / laboral',
                  'Familiar / Terceros',
                  'Judicial / Pericial'
                ].map((tipo) => (
                  <label
                    key={tipo}
                    className={`p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-2.5 ${
                      formData.eval_derivacion_tipo === tipo
                        ? 'bg-[#F8F0FC] border-[#620092] text-[#620092] shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="eval_derivacion_tipo"
                      value={tipo}
                      checked={formData.eval_derivacion_tipo === tipo}
                      onChange={() => updateField('eval_derivacion_tipo', tipo as DerivacionTipo)}
                      className="text-[#620092] focus:ring-[#620092]"
                    />
                    <span>{tipo}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Orientación témporo-espacial */}
            <div className="space-y-3 bg-[#F8F9FA] p-4 rounded-2xl border border-slate-200/80">
              <label className="block text-xs font-bold text-[#2D2832]">Orientación Témporo-Espacial *</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  'Orientado en tiempo, espacio y persona',
                  'Desorientación témporo-espacial parcial',
                  'Desorientación global'
                ].map((ori) => (
                  <label
                    key={ori}
                    className={`p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-2.5 ${
                      formData.eval_orientacion === ori
                        ? 'bg-[#F8F0FC] border-[#620092] text-[#620092] shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="eval_orientacion"
                      value={ori}
                      checked={formData.eval_orientacion === ori}
                      onChange={() => updateField('eval_orientacion', ori as OrientacionType)}
                      className="text-[#620092] focus:ring-[#620092]"
                    />
                    <span>{ori}</span>
                  </label>
                ))}
              </div>

              {/* Textarea condicional si no está orientado */}
              {formData.eval_orientacion !== 'Orientado en tiempo, espacio y persona' && (
                <div className="mt-3 animate-fadeIn">
                  <label className="block text-xs font-bold text-amber-800 mb-1">
                    Especificar Detalle de la Desorientación *
                  </label>
                  <textarea
                    rows={2}
                    value={formData.eval_orientacion_detalle || ''}
                    onChange={(e) => {
                      handleAutoResizeTextarea(e);
                      updateField('eval_orientacion_detalle', e.target.value);
                    }}
                    placeholder="Describir tipo de desorientación (temporal, espacial, alopsíquica o autopsíquica)..."
                    className="w-full p-3 bg-white border border-amber-300 rounded-xl text-xs text-[#2D2832] focus:ring-2 focus:ring-amber-500"
                  />
                  {stepErrors.eval_orientacion_detalle && (
                    <p className="text-[11px] text-red-600 font-bold mt-1">{stepErrors.eval_orientacion_detalle}</p>
                  )}
                </div>
              )}
            </div>

            {/* Tipo de Afecto */}
            <div>
              <label className="block text-xs font-bold text-[#2D2832] mb-2">Afecto y Tono Emocional de Entrada *</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  'Eutímico',
                  'Aplanado / Embotado',
                  'Lábil',
                  'Ansioso / Angustiado',
                  'Depresivo / Disfórico',
                  'Inapropiado / Incongruente'
                ].map((afecto) => (
                  <label
                    key={afecto}
                    className={`p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-2.5 ${
                      formData.eval_tipo_afecto === afecto
                        ? 'bg-[#F8F0FC] border-[#620092] text-[#620092] shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="eval_tipo_afecto"
                      value={afecto}
                      checked={formData.eval_tipo_afecto === afecto}
                      onChange={() => updateField('eval_tipo_afecto', afecto as TipoAfecto)}
                      className="text-[#620092] focus:ring-[#620092]"
                    />
                    <span>{afecto}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Motivo de Consulta */}
            <div>
              <label className="block text-xs font-bold text-[#2D2832] mb-1">
                Motivo de Consulta (Narrativa Explícita del Paciente) *
              </label>
              <p className="text-[11px] text-slate-400 mb-2">Transcribir en palabras del paciente o síntesis clínica el motivo principal de asistencia.</p>
              <textarea
                required
                rows={3}
                value={formData.eval_motivo_consulta}
                onChange={(e) => {
                  handleAutoResizeTextarea(e);
                  updateField('eval_motivo_consulta', e.target.value);
                }}
                placeholder="Ej: Acude refiriendo episodios recurrentes de angustia, opresión en el pecho y dificultad para conciliar el sueño desde hace dos meses tras cambio laboral..."
                className={`w-full p-4 bg-[#F8F9FA] border rounded-2xl text-xs text-[#2D2832] leading-relaxed focus:ring-2 focus:ring-[#620092]/20 focus:border-[#620092] ${
                  stepErrors.eval_motivo_consulta ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                }`}
              />
              {stepErrors.eval_motivo_consulta && (
                <p className="text-[11px] text-red-600 font-bold mt-1">{stepErrors.eval_motivo_consulta}</p>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PASO 1: Sintomatología y Fenomenología                     */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-[#2D2832]">Paso 1: Sintomatología y Fenomenología</h2>
              <p className="text-xs text-slate-500 font-medium">Vivencia subjetiva, curso temporal, psicomotricidad y factores precipitantes</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2832] mb-1">
                Experiencia Actual / Fenomenología del Síntoma *
              </label>
              <p className="text-[11px] text-slate-400 mb-2">Describa cómo el paciente experimenta sus síntomas en el cuerpo y en su mente.</p>
              <textarea
                required
                rows={4}
                value={formData.sint_experiencia_actual}
                onChange={(e) => {
                  handleAutoResizeTextarea(e);
                  updateField('sint_experiencia_actual', e.target.value);
                }}
                placeholder="Ej: El paciente experimenta pensamientos intrusivos de pérdida de control, sensación de despersonalización leve y taquicardia..."
                className={`w-full p-4 bg-[#F8F9FA] border rounded-2xl text-xs text-[#2D2832] leading-relaxed focus:ring-2 focus:ring-[#620092]/20 focus:border-[#620092] ${
                  stepErrors.sint_experiencia_actual ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                }`}
              />
              {stepErrors.sint_experiencia_actual && (
                <p className="text-[11px] text-red-600 font-bold mt-1">{stepErrors.sint_experiencia_actual}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2D2832] mb-2">Línea de Tiempo / Curso *</label>
                <div className="space-y-2">
                  {[
                    'Agudo (< 1 mes)',
                    'Subagudo (1-6 meses)',
                    'Crónico (> 6 meses)',
                    'Recurrente / Episódico'
                  ].map((linea) => (
                    <label
                      key={linea}
                      className={`p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-2.5 ${
                        formData.sint_linea_tiempo === linea
                          ? 'bg-[#F8F0FC] border-[#620092] text-[#620092] shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="sint_linea_tiempo"
                        value={linea}
                        checked={formData.sint_linea_tiempo === linea}
                        onChange={() => updateField('sint_linea_tiempo', linea as LineaTiempoSintoma)}
                        className="text-[#620092] focus:ring-[#620092]"
                      />
                      <span>{linea}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2D2832] mb-2">Ritmo Psicomotor Observado *</label>
                <div className="space-y-2">
                  {[
                    'Normal / Eutímico',
                    'Inquietud / Agitación psicomotriz',
                    'Enlentecimiento / Inhibición',
                    'Bloqueos / Congelamiento'
                  ].map((ritmo) => (
                    <label
                      key={ritmo}
                      className={`p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-2.5 ${
                        formData.sint_ritmo_psicomotor === ritmo
                          ? 'bg-[#F8F0FC] border-[#620092] text-[#620092] shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="sint_ritmo_psicomotor"
                        value={ritmo}
                        checked={formData.sint_ritmo_psicomotor === ritmo}
                        onChange={() => updateField('sint_ritmo_psicomotor', ritmo as RitmoPsicomotor)}
                        className="text-[#620092] focus:ring-[#620092]"
                      />
                      <span>{ritmo}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Desencadenantes con exclusión mutua para 'Ninguno identificable' */}
            <div>
              <label className="block text-xs font-bold text-[#2D2832] mb-1">
                Factores Desencadenantes Identificados (Selección Múltiple) *
              </label>
              <p className="text-[11px] text-slate-400 mb-2">Seleccione los eventos o situaciones gatillantes.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Estrés laboral/académico',
                  'Conflicto familiar / pareja',
                  'Duelo / Pérdida',
                  'Enfermedad física propia o familiar',
                  'Cambio vital importante',
                  'Trauma reciente',
                  'Consumo de sustancias',
                  'Ninguno identificable'
                ].map((item) => {
                  const isChecked = formData.sint_desencadenantes?.includes(item);
                  return (
                    <label
                      key={item}
                      className={`p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-2.5 ${
                        isChecked
                          ? 'bg-[#F8F0FC] border-[#620092] text-[#620092] shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxToggle('sint_desencadenantes', item, 'Ninguno identificable')}
                        className="rounded text-[#620092] focus:ring-[#620092]"
                      />
                      <span>{item}</span>
                    </label>
                  );
                })}
              </div>
              {stepErrors.sint_desencadenantes && (
                <p className="text-[11px] text-red-600 font-bold mt-1">{stepErrors.sint_desencadenantes}</p>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PASO 2: Examen Fisiológico y Somático                     */}
        {/* ========================================================= */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-[#2D2832]">Paso 2: Examen Fisiológico y Somático</h2>
              <p className="text-xs text-slate-500 font-medium">Ciclos circadianos, patrón de sueño, apetito, energía vital y somatizaciones</p>
            </div>

            {/* Patrón de sueño */}
            <div>
              <label className="block text-xs font-bold text-[#2D2832] mb-1">Patrón de Sueño y Descanso *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Conservado / Reparador',
                  'Insomnio de conciliación',
                  'Insomnio de mantenimiento / Despertares frecuentes',
                  'Despertar precoz',
                  'Hipersomnia',
                  'Pesadillas / Terrores nocturnos'
                ].map((sueno) => {
                  const isChecked = formData.somat_patron_sueno?.includes(sueno);
                  return (
                    <label
                      key={sueno}
                      className={`p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-2.5 ${
                        isChecked
                          ? 'bg-[#F8F0FC] border-[#620092] text-[#620092] shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxToggle('somat_patron_sueno', sueno, 'Conservado / Reparador')}
                        className="rounded text-[#620092] focus:ring-[#620092]"
                      />
                      <span>{sueno}</span>
                    </label>
                  );
                })}
              </div>
              {stepErrors.somat_patron_sueno && (
                <p className="text-[11px] text-red-600 font-bold mt-1">{stepErrors.somat_patron_sueno}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Apetito y Peso */}
              <div>
                <label className="block text-xs font-bold text-[#2D2832] mb-2">Apetito y Variaciones de Peso *</label>
                <div className="space-y-2">
                  {[
                    'Conservado / Estable',
                    'Hiporexia (disminución apetito)',
                    'Hiperfagia / Atracones',
                    'Pérdida de peso significativa',
                    'Aumento de peso significativo'
                  ].map((apetito) => (
                    <label
                      key={apetito}
                      className={`p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-2.5 ${
                        formData.somat_apetito_peso === apetito
                          ? 'bg-[#F8F0FC] border-[#620092] text-[#620092] shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="somat_apetito_peso"
                        value={apetito}
                        checked={formData.somat_apetito_peso === apetito}
                        onChange={() => updateField('somat_apetito_peso', apetito as ApetitoPeso)}
                        className="text-[#620092] focus:ring-[#620092]"
                      />
                      <span>{apetito}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Energía Corporal */}
              <div>
                <label className="block text-xs font-bold text-[#2D2832] mb-2">Nivel de Energía Corporal y Fatiga *</label>
                <div className="space-y-2">
                  {[
                    'Nivel óptimo / Normal',
                    'Fatiga leve vespertina',
                    'Astenia marcada / Cansancio constante',
                    'Hiperactivación / Agotamiento paradójico'
                  ].map((energia) => (
                    <label
                      key={energia}
                      className={`p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-2.5 ${
                        formData.somat_energia_corporal === energia
                          ? 'bg-[#F8F0FC] border-[#620092] text-[#620092] shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="somat_energia_corporal"
                        value={energia}
                        checked={formData.somat_energia_corporal === energia}
                        onChange={() => updateField('somat_energia_corporal', energia as EnergiaCorporal)}
                        className="text-[#620092] focus:ring-[#620092]"
                      />
                      <span>{energia}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Somatizaciones */}
            <div>
              <label className="block text-xs font-bold text-[#2D2832] mb-1">Somatizaciones y Molestias Físicas *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Cefaleas tensionales',
                  'Molestias gastrointestinales / Colon irritable',
                  'Opresión torácica / Taquicardias',
                  'Tensión muscular cervical / dorsal',
                  'Bruxismo',
                  'Mareos / Vértigo',
                  'Ninguna',
                  'Otros'
                ].map((somat) => {
                  const isChecked = formData.somat_somatizaciones?.includes(somat);
                  return (
                    <label
                      key={somat}
                      className={`p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-2.5 ${
                        isChecked
                          ? 'bg-[#F8F0FC] border-[#620092] text-[#620092] shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxToggle('somat_somatizaciones', somat, 'Ninguna')}
                        className="rounded text-[#620092] focus:ring-[#620092]"
                      />
                      <span>{somat}</span>
                    </label>
                  );
                })}
              </div>

              {/* Input condicional si selecciona Otros */}
              {formData.somat_somatizaciones?.includes('Otros') && (
                <div className="mt-3 animate-fadeIn">
                  <label className="block text-xs font-bold text-[#620092] mb-1">Especificar otras somatizaciones *</label>
                  <input
                    type="text"
                    value={formData.somat_somatizaciones_otros || ''}
                    onChange={e => updateField('somat_somatizaciones_otros', e.target.value)}
                    placeholder="Ej: Sudoración fría profusa, parestesias en extremidades..."
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-[#2D2832] focus:ring-2 focus:ring-[#620092]"
                  />
                  {stepErrors.somat_somatizaciones_otros && (
                    <p className="text-[11px] text-red-600 font-bold mt-1">{stepErrors.somat_somatizaciones_otros}</p>
                  )}
                </div>
              )}
              {stepErrors.somat_somatizaciones && (
                <p className="text-[11px] text-red-600 font-bold mt-1">{stepErrors.somat_somatizaciones}</p>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PASO 3: Memoria Biográfica y Trauma                       */}
        {/* ========================================================= */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-[#2D2832]">Paso 3: Memoria Biográfica y Trauma</h2>
              <p className="text-xs text-slate-500 font-medium">Historia de infancia, dinámica familiar de origen, validación afectiva y experiencias adversas</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2832] mb-1">
                Narrativa de Infancia y Desarrollo Temprano *
              </label>
              <p className="text-[11px] text-slate-400 mb-2">Describa recuerdos primarios, dinámica en el hogar de crianza y vínculos parentales.</p>
              <textarea
                required
                rows={4}
                value={formData.bio_narrativa_infancia}
                onChange={(e) => {
                  handleAutoResizeTextarea(e);
                  updateField('bio_narrativa_infancia', e.target.value);
                }}
                placeholder="Ej: Creció en un entorno con alta exigencia académica. Refiere una relación cercana con la madre pero distante y autoritaria con el padre..."
                className={`w-full p-4 bg-[#F8F9FA] border rounded-2xl text-xs text-[#2D2832] leading-relaxed focus:ring-2 focus:ring-[#620092]/20 focus:border-[#620092] ${
                  stepErrors.bio_narrativa_infancia ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                }`}
              />
              {stepErrors.bio_narrativa_infancia && (
                <p className="text-[11px] text-red-600 font-bold mt-1">{stepErrors.bio_narrativa_infancia}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Clima Familiar */}
              <div>
                <label className="block text-xs font-bold text-[#2D2832] mb-2">Clima Familiar Percibido *</label>
                <div className="space-y-2">
                  {[
                    'Armónico y protector',
                    'Conflictivo / Hostil',
                    'Rígido y sobreexigente',
                    'Negligente / Ausente',
                    'Inestable / Caótico'
                  ].map((clima) => (
                    <label
                      key={clima}
                      className={`p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-2.5 ${
                        formData.bio_clima_familiar === clima
                          ? 'bg-[#F8F0FC] border-[#620092] text-[#620092] shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="bio_clima_familiar"
                        value={clima}
                        checked={formData.bio_clima_familiar === clima}
                        onChange={() => updateField('bio_clima_familiar', clima as ClimaFamiliar)}
                        className="text-[#620092] focus:ring-[#620092]"
                      />
                      <span>{clima}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rol Asumido */}
              <div>
                <label className="block text-xs font-bold text-[#2D2832] mb-2">Rol Asumido en Origen *</label>
                <div className="space-y-2">
                  {[
                    'El cuidador / Parentificado',
                    'El pacificador',
                    'La oveja negra / Señalado',
                    'El exitoso / Responsable',
                    'El invisible / Silencioso',
                    'Hijo/a promedio / Sin rol forzado'
                  ].map((rol) => (
                    <label
                      key={rol}
                      className={`p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-2.5 ${
                        formData.bio_rol_asumido === rol
                          ? 'bg-[#F8F0FC] border-[#620092] text-[#620092] shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="bio_rol_asumido"
                        value={rol}
                        checked={formData.bio_rol_asumido === rol}
                        onChange={() => updateField('bio_rol_asumido', rol as RolAsumido)}
                        className="text-[#620092] focus:ring-[#620092]"
                      />
                      <span>{rol}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Validación emocional */}
              <div>
                <label className="block text-xs font-bold text-[#2D2832] mb-2">Validación Emocional en Crianza *</label>
                <div className="space-y-2">
                  {[
                    'Alta validación y escucha',
                    'Validación selectiva / Condicionada',
                    'Invalidación constante / Represión emocional',
                    'Castigo de la expresión emocional'
                  ].map((val) => (
                    <label
                      key={val}
                      className={`p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-2.5 ${
                        formData.bio_validacion_emocional === val
                          ? 'bg-[#F8F0FC] border-[#620092] text-[#620092] shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="bio_validacion_emocional"
                        value={val}
                        checked={formData.bio_validacion_emocional === val}
                        onChange={() => updateField('bio_validacion_emocional', val as ValidacionEmocional)}
                        className="text-[#620092] focus:ring-[#620092]"
                      />
                      <span>{val}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Adaptación social / escolar */}
              <div>
                <label className="block text-xs font-bold text-[#2D2832] mb-2">Adaptación Social y Escolar *</label>
                <div className="space-y-2">
                  {[
                    'Buena integración y rendimiento',
                    'Aislamiento / Dificultades sociales',
                    'Víctima de acoso escolar (Bullying)',
                    'Conductas disruptivas / Bajo rendimiento'
                  ].map((adp) => (
                    <label
                      key={adp}
                      className={`p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-2.5 ${
                        formData.bio_adaptacion_social === adp
                          ? 'bg-[#F8F0FC] border-[#620092] text-[#620092] shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="bio_adaptacion_social"
                        value={adp}
                        checked={formData.bio_adaptacion_social === adp}
                        onChange={() => updateField('bio_adaptacion_social', adp as AdaptacionSocial)}
                        className="text-[#620092] focus:ring-[#620092]"
                      />
                      <span>{adp}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Narrativa de trauma y TEPT */}
            <div className="space-y-3 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/80">
              <label className="block text-xs font-bold text-[#2D2832]">
                Narrativa de Trauma, Duelos Complejos o Eventos Adversos (Opcional)
              </label>
              <textarea
                rows={3}
                value={formData.bio_narrativa_trauma || ''}
                onChange={(e) => {
                  handleAutoResizeTextarea(e);
                  updateField('bio_narrativa_trauma', e.target.value);
                }}
                placeholder="Detallar accidentes, pérdidas tempranas significativas, situaciones de violencia o abuso si fueron reveladas..."
                className="w-full p-3.5 bg-white border border-amber-300 rounded-xl text-xs text-[#2D2832] focus:ring-2 focus:ring-amber-500"
              />

              <label className="flex items-center gap-3 p-3 bg-white rounded-xl border border-amber-300/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.bio_criterios_tept || false}
                  onChange={e => updateField('bio_criterios_tept', e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                />
                <span className="text-xs font-bold text-amber-900">
                  Presencia de reexperimentación, hiperalerta, evitación o sintomatología compatible con TEPT / Trauma Complejo
                </span>
              </label>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PASO 4: Esfera Cognitiva, Autopercepción y Riesgo          */}
        {/* ========================================================= */}
        {currentStep === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-[#2D2832]">Paso 4: Esfera Cognitiva, Autopercepción y Riesgo</h2>
              <p className="text-xs text-slate-500 font-medium">Contenido del pensamiento, atención, distorsiones cognitivas y cribado crítico de riesgo vital</p>
            </div>

            {/* SECCIÓN CRÍTICA: RIESGO VITAL */}
            <div className="p-5 bg-slate-50 rounded-3xl border-2 border-slate-200 space-y-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <h3 className="text-xs font-black text-[#2D2832] uppercase tracking-wider">
                  Cribado y Valoración de Riesgo Vital *
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { key: 'sin_riesgo', label: 'Sin riesgo vital aparente', desc: 'No se detecta ideación, intención ni autolesiones.' },
                  { key: 'ideacion_pasiva', label: 'Ideación pasiva de muerte', desc: 'Deseos de no despertar o desaparecer sin plan activo.' },
                  { key: 'ideacion_activa_plan', label: 'Ideación activa / Con plan', desc: 'Pensamientos recurrentes con estructuración o método.' },
                  { key: 'autolesiones', label: 'Conducta autolesiva activa', desc: 'Autolesiones no suicidas o cortes/conductas impulsivas.' }
                ].map((r) => {
                  const isSelected = formData.riesgo_vital_nivel === r.key;
                  const isDangerous = r.key !== 'sin_riesgo';

                  return (
                    <label
                      key={r.key}
                      className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all flex flex-col gap-1 ${
                        isSelected && isDangerous
                          ? 'bg-red-50 border-red-500 text-red-900 shadow-md ring-2 ring-red-500/20'
                          : isSelected && !isDangerous
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-black">
                        <input
                          type="radio"
                          name="riesgo_vital_nivel"
                          value={r.key}
                          checked={isSelected}
                          onChange={() => handleRiskLevelChange(r.key as VitalRiskLevel)}
                          className={isDangerous ? 'text-red-600 focus:ring-red-600' : 'text-emerald-600 focus:ring-emerald-600'}
                        />
                        <span>{r.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 pl-5">{r.desc}</span>
                    </label>
                  );
                })}
              </div>

              {/* Detalle obligatorio si hay riesgo */}
              {formData.riesgo_vital_nivel !== 'sin_riesgo' && (
                <div className="mt-3 p-4 bg-red-100/50 rounded-2xl border border-red-300 space-y-2 animate-fadeIn">
                  <label className="block text-xs font-black text-red-900">
                    Detalle de Valoración de Riesgo & Medidas del Protocolo de Seguridad *
                  </label>
                  <textarea
                    rows={3}
                    value={formData.riesgo_detalle_evaluacion || ''}
                    onChange={(e) => {
                      handleAutoResizeTextarea(e);
                      updateField('riesgo_detalle_evaluacion', e.target.value);
                    }}
                    placeholder="Documente la temporalidad, factores protectores, contacto con familiares y firma del acuerdo de seguridad..."
                    className="w-full p-3 bg-white border border-red-400 rounded-xl text-xs text-[#2D2832] focus:ring-2 focus:ring-red-500"
                  />
                  {stepErrors.riesgo_detalle_evaluacion && (
                    <p className="text-[11px] text-red-700 font-bold">{stepErrors.riesgo_detalle_evaluacion}</p>
                  )}
                </div>
              )}
            </div>

            {/* Pensamiento Predominante */}
            <div>
              <label className="block text-xs font-bold text-[#2D2832] mb-1">
                Contenido del Pensamiento Predominante *
              </label>
              <p className="text-[11px] text-slate-400 mb-2">Describa temas recurrentes, rumiaciones, autopercepción o preocupaciones.</p>
              <textarea
                required
                rows={3}
                value={formData.cog_pensamiento_predominante}
                onChange={(e) => {
                  handleAutoResizeTextarea(e);
                  updateField('cog_pensamiento_predominante', e.target.value);
                }}
                placeholder="Ej: Fuerte autoexigencia, temor al fracaso profesional y pensamientos de insuficiencia..."
                className={`w-full p-4 bg-[#F8F9FA] border rounded-2xl text-xs text-[#2D2832] leading-relaxed focus:ring-2 focus:ring-[#620092]/20 focus:border-[#620092] ${
                  stepErrors.cog_pensamiento_predominante ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                }`}
              />
              {stepErrors.cog_pensamiento_predominante && (
                <p className="text-[11px] text-red-600 font-bold mt-1">{stepErrors.cog_pensamiento_predominante}</p>
              )}
            </div>

            {/* Foco Cognitivo / Distorsiones */}
            <div>
              <label className="block text-xs font-bold text-[#2D2832] mb-1">
                Foco Cognitivo y Distorsiones Frecuentes *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Catastrofismo',
                  'Rumiación sobre el pasado',
                  'Anticipación ansiosa',
                  'Autocrítica severa / Culpa',
                  'Pensamiento todo o nada (Dicotómico)',
                  'Lectura del pensamiento / Personalización',
                  'Hipervigilancia'
                ].map((foco) => {
                  const isChecked = formData.cog_foco_cognitivo?.includes(foco);
                  return (
                    <label
                      key={foco}
                      className={`p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-2.5 ${
                        isChecked
                          ? 'bg-[#F8F0FC] border-[#620092] text-[#620092] shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxToggle('cog_foco_cognitivo', foco)}
                        className="rounded text-[#620092] focus:ring-[#620092]"
                      />
                      <span>{foco}</span>
                    </label>
                  );
                })}
              </div>
              {stepErrors.cog_foco_cognitivo && (
                <p className="text-[11px] text-red-600 font-bold mt-1">{stepErrors.cog_foco_cognitivo}</p>
              )}
            </div>

            {/* Atención y Concentración */}
            <div>
              <label className="block text-xs font-bold text-[#2D2832] mb-2">Atención y Capacidad de Concentración *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Conservada / Buena concentración',
                  'Distraibilidad leve por preocupación',
                  'Déficit atencional marcado',
                  'Confusión / Lentitud en procesamiento'
                ].map((atn) => (
                  <label
                    key={atn}
                    className={`p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-2.5 ${
                      formData.cog_atencion === atn
                        ? 'bg-[#F8F0FC] border-[#620092] text-[#620092] shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="cog_atencion"
                      value={atn}
                      checked={formData.cog_atencion === atn}
                      onChange={() => updateField('cog_atencion', atn as AtencionConcentracion)}
                      className="text-[#620092] focus:ring-[#620092]"
                    />
                    <span>{atn}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PASO 5: Red Social y Cotidianeidad                        */}
        {/* ========================================================= */}
        {currentStep === 5 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-[#2D2832]">Paso 5: Red Social, Cotidianeidad y Vínculos</h2>
              <p className="text-xs text-slate-500 font-medium">Relaciones de apoyo, estilo vincular/apego y preservación de la capacidad hedónica</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2D2832] mb-1">
                Vínculos Significativos y Red de Apoyo *
              </label>
              <p className="text-[11px] text-slate-400 mb-2">Describa la solidez de su red de amistades, pareja, familia o comunidad.</p>
              <textarea
                required
                rows={3}
                value={formData.soc_vinculos_red_apoyo}
                onChange={(e) => {
                  handleAutoResizeTextarea(e);
                  updateField('soc_vinculos_red_apoyo', e.target.value);
                }}
                placeholder="Ej: Cuenta con apoyo cercano de su pareja y un grupo de dos amigos íntimos. Se siente escuchado/a aunque tiende a aislarse en crisis..."
                className={`w-full p-4 bg-[#F8F9FA] border rounded-2xl text-xs text-[#2D2832] leading-relaxed focus:ring-2 focus:ring-[#620092]/20 focus:border-[#620092] ${
                  stepErrors.soc_vinculos_red_apoyo ? 'border-red-500 bg-red-50/20' : 'border-slate-200'
                }`}
              />
              {stepErrors.soc_vinculos_red_apoyo && (
                <p className="text-[11px] text-red-600 font-bold mt-1">{stepErrors.soc_vinculos_red_apoyo}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Dinámica Vincular */}
              <div>
                <label className="block text-xs font-bold text-[#2D2832] mb-2">Dinámica Vincular Predominante *</label>
                <div className="space-y-2">
                  {[
                    'Apego seguro / Relaciones estables',
                    'Apego ansioso / Dependencia afectiva',
                    'Apego evitativo / Aislamiento social',
                    'Apego desorganizado / Relaciones inestables e intensas'
                  ].map((vinc) => (
                    <label
                      key={vinc}
                      className={`p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-2.5 ${
                        formData.soc_dinamica_vincular === vinc
                          ? 'bg-[#F8F0FC] border-[#620092] text-[#620092] shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="soc_dinamica_vincular"
                        value={vinc}
                        checked={formData.soc_dinamica_vincular === vinc}
                        onChange={() => updateField('soc_dinamica_vincular', vinc as DinamicaVincular)}
                        className="text-[#620092] focus:ring-[#620092]"
                      />
                      <span>{vinc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Anhedonia */}
              <div>
                <label className="block text-xs font-bold text-[#2D2832] mb-2">Capacidad de Disfrute / Anhedonia *</label>
                <div className="space-y-2">
                  {[
                    'Capacidad de goce conservada',
                    'Anhedonia parcial / Pérdida de interés en hobbies',
                    'Anhedonia total / Apatía severa'
                  ].map((anh) => (
                    <label
                      key={anh}
                      className={`p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-2.5 ${
                        formData.soc_anhedonia === anh
                          ? 'bg-[#F8F0FC] border-[#620092] text-[#620092] shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="soc_anhedonia"
                        value={anh}
                        checked={formData.soc_anhedonia === anh}
                        onChange={() => updateField('soc_anhedonia', anh as AnhedoniaNivel)}
                        className="text-[#620092] focus:ring-[#620092]"
                      />
                      <span>{anh}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PASO 6: Antecedentes y Consumos                            */}
        {/* ========================================================= */}
        {currentStep === 6 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-[#2D2832]">Paso 6: Antecedentes Clínicos, Médicos y Consumos</h2>
              <p className="text-xs text-slate-500 font-medium">Historial previo, enfermedades médicas activas, psicofármacos y sustancias</p>
            </div>

            {/* Historia previa */}
            <div>
              <label className="block text-xs font-bold text-[#2D2832] mb-1">Historia Psiquiátrica / Psicológica Previa *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Tratamiento psicológico previo',
                  'Ingreso hospitalario previo',
                  'Intentos autolíticos previos',
                  'Antecedentes psiquiátricos familiares directos',
                  'Sin antecedentes previos relevantes'
                ].map((ant) => {
                  const isChecked = formData.ant_historia_previa?.includes(ant);
                  return (
                    <label
                      key={ant}
                      className={`p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-2.5 ${
                        isChecked
                          ? 'bg-[#F8F0FC] border-[#620092] text-[#620092] shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxToggle('ant_historia_previa', ant, 'Sin antecedentes previos relevantes')}
                        className="rounded text-[#620092] focus:ring-[#620092]"
                      />
                      <span>{ant}</span>
                    </label>
                  );
                })}
              </div>
              {stepErrors.ant_historia_previa && (
                <p className="text-[11px] text-red-600 font-bold mt-1">{stepErrors.ant_historia_previa}</p>
              )}
            </div>

            {/* Switches Condicionales para Enfermedad Médica y Fármacos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Enfermedad médica */}
              <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2D2832]">¿Enfermedad Médica Activa?</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.ant_enfermedad_medica_flag}
                      onChange={e => updateField('ant_enfermedad_medica_flag', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#620092]"></div>
                  </label>
                </div>

                {formData.ant_enfermedad_medica_flag && (
                  <div className="animate-fadeIn">
                    <label className="block text-[11px] font-bold text-[#620092] mb-1">
                      Especificar Condición / Diagnóstico Médico *
                    </label>
                    <textarea
                      rows={2}
                      value={formData.ant_enfermedad_medica_detalle || ''}
                      onChange={(e) => {
                        handleAutoResizeTextarea(e);
                        updateField('ant_enfermedad_medica_detalle', e.target.value);
                      }}
                      placeholder="Ej: Hipotiroidismo controlado con levotiroxina 50mcg, asma leve..."
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-[#2D2832] focus:ring-2 focus:ring-[#620092]"
                    />
                    {stepErrors.ant_enfermedad_medica_detalle && (
                      <p className="text-[11px] text-red-600 font-bold mt-1">{stepErrors.ant_enfermedad_medica_detalle}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Fármacos */}
              <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2D2832]">¿Psicofármacos / Medicación Actual?</label>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.ant_farmacos_flag}
                      onChange={e => updateField('ant_farmacos_flag', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#620092]"></div>
                  </label>
                </div>

                {formData.ant_farmacos_flag && (
                  <div className="animate-fadeIn">
                    <label className="block text-[11px] font-bold text-[#620092] mb-1">
                      Especificar Fármacos, Dosis y Prescriptor *
                    </label>
                    <textarea
                      rows={2}
                      value={formData.ant_farmacos_detalle || ''}
                      onChange={(e) => {
                        handleAutoResizeTextarea(e);
                        updateField('ant_farmacos_detalle', e.target.value);
                      }}
                      placeholder="Ej: Sertralina 50mg/día (Psiquiatría), Lorazepam 1mg si SOS..."
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-[#2D2832] focus:ring-2 focus:ring-[#620092]"
                    />
                    {stepErrors.ant_farmacos_detalle && (
                      <p className="text-[11px] text-red-600 font-bold mt-1">{stepErrors.ant_farmacos_detalle}</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Consumo de Sustancias */}
            <div>
              <label className="block text-xs font-bold text-[#2D2832] mb-1">Consumo de Sustancias *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  'Ninguno',
                  'Tabaco / Nicotina',
                  'Alcohol ocasional',
                  'Alcohol habitual / de riesgo',
                  'Cannabis',
                  'Benzodiacepinas no pautadas',
                  'Estimulantes / Otras sustancias'
                ].map((sust) => {
                  const isChecked = formData.ant_sustancias_consumo?.includes(sust);
                  return (
                    <label
                      key={sust}
                      className={`p-3 rounded-2xl border text-xs font-bold cursor-pointer transition-all flex items-center gap-2.5 ${
                        isChecked
                          ? 'bg-[#F8F0FC] border-[#620092] text-[#620092] shadow-xs'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxToggle('ant_sustancias_consumo', sust, 'Ninguno')}
                        className="rounded text-[#620092] focus:ring-[#620092]"
                      />
                      <span>{sust}</span>
                    </label>
                  );
                })}
              </div>
              {stepErrors.ant_sustancias_consumo && (
                <p className="text-[11px] text-red-600 font-bold mt-1">{stepErrors.ant_sustancias_consumo}</p>
              )}
            </div>
          </div>
        )}

        {/* Wizard Footer Navigation Controls */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrevStep}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Paso Anterior</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[10px] text-slate-400 font-bold hidden sm:inline">
              Atajo: <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-slate-600">Ctrl + Enter</kbd>
            </span>

            {currentStep < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="px-5 py-2.5 bg-[#620092] hover:bg-[#4E0075] text-white rounded-xl font-bold text-xs shadow-md shadow-[#620092]/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Siguiente Paso</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalizeInterview}
                disabled={isSaving}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-black text-xs shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <FileCheck className="w-4 h-4" />
                <span>Finalizar Entrevista & Generar PDF</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal Visor de PDF */}
      {showPdfModal && (
        <EntrevistaPdfModal
          patient={patient}
          interview={formData}
          onClose={() => setShowPdfModal(false)}
          therapistName={user?.name || formData.meta_terapeuta_nombre}
          therapistLicense={user?.senescytNumber || user?.collegeNumber}
          therapistRole={user?.role}
        />
      )}
    </div>
  );
};
