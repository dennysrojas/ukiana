import React, { useState } from 'react';
import { X, Printer, Download, CheckCircle2, FileCheck2 } from 'lucide-react';
import { ClinicalNote, Patient } from '../../types';
import { HojaSeguimientoPdfTemplate } from './HojaSeguimientoPdfTemplate';
import { useAuth } from '../../context/AuthContext';
import { printClinicalDocument, downloadClinicalPdf } from '../../services/pdfService';

interface HojaSeguimientoPdfModalProps {
  note?: ClinicalNote;
  patient?: Patient;
  isBlank?: boolean;
  onClose: () => void;
}

export const HojaSeguimientoPdfModal: React.FC<HojaSeguimientoPdfModalProps> = ({
  note,
  patient,
  isBlank = false,
  onClose
}) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const therapistName = user?.name || 'Dr. Alejandro Reyes';
  const senescytNumber = user?.senescytNumber || user?.collegeNumber || 'Senescyt N° 1005-2024-2849102';

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    const fileName = isBlank
      ? 'Certificado_Evaluacion_Hoja_Seguimiento_Ukiana_En_Blanco.pdf'
      : `Certificado_Evaluacion_Sesion_${note?.sessionNumber || 1}_${patient?.fullName?.replace(/\s+/g, '_') || 'Paciente'}.pdf`;

    try {
      await downloadClinicalPdf('hoja-seguimiento-pdf-content', fileName);
      setToastMessage('Certificado / Hoja de Seguimiento descargado exitosamente');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.warn('Fallo al descargar canvas, usando impresión vectorial:', err);
      printClinicalDocument('hoja-seguimiento-pdf-content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    printClinicalDocument('hoja-seguimiento-pdf-content');
  };

  return (
    <div className="fixed inset-0 bg-[#1E1B24]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fadeIn font-sans">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Top Header */}
        <div className="p-4 px-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#620092] flex items-center justify-center font-black text-sm text-white shadow-xs">
              uk
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <span>{isBlank ? 'Formato Imprimible (En Blanco) · Hoja de Seguimiento' : `Certificado de Evaluación · Sesión N° ${note?.sessionNumber || 1}`}</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] text-[#FFCD69] font-mono border border-slate-700">
                  UK-HSP-2026
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 font-medium">
                {isBlank ? 'Plantilla oficial de 7 secciones con espaciado de 7.8mm para consulta física' : `${patient?.fullName || 'Paciente'} (Doc: ${patient?.idNumber || 'S/D'})`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-700"
              title="Imprimir formato con márgenes de 12mm y alta nitidez"
            >
              <Printer className="w-4 h-4 text-[#50B3E5]" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#620092] hover:bg-[#4E0075] text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-[#620092]/30 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <Download className="w-4 h-4 text-[#FFCD69]" />
              <span>{isGenerating ? 'Generando PDF...' : 'Descargar PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/90">
          <HojaSeguimientoPdfTemplate
            note={note}
            patient={patient}
            therapistName={therapistName}
            senescytNumber={senescytNumber}
            isBlank={isBlank}
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
