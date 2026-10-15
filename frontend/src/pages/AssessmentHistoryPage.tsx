import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Trash2 } from 'lucide-react';
import type { Assessment } from '../types';
import { api } from '../services/api';

interface AssessmentHistoryPageProps {
  onNavigate: (page: string, assessmentId?: string) => void;
}

export const AssessmentHistoryPage: React.FC<AssessmentHistoryPageProps> = ({ onNavigate }) => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [disasterFilter, setDisasterFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadData = async () => {
    try {
      const data = await api.getAssessments();
      setAssessments(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm(`Are you sure you want to delete assessment ${id}?`)) {
      await api.deleteAssessment(id);
      loadData();
    }
  };

  const filtered = assessments.filter((asm) => {
    const matchesSearch = asm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (asm.location && asm.location.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDisaster = disasterFilter === 'all' || asm.disaster_type === disasterFilter;
    const matchesStatus = statusFilter === 'all' || asm.status === statusFilter;
    return matchesSearch && matchesDisaster && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Assessment History Archive</h1>
          <p className="text-xs text-slate-500">SQLite persistent database store of completed and past disaster runs</p>
        </div>
      </div>

      <div className="solid-card p-4 rounded-lg flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by assessment name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded focus:ring-1 focus:ring-teal-700 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={disasterFilter}
            onChange={(e) => setDisasterFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded bg-white font-medium text-slate-700"
          >
            <option value="all">All Disasters</option>
            <option value="earthquake">Earthquake</option>
            <option value="hurricane">Hurricane</option>
            <option value="wildfire">Wildfire</option>
            <option value="flood">Flood</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-300 rounded bg-white font-medium text-slate-700"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="solid-card rounded-lg overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No matching assessment records found in database.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-semibold font-mono uppercase text-[11px]">
                <tr>
                  <th className="px-4 py-3">Assessment ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Disaster Type</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Buildings</th>
                  <th className="px-4 py-3">Area (sq.m)</th>
                  <th className="px-4 py-3">Runtime</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((asm) => (
                  <tr
                    key={asm.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => {
                      if (asm.status === 'completed') onNavigate('results', asm.id);
                    }}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{asm.id}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{asm.name}</td>
                    <td className="px-4 py-3 capitalize">{asm.disaster_type}</td>
                    <td className="px-4 py-3">
                      {asm.status === 'completed' && (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">Completed</span>
                      )}
                      {asm.status === 'processing' && (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-medium">Processing ({asm.progress}%)</span>
                      )}
                      {asm.status === 'failed' && (
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-medium">Failed</span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold">{asm.total_buildings || 0}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{asm.assessed_area_sqm || 0}</td>
                    <td className="px-4 py-3 font-mono text-slate-500">{asm.duration_seconds ? `${asm.duration_seconds}s` : '-'}</td>
                    <td className="px-4 py-3 text-slate-500">{asm.created_at.slice(0, 10)}</td>
                    <td className="px-4 py-3 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                      {asm.status === 'completed' && (
                        <>
                          <button
                            onClick={() => onNavigate('results', asm.id)}
                            className="px-2.5 py-1 bg-teal-800 text-white font-semibold rounded text-[11px]"
                          >
                            Results
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
                        onClick={() => handleDelete(asm.id)}
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
