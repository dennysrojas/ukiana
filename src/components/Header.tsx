import React from 'react';
import { 
  Search, 
  Plus, 
  FilePlus, 
  LogOut
} from 'lucide-react';
import { Patient } from '../types';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  patients: Patient[];
  selectedPatientId: string;
  onSelectPatient: (id: string) => void;
  onOpenNewPatientModal: () => void;
  onOpenNewNoteModal: () => void;
  onOpenProfileModal: () => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  patients,
  selectedPatientId,
  onSelectPatient,
  onOpenNewPatientModal,
  onOpenNewNoteModal,
  onOpenProfileModal,
  globalSearchQuery,
  setGlobalSearchQuery
}) => {
  const { user, logout } = useAuth();
  const currentPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between shrink-0 shadow-xs z-10 font-sans">
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Buscar pacientes, diagnósticos, CIE-10..."
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#620092]/30 focus:border-[#620092] transition-all text-[#2D2832] placeholder-slate-400"
          />
        </div>
      </div>

      {/* Patient Active Context & Quick Actions */}
      <div className="flex items-center gap-3">
        {/* Active Patient Selector */}
        {patients.length > 0 && (
          <div className="hidden lg:flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-xl px-3 py-1.5 transition-colors cursor-pointer">
            <img
              src={currentPatient?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
              alt={currentPatient?.fullName || 'Paciente'}
              className="w-6 h-6 rounded-full object-cover ring-1 ring-[#620092]/40"
            />

            <div className="text-left text-xs">
              <span className="text-slate-400 block text-[10px] leading-tight font-medium">Paciente activo</span>
              <select
                id="header-patient-select"
                value={selectedPatientId}
                onChange={(e) => onSelectPatient(e.target.value)}
                className="bg-transparent text-[#2D2832] font-semibold cursor-pointer focus:outline-hidden pr-2 text-xs"
              >
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.icd10Code})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Action Button: New Session Note */}
        <button
          id="btn-new-note"
          onClick={onOpenNewNoteModal}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#EBF7FC] hover:bg-[#D6EFF9] text-[#0E7CB5] border border-[#BDE3F5] text-xs font-semibold transition-all shadow-xs cursor-pointer"
        >
          <FilePlus className="w-4 h-4 text-[#0E7CB5]" />
          <span className="hidden sm:inline">Nueva Nota</span>
        </button>

        {/* Primary Action Button: New Patient */}
        <button
          id="btn-new-patient"
          onClick={onOpenNewPatientModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#620092] hover:bg-[#4E0075] text-white text-xs font-bold transition-all shadow-md shadow-[#620092]/25 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Nuevo Paciente</span>
        </button>

        {/* User Profile Badge / Edit */}
        {user && (
          <button
            onClick={onOpenProfileModal}
            className="flex items-center gap-2 p-1.5 pl-2 pr-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
            title="Editar Perfil Sanitario"
          >
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150'}
              alt={user.name}
              className="w-7 h-7 rounded-full object-cover ring-1 ring-[#620092]"
            />
            <span className="text-xs font-bold text-[#2D2832] hidden md:inline truncate max-w-[120px]">
              {user.name}
            </span>
          </button>
        )}

        {/* User Logout Button */}
        {user && (
          <button
            onClick={() => logout()}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-slate-200 cursor-pointer flex items-center gap-1.5"
            title={`Cerrar Sesión (${user.name})`}
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
