import React, { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { EnsembleInfo, ServiceInfo, AudioType, ProtectionLevel, GlobalSettings, OutputFormat } from './types';
import { EnsembleForm } from './components/EnsembleForm';
import { ServiceItem } from './components/ServiceItem';
import { CUProgressBar } from './components/CUProgressBar';
import { ConfigModal } from './components/ConfigModal';
import { PortConfigModal } from './components/PortConfigModal';
import { AlertModal } from './components/AlertModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { WelcomeModal } from './components/WelcomeModal';
import { AdvancedSettingsModal } from './components/AdvancedSettingsModal';
import { ServiceSettingsModal } from './components/ServiceSettingsModal';
import { calculateCU, generateConfigFile, validateEtsiCompliance } from './utils/dabLogic';
import { parseConfigFile } from './utils/importLogic';
import { MAX_CU } from './constants';
import { Radio, Plus, FileCode, Info } from 'lucide-react';

const App: React.FC = () => {
  // --- State ---
  const [showWelcome, setShowWelcome] = useState(true);

  const [ensemble, setEnsemble] = useState<EnsembleInfo>({
    eid: '',
    country: 'None / Undefined',
    label: '',
    shortLabel: '',
    // Advanced defaults
    localTimeOffset: 'auto',
    internationalTable: 1,
    reconfigCounter: 'hash'
  });

  const [services, setServices] = useState<ServiceInfo[]>([]);
  
  // Modal states
  const [showConfig, setShowConfig] = useState(false);
  const [showPortConfig, setShowPortConfig] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [editingServiceSettingsId, setEditingServiceSettingsId] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Duplicate SID Warning State
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);
  const [duplicateSidValue, setDuplicateSidValue] = useState('');

  // ETSI Compliance Warning State
  const [showEtsiWarning, setShowEtsiWarning] = useState(false);

  // Global Settings for Config
  const [globalSettings, setGlobalSettings] = useState<GlobalSettings>({
    managementPort: 12720,
    telnetPort: 12721,
    zmqEndpoint: 'tcp://lo:12722',
    ediPort: 9201,
    // Advanced defaults
    dabMode: 1,
    nbFrames: 0,
    syslog: false,
    tist: false,
    tistOffset: 0
  });
  
  // Output Format State
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('info');

  // --- DnD Sensors ---
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // --- Actions ---
  const handleCreateNew = () => {
    setShowWelcome(false);
  };

  const handleImportConfig = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsedData = parseConfigFile(text);
      
      setEnsemble(parsedData.ensemble);
      setServices(parsedData.services);
      setGlobalSettings(parsedData.settings);
      
      // Infer output format from extension
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'mux') setOutputFormat('mux');
      else setOutputFormat('info');

      setShowWelcome(false);
    } catch (e) {
      console.error(e);
      setErrorMessage("Failed to parse the configuration file. Please ensure it is a valid ODR-DabMux configuration.");
      setShowError(true);
    }
  };

  const handleEnsembleChange = (field: keyof EnsembleInfo, value: any) => {
    setEnsemble(prev => ({ ...prev, [field]: value }));
  };

  const handleGlobalSettingsChange = (field: keyof GlobalSettings, value: any) => {
    setGlobalSettings(prev => ({ ...prev, [field]: value }));
  };

  const addService = () => {
    // Calculate next available default port based on current count
    // Base is 9001. If we have 2 services, next is 9003.
    const newPort = 9001 + services.length;

    const newService: ServiceInfo = {
      id: uuidv4(),
      sid: '',
      label: '',
      shortLabel: '',
      pty: '0', // Default to "No Programme Type"
      type: AudioType.DAB_PLUS,
      bitrate: 96,
      protection: ProtectionLevel.EEP_3A,
      country: 'None / Undefined', // Default to name
      language: 'None / Undefined', // Default to name
      port: newPort,
      isPortCustom: false,
      // Advanced defaults
      ptySd: 'static',
      bufferManagement: 'prebuffering',
      bufferSize: 40,
      prebufferingSize: 20
    };

    setServices(prev => [...prev, newService]);
  };

  const removeService = (id: string) => {
    setServices(prev => {
      const filtered = prev.filter(s => s.id !== id);
      return filtered;
    });
  };

  const updateService = (id: string, field: keyof ServiceInfo, value: any) => {
    setServices(prev => prev.map(s => {
      if (s.id !== id) return s;
      
      const updates: Partial<ServiceInfo> = { [field]: value };
      
      // If user manually changes the port, mark it as custom
      if (field === 'port') {
        updates.isPortCustom = true;
      }

      return { ...s, ...updates };
    }));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setServices((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);

        // Renumber ports based on new index IF they are not custom
        return newOrder.map((service, index) => {
          if (!service.isPortCustom) {
            return {
              ...service,
              port: 9001 + index
            };
          }
          return service;
        });
      });
    }
  };

  // --- Computed ---
  const totalCU = useMemo(() => {
    return services.reduce((acc, s) => acc + calculateCU(s.bitrate, s.protection, s.type), 0);
  }, [services]);

  const generatedConfig = useMemo(() => {
    return generateConfigFile(ensemble, services, globalSettings, outputFormat);
  }, [ensemble, services, globalSettings, outputFormat]);
  
  const generatedFilename = outputFormat === 'info' ? 'odr-dabmux.info' : 'conf.mux';

  // Helper to check for ETSI non-compliance
  const hasEtsiIssues = () => {
    return services.some(s => !validateEtsiCompliance(s.type, s.protection, s.bitrate));
  };

  // Flow handlers
  const handleGenerateClick = () => {
    // 0. Validate Mandatory Fields
    const missingFields: string[] = [];

    // Check Ensemble
    if (!ensemble.eid.trim()) missingFields.push("Ensemble: Ensemble ID (EID)");
    if (!ensemble.label.trim()) missingFields.push("Ensemble: Long Ensemble Label");
    if (!ensemble.shortLabel.trim()) missingFields.push("Ensemble: Short Ensemble Label");

    // Check Services
    services.forEach((s, index) => {
      const prefix = `Service #${index + 1}`;
      if (!s.sid.trim()) missingFields.push(`${prefix}: Service ID (SID)`);
      if (!s.label.trim()) missingFields.push(`${prefix}: Long Label`);
      if (!s.shortLabel.trim()) missingFields.push(`${prefix}: Short Label`);
      if (!s.port || isNaN(s.port)) missingFields.push(`${prefix}: Port`);
    });

    if (missingFields.length > 0) {
      const header = missingFields.length === 1 
        ? "The following mandatory field is missing:" 
        : "The following mandatory fields are missing:";
      
      setErrorMessage(`${header}\n\n` + missingFields.map(f => `• ${f}`).join("\n"));
      setShowError(true);
      return;
    }

    // 1. Check CU Limit
    if (totalCU > MAX_CU) {
      setErrorMessage("The Capacity Units count exceeds the allowed limit.\nThis prevents the configuration file from being generated.\nPlease review your multiplex composition by making sure that the CU count does not exceed 864, and try again.");
      setShowError(true);
      return;
    }

    // 2. Check Duplicate SIDs
    const sids = services.map(s => s.sid).filter(sid => sid.trim() !== '');
    const uniqueSids = new Set(sids);
    
    if (uniqueSids.size !== sids.length) {
      // Find the first duplicate for the message
      const seen = new Set();
      let duplicate = '';
      for (const sid of sids) {
        if (seen.has(sid)) {
          duplicate = sid;
          break;
        }
        seen.add(sid);
      }
      
      setDuplicateSidValue(duplicate);
      setShowDuplicateWarning(true);
      return;
    }

    // 3. Check ETSI Compliance
    if (hasEtsiIssues()) {
      setShowEtsiWarning(true);
      return;
    }

    // 4. Proceed
    setShowPortConfig(true);
  };

  const handleDuplicateConfirm = () => {
    setShowDuplicateWarning(false);
    // Chain check: After accepting duplicate SID, check for ETSI issues
    if (hasEtsiIssues()) {
      setShowEtsiWarning(true);
      return;
    }
    setShowPortConfig(true);
  };

  const handleEtsiConfirm = () => {
    setShowEtsiWarning(false);
    setShowPortConfig(true);
  };

  const handlePortConfigConfirm = (settings: GlobalSettings, format: OutputFormat) => {
    setGlobalSettings(settings);
    setOutputFormat(format);
    setShowPortConfig(false);
    setShowConfig(true);
  };
  
  const editingService = useMemo(() => 
    services.find(s => s.id === editingServiceSettingsId),
  [services, editingServiceSettingsId]);

  // --- Render ---
  return (
    <div className="min-h-screen pb-20 px-4 pt-6 max-w-5xl mx-auto">
      
      {showWelcome && (
        <WelcomeModal 
          onCreateNew={handleCreateNew} 
          onImport={handleImportConfig} 
        />
      )}

      {/* Header */}
      <header className="mb-8 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-blue-600/20 rounded-full mb-3 ring-1 ring-blue-500/50">
          <Radio className="w-8 h-8 text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">ODR-DabMux Generator</h1>
        <div className="max-w-4xl mx-auto">
           <p className="text-slate-400 whitespace-pre-line">
             Easily generate your ODR-DabMux configuration files (in .info and .mux formats) with this tool.
             {'\n'}
             Add your services, and monitor the CU usage in real-time thanks to the calculator.
           </p>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 mb-24">
        
        {/* Step 1: Ensemble */}
        <section>
          <EnsembleForm 
            ensemble={ensemble} 
            onChange={handleEnsembleChange} 
            onOpenAdvanced={() => setShowAdvancedSettings(true)}
          />
        </section>

        {/* Step 2: Services */}
        <section>
          <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur py-4 flex justify-between items-center border-b border-slate-800 mb-4 transition-all">
             <h2 className="text-xl font-bold text-white flex items-center">
               <Radio className="w-5 h-5 mr-2" />
               Services ({services.length})
             </h2>
             <button 
               onClick={addService}
               className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95"
             >
               <Plus className="w-4 h-4 mr-2" />
               Add Service
             </button>
          </div>

          {services.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 border-dashed rounded-xl p-10 text-center text-slate-400">
               <Info className="w-10 h-10 mx-auto mb-3 text-slate-500" />
               <p>No service configured.</p>
               <p className="text-sm">Click on "Add Service" to start.</p>
            </div>
          ) : (
            <>
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={services.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-4">
                      {services.map((service, index) => (
                        <ServiceItem 
                          key={service.id}
                          id={service.id}
                          index={index + 1}
                          service={service} 
                          onChange={updateService} 
                          onRemove={removeService}
                          onOpenSettings={(id) => setEditingServiceSettingsId(id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
                
                {/* Button at the bottom of the list */}
                <button 
                   onClick={addService}
                   className="w-full mt-4 border-2 border-dashed border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/50 text-slate-400 hover:text-blue-400 font-medium py-4 rounded-xl transition-all flex items-center justify-center group"
                >
                   <div className="bg-slate-800 group-hover:bg-blue-600/20 p-2 rounded-full mr-3 transition-colors">
                      <Plus className="w-5 h-5" />
                   </div>
                   Add a new service
                </button>
            </>
          )}
        </section>

        {/* Actions */}
        <div className="flex justify-center mt-6">
           <button 
             onClick={handleGenerateClick}
             disabled={services.length === 0}
             className="flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-lg font-semibold rounded-lg shadow-lg hover:shadow-emerald-500/20 transition-all"
           >
             <FileCode className="w-5 h-5 mr-2" />
             Generate and download the configuration file
           </button>
        </div>

      </div>

      {/* Sticky Footer: CU Counter */}
      <CUProgressBar services={services} totalCU={totalCU} />

      {/* Modals */}
      {showAdvancedSettings && (
        <AdvancedSettingsModal 
           ensemble={ensemble}
           globalSettings={globalSettings}
           onEnsembleChange={handleEnsembleChange}
           onGlobalChange={handleGlobalSettingsChange}
           onClose={() => setShowAdvancedSettings(false)}
        />
      )}

      {editingService && (
        <ServiceSettingsModal
          service={editingService}
          onChange={updateService}
          onClose={() => setEditingServiceSettingsId(null)}
        />
      )}

      {showPortConfig && (
        <PortConfigModal 
          initialSettings={globalSettings}
          services={services}
          totalCU={totalCU}
          onConfirm={handlePortConfigConfirm}
          onCancel={() => setShowPortConfig(false)}
        />
      )}

      {showConfig && (
        <ConfigModal config={generatedConfig} filename={generatedFilename} onClose={() => setShowConfig(false)} />
      )}

      {showError && (
        <AlertModal 
          message={errorMessage} 
          onClose={() => setShowError(false)} 
        />
      )}

      {showDuplicateWarning && (
        <ConfirmationModal 
          message={
            <>
              The SID <strong>{duplicateSidValue}</strong> is used more than once!
              <br /><br />
              Do you still want to proceed?
            </>
          }
          onConfirm={handleDuplicateConfirm}
          onCancel={() => setShowDuplicateWarning(false)}
        />
      )}

      {showEtsiWarning && (
        <ConfirmationModal 
          message={
            <>
              At least one of your services does not comply with ETSI requirements.
              <br /><br />
              Do you still want to proceed?
            </>
          }
          onConfirm={handleEtsiConfirm}
          onCancel={() => setShowEtsiWarning(false)}
        />
      )}

    </div>
  );
};

export default App;