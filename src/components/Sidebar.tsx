import React from 'react';
import { 
  Users, 
  GitCommit, 
  Target, 
  FileCheck, 
  FileText, 
  BookOpen, 
  Shield,
  Stethoscope,
  ClipboardList
} from 'lucide-react';
import { NavigationTab } from '../types';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  onOpenProfileModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenProfileModal
}) => {
  const { user } = useAuth();
  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'patients', label: 'Pacientes & Ficha', icon: <Users className="w-5 h-5" /> },
    { id: 'interview', label: 'Entrevista Inicial', icon: <ClipboardList className="w-5 h-5" /> },
    { id: 'timeline', label: 'Línea de Tiempo', icon: <GitCommit className="w-5 h-5" /> },
    { id: 'treatment', label: 'Plan de Tratamiento', icon: <Target className="w-5 h-5" /> },
    { id: 'legal', label: 'Documentos Legales', icon: <FileCheck className="w-5 h-5" /> },
    { id: 'reports', label: 'Informes & PDF', icon: <FileText className="w-5 h-5" /> },
    { id: 'resources', label: 'Biblioteca de Recursos', icon: <BookOpen className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-[#1E1B24] text-slate-300 flex flex-col justify-between shrink-0 border-r border-[#322B3D] shadow-xl select-none z-20 font-sans">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-[#322B3D] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#620092] flex items-center justify-center text-white shadow-lg shadow-[#620092]/30 font-extrabold text-xl tracking-tight">
              uk
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                ukiana
                <span className="inline-block w-2 h-2 rounded-full bg-[#50B3E5] animate-pulse"></span>
              </h1>
              <p className="text-xs text-slate-400 font-medium">Gestión Clínica Psicológica</p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Módulos Principales
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group cursor-pointer ${
                  isActive
                    ? 'bg-[#620092] text-white shadow-md shadow-[#620092]/30 border border-[#7905AD]/50'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-[#2D2832]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`transition-colors ${isActive ? 'text-[#FFCD69]' : 'text-slate-400 group-hover:text-slate-200'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Therapist Info */}
      <div 
        onClick={onOpenProfileModal}
        className="p-4 m-3 rounded-2xl bg-[#2D2832] hover:bg-[#393241] border border-[#3E3747] space-y-3 cursor-pointer transition-colors group"
        title="Hacer clic para editar perfil"
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=150'}
              alt={user?.name || 'Facultativo'}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-[#620092] group-hover:scale-105 transition-transform"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#50B3E5] rounded-full ring-2 ring-[#1E1B24]"></span>
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-extrabold text-white truncate group-hover:text-[#50B3E5] transition-colors">{user?.name || 'Dr/a. Facultativo'}</h4>
            <p className="text-[11px] text-slate-300 truncate flex items-center gap-1 font-medium">
              <Stethoscope className="w-3 h-3 text-[#50B3E5] shrink-0" />
              {user?.role || 'Psicólogo General Sanitario'}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-[#3E3747] flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-[#50B3E5] font-medium">
            <Shield className="w-3.5 h-3.5" />
            Editar Perfil
          </span>
          <span className="bg-[#1E1B24] px-2 py-0.5 rounded text-[10px] font-mono text-slate-300 border border-[#322B3D]">
            v2.4 Pro
          </span>
        </div>
      </div>
    </aside>
  );
};
