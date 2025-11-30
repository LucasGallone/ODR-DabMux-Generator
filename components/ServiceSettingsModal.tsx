import React from 'react';
import { ServiceInfo } from '../types';
import { Settings, X, Save } from 'lucide-react';

interface Props {
  service: ServiceInfo;
  onChange: (id: string, field: keyof ServiceInfo, value: any) => void;
  onClose: () => void;
}

export const ServiceSettingsModal: React.FC<Props> = ({ service, onChange, onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl w-full max-w-lg border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Settings className="w-6 h-6 mr-3 text-emerald-400" />
            Extra Settings: {service.label || 'Service'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* PTY SD */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">PTY-SD Mode</label>
            <select
              value={service.ptySd}
              onChange={(e) => onChange(service.id, 'ptySd', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="static">Static (Default)</option>
              <option value="dynamic">Dynamic</option>
            </select>
            <p className="text-[10px] text-slate-400 mt-1">Indicates whether the Program Type is dynamic or not.</p>
          </div>

          {/* Buffer Management */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Buffer Management</label>
            <select
              value={service.bufferManagement}
              onChange={(e) => onChange(service.id, 'bufferManagement', e.target.value)}
              className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="prebuffering">Prebuffering (Default)</option>
              <option value="timestamped">Timestamped</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
             {/* Buffer Size */}
             <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Buffer Size</label>
                <input
                  type="number"
                  value={service.bufferSize}
                  onChange={(e) => onChange(service.id, 'bufferSize', parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Default: 40</p>
             </div>

             {/* Prebuffering Size */}
             <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Prebuffering Size</label>
                <input
                  type="number"
                  value={service.prebufferingSize}
                  onChange={(e) => onChange(service.id, 'prebufferingSize', parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">Default: 20</p>
             </div>
          </div>

        </div>

        <div className="p-6 border-t border-slate-700 flex justify-end bg-slate-800/50 rounded-b-xl">
          <button 
            onClick={onClose}
            className="flex items-center px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-emerald-900/20"
          >
            <Save className="w-4 h-4 mr-2" />
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
