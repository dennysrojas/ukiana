import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  Stethoscope, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginView: React.FC = () => {
  const { login, loginAsDemo, isDemoMode } = useAuth();
  
  const [email, setEmail] = useState('dr.reyes@ukiana.clinic');
  const [password, setPassword] = useState('demo123456');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setErrorMsg(null);

    try {
      await login(email, password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al autenticar. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoAccess = () => {
    setIsLoading(true);
    setTimeout(() => {
      loginAsDemo();
      setIsLoading(false);
    }, 400);
  };

  return (
    <div className="min-h-screen w-full bg-[#1E1B24] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#620092]/20 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#50B3E5]/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main Login Card Container */}
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-slate-200/80 relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-[#620092] text-white font-extrabold text-3xl flex items-center justify-center mx-auto shadow-xl shadow-[#620092]/30 ring-4 ring-[#F8F0FC]">
            uk
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#2D2832] tracking-tight">ukiana</h1>
            <p className="text-xs font-semibold text-slate-500 mt-1">
              Consultorio de Psicología Clínica & Salud Mental
            </p>
          </div>
        </div>

        {/* Supabase Status Banner */}
        <div className={`p-3 rounded-2xl text-xs flex items-center justify-between border ${
          !isDemoMode 
            ? 'bg-[#EBF7FC] text-[#0E7CB5] border-[#BDE3F5]' 
            : 'bg-[#FFF8E7] text-[#5C4E00] border-[#FFE7A8]'
        }`}>
          <div className="flex items-center gap-2 font-bold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{!isDemoMode ? 'Supabase Auth Conectado' : 'Modo Demo Activo (Local)'}</span>
          </div>
          <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-white/70 shadow-2xs">
            {!isDemoMode ? 'Producción' : 'Pruebas'}
          </span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* Fast Demo Access Button */}
        <button
          type="button"
          onClick={handleQuickDemoAccess}
          disabled={isLoading}
          className="w-full p-3.5 bg-[#F8F0FC] hover:bg-[#E6D2F3]/50 text-[#620092] rounded-2xl border border-[#E6D2F3] transition-all flex items-center justify-center gap-2.5 text-xs font-extrabold cursor-pointer group shadow-2xs active:scale-98 disabled:opacity-50"
        >
          <Stethoscope className="w-4 h-4 text-[#620092] group-hover:scale-110 transition-transform" />
          <span>Acceso Rápido 1-Clic: Dr. Alejandro Reyes</span>
          <Sparkles className="w-3.5 h-3.5 text-[#FFCD69]" />
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full"></div>
          <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider absolute">
            O Ingresa tus credenciales
          </span>
        </div>

        {/* Auth Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-[#2D2832] mb-1.5">Correo Electrónico Sanitario</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="facultativo@ukiana.clinic"
                className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F9FA] border border-slate-200 rounded-xl text-[#2D2832] font-semibold focus:ring-2 focus:ring-[#620092]/30 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#2D2832] mb-1.5">Contraseña de Acceso</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-[#F8F9FA] border border-slate-200 rounded-xl text-[#2D2832] font-semibold focus:ring-2 focus:ring-[#620092]/30 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
              <input type="checkbox" defaultChecked className="w-3.5 h-3.5 accent-[#620092] rounded cursor-pointer" />
              <span>Recordar este equipo</span>
            </label>
            <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Modo Demo: Utiliza el botón de Acceso Rápido o ingresa con cualquier contraseña.'); }} className="text-[#620092] hover:underline font-bold">
              ¿Olvidaste tu clave?
            </a>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#620092] hover:bg-[#4E0075] text-white rounded-xl font-bold shadow-md transition-all flex items-center justify-center gap-2 text-xs cursor-pointer active:scale-98 disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Verificando credenciales...
              </span>
            ) : (
              <>
                <span>Iniciar Sesión en Consultorio</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </form>

        {/* Footer Medical Guarantee Banner */}
        <div className="pt-4 border-t border-slate-100 text-center space-y-1 text-[11px] text-slate-500 font-medium">
          <p className="flex items-center justify-center gap-1.5 text-[#0E7CB5] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#0E7CB5]" />
            Encriptación Sanitaria de Grado Médico
          </p>
          <p>Cumple con normativa LOPDGDD 3/2018 y RGPD europeo</p>
        </div>

      </div>
    </div>
  );
};
