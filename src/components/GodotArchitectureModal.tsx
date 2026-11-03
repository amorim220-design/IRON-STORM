/**
 * Project Iron Storm - Godot 4 Architecture Blueprint Modal
 * Full source inspection, architectural breakdown, and project download for Godot 4.3+
 */

import React, { useState } from 'react';
import { GODOT_PROJECT_FILES, GodotFile } from '../game/godotBlueprint';
import { Download, Copy, Check, FileCode, Layers, Cpu, Smartphone, Monitor } from 'lucide-react';

interface GodotArchitectureModalProps {
  onClose: () => void;
}

export const GodotArchitectureModal: React.FC<GodotArchitectureModalProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<GodotFile>(GODOT_PROJECT_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadAll = () => {
    // Generate combined bundle download
    const bundleText = GODOT_PROJECT_FILES.map(f => 
      `====================================================\nFILE: res://${f.path}\nDESCRIPTION: ${f.description}\n====================================================\n\n${f.code}\n\n`
    ).join('\n');

    const blob = new Blob([bundleText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'project_iron_storm_godot4_source_blueprint.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* MODAL HEADER */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-heading font-bold text-white tracking-wide">
                GODOT 4.3+ ENGINE ARCHITECTURE &amp; GDSCRIPT BLUEPRINTS
              </h2>
              <p className="text-xs text-slate-400">
                Production-grade 2D architecture designed for Windows, Android, and Linux export
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadAll}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow transition-colors"
            >
              <Download className="w-4 h-4" />
              Download All GDScripts
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* SYSTEM SPECS BAR */}
        <div className="px-6 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Target: <strong>Godot 4.3 Forward+</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Monitor className="w-4 h-4 text-sky-400" />
            <span>PC: DirectInput &amp; XInput Multi-Controller</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <span>Mobile: Android GLES3/Vulkan Touch Mapping</span>
          </div>
        </div>

        {/* CONTENT SPLIT: SIDEBAR & CODE VIEWER */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* FILE LIST SIDEBAR */}
          <div className="w-72 bg-slate-950/50 border-r border-slate-800 p-3 overflow-y-auto space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2 block mb-1">
              Project Structure
            </span>

            {GODOT_PROJECT_FILES.map((file) => (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs flex items-center gap-2.5 transition-colors ${
                  selectedFile.path === file.path 
                    ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 font-medium' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <FileCode className="w-4 h-4 shrink-0 text-slate-500" />
                <div className="truncate">
                  <div className="truncate font-mono">{file.path}</div>
                  <div className="text-[10px] text-slate-500">{file.category}</div>
                </div>
              </button>
            ))}
          </div>

          {/* CODE & DESCRIPTION MAIN PANE */}
          <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
            
            {/* FILE INFO BAR */}
            <div className="px-6 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/20">
              <div>
                <span className="font-mono text-xs font-bold text-amber-400">
                  res://{selectedFile.path}
                </span>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedFile.description}
                </p>
              </div>

              <button
                onClick={handleCopy}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy GDScript'}
              </button>
            </div>

            {/* SYNTAX HIGHLIGHTED CODE */}
            <div className="flex-1 p-6 overflow-auto font-mono text-xs leading-relaxed bg-slate-950 text-slate-300">
              <pre className="whitespace-pre">
                {selectedFile.code}
              </pre>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
