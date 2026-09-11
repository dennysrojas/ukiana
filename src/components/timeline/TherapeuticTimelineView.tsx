import React, { useState } from 'react';
import { 
  GitCommit, 
  Plus, 
  Calendar, 
  AlertTriangle, 
  FileText, 
  Pill, 
  Award, 
  Search,
  CheckCircle,
  Tag
} from 'lucide-react';
import { TimelineItem, TimelineCategory, Patient } from '../../types';

interface TherapeuticTimelineViewProps {
  timelineItems: TimelineItem[];
  patient: Patient;
  onAddTimelineItem: (item: Omit<TimelineItem, 'id'>) => void;
}

export const TherapeuticTimelineView: React.FC<TherapeuticTimelineViewProps> = ({
  timelineItems,
  patient,
  onAddTimelineItem
}) => {
  if (!patient) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200 font-sans">
        No se encontró información del paciente.
      </div>
    );
  }

  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TimelineCategory>('Sesiones');
  const [newDescription, setNewDescription] = useState('');
  const [newSeverity, setNewSeverity] = useState<'Baja' | 'Media' | 'Alta'>('Baja');

  const filteredItems = timelineItems.filter(item => {
    const matchesPatient = item.patientId === patient.id;
    const matchesCategory = selectedCategory === 'Todas' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPatient && matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (category: TimelineCategory) => {
    switch (category) {
      case 'Crisis':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'Medicación':
        return <Pill className="w-4 h-4 text-[#5C4E00]" />;
      case 'Evaluaciones':
        return <Award className="w-4 h-4 text-[#620092]" />;
      case 'Legal':
        return <CheckCircle className="w-4 h-4 text-[#0E7CB5]" />;
      case 'Sesiones':
      default:
        return <FileText className="w-4 h-4 text-[#620092]" />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDescription) return;

    onAddTimelineItem({
      patientId: patient.id,
      date: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }),
      title: newTitle,
      category: newCategory,
      description: newDescription,
      author: 'Dr. Alejandro Reyes',
      severity: newSeverity,
      tags: [newCategory, 'Manual']
    });

    setNewTitle('');
    setNewDescription('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-[#2D2832] flex items-center gap-2">
            <GitCommit className="w-6 h-6 text-[#620092]" />
            Línea de Tiempo Terapéutica
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Historial evolutivo cronológico de <span className="font-bold text-[#2D2832]">{patient.fullName}</span>
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-[#620092] hover:bg-[#4E0075] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Registrar Evento Clínico</span>
        </button>
      </div>

      {/* Add Form Collapsible */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-[#1E1B24] text-slate-200 p-6 rounded-3xl space-y-4 shadow-xl border border-[#322B3D] animate-fadeIn">
          <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
            Nuevo Hito en la Línea de Tiempo
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Título del Evento</label>
              <input
                type="text"
                required
                placeholder="Ej: Cambio de dosis, Episodio de crisis..."
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full p-2.5 bg-[#2D2832] border border-[#3E3747] rounded-xl text-white focus:ring-2 focus:ring-[#620092]"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Categoría</label>
              <select
                value={newCategory}
                onChange={e => setNewCategory(e.target.value as any)}
                className="w-full p-2.5 bg-[#2D2832] border border-[#3E3747] rounded-xl text-white focus:ring-2 focus:ring-[#620092]"
              >
                <option value="Sesiones">Sesiones</option>
                <option value="Crisis">Crisis</option>
                <option value="Medicación">Medicación</option>
                <option value="Evaluaciones">Evaluaciones</option>
                <option value="Legal">Legal</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Severidad / Relevancia</label>
              <select
                value={newSeverity}
                onChange={e => setNewSeverity(e.target.value as any)}
                className="w-full p-2.5 bg-[#2D2832] border border-[#3E3747] rounded-xl text-white focus:ring-2 focus:ring-[#620092]"
              >
                <option value="Baja">Baja</option>
                <option value="Media">Media</option>
                <option value="Alta">Alta (Alerta)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 text-xs font-semibold mb-1">Descripción / Observaciones</label>
            <textarea
              rows={3}
              required
              placeholder="Detalles significativos..."
              value={newDescription}
              onChange={e => setNewDescription(e.target.value)}
              className="w-full p-2.5 bg-[#2D2832] border border-[#3E3747] rounded-xl text-white text-xs focus:ring-2 focus:ring-[#620092]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-[#2D2832] hover:bg-[#3E3747] text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#620092] hover:bg-[#4E0075] text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
            >
              Guardar en Historial
            </button>
          </div>
        </form>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-medium">
          {['Todas', 'Sesiones', 'Crisis', 'Medicación', 'Evaluaciones', 'Legal'].map(cat => (
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
            placeholder="Buscar hito..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-[#620092]/30 text-[#2D2832]"
          />
        </div>
      </div>

      {/* Timeline Nodes Vertical Stack */}
      <div className="relative pl-6 md:pl-8 space-y-6 before:absolute before:left-3 md:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
        {filteredItems.map(item => (
          <div key={item.id} className="relative group">
            {/* Timeline Node Icon */}
            <div className={`absolute -left-6 md:-left-8 top-1.5 w-7 h-7 rounded-full bg-white border-2 flex items-center justify-center shadow-xs z-10 transition-transform group-hover:scale-110 ${
              item.category === 'Crisis' ? 'border-rose-500' :
              item.category === 'Medicación' ? 'border-[#FFCD69]' :
              item.category === 'Evaluaciones' ? 'border-[#50B3E5]' : 'border-[#620092]'
            }`}>
              {getCategoryIcon(item.category)}
            </div>

            {/* Content Box */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-[#620092] bg-[#F8F0FC] px-2.5 py-0.5 rounded-md border border-[#E6D2F3] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#620092]" />
                  {item.date}
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  Por {item.author}
                </span>
              </div>

              <h4 className="text-sm font-extrabold text-[#2D2832]">
                {item.title}
              </h4>

              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {item.description}
              </p>

              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-2">
                  {item.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-semibold flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5 text-slate-400" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

