import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  message: string;
  onClose: () => void;
}

export const AlertModal: React.FC<Props> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-xl w-full max-w-md border border-red-500/50 shadow-2xl transform scale-100 transition-all">
        
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
          
          <h3 className="text-lg font-bold text-white mb-2">
            The configuration file cannot be generated
          </h3>
          
          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>

        <div className="p-4 border-t border-slate-800 flex justify-center bg-slate-800/50 rounded-b-xl">
          <button 
            onClick={onClose}
            className="w-full flex justify-center items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-slate-900"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
