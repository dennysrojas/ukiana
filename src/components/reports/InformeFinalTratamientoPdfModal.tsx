import React, { useState } from 'react';
import { X, Printer, Download, CheckCircle2, FileCheck2 } from 'lucide-react';
import { Patient, ClinicalNote, TreatmentPlan } from '../../types';
import { InformeFinalTratamientoPdfTemplate } from './InformeFinalTratamientoPdfTemplate';
import { useAuth } from '../../context/AuthContext';
import { printClinicalDocument, downloadClinicalPdf } from '../../services/pdfService';

interface InformeFinalTratamientoPdfModalProps {
  patient: Patient;
  notes: ClinicalNote[];
  treatmentPlan?: TreatmentPlan;
  onClose: () => void;
}

export const InformeFinalTratamientoPdfModal: React.FC<InformeFinalTratamientoPdfModalProps> = ({
  patient,
  notes,
  treatmentPlan,
  onClose
}) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [conclusions, setConclusions] = useState(
    `El paciente ${patient.fullName} ha completado exitosamente el ciclo psicoterapéutico planificado de ${notes.length} sesiones, logrando una remisión significativa de los síntomas de ${patient.primaryDiagnosis || 'ingreso'} y mostrando una adecuada consolidación de herramientas cognitivas y conductuales.`
  );

  const [recommendations, setRecommendations] = useState(
    '1. Mantener las prácticas de regulación emocional y autoregistro aprendidas. 2. Realizar sesión de seguimiento de control en 60 días o a demanda del paciente.'
  );

  const therapistName = user?.name || 'Dr. Alejandro Reyes';
  const senescytNumber = user?.senescytNumber || user?.collegeNumber || 'Senescyt N° 1005-2024-2849102';

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    const sanitizedName = (patient.fullName || 'Paciente').replace(/\s+/g, '_');
    const fileName = `Informe_Final_Tratamiento_${sanitizedName}_Ukiana.pdf`;

    try {
      await downloadClinicalPdf('informe-final-pdf-content', fileName);
      setToastMessage('Informe Final PDF descargado exitosamente');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.warn('Fallo al descargar canvas, ejecutando impresion:', err);
      printClinicalDocument('informe-final-pdf-content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    printClinicalDocument('informe-final-pdf-content');
  };

  return (
    <div className="fixed inset-0 bg-[#1E1B24]/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header */}
        <div className="p-4 px-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#620092] text-white flex items-center justify-center font-extrabold shadow-md">
              <FileCheck2 className="w-5 h-5 text-[#FFCD69]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">
                Informe Final Unificado de Tratamiento Psicológico
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                Paciente: <strong className="text-white">{patient.fullName}</strong> ({notes.length} sesiones consolidadas)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#50B3E5]" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#620092] hover:bg-[#4E0075] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-[#FFCD69]" />
              <span>{isGenerating ? 'Generando PDF...' : 'Descargar PDF Unificado'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content View with Editors & Document */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 space-y-6">
          {/* Quick Editors Box */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
            <h4 className="font-extrabold text-[#620092] uppercase text-xs">Ajustes de Conclusión de Alta & Recomendaciones</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Síntesis Clínica y Conclusión Final de Alta:</label>
                <textarea
                  rows={2}
                  value={conclusions}
                  onChange={e => setConclusions(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-800"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Recomendaciones de Prevención de Recaídas:</label>
                <textarea
                  rows={2}
                  value={recommendations}
                  onChange={e => setRecommendations(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-xs text-slate-800"
                />
              </div>
            </div>
          </div>

          {/* Render Document */}
          <InformeFinalTratamientoPdfTemplate
            patient={patient}
            notes={notes}
            treatmentPlan={treatmentPlan}
            therapistName={therapistName}
            senescytNumber={senescytNumber}
            conclusions={conclusions}
            recommendations={recommendations}
          />
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute bottom-4 right-4 bg-[#1E1B24] text-white px-4 py-2.5 rounded-xl text-xs font-bold border border-[#620092] shadow-xl flex items-center gap-2 animate-slideUp">
            <CheckCircle2 className="w-4 h-4 text-[#50B3E5]" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
