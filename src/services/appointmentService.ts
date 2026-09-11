import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Appointment, ScheduleConfig } from '../types';
import { DEFAULT_SCHEDULE_CONFIG } from '../data/mockData';

const APPOINTMENTS_KEY = 'ukiana_appointments';
const SCHEDULE_KEY = 'ukiana_schedule';

export const getAppointments = async (): Promise<Appointment[]> => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('appointments').select('*').order('date', { ascending: true });
    if (!error && data) {
      return data.map(a => ({
        id: a.id,
        patientId: a.patient_id,
        patientName: a.patient_name,
        patientAvatar: a.patient_avatar,
        date: a.date,
        startTime: a.start_time,
        endTime: a.end_time,
        type: a.type,
        status: a.status,
        room: a.room,
        notes: a.notes
      }));
    }
  }

  const saved = localStorage.getItem(APPOINTMENTS_KEY);
  if (!saved) {
    return [];
  }
  return JSON.parse(saved);
};

export const createAppointment = async (appointment: Appointment): Promise<Appointment> => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('appointments').insert([{
      patient_id: appointment.patientId,
      patient_name: appointment.patientName,
      patient_avatar: appointment.patientAvatar,
      date: appointment.date,
      start_time: appointment.startTime,
      end_time: appointment.endTime,
      type: appointment.type,
      status: appointment.status,
      room: appointment.room,
      notes: appointment.notes
    }]).select().single();

    if (!error && data) {
      return { ...appointment, id: data.id };
    }
  }

  const current = await getAppointments();
  const updated = [appointment, ...current];
  localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(updated));
  return appointment;
};

export const getScheduleConfig = async (): Promise<ScheduleConfig> => {
  const saved = localStorage.getItem(SCHEDULE_KEY);
  if (!saved) {
    return DEFAULT_SCHEDULE_CONFIG;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return DEFAULT_SCHEDULE_CONFIG;
  }
};

export const updateScheduleConfig = async (config: ScheduleConfig): Promise<void> => {
  localStorage.setItem(SCHEDULE_KEY, JSON.stringify(config));
};
