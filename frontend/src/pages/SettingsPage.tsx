import React, { useState } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [retentionDays, setRetentionDays] = useState(30);
  const [cpuThreads, setCpuThreads] = useState(4);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Workspace Settings</h1>
        <p className="text-xs text-slate-500">Configure storage retention, CPU execution threads, and interface preferences</p>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          Settings successfully updated.
        </div>
      )}

      <div className="solid-card p-6 rounded-lg space-y-5 text-xs">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">Storage & Data Retention Policy</h2>

        <div className="space-y-2">
          <label className="font-semibold text-slate-800 block">Assessment Data Retention (Days)</label>
          <input
            type="number"
            value={retentionDays}
            onChange={(e) => setRetentionDays(parseInt(e.target.value) || 7)}
            className="w-48 px-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-teal-700 focus:outline-none"
          />
          <p className="text-slate-500 text-[11px]">
            Automatically purges uploaded image pairs and generated result artifacts older than configured days.
          </p>
        </div>

        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3 pt-4">PyTorch CPU Execution Engine</h2>

        <div className="space-y-2">
          <label className="font-semibold text-slate-800 block">PyTorch CPU Worker Threads</label>
          <select
            value={cpuThreads}
            onChange={(e) => setCpuThreads(parseInt(e.target.value))}
            className="w-48 px-3 py-1.5 border border-slate-300 rounded bg-white"
          >
            <option value={2}>2 Threads</option>
            <option value={4}>4 Threads (Recommended)</option>
            <option value={8}>8 Threads</option>
          </select>
          <p className="text-slate-500 text-[11px]">
            Controls OpenMP multi-threading parallelization for CPU matrix convolutions.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-200 flex justify-end">
          <button
            onClick={handleSave}
            className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs rounded transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
