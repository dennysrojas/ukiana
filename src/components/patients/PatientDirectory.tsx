import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  User, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight,
  FileText
} from 'lucide-react';
import { Patient, PatientStatus, RiskLevel } from '../../types';

interface PatientDirectoryProps {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (patientId: string) => void;
  onOpenNewPatientModal: () => void;
  filterQuery: string;
}

export const PatientDirectory: React.FC<PatientDirectoryProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  onOpenNewPatientModal,
  filterQuery
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('Todos');
  const [riskFilter, setRiskFilter] = useState<string>('Todos');
  const [localSearch, setLocalSearch] = useState<string>('');

  const query = filterQuery || localSearch;

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.fullName.toLowerCase().includes(query.toLowerCase()) ||
      patient.primaryDiagnosis.toLowerCase().includes(query.toLowerCase()) ||
      patient.icd10Code.toLowerCase().includes(query.toLowerCase()) ||
      patient.phone.includes(query);

    const matchesStatus = statusFilter === 'Todos' || patient.status === statusFilter;
    const matchesRisk = riskFilter === 'Todos' || patient.riskLevel === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  const getRiskBadge = (level: RiskLevel) => {
    switch (level) {
      case 'Crítico':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-rose-600" /> Riesgo Crítico</span>;
      case 'Elevado':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFF8E7] text-[#5C4E00] border border-[#FFE7A8] flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-[#5C4E00]" /> Riesgo Elevado</span>;
      case 'Moderado':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#EBF7FC] text-[#0E7CB5] border border-[#BDE3F5]">Riesgo Moderado</span>;
      case 'Bajo':
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#F8F0FC] text-[#620092] border border-[#E6D2F3]">Riesgo Bajo</span>;
    }
  };

  const getStatusBadge = (status: PatientStatus) => {
    switch (status) {
      case 'En Crisis':
        return <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" title="En Crisis"></span>;
      case 'Activo':
        return <span className="w-2.5 h-2.5 rounded-full bg-[#50B3E5]" title="Activo"></span>;
      case 'En Pausa':
        return <span className="w-2.5 h-2.5 rounded-full bg-[#FFCD69]" title="En Pausa"></span>;
      case 'Alta Clínica':
        return <span className="w-2.5 h-2.5 rounded-full bg-slate-400" title="Alta Clínica"></span>;
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header & Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-[#2D2832] tracking-tight flex items-center gap-2">
            Directorio de Pacientes
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F8F0FC] text-[#620092] border border-[#E6D2F3]">
              {filteredPatients.length} pacientes
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Gestión de expedientes clínicos, adherencia y seguimiento terapéutico
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600">
            {['Todos', 'Activo', 'En Crisis', 'En Pausa'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === st
                    ? 'bg-[#620092] text-white font-bold shadow-xs'
                    : 'hover:text-[#2D2832]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            id="btn-dir-new-patient"
            onClick={onOpenNewPatientModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#620092] hover:bg-[#4E0075] text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Paciente</span>
          </button>
        </div>
      </div>

      {/* Local Search and Secondary Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, diagnóstico..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-[#620092]/20 focus:border-[#620092] text-[#2D2832]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 w-full md:w-auto justify-end">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-medium">Filtrar Riesgo:</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-[#2D2832] focus:outline-hidden font-semibold"
          >
            <option value="Todos">Todos los niveles</option>
            <option value="Bajo">Bajo</option>
            <option value="Moderado">Moderado</option>
            <option value="Elevado">Elevado</option>
            <option value="Crítico">Crítico</option>
          </select>
        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPatients.map(patient => {
          const isSelected = patient.id === selectedPatientId;
          return (
            <div
              key={patient.id}
              id={`patient-card-${patient.id}`}
              onClick={() => onSelectPatient(patient.id)}
              className={`bg-white rounded-2xl p-5 border transition-all duration-200 cursor-pointer relative group flex flex-col justify-between hover:shadow-lg ${
                isSelected
                  ? 'border-[#620092] ring-2 ring-[#620092]/20 shadow-md'
                  : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div>
                {/* Card Top Header */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={patient.avatar}
                        alt={patient.fullName}
                        className="w-13 h-13 rounded-2xl object-cover ring-2 ring-slate-100"
                      />
                      <span className="absolute -top-1 -right-1 flex items-center justify-center">
                        {getStatusBadge(patient.status)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#2D2832] group-hover:text-[#620092] transition-colors flex items-center gap-1.5">
                        {patient.fullName}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        {patient.age} años · {patient.occupation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Primary Diagnosis & Risk Badge */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 truncate max-w-[200px]" title={patient.primaryDiagnosis}>
                      {patient.primaryDiagnosis}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-bold">
                      {patient.icd10Code}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {getRiskBadge(patient.riskLevel)}
                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#0E7CB5]" />
                      {patient.adherenceRate}% Adherencia
                    </span>
                  </div>
                </div>

                {/* Patient Quick Stats */}
                <div className="grid grid-cols-2 gap-2 bg-[#F8F9FA] p-3 rounded-xl border border-slate-200/60 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Sesiones Totales</span>
                    <span className="text-[#2D2832] font-extrabold flex items-center gap-1 mt-0.5">
                      <FileText className="w-3.5 h-3.5 text-[#620092]" />
                      {patient.totalSessions} Sesiones
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Última Cita</span>
                    <span className="text-[#2D2832] font-bold truncate block mt-0.5">
                      {patient.lastSessionDate}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer Action */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#620092] group-hover:text-[#4E0075]">
                <span>Ver Ficha Clínica</span>
                <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-[#620092]" />
              </div>
            </div>
          );
        })}
      </div>

      {filteredPatients.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
          <User className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-[#2D2832]">No se encontraron pacientes</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Prueba a cambiar el filtro de búsqueda o agrega un nuevo paciente al directorio.
          </p>
          <button
            onClick={onOpenNewPatientModal}
            className="px-4 py-2 bg-[#620092] hover:bg-[#4E0075] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
          >
            Registrar Paciente
          </button>
        </div>
      )}
    </div>
  );
};

