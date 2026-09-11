import React, { useState } from 'react';
import { 
  Target, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Pencil, 
  Save, 
  Layers, 
  Calendar,
  Tag,
  BookOpen
} from 'lucide-react';
import { TreatmentPlan, TreatmentGoal, Patient } from '../../types';

interface TreatmentPlanViewProps {
  treatmentPlan: TreatmentPlan;
  patient: Patient;
  onUpdateTreatmentPlan: (updated: TreatmentPlan) => void;
}

export const TreatmentPlanView: React.FC<TreatmentPlanViewProps> = ({
  treatmentPlan,
  patient,
  onUpdateTreatmentPlan
}) => {
  if (!patient || !treatmentPlan) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200 font-sans">
        No se encontró información del plan de tratamiento.
      </div>
    );
  }

  const [isEditingGeneral, setIsEditingGeneral] = useState(false);
  const [generalGoalInput, setGeneralGoalInput] = useState(treatmentPlan.generalObjective);
  
  const [newGoalDesc, setNewGoalDesc] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<'Sintomático' | 'Conductual' | 'Cognitivo' | 'Relacional'>('Cognitivo');
  const [newGoalTargetDate, setNewGoalTargetDate] = useState('2024-07-30');
  const [showAddGoal, setShowAddGoal] = useState(false);

  const toggleGoalCompletion = (goalId: string) => {
    const updatedGoals = treatmentPlan.specificGoals.map(g => 
      g.id === goalId ? { ...g, completed: !g.completed } : g
    );
    onUpdateTreatmentPlan({
      ...treatmentPlan,
      specificGoals: updatedGoals,
      updatedAt: new Date().toISOString().split('T')[0]
    });
  };

  const handleSaveGeneral = () => {
    onUpdateTreatmentPlan({
      ...treatmentPlan,
      generalObjective: generalGoalInput,
      updatedAt: new Date().toISOString().split('T')[0]
    });
    setIsEditingGeneral(false);
  };

  const handleAddSpecificGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalDesc) return;

    const newGoal: TreatmentGoal = {
      id: `g-${Date.now()}`,
      description: newGoalDesc,
      targetDate: newGoalTargetDate,
      completed: false,
      category: newGoalCategory
    };

    onUpdateTreatmentPlan({
      ...treatmentPlan,
      specificGoals: [...treatmentPlan.specificGoals, newGoal],
      updatedAt: new Date().toISOString().split('T')[0]
    });

    setNewGoalDesc('');
    setShowAddGoal(false);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-6 h-6 text-[#620092]" />
            <h2 className="text-xl font-extrabold text-[#2D2832]">
              Plan de Tratamiento Estratégico
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Diseño metodológico para <span className="font-bold text-[#2D2832]">{patient.fullName}</span> · Actualizado el {treatmentPlan.updatedAt}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#F8F9FA] p-2 rounded-2xl border border-slate-200 text-xs">
          <span className="font-mono font-bold bg-[#F8F0FC] text-[#620092] px-2.5 py-1 rounded-lg border border-[#E6D2F3]">
            {treatmentPlan.icdCode}
          </span>
          <span className="font-mono font-bold bg-[#EBF7FC] text-[#0E7CB5] px-2.5 py-1 rounded-lg border border-[#BDE3F5]">
            {treatmentPlan.dsmCode}
          </span>
        </div>
      </div>

      {/* Orientation & General Objective */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Therapeutic Orientation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 space-y-3 shadow-xs">
          <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
            Enfoque Psicoterapéutico
          </span>
          <h3 className="text-sm font-extrabold text-[#2D2832] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#620092]" />
            {treatmentPlan.orientation}
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Intervención basada en evidencia empírica con técnicas de restructuración cognitiva, defusión y experimentos conductuales graduados.
          </p>
        </div>

        {/* General Objective */}
        <div className="md:col-span-2 bg-[#F8F0FC] p-5 rounded-2xl border border-[#E6D2F3] space-y-3 shadow-xs relative">
          <div className="flex items-center justify-between">
            <span className="text-[#620092] font-extrabold uppercase tracking-wider text-[10px]">
              Objetivo General del Tratamiento
            </span>
            {!isEditingGeneral ? (
              <button
                onClick={() => setIsEditingGeneral(true)}
                className="text-slate-600 hover:text-[#620092] text-xs flex items-center gap-1 font-bold cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
                Editar
              </button>
            ) : (
              <button
                onClick={handleSaveGeneral}
                className="text-white bg-[#620092] hover:bg-[#4E0075] text-xs flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-white" />
                Guardar
              </button>
            )}
          </div>

          {!isEditingGeneral ? (
            <p className="text-xs text-[#2D2832] font-semibold leading-relaxed">
              "{treatmentPlan.generalObjective}"
            </p>
          ) : (
            <textarea
              rows={3}
              value={generalGoalInput}
              onChange={e => setGeneralGoalInput(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#620092]/40 rounded-xl text-xs text-[#2D2832] focus:ring-2 focus:ring-[#620092]/30 font-medium"
            />
          )}
        </div>
      </div>

      {/* Specific Goals Checklist Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-[#2D2832]">Objetivos Específicos & Metas Operativas</h3>
            <p className="text-xs text-slate-500 font-medium">
              {treatmentPlan.specificGoals.filter(g => g.completed).length} de {treatmentPlan.specificGoals.length} objetivos completados
            </p>
          </div>
          <button
            onClick={() => setShowAddGoal(!showAddGoal)}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#620092] hover:bg-[#4E0075] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Añadir Objetivo</span>
          </button>
        </div>

        {/* Add Goal Form */}
        {showAddGoal && (
          <form onSubmit={handleAddSpecificGoal} className="bg-[#F8F9FA] p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <h4 className="font-extrabold text-[#2D2832]">Nuevo Objetivo Específico</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <input
                  type="text"
                  required
                  placeholder="Descripción clara y medible..."
                  value={newGoalDesc}
                  onChange={e => setNewGoalDesc(e.target.value)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-[#2D2832]"
                />
              </div>
              <div>
                <select
                  value={newGoalCategory}
                  onChange={e => setNewGoalCategory(e.target.value as any)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-[#2D2832]"
                >
                  <option value="Cognitivo">Cognitivo</option>
                  <option value="Conductual">Conductual</option>
                  <option value="Sintomático">Sintomático</option>
                  <option value="Relacional">Relacional</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddGoal(false)}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-lg font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#620092] text-white rounded-lg font-bold cursor-pointer"
              >
                Guardar Objetivo
              </button>
            </div>
          </form>
        )}

        {/* Goals List */}
        <div className="space-y-3">
          {treatmentPlan.specificGoals.map(goal => (
            <div
              key={goal.id}
              onClick={() => toggleGoalCompletion(goal.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
                goal.completed
                  ? 'bg-[#F8F9FA] border-slate-200 text-slate-500'
                  : 'bg-white border-slate-200 hover:border-[#620092]/50 shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-3">
                {goal.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-[#0E7CB5] shrink-0 mt-0.5" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-300 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`text-xs font-bold ${goal.completed ? 'line-through text-slate-400' : 'text-[#2D2832]'}`}>
                    {goal.description}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5 text-slate-400" />
                      {goal.category}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3" />
                      Objetivo: {goal.targetDate}
                    </span>
                  </div>
                </div>
              </div>

              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                goal.completed 
                  ? 'bg-[#EBF7FC] text-[#0E7CB5] border border-[#BDE3F5]' 
                  : 'bg-[#FFF8E7] text-[#5C4E00] border border-[#FFE7A8]'
              }`}>
                {goal.completed ? 'Completado' : 'En Curso'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Treatment Phases Progress */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 space-y-4 shadow-xs">
        <h3 className="text-base font-extrabold text-[#2D2832] flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#620092]" />
          Fases del Tratamiento & Progresión
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {treatmentPlan.phases.map(phase => (
            <div
              key={phase.phaseNumber}
              className={`p-5 rounded-2xl border transition-all space-y-3 ${
                phase.status === 'En Curso'
                  ? 'bg-[#F8F0FC] border-[#E6D2F3] ring-2 ring-[#620092]/20'
                  : phase.status === 'Completada'
                  ? 'bg-[#F8F9FA] border-slate-200 opacity-90'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-full bg-[#2D2832] text-white font-bold text-xs flex items-center justify-center">
                  {phase.phaseNumber}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                  phase.status === 'Completada' ? 'bg-[#EBF7FC] text-[#0E7CB5] border border-[#BDE3F5]' :
                  phase.status === 'En Curso' ? 'bg-[#620092] text-white shadow-xs' : 'bg-slate-200 text-slate-700'
                }`}>
                  {phase.status}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-extrabold text-[#2D2832]">{phase.name}</h4>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-medium">{phase.description}</p>
              </div>

              {/* Progress bar */}
              <div className="space-y-1 pt-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-600">
                  <span>Progreso de Fase</span>
                  <span>{phase.progressPercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#620092] h-full rounded-full transition-all duration-500"
                    style={{ width: `${phase.progressPercentage}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

