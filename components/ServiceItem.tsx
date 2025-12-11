
import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ServiceInfo, AudioType, ProtectionLevel } from '../types';
import { PTY_LIST, BITRATES_KBPS, COUNTRIES, LANGUAGES } from '../constants';
import { calculateCU, validateEtsiCompliance, isProtectionB } from '../utils/dabLogic';
import { Trash2, Radio, GripVertical, Sliders, ThumbsUp, AlertTriangle, RefreshCw, AlertCircle, ChevronDown } from 'lucide-react';

interface Props {
  id: string; // Needed for DnD
  index: number;
  service: ServiceInfo;
  onChange: (id: string, field: keyof ServiceInfo, value: any) => void;
  onRemove: (id: string) => void;
  onOpenSettings: (id: string) => void;
}

export const ServiceItem: React.FC<Props> = ({ id, index, service, onChange, onRemove, onOpenSettings }) => {
  const [isBitrateOpen, setIsBitrateOpen] = useState(false);

  const currentCU = calculateCU(service.bitrate, service.protection, service.type);
  const isCompliant = validateEtsiCompliance(service.type, service.protection, service.bitrate);
  
  // Validation for B-Profile (must be multiple of 32)
  const isBProfile = isProtectionB(service.protection);
  const isBitrateValidForB = service.bitrate % 32 === 0;
  const showBProfileError = isBProfile && !isBitrateValidForB;

  // Check if custom values are active
  const isCustomCountry = !COUNTRIES.some(c => c.name === service.country);
  const isCustomLanguage = !LANGUAGES.some(l => l.name === service.language);

  // DnD hooks
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    // Ensure the card pops up when dragging OR when the dropdown is open
    zIndex: isDragging ? 50 : (isBitrateOpen ? 40 : 'auto'),
    position: 'relative' as const,
  };

  const protectionOptions = [
    ProtectionLevel.EEP_1A,
    ProtectionLevel.EEP_2A,
    ProtectionLevel.EEP_3A,
    ProtectionLevel.EEP_4A,
    ProtectionLevel.EEP_1B,
    ProtectionLevel.EEP_2B,
    ProtectionLevel.EEP_3B,
    ProtectionLevel.EEP_4B,
    ProtectionLevel.UEP_1,
    ProtectionLevel.UEP_2,
    ProtectionLevel.UEP_3,
    ProtectionLevel.UEP_4,
    ProtectionLevel.UEP_5,
  ];

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="bg-slate-800 p-4 rounded-lg border border-slate-700 transition-all hover:border-slate-600 shadow-md"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
        
        {/* Left side: Grip and Title */}
        <div className="flex items-center">
          {/* Drag Handle */}
          <button 
            className="mr-3 text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing p-1 hover:bg-slate-700 rounded touch-none"
            {...attributes} 
            {...listeners}
            title="Drag to reorder"
          >
            <GripVertical className="w-5 h-5" />
          </button>

          <h3 className="font-semibold text-slate-200 flex items-center">
            <Radio className="w-4 h-4 mr-2 text-indigo-400" />
            Service #{index}{service.label ? ':' : ''} <span className="text-white ml-2">{service.label}</span>
          </h3>
        </div>
        
        <div className="flex items-center space-x-3 self-end sm:self-auto">
          {/* Extra Settings Button */}
          <button 
             onClick={() => onOpenSettings(service.id)}
             className="flex items-center px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-200 text-[10px] rounded border border-slate-600 transition-colors uppercase font-medium tracking-wide whitespace-nowrap"
             title="Extra Settings"
          >
            <Sliders className="w-3 h-3 mr-1" />
            Extra Settings
          </button>

          {/* Port Input moved here */}
          <div className="flex items-center bg-slate-900 rounded border border-slate-700 px-2 py-1">
            <span className="text-[10px] text-slate-500 mr-2 uppercase font-bold tracking-wider">Port</span>
            <input
                type="number"
                value={service.port}
                onChange={(e) => onChange(service.id, 'port', parseInt(e.target.value))}
                className="w-14 bg-transparent text-xs text-white outline-none text-right font-mono pr-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          <span className="text-xs font-mono bg-emerald-900 text-emerald-200 px-2 py-1.5 rounded whitespace-nowrap">
            {currentCU} CU
          </span>
          <button 
            onClick={() => onRemove(service.id)}
            className="text-red-400 hover:text-red-300 p-1.5 rounded hover:bg-red-900/30 transition-colors"
            title="Remove Service"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pl-0 sm:pl-11">
        
        {/* Row 1 */}
        {/* SID */}
        <div className="md:col-span-2">
           <label className="text-xs text-slate-400 block mb-1">Service ID (SID)</label>
           <input
             type="text"
             maxLength={4}
             value={service.sid}
             onChange={(e) => onChange(service.id, 'sid', e.target.value.toUpperCase())}
             className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs uppercase focus:ring-1 focus:ring-blue-500 outline-none"
           />
        </div>

        {/* Long Label */}
        <div className="md:col-span-6">
           <label className="text-xs text-slate-400 block mb-1">Long Label (Max. 16 characters)</label>
           <input
             type="text"
             maxLength={16}
             value={service.label}
             onChange={(e) => onChange(service.id, 'label', e.target.value)}
             className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
           />
        </div>
        
        {/* Short Label */}
        <div className="md:col-span-4">
           <label className="text-xs text-slate-400 block mb-1">Short Label (Max. 8 characters)</label>
           <input
             type="text"
             maxLength={8}
             value={service.shortLabel}
             onChange={(e) => onChange(service.id, 'shortLabel', e.target.value)}
             className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
           />
        </div>

        {/* Row 2 */}
        
        {/* Type & Bitrate Combined */}
        <div className="md:col-span-4 grid grid-cols-2 gap-2">
            <div>
               <label className="text-xs text-slate-400 block mb-1">Type (DAB+ or DAB)</label>
               <select
                 value={service.type}
                 onChange={(e) => onChange(service.id, 'type', e.target.value)}
                 className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none text-slate-300"
               >
                 <option value={AudioType.DAB_PLUS}>DAB+ (AAC)</option>
                 <option value={AudioType.DAB_MP2}>DAB (MP2)</option>
               </select>
            </div>
            {/* Custom Bitrate Dropdown */}
            <div className="relative">
               <label className="text-xs text-slate-400 block mb-1">Bitrate</label>
               <button
                 type="button"
                 onClick={() => setIsBitrateOpen(!isBitrateOpen)}
                 className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-left flex justify-between items-center focus:ring-1 focus:ring-blue-500 outline-none text-slate-300 hover:border-slate-500 transition-colors"
               >
                 <span>{service.bitrate} Kbps</span>
                 <ChevronDown className="w-3 h-3 text-slate-500" />
               </button>
               
               {isBitrateOpen && (
                 <>
                    {/* Invisible backdrop to handle click-outside */}
                    <div className="fixed inset-0 z-10 cursor-default" onClick={() => setIsBitrateOpen(false)} />
                    
                    {/* Custom Dropdown List */}
                    <div className="absolute top-full left-0 w-full mt-1 bg-slate-900 border border-slate-700 rounded shadow-xl max-h-60 overflow-y-auto z-20">
                      {BITRATES_KBPS.map(b => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => {
                            onChange(service.id, 'bitrate', b);
                            setIsBitrateOpen(false);
                          }}
                          className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-600 hover:text-white transition-colors border-b border-slate-800 last:border-0 ${service.bitrate === b ? 'bg-blue-600 text-white' : 'text-slate-300'}`}
                        >
                          {b} Kbps
                        </button>
                      ))}
                    </div>
                 </>
               )}
            </div>
        </div>

        {/* Protection */}
        <div className="md:col-span-4">
           <label className="text-xs text-slate-400 block mb-1">EEP / UEP (Protection)</label>
           <select
             value={service.protection}
             onChange={(e) => onChange(service.id, 'protection', e.target.value)}
             className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none text-slate-300"
           >
             {protectionOptions.map(l => (
               <option key={l} value={l}>{l}</option>
             ))}
           </select>
        </div>

        {/* PTY */}
        <div className="md:col-span-4">
           <label className="text-xs text-slate-400 block mb-1">PTY (Program Type)</label>
           <select
             value={service.pty}
             onChange={(e) => onChange(service.id, 'pty', e.target.value)}
             className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none text-slate-300 truncate"
           >
             {PTY_LIST.map(p => (
               <option key={p.value} value={p.value}>{p.label}</option>
             ))}
           </select>
        </div>

        {/* Row 3 */}
        {/* Country */}
        <div className="md:col-span-6">
          <label className="text-xs text-slate-400 block mb-1">Country (for ECC)</label>
          {isCustomCountry ? (
            <div className="flex">
              <input
                type="text"
                maxLength={2}
                value={service.country}
                onChange={(e) => onChange(service.id, 'country', e.target.value.toUpperCase())}
                className="w-full bg-slate-900 border border-slate-700 rounded-l-md py-1.5 pl-3 pr-3 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Indicate a hexadecimal value (Example: E1)"
              />
              <button 
                onClick={() => onChange(service.id, 'country', 'None / Undefined')}
                className="bg-slate-700 hover:bg-slate-600 border border-l-0 border-slate-700 rounded-r-md px-3 flex items-center justify-center text-slate-300 transition-colors"
                title="Reset to list"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <select
              value={service.country}
              onChange={(e) => {
                 const val = e.target.value;
                 if (val === 'CUSTOM_VALUE') onChange(service.id, 'country', '');
                 else onChange(service.id, 'country', val);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none text-slate-300"
            >
              <option value={COUNTRIES[0].name}>{COUNTRIES[0].name}</option>
              <option value="CUSTOM_VALUE" className="text-blue-400 font-semibold">+ Specify a custom value</option>
              {COUNTRIES.slice(1).map(c => (
                <option key={c.name} value={c.name}>
                  {`${c.name} [${c.code}]`}
                </option>
              ))}
            </select>
          )}
        </div>
        
        {/* Language */}
        <div className="md:col-span-6">
          <label className="text-xs text-slate-400 block mb-1">Language (for LIC)</label>
          {isCustomLanguage ? (
            <div className="flex">
              <input
                type="text"
                maxLength={2}
                value={service.language}
                onChange={(e) => onChange(service.id, 'language', e.target.value.toUpperCase())}
                className="w-full bg-slate-900 border border-slate-700 rounded-l-md py-1.5 pl-3 pr-3 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                placeholder="Indicate a hexadecimal value (Example: 0F)"
              />
              <button 
                onClick={() => onChange(service.id, 'language', 'None / Undefined')}
                className="bg-slate-700 hover:bg-slate-600 border border-l-0 border-slate-700 rounded-r-md px-3 flex items-center justify-center text-slate-300 transition-colors"
                title="Reset to list"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <select
              value={service.language}
              onChange={(e) => {
                 const val = e.target.value;
                 if (val === 'CUSTOM_VALUE') onChange(service.id, 'language', '');
                 else onChange(service.id, 'language', val);
              }}
              className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs focus:ring-1 focus:ring-blue-500 outline-none text-slate-300"
            >
              <option value={LANGUAGES[0].name}>{LANGUAGES[0].name}</option>
              <option value="CUSTOM_VALUE" className="text-blue-400 font-semibold">+ Specify a custom value</option>
              {LANGUAGES.slice(1).map(l => (
                <option key={l.name} value={l.name}>
                  {`${l.name} [${l.code}]`}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Compliance Checks */}
      <div className="mt-4 pt-3 border-t border-slate-700 pl-0 sm:pl-11 space-y-2">
        {/* B-Profile Error (Multiples of 32) takes precedence */}
        {showBProfileError ? (
          <div className="flex items-center text-red-400 text-xs font-medium">
             <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
             This protection level can only be used for bitrates that are multiples of 32! (e.g. 64, 96, 128, ...)
          </div>
        ) : (
          /* Only show ETSI Check if NO B-Profile Error */
          isCompliant ? (
              <div className="flex items-center text-emerald-400 text-xs font-medium">
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  The configuration of this service complies with ETSI requirements.
              </div>
          ) : (
              <div className="flex items-center text-red-400 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 mr-2 text-yellow-500" />
                  The configuration of this service does not comply with ETSI requirements.
              </div>
          )
        )}
      </div>

    </div>
  );
};
