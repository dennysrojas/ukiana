import React, { useState, useRef } from 'react';
import { X, UserCheck, Lock, Award, CheckCircle2, Upload, Camera, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ProfileModalProps {
  onClose: () => void;
}

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1594824813566-78a946467362?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=250',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=250'
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user?.name || '');
  const [role, setRole] = useState(user?.role || 'Psicólogo General Sanitario');
  const [collegeNumber, setCollegeNumber] = useState(user?.collegeNumber || user?.senescytNumber || 'Senescyt N° 1005-2024-2849102');
  const [avatar, setAvatar] = useState(user?.avatar || AVATAR_OPTIONS[0]);
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('La imagen seleccionada supera los 3MB. Por favor elige una imagen más liviana.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsLoading(true);
    try {
      await updateProfile({
        name,
        role,
        collegeNumber,
        avatar,
        password: password || undefined
      });
      setToastMsg('¡Perfil profesional y Registro Senescyt actualizados!');
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Error al actualizar el perfil.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1E1B24]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 relative overflow-hidden">
        
        {/* Success Toast Overlay */}
        {toastMsg && (
          <div className="absolute inset-x-4 top-4 bg-[#1E1B24] text-white p-3 rounded-2xl shadow-xl z-20 flex items-center gap-3 text-xs font-bold animate-bounce border border-[#322B3D]">
            <CheckCircle2 className="w-5 h-5 text-[#50B3E5]" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#F8F0FC] text-[#620092]">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#2D2832]">Perfil Profesional del Facultativo</h3>
              <p className="text-[11px] text-slate-500 font-medium">Configura tus datos para los informes clínicos y recetas</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Avatar Upload & Selection */}
          <div>
            <label className="block font-bold text-[#2D2832] mb-2">Foto / Avatar de Perfil</label>
            <div className="flex items-center gap-3.5">
              <div className="relative group">
                <img
                  src={avatar}
                  alt="Avatar activo"
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#620092] shadow-sm shrink-0"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-slate-900/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[9px] font-bold cursor-pointer"
                >
                  <Camera className="w-4 h-4 mb-0.5" />
                  Cambiar
                </button>
              </div>

              <div className="flex-1 space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2 px-3 bg-[#EBF7FC] hover:bg-[#D6EFF9] text-[#0E7CB5] border border-[#BDE3F5] rounded-xl font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Subir Foto desde tu Equipo</span>
                </button>
                
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">O elige predeterminado:</span>
                  {AVATAR_OPTIONS.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Opción ${idx + 1}`}
                      onClick={() => setAvatar(img)}
                      className={`w-7 h-7 rounded-lg object-cover cursor-pointer transition-transform hover:scale-110 ${
                        avatar === img ? 'ring-2 ring-[#620092] scale-105' : 'opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Email Read-only */}
          <div>
            <label className="block font-bold text-[#2D2832] mb-1">Correo Electrónico Sanitario</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full p-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-semibold cursor-not-allowed"
            />
          </div>

          {/* Full Name */}
          <div>
            <label className="block font-bold text-[#2D2832] mb-1">Nombre Completo Sanitario *</label>
            <input
              type="text"
              required
              placeholder="Ej: Dra. María Elena Gómez"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full p-2.5 bg-[#F8F9FA] border border-slate-200 rounded-xl text-[#2D2832] font-semibold focus:ring-2 focus:ring-[#620092]/30"
            />
          </div>

          {/* Senescyt Registration Number (Ecuador) & Specialty */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-[#2D2832] mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#620092]" />
                N° Registro Senescyt
              </label>
              <input
                type="text"
                placeholder="Senescyt N° 1005-2024-2849102"
                value={collegeNumber}
                onChange={e => setCollegeNumber(e.target.value)}
                className="w-full p-2.5 bg-[#F8F9FA] border border-slate-200 rounded-xl text-[#2D2832] font-bold text-[11px]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#2D2832] mb-1">Especialidad</label>
              <input
                type="text"
                placeholder="Psicología Clínica TCC"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full p-2.5 bg-[#F8F9FA] border border-slate-200 rounded-xl text-[#2D2832] font-semibold"
              />
            </div>
          </div>

          {/* Password update optional */}
          <div className="pt-2 border-t border-slate-100">
            <label className="font-bold text-[#2D2832] mb-1 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              Actualizar Contraseña (Opcional)
            </label>
            <input
              type="password"
              placeholder="Dejar en blanco para mantener la actual"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full p-2.5 bg-[#F8F9FA] border border-slate-200 rounded-xl text-[#2D2832] font-medium"
            />
          </div>
        </div>

        {/* Actions Footer */}
        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-5 py-2 bg-[#620092] hover:bg-[#4E0075] text-white rounded-xl font-bold shadow-md transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
          >
            {isLoading ? 'Guardando...' : 'Guardar Perfil'}
          </button>
        </div>
      </form>
    </div>
  );
};
