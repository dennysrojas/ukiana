import React, { useState } from 'react';
import { 
  BookOpen, 
  Search, 
  Share2, 
  FileText, 
  Headphones, 
  X,
  Download,
  Printer
} from 'lucide-react';
import { PsychoResource, Patient } from '../../types';
import { EntrevistaBlancoPdfModal } from '../interview/EntrevistaBlancoPdfModal';
import { HojaSeguimientoPdfModal } from '../notes/HojaSeguimientoPdfModal';

interface ResourceLibraryViewProps {
  resources: PsychoResource[];
  patients: Patient[];
  onAssignResource: (resourceId: string, patientId: string) => void;
}

export const ResourceLibraryView: React.FC<ResourceLibraryViewProps> = ({
  resources,
  patients,
  onAssignResource
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [assigningResource, setAssigningResource] = useState<PsychoResource | null>(null);
  const [selectedPatientForAssign, setSelectedPatientForAssign] = useState<string>(patients[0]?.id || '');
  const [isBlankModalOpen, setIsBlankModalOpen] = useState(false);
  const [isBlankHojaSeguimientoModalOpen, setIsBlankHojaSeguimientoModalOpen] = useState(false);

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const filteredResources = resources.filter(res => {
    const matchesCategory = selectedCategory === 'Todas' || res.category === selectedCategory;
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          res.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const triggerToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assigningResource) return;
    const patientObj = patients.find(p => p.id === selectedPatientForAssign);
    onAssignResource(assigningResource.id, selectedPatientForAssign);
    triggerToast(`Recurso "${assigningResource.title}" asignado a ${patientObj?.fullName || 'paciente'}.`);
    setAssigningResource(null);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-[#2D2832] flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#620092]" />
            Biblioteca de Recursos Psicoeducativos
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Materiales, formatos de evaluación clínica en blanco e imprimibles oficializados para consulta presencial y asignación
          </p>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
          {['Todas', 'Formatos Clínicos', 'Respiración', 'Registro Cognitivo', 'Mindfulness', 'Lecturas'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#2D2832] text-white font-bold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar material..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#620092]/30 text-[#2D2832]"
          />
        </div>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(res => {
          const isBlankInterview = res.id === 'res-blank-interview';
          const isBlankHojaSeguimiento = res.id === 'res-blank-hoja-seguimiento';
          const isSpecialBlankForm = isBlankInterview || isBlankHojaSeguimiento;

          return (
            <div
              key={res.id}
              className={`bg-white rounded-3xl border ${isSpecialBlankForm ? 'border-[#620092]/40 ring-2 ring-[#F8F0FC]' : 'border-slate-200/80'} overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group`}
            >
              <div>
                {/* Image Header */}
                <div className="h-44 relative overflow-hidden bg-slate-100">
                  <img
                    src={res.thumbnailUrl}
                    alt={res.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold ${isSpecialBlankForm ? 'bg-[#620092] text-white' : 'bg-[#1E1B24]/90 text-white'} backdrop-blur-md`}>
                    {res.category}
                  </span>
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 text-[#2D2832] flex items-center gap-1 shadow-sm">
                    {res.type === 'Audio' ? <Headphones className="w-3 h-3 text-[#620092]" /> : <FileText className="w-3 h-3 text-[#620092]" />}
                    {res.type} ({res.estimatedMinutes} min)
                  </span>
                </div>

                {/* Resource Content */}
                <div className="p-5 space-y-2">
                  <h3 className="text-sm font-extrabold text-[#2D2832] group-hover:text-[#620092] transition-colors">
                    {res.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 font-medium">
                    {res.description}
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-5 pt-0 flex flex-wrap items-center justify-between gap-2 text-xs border-t border-slate-100 mt-3">
                <span className="text-[11px] text-slate-400 font-semibold">
                  {res.downloadsCount || 0} descargas
                </span>

                <div className="flex items-center gap-2">
                  {isBlankInterview && (
                    <button
                      onClick={() => setIsBlankModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#620092] hover:bg-[#4E0075] text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 text-[11px]"
                      title="Descargar o imprimir formato en blanco para consulta presencial"
                    >
                      <Download className="w-3.5 h-3.5 text-[#FFCD69]" />
                      <span>Descargar Formato</span>
                    </button>
                  )}

                  {isBlankHojaSeguimiento && (
                    <button
                      onClick={() => setIsBlankHojaSeguimientoModalOpen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#620092] hover:bg-[#4E0075] text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer active:scale-95 text-[11px]"
                      title="Descargar o imprimir Hoja de Seguimiento en Blanco (Renglones 8mm)"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#FFCD69]" />
                      <span>Descargar Formato</span>
                    </button>
                  )}

                  {!isSpecialBlankForm && (
                    <button
                      onClick={() => setAssigningResource(res)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors shadow-xs cursor-pointer text-[11px]"
                    >
                      <Share2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Asignar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Entrevista Inicial en Blanco */}
      {isBlankModalOpen && (
        <EntrevistaBlancoPdfModal
          onClose={() => setIsBlankModalOpen(false)}
        />
      )}

      {/* Modal Hoja de Seguimiento en Blanco */}
      {isBlankHojaSeguimientoModalOpen && (
        <HojaSeguimientoPdfModal
          isBlank={true}
          onClose={() => setIsBlankHojaSeguimientoModalOpen(false)}
        />
      )}

      {/* Assign Resource Modal */}
      {assigningResource && (
        <div className="fixed inset-0 bg-[#1E1B24]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <form onSubmit={handleAssignSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-[#2D2832]">Asignar Recurso Psicoeducativo</h3>
              <button
                type="button"
                onClick={() => setAssigningResource(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-[#F8F0FC] rounded-2xl border border-[#E6D2F3] text-xs">
              <span className="font-bold text-[#620092] block">{assigningResource.title}</span>
              <p className="text-slate-600 text-[11px] mt-0.5 font-medium">{assigningResource.category} · {assigningResource.type}</p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block font-bold text-[#2D2832]">Seleccionar Paciente Destinatario</label>
              <select
                value={selectedPatientForAssign}
                onChange={e => setSelectedPatientForAssign(e.target.value)}
                className="w-full p-2.5 bg-[#F8F9FA] border border-slate-200 rounded-xl text-[#2D2832] font-bold"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.fullName} ({p.primaryDiagnosis})</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAssigningResource(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#620092] hover:bg-[#4E0075] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
              >
                Enviar al Portal del Paciente
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
