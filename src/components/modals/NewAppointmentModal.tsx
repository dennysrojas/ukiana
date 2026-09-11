import React, { useState } from 'react';
import { X, CalendarPlus } from 'lucide-react';
import { Appointment, Patient } from '../../types';

interface NewAppointmentModalProps {
  patients: Patient[];
  selectedPatientId: string;
  onClose: () => void;
  onAddAppointment: (newApp: Appointment) => void;
}

export const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({
  patients,
  selectedPatientId,
  onClose,
  onAddAppointment
}) => {
  const [patientId, setPatientId] = useState(selectedPatientId);
  const [date, setDate] = useState('2024-05-26');
  const [startTime, setStartTime] = useState('11:00');
  const [endTime, setEndTime] = useState('12:00');
  const [type, setType] = useState<Appointment['type']>('Presencial');
  const [room, setRoom] = useState('Consulta 102 - Planta 1');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patientObj = patients.find(p => p.id === patientId);
    if (!patientObj) return;

    const newApp: Appointment = {
      id: `app-${Date.now()}`,
      patientId,
      patientName: patientObj.fullName,
      patientAvatar: patientObj.avatar,
      date,
      startTime,
      endTime,
      type,
      status: 'Confirmada',
      room: type === 'Presencial' ? room : undefined,
      notes
    };

    onAddAppointment(newApp);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#1E1B24]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <CalendarPlus className="w-5 h-5 text-[#620092]" />
            <h3 className="text-base font-extrabold text-[#2D2832]">Agendar Nueva Cita</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-[#2D2832] mb-1">Paciente</label>
            <select
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              className="w-full p-2.5 bg-[#F8F9FA] border border-slate-200 rounded-xl text-[#2D2832] font-bold"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.fullName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <label className="block font-bold text-[#2D2832] mb-1">Fecha</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full p-2 bg-[#F8F9FA] border border-slate-200 rounded-xl text-[#2D2832]"
              />
            </div>
            <div>
              <label className="block font-bold text-[#2D2832] mb-1">Inicio</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full p-2 bg-[#F8F9FA] border border-slate-200 rounded-xl text-[#2D2832] font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-[#2D2832] mb-1">Fin</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full p-2 bg-[#F8F9FA] border border-slate-200 rounded-xl text-[#2D2832] font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-bold text-[#2D2832] mb-1">Modalidad</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="w-full p-2.5 bg-[#F8F9FA] border border-slate-200 rounded-xl text-[#2D2832] font-semibold"
              >
                <option value="Presencial">Presencial en Clínica</option>
                <option value="Online (Videollamada)">Online (Videollamada)</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-[#2D2832] mb-1">Sala / Ubicación</label>
              <input
                type="text"
                disabled={type !== 'Presencial'}
                value={room}
                onChange={e => setRoom(e.target.value)}
                className="w-full p-2.5 bg-[#F8F9FA] border border-slate-200 rounded-xl text-[#2D2832] disabled:opacity-50 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#2D2832] mb-1">Observaciones / Objetivo de la Cita</label>
            <input
              type="text"
              placeholder="Ej: Revisión de tarea de exposición..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full p-2.5 bg-[#F8F9FA] border border-slate-200 rounded-xl text-[#2D2832] font-medium"
            />
          </div>
        </div>

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
            className="px-4 py-2 bg-[#620092] hover:bg-[#4E0075] text-white rounded-xl font-bold shadow-xs cursor-pointer"
          >
            Confirmar y Agendar
          </button>
        </div>
      </form>
    </div>
  );
};

