import React from 'react';
import { User, Calendar, AlertTriangle, Shield, FileText } from 'lucide-react';

interface EntrevistaBlancoPdfTemplateProps {
  therapistName?: string;
  therapistLicense?: string;
}

export const EntrevistaBlancoPdfTemplate: React.FC<EntrevistaBlancoPdfTemplateProps> = ({
  therapistName = 'Dr. Alejandro Reyes',
  therapistLicense = 'Senescyt N° 1005-2024-2849102'
}) => {
  return (
    <div 
      id="blank-interview-pdf-document"
      className="bg-white text-[#2D2832] font-sans p-8 md:p-12 max-w-4xl mx-auto shadow-none print:p-0 print:m-0 print:shadow-none print:max-w-none space-y-7 text-xs leading-relaxed"
    >
      {/* 1. Encabezado Oficial / Membrete Clínico */}
      <header className="border-b-2 border-[#620092] pb-4 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#620092] text-white font-black text-xl flex items-center justify-center shadow-md tracking-tighter print:shadow-none">
            uk
          </div>
          <div>
            <h2 className="text-base font-black text-[#620092] tracking-tight uppercase">
              Ukiana · Consultorio de Psicología Clínica
            </h2>
            <p className="text-[10px] text-slate-500 font-medium tracking-wide">
              Protocolo Clínico Semiestructurado · Formato de Llenado Manual
            </p>
            <p className="text-[9px] text-slate-400">
              Acreditación Sanitaria y Registro Oficial Profesional
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-block px-3 py-1 bg-[#F8F0FC] text-[#620092] font-extrabold text-[10px] rounded-lg border border-[#E6D2F3] uppercase tracking-wider">
            Plantilla Impresa
          </span>
          <p className="text-[10px] text-slate-500 font-bold mt-1.5">
            Ref: UK-INT-PROTOCOLO-BLANCO
          </p>
          <p className="text-[10px] text-slate-500 font-medium">
            Fecha: _____ / _____ / 202__
          </p>
        </div>
      </header>

      {/* Título Principal */}
      <div className="text-center space-y-1">
        <h1 className="text-base font-black text-[#2D2832] tracking-wide uppercase">
          Entrevista Inicial y Evaluación Clínica Semiestructurada
        </h1>
        <p className="text-[10px] text-slate-500 font-medium">
          Instrumento de Anamnesis, Examen del Estado Mental y Cribado de Riesgo
        </p>
      </div>

      {/* 1. Ficha del Paciente y Metadatos */}
      <section className="bg-[#F8F9FA] rounded-2xl border border-slate-200/90 p-4 space-y-3 print:bg-slate-50">
        <h3 className="text-[11px] font-black text-[#620092] uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200/80 pb-1">
          <User className="w-3.5 h-3.5 text-[#620092]" />
          1. Filiación e Identificación del Paciente
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3.5 gap-x-6 text-[11px]">
          <div className="col-span-2">
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Nombre Completo:</span>
            <div className="border-b border-slate-300 h-5 mt-0.5"></div>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Cédula / DNI / ID:</span>
            <div className="border-b border-slate-300 h-5 mt-0.5"></div>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Fecha Nac. / Edad:</span>
            <div className="border-b border-slate-300 h-5 mt-0.5"></div>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Sexo / Género:</span>
            <div className="flex items-center gap-3 pt-1 text-[10px]">
              <span>[ &nbsp; ] Femenino</span>
              <span>[ &nbsp; ] Masculino</span>
              <span>[ &nbsp; ] Otro</span>
            </div>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Teléfono / Contacto:</span>
            <div className="border-b border-slate-300 h-5 mt-0.5"></div>
          </div>
          <div>
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Profesional Responsable:</span>
            <span className="font-bold text-[#2D2832]">{therapistName} ({therapistLicense})</span>
          </div>
          <div className="col-span-2">
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Vía de Derivación:</span>
            <div className="flex items-center gap-3 pt-1 text-[10px]">
              <span>[ &nbsp; ] Espontánea</span>
              <span>[ &nbsp; ] Médica</span>
              <span>[ &nbsp; ] Escolar / Laboral</span>
              <span>[ &nbsp; ] Familiar / Terceros</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Examen de Entrada y Orientación */}
      <section className="space-y-3">
        <h3 className="text-[11px] font-black text-[#620092] uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center justify-between">
          <span>2. Examen de Entrada, Orientación y Motivo de Consulta</span>
          <span className="text-[9px] font-bold text-slate-400">Paso 0</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-1.5">Orientación Témporo-Espacial:</span>
            <div className="space-y-1 text-[10px]">
              <p>[ &nbsp; ] Lúcido y orientado en tiempo, espacio y persona</p>
              <p>[ &nbsp; ] Desorientado temporo-espacial / Confusional</p>
            </div>
          </div>

          <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-1.5">Tipo de Afecto Predominante:</span>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <span>[ &nbsp; ] Eutímico</span>
              <span>[ &nbsp; ] Depresivo</span>
              <span>[ &nbsp; ] Ansioso / Angustiado</span>
              <span>[ &nbsp; ] Lábil / Irritable</span>
              <span>[ &nbsp; ] Aplanado / Inexpresivo</span>
            </div>
          </div>
        </div>

        <div>
          <span className="text-slate-600 block text-[10px] uppercase font-bold tracking-wider mb-1">
            Motivo de Consulta y Expresión Subjetiva:
          </span>
          <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2.5">
            <div className="border-b border-slate-200 h-4"></div>
            <div className="border-b border-slate-200 h-4"></div>
            <div className="border-b border-slate-200 h-4"></div>
            <div className="border-b border-slate-200 h-4"></div>
          </div>
        </div>
      </section>

      {/* 3. Sintomatología y Fenomenología */}
      <section className="space-y-3">
        <h3 className="text-[11px] font-black text-[#620092] uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center justify-between">
          <span>3. Sintomatología, Fenomenología y Curso</span>
          <span className="text-[9px] font-bold text-slate-400">Paso 1</span>
        </h3>

        <div>
          <span className="text-slate-600 block text-[10px] uppercase font-bold tracking-wider mb-1">
            Experiencia Sintomática Actual (Narrativa del Paciente):
          </span>
          <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2.5">
            <div className="border-b border-slate-200 h-4"></div>
            <div className="border-b border-slate-200 h-4"></div>
            <div className="border-b border-slate-200 h-4"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
          <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-1">Línea de Tiempo / Curso:</span>
            <div className="space-y-1">
              <p>[ &nbsp; ] Agudo (&lt; 1 mes)</p>
              <p>[ &nbsp; ] Subagudo (1-6 meses)</p>
              <p>[ &nbsp; ] Crónico (&gt; 6 meses)</p>
              <p>[ &nbsp; ] Episódico / Recurrente</p>
            </div>
          </div>

          <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-1">Ritmo Psicomotor:</span>
            <div className="space-y-1">
              <p>[ &nbsp; ] Normal / Eutímico</p>
              <p>[ &nbsp; ] Agitación / Inquietud psicomotriz</p>
              <p>[ &nbsp; ] Enlentecimiento / Inhibición motora</p>
            </div>
          </div>
        </div>

        <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200/80">
          <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-1">Factores Desencadenantes Identificados:</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px]">
            <span>[ &nbsp; ] Duelo / Pérdida</span>
            <span>[ &nbsp; ] Quiebre relacional</span>
            <span>[ &nbsp; ] Estrés laboral / Académico</span>
            <span>[ &nbsp; ] Transición o cambio vital</span>
            <span>[ &nbsp; ] Conflicto familiar</span>
            <span>[ &nbsp; ] Trauma o violencia</span>
            <span>[ &nbsp; ] Ninguno identificable</span>
          </div>
        </div>
      </section>

      {/* 4. Examen Fisiológico y Somático */}
      <section className="space-y-3">
        <h3 className="text-[11px] font-black text-[#620092] uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center justify-between">
          <span>4. Examen Fisiológico y Somático</span>
          <span className="text-[9px] font-bold text-slate-400">Paso 2</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px]">
          <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-1">Patrón de Sueño:</span>
            <div className="space-y-1">
              <p>[ &nbsp; ] Normal / Reparador</p>
              <p>[ &nbsp; ] Insomnio de conciliación</p>
              <p>[ &nbsp; ] Despertar precoz</p>
              <p>[ &nbsp; ] Hipersomnia</p>
            </div>
          </div>

          <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-1">Apetito y Peso:</span>
            <div className="space-y-1">
              <p>[ &nbsp; ] Conservado / Estable</p>
              <p>[ &nbsp; ] Hiporexia (Disminución)</p>
              <p>[ &nbsp; ] Hiperfagia (Aumento)</p>
            </div>
          </div>

          <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-1">Energía Corporal:</span>
            <div className="space-y-1">
              <p>[ &nbsp; ] Normal / Eutímica</p>
              <p>[ &nbsp; ] Astenia / Fatiga leve</p>
              <p>[ &nbsp; ] Agotamiento severo</p>
            </div>
          </div>
        </div>

        <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200/80">
          <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-1">Somatizaciones y Síntomas Físicos:</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[10px]">
            <span>[ &nbsp; ] Cefaleas / Migrañas</span>
            <span>[ &nbsp; ] Opresión torácica</span>
            <span>[ &nbsp; ] Molestias digestivas</span>
            <span>[ &nbsp; ] Tensión muscular / Dolor</span>
            <span>[ &nbsp; ] Mareos / Vértigos</span>
            <span>[ &nbsp; ] Ninguna somatización</span>
          </div>
          <div className="mt-2 text-[10px] flex items-center gap-2">
            <span>Otras somatizaciones:</span>
            <div className="border-b border-slate-300 flex-1 h-3"></div>
          </div>
        </div>
      </section>

      {/* 5. Memoria Biográfica y Trauma */}
      <section className="space-y-3">
        <h3 className="text-[11px] font-black text-[#620092] uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center justify-between">
          <span>5. Memoria Biográfica, Clima Familiar y Trauma</span>
          <span className="text-[9px] font-bold text-slate-400">Paso 3</span>
        </h3>

        <div>
          <span className="text-slate-600 block text-[10px] uppercase font-bold tracking-wider mb-1">
            Narrativa de Infancia y Desarrollo Temprano:
          </span>
          <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2.5">
            <div className="border-b border-slate-200 h-4"></div>
            <div className="border-b border-slate-200 h-4"></div>
            <div className="border-b border-slate-200 h-4"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
          <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-1">Clima Familiar de Origen:</span>
            <div className="space-y-1">
              <p>[ &nbsp; ] Cálido y seguro</p>
              <p>[ &nbsp; ] Hostil / Conflictivo</p>
              <p>[ &nbsp; ] Rígido / Exigente</p>
              <p>[ &nbsp; ] Negligente / Distante</p>
            </div>
          </div>

          <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-1">Indicador de Trauma / TEPT:</span>
            <div className="space-y-1">
              <p>[ &nbsp; ] Síndrome TEPT evidente / Flashbacks</p>
              <p>[ &nbsp; ] Evento adverso significativo sin TEPT</p>
              <p>[ &nbsp; ] Sin antecedentes traumáticos relevantes</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Esfera Cognitiva y Cribado de Riesgo Vital */}
      <section className="space-y-3">
        <h3 className="text-[11px] font-black text-[#620092] uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center justify-between">
          <span>6. Esfera Cognitiva y Cribado de Riesgo Vital</span>
          <span className="text-[9px] font-bold text-slate-400">Paso 4</span>
        </h3>

        <div className="bg-[#FFF8E7] border border-[#FFE7A8] p-3.5 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-[#5C4E00] font-black text-[11px] uppercase">
            <AlertTriangle className="w-4 h-4 text-[#D97706]" />
            <span>Cribado de Riesgo Vital y Seguridad Clínica (Obligatorio)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-[#2D2832] font-semibold">
            <span>[ &nbsp; ] Sin riesgo evidente</span>
            <span>[ &nbsp; ] Ideación pasiva</span>
            <span>[ &nbsp; ] Ideación activa con plan</span>
            <span>[ &nbsp; ] Autolesiones sin fin letal</span>
          </div>
          <div className="pt-1">
            <span className="text-[9px] uppercase font-bold text-slate-500">Evaluación / Plan de Seguridad si aplica:</span>
            <div className="border-b border-slate-300 h-4 mt-0.5"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px]">
          <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-1">Foco Cognitivo / Distorsiones:</span>
            <div className="space-y-1">
              <p>[ &nbsp; ] Autoexigencia / Perfeccionismo</p>
              <p>[ &nbsp; ] Rumiación / Catastrofismo</p>
              <p>[ &nbsp; ] Desesperanza / Indefensión</p>
              <p>[ &nbsp; ] Ideación intrusiva</p>
            </div>
          </div>

          <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-1">Atención y Concentración:</span>
            <div className="space-y-1">
              <p>[ &nbsp; ] Normal / Focalizada</p>
              <p>[ &nbsp; ] Dispersa / Distraibilidad leve</p>
              <p>[ &nbsp; ] Hipoprosexia severa</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Red Social, Antecedentes y Consumos */}
      <section className="space-y-3">
        <h3 className="text-[11px] font-black text-[#620092] uppercase tracking-wider border-b border-slate-200 pb-1 flex items-center justify-between">
          <span>7. Red Social, Antecedentes Clínicos y Consumos</span>
          <span className="text-[9px] font-bold text-slate-400">Pasos 5 y 6</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px]">
          <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-1">Dinámica Vincular / Apego:</span>
            <div className="space-y-1">
              <p>[ &nbsp; ] Seguro / Estable</p>
              <p>[ &nbsp; ] Ansioso / Dependiente</p>
              <p>[ &nbsp; ] Evitativo / Distante</p>
              <p>[ &nbsp; ] Desorganizado</p>
            </div>
          </div>

          <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-1">Enfermedad Médica / Fármacos:</span>
            <div className="space-y-1">
              <p>[ &nbsp; ] Sin patología médica</p>
              <p>[ &nbsp; ] Con patología médica crónica</p>
              <p>[ &nbsp; ] Bajo tratamiento psicofarmacológico</p>
            </div>
          </div>

          <div className="bg-[#F8F9FA] p-3 rounded-xl border border-slate-200/80">
            <span className="text-slate-500 block text-[9px] uppercase font-bold tracking-wider mb-1">Consumo de Sustancias:</span>
            <div className="space-y-1">
              <p>[ &nbsp; ] Sin consumos relevantes</p>
              <p>[ &nbsp; ] Alcohol / Tabaco social</p>
              <p>[ &nbsp; ] Consumo problemático activo</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Impresión Diagnóstica y Firma Profesional */}
      <section className="border-t-2 border-slate-200 pt-5 space-y-4">
        <div>
          <span className="text-slate-600 block text-[10px] uppercase font-bold tracking-wider mb-1">
            Impresión Diagnóstica Preliminar / Plan Terapéutico Propuesto:
          </span>
          <div className="border border-slate-200 rounded-xl p-3 bg-white space-y-2.5">
            <div className="border-b border-slate-200 h-4"></div>
            <div className="border-b border-slate-200 h-4"></div>
            <div className="border-b border-slate-200 h-4"></div>
          </div>
        </div>

        <div className="pt-6 grid grid-cols-2 gap-8 text-center text-[10px]">
          <div className="space-y-1">
            <div className="border-b border-slate-300 w-48 mx-auto h-10"></div>
            <p className="font-bold text-[#2D2832]">Firma del Paciente / Representante</p>
            <p className="text-slate-400 text-[9px]">Consentimiento Informado Recibido</p>
          </div>

          <div className="space-y-1">
            <div className="border-b border-slate-300 w-48 mx-auto h-10"></div>
            <p className="font-bold text-[#620092]">{therapistName}</p>
            <p className="text-slate-500 text-[9px] font-medium">{therapistLicense}</p>
            <p className="text-slate-400 text-[9px]">Psicólogo Clínico Responsable</p>
          </div>
        </div>
      </section>

      {/* Pie de Página */}
      <footer className="pt-4 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400 font-medium">
        <span>Ukiana · Sistema Integral de Gestión Clínica Psicológica</span>
        <span>Página 1 de 1 · Formato Clínico Oficial para Uso Físico</span>
      </footer>
    </div>
  );
};
