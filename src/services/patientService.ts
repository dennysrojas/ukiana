import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Patient } from '../types';

const LOCAL_STORAGE_KEY = 'ukiana_patients';

const purgeLegacyMockData = () => {
  try {
    const keys = [
      'ukiana_patients',
      'ukiana_notes',
      'ukiana_timeline',
      'ukiana_treatment',
      'ukiana_legal',
      'ukiana_resources',
      'ukiana_alerts',
      'ukiana_appointments',
      'ukiana_schedule'
    ];
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved && (saved.includes('pat-1') || saved.includes('María García Morales') || saved.includes('Carlos López') || saved.includes('Elena Beltrán'))) {
      keys.forEach(k => localStorage.removeItem(k));
    }
  } catch {
    // Ignore storage access errors
  }
};

export const getPatients = async (): Promise<Patient[]> => {
  purgeLegacyMockData();

  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      // Filter out legacy mock data rows if present in Supabase table
      const realData = data.filter(item => item.id !== 'pat-1' && item.id !== 'pat-2' && item.id !== 'pat-3' && item.id !== 'pat-4' && item.id !== 'pat-5');
      return realData.map(item => ({
        id: item.id,
        fullName: item.full_name,
        birthDate: item.birth_date,
        idNumber: item.id_number,
        age: item.age,
        gender: item.gender,
        avatar: item.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
        email: item.email,
        phone: item.phone,
        hasAutonomyLimitation: item.has_autonomy_limitation,
        familyInfo: item.family_info,
        perinatalHistory: item.perinatal_history,
        emergencyContact: item.emergency_contact || { name: '', relationship: '', phone: '' },
        occupation: item.occupation || '',
        status: item.status,
        riskLevel: item.risk_level,
        startDate: item.start_date,
        therapist: item.therapist || 'Médico Responsable',
        primaryDiagnosis: item.primary_diagnosis || '',
        icd10Code: item.icd10_code || '',
        dsm5Code: item.dsm5_code || '',
        totalSessions: item.total_sessions || 0,
        adherenceRate: item.adherence_rate || 100,
        lastSessionDate: item.last_session_date || '',
        nextSessionDate: item.next_session_date || undefined,
        antecedents: item.antecedents || { medical: [], psychiatric: [], family: [] },
        activeGoalsCount: item.active_goals_count || 0
      }));
    }
  }

  // Local fallback
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!saved) {
    return [];
  }
  const parsed = JSON.parse(saved);
  return parsed.filter((p: Patient) => !p.id.startsWith('pat-1') && !p.id.startsWith('pat-2') && p.fullName !== 'María García Morales');
};

export const createPatient = async (patient: Patient): Promise<Patient> => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('patients').insert([{
      full_name: patient.fullName,
      birth_date: patient.birthDate ? patient.birthDate : null,
      id_number: patient.idNumber || null,
      age: patient.age || 0,
      gender: patient.gender || 'Femenino',
      avatar: patient.avatar || null,
      email: patient.email || '',
      phone: patient.phone || '',
      has_autonomy_limitation: Boolean(patient.hasAutonomyLimitation),
      family_info: patient.familyInfo || {},
      perinatal_history: patient.perinatalHistory || {},
      emergency_contact: patient.emergencyContact || {},
      occupation: patient.occupation || '',
      status: patient.status || 'Activo',
      risk_level: patient.riskLevel || 'Bajo',
      start_date: patient.startDate || new Date().toISOString().split('T')[0],
      therapist: patient.therapist || 'Médico Responsable',
      primary_diagnosis: patient.primaryDiagnosis || '',
      icd10_code: patient.icd10Code || '',
      dsm5_code: patient.dsm5Code || '',
      antecedents: patient.antecedents || {}
    }]).select().single();

    if (error) {
      console.error('❌ Error guardando paciente en Supabase:', error);
    } else if (data) {
      return {
        ...patient,
        id: data.id
      };
    }
  }

  // Local fallback
  const current = await getPatients();
  const updated = [patient, ...current];
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  return patient;
};

export const updatePatient = async (id: string, updates: Partial<Patient>): Promise<void> => {
  if (isSupabaseConfigured) {
    await supabase.from('patients').update({
      full_name: updates.fullName,
      status: updates.status,
      risk_level: updates.riskLevel,
      total_sessions: updates.totalSessions,
      last_session_date: updates.lastSessionDate,
      next_session_date: updates.nextSessionDate,
      family_info: updates.familyInfo,
      perinatal_history: updates.perinatalHistory
    }).eq('id', id);
    return;
  }

  // Local fallback
  const current = await getPatients();
  const updated = current.map(p => p.id === id ? { ...p, ...updates } : p);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
};
