
import React, { useRef } from 'react';
import { FileUp, Plus, Radio } from 'lucide-react';

interface Props {
  onCreateNew: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const WelcomeModal: React.FC<Props> = ({ onCreateNew, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950">
      <div className="bg-slate-900 rounded-2xl w-full max-w-2xl border border-slate-700 shadow-2xl p-10 text-center">
        
        <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-600/20 rounded-full ring-1 ring-blue-500/50">
                <Radio className="w-12 h-12 text-blue-400" />
            </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Welcome to ODR-DabMux Generator</h1>
        <p className="text-slate-400 mb-10 text-lg">How would you like to start?</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <button 
                onClick={onCreateNew}
                className="group relative flex flex-col items-center justify-center p-8 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500/50 rounded-xl transition-all duration-300"
            >
                <div className="mb-4 p-3 bg-blue-600 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                    <Plus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Create a new configuration</h3>
                <p className="text-xs text-slate-400">Start from scratch</p>
            </button>

            <button 
                onClick={handleImportClick}
                className="group relative flex flex-col items-center justify-center p-8 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 rounded-xl transition-all duration-300"
            >
                <div className="mb-4 p-3 bg-emerald-600 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                    <FileUp className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Import an existing configuration</h3>
                <p className="text-xs text-slate-400">Edit .info or .mux files</p>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={onImport} 
                    accept=".info,.mux" 
                    className="hidden" 
                />
            </button>

        </div>

      </div>
    </div>
  );
};
