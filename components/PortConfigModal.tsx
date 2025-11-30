import React, { useState } from 'react';
import { GlobalSettings, ServiceInfo, OutputFormat } from '../types';
import { Settings, Check, List, FileText } from 'lucide-react';
import { calculateCU } from '../utils/dabLogic';
import { MAX_CU } from '../constants';

interface Props {
  initialSettings: GlobalSettings;
  services: ServiceInfo[];
  totalCU: number;
  onConfirm: (settings: GlobalSettings, format: OutputFormat) => void;
  onCancel: () => void;
}

export const PortConfigModal: React.FC<Props> = ({ initialSettings, services, totalCU, onConfirm, onCancel }) => {
  const [settings, setSettings] = useState<GlobalSettings>(initialSettings);
  const [format, setFormat] = useState<OutputFormat>('info');

  const handleChange = (field: keyof GlobalSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const isOverLimit = totalCU > MAX_CU;
  const percentage = Math.min((totalCU / MAX_CU) * 100, 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-800 rounded-xl w-full max-w-4xl shadow-2xl border border-slate-700 my-auto">
        
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center mb-1">
            <Settings className="w-6 h-6 mr-3 text-blue-400" />
            Configuration Ports & Output Format
          </h2>
          <p className="text-slate-400 text-sm">
            One last step before generating your file: Define your configuration ports and choose an output format.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Left Column: Ports & Format */}
          <div className="p-6 space-y-5">
             <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center">
               <Settings className="w-4 h-4 mr-2 text-slate-400" />
               Configuration Ports
             </h3>

             <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Management Port</label>
                  <input
                    type="number"
                    value={settings.managementPort}
                    onChange={(e) => handleChange('managementPort', parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:ring-1 focus:ring-blue-500 outline-none font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">Telnet Port</label>
                  <input
                    type="number"
                    value={settings.telnetPort}
                    onChange={(e) => handleChange('telnetPort', parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:ring-1 focus:ring-blue-500 outline-none font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">ZMQ End Point</label>
                  <input
                    type="text"
                    value={settings.zmqEndpoint}
                    onChange={(e) => handleChange('zmqEndpoint', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:ring-1 focus:ring-blue-500 outline-none font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1 uppercase tracking-wider">EDI TCP Listen Port</label>
                  <input
                    type="number"
                    value={settings.ediPort}
                    onChange={(e) => handleChange('ediPort', parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white focus:ring-1 focus:ring-blue-500 outline-none font-mono text-sm"
                  />
                </div>
             </div>

             <div className="border-t border-slate-700 pt-4 mt-4">
               <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center">
                 <FileText className="w-4 h-4 mr-2 text-slate-400" />
                 Output Format
               </h3>
               <div className="flex space-x-4">
                 <label className="flex items-center space-x-2 cursor-pointer">
                   <input 
                     type="radio" 
                     name="format" 
                     value="info" 
                     checked={format === 'info'} 
                     onChange={() => setFormat('info')}
                     className="text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-600"
                   />
                   <span className="text-sm text-slate-300">.info (odr-dabmux.info)</span>
                 </label>
                 <label className="flex items-center space-x-2 cursor-pointer">
                   <input 
                     type="radio" 
                     name="format" 
                     value="mux" 
                     checked={format === 'mux'} 
                     onChange={() => setFormat('mux')}
                     className="text-blue-600 focus:ring-blue-500 bg-slate-900 border-slate-600"
                   />
                   <span className="text-sm text-slate-300">.mux (conf.mux)</span>
                 </label>
               </div>
             </div>

             <div className="pt-2 text-xs text-slate-500">
               <p>Default values are pre-filled.</p>
               <p className="mt-1">If they suit your needs, don't modify anything and click on Continue.</p>
             </div>
          </div>

          {/* Right Column: Multiplex Summary */}
          <div className="p-6 bg-slate-900/30 border-l border-slate-700 flex flex-col h-full">
             <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center">
               <List className="w-4 h-4 mr-2 text-slate-400" />
               Multiplex Composition
             </h3>
             
             <div className="flex-1 overflow-y-auto max-h-[300px] pr-2 space-y-2 mb-4">
                {services.map((srv, idx) => {
                  const srvCu = calculateCU(srv.bitrate, srv.protection, srv.type);
                  return (
                    <div key={srv.id} className="bg-slate-800 rounded p-3 border border-slate-700 flex justify-between items-center text-sm">
                       <div>
                         <div className="font-semibold text-slate-200">
                           Service #{idx + 1}{srv.label ? ':' : ''} {srv.label}
                         </div>
                         <div className="text-xs text-slate-500 flex gap-2 mt-1">
                           <span className="font-mono bg-slate-900 px-1 rounded text-slate-400 border border-slate-700">SID: {srv.sid}</span>
                           <span className="bg-slate-900 px-1 rounded border border-slate-700">{srv.bitrate} kbps</span>
                           <span className="bg-slate-900 px-1 rounded border border-slate-700">{srv.protection}</span>
                         </div>
                       </div>
                       <div className="text-right">
                          <span className="text-emerald-400 font-mono font-bold">{srvCu} CU</span>
                       </div>
                    </div>
                  );
                })}
             </div>

             <div className="mt-auto pt-4 border-t border-slate-700">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Total Usage</span>
                  <span className={`text-sm font-bold font-mono ${isOverLimit ? 'text-red-500' : 'text-emerald-400'}`}>
                    {totalCU} / {MAX_CU} CU
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${isOverLimit ? 'bg-red-500' : 'bg-emerald-500'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
             </div>
          </div>

        </div>

        <div className="p-4 border-t border-slate-700 flex justify-end space-x-3 bg-slate-900/50 rounded-b-xl">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(settings, format)}
            className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded transition-colors"
          >
            Continue
            <Check className="w-4 h-4 ml-2" />
          </button>
        </div>

      </div>
    </div>
  );
};