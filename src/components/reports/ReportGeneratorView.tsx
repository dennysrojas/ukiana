import { InformeFinalTratamientoPdfModal } from './InformeFinalTratamientoPdfModal';
import { HojaSeguimientoPdfModal } from '../notes/HojaSeguimientoPdfModal';
import { FileCheck2, Printer } from 'lucide-react';
import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Send, 
  CheckSquare, 
  Square, 
  ShieldCheck, 
  Award,
  Sparkles
} from 'lucide-react';
import { Patient, ClinicalNote, TreatmentPlan } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface ReportGeneratorViewProps {
  patients: Patient[];
  selectedPatient: Patient;
  notes: ClinicalNote[];
  treatmentPlan?: TreatmentPlan;
  onSelectPatient: (id: string) => void;
}

export const ReportGeneratorView: React.FC<ReportGeneratorViewProps> = ({
  patients,
  selectedPatient,
  notes,
  treatmentPlan,
  onSelectPatient
}) => {
  const { user } = useAuth();
  const patientNotes = notes.filter(n => n.patientId === selectedPatient?.id);

  const doctorName = user?.name || 'Dr. Alejandro Reyes';
  const doctorRole = user?.role || 'Psicólogo General Sanitario';
  const senescytNumber = user?.senescytNumber || user?.collegeNumber || 'Senescyt N° 1005-2024-2849102';

  // Config options
  const [reportTitle, setReportTitle] = useState('Informe Psicológico Clínico de Evolución');
  const [reportPeriod, setReportPeriod] = useState('Últimos 30 días');
  const [includeDiagnosis, setIncludeDiagnosis] = useState(true);
  const [includeNarratives, setIncludeNarratives] = useState(true);
  const [includeGoals, setIncludeGoals] = useState(true);
  const [includeSignature, setIncludeSignature] = useState(true);

  const [therapistConclusions, setTherapistConclusions] = useState(
    `El paciente ${selectedPatient?.fullName || ''} muestra una evolución clínica muy favorable con adecuada adherencia a las tareas de reestructuración cognitiva y defusión. Se recomienda continuar con las sesiones quincenales para la consolidación de estrategias frente a recaídas.`
  );

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [isInformeFinalModalOpen, setIsInformeFinalModalOpen] = useState(false);
  const [noteForPdf, setNoteForPdf] = useState<ClinicalNote | null>(null);
  const [isBlankHojaModalOpen, setIsBlankHojaModalOpen] = useState(false);

  const triggerToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleDownloadPdf = () => {
    triggerToast('Generando documento PDF de alta resolución...');
    setTimeout(() => {
      window.print();
    }, 400);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed bottom-6 right-6 bg-[#1E1B24] text-white px-5 py-3 rounded-2xl shadow-2xl z-50 text-xs font-bold animate-bounce flex items-center gap-2 border border-[#322B3D]">
          <Sparkles className="w-4 h-4 text-[#FFCD69]" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-black text-[#2D2832] tracking-tight flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-[#620092]" />
            Generador de Informes Clínicos PDF
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Dictámenes e informes evolutivos oficiales con número de Registro Senescyt
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => {
              if (patientNotes.length > 0) {
                setNoteForPdf(patientNotes[0]);
              } else {
                setIsBlankHojaModalOpen(true);
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-[#F8F0FC] hover:bg-[#E6D2F3] text-[#620092] border border-[#E6D2F3] font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
            title="Emitir Certificado de Evaluación / Hoja de Consulta (UK-HSP-2026)"
          >
            <Printer className="w-4 h-4 text-[#620092]" />
            <span>Certificado de Evaluación</span>
          </button>

          <button
            onClick={() => setIsInformeFinalModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#620092] hover:bg-[#4E0075] text-white font-extrabold text-xs rounded-xl shadow-md shadow-[#620092]/30 transition-all cursor-pointer active:scale-95"
          >
            <FileCheck2 className="w-4 h-4 text-[#FFCD69]" />
            <span>Informe Final Consolidado</span>
          </button>
          
          <button
            onClick={handleDownloadPdf}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Download className="w-4 h-4 text-[#FFCD69]" />
            <span>Imprimir Dictamen</span>
          </button>
          
          <button
            onClick={() => triggerToast(`Informe enviado por correo cifrado a ${selectedPatient?.email || 'paciente'}`)}
            className="px-4 py-2.5 bg-[#EBF7FC] hover:bg-[#D6EFF9] text-[#0E7CB5] border border-[#BDE3F5] rounded-xl font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4 text-[#0E7CB5]" />
            <span>Enviar al Paciente</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-extrabold text-[#2D2832] uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#620092]" />
              Personalización del Informe
            </h2>

            {/* Patient Selector */}
            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1">Paciente Objetivo</label>
              <select
                value={selectedPatient?.id}
                onChange={e => onSelectPatient(e.target.value)}
                className="w-full p-2.5 bg-[#F8F9FA] border border-slate-200 rounded-xl text-xs text-[#2D2832] font-semibold cursor-pointer"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.icd10Code})
                  </option>
                ))}
              </select>
            </div>

            {/* Report Title */}
            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1">Título del Encabezado</label>
              <input
                type="text"
                value={reportTitle}
                onChange={e => setReportTitle(e.target.value)}
                className="w-full p-2.5 bg-[#F8F9FA] border border-slate-200 rounded-xl text-xs text-[#2D2832] font-semibold"
              />
            </div>

            {/* Period */}
            <div>
              <label className="block font-bold text-slate-700 text-xs mb-1">Periodo Clinico Evaluado</label>
              <input
                type="text"
                value={reportPeriod}
                onChange={e => setReportPeriod(e.target.value)}
                className="w-full p-2.5 bg-[#F8F9FA] border border-slate-200 rounded-xl text-xs text-[#2D2832] font-semibold"
              />
            </div>

            {/* Checkbox Options */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block font-bold text-slate-700 text-xs mb-1">Secciones Incluidas</label>
              {[
                { label: 'Diagnóstico & Códigos CIE-10/DSM-5', state: includeDiagnosis, set: setIncludeDiagnosis },
                { label: 'Evolución Psicoterapéutica SOAP', state: includeNarratives, set: setIncludeNarratives },
                { label: 'Cumplimiento de Objetivos', state: includeGoals, set: setIncludeGoals },
                { label: 'Firma y Sello Registro Senescyt', state: includeSignature, set: setIncludeSignature },
              ].map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => item.set(!item.state)}
                  className="flex items-center gap-2.5 cursor-pointer p-2 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  {item.state ? (
                    <CheckSquare className="w-4 h-4 text-[#620092] shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-300 shrink-0" />
                  )}
                  <span className={`text-xs ${item.state ? 'font-bold text-[#2D2832]' : 'text-slate-500'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Custom Therapist Conclusions */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block font-bold text-slate-700 text-xs mb-1">Conclusión del Terapeuta</label>
              <textarea
                rows={4}
                value={therapistConclusions}
                onChange={e => setTherapistConclusions(e.target.value)}
                className="w-full p-2.5 bg-[#F8F9FA] border border-slate-200 rounded-xl text-xs text-[#2D2832] focus:ring-2 focus:ring-[#620092]/30 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Right PDF Sheet Live Preview */}
        <div className="lg:col-span-8 flex justify-center">
          <div id="pdf-report-sheet" className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-300 shadow-2xl max-w-2xl w-full text-[#2D2832] space-y-6 relative overflow-hidden font-sans">
            {/* Header / Watermark */}
            <div className="flex items-start justify-between border-b-2 border-[#2D2832] pb-5">
              <div className="flex items-center gap-3">
<button
            onClick={() => setIsInformeFinalModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#620092] hover:bg-[#4E0075] text-white font-extrabold text-xs rounded-xl shadow-md shadow-[#620092]/30 transition-all cursor-pointer active:scale-95"
          >
            <FileCheck2 className="w-4 h-4 text-[#FFCD69]" />
            <span>Informe Final Unificado (Consolidado)</span>
          </button>
                <div className="w-12 h-12 rounded-2xl bg-[#620092] text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
                  uk
                </div>
                <div>
                  <h1 className="text-2xl font-black text-[#2D2832] tracking-tight">ukiana</h1>
                  <p className="text-[11px] text-slate-500 font-medium">Consultorio de Psicología Clínica & Salud Mental</p>
                </div>
              </div>
              <div className="text-right text-xs">
                <p className="font-bold text-[#2D2832]">{doctorName}</p>
                <p className="text-slate-500 text-[11px]">{doctorRole}</p>
                <p className="text-[#620092] font-mono font-bold text-[10px]">{senescytNumber}</p>
              </div>
            </div>

            {/* Document Title Banner */}
            <div className="text-center space-y-1 py-2 bg-[#F8F0FC] rounded-2xl border border-[#E6D2F3]">
              <h2 className="text-base font-extrabold text-[#620092] uppercase tracking-wider">{reportTitle}</h2>
              <p className="text-[11px] text-slate-600 font-medium">Periodo Evaluado: {reportPeriod}</p>
            </div>

            {/* Patient Meta Block */}
            <div className="grid grid-cols-2 gap-4 bg-[#F8F9FA] p-4 rounded-2xl border border-slate-200/80 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Paciente</span>
                <strong className="text-sm text-[#2D2832]">{selectedPatient?.fullName}</strong>
                <p className="text-slate-500 text-[11px]">{selectedPatient?.age} años · {selectedPatient?.occupation}</p>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Fecha de Emisión</span>
                <strong className="text-xs text-[#2D2832]">{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</strong>
                <p className="text-[#0E7CB5] font-semibold text-[11px]">Expediente N° #{selectedPatient?.id}</p>
              </div>
            </div>

            {/* Section 1: Diagnosis */}
            {includeDiagnosis && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#620092] uppercase tracking-wider border-b border-[#E6D2F3] pb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#620092]" />
                  1. Juicio Diagnóstico Sanitario
                </h3>
                <div className="p-3 bg-[#F8F9FA] rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#2D2832]">{selectedPatient?.primaryDiagnosis}</span>
                    <p className="text-slate-500 text-[11px]">Nivel de Riesgo Evaluado: {selectedPatient?.riskLevel}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-[#620092] text-white rounded-lg font-mono font-bold text-xs">
                    {selectedPatient?.icd10Code}
                  </span>
                </div>
              </div>
            )}

            {/* Section 2: SOAP Narratives */}
            {includeNarratives && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#620092] uppercase tracking-wider border-b border-[#E6D2F3] pb-1 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#620092]" />
                  2. Resumen de Evolución Psicoterapéutica
                </h3>
                <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
                  {patientNotes.slice(0, 2).map((note, idx) => (
                    <div key={idx} className="p-3 bg-[#F8F9FA] rounded-xl border border-slate-100 space-y-1">
                      <span className="font-bold text-[#2D2832] block text-[11px]">
                        Sesión #{note.sessionNumber} ({note.date}):
                      </span>
                      <p className="text-[11px] text-slate-600">{note.subjective}</p>
                      <p className="text-[11px] text-[#2D2832] font-medium">Evaluación: {note.assessment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 3: Objectives */}
            {includeGoals && treatmentPlan && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-[#620092] uppercase tracking-wider border-b border-[#E6D2F3] pb-1 flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-[#620092]" />
                  3. Cumplimiento de Objetivos Terapéuticos
                </h3>
                <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                  {treatmentPlan.specificGoals.map(g => (
                    <div key={g.id} className="flex items-center justify-between p-2 rounded-lg bg-[#F8F9FA] border border-slate-100">
                      <span className={g.completed ? 'line-through text-slate-400 font-medium' : 'font-semibold text-[#2D2832]'}>
                        {g.description}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${g.completed ? 'bg-[#EBF7FC] text-[#0E7CB5] border border-[#BDE3F5]' : 'bg-[#FFF8E7] text-[#5C4E00] border border-[#FFE7A8]'}`}>
                        {g.completed ? 'Conseguido' : 'En Curso'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 4: Therapist Conclusions */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-[#620092] uppercase tracking-wider border-b border-[#E6D2F3] pb-1">
                4. Conclusión & Recomendaciones Clínicas
              </h3>
              <p className="text-xs text-slate-800 leading-relaxed bg-[#F8F9FA] p-4 rounded-xl border border-slate-200 font-medium">
                {therapistConclusions}
              </p>
            </div>

            {/* Section 5: Official Signature */}
            {includeSignature && (
              <div className="pt-8 border-t border-slate-200 flex justify-between items-end text-xs">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 font-medium">Sello Oficial de Clínica Ukiana</p>
                  <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-[#620092]/40 flex items-center justify-center text-[10px] font-bold text-[#620092] bg-[#F8F0FC]">
                    SELLO SANITARIO
                  </div>
                </div>

                <div className="text-center space-y-1">
                  <div className="w-48 h-12 border-b border-slate-400 flex items-center justify-center font-serif text-slate-700 italic">
                    {doctorName}
                  </div>
                  <p className="font-bold text-[#2D2832] text-xs">Firma del Facultativo Sanitario</p>
                  <p className="text-[10px] text-slate-500 font-mono">{senescytNumber}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
          {isInformeFinalModalOpen && selectedPatient && (
        <InformeFinalTratamientoPdfModal
          patient={selectedPatient}
          notes={patientNotes}
          treatmentPlan={treatmentPlan}
          onClose={() => setIsInformeFinalModalOpen(false)}
        />
      )}

      {noteForPdf && selectedPatient && (
        <HojaSeguimientoPdfModal
          note={noteForPdf}
          patient={selectedPatient}
          onClose={() => setNoteForPdf(null)}
        />
      )}

      {isBlankHojaModalOpen && (
        <HojaSeguimientoPdfModal
          isBlank={true}
          onClose={() => setIsBlankHojaModalOpen(false)}
        />
      )}
    </div>
  );
};
