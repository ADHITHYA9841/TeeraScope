import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  FileBarChart,
  Cpu,
  Settings,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'new-assessment', label: 'New Assessment', icon: PlusCircle },
    { id: 'history', label: 'Assessment History', icon: History },
    { id: 'reports', label: 'Reports & Export', icon: FileBarChart },
    { id: 'model-info', label: 'Model Information', icon: Cpu },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="solid-sidebar w-64 flex-shrink-0 min-h-[calc(100vh-61px)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2 font-mono">
            COMMAND CENTER
          </div>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-900 border border-teal-200 font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-teal-800' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-teal-800" />}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* System Status Box */}
      <div className="p-3 bg-slate-50 rounded border border-slate-200 text-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          <span className="font-semibold text-slate-800">xView2 PyTorch Engine</span>
        </div>
        <div className="text-[11px] text-slate-500 leading-normal">
          Running in CPU mode. Pretrained weights ready.
        </div>
      </div>
    </aside>
  );
};
