import React, { useState, useEffect } from 'react';
import { FileText, Download, FileSpreadsheet } from 'lucide-react';
import type { Assessment } from '../types';
import { api } from '../services/api';

export const ReportsPage: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);

  useEffect(() => {
    api.getAssessments().then(setAssessments).catch(console.error);
  }, []);

  const completed = assessments.filter(a => a.status === 'completed');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Technical Assessment Reports & Exports</h1>
        <p className="text-xs text-slate-500">Download ReportLab generated PDF technical inspection documents & CSV datasets</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="solid-card p-6 rounded-lg space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">PDF Executive Reports</h2>
              <p className="text-xs text-slate-500">Automated ReportLab PDF document with image overlays & metrics</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {completed.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded">
                No completed assessments available for report generation.
              </div>
            ) : (
              completed.map((asm) => (
                <div key={asm.id} className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{asm.name}</div>
                    <div className="text-slate-500 text-[11px] font-mono">{asm.id} • {asm.created_at.slice(0, 10)}</div>
                  </div>
                  <a
                    href={api.getReportUrl(asm.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-teal-800 hover:bg-teal-900 text-white font-semibold rounded text-[11px] flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download PDF
                  </a>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="solid-card p-6 rounded-lg space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">CSV Spatial Feature Exports</h2>
              <p className="text-xs text-slate-500">Raw building polygon coordinates, confidence scores, and damage indices</p>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            {completed.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded">
                No completed assessments available for CSV export.
              </div>
            ) : (
              completed.map((asm) => (
                <div key={asm.id} className="p-3 bg-slate-50 rounded border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{asm.name}</div>
                    <div className="text-slate-500 text-[11px] font-mono">{asm.total_buildings || 0} building records</div>
                  </div>
                  <a
                    href={api.getExportCsvUrl(asm.id)}
                    className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-semibold rounded text-[11px] flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export CSV
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
