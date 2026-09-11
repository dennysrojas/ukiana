import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is missing on server.' });
  }

  const { patientName, primaryDiagnosis, recentNotes } = req.body || {};

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
Eres un asistente clínico psicológico experto. Sintetiza la siguiente evolución del paciente en un párrafo profesional para informe clínico:
Paciente: ${patientName}
Diagnóstico: ${primaryDiagnosis}
Notas Recientes: ${JSON.stringify(recentNotes)}

Proporciona una síntesis técnica, objetiva y respetuosa con lenguaje clínico formal.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return res.status(200).json({ summary: response.text });
  } catch (error: any) {
    console.error('Serverless Gemini Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
