import React from 'react';
import { Patient, InitialInterviewData } from '../../types';
import { ShieldAlert, CheckCircle2, User, Calendar, Award, FileText, AlertTriangle } from 'lucide-react';

interface EntrevistaPdfTemplateProps {
  patient: Patient;
  interview: InitialInterviewData;
  therapistName?: string;
  therapistLicense?: string;
  therapistRole?: string;
}

export const EntrevistaPdfTemplate: React.FC<EntrevistaPdfTemplateProps> = ({
  patient,
  interview,
  therapistName = 'Dr. Alejandro Reyes',
  therapistLicense = 'Senescyt N° 1005-2024-2849102',
  therapistRole = 'Psicólogo Especialista Sanitario'
}) => {
  const isHighRisk = interview.riesgo_vital_nivel !== 'sin_riesgo';

  return (
    <div 
      id="clinical-interview-pdf-document"
      className="bg-white text-[#2D2832] font-sans p-8 md:p-12 max-w-4xl mx-auto shadow-none print:p-0 print:m-0 print:shadow-none print:max-w-none space-y-8 text-xs leading-relaxed"
    >
      {/* 1. Encabezado Oficial / Membrete Clínico */}
      <header className="border-b-2 border-[#620092] pb-5 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#620092] text-white font-black text-xl flex items-center justify-center shadow-md tracking-tighter print:shadow-none">
            uk
          </div>
          <div>
            <h2 className="text-base font-black text-[#620092] tracking-tight uppercase">
              Ukiana · Consultorio de Psicología Clínica
            </h2>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide">
              Departamento de Evaluación Diagnóstica & Salud Mental Integral
            </p>
            <p className="text-[9px] text-slate-400">
              Acreditación Sanitaria y Registro Oficial Profesional
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-block px-3 py-1 bg-[#F8F0FC] text-[#620092] font-extrabold text-[10px] rounded-lg border border-[#E6D2F3] uppercase tracking-wider">
            Documento Clínico Oficial
          </span>
          <p className="text-[10px] text-slate-500 font-bold mt-1.5">
            Ref: UK-INT-{interview.meta_paciente_id.slice(-6).toUpperCase()}
          </p>
          <p className="text-[9px] text-slate-400">
            Fecha: {interview.meta_fecha}
          </p>
        </div>
      </header>

      {/* Título Principal */}
      <div className="text-center space-y-1">
        <h1 className="text-lg font-black text-[#2D2832] tracking-wide uppercase">
          Informe de Entrevista Inicial y Evaluación Clínica
        </h1>
        <p className="text-[11px] text-slate-500 font-medium">
          Historia Clínica Semiestructurada y Examen del Estado Mental
        </p>
      </div>

      {/* 2. Ficha Estructurada del Paciente (Header Card) */}
      <section className="bg-[#F8F9FA] rounded-2xl border border-slate-200/90 p-5 space-y-3 print:bg-slate-50">
        <h3 className="text-[11px] font-black text-[#620092] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/80 pb-1.5">
          <User className="w-3.5 h-3.5 text-[#620092]" />
          1. Ficha del Paciente y Metadatos de Evaluación
        </h3>

        <div className="flex items-start gap-4">
          {patient.avatar && (
            <img
              src={patient.avatar}
              alt={patient.fullName}
              className="w-14 h-14 rounded-xl object-cover border border-slate-200 shrink-0 mt-0.5 shadow-2xs"
            />
          )}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-6 text-[11px]">
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Nombre Completo</span>
              <span className="font-extrabold text-[#2D2832]">{patient.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Cédula / DNI / ID</span>
              <span className="font-bold text-[#2D2832]">{patient.idNumber || patient.id}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Edad / Sexo</span>
              <span className="font-bold text-[#2D2832]">{patient.age} años · {patient.gender}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Profesional Responsable</span>
              <span className="font-bold text-[#2D2832]">{interview.meta_terapeuta_nombre || therapistName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Fecha de Evaluación</span>
              <span className="font-bold text-[#2D2832]">{interview.meta_fecha}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] uppercase font-bold tracking-wider">Vía de Derivación</span>
              <span className="font-bold text-[#620092]">{interview.eval_derivacion_tipo}</span>
            </div>
          </div>
        </div>
      </section>


      {/* 3. Motivo de Consulta y Examen de Entrada */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-[#2D2832] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1 text-[#620092]">
          2. Examen del Estado de Entrada & Motivo de Consulta
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-500 block text-[10px] font-bold">Orientación Témporo-Espacial:</span>
            <span className="font-extrabold text-[#2D2832]">{interview.eval_orientacion}</span>
            {interview.eval_orientacion_detalle && (
              <p className="text-[10px] text-amber-800 italic mt-1 bg-amber-50 p-1.5 rounded border border-amber-200">
                Detalle: {interview.eval_orientacion_detalle}
              </p>
            )}
          </div>
          <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
            <span className="text-slate-500 block text-[10px] font-bold">Tipo de Afecto Predominante:</span>
            <span className="font-extrabold text-[#2D2832]">{interview.eval_tipo_afecto}</span>
          </div>
        </div>

        <div>
          <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider mb-1.5">
            Motivo de Consulta (Narrativa Manifestada):
          </span>
          <div className="p-4 bg-[#F8F9FA] rounded-xl border-l-[3px] border-[#620092] text-slate-700 italic text-[11px] leading-relaxed">
            "{interview.eval_motivo_consulta}"
          </div>
        </div>
      </section>

      {/* 4. Sintomatología y Fenomenología */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-[#2D2832] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1 text-[#620092]">
          3. Sintomatología, Fenomenología y Evolución
        </h3>

        <div>
          <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider mb-1.5">
            Experiencia Sintomática Actual:
          </span>
          <div className="p-4 bg-[#F8F9FA] rounded-xl border-l-[3px] border-[#0E7CB5] text-slate-700 italic text-[11px] leading-relaxed">
            "{interview.sint_experiencia_actual}"
          </div>
        </div>

        {/* 2 Columnas Métricas */}
        <div className="grid grid-cols-2 gap-4">
          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/60">
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Línea de Tiempo / Curso</span>
            <span className="font-bold text-[#2D2832]">{interview.sint_linea_tiempo}</span>
          </div>
          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/60">
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Ritmo Psicomotor</span>
            <span className="font-bold text-[#2D2832]">{interview.sint_ritmo_psicomotor}</span>
          </div>
        </div>

        <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/60">
          <span className="text-slate-400 block text-[9px] uppercase font-bold mb-1">Factores Desencadenantes Identificados</span>
          <div className="flex flex-wrap gap-1.5">
            {interview.sint_desencadenantes?.map((item, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-700">
                • {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Examen Fisiológico y Somático */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-[#2D2832] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1 text-[#620092]">
          4. Examen Fisiológico, Patrón de Sueño y Somatizaciones
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/60">
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Apetito y Variaciones de Peso</span>
            <span className="font-bold text-[#2D2832]">{interview.somat_apetito_peso}</span>
          </div>
          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/60">
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Energía Corporal y Fatiga</span>
            <span className="font-bold text-[#2D2832]">{interview.somat_energia_corporal}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/60">
            <span className="text-slate-400 block text-[9px] uppercase font-bold mb-1">Patrón de Sueño</span>
            <div className="space-y-1">
              {interview.somat_patron_sueno?.map((s, idx) => (
                <div key={idx} className="text-[10px] text-slate-700 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#620092]"></span>
                  {s}
                </div>
              ))}
            </div>
          </div>

          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/60">
            <span className="text-slate-400 block text-[9px] uppercase font-bold mb-1">Somatizaciones Notificadas</span>
            <div className="space-y-1">
              {interview.somat_somatizaciones?.map((s, idx) => (
                <div key={idx} className="text-[10px] text-slate-700 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0E7CB5]"></span>
                  {s}
                </div>
              ))}
              {interview.somat_somatizaciones_otros && (
                <p className="text-[10px] text-slate-500 italic mt-1">
                  Otros: {interview.somat_somatizaciones_otros}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Memoria Biográfica, Clima Familiar y Trauma */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-[#2D2832] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1 text-[#620092]">
          5. Memoria Biográfica, Estructura Familiar y Trauma
        </h3>

        <div>
          <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider mb-1.5">
            Narrativa de Infancia y Desarrollo:
          </span>
          <div className="p-4 bg-[#F8F9FA] rounded-xl border-l-[3px] border-[#620092] text-slate-700 italic text-[11px] leading-relaxed">
            "{interview.bio_narrativa_infancia}"
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/60">
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Clima Familiar Percibido</span>
            <span className="font-bold text-[#2D2832]">{interview.bio_clima_familiar}</span>
          </div>
          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/60">
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Rol Asumido en Origen</span>
            <span className="font-bold text-[#2D2832]">{interview.bio_rol_asumido}</span>
          </div>
          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/60">
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Validación Emocional</span>
            <span className="font-bold text-[#2D2832]">{interview.bio_validacion_emocional}</span>
          </div>
          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/60">
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Adaptación Social y Escolar</span>
            <span className="font-bold text-[#2D2832]">{interview.bio_adaptacion_social}</span>
          </div>
        </div>

        {interview.bio_narrativa_trauma && (
          <div>
            <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider mb-1.5">
              Narrativa de Eventos Adversos o Trauma:
            </span>
            <div className="p-4 bg-[#F8F9FA] rounded-xl border-l-[3px] border-amber-600 text-slate-700 italic text-[11px] leading-relaxed">
              "{interview.bio_narrativa_trauma}"
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <span className="text-[11px] font-bold text-slate-700">Sintomatología compatible con trauma / Criterios TEPT:</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${interview.bio_criterios_tept ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
            {interview.bio_criterios_tept ? 'Presente / Sospecha Clínica' : 'No se aprecian criterios activos'}
          </span>
        </div>
      </section>

      {/* 7. Esfera Cognitiva, Autopercepción y Protocolo de Riesgo */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-[#2D2832] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1 text-[#620092]">
          6. Esfera Cognitiva, Foco de Pensamiento y Evaluación de Riesgo Vital
        </h3>

        {/* Badge / Banner de Riesgo Vital */}
        {isHighRisk ? (
          <div className="p-4 bg-red-50 border-2 border-red-500 rounded-2xl text-red-900 space-y-2">
            <div className="flex items-center gap-2 font-black uppercase text-xs text-red-700">
              <AlertTriangle className="w-5 h-5 text-red-600 animate-pulse" />
              ALERTA CLÍNICA: PROTOCOLO DE SEGURIDAD Y RIESGO VITAL ACTIVADO
            </div>
            <p className="text-[11px] font-bold">
              Nivel de Riesgo Vital Detectado: <span className="underline uppercase">{interview.riesgo_vital_nivel.replace(/_/g, ' ')}</span>
            </p>
            {interview.riesgo_detalle_evaluacion && (
              <div className="bg-white/80 p-3 rounded-xl border border-red-200 text-[10px] italic">
                <strong>Medidas & Observaciones de Seguridad:</strong> {interview.riesgo_detalle_evaluacion}
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="text-[11px] font-bold">Valoración de Riesgo Vital: Sin riesgo activo detectado en evaluación inicial.</span>
          </div>
        )}

        <div>
          <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider mb-1.5">
            Pensamiento Predominante y Estilo Cognitivo:
          </span>
          <div className="p-4 bg-[#F8F9FA] rounded-xl border-l-[3px] border-[#620092] text-slate-700 italic text-[11px] leading-relaxed">
            "{interview.cog_pensamiento_predominante}"
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/60">
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Atención y Concentración</span>
            <span className="font-bold text-[#2D2832]">{interview.cog_atencion}</span>
          </div>
          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/60">
            <span className="text-slate-400 block text-[9px] uppercase font-bold mb-1">Foco Cognitivo / Distorsiones</span>
            <div className="flex flex-wrap gap-1">
              {interview.cog_foco_cognitivo?.map((f, idx) => (
                <span key={idx} className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[9px] font-semibold text-slate-700">
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 8. Red Social, Vínculos y Dinámica Vincular */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-[#2D2832] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1 text-[#620092]">
          7. Red Social, Cotidianeidad y Esfera Vincular
        </h3>

        <div>
          <span className="text-slate-500 block text-[10px] font-bold uppercase tracking-wider mb-1.5">
            Vínculos Significativos y Red de Apoyo:
          </span>
          <div className="p-4 bg-[#F8F9FA] rounded-xl border-l-[3px] border-[#0E7CB5] text-slate-700 italic text-[11px] leading-relaxed">
            "{interview.soc_vinculos_red_apoyo}"
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/60">
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Dinámica Vincular / Estilo de Apego</span>
            <span className="font-bold text-[#2D2832]">{interview.soc_dinamica_vincular}</span>
          </div>
          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/60">
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Capacidad Hedónica / Anhedonia</span>
            <span className="font-bold text-[#2D2832]">{interview.soc_anhedonia}</span>
          </div>
        </div>
      </section>

      {/* 9. Antecedentes Médicos, Psiquiátricos y Consumos */}
      <section className="space-y-4">
        <h3 className="text-xs font-black text-[#2D2832] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-1 text-[#620092]">
          8. Antecedentes Clínicos, Médicos y Sustancias
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/60">
            <span className="text-slate-400 block text-[9px] uppercase font-bold mb-1">Historia Clínica Previa</span>
            <div className="space-y-1">
              {interview.ant_historia_previa?.map((h, idx) => (
                <div key={idx} className="text-[10px] text-slate-700 font-medium">
                  • {h}
                </div>
              ))}
            </div>
          </div>

          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/60">
            <span className="text-slate-400 block text-[9px] uppercase font-bold mb-1">Consumo de Sustancias</span>
            <div className="space-y-1">
              {interview.ant_sustancias_consumo?.map((s, idx) => (
                <div key={idx} className="text-[10px] text-slate-700 font-medium">
                  • {s}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/60">
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Enfermedad Médica Diagnosticada</span>
            <span className="font-bold text-[#2D2832]">
              {interview.ant_enfermedad_medica_flag ? `Sí (${interview.ant_enfermedad_medica_detalle})` : 'Sin enfermedades médicas reportadas'}
            </span>
          </div>
          <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/60">
            <span className="text-slate-400 block text-[9px] uppercase font-bold">Psicofármacos / Tratamiento Actual</span>
            <span className="font-bold text-[#2D2832]">
              {interview.ant_farmacos_flag ? `Sí (${interview.ant_farmacos_detalle})` : 'Sin medicación psicofarmacológica activa'}
            </span>
          </div>
        </div>
      </section>

      {/* 10. Sección de Firmas y Sello Profesional */}
      <footer className="pt-10 border-t-2 border-slate-200 space-y-6 break-inside-avoid">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-8 pt-4">
          
          <div className="text-center sm:text-left space-y-1">
            <div className="w-48 border-b-2 border-slate-400 pb-1 mb-2">
              <span className="text-[10px] text-slate-400 italic">Firma Digital Registrada</span>
            </div>
            <p className="font-extrabold text-[#2D2832] text-xs">
              {interview.meta_terapeuta_nombre || therapistName}
            </p>
            <p className="text-[10px] text-slate-500 font-medium">
              {therapistRole}
            </p>
            <p className="text-[9px] text-[#620092] font-bold">
              {therapistLicense}
            </p>
          </div>

          <div className="w-36 h-28 border-2 border-dashed border-[#620092]/30 rounded-2xl flex flex-col items-center justify-center p-3 text-center bg-[#F8F0FC]/40">
            <Award className="w-6 h-6 text-[#620092] mb-1" />
            <span className="text-[8px] font-black text-[#620092] uppercase tracking-wider">
              Sello Profesional
            </span>
            <span className="text-[7px] text-slate-400">
              Ukiana Clinical Health System
            </span>
          </div>
        </div>

        {/* Paginación y Confidencialidad */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[8px] text-slate-400 font-medium">
          <span>Cláusula de Confidencialidad Sanitaria y Secreto Profesional (Ley Orgánica de Protección de Datos).</span>
          <span className="font-bold">Página 1 de 1 · ID Paciente: {patient.id}</span>
        </div>
      </footer>
    </div>
  );
};
