import React, { useState } from 'react';
import { 
  Bell, 
  PhoneCall, 
  Send, 
  CheckCircle2, 
  ShieldCheck
} from 'lucide-react';
import { ClinicAlert, Patient } from '../../types';

interface AlertsCenterViewProps {
  alerts: ClinicAlert[];
  patients: Patient[];
  onResolveAlert: (alertId: string) => void;
  onSelectPatient: (patientId: string) => void;
}

export const AlertsCenterView: React.FC<AlertsCenterViewProps> = ({
  alerts,
  patients,
  onResolveAlert,
  onSelectPatient
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('Todas');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const filteredAlerts = alerts.filter(a => {
    if (a.resolved) return false;
    if (filterLevel === 'Todas') return true;
    return a.level === filterLevel;
  });

  const triggerToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleActionClick = (alert: ClinicAlert) => {
    if (alert.level === 'Crítica') {
      triggerToast(`Iniciando protocolo de contención telefónica urgente para ${alert.patientName}...`);
    } else if (alert.level === 'Legal') {
      triggerToast(`Recordatorio de firma legal reenviado por WhatsApp a ${alert.patientName}.`);
    } else {
      triggerToast(`Notificación enviada a ${alert.patientName}.`);
    }
    onResolveAlert(alert.id);
  };

  return (
    <div className="space-y-6 font-sans">
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
            <Bell className="w-6 h-6 text-rose-600 animate-pulse" />
            Centro de Alertas Clínicas & Seguimiento
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Gestión priorizada de riesgos de crisis, inactividad prolongada e incidencias legales RGPD
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold bg-slate-100 p-1 rounded-2xl">
          {['Todas', 'Crítica', 'Legal', 'Inactividad'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterLevel === lvl ? 'bg-[#620092] text-white font-bold shadow-xs' : 'text-slate-600 hover:text-[#2D2832]'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Cards Stack */}
      <div className="space-y-4">
        {filteredAlerts.map(alert => (
          <div
            key={alert.id}
            className={`bg-white rounded-3xl p-6 border transition-all shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 ${
              alert.level === 'Crítica'
                ? 'border-rose-300 ring-2 ring-rose-500/10 bg-rose-50/20'
                : alert.level === 'Legal'
                ? 'border-[#FFE7A8] bg-[#FFF8E7]/40'
                : 'border-slate-200'
            }`}
          >
            <div className="flex items-start gap-4">
              <img
                src={alert.patientAvatar}
                alt={alert.patientName}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shrink-0"
              />

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3
                    onClick={() => onSelectPatient(alert.patientId)}
                    className="text-base font-extrabold text-[#2D2832] hover:text-[#620092] cursor-pointer transition-colors"
                  >
                    {alert.patientName}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    alert.level === 'Crítica' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                    alert.level === 'Legal' ? 'bg-[#FFF8E7] text-[#5C4E00] border border-[#FFE7A8]' :
                    'bg-[#EBF7FC] text-[#0E7CB5] border border-[#BDE3F5]'
                  }`}>
                    Alerta {alert.level}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{alert.timestamp}</span>
                </div>

                <h4 className="text-xs font-bold text-[#2D2832]">{alert.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-xl font-medium">{alert.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
              <button
                onClick={() => handleActionClick(alert)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer ${
                  alert.level === 'Crítica'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-[#620092] hover:bg-[#4E0075] text-white'
                }`}
              >
                {alert.level === 'Crítica' ? <PhoneCall className="w-4 h-4 text-white" /> : <Send className="w-4 h-4 text-white" />}
                <span>{alert.actionRequired}</span>
              </button>

              <button
                onClick={() => onResolveAlert(alert.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-[#0E7CB5] hover:bg-[#EBF7FC] transition-colors border border-slate-200 cursor-pointer"
                title="Marcar como Resuelta"
              >
                <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {filteredAlerts.length === 0 && (
          <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-300 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-[#0E7CB5] mx-auto" />
            <h3 className="text-base font-extrabold text-[#2D2832]">No hay alertas pendientes</h3>
            <p className="text-xs text-slate-500 font-medium">Todas las notificaciones críticas han sido resueltas correctamente.</p>
          </div>
        )}
      </div>
    </div>
  );
};

