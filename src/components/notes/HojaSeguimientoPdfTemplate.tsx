import React from 'react';
import { ClinicalNote, Patient, SessionDiagnosisItem, SessionTechniqueItem } from '../../types';

interface HojaSeguimientoPdfTemplateProps {
  note?: ClinicalNote;
  patient?: Patient;
  therapistName?: string;
  senescytNumber?: string;
  isBlank?: boolean;
}

export const HojaSeguimientoPdfTemplate: React.FC<HojaSeguimientoPdfTemplateProps> = ({
  note,
  patient,
  therapistName = 'Dr. Alejandro Reyes',
  senescytNumber = 'Senescyt N° 1005-2024-2849102',
  isBlank = false
}) => {
  const categoriesList = [
    'Estable', 'Ansioso', 'Depresivo', 'Angustiado',
    'Apático', 'Irritable', 'Receptivo', 'Desconectado / Embotado'
  ];

  const selectedCategories = note?.emotionalStateCategories || (note?.emotionalState ? [note.emotionalState] : []);

  const appliesTechniques = isBlank ? false : (note?.appliesTechniques ?? (note?.techniquesList && note.techniquesList.length > 0));
  const techniquesList: SessionTechniqueItem[] = note?.techniquesList || [];
  const diagnosesList: SessionDiagnosisItem[] = note?.diagnosesList || (patient?.primaryDiagnosis ? [{
    name: patient.primaryDiagnosis,
    code: patient.icd10Code || 'Z00.4',
    type: 'DEF'
  }] : []);

  return (
    <div id="hoja-seguimiento-pdf-content" className="bg-white text-[#1A1A1A] font-sans p-6 sm:p-8 max-w-4xl mx-auto shadow-none print:p-0 print:shadow-none text-xs leading-relaxed">
      {/* Encabezado Oficial */}
      <div className="border-b-2 border-[#620092] pb-3 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#620092] text-white font-black text-xl flex items-center justify-center shadow-xs">
            uk
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-[#1A1A1A] uppercase">Ukiana · Gestión Clínica Psicológica</h1>
            <p className="text-[10px] text-[#620092] font-extrabold tracking-wider">HOJA DE SEGUIMIENTO - CONSULTA PSICOLÓGICA / CERTIFICADO DE EVALUACIÓN</p>
          </div>
        </div>

        <div className="text-right text-[10px] text-slate-600 font-mono">
          <div className="font-bold">CÓDIGO FORMATO: UK-HSP-2026</div>
          <div>DOCUMENTO NORMATIVO ASISTENCIAL DUAL</div>
        </div>
      </div>

      {/* SECCIÓN 1. IDENTIFICACIÓN DEL PACIENTE Y ATENCIÓN */}
      <div className="mb-3.5 border border-slate-300 rounded-lg overflow-hidden bg-white">
        <div className="bg-[#F0F0F0] px-3 py-1.5 font-bold text-[#1A1A1A] uppercase text-[11px] border-b border-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#620092]"></span>
            1. Identificación del Paciente y Atención
          </span>
          <span className="text-[9px] font-semibold text-slate-500 font-mono">Sec. 1/7</span>
        </div>
        <div className="p-3 grid grid-cols-12 gap-3 text-xs">
          <div className="col-span-4">
            <span className="font-bold text-slate-700 block text-[10px] uppercase">Documento Identidad:</span>
            <div className="border-b border-slate-400 font-mono font-bold min-h-[22px] flex items-end">
              {isBlank ? '' : (patient?.idNumber || 'S/D')}
            </div>
          </div>
          <div className="col-span-5">
            <span className="font-bold text-slate-700 block text-[10px] uppercase">Nombres y Apellidos Paciente:</span>
            <div className="border-b border-slate-400 font-bold min-h-[22px] flex items-end">
              {isBlank ? '' : (patient?.fullName || '_____________________________________')}
            </div>
          </div>
          <div className="col-span-3">
            <span className="font-bold text-slate-700 block text-[10px] uppercase">Sesión N°:</span>
            <div className="border-b border-slate-400 font-bold font-mono min-h-[22px] flex items-end">
              {isBlank ? '____' : (note?.sessionNumber || 1)}
            </div>
          </div>

          <div className="col-span-4">
            <span className="font-bold text-slate-700 block text-[10px] uppercase">Fecha de Sesión:</span>
            <div className="border-b border-slate-400 font-medium min-h-[22px] flex items-end">
              {isBlank ? 'DD / MM / AAAA' : (note?.date || new Date().toISOString().split('T')[0])}
            </div>
          </div>
          <div className="col-span-4">
            <span className="font-bold text-slate-700 block text-[10px] uppercase">Horario (Inicio - Fin):</span>
            <div className="border-b border-slate-400 font-medium min-h-[22px] flex items-end">
              {isBlank ? '__:__ h  a  __:__ h' : `${note?.startTime || '09:00'} - ${note?.endTime || '09:50'} (${note?.durationMinutes || 50} min)`}
            </div>
          </div>
          <div className="col-span-4">
            <span className="font-bold text-slate-700 block text-[10px] uppercase">Modalidad:</span>
            <div className="border-b border-slate-400 font-medium min-h-[22px] flex items-center gap-3">
              <span>[{!isBlank && note?.modality !== 'Virtual' ? 'X' : ' '}] Presencial</span>
              <span>[{!isBlank && note?.modality === 'Virtual' ? 'X' : ' '}] Virtual</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2. EVALUACIÓN DEL ESTADO EMOCIONAL Y MENTAL */}
      <div className="mb-3.5 border border-slate-300 rounded-lg overflow-hidden bg-white">
        <div className="bg-[#F0F0F0] px-3 py-1.5 font-bold text-[#1A1A1A] uppercase text-[11px] border-b border-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#620092]"></span>
            2. Evaluación del Estado Emocional y Mental
          </span>
          <span className="text-[9px] font-semibold text-slate-500 font-mono">Sec. 2/7</span>
        </div>
        <div className="p-3 space-y-2">
          <div className="font-bold text-slate-700 text-[10px] uppercase">Predominio Afectivo Observado (Selección Múltiple Rápida):</div>
          <div className="grid grid-cols-4 gap-2 text-xs">
            {categoriesList.map(cat => {
              const isChecked = !isBlank && selectedCategories.includes(cat);
              return (
                <div key={cat} className="flex items-center gap-1.5">
                  <span className="font-mono text-xs font-bold text-[#620092]">[{isChecked ? 'X' : ' '}]</span>
                  <span className="text-slate-800">{cat}</span>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <span className="font-bold text-slate-700 block text-[10px] uppercase">Notas de Afecto, Conducta y Examen Mental (Máx. 250 caracteres):</span>
            {isBlank ? (
              <div className="space-y-0 pt-1">
                <div className="border-b border-slate-300 h-[7.8mm]"></div>
                <div className="border-b border-slate-300 h-[7.8mm]"></div>
              </div>
            ) : (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-slate-800 font-medium text-xs mt-1 min-h-[38px]">
                {note?.affectNotes || note?.objective || 'Paciente con discurso coherente, orientación conservada y afecto congruente con el motivo de consulta.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN 3. CONTENIDO DE LA SESIÓN Y EVOLUCIÓN CLÍNICA */}
      <div className="mb-3.5 border border-slate-300 rounded-lg overflow-hidden bg-white">
        <div className="bg-[#F0F0F0] px-3 py-1.5 font-bold text-[#1A1A1A] uppercase text-[11px] border-b border-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#620092]"></span>
            3. Contenido de la Sesión y Evolución Clínica
          </span>
          <span className="text-[9px] font-semibold text-slate-500 font-mono">Sec. 3/7</span>
        </div>
        <div className="p-3">
          <span className="font-bold text-slate-700 block text-[10px] uppercase mb-1">
            Temas Abordados, Intervenciones Verbales y Respuesta del Paciente:
          </span>
          {isBlank ? (
            <div className="space-y-0 pt-1">
              <div className="border-b border-slate-300 h-[7.8mm]"></div>
              <div className="border-b border-slate-300 h-[7.8mm]"></div>
              <div className="border-b border-slate-300 h-[7.8mm]"></div>
              <div className="border-b border-slate-300 h-[7.8mm]"></div>
              <div className="border-b border-slate-300 h-[7.8mm]"></div>
              <div className="border-b border-slate-300 h-[7.8mm]"></div>
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded leading-relaxed">
                <strong className="text-[#620092] block mb-0.5 font-bold">Relato Subjetivo (S):</strong>
                {note?.subjective}
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded leading-relaxed">
                <strong className="text-[#620092] block mb-0.5 font-bold">Evaluación & Análisis Clínico (A):</strong>
                {note?.assessment}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SECCIÓN 4. TÉCNICAS, INSTRUMENTOS Y EVALUACIONES APLICADAS */}
      <div className="mb-3.5 border border-slate-300 rounded-lg overflow-hidden bg-white">
        <div className="bg-[#F0F0F0] px-3 py-1.5 font-bold text-[#1A1A1A] uppercase text-[11px] border-b border-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#620092]"></span>
            4. Técnicas, Instrumentos y Evaluaciones Aplicadas
          </span>
          <span className="font-mono text-xs font-bold text-[#1A1A1A]">
            Aplica en la sesión: [{appliesTechniques ? 'X' : ' '}] SÍ   [{!appliesTechniques ? 'X' : ' '}] NO
          </span>
        </div>
        <div className="p-3">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-left text-[10px] uppercase font-bold text-slate-700">
                <th className="p-1.5 border-r border-slate-300 w-8 text-center">N°</th>
                <th className="p-1.5 border-r border-slate-300 w-1/2">Instrumento / Técnica Aplicada</th>
                <th className="p-1.5">Resultado / Hallazgo Principal</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2].map((idx) => {
                const item = techniquesList[idx];
                return (
                  <tr key={idx} className="border-b border-slate-200 h-[7.5mm]">
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold font-mono text-slate-500">{idx + 1}.</td>
                    <td className="p-1.5 border-r border-slate-300 font-medium">
                      {isBlank ? '________________________________________________' : (item?.instrument || (idx === 0 && (note?.bdiScore || note?.baiScore) ? 'Escala Psicométrica BECK' : '—'))}
                    </td>
                    <td className="p-1.5 font-medium">
                      {isBlank ? '________________________________________________' : (item?.result || (idx === 0 && (note?.bdiScore || note?.baiScore) ? `BDI-II: ${note?.bdiScore || 0} pts | BAI: ${note?.baiScore || 0} pts` : '—'))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN 5. IMPRESIÓN DIAGNÓSTICA (CIE-10 / CIE-11) */}
      <div className="mb-3.5 border border-slate-300 rounded-lg overflow-hidden bg-white">
        <div className="bg-[#F0F0F0] px-3 py-1.5 font-bold text-[#1A1A1A] uppercase text-[11px] border-b border-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#620092]"></span>
            5. Impresión Diagnóstica (CIE-10 / CIE-11)
          </span>
          <span className="text-[10px] font-medium text-slate-600">Categorización: PRE = Presuntivo | DEF = Definitivo</span>
        </div>
        <div className="p-3">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-300 text-left text-[10px] uppercase font-bold text-slate-700">
                <th className="p-1.5 border-r border-slate-300 w-8 text-center">N°</th>
                <th className="p-1.5 border-r border-slate-300">Diagnóstico / Descripción Clínica</th>
                <th className="p-1.5 border-r border-slate-300 w-28 text-center">Código CIE</th>
                <th className="p-1.5 w-28 text-center">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2, 3].map((idx) => {
                const diag = diagnosesList[idx];
                return (
                  <tr key={idx} className="border-b border-slate-200 h-[7.5mm]">
                    <td className="p-1.5 border-r border-slate-300 text-center font-bold font-mono text-slate-500">{idx + 1}.</td>
                    <td className="p-1.5 border-r border-slate-300 font-medium">
                      {isBlank ? '_____________________________________________________' : (diag?.name || (idx === 0 ? (patient?.primaryDiagnosis || 'Pendiente de Evaluación Inicial') : '—'))}
                    </td>
                    <td className="p-1.5 border-r border-slate-300 font-mono font-bold text-center">
                      {isBlank ? '[_______]' : (diag?.code || (idx === 0 ? (patient?.icd10Code || 'Z00.4') : '—'))}
                    </td>
                    <td className="p-1.5 text-center font-mono font-bold">
                      {isBlank ? '( ) PRE  ( ) DEF' : (
                        diag ? (
                          <span className={diag.type === 'DEF' ? 'text-[#620092]' : 'text-slate-600'}>
                            [{diag.type === 'PRE' ? 'X' : ' '}] PRE   [{diag.type === 'DEF' ? 'X' : ' '}] DEF
                          </span>
                        ) : '( ) PRE  ( ) DEF'
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECCIÓN 6. PLAN TERAPÉUTICO Y COMPROMISOS */}
      <div className="mb-3.5 border border-slate-300 rounded-lg overflow-hidden bg-white">
        <div className="bg-[#F0F0F0] px-3 py-1.5 font-bold text-[#1A1A1A] uppercase text-[11px] border-b border-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#620092]"></span>
            6. Plan Terapéutico y Compromisos
          </span>
          <span className="text-[9px] font-semibold text-slate-500 font-mono">Sec. 6/7</span>
        </div>
        <div className="p-3 space-y-2.5">
          <div>
            <span className="font-bold text-slate-700 block text-[10px] uppercase mb-1">
              Tareas Terapéuticas Asignadas / Acuerdos para la Siguiente Sesión:
            </span>
            {isBlank ? (
              <div className="space-y-0 pt-1">
                <div className="border-b border-slate-300 h-[7.8mm]"></div>
                <div className="border-b border-slate-300 h-[7.8mm]"></div>
                <div className="border-b border-slate-300 h-[7.8mm]"></div>
                <div className="border-b border-slate-300 h-[7.8mm]"></div>
                <div className="border-b border-slate-300 h-[7.8mm]"></div>
              </div>
            ) : (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded leading-relaxed text-xs">
                {note?.plan || '1. Práctica de respiración diafragmática 4-7-8 dos veces al día. 2. Registro cognitivo de pensamientos automáticos ante situaciones disparadoras.'}
              </div>
            )}
          </div>

          <div className="pt-2 grid grid-cols-12 gap-3 text-xs border-t border-slate-200">
            <div className="col-span-5">
              <span className="font-bold text-slate-700 block text-[10px] uppercase">Próxima Cita:</span>
              <div className="border-b border-slate-400 font-medium min-h-[22px] flex items-end">
                {isBlank ? 'DD / MM / AAAA' : (note?.nextSessionDate || 'A convenir con paciente')}
              </div>
            </div>
            <div className="col-span-3">
              <span className="font-bold text-slate-700 block text-[10px] uppercase">Hora Próxima:</span>
              <div className="border-b border-slate-400 font-medium min-h-[22px] flex items-end">
                {isBlank ? '__ : __ h' : (note?.nextSessionTime || '10:00 h')}
              </div>
            </div>
            <div className="col-span-4">
              <span className="font-bold text-slate-700 block text-[10px] uppercase">Frecuencia Recomendada:</span>
              <div className="border-b border-slate-400 font-medium min-h-[22px] flex items-end">
                {isBlank ? '__________________________' : (note?.recommendedFrequency || 'Semanal')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 7. PROFESIONAL RESPONSABLE */}
      <div className="border border-slate-300 rounded-lg overflow-hidden bg-white">
        <div className="bg-[#F0F0F0] px-3 py-1.5 font-bold text-[#1A1A1A] uppercase text-[11px] border-b border-slate-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#620092]"></span>
            7. Profesional Responsable & Firma Digital
          </span>
          <span className="text-[9px] font-semibold text-slate-500 font-mono">Sec. 7/7</span>
        </div>
        <div className="p-4 grid grid-cols-2 gap-6 items-end">
          <div>
            <span className="font-bold text-slate-700 block text-[10px] uppercase">Nombre del Profesional:</span>
            <div className="border-b border-slate-400 font-bold text-slate-800 text-xs py-1">
              {therapistName}
            </div>
            <span className="font-bold text-slate-700 block text-[10px] uppercase mt-2">N° Identificación / Registro Senescyt:</span>
            <div className="border-b border-slate-400 font-mono text-slate-800 text-xs py-1">
              {senescytNumber}
            </div>
          </div>

          <div className="text-center space-y-1">
            <div className="h-20 border-b border-slate-400 flex items-center justify-center relative bg-slate-50/50">
              {!isBlank && note?.therapistSignature ? (
                <img src={note.therapistSignature} alt="Firma del Profesional" className="max-h-16 object-contain mx-auto" />
              ) : (
                <span className="text-slate-400 text-[10px] italic">___________________________________<br/>Firma y Sello del Profesional</span>
              )}
            </div>
            <span className="text-[10px] font-bold text-slate-600 block uppercase">Firma Electrónica / Registro Sanitario</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-2 border-t border-slate-200 text-center text-[9px] text-slate-400 font-mono">
        Ukiana Clinical Information System · Documento Normativo Reservado Confidencialidad Secreto Profesional
      </div>
    </div>
  );
};
