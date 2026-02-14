import React, { useState } from 'react';
import Papa from 'papaparse';
import { Layout } from './components/ui/Layout';
import { AppRegistry } from './components/business/AppRegistry';
import { TopologyMap } from './components/business/TopologyMap';
import { LandscapeDashboard } from './components/business/LandscapeDashboard';
import { AIPanel } from './components/business/AIPanel';
import { AppEditorModal } from './components/business/AppEditorModal';
import { DataImportWizard } from './components/business/DataImportWizard';
import { SettingsModal } from './components/business/SettingsModal';
import { useApps } from './hooks/useApps';
import { Application } from './types';

export const App: React.FC = () => {
  const { 
    apps, addApp, bulkAddApps, updateApp, deleteApp,
    capabilities, domains, addCapability, removeCapability, addDomain, removeDomain
  } = useApps();
  
  const [currentView, setCurrentView] = useState<'registry' | 'topology' | 'landscape'>('registry');
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [mapScope, setMapScope] = useState('ALL');
  
  // App Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);

  // Modal States
  const [isImportWizardOpen, setIsImportWizardOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleAppSelect = (app: Application) => {
    setEditingApp(app);
    setIsEditorOpen(true);
  };

  const handleNewApp = () => {
    setEditingApp(null);
    setIsEditorOpen(true);
  };

  const handleSaveApp = (app: Application) => {
    if (editingApp) {
      updateApp(app);
    } else {
      addApp(app);
    }
    setIsEditorOpen(false);
  };

  const handleDeleteApp = (id: string) => {
    deleteApp(id);
    setIsEditorOpen(false);
  };

  const handleExport = () => {
    // Flatten the nested objects for CSV export
    const flatApps = apps.map(app => ({
      ID: app.id,
      Name: app.name,
      Code: app.code,
      Tier: app.tier,
      Status: app.lifecycle.status,
      Health: app.health,
      Value: app.value,
      Capability: app.capabilityId,
      Domain: app.domain,
      Owner: app.owner,
      Description: app.description,
      Cost: app.costs.total,
      LicenseCost: app.costs.license,
      MaintenanceCost: app.costs.maintenance,
      PII: app.security.piiRisk,
      GDPR: app.security.gdprCompliant,
      TechnicalDebt: app.technicalDebt,
      DataSensitivity: app.dataSensitivity
    }));

    const csv = Papa.unparse(flatApps);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `portfolio_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Layout 
      activeView={currentView} 
      setView={setCurrentView}
      onOpenAI={() => setIsAIPanelOpen(true)}
      onNewApp={handleNewApp}
      onImport={() => setIsImportWizardOpen(true)}
      onExport={handleExport}
      onSettings={() => setIsSettingsOpen(true)}
      mapScope={mapScope}
      setMapScope={setMapScope}
      domains={domains}
    >
      <div className="relative h-full">
        {currentView === 'registry' && (
          <AppRegistry apps={apps} onSelect={handleAppSelect} />
        )}
        
        {currentView === 'landscape' && (
          <LandscapeDashboard apps={apps} onSelect={handleAppSelect} />
        )}

        {currentView === 'topology' && (
          <TopologyMap 
            apps={apps} 
            onSelect={handleAppSelect} 
            scope={mapScope} 
          />
        )}

        <AIPanel 
          isOpen={isAIPanelOpen} 
          onClose={() => setIsAIPanelOpen(false)} 
          apps={apps}
        />

        <AppEditorModal 
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveApp}
          onDelete={handleDeleteApp}
          initialData={editingApp}
          allApps={apps}
          domains={domains}
          capabilities={capabilities}
        />

        <DataImportWizard 
          isOpen={isImportWizardOpen}
          onClose={() => setIsImportWizardOpen(false)}
          onImport={bulkAddApps}
          existingCodes={apps.map(a => a.code)}
        />
        
        <SettingsModal 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          capabilities={capabilities}
          domains={domains}
          onAddCapability={addCapability}
          onRemoveCapability={removeCapability}
          onAddDomain={addDomain}
          onRemoveDomain={removeDomain}
        />
      </div>
    </Layout>
  );
};