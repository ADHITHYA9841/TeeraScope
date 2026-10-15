import React, { useState, useEffect } from 'react';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Play,
  Sliders,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  X,
  FileImage
} from 'lucide-react';
import type { SampleDataset, ModelStatus } from '../types';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { api } from '../services/api';

interface NewAssessmentPageProps {
  onNavigate: (page: string, assessmentId?: string) => void;
}

export const NewAssessmentPage: React.FC<NewAssessmentPageProps> = ({ onNavigate }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1 Details
  const [name, setName] = useState('');
  const [disasterType, setDisasterType] = useState('earthquake');
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // Step 2 Files & Samples
  const [preFile, setPreFile] = useState<File | null>(null);
  const [postFile, setPostFile] = useState<File | null>(null);
  const [prePreview, setPrePreview] = useState<string>('');
  const [postPreview, setPostPreview] = useState<string>('');
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number | null>(null);
  const [samples, setSamples] = useState<SampleDataset[]>([]);

  // Step 3 Model Config
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getSamples().then(data => {
      setSamples(data);
    }).catch(console.error);

    api.getModelStatus().then(setModelStatus).catch(console.error);
  }, []);

  const handleSelectSample = (index: number) => {
    setSelectedSampleIndex(index);
    setPreFile(null);
    setPostFile(null);
    const s = samples[index];
    setName(s.name);
    setDisasterType(s.disaster_type);
    setLocation(s.location);
    setPrePreview(api.getSampleImageUrl(index, 'pre'));
    setPostPreview(api.getSampleImageUrl(index, 'post'));
  };

  const handleClearSelectedSample = () => {
    setSelectedSampleIndex(null);
    setPreFile(null);
    setPostFile(null);
    setPrePreview('');
    setPostPreview('');
  };

  const handlePreFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreFile(file);
      setSelectedSampleIndex(null);
      setPrePreview(URL.createObjectURL(file));
      if (!name) {
        setName(`Assessment - ${file.name.replace(/\.[^/.]+$/, "")}`);
      }
    }
  };

  const handlePostFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPostFile(file);
      setSelectedSampleIndex(null);
      setPostPreview(URL.createObjectURL(file));
    }
  };

  const handleRunAssessment = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('name', name || 'Custom Satellite Assessment');
      formData.append('disaster_type', disasterType);
      if (eventDate) formData.append('event_date', eventDate);
      if (location) formData.append('location', location);
      if (notes) formData.append('notes', notes);

      if (selectedSampleIndex !== null) {
        formData.append('sample_index', selectedSampleIndex.toString());
      } else if (preFile && postFile) {
        formData.append('pre_image', preFile);
        formData.append('post_image', postFile);
      } else {
        throw new Error("Please upload both pre- and post-disaster satellite images, or select a sample benchmark dataset.");
      }

      const created = await api.createAssessment(formData);
      await api.processAssessment(created.id);
      onNavigate('results', created.id);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || err.message || "Failed to launch assessment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Step Indicator */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">New Damage Assessment Workflow</h1>
          <p className="text-xs text-slate-500">Upload pre/post disaster satellite pairs or select sample benchmark</p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <button
            onClick={() => setStep(1)}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 ${step === 1 ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-700'}`}
          >
            <span>1</span> Details
          </button>
          <button
            onClick={() => setStep(2)}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 ${step === 2 ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-700'}`}
          >
            <span>2</span> Imagery Upload
          </button>
          <button
            onClick={() => { if (prePreview && postPreview) setStep(3); }}
            disabled={!prePreview || !postPreview}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 ${step === 3 ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-700 disabled:opacity-50'}`}
          >
            <span>3</span> Model Engine Run
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-700 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STEP 1: Details */}
      {step === 1 && (
        <div className="solid-card p-6 rounded-lg space-y-5">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">Step 1 — Assessment Metadata</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Assessment Name *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Earthquake Structural Audit"
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-teal-700 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Disaster Category *</label>
              <select
                value={disasterType}
                onChange={(e) => setDisasterType(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-teal-700 focus:outline-none bg-white"
              >
                <option value="earthquake">Earthquake</option>
                <option value="hurricane">Hurricane / Storm</option>
                <option value="wildfire">Wildfire</option>
                <option value="flood">Flood</option>
                <option value="other">Other Structural Event</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Event Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-teal-700 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Location / Region</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Kahramanmaraş, Turkey"
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-teal-700 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700">Assessment Notes / Tactical Context</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add contextual observations..."
                className="w-full px-3 py-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-teal-700 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="px-5 py-2 bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs rounded transition-colors flex items-center gap-2"
            >
              Continue to Imagery Upload
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Upload Imagery */}
      {step === 2 && (
        <div className="solid-card p-6 rounded-lg space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Step 2 — Upload Pre- & Post-Disaster Satellite Pair</h2>
              <p className="text-xs text-slate-500">Upload your custom satellite images or choose a benchmark sample pair</p>
            </div>
            {selectedSampleIndex !== null && (
              <button
                onClick={handleClearSelectedSample}
                className="text-xs text-teal-800 hover:underline font-semibold flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Clear sample / Upload custom files
              </button>
            )}
          </div>

          {/* Quick Test Sample Selector */}
          <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Sparkles className="w-4 h-4 text-teal-700" />
              <span>Or Select Pre-Configured Benchmark Sample Dataset:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {samples.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(idx)}
                  className={`p-2.5 rounded text-left border text-xs transition-colors ${
                    selectedSampleIndex === idx
                      ? 'bg-teal-100 border-teal-700 font-semibold text-teal-950 shadow-sm'
                      : 'bg-white border-slate-300 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="font-bold truncate">{s.name}</div>
                  <div className="text-[11px] text-slate-500 capitalize">{s.disaster_type} • {s.location}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Two Separate File Upload Dropzones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pre Disaster Upload Box */}
            <div className="border-2 border-dashed border-slate-300 hover:border-teal-700 p-5 rounded-lg text-center bg-slate-50 space-y-3 transition-colors">
              <div className="text-xs font-bold text-slate-800 uppercase font-mono flex items-center justify-center gap-1.5">
                <FileImage className="w-4 h-4 text-teal-700" />
                1. Pre-Disaster Satellite Image
              </div>
              {prePreview ? (
                <div className="relative h-48 bg-slate-900 rounded overflow-hidden border border-slate-700">
                  <img src={prePreview} alt="Pre-Disaster Preview" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => { setPreFile(null); setPrePreview(''); setSelectedSampleIndex(null); }}
                    className="absolute top-2 right-2 bg-slate-900/90 text-white p-1 rounded hover:bg-red-700 transition-colors"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    {preFile ? preFile.name : `Sample Pre-Image`}
                  </div>
                </div>
              ) : (
                <label className="block cursor-pointer py-10 px-4 bg-white border border-slate-200 rounded hover:bg-teal-50/50 transition-colors">
                  <Upload className="w-9 h-9 text-teal-700 mx-auto mb-2" />
                  <span className="text-xs font-bold text-teal-900 block">Click to Upload Pre-Disaster Image</span>
                  <span className="text-[11px] text-slate-500 block mt-1">Supports PNG, JPG, JPEG, TIFF (RGB satellite capture)</span>
                  <input type="file" accept="image/*" onChange={handlePreFileChange} className="hidden" />
                </label>
              )}
            </div>

            {/* Post Disaster Upload Box */}
            <div className="border-2 border-dashed border-slate-300 hover:border-teal-700 p-5 rounded-lg text-center bg-slate-50 space-y-3 transition-colors">
              <div className="text-xs font-bold text-slate-800 uppercase font-mono flex items-center justify-center gap-1.5">
                <FileImage className="w-4 h-4 text-teal-700" />
                2. Post-Disaster Satellite Image
              </div>
              {postPreview ? (
                <div className="relative h-48 bg-slate-900 rounded overflow-hidden border border-slate-700">
                  <img src={postPreview} alt="Post-Disaster Preview" className="w-full h-full object-contain" />
                  <button
                    type="button"
                    onClick={() => { setPostFile(null); setPostPreview(''); setSelectedSampleIndex(null); }}
                    className="absolute top-2 right-2 bg-slate-900/90 text-white p-1 rounded hover:bg-red-700 transition-colors"
                    title="Remove Image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    {postFile ? postFile.name : `Sample Post-Image`}
                  </div>
                </div>
              ) : (
                <label className="block cursor-pointer py-10 px-4 bg-white border border-slate-200 rounded hover:bg-teal-50/50 transition-colors">
                  <Upload className="w-9 h-9 text-teal-700 mx-auto mb-2" />
                  <span className="text-xs font-bold text-teal-900 block">Click to Upload Post-Disaster Image</span>
                  <span className="text-[11px] text-slate-500 block mt-1">Supports PNG, JPG, JPEG, TIFF (RGB satellite capture)</span>
                  <input type="file" accept="image/*" onChange={handlePostFileChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Synchronized Alignment Preview Slider */}
          {prePreview && postPreview && (
            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-teal-700" />
                  Pre-Inference Alignment Inspector:
                </span>
                <span className="text-[11px] text-slate-500">Drag vertical slider to verify visual alignment</span>
              </div>
              <div className="h-64">
                <BeforeAfterSlider preUrl={prePreview} postUrl={postPreview} className="w-full h-full" />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold text-xs rounded hover:bg-slate-100 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              type="button"
              onClick={() => setStep(3)}
              disabled={!prePreview || !postPreview}
              className="px-5 py-2 bg-teal-800 hover:bg-teal-900 disabled:opacity-50 text-white font-semibold text-xs rounded transition-colors flex items-center gap-2"
            >
              Continue to Model Setup
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Model Config & Launch */}
      {step === 3 && (
        <div className="solid-card p-6 rounded-lg space-y-6">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">Step 3 — Processing Pipeline Configuration</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Localization Model Stage (Stage 1)
              </div>
              <p className="text-slate-600">ResNet34 U-Net backbone. Processes pre-disaster RGB input to segment building footprints.</p>
              <div className="font-mono text-[11px] text-slate-500">Status: Operational (Ready)</div>
            </div>

            <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Damage Classification Stage (Stage 2)
              </div>
              <p className="text-slate-600">Siamese Dual-Branch Neural Network. Concatenates pre/post feature maps into 4-class logits.</p>
              <div className="font-mono text-[11px] text-slate-500">Status: Operational (CPU Mode)</div>
            </div>
          </div>

          <div className="bg-teal-50 border border-teal-200 p-4 rounded text-xs text-teal-900 space-y-1">
            <strong className="block font-bold">Inference Parameters:</strong>
            <div>Target Model: xView2 First-Place Siam-ResNet Solution</div>
            <div>Inference Device: PyTorch CPU Engine</div>
            <div>Weights Checkpoint: {modelStatus?.weights_source || "Pretrained PyTorch Weights"}</div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              disabled={submitting}
              className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold text-xs rounded hover:bg-slate-100 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              type="button"
              onClick={handleRunAssessment}
              disabled={submitting}
              className="px-6 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs rounded shadow transition-colors flex items-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              {submitting ? 'Launching Inference...' : 'Run Damage Assessment'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
