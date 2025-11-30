import React from 'react';
import { X, Copy, Download } from 'lucide-react';

interface Props {
  config: string;
  filename: string;
  onClose: () => void;
}

export const ConfigModal: React.FC<Props> = ({ config, filename, onClose }) => {
  
  const handleCopy = () => {
    navigator.clipboard.writeText(config);
    alert("Configuration copied!");
  };

  const handleDownload = () => {
    const blob = new Blob([config], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-lg w-full max-w-3xl flex flex-col max-h-[90vh] border border-slate-700 shadow-2xl">
        
        <div className="flex justify-between items-center p-4 border-b border-slate-700">
          <h3 className="text-lg font-bold text-white">Configuration File ({filename})</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-4 bg-slate-950 font-mono text-sm text-slate-300">
          <pre className="whitespace-pre-wrap">{config}</pre>
        </div>

        <div className="p-4 border-t border-slate-700 flex justify-end space-x-3 bg-slate-800 rounded-b-lg">
          <button 
            onClick={handleCopy}
            className="flex items-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded transition-colors"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
          >
            <Download className="w-4 h-4 mr-2" />
            Download
          </button>
        </div>

      </div>
    </div>
  );
};