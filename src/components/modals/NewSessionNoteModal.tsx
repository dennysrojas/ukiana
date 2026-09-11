import React, { useState, useEffect, useRef } from 'react';
import { 
  FilePlus, 
  X, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Signature, 
  RotateCcw, 
  Sparkles, 
  Save, 
  Clock, 
  Check, 
  Calendar, 
  Activity,
  HeartPulse,
  Brain,
  ShieldCheck
} from 'lucide-react';
import { Patient, ClinicalNote, SessionTechniqueItem, SessionDiagnosisItem } from '../../types';
import { searchICD10 } from '../../data/icd10Data';
import { useAuth } from '../../context/AuthContext';

interface NewSessionNoteModalProps {
  patients: Patient[];
  selectedPatientId?: string;
  onClose: () => void;
  onAddNote: (note: ClinicalNote) => void;
}

export const NewSessionNoteModal: React.FC<NewSessionNoteModalProps> = ({
  patients,
  selectedPatientId,
  onClose,
  onAddNote
}) => {
  const { user } = useAuth();
  const [patientId, setPatientId] = useState(selectedPatientId || (patients[0]?.id || ''));
  const selectedPatient = patients.find(p => p.id === patientId);

  // Sección 1: Metadatos y Atención
  const [sessionNumber, setSessionNumber] = useState(selectedPatient ? selectedPatient.totalSessions + 1 : 1);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('09:50');
  const [durationMinutes, setDurationMinutes] = useState(50);
  const [modality, setModality] = useState<'Presencial' | 'Virtual'>('Presencial');
  const [type, setType] = useState<string>('Sesión Regular');

  // Sección 2: Estado Emocional & Mental (Casillas polares)
  const emotionalCategoriesOptions = [
    'Estable', 'Ansioso', 'Deprimido', 'Angustiado',
    'Apático', 'Irritable', 'Receptivo', 'Desconectado / Embotado'
  ];
  const [selectedEmotionalCats, setSelectedEmotionalCats] = useState<string[]>(['Estable', 'Receptivo']);
  const [affectNotes, setAffectNotes] = useState('');

  // Sección 3: Contenido & Evolución (SOAP)
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');

  // Sección 4: Técnicas e Instrumentos
  const [appliesTechniques, setAppliesTechniques] = useState(false);
  const [techniquesList, setTechniquesList] = useState<SessionTechniqueItem[]>([
    { instrument: '', result: '' },
    { instrument: '', result: '' },
    { instrument: '', result: '' }
  ]);

  // Sección 5: Matriz Diagnóstica CIE
  const [diagnosesList, setDiagnosesList] = useState<SessionDiagnosisItem[]>([
    {
      name: selectedPatient?.primaryDiagnosis || '',
      code: selectedPatient?.icd10Code || '',
      type: 'DEF'
    }
  ]);
  const [searchIndex, setSearchIndex] = useState<number | null>(null);
  const [icdQuery, setIcdQuery] = useState('');

  // Sección 6: Plan Terapéutico y Próxima Cita
  const [nextSessionDate, setNextSessionDate] = useState('');
  const [nextSessionTime, setNextSessionTime] = useState('10:00');
  const [recommendedFrequency, setRecommendedFrequency] = useState('Semanal');

  // Sección 7: Firma Digital Canvas
  const [signatureData, setSignatureData] = useState<string>('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Psicometría & Alertas
  const [bdiScore, setBdiScore] = useState<number | ''>('');
  const [baiScore, setBaiScore] = useState<number | ''>('');
  const [suicideRisk, setSuicideRisk] = useState(false);

  // Validaciones y Autoguardado
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [lastAutosavedAt, setLastAutosavedAt] = useState<string | null>(null);
  const [hasExistingDraft, setHasExistingDraft] = useState<boolean>(false);
  const [savedDraftInfo, setSavedDraftInfo] = useState<{ timestamp: string; note: any } | null>(null);

  // Clave de almacenamiento por paciente
  const getDraftKey = (pId: string) => `ukiana_seguimiento_draft_${pId}`;

  // Verificar si hay borrador previo al cambiar o iniciar paciente
  useEffect(() => {
    if (!patientId) return;
    try {
      const stored = localStorage.getItem(getDraftKey(patientId));
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.data) {
          setHasExistingDraft(true);
          setSavedDraftInfo({
            timestamp: parsed.timestamp ? new Date(parsed.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Guardado reciente',
            note: parsed.data
          });
          return;
        }
      }
    } catch (e) {
      console.warn('Error al verificar borrador:', e);
    }
    setHasExistingDraft(false);
    setSavedDraftInfo(null);
  }, [patientId]);

  // Sincronizar datos base al cambiar paciente si no se restauró borrador
  useEffect(() => {
    if (selectedPatient) {
      setSessionNumber(selectedPatient.totalSessions + 1);
      if (!diagnosesList[0]?.name && selectedPatient.primaryDiagnosis) {
        setDiagnosesList([{
          name: selectedPatient.primaryDiagnosis,
          code: selectedPatient.icd10Code || 'Z00.4',
          type: 'DEF'
        }]);
      }
    }
  }, [patientId]);

  // Temporizador de Autoguardado cada 30 segundos
  useEffect(() => {
    const saveCurrentDraft = () => {
      if (!patientId) return;
      // Solo guardar si hay contenido clínico iniciado
      if (subjective.trim().length > 0 || assessment.trim().length > 0 || affectNotes.trim().length > 0 || plan.trim().length > 0) {
        const draftData = {
          sessionNumber,
          date,
          startTime,
          endTime,
          durationMinutes,
          modality,
          type,
          selectedEmotionalCats,
          affectNotes,
          subjective,
          objective,
          assessment,
          plan,
          appliesTechniques,
          techniquesList,
          diagnosesList,
          nextSessionDate,
          nextSessionTime,
          recommendedFrequency,
          bdiScore,
          baiScore,
          suicideRisk,
          signatureData
        };
        try {
          localStorage.setItem(getDraftKey(patientId), JSON.stringify({
            timestamp: new Date().toISOString(),
            data: draftData
          }));
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          setLastAutosavedAt(nowStr);
        } catch (err) {
          console.warn('Error en autoguardado:', err);
        }
      }
    };

    const intervalId = setInterval(saveCurrentDraft, 30000); // 30 segundos
    return () => clearInterval(intervalId);
  }, [
    patientId, sessionNumber, date, startTime, endTime, durationMinutes, modality, type,
    selectedEmotionalCats, affectNotes, subjective, objective, assessment, plan,
    appliesTechniques, techniquesList, diagnosesList, nextSessionDate, nextSessionTime,
    recommendedFrequency, bdiScore, baiScore, suicideRisk, signatureData
  ]);

  // Restaurar borrador encontrado
  const handleRestoreDraft = () => {
    if (!savedDraftInfo?.note) return;
    const d = savedDraftInfo.note;
    if (d.sessionNumber) setSessionNumber(d.sessionNumber);
    if (d.date) setDate(d.date);
    if (d.startTime) setStartTime(d.startTime);
    if (d.endTime) setEndTime(d.endTime);
    if (d.durationMinutes) setDurationMinutes(d.durationMinutes);
    if (d.modality) setModality(d.modality);
    if (d.type) setType(d.type);
    if (d.selectedEmotionalCats) setSelectedEmotionalCats(d.selectedEmotionalCats);
    if (d.affectNotes !== undefined) setAffectNotes(d.affectNotes);
    if (d.subjective !== undefined) setSubjective(d.subjective);
    if (d.objective !== undefined) setObjective(d.objective);
    if (d.assessment !== undefined) setAssessment(d.assessment);
    if (d.plan !== undefined) setPlan(d.plan);
    if (d.appliesTechniques !== undefined) setAppliesTechniques(d.appliesTechniques);
    if (d.techniquesList) setTechniquesList(d.techniquesList);
    if (d.diagnosesList) setDiagnosesList(d.diagnosesList);
    if (d.nextSessionDate !== undefined) setNextSessionDate(d.nextSessionDate);
    if (d.nextSessionTime !== undefined) setNextSessionTime(d.nextSessionTime);
    if (d.recommendedFrequency) setRecommendedFrequency(d.recommendedFrequency);
    if (d.bdiScore !== undefined) setBdiScore(d.bdiScore);
    if (d.baiScore !== undefined) setBaiScore(d.baiScore);
    if (d.suicideRisk !== undefined) setSuicideRisk(d.suicideRisk);
    if (d.signatureData) setSignatureData(d.signatureData);

    setHasExistingDraft(false);
    setLastAutosavedAt(`Restaurado (${savedDraftInfo.timestamp})`);
  };

  // Descartar borrador
  const handleDiscardDraft = () => {
    localStorage.removeItem(getDraftKey(patientId));
    setHasExistingDraft(false);
    setSavedDraftInfo(null);
  };

  // Manejo de canvas de firma
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.strokeStyle = '#620092';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureData(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignatureData('');
  };

  const handleCategoryToggle = (cat: string) => {
    if (selectedEmotionalCats.includes(cat)) {
      if (selectedEmotionalCats.length === 1) {
        setValidationErrors(prev => ({ ...prev, emotionalState: 'Debe seleccionar al menos 1 categoría emocional observada.' }));
        return;
      }
      setSelectedEmotionalCats(prev => prev.filter(c => c !== cat));
    } else {
      setSelectedEmotionalCats(prev => [...prev, cat]);
      setValidationErrors(prev => {
        const next = { ...prev };
        delete next.emotionalState;
        return next;
      });
    }
  };

  const handleAddDiagnosis = () => {
    if (diagnosesList.length < 4) {
      setDiagnosesList(prev => [...prev, { name: '', code: '', type: 'PRE' }]);
    }
  };

  const handleRemoveDiagnosis = (idx: number) => {
    setDiagnosesList(prev => prev.filter((_, i) => i !== idx));
  };

  const validateForm = (): boolean => {
    const errs: { [key: string]: string } = {};

    // 1.1 Documento del paciente
    if (!selectedPatient?.idNumber || selectedPatient.idNumber.length < 8) {
      // Advertencia informativa, pero no bloquea si no fue registrado inicialmente
    }

    // 1.2 Paciente
    if (!patientId) {
      errs.patientId = 'Debe seleccionar un paciente.';
    }

    // 1.3 Sesión
    if (!sessionNumber || sessionNumber < 1) {
      errs.sessionNumber = 'El número de sesión debe ser mayor a 0.';
    }

    // 2.1 Estado afectivo
    if (selectedEmotionalCats.length === 0) {
      errs.emotionalState = 'Debe seleccionar al menos 1 predominio afectivo (Sec. 2.1).';
    }

    // 3.1 Contenido de la sesión (mín. 20 caracteres)
    if (!subjective || subjective.trim().length < 20) {
      errs.subjective = 'El relato subjetivo de la sesión debe tener mínimo 20 caracteres (Sec. 3.1).';
    }
    if (!assessment || assessment.trim().length < 10) {
      errs.assessment = 'La evaluación clínica debe tener mínimo 10 caracteres (Sec. 3.1).';
    }

    // 5.1 Diagnóstico
    const validDiag = diagnosesList.filter(d => d.name.trim().length > 0);
    if (validDiag.length === 0) {
      errs.diagnoses = 'Debe ingresar al menos 1 diagnóstico clínico o de impresión (Sec. 5.1).';
    }

    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const newNote: ClinicalNote = {
      id: `note-${Date.now()}`,
      patientId,
      sessionNumber: Number(sessionNumber),
      date,
      startTime,
      endTime,
      durationMinutes: Number(durationMinutes),
      modality,
      type,
      emotionalStateCategories: selectedEmotionalCats,
      affectNotes,
      emotionalState: (selectedEmotionalCats[0] as any) || 'Estable',
      subjective,
      objective: objective || affectNotes || 'Discurso fluido, orientado en tiempo, espacio y persona.',
      assessment,
      plan: plan || 'Continuar con el protocolo asignado y tareas terapéuticas.',
      appliesTechniques,
      techniquesList: appliesTechniques ? techniquesList.filter(t => t.instrument.trim() !== '') : [],
      diagnosesList: diagnosesList.filter(d => d.name.trim() !== ''),
      nextSessionDate,
      nextSessionTime,
      recommendedFrequency,
      therapistSignature: signatureData,
      bdiScore: bdiScore !== '' ? Number(bdiScore) : undefined,
      baiScore: baiScore !== '' ? Number(baiScore) : undefined,
      suicideRisk
    };

    // Limpiar borrador en localStorage
    localStorage.removeItem(getDraftKey(patientId));

    onAddNote(newNote);
    onClose();
  };

  const icdSearchResults = icdQuery ? searchICD10(icdQuery) : [];

  return (
    <div className="fixed inset-0 bg-[#1E1B24]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn font-sans">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl max-w-4xl w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200 flex flex-col max-h-[94vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#620092] text-white flex items-center justify-center font-extrabold shadow-md shadow-[#620092]/30">
              <FilePlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-[#2D2832]">Registro de Consulta y Certificado de Evaluación</h3>
                <span className="px-2 py-0.5 bg-[#F8F0FC] text-[#620092] border border-[#E6D2F3] text-[10px] font-extrabold rounded-full">
                  UK-HSP-2026
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Hoja Oficial de Seguimiento Dual (Digital & Papel)</p>
            </div>
          </div>

          {/* Autoguardado Status Pill & Close Button */}
          <div className="flex items-center gap-3">
            {lastAutosavedAt && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-[11px] font-bold">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Autoguardado: {lastAutosavedAt}</span>
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Banner de Borrador Encontrado */}
        {hasExistingDraft && savedDraftInfo && (
          <div className="p-3.5 bg-[#FFF8E7] border border-[#FFE7A8] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shrink-0 animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#5C4E00] shrink-0" />
              <div>
                <span className="font-bold text-[#5C4E00]">Borrador previo detectado ({savedDraftInfo.timestamp}):</span>
                <span className="text-slate-700 block sm:inline sm:ml-1">Existen notas clínicas no guardadas para este paciente.</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleRestoreDraft}
                className="px-3 py-1.5 bg-[#620092] hover:bg-[#4E0075] text-white font-extrabold rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                Restaurar Borrador
              </button>
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-bold border border-slate-200 rounded-xl cursor-pointer"
              >
                Descartar
              </button>
            </div>
          </div>
        )}

        {/* Errores de Validación Generales */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-1 shrink-0">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Por favor revise los siguientes campos obligatorios:</span>
            </div>
            <ul className="list-disc list-inside pl-1 space-y-0.5 text-[11px] font-medium">
              {Object.values(validationErrors).map((msg, i) => (
                <li key={i}>{msg}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1 text-xs">
          
          {/* SECCIÓN 1. IDENTIFICACIÓN Y ATENCIÓN */}
          <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="font-extrabold text-[#620092] uppercase text-xs flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-[#620092] text-white text-[10px] flex items-center justify-center font-bold">1</span>
                <span>Identificación del Paciente y Atención</span>
              </h4>
              <span className="text-[10px] text-slate-500 font-mono font-bold">Sec. 1.1 - 1.3</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-bold text-[#2D2832] mb-1">
                  1.2 Paciente Objetivo <span className="text-rose-600">*</span>
                </label>
                <select
                  value={patientId}
                  onChange={e => setPatientId(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-bold focus:ring-2 focus:ring-[#620092]/20"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.fullName} (Doc: {p.idNumber || 'S/D'})</option>
                  ))}
                </select>
                {selectedPatient?.idNumber && (
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    1.1 Doc. Identidad: <strong className="font-mono text-slate-700">{selectedPatient.idNumber}</strong>
                  </span>
                )}
              </div>

              <div>
                <label className="block font-bold text-[#2D2832] mb-1">
                  1.3 Fecha de Sesión <span className="text-rose-600">*</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2D2832] mb-1">
                  1.3 Sesión N° <span className="text-rose-600">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={sessionNumber}
                  onChange={e => setSessionNumber(Number(e.target.value))}
                  required
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2D2832] mb-1">Horario (Inicio / Fin)</label>
                <div className="flex gap-1.5">
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-1/2 p-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold text-xs"
                  />
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-1/2 p-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2D2832] mb-1">Modalidad</label>
                <select
                  value={modality}
                  onChange={e => setModality(e.target.value as any)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-semibold"
                >
                  <option value="Presencial">Presencial (Consultorio)</option>
                  <option value="Virtual">Teleconsulta Virtual</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#2D2832] mb-1">Tipo de Atención</label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-semibold"
                >
                  <option value="Sesión Regular">Sesión Regular de Seguimiento</option>
                  <option value="Evaluación Inicial">Evaluación Clínica Inicial</option>
                  <option value="Intervención Crisis">Intervención de Crisis</option>
                  <option value="Cierre/Alta">Cierre / Alta Terapéutica</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2. EVALUACIÓN DEL ESTADO EMOCIONAL Y MENTAL */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-extrabold text-[#620092] uppercase text-xs flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-[#620092] text-white text-[10px] flex items-center justify-center font-bold">2</span>
                <span>Evaluación del Estado Emocional y Mental</span>
              </h4>
              <span className="text-[10px] text-slate-500 font-mono font-bold">Sec. 2.1 - 2.2</span>
            </div>

            <div>
              <span className="block font-bold text-slate-700 text-[11px] mb-2">
                2.1 Predominio Afectivo Observado (Selección Múltiple Rápida - Mín. 1) <span className="text-rose-600">*</span>:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {emotionalCategoriesOptions.map(cat => {
                  const isSelected = selectedEmotionalCats.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoryToggle(cat)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-left flex items-center justify-between ${
                        isSelected
                          ? 'bg-[#620092] text-white border-[#620092] shadow-xs scale-[1.01]'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className="font-mono text-xs font-bold">{isSelected ? '✓' : '+'}</span>
                    </button>
                  );
                })}
              </div>
              {validationErrors.emotionalState && (
                <p className="text-[11px] font-bold text-rose-600 mt-1">{validationErrors.emotionalState}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-bold text-slate-700 text-[11px]">
                  2.2 Observaciones de Afecto, Conducta o Examen Mental:
                </label>
                <span className={`text-[10px] font-mono ${affectNotes.length >= 240 ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                  {affectNotes.length} / 250 car.
                </span>
              </div>
              <textarea
                rows={2}
                maxLength={250}
                placeholder="Observaciones de contacto ocular, discurso, modulación afectiva, orientación y lenguaje..."
                value={affectNotes}
                onChange={e => setAffectNotes(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#2D2832] font-medium"
              />
            </div>
          </div>

          {/* SECCIÓN 3. CONTENIDO DE LA SESIÓN Y EVOLUCIÓN CLÍNICA */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-extrabold text-[#620092] uppercase text-xs flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-[#620092] text-white text-[10px] flex items-center justify-center font-bold">3</span>
                <span>Contenido de la Sesión y Evolución Clínica (SOAP)</span>
              </h4>
              <span className="text-[10px] text-slate-500 font-mono font-bold">Sec. 3.1</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-[#620092]">
                    Subjetivo (S) - Relato y Motivo Paciente <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">mín. 20 car. ({subjective.length})</span>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Discurso del paciente, eventos detonantes de la semana, quejas y vivencia actual..."
                  value={subjective}
                  onChange={e => {
                    setSubjective(e.target.value);
                    if (validationErrors.subjective && e.target.value.trim().length >= 20) {
                      setValidationErrors(prev => {
                        const next = { ...prev };
                        delete next.subjective;
                        return next;
                      });
                    }
                  }}
                  className={`w-full p-2.5 bg-slate-50 border rounded-xl text-[#2D2832] font-medium ${
                    validationErrors.subjective ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200'
                  }`}
                />
                {validationErrors.subjective && (
                  <p className="text-[11px] font-bold text-rose-600 mt-0.5">{validationErrors.subjective}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-[#620092]">
                    Evaluación & Análisis Clínico (A) <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[10px] text-slate-400 font-mono">mín. 10 car. ({assessment.length})</span>
                </div>
                <textarea
                  rows={4}
                  required
                  placeholder="Juicio clínico del terapeuta, asimilación de técnicas, avance en metas y reestructuración..."
                  value={assessment}
                  onChange={e => {
                    setAssessment(e.target.value);
                    if (validationErrors.assessment && e.target.value.trim().length >= 10) {
                      setValidationErrors(prev => {
                        const next = { ...prev };
                        delete next.assessment;
                        return next;
                      });
                    }
                  }}
                  className={`w-full p-2.5 bg-slate-50 border rounded-xl text-[#2D2832] font-medium ${
                    validationErrors.assessment ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200'
                  }`}
                />
                {validationErrors.assessment && (
                  <p className="text-[11px] font-bold text-rose-600 mt-0.5">{validationErrors.assessment}</p>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN 4. TÉCNICAS, INSTRUMENTOS Y EVALUACIONES APLICADAS */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-extrabold text-[#620092] uppercase text-xs flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-[#620092] text-white text-[10px] flex items-center justify-center font-bold">4</span>
                <span>Técnicas, Instrumentos y Evaluaciones Aplicadas</span>
              </h4>
              
              {/* Switch Booleano 4.1 */}
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700 text-xs">4.1 ¿Aplica en la sesión?</span>
                <button
                  type="button"
                  onClick={() => setAppliesTechniques(!appliesTechniques)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    appliesTechniques
                      ? 'bg-[#620092] text-white shadow-xs'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                >
                  {appliesTechniques ? 'SÍ (Activo)' : 'NO (Sin instrumentos)'}
                </button>
              </div>
            </div>

            {/* Matriz 4.2 */}
            {appliesTechniques && (
              <div className="space-y-2 pt-1 animate-fadeIn">
                <span className="text-[11px] font-bold text-slate-600 block">
                  4.2 Matriz de Registro Compacta (1 a 3 Registros):
                </span>
                {techniquesList.map((tech, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <span className="col-span-1 text-center font-bold font-mono text-slate-500">{idx + 1}.</span>
                    <input
                      type="text"
                      placeholder="Instrumento o técnica (ej: BDI-II, Reestructuración, Defusión)..."
                      value={tech.instrument}
                      onChange={e => {
                        const val = e.target.value;
                        setTechniquesList(prev => prev.map((t, i) => i === idx ? { ...t, instrument: val } : t));
                      }}
                      className="col-span-5 p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Escala / Resultado obtenido (ej: 14 pts - Leve, Adherencia 85%)..."
                      value={tech.result}
                      onChange={e => {
                        const val = e.target.value;
                        setTechniquesList(prev => prev.map((t, i) => i === idx ? { ...t, result: val } : t));
                      }}
                      className="col-span-6 p-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SECCIÓN 5. IMPRESIÓN DIAGNÓSTICA (CIE-10 / CIE-11) */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-extrabold text-[#620092] uppercase text-xs flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-[#620092] text-white text-[10px] flex items-center justify-center font-bold">5</span>
                <span>Impresión Diagnóstica (CIE-10 / CIE-11)</span>
              </h4>
              {diagnosesList.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddDiagnosis}
                  className="flex items-center gap-1 text-[#620092] font-bold text-xs hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Diagnóstico (Máx. 4)</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {diagnosesList.map((diag, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 relative">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-slate-500 text-xs font-mono">#{idx + 1}</span>

                    <div className="flex-1 relative">
                      <input
                        type="text"
                        placeholder="Buscar por descripción o código CIE (ej: Ansiedad, F41.1)..."
                        value={diag.name}
                        onChange={e => {
                          const val = e.target.value;
                          setDiagnosesList(prev => prev.map((d, i) => i === idx ? { ...d, name: val } : d));
                          setSearchIndex(idx);
                          setIcdQuery(val);
                        }}
                        className="w-full p-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                      />

                      {/* Autocompletar Indexado CIE */}
                      {searchIndex === idx && icdSearchResults.length > 0 && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-40 overflow-y-auto">
                          {icdSearchResults.map(res => (
                            <button
                              key={res.code}
                              type="button"
                              onClick={() => {
                                setDiagnosesList(prev => prev.map((d, i) => i === idx ? { ...d, name: res.name, code: res.code } : d));
                                setSearchIndex(null);
                                setIcdQuery('');
                              }}
                              className="w-full text-left p-2 hover:bg-[#F8F0FC] border-b border-slate-100 text-xs flex justify-between cursor-pointer"
                            >
                              <span className="font-semibold text-slate-800">{res.name}</span>
                              <span className="font-mono font-bold text-[#620092]">{res.code}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Cód. CIE"
                      value={diag.code}
                      onChange={e => {
                        const val = e.target.value;
                        setDiagnosesList(prev => prev.map((d, i) => i === idx ? { ...d, code: val } : d));
                      }}
                      className="w-24 p-2 bg-white border border-slate-200 rounded-xl text-center font-mono font-bold text-xs"
                    />

                    {/* Radio Button 5.2 PRE / DEF */}
                    <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 font-bold text-xs">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name={`diag-type-${idx}`}
                          checked={diag.type === 'PRE'}
                          onChange={() => setDiagnosesList(prev => prev.map((d, i) => i === idx ? { ...d, type: 'PRE' } : d))}
                          className="accent-[#620092]"
                        />
                        <span className="text-slate-600">PRE</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name={`diag-type-${idx}`}
                          checked={diag.type === 'DEF'}
                          onChange={() => setDiagnosesList(prev => prev.map((d, i) => i === idx ? { ...d, type: 'DEF' } : d))}
                          className="accent-[#620092]"
                        />
                        <span className="text-[#620092]">DEF</span>
                      </label>
                    </div>

                    {diagnosesList.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveDiagnosis(idx)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                        title="Eliminar diagnóstico"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {validationErrors.diagnoses && (
              <p className="text-[11px] font-bold text-rose-600">{validationErrors.diagnoses}</p>
            )}
          </div>

          {/* SECCIÓN 6. PLAN TERAPÉUTICO Y COMPROMISOS */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="font-extrabold text-[#620092] uppercase text-xs flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-[#620092] text-white text-[10px] flex items-center justify-center font-bold">6</span>
                <span>Plan Terapéutico y Compromisos</span>
              </h4>
              <span className="text-[10px] text-slate-500 font-mono font-bold">Sec. 6.1 - 6.2</span>
            </div>

            <div>
              <label className="block font-bold text-[#620092] mb-1">
                6.1 Tareas Terapéuticas Asignadas / Acuerdos para la Siguiente Sesión:
              </label>
              <textarea
                rows={3}
                placeholder="1. Tareas de autoregistro cognitivo, 2. Ejercicios de exposición gradual, 3. Acuerdos de autocuidado..."
                value={plan}
                onChange={e => setPlan(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[#2D2832] font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block font-bold text-slate-700 mb-1">6.2 Fecha Próxima Cita</label>
                <input
                  type="date"
                  value={nextSessionDate}
                  onChange={e => setNextSessionDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2D2832] font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hora Próxima Cita</label>
                <input
                  type="time"
                  value={nextSessionTime}
                  onChange={e => setNextSessionTime(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-center font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Frecuencia Recomendada</label>
                <select
                  value={recommendedFrequency}
                  onChange={e => setRecommendedFrequency(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="Semanal">Semanal (1 vez por semana)</option>
                  <option value="Quincenal">Quincenal (Cada 15 días)</option>
                  <option value="Mensual">Mensual / Seguimiento</option>
                  <option value="A convenir">A convenir según evolución</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECCIÓN 7. PROFESIONAL RESPONSABLE & FIRMA DIGITAL */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="font-extrabold text-[#620092] uppercase text-xs flex items-center gap-2">
                <span className="w-5 h-5 rounded-lg bg-[#620092] text-white text-[10px] flex items-center justify-center font-bold">7</span>
                <span>Profesional Responsable y Firma Digital</span>
              </h4>
              <span className="text-[10px] text-slate-500 font-mono font-bold">Sec. 7.1 - 7.2</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="space-y-2">
                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">7.1 Profesional Responsable:</span>
                  <span className="font-extrabold text-slate-800 text-sm">{user?.name || 'Dr. Alejandro Reyes'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">N° Identificación / Registro Senescyt:</span>
                  <span className="font-mono text-xs font-bold text-slate-700">{user?.senescytNumber || user?.collegeNumber || 'Senescyt N° 1005-2024-2849102'}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-500 font-bold uppercase">Especialidad / Rol:</span>
                  <span className="text-xs font-bold text-slate-700">{user?.role || 'Psicólogo General Sanitario'}</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-700 text-[11px] flex items-center gap-1">
                    <Signature className="w-3.5 h-3.5 text-[#620092]" />
                    7.2 Firma Digital / Táctil:
                  </span>
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Borrar Firma
                  </button>
                </div>
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={80}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-20 bg-white border border-slate-300 rounded-xl cursor-crosshair shadow-inner"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 shrink-0">
          <label className="flex items-center gap-2 cursor-pointer bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200 text-xs">
            <input
              type="checkbox"
              checked={suicideRisk}
              onChange={e => setSuicideRisk(e.target.checked)}
              className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
            />
            <span className="font-bold text-rose-800 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              Riesgo Vital / Crisis
            </span>
          </label>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer transition-colors text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#620092] hover:bg-[#4E0075] text-white rounded-xl font-extrabold shadow-md shadow-[#620092]/30 cursor-pointer active:scale-95 transition-all flex items-center gap-2 text-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-[#FFCD69]" />
              <span>Guardar Hoja de Seguimiento</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
