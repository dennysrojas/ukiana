export interface ICD10Item {
  code: string;
  name: string;
  category: string;
}

export const ICD10_DIAGNOSES: ICD10Item[] = [
  // Trastornos de Ansiedad y del Estado de Ánimo
  { code: 'F41.1', name: 'Trastorno de Ansiedad Generalizada', category: 'Ansiedad' },
  { code: 'F41.0', name: 'Trastorno de Pánico (Ansiedad Paroxística Episódica)', category: 'Ansiedad' },
  { code: 'F40.1', name: 'Trastorno de Ansiedad Social (Fobia Social)', category: 'Ansiedad' },
  { code: 'F40.0', name: 'Agorafobia', category: 'Ansiedad' },
  { code: 'F40.2', name: 'Fobia Específica', category: 'Ansiedad' },
  { code: 'F41.2', name: 'Trastorno Mixto Ansioso-Depresivo', category: 'Ansiedad' },
  { code: 'F42.2', name: 'Trastorno Obsesivo-Compulsivo (TOC)', category: 'Obsesivo' },
  { code: 'F43.1', name: 'Trastorno de Estrés Postraumático (TEPT)', category: 'Estrés' },
  { code: 'F43.0', name: 'Reacción de Estrés Agudo', category: 'Estrés' },
  { code: 'F43.2', name: 'Trastorno de Adaptación', category: 'Estrés' },
  { code: 'F32.0', name: 'Episodio Depresivo Leve', category: 'Depresión' },
  { code: 'F32.1', name: 'Episodio Depresivo Moderado', category: 'Depresión' },
  { code: 'F32.2', name: 'Episodio Depresivo Grave sin Síntomas Psicóticos', category: 'Depresión' },
  { code: 'F33.1', name: 'Trastorno Depresivo Recurrente, Episodio Moderado', category: 'Depresión' },
  { code: 'F34.1', name: 'Distimia (Trastorno Depresivo Persistente)', category: 'Depresión' },
  { code: 'F31.1', name: 'Trastorno Afectivo Bipolar', category: 'Bipolar' },
  { code: 'F34.0', name: 'Ciclotimia', category: 'Bipolar' },
  
  // Trastornos del Neurodesarrollo e Infanto-Juveniles
  { code: 'F84.0', name: 'Trastorno del Espectro Autista (TEA)', category: 'Neurodesarrollo' },
  { code: 'F84.5', name: 'Síndrome de Asperger', category: 'Neurodesarrollo' },
  { code: 'F90.0', name: 'Trastorno por Déficit de Atención e Hiperactividad (TDAH)', category: 'Neurodesarrollo' },
  { code: 'F90.1', name: 'Trastorno de la Conducta Hipercinética', category: 'Neurodesarrollo' },
  { code: 'F91.3', name: 'Trastorno Negativista Desafiante (TND)', category: 'Conducta' },
  { code: 'F91.1', name: 'Trastorno de la Conducta Inclasificado', category: 'Conducta' },
  { code: 'F93.0', name: 'Trastorno de Ansiedad por Separación en la Infancia', category: 'Infantil' },
  { code: 'F98.0', name: 'Enuresis No Orgánica', category: 'Esfínteres' },
  { code: 'F98.1', name: 'Encopresis No Orgánica', category: 'Esfínteres' },
  { code: 'F80.1', name: 'Trastorno del Lenguaje Expresivo', category: 'Lenguaje' },
  { code: 'F81.0', name: 'Trastorno Específico de la Lectura (Dislexia)', category: 'Aprendizaje' },
  { code: 'F81.2', name: 'Trastorno Específico del Cálculo (Discalculia)', category: 'Aprendizaje' },

  // Conducta Alimentaria y Sueño
  { code: 'F50.0', name: 'Anorexia Nerviosa', category: 'Alimentación' },
  { code: 'F50.2', name: 'Bulimia Nerviosa', category: 'Alimentación' },
  { code: 'F50.8', name: 'Trastorno por Atracón', category: 'Alimentación' },
  { code: 'F51.0', name: 'Insomnio No Orgánico', category: 'Sueño' },

  // Somatomorfos y Personalidad
  { code: 'F45.0', name: 'Trastorno de Somatización', category: 'Somatomorfo' },
  { code: 'F45.2', name: 'Trastorno Hipocondríaco', category: 'Somatomorfo' },
  { code: 'F60.3', name: 'Trastorno Límite de la Personalidad (TLP / Borderline)', category: 'Personalidad' },
  { code: 'F60.4', name: 'Trastorno Histriónico de la Personalidad', category: 'Personalidad' },
  { code: 'F60.6', name: 'Trastorno de la Personalidad por Evitación', category: 'Personalidad' },
  { code: 'F60.8', name: 'Trastorno Narcisista de la Personalidad', category: 'Personalidad' },
  
  // Relacionales y Factores Z
  { code: 'Z63.0', name: 'Problemas de Relación entre Esposos o Pareja', category: 'Relacional' },
  { code: 'Z63.5', name: 'Ruptura Familiar por Disolución o Divorcio', category: 'Relacional' },
  { code: 'Z73.0', name: 'Síndrome de Agotamiento Profesional (Burnout)', category: 'Laboral' },
  { code: 'Z60.0', name: 'Problemas de Adaptación a Transiciones del Ciclo Vital', category: 'Adaptativo' }
];

export const searchICD10 = (query: string): ICD10Item[] => {
  if (!query || query.trim() === '') return ICD10_DIAGNOSES.slice(0, 10);
  const cleanQuery = query.toLowerCase().trim();
  return ICD10_DIAGNOSES.filter(item => 
    item.name.toLowerCase().includes(cleanQuery) ||
    item.code.toLowerCase().includes(cleanQuery) ||
    item.category.toLowerCase().includes(cleanQuery)
  );
};
