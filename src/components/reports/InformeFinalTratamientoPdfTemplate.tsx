import React from 'react';
import { Patient, ClinicalNote, TreatmentPlan } from '../../types';

interface InformeFinalTratamientoPdfTemplateProps {
  patient: Patient;
  notes: ClinicalNote[];
  treatmentPlan?: TreatmentPlan;
  therapistName?: string;
  senescytNumber?: string;
  conclusions?: string;
  recommendations?: string;
}

export const InformeFinalTratamientoPdfTemplate: React.FC<InformeFinalTratamientoPdfTemplateProps> = ({
  patient,
  notes,
  treatmentPlan,
  therapistName = 'Dr. Alejandro Reyes',
  senescytNumber = 'Senescyt N° 1005-2024-2849102',
  conclusions = 'El paciente ha completado exitosamente el ciclo psicoterapéutico planificado, logrando una remisión significativa de la sintomatología inicial y demostrando una alta consolidación de herramientas de regulación emocional.',
  recommendations = '1. Practicar autoregistro de de-fusión cognitiva ante estresores laborales. 2. Control de seguimiento en 60 días o a solicitud.'
}) => {
  // Ordenar notas por número de sesión ascendente para el consolidado
  const sortedNotes = [...notes].sort((a, b) => a.sessionNumber - b.sessionNumber);

  return (
    <div id="informe-final-pdf-content" className="bg-white text-slate-900 font-sans p-8 max-w-4xl mx-auto shadow-none print:p-0 print:shadow-none text-xs leading-relaxed">
      {/* Header Institucional */}
      <div className="border-b-2 border-[#620092] pb-3 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#620092] text-white font-black text-2xl flex items-center justify-center shadow-md">
            uk
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-[#2D2832] uppercase">Ukiana · Gestión Clínica Psicológica</h1>
            <p className="text-[11px] text-slate-500 font-bold tracking-wider">INFORME FINAL UNIFICADO DE TRATAMIENTO PSICOLÓGICO</p>
          </div>
        </div>

        <div className="text-right text-[10px] text-slate-500 font-mono">
          <div>DOCUMENTO CLÍNICO CONSOLIDADO</div>
          <div>EMISIÓN: {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
        </div>
      </div>

      {/* SECCIÓN 1. FICHA IDENTIFICATIVA Y MARCO DEL TRATAMIENTO */}
      <div className="mb-5 border border-slate-300 rounded-xl overflow-hidden">
        <div className="bg-[#620092]/10 px-4 py-1.5 font-bold text-[#620092] uppercase text-[11px] border-b border-slate-300 flex items-center justify-between">
          <span>1. Datos Identificativos y Marco del Tratamiento</span>
          <span className="text-[10px] font-mono text-slate-600">Expediente N° #{patient.id}</span>
        </div>

        <div className="p-4 grid grid-cols-12 gap-3 text-xs">
          <div className="col-span-5">
            <span className="font-bold text-slate-700 block text-[10px] uppercase">Paciente:</span>
            <div className="font-extrabold text-slate-900 text-sm">{patient.fullName}</div>
          </div>
          <div className="col-span-4">
            <span className="font-bold text-slate-700 block text-[10px] uppercase">Documento de Identidad:</span>
            <div className="font-mono font-bold text-slate-800">{patient.idNumber || 'S/D'}</div>
          </div>
          <div className="col-span-3">
            <span className="font-bold text-slate-700 block text-[10px] uppercase">Edad / Género:</span>
            <div className="font-medium text-slate-800">{patient.age} años · {patient.gender}</div>
          </div>

          <div className="col-span-4">
            <span className="font-bold text-slate-700 block text-[10px] uppercase">Fecha Inicio Tratamiento:</span>
            <div className="font-medium text-slate-800">{patient.startDate || 'S/D'}</div>
          </div>
          <div className="col-span-4">
            <span className="font-bold text-slate-700 block text-[10px] uppercase">Total Sesiones Realizadas:</span>
            <div className="font-bold text-[#620092] font-mono">{sortedNotes.length} Sesiones SOAP</div>
          </div>
          <div className="col-span-4">
            <span className="font-bold text-slate-700 block text-[10px] uppercase">Tasa de Adherencia:</span>
            <div className="font-bold text-[#0E7CB5] font-mono">{patient.adherenceRate || 100}% Asistencia</div>
          </div>

          <div className="col-span-6 border-t border-slate-200 pt-2 mt-1">
            <span className="font-bold text-slate-700 block text-[10px] uppercase">Profesional Responsable:</span>
            <div className="font-bold text-slate-800">{therapistName}</div>
          </div>
          <div className="col-span-6 border-t border-slate-200 pt-2 mt-1">
            <span className="font-bold text-slate-700 block text-[10px] uppercase">Registro Profesional / Senescyt:</span>
            <div className="font-mono text-slate-800 font-bold">{senescytNumber}</div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2. IMPRESIÓN DIAGNÓSTICA Y EVOLUCIÓN (CIE-10 / CIE-11) */}
      <div className="mb-5 border border-slate-300 rounded-xl overflow-hidden">
        <div className="bg-[#620092]/10 px-4 py-1.5 font-bold text-[#620092] uppercase text-[11px] border-b border-slate-300">
          2. Cuadro Diagnóstico e Impresión Clínica Sanitaria
        </div>
        <div className="p-4 grid grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="font-bold text-slate-600 block text-[10px] uppercase">Diagnóstico Principal Actual:</span>
            <span className="font-extrabold text-[#2D2832] text-sm block">{patient.primaryDiagnosis || 'Pendiente de Evaluación'}</span>
            <span className="inline-block px-2 py-0.5 bg-[#620092] text-white rounded font-mono font-bold text-[11px] mt-1">
              Código CIE: {patient.icd10Code || 'Z00.4'}
            </span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
            <span className="font-bold text-slate-600 block text-[10px] uppercase">Nivel de Riesgo Evaluado:</span>
            <span className="font-extrabold text-slate-800 block text-sm">{patient.riskLevel || 'Bajo'}</span>
            <span className="text-slate-500 text-[11px] block mt-1">
              Enfoque psicoterapéutico: {treatmentPlan?.orientation || 'Terapia Cognitivo-Conductual (TCC / ACT)'}
            </span>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3. CONSOLIDADO UNIFICADO DE HOJAS DE SEGUIMIENTO (MATRIZ CRONOLÓGICA) */}
      <div className="mb-5 border border-slate-300 rounded-xl overflow-hidden">
        <div className="bg-[#620092]/10 px-4 py-1.5 font-bold text-[#620092] uppercase text-[11px] border-b border-slate-300 flex items-center justify-between">
          <span>3. Consolidado Unificado de Hojas de Seguimiento (Sesión 1 a Sesión {sortedNotes.length})</span>
          <span className="text-[10px] font-mono text-slate-600">{sortedNotes.length} Registros Oficiales</span>
        </div>

        <div className="p-4 space-y-4">
          {sortedNotes.length > 0 ? (
            sortedNotes.map((n, idx) => (
              <div key={n.id || idx} className="border border-slate-300 rounded-lg p-3 bg-[#F8F9FA]/60 space-y-2 text-xs">
                {/* Session Sub-header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-1.5 font-bold text-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#620092] text-white rounded font-mono text-[11px]">
                      Sesión N° {n.sessionNumber}
                    </span>
                    <span>{n.type} · {n.date}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    Horario: {n.startTime || '09:00'} - {n.endTime || '09:50'} ({n.durationMinutes} min) | [{n.modality || 'Presencial'}]
                  </div>
                </div>

                {/* Emotional state & Affect Categories */}
                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                  <span className="font-bold text-slate-600 uppercase text-[10px]">Predominio Afectivo:</span>
                  {(n.emotionalStateCategories && n.emotionalStateCategories.length > 0 ? n.emotionalStateCategories : [n.emotionalState]).map((cat, i) => (
                    <span key={i} className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-semibold text-[10px]">
                      {cat}
                    </span>
                  ))}
                  {n.bdiScore !== undefined && (
                    <span className="ml-auto font-mono font-bold text-[#0E7CB5]">
                      BDI: {n.bdiScore} pts
                    </span>
                  )}
                  {n.baiScore !== undefined && (
                    <span className="font-mono font-bold text-[#620092] ml-2">
                      BAI: {n.baiScore} pts
                    </span>
                  )}
                </div>

                {/* SOAP Synthesis */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <strong className="text-[#620092] block text-[10px] uppercase mb-0.5">S - Relato Subjetivo:</strong>
                    <p className="text-slate-700 text-[11px] leading-snug">{n.subjective}</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-slate-200">
                    <strong className="text-[#620092] block text-[10px] uppercase mb-0.5">A - Análisis Clínico:</strong>
                    <p className="text-slate-700 text-[11px] leading-snug">{n.assessment}</p>
                  </div>
                </div>

                {/* Techniques & Plan */}
                {(n.techniquesList && n.techniquesList.length > 0) && (
                  <div className="p-2 bg-white rounded border border-slate-200 text-[11px]">
                    <strong className="text-slate-700 block text-[10px] uppercase mb-0.5">Técnicas / Pruebas Aplicadas:</strong>
                    <div className="space-y-0.5">
                      {n.techniquesList.map((t, ti) => (
                        <div key={ti} className="flex justify-between text-[10px] font-medium text-slate-800">
                          <span>• {t.instrument}</span>
                          <span className="font-mono font-bold text-[#620092]">{t.result}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-slate-400 italic">
              No hay notas de seguimiento registradas aún para este paciente.
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN 4. PLAN DE TRATAMIENTO Y LOGRO DE OBJETIVOS */}
      {treatmentPlan && (
        <div className="mb-5 border border-slate-300 rounded-xl overflow-hidden">
          <div className="bg-[#620092]/10 px-4 py-1.5 font-bold text-[#620092] uppercase text-[11px] border-b border-slate-300">
            4. Logro de Objetivos y Plan de Tratamiento
          </div>
          <div className="p-4 space-y-2">
            <div className="font-bold text-slate-700 text-[10px] uppercase">Objetivo General:</div>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded font-medium text-xs">
              {treatmentPlan.generalObjective}
            </div>

            <div className="font-bold text-slate-700 text-[10px] uppercase pt-2">Metas Terapéuticas Específicas Alcanzadas:</div>
            <div className="space-y-1.5 text-xs">
              {treatmentPlan.specificGoals.map((g, gi) => (
                <div key={gi} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded">
                  <span className="font-medium text-slate-800">{g.description}</span>
                  <span className={`px-2 py-0.5 rounded font-mono font-bold text-[10px] ${g.completed ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'}`}>
                    {g.completed ? '[✓] CONSEGUIDO' : '[ ] EN CURSO'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECCIÓN 5. CONCLUSIÓN GENERAL & RECOMENDACIONES DE ALTA */}
      <div className="mb-5 border border-slate-300 rounded-xl overflow-hidden">
        <div className="bg-[#620092]/10 px-4 py-1.5 font-bold text-[#620092] uppercase text-[11px] border-b border-slate-300">
          5. Conclusión General del Tratamiento, Pronóstico & Recomendaciones
        </div>
        <div className="p-4 space-y-3">
          <div>
            <span className="font-bold text-slate-700 block text-[10px] uppercase mb-1">Síntesis Clínica y Síntesis de Alta:</span>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded leading-relaxed text-xs font-medium text-slate-800">
              {conclusions}
            </div>
          </div>

          <div>
            <span className="font-bold text-slate-700 block text-[10px] uppercase mb-1">Recomendaciones de Prevención de Recaídas:</span>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded leading-relaxed text-xs font-medium text-slate-800">
              {recommendations}
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 6. FIRMA Y SELLO PROFESIONAL */}
      <div className="border border-slate-300 rounded-xl overflow-hidden">
        <div className="bg-[#620092]/10 px-4 py-1.5 font-bold text-[#620092] uppercase text-[11px] border-b border-slate-300">
          6. Certificación del Profesional Responsable
        </div>
        <div className="p-5 grid grid-cols-2 gap-6 items-end">
          <div>
            <span className="font-bold text-slate-700 block text-[10px] uppercase">Profesional Sanitario Certificante:</span>
            <div className="border-b border-slate-400 font-bold text-slate-900 text-xs py-1">
              {therapistName}
            </div>
            <span className="font-bold text-slate-700 block text-[10px] uppercase mt-3">Registro Sanitario / Senescyt:</span>
            <div className="border-b border-slate-400 font-mono text-slate-800 text-xs py-1">
              {senescytNumber}
            </div>
          </div>

          <div className="text-center space-y-1">
            <div className="h-20 border-b border-slate-400 flex items-center justify-center">
              <span className="text-slate-300 text-[10px] italic">___________________________________<br/>Firma Electrónica Sanitaria y Sello</span>
            </div>
            <span className="text-[10px] font-bold text-slate-600 block uppercase">Firma y Sello del Facultativo Sanitario</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-2 border-t border-slate-200 text-center text-[9px] text-slate-400 font-mono">
        Informe Clínico Unificado Certificado · Ukiana Clinical Information System
      </div>
    </div>
  );
};
