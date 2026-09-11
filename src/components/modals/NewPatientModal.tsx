import React, { useState, useRef, useEffect } from 'react';
import { X, UserPlus, Baby, Users, ShieldAlert, Calendar, Check, Search, Sparkles, ArrowRight, FileText, Camera, Trash2, User } from 'lucide-react';
import { Patient, RiskLevel, FamilyInfo, PerinatalDevelopmentHistory } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { ICD10_DIAGNOSES, ICD10Item, searchICD10 } from '../../data/icd10Data';

interface NewPatientModalProps {
  onClose: () => void;
  onAddPatient: (newPatient: Patient) => void;
  onAddPatientAndStartInterview?: (newPatient: Patient) => void;
}


const FAMILY_RELATIONSHIP_OPTIONS = [
  'Papá',
  'Mamá',
  'Esposo/a',
  'Pareja',
  'Hijos',
  'Hermanos',
  'Abuelos',
  'Tíos/Primos',
  'Otros familiares'
];

export const calculateAgeFromBirthDate = (birthDateString: string): number => {
  if (!birthDateString) return 30;
  const today = new Date();
  const birthDate = new Date(birthDateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : 0;
};

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  onClose,
  onAddPatient,
  onAddPatientAndStartInterview
}) => {
  const { user } = useAuth();
  const searchDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatar, setAvatar] = useState<string>('');
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [birthDate, setBirthDate] = useState('1996-05-15');
  const [gender, setGender] = useState('Femenino');
  const [occupation, setOccupation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('La fotografía debe ser menor a 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setAvatar('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  // Diagnosis fields (OPTIONAL & LINKED WITH ICD10 SEARCH)
  const [primaryDiagnosis, setPrimaryDiagnosis] = useState('');
  const [icd10Code, setIcd10Code] = useState('');
  const [diagnosisSearch, setDiagnosisSearch] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const [riskLevel, setRiskLevel] = useState<RiskLevel>('Moderado');
  
  // Emergency Contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('Familiar cercano');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Autonomy & Special condition
  const [hasAutonomyLimitation, setHasAutonomyLimitation] = useState(false);

  // Computed Age
  const computedAge = calculateAgeFromBirthDate(birthDate);
  const isMinor = computedAge < 18;
  const showPerinatalSection = isMinor || hasAutonomyLimitation;

  // Family Info State (For Adults >= 18)
  const [livingArrangement, setLivingArrangement] = useState<'Solo' | 'Acompañado' | 'Residencia / Centro' | 'Otro'>('Acompañado');
  const [totalFamilyMembers, setTotalFamilyMembers] = useState<number>(3);
  const [selectedRelationships, setSelectedRelationships] = useState<string[]>(['Pareja', 'Hijos']);

  // Perinatal History State (For Minors < 18 or Autonomy Limitation)
  const [pregnancyPlanned, setPregnancyPlanned] = useState<'Planificado' | 'No planificado' | 'En tratamiento de fertilidad'>('Planificado');
  const [pregnancyComplications, setPregnancyComplications] = useState('Sin complicaciones informadas');
  const [partnerSupport, setPartnerSupport] = useState<'Acompañamiento completo de la pareja' | 'Sin acompañamiento de la pareja' | 'Acompañamiento parcial'>('Acompañamiento completo de la pareja');
  const [familySupport, setFamilySupport] = useState<'Acompañamiento familiar estrecho' | 'Sin acompañamiento familiar' | 'Acompañamiento parcial'>('Acompañamiento familiar estrecho');
  const [gestationalTerm, setGestationalTerm] = useState<'A término (37-42 sem)' | 'Prematuro (<37 sem)' | 'Post-término (>42 sem)'>('A término (37-42 sem)');
  const [birthType, setBirthType] = useState<'Vaginal normal' | 'Cesárea programada' | 'Cesárea de emergencia' | 'Parto asistido (Fórceps/Ventosa)'>('Vaginal normal');
  const [birthComplications, setBirthComplications] = useState('Sin complicaciones');

  // Development Milestones - NUMERIC IN MONTHS
  const [headSupportMonths, setHeadSupportMonths] = useState<number>(3);
  const [crawlingMonths, setCrawlingMonths] = useState<number>(7);
  const [walkingMonths, setWalkingMonths] = useState<number>(12);
  const [weaningMonths, setWeaningMonths] = useState<number>(6);
  const [complementaryFeedingMonths, setComplementaryFeedingMonths] = useState<number>(6);
  const [pottyTrainingMonths, setPottyTrainingMonths] = useState<number>(24);
  const [sphincterRegressions, setSphincterRegressions] = useState('Sin regresiones');

  // Close ICD10 search dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleRelationship = (rel: string) => {
    setSelectedRelationships(prev => 
      prev.includes(rel) ? prev.filter(r => r !== rel) : [...prev, rel]
    );
  };

  const filteredDiagnoses = searchICD10(diagnosisSearch);

  const handleSelectDiagnosis = (item: ICD10Item) => {
    setPrimaryDiagnosis(item.name);
    setIcd10Code(item.code);
    setDiagnosisSearch(item.name);
    setIsSearchOpen(false);
  };

  const buildPatientObject = (): Patient | null => {
    if (!fullName || !phone) return null;

    const familyInfo: FamilyInfo | undefined = !showPerinatalSection ? {
      livingArrangement,
      totalFamilyMembersCount: livingArrangement === 'Acompañado' ? totalFamilyMembers : 0,
      familyRelationships: livingArrangement === 'Acompañado' ? selectedRelationships : []
    } : undefined;

    const perinatalHistory: PerinatalDevelopmentHistory | undefined = showPerinatalSection ? {
      pregnancyPlanned,
      pregnancyComplications,
      partnerSupport,
      familySupport,
      gestationalTerm,
      birthType,
      birthComplications,
      headSupportAgeMonths: `${headSupportMonths} meses`,
      crawlingAgeMonths: `${crawlingMonths} meses`,
      walkingAgeMonths: `${walkingMonths} meses`,
      weaningAgeMonths: `${weaningMonths} meses`,
      complementaryFeedingAgeMonths: `${complementaryFeedingMonths} meses`,
      pottyTrainingAgeMonths: `${pottyTrainingMonths} meses`,
      sphincterRegressions
    } : undefined;

    const defaultFallbackAvatar = gender === 'Masculino'
      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250';


    return {
      id: `pat-${Date.now()}`,
      fullName,
      idNumber: idNumber || undefined,
      birthDate,
      age: computedAge,
      gender,
      avatar: avatar.trim() || defaultFallbackAvatar,
      email,
      phone,
      hasAutonomyLimitation,
      familyInfo,
      perinatalHistory,

      emergencyContact: {
        name: emergencyName || 'Familia directa',
        relationship: emergencyRelationship || 'Contacto principal',
        phone: emergencyPhone || phone
      },
      occupation: occupation || (isMinor ? 'Estudiante' : 'Profesional libre'),
      status: 'Activo',
      riskLevel,
      startDate: new Date().toISOString().split('T')[0],
      therapist: user?.name || 'Dr. Alejandro Reyes',
      primaryDiagnosis: primaryDiagnosis || 'Pendiente de Evaluación Inicial',
      icd10Code: icd10Code || 'Z00.4',
      dsm5Code: '300.02',
      totalSessions: 1,
      adherenceRate: 100,
      lastSessionDate: new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }),
      antecedents: {
        medical: ['Sin antecedentes patológicos severos.'],
        psychiatric: ['Evaluación inicial clínica.'],
        family: ['Historial evaluado en consulta.']
      },
      activeGoalsCount: 3
    };
  };

  const handleSaveOnly = (e: React.FormEvent) => {
    e.preventDefault();
    const newPat = buildPatientObject();
    if (!newPat) return;
    onAddPatient(newPat);
    onClose();
  };

  const handleSaveAndStartInterview = (e: React.FormEvent) => {
    e.preventDefault();
    const newPat = buildPatientObject();
    if (!newPat) return;
    if (onAddPatientAndStartInterview) {
      onAddPatientAndStartInterview(newPat);
    } else {
      onAddPatient(newPat);
    }
    onClose();
  };


  return (
    <div className="fixed inset-0 bg-[#1E1B24]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn font-sans">
      <form onSubmit={handleSaveAndStartInterview} className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">

          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#F8F0FC] text-[#620092]">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-[#2D2832]">Registrar Nuevo Paciente</h3>
              <p className="text-[11px] text-slate-500 font-medium">Expediente Clínico & Evaluación Inicial</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs max-h-[75vh] overflow-y-auto pr-1 font-sans">
          
          {/* Bloque 1: Filiación e Identificación */}
          <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-slate-200/80 space-y-3.5">
            <h4 className="font-extrabold text-[#620092] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              1. Datos Personales & Fecha de Nacimiento
            </h4>

            {/* Fotografía del Paciente (Opcional) */}
            <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F8F0FC] to-[#E6D2F3] border-2 border-dashed border-[#620092]/30 flex items-center justify-center overflow-hidden shadow-xs">
                  {avatar ? (
                    <img src={avatar} alt="Foto del paciente" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-8 h-8 text-[#620092]/40" />
                  )}
                </div>
                {avatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    title="Eliminar foto"
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-xs cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="font-extrabold text-[#2D2832] text-xs">Fotografía del Paciente</span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-bold text-[9px] uppercase">
                    Opcional
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Sube una foto del paciente (JPG, PNG o WebP hasta 5MB) para identificarlo en su expediente y fichas clínicas.
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/png, image/jpeg, image/webp, image/jpg"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-[#F8F0FC] hover:bg-[#E6D2F3]/60 text-[#620092] font-extrabold text-[11px] border border-[#E6D2F3] flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{avatar ? 'Cambiar fotografía' : 'Subir fotografía'}</span>
                  </button>
                  {avatar && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold text-[11px] border border-slate-200 flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Quitar</span>
                    </button>
                  )}
                </div>
              </div>
            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#2D2832] mb-1">Nombre Completo Sanitario *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laura Martínez Ramos"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-semibold focus:ring-2 focus:ring-[#620092]/30"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2D2832] mb-1">N° de Cédula / DNI</label>
                <input
                  type="text"
                  placeholder="Ej: 1726491028"
                  value={idNumber}
                  onChange={e => setIdNumber(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-mono font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold text-[#2D2832] mb-1">Fecha de Nacimiento *</label>
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2D2832] mb-1">Edad Calculada</label>
                <div className="p-2.5 bg-[#EBF7FC] border border-[#BDE3F5] rounded-xl text-[#0E7CB5] font-extrabold flex items-center justify-between">
                  <span>{computedAge} años</span>
                  <span className="text-[10px] font-mono uppercase bg-white px-2 py-0.5 rounded shadow-2xs">
                    {isMinor ? 'Menor de Edad' : 'Adulto'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2D2832] mb-1">Género</label>
                <select
                  value={gender}
                  onChange={e => setGender(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-semibold cursor-pointer"
                >
                  <option value="Femenino">Femenino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="No Binario">No Binario</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block font-bold text-[#2D2832] mb-1">Teléfono Directo *</label>
                <input
                  type="text"
                  required
                  placeholder="+593 99 000 0000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-[#2D2832] mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  placeholder="ejemplo@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-[#2D2832] mb-1">Ocupación</label>
                <input
                  type="text"
                  placeholder={isMinor ? 'Estudiante' : 'Profesión'}
                  value={occupation}
                  onChange={e => setOccupation(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-semibold"
                />
              </div>
            </div>

            {/* Toggle Autonomy Limitation */}
            <div className="pt-2">
              <label className="flex items-center gap-2 cursor-pointer p-2.5 bg-white rounded-xl border border-slate-200 hover:border-[#620092]/40 transition-all">
                <input
                  type="checkbox"
                  checked={hasAutonomyLimitation}
                  onChange={e => setHasAutonomyLimitation(e.target.checked)}
                  className="w-4 h-4 accent-[#620092] rounded cursor-pointer"
                />
                <div>
                  <strong className="text-[#2D2832] block">Paciente con discapacidad o diagnóstico que limite su autonomía</strong>
                  <span className="text-[10px] text-slate-500">Activa la recolección de historial perinatal y madurativo de desarrollo</span>
                </div>
              </label>
            </div>
          </div>

          {/* Bloque 2A: Información Familiar (SOLO PARA ADULTOS ≥18 SIN LIMITACIÓN DE AUTONOMÍA) */}
          {!showPerinatalSection && (
            <div className="bg-[#FFF8E7] p-4 rounded-2xl border border-[#FFE7A8] space-y-3 animate-fadeIn">
              <h4 className="font-extrabold text-[#5C4E00] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                2. Información Familiar & Convivencia (Paciente Adulto)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2D2832] mb-1">Modalidad de Convivencia</label>
                  <select
                    value={livingArrangement}
                    onChange={e => setLivingArrangement(e.target.value as any)}
                    className="w-full p-2.5 bg-white border border-[#FFE7A8] rounded-xl text-[#2D2832] font-bold cursor-pointer"
                  >
                    <option value="Solo">Vive Solo/a</option>
                    <option value="Acompañado">Vive Acompañado/a</option>
                    <option value="Residencia / Centro">Residencia / Centroasistencial</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                {livingArrangement === 'Acompañado' && (
                  <div>
                    <label className="block font-bold text-[#2D2832] mb-1">Total de Personas en el Hogar</label>
                    <input
                      type="number"
                      min={1}
                      value={totalFamilyMembers}
                      onChange={e => setTotalFamilyMembers(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-[#FFE7A8] rounded-xl text-[#2D2832] font-bold"
                    />
                  </div>
                )}
              </div>

              {livingArrangement === 'Acompañado' && (
                <div className="space-y-1.5 pt-1">
                  <label className="block font-bold text-[#2D2832]">Parentesco de Familiares en el Hogar (Selección Múltiple)</label>
                  <div className="flex flex-wrap gap-1.5">
                    {FAMILY_RELATIONSHIP_OPTIONS.map((rel) => {
                      const isSelected = selectedRelationships.includes(rel);
                      return (
                        <button
                          key={rel}
                          type="button"
                          onClick={() => toggleRelationship(rel)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#620092] text-white shadow-xs'
                              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                          <span>{rel}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bloque 2B: Historial Perinatal & Hitos de Desarrollo (SOLO MENORES <18 O DISCAPACIDAD/AUTONOMÍA) */}
          {showPerinatalSection && (
            <div className="bg-[#F8F0FC] p-4 rounded-2xl border border-[#E6D2F3] space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-[#E6D2F3] pb-2">
                <h4 className="font-extrabold text-[#620092] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                  <Baby className="w-4 h-4 text-[#620092]" />
                  2. Historial Perinatal, Embarazo & Hitos de Desarrollo (Menor / Autonomía Reducida)
                </h4>
                <span className="px-2.5 py-0.5 bg-[#620092] text-white font-mono text-[10px] font-bold rounded-md">
                  {isMinor ? 'Menor de Edad' : 'Evaluación Desarrollo'}
                </span>
              </div>

              {/* Sub-bloque 2B-1: Embarazo y Parto */}
              <div className="space-y-3">
                <h5 className="font-bold text-[#2D2832] text-xs underline">A) Embarazo, Parto & Acompañamiento</h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#2D2832] mb-1">Planificación del Embarazo</label>
                    <select
                      value={pregnancyPlanned}
                      onChange={e => setPregnancyPlanned(e.target.value as any)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-semibold cursor-pointer"
                    >
                      <option value="Planificado">Planificado</option>
                      <option value="No planificado">No planificado</option>
                      <option value="En tratamiento de fertilidad">En tratamiento de fertilidad</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#2D2832] mb-1">Término Gestacional</label>
                    <select
                      value={gestationalTerm}
                      onChange={e => setGestationalTerm(e.target.value as any)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-semibold cursor-pointer"
                    >
                      <option value="A término (37-42 sem)">A término (37-42 semanas)</option>
                      <option value="Prematuro (<37 sem)">Prematuro (&lt;37 semanas)</option>
                      <option value="Post-término (>42 sem)">Post-término (&gt;42 semanas)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#2D2832] mb-1">Tipo de Parto</label>
                    <select
                      value={birthType}
                      onChange={e => setBirthType(e.target.value as any)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-semibold cursor-pointer"
                    >
                      <option value="Vaginal normal">Vaginal normal</option>
                      <option value="Cesárea programada">Cesárea programada</option>
                      <option value="Cesárea de emergencia">Cesárea de emergencia</option>
                      <option value="Parto asistido (Fórceps/Ventosa)">Parto asistido (Fórceps / Ventosa)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#2D2832] mb-1">Complicaciones en Embarazo / Parto</label>
                    <input
                      type="text"
                      placeholder="Sin complicaciones / Preeclampsia / Hipoxia..."
                      value={pregnancyComplications}
                      onChange={e => setPregnancyComplications(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-[#2D2832] mb-1">Acompañamiento de la Pareja</label>
                    <select
                      value={partnerSupport}
                      onChange={e => setPartnerSupport(e.target.value as any)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-medium cursor-pointer"
                    >
                      <option value="Acompañamiento completo de la pareja">Acompañamiento completo</option>
                      <option value="Sin acompañamiento de la pareja">Sin acompañamiento de la pareja</option>
                      <option value="Acompañamiento parcial">Acompañamiento parcial</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-[#2D2832] mb-1">Acompañamiento Familiar</label>
                    <select
                      value={familySupport}
                      onChange={e => setFamilySupport(e.target.value as any)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-medium cursor-pointer"
                    >
                      <option value="Acompañamiento familiar estrecho">Acompañamiento familiar estrecho</option>
                      <option value="Sin acompañamiento familiar">Sin acompañamiento familiar</option>
                      <option value="Acompañamiento parcial">Acompañamiento parcial</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Sub-bloque 2B-2: Hitos del Desarrollo Psicomotor - NUMÉRICOS EN MESES */}
              <div className="space-y-3 pt-2 border-t border-[#E6D2F3]">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-[#2D2832] text-xs underline">B) Hitos del Desarrollo Psicomotor & Control Madurativo</h5>
                  <span className="text-[10px] text-[#620092] font-bold">Entradas numéricas en meses</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Sostén Cefálico</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={headSupportMonths}
                        onChange={e => setHeadSupportMonths(Number(e.target.value))}
                        className="w-full p-2.5 pr-14 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-bold text-xs shadow-2xs"
                      />
                      <span className="absolute right-3 text-[11px] text-slate-400 font-semibold pointer-events-none">meses</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Gateo</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={crawlingMonths}
                        onChange={e => setCrawlingMonths(Number(e.target.value))}
                        className="w-full p-2.5 pr-14 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-bold text-xs shadow-2xs"
                      />
                      <span className="absolute right-3 text-[11px] text-slate-400 font-semibold pointer-events-none">meses</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Caminó / Deambulación</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={walkingMonths}
                        onChange={e => setWalkingMonths(Number(e.target.value))}
                        className="w-full p-2.5 pr-14 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-bold text-xs shadow-2xs"
                      />
                      <span className="absolute right-3 text-[11px] text-slate-400 font-semibold pointer-events-none">meses</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Dejó Pecho Materno</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={weaningMonths}
                        onChange={e => setWeaningMonths(Number(e.target.value))}
                        className="w-full p-2.5 pr-14 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-bold text-xs shadow-2xs"
                      />
                      <span className="absolute right-3 text-[11px] text-slate-400 font-semibold pointer-events-none">meses</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Alimentación Compl.</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={complementaryFeedingMonths}
                        onChange={e => setComplementaryFeedingMonths(Number(e.target.value))}
                        className="w-full p-2.5 pr-14 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-bold text-xs shadow-2xs"
                      />
                      <span className="absolute right-3 text-[11px] text-slate-400 font-semibold pointer-events-none">meses</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">Dejó Pañal / Esfínteres</label>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={pottyTrainingMonths}
                        onChange={e => setPottyTrainingMonths(Number(e.target.value))}
                        className="w-full p-2.5 pr-14 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-bold text-xs shadow-2xs"
                      />
                      <span className="absolute right-3 text-[11px] text-slate-400 font-semibold pointer-events-none">meses</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-[#2D2832] mb-1">Regresiones en el Control de Esfínteres</label>
                  <select
                    value={sphincterRegressions}
                    onChange={e => setSphincterRegressions(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-semibold cursor-pointer"
                  >
                    <option value="Sin regresiones">Sin regresiones</option>
                    <option value="Enuresis nocturna ocasional">Enuresis nocturna ocasional</option>
                    <option value="Encopresis">Encopresis</option>
                    <option value="Regresiones temporales ante eventos estresantes">Regresiones temporales tras evento estresante (nacimiento hermano, cambio colegio, etc.)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Bloque 3: Diagnóstico Sanitario Inicial & Código CIE-10 (NO OBLIGATORIO & BÚSQUEDA INTERACTIVA) */}
          <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-slate-200/80 space-y-3 relative" ref={searchDropdownRef}>
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-[#620092] uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                3. Diagnóstico Sanitario Inicial & Código CIE-10 (Opcional)
              </h4>
              <span className="text-[10px] text-slate-400 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
                Opcional / Autocompletado Búsqueda
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Linked Search Input */}
              <div className="sm:col-span-2 relative">
                <label className="block font-bold text-[#2D2832] mb-1">Búsqueda de Diagnóstico Primario (Escribe clave como "Trastorno")</label>
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Escribe 'Trastorno', 'Depresión', 'Ansiedad', 'F41'..."
                    value={diagnosisSearch || primaryDiagnosis}
                    onFocus={() => setIsSearchOpen(true)}
                    onChange={e => {
                      setDiagnosisSearch(e.target.value);
                      setPrimaryDiagnosis(e.target.value);
                      setIsSearchOpen(true);
                    }}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-semibold focus:ring-2 focus:ring-[#620092]/30"
                  />
                </div>

                {/* Dropdown Results for Live Match Search */}
                {isSearchOpen && filteredDiagnoses.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl z-30 max-h-56 overflow-y-auto p-1.5 space-y-1">
                    <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                      <span>Coincidencias Catálogo CIE-10 ({filteredDiagnoses.length})</span>
                      <Sparkles className="w-3 h-3 text-[#FFCD69]" />
                    </div>
                    {filteredDiagnoses.map((item) => (
                      <div
                        key={item.code}
                        onClick={() => handleSelectDiagnosis(item)}
                        className="p-2.5 hover:bg-[#F8F0FC] rounded-xl cursor-pointer transition-colors flex items-center justify-between group"
                      >
                        <div>
                          <strong className="text-xs text-[#2D2832] group-hover:text-[#620092] block font-bold">
                            {item.name}
                          </strong>
                          <span className="text-[10px] text-slate-400 font-medium">Categoría: {item.category}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-[#620092] text-white font-mono font-bold text-[11px] rounded-md shrink-0">
                          {item.code}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Linked ICD-10 Code Input */}
              <div>
                <label className="block font-bold text-[#2D2832] mb-1">Código CIE-10 Ligado</label>
                <input
                  type="text"
                  placeholder="ej: F41.1"
                  value={icd10Code}
                  onChange={e => {
                    setIcd10Code(e.target.value);
                    const match = ICD10_DIAGNOSES.find(d => d.code.toLowerCase() === e.target.value.toLowerCase().trim());
                    if (match) setPrimaryDiagnosis(match.name);
                  }}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-mono font-bold text-xs shadow-2xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block font-bold text-[#2D2832] mb-1">Clasificación de Riesgo Inicial</label>
                <select
                  value={riskLevel}
                  onChange={e => setRiskLevel(e.target.value as any)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-[#2D2832] font-bold cursor-pointer"
                >
                  <option value="Bajo">Bajo</option>
                  <option value="Moderado">Moderado</option>
                  <option value="Elevado">Elevado</option>
                  <option value="Crítico">Crítico</option>
                </select>
              </div>

              <div className="flex items-center text-[11px] text-slate-500 font-medium pt-5">
                <span>💡 Si no seleccionas diagnóstico ahora, se asignará por defecto <strong>"Pendiente de Evaluación Inicial (Z00.4)"</strong>.</span>
              </div>
            </div>
          </div>

          {/* Bloque 4: Contacto de Emergencia */}
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 space-y-2">
            <span className="font-extrabold text-rose-900 text-xs block">Contacto de Emergencia Obligado (Protocolo de Crisis)</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Nombre del familiar/tutor"
                value={emergencyName}
                onChange={e => setEmergencyName(e.target.value)}
                className="p-2 bg-white border border-rose-200 rounded-xl text-[#2D2832] text-xs font-medium"
              />
              <input
                type="text"
                placeholder="Parentesco (ej: Madre)"
                value={emergencyRelationship}
                onChange={e => setEmergencyRelationship(e.target.value)}
                className="p-2 bg-white border border-rose-200 rounded-xl text-[#2D2832] text-xs font-medium"
              />
              <input
                type="text"
                placeholder="Teléfono Emergencia"
                value={emergencyPhone}
                onChange={e => setEmergencyPhone(e.target.value)}
                className="p-2 bg-white border border-rose-200 rounded-xl text-[#2D2832] text-xs font-medium"
              />
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-500 hover:text-slate-700 text-xs font-semibold cursor-pointer"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveOnly}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-all cursor-pointer"
            >
              Guardar solo Ficha
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#620092] hover:bg-[#4E0075] text-white rounded-xl font-bold text-xs shadow-md shadow-[#620092]/20 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <span>Crear e Iniciar Entrevista</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

