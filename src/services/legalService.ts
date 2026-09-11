import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { LegalDocumentItem } from '../types';

const LEGAL_KEY = 'ukiana_legal';

export const getLegalDocuments = async (): Promise<LegalDocumentItem[]> => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('legal_documents').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      return data.map(d => ({
        id: d.id,
        patientId: d.patient_id,
        patientName: d.patient_name,
        documentType: d.document_type,
        status: d.status,
        signedDate: d.signed_date,
        sentDate: d.sent_date,
        fileUrl: d.file_url,
        version: d.version
      }));
    }
  }

  const saved = localStorage.getItem(LEGAL_KEY);
  if (!saved) {
    return [];
  }
  return JSON.parse(saved);
};

export const createLegalDocument = async (doc: LegalDocumentItem): Promise<LegalDocumentItem> => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('legal_documents').insert([{
      patient_id: doc.patientId,
      patient_name: doc.patientName,
      document_type: doc.documentType,
      status: doc.status,
      signed_date: doc.signedDate,
      sent_date: doc.sentDate,
      file_url: doc.fileUrl,
      version: doc.version
    }]).select().single();

    if (!error && data) {
      return { ...doc, id: data.id };
    }
  }

  const current = await getLegalDocuments();
  const updated = [doc, ...current];
  localStorage.setItem(LEGAL_KEY, JSON.stringify(updated));
  return doc;
};
