import React, { useEffect, useState } from 'react';
import {
  PlusCircle,
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Cpu,
  Trash2,
  Download
} from 'lucide-react';
import type { Assessment, ModelStatus } from '../types';
import { api } from '../services/api';

interface DashboardOverviewPageProps {
  onNavigate: (page: string, assessmentId?: string) => void;
}

export const DashboardOverviewPage: React.FC<DashboardOverviewPageProps> = ({ onNavigate }) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [asmList, status] = await Promise.all([
        api.getAssessments(),
        api.getModelStatus()
      ]);
      setAssessments(asmList);
      setModelStatus(status);
    } catch (e) {
      console.error("Error loading dashboard data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalAssessments = assessments.length;
  const completedCount = assessments.filter(a => a.status === 'completed').length;
  const totalBuildingsAnalyzed = assessments.reduce((acc, curr) => acc + (curr.total_buildings || 0), 0);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this assessment record?")) {
      await api.deleteAssessment(id);
      loadData();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Workspace Overview</h1>
          <p className="text-xs text-slate-500">TerraScope Geospatial Command Center | Real Inference Engine</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="p-2 bg-white border border-slate-300 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => onNavigate('new-assessment')}
            className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs rounded shadow-sm transition-colors flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            New Assessment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="solid-card p-4 rounded-lg space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Total Assessments</div>
          <div className="text-2xl font-extrabold text-slate-900">{totalAssessments}</div>
          <div className="text-[11px] text-slate-400">Persisted local assessment records</div>
        </div>

        <div className="solid-card p-4 rounded-lg space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Completed Runs</div>
          <div className="text-2xl font-extrabold text-emerald-700">{completedCount}</div>
          <div className="text-[11px] text-slate-400">Successfully inferred pairs</div>
        </div>

        <div className="solid-card p-4 rounded-lg space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Buildings Analyzed</div>
          <div className="text-2xl font-extrabold text-teal-800">{totalBuildingsAnalyzed}</div>
          <div className="text-[11px] text-slate-400">Identified building regions</div>
        </div>

        <div className="solid-card p-4 rounded-lg space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">Inference Hardware</div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">PyTorch CPU</div>
          <div className="text-[11px] text-slate-400">Multi-threaded evaluation</div>
        </div>
      </div>

      <div className="solid-card p-5 rounded-lg border-l-4 border-l-teal-700 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-teal-800" />
            <h2 className="text-sm font-bold text-slate-900">Inference Engine Status</h2>
          </div>
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-semibold rounded border border-emerald-200">
            {modelStatus?.is_loaded ? 'Operational (Ready)' : 'Initializing'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 bg-slate-50 p-3 rounded border border-slate-200">
          <div>
            <span className="font-semibold text-slate-800 block">Architecture:</span>
            {modelStatus?.model_architecture || 'xView2 First-Place Siam-ResNet U-Net'}
          </div>
          <div>
            <span className="font-semibold text-slate-800 block">Weights Status:</span>
            {modelStatus?.weights_source || 'Pretrained PyTorch Engine'}
          </div>
          <div>
            <span className="font-semibold text-slate-800 block">Execution Device:</span>
            {modelStatus?.device || 'CPU'}
          </div>
        </div>
      </div>

      <div className="solid-card rounded-lg overflow-hidden">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Recent Disaster Damage Assessments</h2>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs font-semibold text-teal-800 hover:text-teal-900 flex items-center gap-1"
          >
            View History
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {assessments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No Assessment Records Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create your first damage assessment by uploading pre- and post-disaster satellite images or selecting sample benchmark imagery.
            </p>
            <button
              onClick={() => onNavigate('new-assessment')}
              className="px-4 py-2 bg-teal-800 text-white font-semibold text-xs rounded hover:bg-teal-900 transition-colors inline-flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Start New Assessment
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold font-mono uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Assessment Name</th>
                  <th className="px-4 py-3">Disaster Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Buildings</th>
                  <th className="px-4 py-3">Runtime</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {assessments.slice(0, 5).map((asm) => (
                  <tr
                    key={asm.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => {
                      if (asm.status === 'completed') {
                        onNavigate('results', asm.id);
                      } else {
                        onNavigate('new-assessment', asm.id);
                      }
                    }}
                  >
                    <td className="px-4 py-3 font-semibold text-slate-900">{asm.name}</td>
                    <td className="px-4 py-3 capitalize">{asm.disaster_type}</td>
                    <td className="px-4 py-3">
                      {asm.status === 'completed' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          Completed
                        </span>
                      )}
                      {asm.status === 'processing' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">
                          <Clock className="w-3 h-3 text-amber-700 animate-spin" />
                          Processing ({asm.progress}%)
                        </span>
                      )}
                      {asm.status === 'failed' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-100 text-red-800 font-medium">
                          <AlertTriangle className="w-3 h-3 text-red-700" />
                          Failed
                        </span>
                      )}
                      {asm.status === 'pending' && (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                          Queued
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold">{asm.total_buildings || 0}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{asm.duration_seconds ? `${asm.duration_seconds}s` : '-'}</td>
                    <td className="px-4 py-3 text-slate-500">{asm.created_at.slice(0, 10)}</td>
                    <td className="px-4 py-3 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                      {asm.status === 'completed' && (
                        <>
                          <button
                            onClick={() => onNavigate('results', asm.id)}
                            className="px-2.5 py-1 bg-teal-800 text-white font-semibold rounded text-[11px] hover:bg-teal-900"
                          >
                            View
                          </button>
                          <a
                            href={api.getReportUrl(asm.id)}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2 py-1 bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-[11px] inline-flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" />
                            PDF
                          </a>
                        </>
                      )}
                      <button
                        onClick={(e) => handleDelete(e, asm.id)}
                        className="p-1 text-slate-400 hover:text-red-700 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
