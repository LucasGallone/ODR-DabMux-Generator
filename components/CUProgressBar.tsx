import React, { useState } from 'react';
import { MAX_CU } from '../constants';
import { Activity } from 'lucide-react';
import { ServiceInfo } from '../types';
import { calculateCU } from '../utils/dabLogic';

interface Props {
  services: ServiceInfo[];
  totalCU: number;
}

const SEGMENT_COLORS = [
  'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500',
  'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-lime-500',
  'bg-pink-500', 'bg-orange-500', 'bg-teal-500', 'bg-fuchsia-500'
];

export const CUProgressBar: React.FC<Props> = ({ services, totalCU }) => {
  const [hoveredService, setHoveredService] = useState<{ label: string; cu: number; sid: string } | null>(null);

  const isOverLimit = totalCU > MAX_CU;

  // Calculate segments
  const segments = services.map((service, index) => {
    const cu = calculateCU(service.bitrate, service.protection, service.type);
    const percent = (cu / MAX_CU) * 100;
    return {
      ...service,
      cu,
      percent,
      color: SEGMENT_COLORS[index % SEGMENT_COLORS.length]
    };
  });

  return (
    <div className="bg-slate-800 p-4 rounded-xl shadow-lg border border-slate-700 sticky bottom-4 z-10 mx-auto max-w-4xl backdrop-blur-sm bg-opacity-90">
      <div className="flex justify-between items-end mb-2 h-8">
        <div className="flex items-center">
            {hoveredService ? (
                <div className="animate-fade-in text-sm font-bold text-white flex items-center bg-slate-700 px-3 py-1 rounded-full border border-slate-600">
                    <span className="text-blue-400 mr-2">Service:</span> 
                    {hoveredService.label || 'Unnamed'} 
                    <span className="mx-2 text-slate-500">|</span>
                    <span className="font-mono text-emerald-400">{hoveredService.cu} CU</span>
                    <span className="mx-2 text-slate-500">|</span>
                    <span className="font-mono text-slate-400 text-xs">SID: {hoveredService.sid}</span>
                </div>
            ) : (
                <>
                    <Activity className={`w-5 h-5 mr-2 ${isOverLimit ? 'text-red-500' : 'text-emerald-500'}`} />
                    <span className="text-sm font-semibold text-slate-300">Real-time CUs calculator (Capacity Units)</span>
                </>
            )}
        </div>
        <div className="text-right">
          <span className={`text-2xl font-bold ${isOverLimit ? 'text-red-500' : 'text-emerald-400'}`}>
            {totalCU}
          </span>
          <span className="text-slate-500 text-sm"> / {MAX_CU}</span>
        </div>
      </div>
      
      {/* Progress Bar Container */}
      <div className="w-full bg-slate-900 rounded-full h-4 flex overflow-hidden relative border border-slate-700">
        {segments.map((segment) => (
          <div 
            key={segment.id}
            className={`h-full transition-all duration-300 ${segment.color} hover:brightness-110 relative group cursor-help border-r border-slate-900/20`}
            style={{ width: `${segment.percent}%` }}
            onMouseEnter={() => setHoveredService({ label: segment.label, cu: segment.cu, sid: segment.sid })}
            onMouseLeave={() => setHoveredService(null)}
          >
          </div>
        ))}
        
        {/* Overflow indicator if needed (visual only, if calculation > 100%) */}
        {isOverLimit && (
             <div className="absolute inset-0 bg-red-500/20 pointer-events-none animate-pulse" />
        )}
      </div>
      
      {isOverLimit && (
        <p className="text-red-400 text-xs mt-2 font-medium">
          Warning: Your multiplex composition exceeds {MAX_CU} CU! It will not be possible to generate your configuration file.
        </p>
      )}
    </div>
  );
};
