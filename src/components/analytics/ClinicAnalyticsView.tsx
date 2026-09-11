import React, { useState } from 'react';
import { 
  BarChart3, 
  Users, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  PieChart as PieChartIcon, 
  Calendar,
  Zap,
  Activity
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  CartesianGrid
} from 'recharts';
import { Patient, ClinicalNote, ClinicAlert } from '../../types';

interface ClinicAnalyticsViewProps {
  patients?: Patient[];
  notes?: ClinicalNote[];
  alerts?: ClinicAlert[];
}

export const ClinicAnalyticsView: React.FC<ClinicAnalyticsViewProps> = ({
  patients = [],
  notes = [],
  alerts = []
}) => {
  const [timeframe, setTimeframe] = useState<'month' | 'quarter' | 'year'>('month');

  // Dynamic KPI Calculations from Real Data
  const activePatientsCount = patients.filter(p => p.status === 'Activo').length;
  const avgAdherence = patients.length > 0
    ? Math.round(patients.reduce((acc, p) => acc + (p.adherenceRate || 100), 0) / patients.length)
    : 0;
  const completedSessionsCount = notes.length;
  
  // Group Patients by Diagnosis for Pie Chart
  const diagnosisMap: { [key: string]: number } = {};
  patients.forEach(p => {
    const diag = p.primaryDiagnosis || 'Sin Diagnóstico';
    diagnosisMap[diag] = (diagnosisMap[diag] || 0) + 1;
  });

  const diagnosisDistribution = Object.keys(diagnosisMap).map(diag => ({
    name: diag,
    count: diagnosisMap[diag]
  }));

  // Build Monthly Recovery Trend Data from Notes
  const monthlyNotesMap: { [key: string]: { baiSum: number; bdiSum: number; count: number } } = {};
  notes.forEach(n => {
    const monthKey = n.date ? n.date.substring(0, 7) : 'Mes Actual';
    if (!monthlyNotesMap[monthKey]) {
      monthlyNotesMap[monthKey] = { baiSum: 0, bdiSum: 0, count: 0 };
    }
    monthlyNotesMap[monthKey].baiSum += (n.baiScore || 0);
    monthlyNotesMap[monthKey].bdiSum += (n.bdiScore || 0);
    monthlyNotesMap[monthKey].count += 1;
  });

  const recoveryTrendData = Object.keys(monthlyNotesMap).map(m => ({
    month: m,
    baiAvg: Math.round(monthlyNotesMap[m].baiSum / monthlyNotesMap[m].count),
    bdiAvg: Math.round(monthlyNotesMap[m].bdiSum / monthlyNotesMap[m].count)
  }));

  // Treatment retention cohorts
  const totalPats = patients.length || 1;
  const retentionCohort = [
    { sessions: '1 - 4 Sesiones', status: 'Evaluación', percentage: Math.round((patients.filter(p => p.totalSessions >= 1).length / totalPats) * 100) },
    { sessions: '5 - 10 Sesiones', status: 'Intervención', percentage: Math.round((patients.filter(p => p.totalSessions >= 5).length / totalPats) * 100) },
    { sessions: '11 - 18 Sesiones', status: 'Consolidación', percentage: Math.round((patients.filter(p => p.totalSessions >= 11).length / totalPats) * 100) },
    { sessions: '19+ Sesiones', status: 'Seguimiento / Alta', percentage: Math.round((patients.filter(p => p.totalSessions >= 19).length / totalPats) * 100) }
  ];

  const paletteColors = ['#620092', '#50B3E5', '#FFCD69', '#7905AD', '#0E7CB5', '#E6D2F3'];

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-[#2D2832] flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-[#620092]" />
            Analíticas & Métricas Clínicas
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Indicadores asistenciales calculados en tiempo real según el registro de pacientes y notas
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl text-xs font-semibold text-slate-600">
          <button
            onClick={() => setTimeframe('month')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${timeframe === 'month' ? 'bg-[#620092] text-white font-bold shadow-xs' : 'hover:text-[#2D2832]'}`}
          >
            Este Mes
          </button>
          <button
            onClick={() => setTimeframe('quarter')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${timeframe === 'quarter' ? 'bg-[#620092] text-white font-bold shadow-xs' : 'hover:text-[#2D2832]'}`}
          >
            Último Trimestre
          </button>
          <button
            onClick={() => setTimeframe('year')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${timeframe === 'year' ? 'bg-[#620092] text-white font-bold shadow-xs' : 'hover:text-[#2D2832]'}`}
          >
            Año en Curso
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Pacientes Activos</span>
            <div className="w-8 h-8 rounded-xl bg-[#F8F0FC] text-[#620092] flex items-center justify-center border border-[#E6D2F3]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#2D2832]">{activePatientsCount}</span>
            <span className="text-xs font-bold text-[#0E7CB5]">de {patients.length} registrados</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Tasa Promedio Adherencia</span>
            <div className="w-8 h-8 rounded-xl bg-[#EBF7FC] text-[#0E7CB5] flex items-center justify-center border border-[#BDE3F5]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#2D2832]">{avgAdherence}%</span>
            <span className="text-xs font-bold text-[#0E7CB5]">Asistencia a sesiones</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Sesiones Registradas</span>
            <div className="w-8 h-8 rounded-xl bg-[#FFF8E7] text-[#5C4E00] flex items-center justify-center border border-[#FFE7A8]">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#2D2832]">{completedSessionsCount}</span>
            <span className="text-xs font-semibold text-slate-500">Notas SOAP creadas</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Alertas del Sistema</span>
            <div className="w-8 h-8 rounded-xl bg-[#F8F0FC] text-[#620092] flex items-center justify-center border border-[#E6D2F3]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-[#2D2832]">{alerts.filter(a => !a.resolved).length}</span>
            <span className="text-xs text-slate-500 font-semibold">pendientes</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Line / Area Chart: Sintomatología */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/80 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-[#2D2832] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#620092]" />
                Evolución de Sintomatología (Escalas BAI / BDI)
              </h3>
              <p className="text-xs text-slate-500 font-medium">Promedio acumulado por mes de evaluaciones ansioso-depresivas</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-[#620092]">
                <span className="w-3 h-3 rounded-full bg-[#620092] inline-block"></span> Ansiedad BAI
              </span>
              <span className="flex items-center gap-1.5 text-[#50B3E5]">
                <span className="w-3 h-3 rounded-full bg-[#50B3E5] inline-block"></span> Depresión BDI
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-4">
            {recoveryTrendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={recoveryTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBai" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#620092" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#620092" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBdi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#50B3E5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#50B3E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1E1B24', borderRadius: '12px', border: '1px solid #322B3D', color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="baiAvg" name="Estrés/Ansiedad (BAI)" stroke="#620092" strokeWidth={3} fillOpacity={1} fill="url(#colorBai)" />
                  <Area type="monotone" dataKey="bdiAvg" name="Depresión (BDI-II)" stroke="#50B3E5" strokeWidth={3} fillOpacity={1} fill="url(#colorBdi)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-slate-400 font-semibold border border-dashed border-slate-200 rounded-2xl">
                Se mostrarán los datos de evolución una vez registradas las primeras notas clínicas.
              </div>
            )}
          </div>
        </div>

        {/* Donut Chart: Diagnostic Distribution */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 space-y-4 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#2D2832] flex items-center gap-2">
              <PieChartIcon className="w-4 h-4 text-[#620092]" />
              Distribución Diagnóstica
            </h3>
            <p className="text-xs text-slate-500 font-medium">Distribución de casos registrados</p>
          </div>

          <div className="h-52 w-full relative flex items-center justify-center">
            {diagnosisDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={diagnosisDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {diagnosisDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={paletteColors[index % paletteColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1E1B24', borderRadius: '10px', color: '#fff', fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-[#2D2832]">{patients.length}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Pacientes</span>
                </div>
              </>
            ) : (
              <div className="text-center text-xs text-slate-400 font-semibold">
                Sin diagnósticos registrados aún.
              </div>
            )}
          </div>

          <div className="space-y-1.5 text-xs max-h-32 overflow-y-auto pr-1">
            {diagnosisDistribution.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-600 text-[11px] font-medium truncate max-w-[170px]" title={item.name}>
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: paletteColors[i % paletteColors.length] }}></span>
                  {item.name}
                </span>
                <span className="font-bold text-[#2D2832] text-[11px] shrink-0">{item.count} pac.</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights & Retention Cohorts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Ukiana AI Insights Box */}
        <div className="bg-[#1E1B24] p-6 rounded-3xl text-white space-y-4 shadow-xl border border-[#322B3D]">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-[#620092]/30 text-[#E6D2F3] border border-[#620092]/50 text-xs font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FFCD69]" />
              Ukiana Clinical Assistant
            </span>
            <span className="text-slate-400 text-xs font-mono">Modo Real</span>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-extrabold text-white tracking-tight">
              Análisis Asistencial en Tiempo Real
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              El panel de analíticas procesa dinámicamente los expedientes, sesiones SOAP y respuestas de evaluación del consultorio sin recurrir a datos ficticios.
            </p>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-200 flex items-start gap-3">
              <Zap className="w-4 h-4 text-[#FFCD69] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white block mb-0.5">Sugerencia de Flujo:</span>
                Para comenzar las pruebas asistenciales, agregue un paciente desde el botón <strong>"+ Nuevo Paciente"</strong> o inicie una <strong>Entrevista Inicial</strong>.
              </div>
            </div>
          </div>
        </div>

        {/* Patient Retention Cohorts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-4 shadow-xs">
          <h3 className="text-base font-extrabold text-[#2D2832]">
            Retención de Pacientes por Fase del Tratamiento
          </h3>
          <div className="space-y-3">
            {retentionCohort.map((cohort, idx) => (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-[#2D2832]">
                  <span>{cohort.sessions} ({cohort.status})</span>
                  <span className="text-[#620092]">{patients.length > 0 ? cohort.percentage : 0}% Retención</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#620092] h-full rounded-full transition-all duration-300"
                    style={{ width: `${patients.length > 0 ? cohort.percentage : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
