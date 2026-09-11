import React, { useState } from 'react';
import { 
  UserCheck, 
  ArrowRight, 
  CheckCircle2, 
  Heart, 
  Lock
} from 'lucide-react';

export const PatientOnboardingView: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [consultReason, setConsultReason] = useState('');
  const [agreedConsent, setAgreedConsent] = useState(false);
  const [agreedRgpd, setAgreedRgpd] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
    } else {
      setCompleted(true);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 font-sans">
      {/* Portal Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#620092] text-white font-extrabold text-xl flex items-center justify-center mx-auto shadow-lg shadow-[#620092]/25">
          uk
        </div>
        <h2 className="text-2xl font-black text-[#2D2832] tracking-tight">
          Portal del Paciente Ukiana
        </h2>
        <p className="text-xs text-slate-500 font-medium">
          Completado del Expediente Inicial y Registro de Consentimiento Informado
        </p>
      </div>

      {!completed ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-100 pb-4">
            <span className={step >= 1 ? 'text-[#620092]' : ''}>1. Datos Personales</span>
            <span className={step >= 2 ? 'text-[#620092]' : ''}>2. Motivo de Consulta</span>
            <span className={step >= 3 ? 'text-[#620092]' : ''}>3. Consentimiento</span>
          </div>

          <form onSubmit={handleNext} className="space-y-5">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-[#2D2832]">Verificación de Información Personal</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Nombre Completo</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ingrese su nombre y apellidos"
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2D2832] focus:ring-2 focus:ring-[#620092]/20 focus:border-[#620092]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Teléfono de Contacto</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+593 99 123 4567"
                      required
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2D2832] focus:ring-2 focus:ring-[#620092]/20 focus:border-[#620092]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Contacto de Emergencia</label>
                      <input
                        type="text"
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        placeholder="Nombre y Parentesco"
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2D2832] focus:ring-2 focus:ring-[#620092]/20 focus:border-[#620092]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Teléfono Emergencia</label>
                      <input
                        type="tel"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        placeholder="+593 99 000 0000"
                        required
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2D2832] focus:ring-2 focus:ring-[#620092]/20 focus:border-[#620092]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-[#2D2832]">Motivo Principal de Consulta</h3>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Describa brevemente la razón por la que solicita atención psicológica</label>
                  <textarea
                    rows={4}
                    value={consultReason}
                    onChange={(e) => setConsultReason(e.target.value)}
                    placeholder="Describa sus síntomas o principales inquietudes..."
                    required
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-[#2D2832] focus:ring-2 focus:ring-[#620092]/20 focus:border-[#620092]"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-sm font-extrabold text-[#2D2832]">Consentimiento Informado & Privacidad</h3>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-3 text-slate-600">
                  <p>
                    Acepto recibir atención psicológica en el consultorio. Entiendo que la información brindada en las sesiones clínicas se mantendrá bajo estricta confidencialidad médica y secreto profesional.
                  </p>
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-[#2D2832]">
                      <input
                        type="checkbox"
                        checked={agreedConsent}
                        onChange={(e) => setAgreedConsent(e.target.checked)}
                        className="rounded text-[#620092] focus:ring-[#620092]"
                      />
                      Acepto los términos del consentimiento informado
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-[#2D2832]">
                      <input
                        type="checkbox"
                        checked={agreedRgpd}
                        onChange={(e) => setAgreedRgpd(e.target.checked)}
                        className="rounded text-[#620092] focus:ring-[#620092]"
                      />
                      Autorizo el tratamiento de mis datos personales para fines asistenciales
                    </label>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={step === 3 && (!agreedConsent || !agreedRgpd)}
              className="w-full py-3 bg-[#620092] hover:bg-[#4E0075] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{step === 3 ? 'Finalizar y Enviar' : 'Siguiente Paso'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-xs text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#EBF7FC] text-[#0E7CB5] flex items-center justify-center mx-auto border border-[#BDE3F5]">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-[#2D2832]">¡Formulario Completado con Éxito!</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            La información y los consentimientos se han adjuntado a su expediente clínico. Su especialista revisará los datos antes de su primera sesión.
          </p>
        </div>
      )}
    </div>
  );
};
