import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ClinicAlert } from '../types';

const ALERTS_KEY = 'ukiana_alerts';

export const getAlerts = async (): Promise<ClinicAlert[]> => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('clinic_alerts').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      return data.map(a => ({
        id: a.id,
        patientId: a.patient_id,
        patientName: a.patient_name,
        patientAvatar: a.patient_avatar,
        level: a.level,
        title: a.title,
        message: a.message,
        timestamp: a.created_at,
        actionRequired: a.action_required,
        resolved: a.resolved
      }));
    }
  }

  const saved = localStorage.getItem(ALERTS_KEY);
  if (!saved) {
    return [];
  }
  return JSON.parse(saved);
};

export const resolveAlert = async (alertId: string): Promise<void> => {
  if (isSupabaseConfigured) {
    await supabase.from('clinic_alerts').update({ resolved: true }).eq('id', alertId);
    return;
  }

  const current = await getAlerts();
  const updated = current.map(a => a.id === alertId ? { ...a, resolved: true } : a);
  localStorage.setItem(ALERTS_KEY, JSON.stringify(updated));
};
