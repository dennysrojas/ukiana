import React, { useState } from 'react';
import { X, Download, Printer, FileText, Sparkles } from 'lucide-react';
import { EntrevistaBlancoPdfTemplate } from './EntrevistaBlancoPdfTemplate';
import { printClinicalDocument, downloadClinicalPdf } from '../../services/pdfService';

interface EntrevistaBlancoPdfModalProps {
  onClose: () => void;
  therapistName?: string;
  therapistLicense?: string;
}

export const EntrevistaBlancoPdfModal: React.FC<EntrevistaBlancoPdfModalProps> = ({
  onClose,
  therapistName = 'Dr. Alejandro Reyes',
  therapistLicense = 'Senescyt N° 1005-2024-2849102'
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    showToast('Generando plantilla de entrevista en blanco...');

    const fileName = 'Plantilla_Entrevista_Inicial_Blanco_Ukiana.pdf';

    try {
      await downloadClinicalPdf('blank-interview-pdf-document', fileName);
      showToast('¡Plantilla PDF en blanco descargada con éxito!');
    } catch (err: any) {
      console.warn('Canvas no disponible, usando impresión directa:', err);
      showToast('Abriendo visor para guardar como PDF...');
      printClinicalDocument('blank-interview-pdf-document');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    showToast('Enviando formato en blanco a la impresora...');
    printClinicalDocument('blank-interview-pdf-document');
  };

  return (
    <div className="fixed inset-0 bg-[#1E1B24]/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-50 animate-fadeIn font-sans">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 bg-[#1E1B24] text-white px-5 py-3 rounded-2xl shadow-2xl z-50 text-xs font-bold animate-bounce flex items-center gap-2 border border-[#322B3D]">
          <Sparkles className="w-4 h-4 text-[#FFCD69]" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="bg-white rounded-3xl max-w-5xl w-full h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:px-6 bg-[#F8F9FA] border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#F8F0FC] text-[#620092]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#2D2832]">
                Formato Imprimible: Entrevista Inicial Clínica (En Blanco)
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Plantilla oficial de 7 secciones con líneas y casillas pautadas para llenado a mano
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs active:scale-95"
              title="Imprimir formato para consulta presencial"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Imprimir Formato</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="px-4 py-2 bg-[#620092] hover:bg-[#4E0075] disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md shadow-[#620092]/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>{isGenerating ? 'Generando PDF...' : 'Descargar PDF en Blanco'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable PDF View Container */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-4 sm:p-8">
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden mx-auto max-w-4xl">
            <EntrevistaBlancoPdfTemplate
              therapistName={therapistName}
              therapistLicense={therapistLicense}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
