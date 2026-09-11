import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PsychoResource } from '../types';

const RESOURCES_KEY = 'ukiana_resources';

export const DEFAULT_CLINICAL_RESOURCES: PsychoResource[] = [
  {
    id: 'res-blank-interview',
    title: 'Formato de Entrevista Inicial Clínica (En Blanco)',
    category: 'Formatos Clínicos',
    type: 'PDF',
    estimatedMinutes: 15,
    description: 'Plantilla oficial imprimible en PDF con el protocolo de entrevista asistencial semiestructurada para sesiones presenciales o físicas.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=400',
    downloadsCount: 0,
    assignedPatientsCount: 0
  },
  {
    id: 'res-blank-hoja-seguimiento',
    title: 'Formato de Hoja de Seguimiento Psicológico (En Blanco)',
    category: 'Formatos Clínicos',
    type: 'PDF',
    estimatedMinutes: 10,
    description: 'Plantilla estandarizada de 7 secciones optimizada en A4/Carta con renglones de 8mm para registro clínico manual en sesiones presenciales.',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&q=80&w=400',
    downloadsCount: 0,
    assignedPatientsCount: 0
  }
];

export const getResources = async (): Promise<PsychoResource[]> => {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('psycho_resources').select('*');
    if (!error && data && data.length > 0) {
      return data.map(r => ({
        id: r.id,
        title: r.title,
        category: r.category,
        type: r.type,
        estimatedMinutes: r.estimated_minutes,
        description: r.description,
        thumbnailUrl: r.thumbnail_url,
        downloadsCount: r.downloads_count,
        assignedPatientsCount: r.assigned_patients_count
      }));
    }
  }

  const saved = localStorage.getItem(RESOURCES_KEY);
  if (!saved) {
    localStorage.setItem(RESOURCES_KEY, JSON.stringify(DEFAULT_CLINICAL_RESOURCES));
    return DEFAULT_CLINICAL_RESOURCES;
  }
  try {
    const parsed = JSON.parse(saved);
    const filtered = parsed.filter((r: PsychoResource) => 
      r.id === 'res-blank-interview' || r.id === 'res-blank-hoja-seguimiento' || !r.id.startsWith('res-')
    );
    if (!filtered.some((r: PsychoResource) => r.id === 'res-blank-hoja-seguimiento')) {
      filtered.push(DEFAULT_CLINICAL_RESOURCES[1]);
    }
    if (!filtered.some((r: PsychoResource) => r.id === 'res-blank-interview')) {
      filtered.unshift(DEFAULT_CLINICAL_RESOURCES[0]);
    }
    localStorage.setItem(RESOURCES_KEY, JSON.stringify(filtered));
    return filtered;
  } catch {
    return DEFAULT_CLINICAL_RESOURCES;
  }
};

export const incrementResourceAssignment = async (resourceId: string): Promise<void> => {
  const current = await getResources();
  const updated = current.map(r => r.id === resourceId ? { ...r, assignedPatientsCount: r.assignedPatientsCount + 1 } : r);
  localStorage.setItem(RESOURCES_KEY, JSON.stringify(updated));
};
