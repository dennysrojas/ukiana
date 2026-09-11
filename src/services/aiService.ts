import { GoogleGenAI } from '@google/genai';

const getApiKey = (): string => {
  return (
    (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
    import.meta.env.VITE_GEMINI_API_KEY ||
    import.meta.env.GEMINI_API_KEY ||
    ''
  );
};

export interface ClinicalSummaryRequest {
  patientName: string;
  primaryDiagnosis: string;
  recentNotes: { date: string; subjective: string; assessment: string }[];
}

export const generateClinicalSummaryWithGemini = async (req: ClinicalSummaryRequest): Promise<string> => {
  const apiKey = getApiKey();

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return (
      `[Modo Simulación IA] Resumen para ${req.patientName}: Paciente en evolución favorable para ${req.primaryDiagnosis}. ` +
      `Se observa reducción progresiva de síntomas en las últimas 3 sesiones.`
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
Eres un asistente clínico psicológico experto. Sintetiza la siguiente evolución del paciente en un párrafo profesional para informe clínico:
Paciente: ${req.patientName}
Diagnóstico: ${req.primaryDiagnosis}
Notas Recientes:
${req.recentNotes.map(n => `- Fecha: ${n.date} | S: ${n.subjective} | A: ${n.assessment}`).join('\n')}

Proporciona una síntesis técnica, objetiva y respetuosa con lenguaje clínico formal.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || 'Sin respuesta del modelo.';
  } catch (error) {
    console.error('Error invocando Gemini API:', error);
    return 'Error al generar síntesis asistida por IA. Verifique las credenciales de GEMINI_API_KEY.';
  }
};
