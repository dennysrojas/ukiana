import React, { useState, useEffect } from 'react';
import { 
  NavigationTab, 
  Patient, 
  ClinicalNote, 
  TimelineItem, 
  TreatmentPlan, 
  LegalDocumentItem, 
  PsychoResource 
} from './types';
import { getPatients, createPatient, updatePatient } from './services/patientService';
import { getClinicalNotes, createClinicalNote, getTimelineItems, createTimelineItem } from './services/noteService';
import { getTreatmentPlan, updateTreatmentPlan } from './services/treatmentService';
import { getLegalDocuments, createLegalDocument } from './services/legalService';
import { getResources, incrementResourceAssignment } from './services/resourceService';
import { useAuth } from './context/AuthContext';

// Layout & View Components
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { PatientDirectory } from './components/patients/PatientDirectory';
import { PatientFileDetail } from './components/patients/PatientFileDetail';
import { EntrevistaInicialWizard } from './components/interview/EntrevistaInicialWizard';
import { TherapeuticTimelineView } from './components/timeline/TherapeuticTimelineView';

import { TreatmentPlanView } from './components/treatment/TreatmentPlanView';
import { LegalDocumentsView } from './components/legal/LegalDocumentsView';
import { ReportGeneratorView } from './components/reports/ReportGeneratorView';
import { ResourceLibraryView } from './components/resources/ResourceLibraryView';

import { LoginView } from './components/auth/LoginView';

// Modals
import { NewPatientModal } from './components/modals/NewPatientModal';
import { NewSessionNoteModal } from './components/modals/NewSessionNoteModal';
import { ProfileModal } from './components/modals/ProfileModal';

