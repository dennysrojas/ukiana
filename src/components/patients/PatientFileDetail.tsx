import { InformeFinalTratamientoPdfModal } from '../reports/InformeFinalTratamientoPdfModal';
import { FileCheck2 } from 'lucide-react';
import { HojaSeguimientoPdfModal } from '../notes/HojaSeguimientoPdfModal';
import { Printer } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { 
  Patient, 
  ClinicalNote, 
  TreatmentPlan, 
  LegalDocumentItem, 
  TimelineItem,
  InitialInterviewData
} from '../../types';
import { 
  User, 
  Phone, 
  ShieldAlert, 
  FileText, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  Activity, 
  ChevronRight,
  HeartPulse,
  Award,
  Download,
  Baby,
  Users,
  Brain,
  Pill,
  Sparkles,
  ClipboardList,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { getInitialInterviewByPatientId } from '../../services/interviewService';
import { EntrevistaPdfModal } from '../interview/EntrevistaPdfModal';
import { EntrevistaInicialWizard } from '../interview/EntrevistaInicialWizard';
import { useAuth } from '../../context/AuthContext';

interface PatientFileDetailProps {
  patient: Patient;
  notes: ClinicalNote[];
  treatmentPlan?: TreatmentPlan;
  legalDocuments: LegalDocumentItem[];
  timelineItems: TimelineItem[];
  onOpenNewNoteModal: () => void;
  onNavigateToTreatment: () => void;
  onNavigateToReports: () => void;
}

export const PatientFileDetail: React.FC<PatientFileDetailProps> = ({
  patient,
  notes,
  treatmentPlan,
  legalDocuments,
  timelineItems,
  onOpenNewNoteModal,
  onNavigateToTreatment,
  onNavigateToReports
}) => {
  const { user } = useAuth();
  const [noteForPdf, setNoteForPdf] = useState<ClinicalNote | null>(null);
  const [isInformeFinalModalOpen, setIsInformeFinalModalOpen] = useState(false);
  const [isBlankHojaSeguimientoModalOpen, setIsBlankHojaSeguimientoModalOpen] = useState(false);
  if (!patient) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">
        No se encontró el expediente del paciente seleccionado.
      </div>
    );
  }

  const [activeSubTab, setActiveSubTab] = useState<'antecedents' | 'interview' | 'notes' | 'treatment' | 'legal'>('antecedents');
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(notes[0]?.id || null);
  const [interviewData, setInterviewData] = useState<InitialInterviewData | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  useEffect(() => {
    const loadInterview = async () => {
      if (patient?.id) {
        const interview = await getInitialInterviewByPatientId(patient.id);
        setInterviewData(interview);
      }
    };
    loadInterview();
  }, [patient?.id]);

  const patientNotes = notes.filter(n => n.patientId === patient.id);
  const patientDocs = legalDocuments.filter(d => d.patientId === patient.id);


  return (
    <div className="space-y-6 font-sans">
      {/* Patient Main Clinical Card Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#620092]/5 rounded-full blur-3xl z-0"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <img
              src={patient.avatar}
              alt={patient.fullName}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-[#F8F0FC] shadow-md"
            />
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#2D2832] tracking-tight">
                  {patient.fullName}
                </h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#F8F0FC] text-[#620092] border border-[#E6D2F3]">
                  {patient.status}
                </span>
                <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-[#FFF8E7] text-[#5C4E00] border border-[#FFE7A8]">
                  Riesgo {patient.riskLevel}
                </span>
                {patient.hasAutonomyLimitation && (
                  <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                    Limitación Autonomía
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 font-medium flex flex-wrap items-center gap-3">
                {patient.birthDate && <span>F.Nac: {patient.birthDate}</span>}
                <span>{patient.age} años · {patient.gender}</span>
                {patient.idNumber && <span>• Cédula/DNI: {patient.idNumber}</span>}
                <span>•</span>
                <span>{patient.occupation}</span>
                <span>•</span>
                <span>Inicio: {patient.startDate}</span>
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="px-2.5 py-1 bg-slate-100 text-[#2D2832] font-mono text-xs font-bold rounded-lg border border-slate-200">
                  {patient.icd10Code}
                </span>
                <span className="text-xs font-bold text-slate-700">
                  {patient.primaryDiagnosis}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0">
            <button
              onClick={onOpenNewNoteModal}
              className="flex items-center gap-2 px-4 py-2 bg-[#620092] hover:bg-[#4E0075] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#620092]/20 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Registrar Nota SOAP</span>
            </button>
            <button
              onClick={() => {
                if (interviewData && !interviewData.is_draft) {
                  setIsPdfModalOpen(true);
                } else {
                  setIsWizardOpen(true);
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#F8F0FC] hover:bg-[#E6D2F3] text-[#620092] border border-[#E6D2F3] rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <ClipboardList className="w-4 h-4 text-[#620092]" />
              <span>
                {interviewData && !interviewData.is_draft ? 'Informe Entrevista PDF' : 'Realizar Entrevista Inicial'}
              </span>
            </button>
            <button
              onClick={onNavigateToReports}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#2D2832] rounded-xl text-xs font-bold transition-all border border-slate-200 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Emitir Informe PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 overflow-x-auto">
        {[
          { id: 'antecedents', label: 'Antecedentes & Familia', icon: <Activity className="w-4 h-4" /> },
          { id: 'interview', label: 'Entrevista Inicial', icon: <ClipboardList className="w-4 h-4" /> },
          { id: 'notes', label: `Notas Clínicas (${patientNotes.length})`, icon: <FileText className="w-4 h-4" /> },
          { id: 'treatment', label: 'Plan de Tratamiento', icon: <HeartPulse className="w-4 h-4" /> },
          { id: 'legal', label: `Documentos Legales (${patientDocs.length})`, icon: <Award className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === tab.id
                ? 'bg-[#2D2832] text-white shadow-sm'
                : 'text-slate-600 hover:text-[#2D2832] hover:bg-slate-100'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>


      {/* Tab 1: Antecedentes & Contacto */}
      {activeSubTab === 'antecedents' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Medical & Psychiatric Antecedents */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4 shadow-xs">
              <h3 className="text-base font-extrabold text-[#2D2832] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#620092]" />
                Antecedentes Médicos y Psiquiátricos
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block mb-1">Antecedentes Médicos:</span>
                  <ul className="list-disc list-inside text-slate-600 space-y-1 bg-[#F8F9FA] p-3 rounded-xl border border-slate-100">
                    {patient.antecedents.medical.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-bold text-slate-800 block mb-1">Antecedentes Psiquiátricos / Psicológicos:</span>
                  <ul className="list-disc list-inside text-slate-600 space-y-1 bg-[#F8F9FA] p-3 rounded-xl border border-slate-100">
                    {patient.antecedents.psychiatric.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="font-bold text-slate-800 block mb-1">Historia Familiar:</span>
                  <ul className="list-disc list-inside text-slate-600 space-y-1 bg-[#F8F9FA] p-3 rounded-xl border border-slate-100">
                    {patient.antecedents.family.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Contact Details & Family Arrangement */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-5 shadow-xs">
              <h3 className="text-base font-extrabold text-[#2D2832] flex items-center gap-2">
                <Phone className="w-4 h-4 text-[#0E7CB5]" />
                Contacto & Información Familiar
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F9FA] border border-slate-100">
                  <span className="text-slate-500 font-medium">Correo Electrónico:</span>
                  <span className="font-bold text-[#2D2832]">{patient.email}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#F8F9FA] border border-slate-100">
                  <span className="text-slate-500 font-medium">Teléfono Directo:</span>
                  <span className="font-bold text-[#2D2832]">{patient.phone}</span>
                </div>

                {patient.familyInfo && (
                  <div className="p-3.5 rounded-xl bg-[#FFF8E7] border border-[#FFE7A8] space-y-2">
                    <span className="font-bold text-[#5C4E00] flex items-center gap-1.5 text-xs">
                      <Users className="w-4 h-4 text-[#5C4E00]" />
                      Estructura Familiar y Convivencia
                    </span>
                    <p className="text-xs text-[#2D2832] font-semibold">
                      Convivencia: <span className="font-bold text-[#620092]">{patient.familyInfo.livingArrangement}</span>
                      {patient.familyInfo.totalFamilyMembersCount ? ` (${patient.familyInfo.totalFamilyMembersCount} familiares)` : ''}
                    </p>
                    {patient.familyInfo.familyRelationships && patient.familyInfo.familyRelationships.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {patient.familyInfo.familyRelationships.map((r, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-white rounded-md text-[11px] font-bold text-[#5C4E00] border border-[#FFE7A8]">
                            {r}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/80 space-y-1.5">
                  <span className="text-rose-800 font-bold flex items-center gap-1.5 text-xs">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    Contacto de Emergencia Obligado
                  </span>
                  <p className="text-slate-700 font-semibold text-xs">{patient.emergencyContact.name} ({patient.emergencyContact.relationship})</p>
                  <p className="text-slate-600 text-[11px]">Teléfono Urgencia: {patient.emergencyContact.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Perinatal & Development History Card (If present) */}
          {patient.perinatalHistory && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4 shadow-xs">
              <h3 className="text-base font-extrabold text-[#620092] flex items-center gap-2 border-b border-slate-100 pb-3">
                <Baby className="w-5 h-5 text-[#620092]" />
                Historial Perinatal, Embarazo & Hitos de Desarrollo Psicomotor
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Embarazo y Parto */}
                <div className="bg-[#F8F0FC] p-4 rounded-xl border border-[#E6D2F3] space-y-2">
                  <h4 className="font-bold text-[#620092] text-xs underline mb-2">A) Gestación, Parto & Entorno</h4>
                  <div className="space-y-1.5 text-slate-700">
                    <p><strong>Embarazo:</strong> {patient.perinatalHistory.pregnancyPlanned}</p>
                    <p><strong>Término Gestacional:</strong> {patient.perinatalHistory.gestationalTerm}</p>
                    <p><strong>Tipo de Parto:</strong> {patient.perinatalHistory.birthType}</p>
                    <p><strong>Complicaciones:</strong> {patient.perinatalHistory.pregnancyComplications}</p>
                    <p><strong>Acompañamiento Pareja:</strong> {patient.perinatalHistory.partnerSupport}</p>
                    <p><strong>Acompañamiento Familiar:</strong> {patient.perinatalHistory.familySupport}</p>
                  </div>
                </div>

                {/* Hitos del Desarrollo */}
                <div className="bg-[#F8F9FA] p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-[#2D2832] text-xs underline mb-2">B) Hitos del Desarrollo Psicomotor & Esfínteres</h4>
                  <div className="grid grid-cols-2 gap-2 text-slate-700">
                    <p><strong>Sostén Cefálico:</strong> {patient.perinatalHistory.headSupportAgeMonths}</p>
                    <p><strong>Gateo:</strong> {patient.perinatalHistory.crawlingAgeMonths}</p>
                    <p><strong>Caminó:</strong> {patient.perinatalHistory.walkingAgeMonths}</p>
                    <p><strong>Destete:</strong> {patient.perinatalHistory.weaningAgeMonths}</p>
                    <p><strong>Alim. Compl.:</strong> {patient.perinatalHistory.complementaryFeedingAgeMonths}</p>
                    <p><strong>Dejó Pañal:</strong> {patient.perinatalHistory.pottyTrainingAgeMonths}</p>
                  </div>
                  <div className="pt-2 border-t border-slate-200">
                    <p><strong>Regresiones Esfínteres:</strong> <span className="font-semibold text-rose-800">{patient.perinatalHistory.sphincterRegressions}</span></p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Notas Clínicas (SOAP) */}
      {activeSubTab === 'notes' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/80">
            <div>
              <h3 className="text-sm font-extrabold text-[#2D2832]">Histórico de Sesiones y Evolución SOAP</h3>
              <p className="text-[11px] text-slate-500 font-medium">Hojas de Seguimiento y Certificados de Evaluación con código oficial UK-HSP-2026</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsBlankHojaSeguimientoModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                title="Imprimir formato en blanco de 7 secciones con espaciado de 7.8mm para consulta física"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500" />
                <span>Formato en Blanco (Físico)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsInformeFinalModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EBF7FC] hover:bg-[#D6EFF9] text-[#0E7CB5] border border-[#BDE3F5] rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95"
                title="Generar Informe Final Unificado con el consolidado de todas las Hojas de Seguimiento"
              >
                <FileCheck2 className="w-3.5 h-3.5 text-[#0E7CB5]" />
                <span>Informe Consolidado</span>
              </button>

              <button
                type="button"
                onClick={onOpenNewNoteModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#620092] hover:bg-[#4E0075] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nueva Hoja de Seguimiento</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {patientNotes.map(note => {
              const isExpanded = expandedNoteId === note.id;
              return (
                <div
                  key={note.id}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs transition-all"
                >
                  <div
                    onClick={() => setExpandedNoteId(isExpanded ? null : note.id)}
                    className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#F8F0FC] text-[#620092] font-extrabold text-sm flex items-center justify-center shrink-0 border border-[#E6D2F3]">
                        #{note.sessionNumber}
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-[#2D2832] flex items-center gap-2">
                          {note.type} · {note.date}
                          <span className="text-xs font-normal text-slate-500">({note.durationMinutes} min)</span>
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-medium">
                          S: {note.subjective}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setNoteForPdf(note);
                        }}
                        className="px-2.5 py-1 bg-[#F8F0FC] hover:bg-[#E6D2F3] text-[#620092] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border border-[#E6D2F3] cursor-pointer"
                        title="Emitir Certificado / Hoja de Seguimiento Oficial en PDF"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#620092]" />
                        <span className="hidden md:inline">Emitir Certificado</span>
                      </button>

                      {note.bdiScore !== undefined && (
                        <span className="px-2.5 py-1 bg-[#EBF7FC] text-[#0E7CB5] text-xs font-bold rounded-lg border border-[#BDE3F5]">
                          BDI: {note.bdiScore}
                        </span>
                      )}
                      {note.suicideRisk && (
                        <span className="px-2.5 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-lg border border-rose-200 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Alerta
                        </span>
                      )}
                      <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="p-5 pt-0 border-t border-slate-100 space-y-4 text-xs bg-[#F8F9FA]/60">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div className="p-4 rounded-xl bg-white border border-slate-200/70 space-y-1">
                          <span className="font-bold text-[#620092] uppercase tracking-wider text-[11px] block">
                            S - Subjetivo (Motivo y Relato Paciente)
                          </span>
                          <p className="text-slate-700 leading-relaxed font-medium">{note.subjective}</p>
                        </div>

                        <div className="p-4 rounded-xl bg-white border border-slate-200/70 space-y-1">
                          <span className="font-bold text-[#620092] uppercase tracking-wider text-[11px] block">
                            O - Objetivo (Observación y Psicometría)
                          </span>
                          <p className="text-slate-700 leading-relaxed font-medium">{note.objective}</p>
                        </div>

                        <div className="p-4 rounded-xl bg-white border border-slate-200/70 space-y-1">
                          <span className="font-bold text-[#620092] uppercase tracking-wider text-[11px] block">
                            A - Evaluación (Juicio Clínico y Diagnóstico)
                          </span>
                          <p className="text-slate-700 leading-relaxed font-medium">{note.assessment}</p>
                        </div>

                        <div className="p-4 rounded-xl bg-white border border-slate-200/70 space-y-1">
                          <span className="font-bold text-[#620092] uppercase tracking-wider text-[11px] block">
                            P - Plan (Tareas e Intervención Próxima)
                          </span>
                          <p className="text-slate-700 leading-relaxed whitespace-pre-line font-medium">{note.plan}</p>
                        </div>
                      </div>

                      {/* Barra de Emisión Oficial de la Sesión */}
                      <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-200">
                        <div className="text-[11px] text-slate-500 font-mono">
                          Documento Oficial: <strong>UK-HSP-2026</strong> · Modalidad {note.modality || 'Presencial'}
                        </div>
                        <button
                          type="button"
                          onClick={() => setNoteForPdf(note)}
                          className="px-4 py-2 bg-[#620092] hover:bg-[#4E0075] text-white font-extrabold text-xs rounded-xl shadow-md shadow-[#620092]/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                          <Download className="w-4 h-4 text-[#FFCD69]" />
                          <span>Emitir / Previsualizar Certificado PDF</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Plan de Tratamiento */}
      {activeSubTab === 'treatment' && treatmentPlan && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#2D2832]">Plan de Tratamiento Estratégico</h3>
                <p className="text-xs text-slate-500 font-medium">Orientación: {treatmentPlan.orientation}</p>
              </div>
              <button
                onClick={onNavigateToTreatment}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#2D2832] text-xs font-bold rounded-xl border border-slate-200 cursor-pointer"
              >
                Editar Plan de Tratamiento
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#F8F0FC] border border-[#E6D2F3] text-xs text-slate-800">
              <span className="font-bold text-[#620092] block mb-1">Objetivo General:</span>
              <p className="font-medium">{treatmentPlan.generalObjective}</p>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Objetivos Específicos</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {treatmentPlan.specificGoals.map(goal => (
                  <div key={goal.id} className="p-3.5 rounded-xl bg-[#F8F9FA] border border-slate-200/70 flex items-start gap-3 text-xs">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${goal.completed ? 'text-[#0E7CB5]' : 'text-slate-300'}`} />
                    <div>
                      <p className={`font-semibold ${goal.completed ? 'line-through text-slate-400' : 'text-[#2D2832]'}`}>
                        {goal.description}
                      </p>
                      <span className="text-[10px] text-slate-400 block mt-1">Fecha objetivo: {goal.targetDate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Entrevista Inicial */}
      {activeSubTab === 'interview' && (
        <div className="space-y-6 animate-fadeIn">
          {interviewData ? (
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              
              {/* Header de la Entrevista */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-[#2D2832]">
                      Informe de Entrevista Inicial y Evaluación Clínica
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      interviewData.is_draft
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {interviewData.is_draft ? 'Borrador Guardado' : 'Completada'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Evaluado por: <strong className="text-slate-700">{interviewData.meta_terapeuta_nombre || 'Dr. Alejandro Reyes'}</strong> · Fecha: {interviewData.meta_fecha}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPdfModalOpen(true)}
                    className="px-4 py-2 bg-[#620092] hover:bg-[#4E0075] text-white rounded-xl font-bold text-xs shadow-md shadow-[#620092]/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Ver / Descargar PDF</span>
                  </button>
                  <button
                    onClick={() => setIsWizardOpen(true)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>Editar Entrevista</span>
                  </button>
                </div>
              </div>

              {/* Alerta de Riesgo Vital si aplica */}
              {interviewData.riesgo_vital_nivel !== 'sin_riesgo' && (
                <div className="p-4 bg-red-50 border-2 border-red-500 rounded-2xl text-red-900 space-y-1.5">
                  <div className="flex items-center gap-2 font-black uppercase text-xs text-red-700">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Protocolo de Riesgo Vital Activo: {interviewData.riesgo_vital_nivel.replace(/_/g, ' ')}</span>
                  </div>
                  {interviewData.riesgo_detalle_evaluacion && (
                    <p className="text-xs text-red-800 italic bg-white/70 p-2.5 rounded-xl border border-red-200">
                      {interviewData.riesgo_detalle_evaluacion}
                    </p>
                  )}
                </div>
              )}

              {/* Resumen Clínico por Bloques */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                
                {/* Bloque Motivo de Consulta y Examen de Entrada */}
                <div className="space-y-3 bg-[#F8F9FA] p-5 rounded-2xl border border-slate-200/80">
                  <h4 className="font-extrabold text-[#620092] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5" />
                    Examen de Entrada & Motivo
                  </h4>
                  <div>
                    <span className="font-bold text-slate-700 block text-[10px] uppercase">Motivo de Consulta:</span>
                    <p className="p-3 bg-white rounded-xl border-l-[3px] border-[#620092] italic text-slate-700 mt-1">
                      "{interviewData.eval_motivo_consulta}"
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Orientación</span>
                      <span className="font-bold text-slate-800">{interviewData.eval_orientacion}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Afecto</span>
                      <span className="font-bold text-slate-800">{interviewData.eval_tipo_afecto}</span>
                    </div>
                  </div>
                </div>

                {/* Bloque Sintomatología */}
                <div className="space-y-3 bg-[#F8F9FA] p-5 rounded-2xl border border-slate-200/80">
                  <h4 className="font-extrabold text-[#620092] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    Sintomatología & Fenomenología
                  </h4>
                  <div>
                    <span className="font-bold text-slate-700 block text-[10px] uppercase">Vivencia Actual:</span>
                    <p className="p-3 bg-white rounded-xl border-l-[3px] border-[#0E7CB5] italic text-slate-700 mt-1">
                      "{interviewData.sint_experiencia_actual}"
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Curso Temporal</span>
                      <span className="font-bold text-slate-800">{interviewData.sint_linea_tiempo}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Psicomotricidad</span>
                      <span className="font-bold text-slate-800">{interviewData.sint_ritmo_psicomotor}</span>
                    </div>
                  </div>
                </div>

                {/* Bloque Biográfico y Trauma */}
                <div className="space-y-3 bg-[#F8F9FA] p-5 rounded-2xl border border-slate-200/80">
                  <h4 className="font-extrabold text-[#620092] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Memoria Biográfica & Familia
                  </h4>
                  <div>
                    <span className="font-bold text-slate-700 block text-[10px] uppercase">Narrativa de Infancia:</span>
                    <p className="p-3 bg-white rounded-xl border-l-[3px] border-[#620092] italic text-slate-700 mt-1">
                      "{interviewData.bio_narrativa_infancia}"
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Clima Familiar</span>
                      <span className="font-bold text-slate-800">{interviewData.bio_clima_familiar}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Rol Asumido</span>
                      <span className="font-bold text-slate-800">{interviewData.bio_rol_asumido}</span>
                    </div>
                  </div>
                </div>

                {/* Bloque Esfera Cognitiva y Vínculos */}
                <div className="space-y-3 bg-[#F8F9FA] p-5 rounded-2xl border border-slate-200/80">
                  <h4 className="font-extrabold text-[#620092] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                    <Brain className="w-3.5 h-3.5" />
                    Cognición & Red Vincular
                  </h4>
                  <div>
                    <span className="font-bold text-slate-700 block text-[10px] uppercase">Pensamiento Predominante:</span>
                    <p className="p-3 bg-white rounded-xl border-l-[3px] border-[#620092] italic text-slate-700 mt-1">
                      "{interviewData.cog_pensamiento_predominante}"
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Dinámica Vincular</span>
                      <span className="font-bold text-slate-800">{interviewData.soc_dinamica_vincular}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[9px] uppercase font-bold">Anhedonia</span>
                      <span className="font-bold text-slate-800">{interviewData.soc_anhedonia}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-[#F8F0FC] text-[#620092] flex items-center justify-center mx-auto shadow-sm">
                <ClipboardList className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-black text-[#2D2832]">
                  Evaluación Clínica Inicial Pendiente
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Este paciente aún no cuenta con una evaluación clínica semiestructurada registrada. Aplique el protocolo guiado de 7 pasos con validación estricta y generación de informe clínico en PDF.
                </p>
              </div>
              <button
                onClick={() => setIsWizardOpen(true)}
                className="px-6 py-3 bg-[#620092] hover:bg-[#4E0075] text-white rounded-2xl font-black text-xs shadow-lg shadow-[#620092]/20 transition-all cursor-pointer active:scale-95 inline-flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#FFCD69]" />
                <span>Realizar Entrevista Inicial Ahora</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Documentos Legales */}
      {activeSubTab === 'legal' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 space-y-4 shadow-xs">
          <h3 className="text-base font-extrabold text-[#2D2832]">Documentos Legales y RGPD del Paciente</h3>
          <div className="space-y-3">
            {patientDocs.map(doc => (
              <div key={doc.id} className="p-4 rounded-xl bg-[#F8F9FA] border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-[#2D2832]">{doc.documentType}</h4>
                  <p className="text-slate-500 text-[11px] font-medium">{doc.version} · Firmado: {doc.signedDate || 'Pendiente'}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                  doc.status === 'Firmado' 
                    ? 'bg-[#EBF7FC] text-[#0E7CB5] border border-[#BDE3F5]' 
                    : 'bg-[#FFF8E7] text-[#5C4E00] border border-[#FFE7A8]'
                }`}>
                  {doc.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Asistente Wizard de Entrevista Inicial */}
      {isWizardOpen && (
        <div className="fixed inset-0 bg-[#1E1B24]/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto animate-fadeIn">
          <div className="max-w-4xl w-full my-auto">
            <EntrevistaInicialWizard
              patient={patient}
              onFinish={(finalized) => {
                setInterviewData(finalized);
                setIsWizardOpen(false);
                setIsPdfModalOpen(true);
              }}
              onCancel={() => setIsWizardOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Modal Visor de PDF */}
      {isPdfModalOpen && interviewData && (
        <EntrevistaPdfModal
          patient={patient}
          interview={interviewData}
          onClose={() => setIsPdfModalOpen(false)}
          therapistName={user?.name || interviewData.meta_terapeuta_nombre}
          therapistLicense={user?.senescytNumber || user?.collegeNumber}
          therapistRole={user?.role}
        />
      )}
      {noteForPdf && (
        <HojaSeguimientoPdfModal
          note={noteForPdf}
          patient={patient}
          onClose={() => setNoteForPdf(null)}
        />
      )}
      {isBlankHojaSeguimientoModalOpen && (
        <HojaSeguimientoPdfModal
          isBlank={true}
          onClose={() => setIsBlankHojaSeguimientoModalOpen(false)}
        />
      )}
      {isInformeFinalModalOpen && (
        <InformeFinalTratamientoPdfModal
          patient={patient}
          notes={patientNotes}
          treatmentPlan={treatmentPlan}
          onClose={() => setIsInformeFinalModalOpen(false)}
        />
      )}
    </div>
  );
};


