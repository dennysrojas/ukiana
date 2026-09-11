import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Send, 
  ShieldCheck, 
  MapPin,
  Settings,
  BellRing
} from 'lucide-react';
import { ScheduleConfig, Appointment, Patient } from '../../types';

interface ScheduleManagerViewProps {
  scheduleConfig: ScheduleConfig;
  appointments: Appointment[];
  patients: Patient[];
  onUpdateSchedule: (updated: ScheduleConfig) => void;
  onOpenNewAppointmentModal: () => void;
}

export const ScheduleManagerView: React.FC<ScheduleManagerViewProps> = ({
  scheduleConfig,
  appointments,
  patients,
  onUpdateSchedule,
  onOpenNewAppointmentModal
}) => {
  const [activeTab, setActiveTab] = useState<'appointments' | 'availability' | 'sync'>('appointments');
  const [config, setConfig] = useState<ScheduleConfig>(scheduleConfig);
  const [newBlockedDate, setNewBlockedDate] = useState('');
  const [newBlockedReason, setNewBlockedReason] = useState('');
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  const handleToggleDay = (dayIndex: number) => {
    const updatedDays = [...config.days];
    updatedDays[dayIndex].active = !updatedDays[dayIndex].active;
    const newConf = { ...config, days: updatedDays };
    setConfig(newConf);
    onUpdateSchedule(newConf);
  };

  const handleAddBlockedDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockedDate || !newBlockedReason) return;
    const newConf = {
      ...config,
      blockedDates: [...config.blockedDates, { date: newBlockedDate, reason: newBlockedReason }]
    };
    setConfig(newConf);
    onUpdateSchedule(newConf);
    setNewBlockedDate('');
    setNewBlockedReason('');
    triggerToast('Día bloqueado añadido al calendario.');
  };

  const handleRemoveBlockedDate = (index: number) => {
    const updated = config.blockedDates.filter((_, i) => i !== index);
    const newConf = { ...config, blockedDates: updated };
    setConfig(newConf);
    onUpdateSchedule(newConf);
  };

  const handleSyncToggle = (key: 'googleCalendarSynced' | 'outlookSynced' | 'autoRemindersWhatsApp' | 'autoRemindersEmail') => {
    const newConf = { ...config, [key]: !config[key] };
    setConfig(newConf);
    onUpdateSchedule(newConf);
    triggerToast('Configuración de sincronización actualizada.');
  };

  return (
    <div className="space-y-6 font-sans">
      {notificationMsg && (
        <div className="fixed bottom-6 right-6 bg-[#1E1B24] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#322B3D] z-50 flex items-center gap-3 text-xs font-medium animate-bounce">
          <ShieldCheck className="w-4 h-4 text-[#50B3E5]" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-[#2D2832] flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#620092]" />
            Gestión de Agenda & Disponibilidad
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Configuración de franjas horarias, festivos bloqueados, recordatorios por WhatsApp y sincronización de calendario
          </p>
        </div>

        <button
          onClick={onOpenNewAppointmentModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#620092] hover:bg-[#4E0075] text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Agendar Nueva Cita</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'appointments' ? 'bg-[#2D2832] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Próximas Citas ({appointments.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('availability')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'availability' ? 'bg-[#2D2832] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Horario Semanal & Festivos</span>
        </button>
        <button
          onClick={() => setActiveTab('sync')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'sync' ? 'bg-[#2D2832] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Sincronización & Recordatorios</span>
        </button>
      </div>

      {/* Tab 1: Appointments List */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {appointments.map(app => (
              <div key={app.id} className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#F8F0FC] text-[#620092] border border-[#E6D2F3]">
                      {app.type}
                    </span>
                    <span className="text-xs font-bold text-[#2D2832] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#620092]" />
                      {app.startTime} - {app.endTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-3">
                    <img
                      src={app.patientAvatar}
                      alt={app.patientName}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-100"
                    />
                    <div>
                      <h4 className="text-sm font-extrabold text-[#2D2832]">{app.patientName}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">{app.date}</p>
                    </div>
                  </div>

                  {app.room && (
                    <p className="text-xs text-slate-600 flex items-center gap-1.5 mt-2 bg-[#F8F9FA] p-2 rounded-xl border border-slate-100 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {app.room}
                    </p>
                  )}

                  {app.notes && (
                    <p className="text-xs text-slate-500 mt-2 italic font-medium">
                      "{app.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#0E7CB5] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Confirmada
                  </span>
                  <button
                    onClick={() => triggerToast(`Recordatorio de cita reenviado a ${app.patientName}`)}
                    className="text-[#620092] hover:text-[#4E0075] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Send className="w-3 h-3 text-[#620092]" /> Recordar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Availability & Blocked Dates */}
      {activeTab === 'availability' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Day Slots Manager */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-4 shadow-xs">
            <h3 className="text-base font-extrabold text-[#2D2832]">Franjas Horarias de Atención</h3>
            <div className="space-y-3">
              {config.days.map((d, idx) => (
                <div key={d.day} className="flex items-center justify-between p-3 rounded-2xl bg-[#F8F9FA] border border-slate-200/80 text-xs">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={d.active}
                      onChange={() => handleToggleDay(idx)}
                      className="w-4 h-4 accent-[#620092] rounded cursor-pointer"
                    />
                    <span className={`font-bold ${d.active ? 'text-[#2D2832]' : 'text-slate-400'}`}>{d.day}</span>
                  </div>

                  {d.active ? (
                    <div className="flex items-center gap-2 text-slate-700 font-mono text-[11px]">
                      {d.slots.map((s, i) => (
                        <span key={i} className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 font-bold">
                          {s.start} - {s.end}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-slate-400 italic font-medium">Cerrado / No disponible</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Blocked Dates / Holidays */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-4 shadow-xs">
            <h3 className="text-base font-extrabold text-[#2D2832]">Festivos & Días Bloqueados</h3>

            <form onSubmit={handleAddBlockedDate} className="bg-[#F8F9FA] p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
              <h4 className="font-extrabold text-[#2D2832]">Bloquear Nueva Fecha</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="date"
                  required
                  value={newBlockedDate}
                  onChange={e => setNewBlockedDate(e.target.value)}
                  className="p-2 bg-white border border-slate-200 rounded-xl text-[#2D2832]"
                />
                <input
                  type="text"
                  required
                  placeholder="Motivo (ej: Festivo nacional)"
                  value={newBlockedReason}
                  onChange={e => setNewBlockedReason(e.target.value)}
                  className="p-2 bg-white border border-slate-200 rounded-xl text-[#2D2832]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-[#620092] hover:bg-[#4E0075] text-white font-bold rounded-xl text-xs cursor-pointer shadow-xs"
              >
                Añadir a Festivos
              </button>
            </form>

            <div className="space-y-2 text-xs">
              {config.blockedDates.map((b, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#F8F9FA] border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#2D2832] block">{b.date}</span>
                    <span className="text-slate-500 text-[11px] font-medium">{b.reason}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveBlockedDate(i)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Calendar Sync & Reminders */}
      {activeTab === 'sync' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-4 shadow-xs">
            <h3 className="text-base font-extrabold text-[#2D2832] flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#620092]" />
              Sincronización con Calendarios Externos
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#2D2832]">Google Calendar</h4>
                  <p className="text-slate-500 text-[11px] font-medium">Sincronización bidireccional automática</p>
                </div>
                <button
                  onClick={() => handleSyncToggle('googleCalendarSynced')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    config.googleCalendarSynced ? 'bg-[#EBF7FC] text-[#0E7CB5] border border-[#BDE3F5]' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {config.googleCalendarSynced ? 'Conectado' : 'Conectar'}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#2D2832]">Microsoft Outlook / 365</h4>
                  <p className="text-slate-500 text-[11px] font-medium">Sincronización de eventos de la clínica</p>
                </div>
                <button
                  onClick={() => handleSyncToggle('outlookSynced')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    config.outlookSynced ? 'bg-[#EBF7FC] text-[#0E7CB5] border border-[#BDE3F5]' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {config.outlookSynced ? 'Conectado' : 'Conectar'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-4 shadow-xs">
            <h3 className="text-base font-extrabold text-[#2D2832] flex items-center gap-2">
              <BellRing className="w-4 h-4 text-[#620092]" />
              Recordatorios Automatizados
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#2D2832]">WhatsApp Business API</h4>
                  <p className="text-slate-500 text-[11px] font-medium">Envío de mensaje 24 horas antes con confirmación 1-clic</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoRemindersWhatsApp}
                  onChange={() => handleSyncToggle('autoRemindersWhatsApp')}
                  className="w-5 h-5 accent-[#620092] rounded cursor-pointer"
                />
              </div>

              <div className="p-4 rounded-2xl bg-[#F8F9FA] border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#2D2832]">Notificaciones por Email</h4>
                  <p className="text-slate-500 text-[11px] font-medium">Recordatorio por correo electrónico con enlace a videollamada</p>
                </div>
                <input
                  type="checkbox"
                  checked={config.autoRemindersEmail}
                  onChange={() => handleSyncToggle('autoRemindersEmail')}
                  className="w-5 h-5 accent-[#620092] rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
