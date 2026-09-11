import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ClinicalNote, TimelineItem } from '../types';

const NOTES_KEY = 'ukiana_notes';
const TIMELINE_KEY = 'ukiana_timeline';

export const getClinicalNotes = async (): Promise<ClinicalNote[]> => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('clinical_notes').select('*').order('date', { ascending: false });
    if (!error && data) {
      return data.map(n => ({
        id: n.id,
        patientId: n.patient_id,
        sessionNumber: n.session_number,
        date: n.date,
        startTime: n.start_time,
        endTime: n.end_time,
        durationMinutes: n.duration_minutes,
        modality: n.modality || 'Presencial',
        type: n.type,
        emotionalStateCategories: n.emotional_state_categories || [],
        affectNotes: n.affect_notes || '',
        emotionalState: n.emotional_state || 'Estable',
        subjective: n.subjective,
        objective: n.objective,
        assessment: n.assessment,
        plan: n.plan,
        appliesTechniques: n.applies_techniques,
        techniquesList: n.techniques_list || [],
        diagnosesList: n.diagnoses_list || [],
        nextSessionDate: n.next_session_date,
        nextSessionTime: n.next_session_time,
        recommendedFrequency: n.recommended_frequency,
        therapistSignature: n.therapist_signature,
        bdiScore: n.bdi_score,
        baiScore: n.bai_score,
        suicideRisk: n.suicide_risk,
        privateNotes: n.private_notes
      }));
    }
  }

  const saved = localStorage.getItem(NOTES_KEY);
  if (!saved) {
    return [];
  }
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

export const createClinicalNote = async (note: ClinicalNote): Promise<ClinicalNote> => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('clinical_notes').insert([{
      patient_id: note.patientId,
      session_number: note.sessionNumber,
      date: note.date,
      start_time: note.startTime,
      end_time: note.endTime,
      duration_minutes: note.durationMinutes,
      modality: note.modality,
      type: note.type,
      emotional_state_categories: note.emotionalStateCategories,
      affect_notes: note.affectNotes,
      emotional_state: note.emotionalState,
      subjective: note.subjective,
      objective: note.objective,
      assessment: note.assessment,
      plan: note.plan,
      applies_techniques: note.appliesTechniques,
      techniques_list: note.techniquesList,
      diagnoses_list: note.diagnosesList,
      next_session_date: note.nextSessionDate,
      next_session_time: note.nextSessionTime,
      recommended_frequency: note.recommendedFrequency,
      therapist_signature: note.therapistSignature,
      bdi_score: note.bdiScore,
      bai_score: note.baiScore,
      suicide_risk: note.suicideRisk,
      private_notes: note.privateNotes
    }]).select().single();

    if (!error && data) {
      return { ...note, id: data.id };
    }
  }

  const current = await getClinicalNotes();
  const updated = [note, ...current];
  localStorage.setItem(NOTES_KEY, JSON.stringify(updated));
  return note;
};

export const getTimelineItems = async (): Promise<TimelineItem[]> => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('timeline_items').select('*').order('date', { ascending: false });
    if (!error && data) {
      return data.map(t => ({
        id: t.id,
        patientId: t.patient_id,
        date: t.date,
        title: t.title,
        category: t.category,
        description: t.description,
        author: t.author,
        tags: t.tags || [],
        severity: t.severity
      }));
    }
  }

  const saved = localStorage.getItem(TIMELINE_KEY);
  if (!saved) {
    return [];
  }
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
};

export const createTimelineItem = async (item: TimelineItem): Promise<TimelineItem> => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('timeline_items').insert([{
      patient_id: item.patientId,
      date: item.date,
      title: item.title,
      category: item.category,
      description: item.description,
      author: item.author,
      tags: item.tags,
      severity: item.severity
    }]).select().single();

    if (!error && data) {
      return { ...item, id: data.id };
    }
  }

  const current = await getTimelineItems();
  const updated = [item, ...current];
  localStorage.setItem(TIMELINE_KEY, JSON.stringify(updated));
  return item;
};
