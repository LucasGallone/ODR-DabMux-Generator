import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<Props> = ({ message, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-xl w-full max-w-md border border-yellow-500/50 shadow-2xl transform scale-100 transition-all">
        
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-900/30 mb-4">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
          </div>
          
          <h3 className="text-lg font-bold text-white mb-2">
            Warning
          </h3>
          
          <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-line mb-6">
            {message}
          </div>

          <div className="flex space-x-3 justify-center">
            <button 
                onClick={onCancel}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors focus:outline-none"
            >
                No
            </button>
            <button 
                onClick={onConfirm}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors focus:outline-none"
            >
                Yes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};