export default function App() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<NavigationTab>('patients');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');

  const [patients, setPatients] = useState<Patient[]>([]);
  const [clinicalNotes, setClinicalNotes] = useState<ClinicalNote[]>([]);
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([]);
  const [treatmentPlan, setTreatmentPlan] = useState<TreatmentPlan | undefined>(undefined);
  const [legalDocuments, setLegalDocuments] = useState<LegalDocumentItem[]>([]);
  const [resources, setResources] = useState<PsychoResource[]>([]);

  // Modal Open States
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Cargar datos iniciales desde la capa de servicios
  useEffect(() => {
    const loadAllData = async () => {
      try {
        const keysToPurge = [
          'ukiana_patients',
          'ukiana_notes',
          'ukiana_timeline',
          'ukiana_treatment',
          'ukiana_legal'
        ];
        const savedPats = localStorage.getItem('ukiana_patients');
        if (savedPats && (savedPats.includes('pat-1') || savedPats.includes('María García Morales') || savedPats.includes('Carlos López') || savedPats.includes('Elena Beltrán'))) {
          keysToPurge.forEach(k => localStorage.removeItem(k));
        }

        const [pData, nData, tData, tpData, lData, rData] = await Promise.all([
          getPatients(),
          getClinicalNotes(),
          getTimelineItems(),
          getTreatmentPlan(selectedPatientId || undefined),
          getLegalDocuments(),
          getResources()
        ]);

        setPatients(pData);
        setClinicalNotes(nData);
        setTimelineItems(tData);
        setTreatmentPlan(tpData);
        setLegalDocuments(lData);
        setResources(rData);

        if (pData.length > 0) {
          if (!selectedPatientId || !pData.some(p => p.id === selectedPatientId)) {
            setSelectedPatientId(pData[0].id);
          }
        } else {
          setSelectedPatientId('');
        }
      } catch (err) {
        console.error('Error cargando datos de servicios:', err);
      }
    };

    loadAllData();
  }, [selectedPatientId]);

  const selectedPatient = patients.find(p => p.id === selectedPatientId) || (patients.length > 0 ? patients[0] : undefined);

  // Handlers para agregar datos con sincronización en servicios
  const handleAddPatient = async (newPatient: Patient) => {
    const saved = await createPatient(newPatient);
    setPatients(prev => [saved, ...prev]);
    setSelectedPatientId(saved.id);
  };

  const handleAddPatientAndStartInterview = async (newPatient: Patient) => {
    const saved = await createPatient(newPatient);
    setPatients(prev => [saved, ...prev]);
    setSelectedPatientId(saved.id);
    setActiveTab('interview');
  };

  const handleAddClinicalNote = async (newNote: ClinicalNote) => {
    const savedNote = await createClinicalNote(newNote);
    setClinicalNotes(prev => [savedNote, ...prev]);

    // Crear ítem automático en la línea de tiempo
    const newTl: TimelineItem = {
      id: `tl-${Date.now()}`,
      patientId: newNote.patientId,
      date: newNote.date,
      title: `Sesión #${newNote.sessionNumber} - ${newNote.type}`,
      category: 'Sesiones',
      description: newNote.assessment || 'Nota clínica registrada.',
      author: user?.name || 'Médico Responsable',
      tags: ['Sesión SOAP', newNote.emotionalState]
    };
    const savedTl = await createTimelineItem(newTl);
    setTimelineItems(prev => [savedTl, ...prev]);

    setPatients(prev => prev.map(p => 
      p.id === newNote.patientId ? { ...p, totalSessions: p.totalSessions + 1 } : p
    ));
    await updatePatient(newNote.patientId, { totalSessions: (selectedPatient?.totalSessions || 0) + 1 });
  };

  const handleAddTimelineItem = async (item: Omit<TimelineItem, 'id'>) => {
    const newItem: TimelineItem = { id: `tl-${Date.now()}`, ...item };
    const saved = await createTimelineItem(newItem);
    setTimelineItems(prev => [saved, ...prev]);
  };

  const handleUploadDocument = async (newDoc: LegalDocumentItem) => {
    const saved = await createLegalDocument(newDoc);
    setLegalDocuments(prev => [saved, ...prev]);
  };

  const handleAssignResource = async (resourceId: string, patientId: string) => {
    await incrementResourceAssignment(resourceId);
    setResources(prev => prev.map(r => 
      r.id === resourceId ? { ...r, assignedPatientsCount: r.assignedPatientsCount + 1 } : r
    ));
  };

  const handleUpdateTreatmentPlan = async (newPlan: TreatmentPlan) => {
    setTreatmentPlan(newPlan);
    await updateTreatmentPlan(newPlan);
  };

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-[#1E1B24] flex items-center justify-center font-sans">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#620092] text-white font-extrabold text-2xl flex items-center justify-center mx-auto animate-pulse shadow-lg shadow-[#620092]/30">
            uk
          </div>
          <p className="text-xs text-slate-400 font-semibold">Cargando Consultorio Ukiana...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#2D2832] font-sans overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          patients={patients}
          selectedPatientId={selectedPatientId}
          onSelectPatient={setSelectedPatientId}
          onOpenNewPatientModal={() => setIsNewPatientModalOpen(true)}
          onOpenNewNoteModal={() => setIsNewNoteModalOpen(true)}
          onOpenProfileModal={() => setIsProfileModalOpen(true)}
          globalSearchQuery={globalSearchQuery}
          setGlobalSearchQuery={setGlobalSearchQuery}
        />

        {/* Content View Container */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === 'patients' && (
            <div className="space-y-6">
              <PatientDirectory
                patients={patients}
                selectedPatientId={selectedPatientId}
                onSelectPatient={setSelectedPatientId}
                onOpenNewPatientModal={() => setIsNewPatientModalOpen(true)}
                filterQuery={globalSearchQuery}
              />
              <div className="pt-4 border-t border-slate-200/80">
                <PatientFileDetail
                  patient={selectedPatient}
                  notes={clinicalNotes}
                  treatmentPlan={treatmentPlan}
                  legalDocuments={legalDocuments}
                  timelineItems={timelineItems}
                  onOpenNewNoteModal={() => setIsNewNoteModalOpen(true)}
                  onNavigateToTreatment={() => setActiveTab('treatment')}
                  onNavigateToReports={() => setActiveTab('reports')}
                />
              </div>
            </div>
          )}

          {activeTab === 'interview' && (
            <EntrevistaInicialWizard
              patient={selectedPatient}
              onFinish={() => {
                setActiveTab('patients');
              }}
              onCancel={() => setActiveTab('patients')}
            />
          )}

          {activeTab === 'timeline' && (
            <TherapeuticTimelineView
              timelineItems={timelineItems}
              patient={selectedPatient}
              onAddTimelineItem={handleAddTimelineItem}
            />
          )}

          {activeTab === 'treatment' && (
            <TreatmentPlanView
              treatmentPlan={treatmentPlan}
              patient={selectedPatient}
              onUpdateTreatmentPlan={handleUpdateTreatmentPlan}
            />
          )}

          {activeTab === 'legal' && (
            <LegalDocumentsView
              legalDocuments={legalDocuments}
              patients={patients}
              onUploadDocument={handleUploadDocument}
              onSendReminder={() => {}}
            />
          )}

          {activeTab === 'reports' && (
            <ReportGeneratorView
              patients={patients}
              selectedPatient={selectedPatient}
              notes={clinicalNotes}
              treatmentPlan={treatmentPlan}
              onSelectPatient={setSelectedPatientId}
            />
          )}

          {activeTab === 'resources' && (
            <ResourceLibraryView
              resources={resources}
              patients={patients}
              onAssignResource={handleAssignResource}
            />
          )}
        </main>
      </div>

      {/* Global Modals */}
      {isNewPatientModalOpen && (
        <NewPatientModal
          onClose={() => setIsNewPatientModalOpen(false)}
          onAddPatient={handleAddPatient}
          onAddPatientAndStartInterview={handleAddPatientAndStartInterview}
        />
      )}

      {isNewNoteModalOpen && (
        <NewSessionNoteModal
          patients={patients}
          selectedPatientId={selectedPatientId}
          onClose={() => setIsNewNoteModalOpen(false)}
          onAddNote={handleAddClinicalNote}
        />
      )}

      {isProfileModalOpen && (
        <ProfileModal
          onClose={() => setIsProfileModalOpen(false)}
        />
      )}
    </div>
  );
}
