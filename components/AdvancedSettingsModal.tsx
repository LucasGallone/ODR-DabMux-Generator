import React from 'react';
import { EnsembleInfo, GlobalSettings } from '../types';
import { Settings, X, Save } from 'lucide-react';

interface Props {
  ensemble: EnsembleInfo;
  globalSettings: GlobalSettings;
  onEnsembleChange: (field: keyof EnsembleInfo, value: any) => void;
  onGlobalChange: (field: keyof GlobalSettings, value: any) => void;
  onClose: () => void;
}

export const AdvancedSettingsModal: React.FC<Props> = ({ 
  ensemble, 
  globalSettings, 
  onEnsembleChange, 
  onGlobalChange, 
  onClose 
}) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-xl w-full max-w-2xl border border-slate-700 shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Settings className="w-6 h-6 mr-3 text-purple-400" />
            Ensemble: Extra Settings
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8">
          
          {/* General Section */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">
              General Configuration
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">DAB Transmission Mode</label>
                <select
                  value={globalSettings.dabMode}
                  onChange={(e) => onGlobalChange('dabMode', parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:ring-1 focus:ring-purple-500"
                >
                  <option value={1}>Mode 1 (Default)</option>
                  <option value={2}>Mode 2</option>
                  <option value={3}>Mode 3</option>
                  <option value={4}>Mode 4</option>
                </select>
                <p className="text-[10px] text-slate-500 mt-1">Standard broadcast mode is 1.</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Number of Frames (nbframes)</label>
                <input
                  type="number"
                  value={globalSettings.nbFrames}
                  onChange={(e) => onGlobalChange('nbFrames', parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:ring-1 focus:ring-purple-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Set to 0 for unlimited generation.</p>
              </div>

              <div className="flex items-center space-x-3">
                 <input
                   type="checkbox"
                   id="syslog"
                   checked={globalSettings.syslog}
                   onChange={(e) => onGlobalChange('syslog', e.target.checked)}
                   className="w-4 h-4 text-purple-600 bg-slate-900 border-slate-600 rounded focus:ring-purple-500"
                 />
                 <label htmlFor="syslog" className="text-sm text-slate-300">Enable Syslog Logging</label>
              </div>

              <div className="flex items-center space-x-3">
                 <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="tist"
                      checked={globalSettings.tist}
                      onChange={(e) => onGlobalChange('tist', e.target.checked)}
                      className="w-4 h-4 text-purple-600 bg-slate-900 border-slate-600 rounded focus:ring-purple-500"
                    />
                    <label htmlFor="tist" className="text-sm text-slate-300 ml-3">Enable TIST (Timestamp)</label>
                 </div>
                 {globalSettings.tist && (
                    <input
                      type="number"
                      step="any"
                      value={globalSettings.tistOffset}
                      onChange={(e) => onGlobalChange('tistOffset', parseFloat(e.target.value))}
                      className="w-20 bg-slate-900 border border-slate-600 rounded px-2 py-1 text-white text-xs outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="0"
                    />
                 )}
              </div>

            </div>
          </div>

          {/* Ensemble Section */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">
              Advanced Ensemble Settings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Local Time Offset</label>
                <input
                  type="text"
                  value={ensemble.localTimeOffset}
                  onChange={(e) => onEnsembleChange('localTimeOffset', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="auto"
                />
                <p className="text-[10px] text-slate-500 mt-1">Leave on "auto" to use your system local time or indicate a value in hours (e.g. 1, 0.5).</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">International Table ID</label>
                <input
                  type="number"
                  value={ensemble.internationalTable}
                  onChange={(e) => onEnsembleChange('internationalTable', parseInt(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:ring-1 focus:ring-purple-500"
                />
                <p className="text-[10px] text-slate-500 mt-1">Default is 1.</p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1">Reconfiguration Counter (reconfig-counter)</label>
                <input
                  type="text"
                  value={ensemble.reconfigCounter}
                  onChange={(e) => onEnsembleChange('reconfigCounter', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-white outline-none focus:ring-1 focus:ring-purple-500"
                  placeholder="hash"
                />
                <p className="text-[10px] text-slate-500 mt-1">Leave on "hash" to let ODR-DabMux calculate a hash that depends on your MUX configuration, or set a number which will be used for the Count field in FIG0/7.</p>
              </div>

            </div>
          </div>

        </div>

        <div className="p-6 border-t border-slate-700 flex justify-end bg-slate-800/50 rounded-b-xl">
          <button 
            onClick={onClose}
            className="flex items-center px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-lg transition-colors shadow-lg shadow-purple-900/20"
          >
            <Save className="w-4 h-4 mr-2" />
            Done
          </button>
        </div>

      </div>
    </div>
  );
};