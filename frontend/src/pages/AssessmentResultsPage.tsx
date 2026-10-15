import React, { useEffect, useState } from 'react';
import {
  Download,
  FileText,
  Clock,
  Building,
  AlertTriangle,
  Search,
  Layers
} from 'lucide-react';
import type { Assessment, InferenceResults, BuildingPrediction } from '../types';
import { DamageOverlayMap } from '../components/DamageOverlayMap';
import { Building3DViewer } from '../components/Building3DViewer';
import { api } from '../services/api';

interface AssessmentResultsPageProps {
  assessmentId: string;
  onNavigate: (page: string) => void;
}

export const AssessmentResultsPage: React.FC<AssessmentResultsPageProps> = ({
  assessmentId,
  onNavigate
}) => {
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [results, setResults] = useState<InferenceResults | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingPrediction | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const asm = await api.getAssessment(assessmentId);
      setAssessment(asm);

      if (asm.status === 'completed') {
        const resData = await api.getResults(assessmentId);
        setResults(resData);
        if (resData.buildings && resData.buildings.length > 0) {
          setSelectedBuilding(resData.buildings[0]);
        }
      } else if (asm.status === 'processing') {
        setTimeout(loadResults, 2000);
      } else if (asm.status === 'failed') {
        setError(asm.error_message || "Assessment processing failed on backend.");
      }
    } catch (e: any) {
      console.error(e);
      setError("Failed to fetch assessment results.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, [assessmentId]);

  if (loading && !assessment) {
    return (
      <div className="p-12 text-center space-y-3">
        <Clock className="w-8 h-8 text-teal-800 animate-spin mx-auto" />
        <div className="text-sm font-semibold text-slate-800">Loading Damage Assessment Workspace...</div>
      </div>
    );
  }

  if (assessment?.status === 'processing') {
    return (
      <div className="solid-card p-10 rounded-lg text-center max-w-xl mx-auto space-y-5 my-10">
        <div className="w-12 h-12 rounded-full bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center mx-auto animate-pulse">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">Inference Engine In Progress</h2>
          <p className="text-xs text-slate-500 mt-1">{assessment.stage || 'Executing PyTorch Siamese ResNet Model'}</p>
        </div>

        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-teal-700 h-full transition-all duration-300"
            style={{ width: `${assessment.progress || 20}%` }}
          ></div>
        </div>

        <div className="text-xs font-mono text-slate-600">
          Progress: {assessment.progress}%
        </div>
      </div>
    );
  }

  if (error || !assessment || !results) {
    return (
      <div className="p-8 bg-red-50 border border-red-200 rounded text-red-900 space-y-3 max-w-lg mx-auto my-10">
        <AlertTriangle className="w-6 h-6 text-red-700" />
        <div className="font-bold text-sm">Assessment Analysis Error</div>
        <p className="text-xs text-red-700">{error || "Results unavailable."}</p>
        <button
          onClick={() => onNavigate('dashboard')}
          className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const filteredBuildings = results.buildings.filter(b =>
    b.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.damage_class.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="solid-card p-5 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{assessment.name}</h1>
            <span className="px-2 py-0.5 bg-teal-100 text-teal-900 font-semibold text-[11px] rounded capitalize">
              {assessment.disaster_type}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 font-mono">
            <span>ID: {assessment.id}</span>
            <span>Date: {assessment.event_date || 'N/A'}</span>
            <span>Location: {assessment.location || 'Unspecified'}</span>
            <span className="text-teal-800 font-semibold">Runtime: {results.duration_seconds}s</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={api.getExportCsvUrl(assessmentId)}
            className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded transition-colors inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            CSV Export
          </a>
          <a
            href={api.getReportUrl(assessmentId)}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs rounded shadow-sm transition-colors inline-flex items-center gap-2"
          >
            <FileText className="w-3.5 h-3.5" />
            Download PDF Report
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 h-[640px]">
          <DamageOverlayMap
            assessmentId={assessmentId}
            results={results}
            selectedBuilding={selectedBuilding}
            onSelectBuilding={setSelectedBuilding}
          />
        </div>

        <div className="lg:col-span-4 space-y-4">
          {selectedBuilding ? (
            <div className="solid-card p-4 rounded-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div>
                  <div className="text-xs font-mono font-bold text-slate-500">{selectedBuilding.id}</div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedBuilding.color }}></span>
                    {selectedBuilding.damage_class}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-slate-400 font-mono">Confidence</div>
                  <div className="text-sm font-extrabold text-slate-900 font-mono">
                    {Math.round(selectedBuilding.confidence * 100)}%
                  </div>
                </div>
              </div>

              <div>
                <Building3DViewer building={selectedBuilding} />
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-700">Pre/Post Region Snippets:</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900 rounded p-1 text-center">
                    <img
                      src={api.getSnippetUrl(selectedBuilding.pre_snippet)}
                      alt="Pre snippet"
                      className="h-24 w-full object-contain mx-auto"
                    />
                    <span className="text-[10px] text-emerald-400 font-semibold font-mono block mt-1">Pre-Disaster</span>
                  </div>
                  <div className="bg-slate-900 rounded p-1 text-center">
                    <img
                      src={api.getSnippetUrl(selectedBuilding.post_snippet)}
                      alt="Post snippet"
                      className="h-24 w-full object-contain mx-auto"
                    />
                    <span className="text-[10px] text-slate-300 font-semibold font-mono block mt-1">Post-Disaster</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-200 text-xs">
                <div className="font-semibold text-slate-800">Softmax Class Probabilities:</div>
                <div className="space-y-1">
                  {Object.entries(selectedBuilding.probabilities).map(([clsName, prob]) => (
                    <div key={clsName} className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600">{clsName}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-teal-700 h-full"
                            style={{ width: `${Math.round(prob * 100)}%` }}
                          ></div>
                        </div>
                        <span className="font-mono text-slate-800">{Math.round(prob * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="solid-card p-6 rounded-lg text-center text-xs text-slate-500">
              Select a building polygon on the map to inspect structural geometry and crop snippets.
            </div>
          )}

          <div className="solid-card rounded-lg overflow-hidden flex flex-col h-[280px]">
            <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Detected Building Objects ({results.buildings.length})</span>
              <div className="relative w-36">
                <Search className="w-3 h-3 absolute left-2 top-2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-6 pr-2 py-1 text-[11px] border border-slate-300 rounded bg-white"
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-slate-200">
              {filteredBuildings.map((bld) => (
                <div
                  key={bld.id}
                  onClick={() => setSelectedBuilding(bld)}
                  className={`p-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs transition-colors ${
                    selectedBuilding?.id === bld.id ? 'bg-teal-50 border-l-4 border-l-teal-800' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: bld.color }}></span>
                    <span className="font-mono font-semibold text-slate-800">{bld.id}</span>
                    <span className="text-slate-500 text-[11px]">{bld.damage_class}</span>
                  </div>
                  <div className="font-mono text-[11px] text-slate-600">
                    {Math.round(bld.confidence * 100)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="solid-card p-4 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 font-mono">No Damage</div>
            <div className="text-lg font-bold text-slate-900">
              {results.damage_breakdown.no_damage.count} <span className="text-xs text-slate-500">({results.damage_breakdown.no_damage.percentage}%)</span>
            </div>
          </div>
        </div>

        <div className="solid-card p-4 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-yellow-50 text-yellow-800 border border-yellow-200 flex items-center justify-center font-bold">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 font-mono">Minor Damage</div>
            <div className="text-lg font-bold text-slate-900">
              {results.damage_breakdown.minor_damage.count} <span className="text-xs text-slate-500">({results.damage_breakdown.minor_damage.percentage}%)</span>
            </div>
          </div>
        </div>

        <div className="solid-card p-4 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-orange-50 text-orange-800 border border-orange-200 flex items-center justify-center font-bold">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 font-mono">Major Damage</div>
            <div className="text-lg font-bold text-slate-900">
              {results.damage_breakdown.major_damage.count} <span className="text-xs text-slate-500">({results.damage_breakdown.major_damage.percentage}%)</span>
            </div>
          </div>
        </div>

        <div className="solid-card p-4 rounded-lg flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-red-50 text-red-800 border border-red-200 flex items-center justify-center font-bold">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-slate-500 font-mono">Destroyed</div>
            <div className="text-lg font-bold text-slate-900">
              {results.damage_breakdown.destroyed.count} <span className="text-xs text-slate-500">({results.damage_breakdown.destroyed.percentage}%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
