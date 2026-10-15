import React from 'react';
import { ArrowRight } from 'lucide-react';

interface NavbarProps {
  onNavigate: (page: string) => void;
  activePage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, activePage }) => {
  return (
    <header className="solid-header sticky top-0 z-40 w-full px-6 py-3.5 flex items-center justify-between">
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => onNavigate('landing')}
      >
        <div className="w-8 h-8 rounded bg-teal-800 text-white flex items-center justify-center font-bold text-sm shadow-sm">
          TS
        </div>
        <div>
          <div className="font-bold text-slate-900 text-base leading-tight tracking-tight flex items-center gap-2">
            TerraScope
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
              xView2 AI Engine
            </span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Disaster Damage Intelligence Platform</div>
        </div>
      </div>

      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
        <button
          onClick={() => onNavigate('landing')}
          className={`hover:text-teal-800 transition-colors ${activePage === 'landing' ? 'text-teal-800 font-semibold' : ''}`}
        >
          Product
        </button>
        <button
          onClick={() => onNavigate('model-info')}
          className={`hover:text-teal-800 transition-colors ${activePage === 'model-info' ? 'text-teal-800 font-semibold' : ''}`}
        >
          Methodology & AI Model
        </button>
        <button
          onClick={() => onNavigate('dashboard')}
          className={`hover:text-teal-800 transition-colors ${activePage === 'dashboard' ? 'text-teal-800 font-semibold' : ''}`}
        >
          Workspace Dashboard
        </button>
      </nav>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate('new-assessment')}
          className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold rounded shadow-sm transition-colors flex items-center gap-2"
        >
          Start Assessment
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
