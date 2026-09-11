import React, { useState } from 'react';
import { 
  FileCheck, 
  ShieldCheck, 
  Send, 
  UploadCloud, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Eye, 
  RefreshCw,
  Search,
  Download,
  X
} from 'lucide-react';
import { LegalDocumentItem, Patient } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface LegalDocumentsViewProps {
  legalDocuments: LegalDocumentItem[];
  patients: Patient[];
  onUploadDocument: (newDoc: LegalDocumentItem) => void;
  onSendReminder: (docId: string) => void;
}

export const LegalDocumentsView: React.FC<LegalDocumentsViewProps> = ({
  legalDocuments,
  patients,
  onUploadDocument,
  onSendReminder
}) => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDocPreview, setSelectedDocPreview] = useState<LegalDocumentItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Upload Form states
  const [uploadPatientId, setUploadPatientId] = useState<string>(patients[0]?.id || '');
  const [uploadType, setUploadType] = useState<LegalDocumentItem['documentType']>('Consentimiento Informado');
  const [fileName, setFileName] = useState<string>('');

  const filteredDocs = legalDocuments.filter(doc => {
    const matchesStatus = statusFilter === 'Todos' || doc.status === statusFilter;
    const matchesSearch = doc.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.documentType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const triggerNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleResend = (doc: LegalDocumentItem) => {
    onSendReminder(doc.id);
    triggerNotification(`Recordatorio de firma enviado a ${doc.patientName} por WhatsApp y Email.`);
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patientObj = patients.find(p => p.id === uploadPatientId);
    if (!patientObj) return;

    const newDoc: LegalDocumentItem = {
      id: `doc-${Date.now()}`,
      patientId: patientObj.id,
      patientName: patientObj.fullName,
      documentType: uploadType,
      status: 'Firmado',
      signedDate: `${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} h`,
      sentDate: new Date().toISOString().split('T')[0],
      fileUrl: '#',
      version: 'v2.4 - Escaneado Físico'
    };

    onUploadDocument(newDoc);
    setShowUploadModal(false);
    triggerNotification(`Documento "${uploadType}" adjuntado con éxito para ${patientObj.fullName}.`);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      {notificationMsg && (
        <div className="fixed bottom-6 right-6 bg-[#1E1B24] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#322B3D] z-50 flex items-center gap-3 text-xs font-medium animate-bounce">
          <ShieldCheck className="w-4 h-4 text-[#50B3E5]" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-[#2D2832] flex items-center gap-2">
            <FileCheck className="w-6 h-6 text-[#620092]" />
            Documentación Legal & RGPD
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Gestión de consentimientos informados, protección de datos LOPDGDD y acuerdos de honorarios
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#620092] hover:bg-[#4E0075] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <UploadCloud className="w-4 h-4 text-white" />
          <span>Adjuntar Consentimiento</span>
        </button>
      </div>

      {/* Controls & Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-1.5 text-xs font-medium">
          {['Todos', 'Firmado', 'Pendiente', 'Sin Archivo'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                statusFilter === st
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por paciente o tipo..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-teal-500/30"
          />
        </div>
      </div>

      {/* Documents Table / Grid */}
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-6 py-3.5">Paciente</th>
                <th className="px-6 py-3.5">Tipo de Documento</th>
                <th className="px-6 py-3.5">Estado Legal</th>
                <th className="px-6 py-3.5">Versión / Fecha</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {doc.patientName}
                  </td>
                  <td className="px-6 py-4 font-semibold text-slate-800">
                    <span className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-600" />
                      {doc.documentType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {doc.status === 'Firmado' && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Firmado Digitalmente
                      </span>
                    )}
                    {doc.status === 'Pendiente' && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-600" /> Pendiente de Firma
                      </span>
                    )}
                    {doc.status === 'Sin Archivo' && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Sin Documento
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-[11px]">
                    <div>{doc.version}</div>
                    <div className="font-medium text-slate-700">{doc.signedDate || `Enviado: ${doc.sentDate || 'N/A'}`}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedDocPreview(doc)}
                        className="p-1.5 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Previsualizar Documento"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {doc.status !== 'Firmado' && (
                        <button
                          onClick={() => handleResend(doc)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Reenviar Enlace</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document Preview Modal */}
      {selectedDocPreview && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">Previsualización de Documento Legal</h3>
              </div>
              <button
                onClick={() => setSelectedDocPreview(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4 font-serif text-slate-800 text-xs leading-relaxed max-h-96 overflow-y-auto">
              <div className="text-center font-sans space-y-1 mb-4 border-b border-slate-200 pb-3">
                <h4 className="font-bold text-sm text-slate-900">{selectedDocPreview.documentType.toUpperCase()}</h4>
                <p className="text-[11px] text-slate-500">Clínica Psicológica Ukiana · Reg. Sanitario N° 48910</p>
              </div>

              <p>
                Por el presente documento, el paciente <strong className="font-sans">{selectedDocPreview.patientName}</strong> declara haber recibido información suficiente y clara respecto a los objetivos del tratamiento psicológico, los límites de la confidencialidad según lo previsto en el artículo 40 del Código Deontológico del Psicólogo y la Ley Orgánica de Protección de Datos Personales (LOPDGDD 3/2018).
              </p>

              <p>
                <strong>Confidencialidad:</strong> Toda la información revelada durante las sesiones está sujeta a secreto profesional estricto, salvo imperativo legal o riesgo inminente para la vida del propio paciente o de terceros.
              </p>

              <div className="pt-4 border-t border-slate-200 flex justify-between items-end font-sans text-[11px]">
                <div>
                  <p className="font-bold text-slate-900">Firma del Paciente:</p>
                  <p className="text-teal-700 font-mono font-semibold mt-1">
                    {selectedDocPreview.status === 'Firmado' ? `[Firma Digital Verificada - ${selectedDocPreview.signedDate}]` : '[Pendiente de firma]'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-900">{user?.name || 'Dr. Alejandro Reyes'}</p>
                  <p className="text-slate-500 font-mono text-[10px]">{user?.senescytNumber || user?.collegeNumber || 'Senescyt N° 1005-2024-2849102'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedDocPreview(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  triggerNotification('Descargando copia legal firmada en PDF...');
                  setSelectedDocPreview(null);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Descargar PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Document Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <form onSubmit={handleUploadSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Adjuntar Documento Escaneado</h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Seleccionar Paciente</label>
                <select
                  value={uploadPatientId}
                  onChange={e => setUploadPatientId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.fullName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tipo de Documento</label>
                <select
                  value={uploadType}
                  onChange={e => setUploadType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                >
                  <option value="Consentimiento Informado">Consentimiento Informado</option>
                  <option value="Protección de Datos RGPD">Protección de Datos RGPD</option>
                  <option value="Contrato de Terapia">Contrato de Terapia</option>
                  <option value="Acuerdo de Honorarios">Acuerdo de Honorarios</option>
                </select>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center space-y-2 hover:border-teal-500 transition-colors bg-slate-50/50 cursor-pointer">
                <UploadCloud className="w-8 h-8 text-teal-600 mx-auto" />
                <p className="font-semibold text-slate-700">Arrastra tu archivo PDF o escaneado aquí</p>
                <p className="text-[11px] text-slate-400">Formatos admitidos: PDF, JPG, PNG (Máx 15MB)</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs"
              >
                Guardar Documento
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
