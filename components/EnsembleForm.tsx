import React from 'react';
import { EnsembleInfo } from '../types';
import { Settings, Globe, Type, Hash, Sliders, RefreshCw } from 'lucide-react';
import { COUNTRIES } from '../constants';

interface Props {
  ensemble: EnsembleInfo;
  onChange: (field: keyof EnsembleInfo, value: string) => void;
  onOpenAdvanced: () => void;
}

export const EnsembleForm: React.FC<Props> = ({ ensemble, onChange, onOpenAdvanced }) => {
  // Determine if the current country value is a custom one (not in the predefined list)
  const isCustomCountry = !COUNTRIES.some(c => c.name === ensemble.country);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === 'CUSTOM_VALUE') {
      onChange('country', ''); // Switch to empty string to show input
    } else {
      onChange('country', val);
    }
  };

  const resetCountry = () => {
    onChange('country', 'None / Undefined');
  };

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center text-blue-400">
            <Settings className="w-5 h-5 mr-2" />
            Ensemble Configuration
        </h2>
        <button 
            onClick={onOpenAdvanced}
            className="text-xs flex items-center bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-md transition-colors border border-slate-600 uppercase font-medium tracking-wide"
        >
            <Sliders className="w-3 h-3 mr-1.5" />
            EXTRA SETTINGS
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* EID */}
        <div className="relative">
          <label className="block text-xs font-medium text-slate-400 mb-1">Ensemble ID (EID)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Hash className="h-4 w-4 text-slate-500" />
            </span>
            <input
              type="text"
              maxLength={4}
              value={ensemble.eid}
              onChange={(e) => onChange('eid', e.target.value.toUpperCase())}
              className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Example: F123"
            />
          </div>
        </div>

        {/* Country */}
        <div className="relative">
          <label className="block text-xs font-medium text-slate-400 mb-1">Country (for ECC)</label>
          <div className="relative">
            {isCustomCountry ? (
              <div className="flex">
                <input
                  type="text"
                  maxLength={2}
                  value={ensemble.country}
                  onChange={(e) => onChange('country', e.target.value.toUpperCase())}
                  className="w-full bg-slate-900 border border-slate-700 rounded-l-md py-2 pl-3 pr-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Indicate a hexadecimal value (Example: E1)"
                />
                <button 
                  onClick={resetCountry}
                  className="bg-slate-700 hover:bg-slate-600 border border-l-0 border-slate-700 rounded-r-md px-3 flex items-center justify-center text-slate-300 transition-colors"
                  title="Reset to list"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Globe className="h-4 w-4 text-slate-500" />
                </span>
                <select
                  value={ensemble.country}
                  onChange={handleCountryChange}
                  className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-slate-300"
                >
                  {/* Render 'None / Undefined' first */}
                  <option value={COUNTRIES[0].name}>{COUNTRIES[0].name}</option>
                  
                  {/* Custom option inserted below None */}
                  <option value="CUSTOM_VALUE" className="text-blue-400 font-semibold">+ Specify a custom value</option>

                  {/* Render the rest */}
                  {COUNTRIES.slice(1).map(c => (
                    <option key={c.name} value={c.name}>
                      {`${c.name} [${c.code}]`}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>
        </div>

        {/* Long Label */}
        <div className="relative">
          <label className="block text-xs font-medium text-slate-400 mb-1">Long Ensemble Label (Max. 16 characters)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Type className="h-4 w-4 text-slate-500" />
            </span>
            <input
              type="text"
              maxLength={16}
              value={ensemble.label}
              onChange={(e) => onChange('label', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Example: My Multiplex"
            />
          </div>
        </div>

        {/* Short Label */}
        <div className="relative">
          <label className="block text-xs font-medium text-slate-400 mb-1">Short Ensemble Label (Max. 8 characters)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Type className="h-4 w-4 text-slate-500" />
            </span>
            <input
              type="text"
              maxLength={8}
              value={ensemble.shortLabel}
              onChange={(e) => onChange('shortLabel', e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Example: My Mux"
            />
          </div>
        </div>

      </div>
    </div>
  );
};