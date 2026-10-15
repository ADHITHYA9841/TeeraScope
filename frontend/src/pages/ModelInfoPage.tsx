import React, { useEffect, useState } from 'react';
import { Cpu, ExternalLink, ShieldAlert } from 'lucide-react';
import type { ModelStatus } from '../types';
import { api } from '../services/api';

export const ModelInfoPage: React.FC = () => {
  const [modelStatus, setModelStatus] = useState<ModelStatus | null>(null);

  useEffect(() => {
    api.getModelStatus().then(setModelStatus).catch(console.error);
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900">xView2 First-Place AI Inference Engine</h1>
        <p className="text-xs text-slate-500">Technical architecture specification, model stages, and evaluation context</p>
      </div>

      <div className="solid-card p-5 rounded-lg border-l-4 border-l-teal-700 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-teal-800" />
            {modelStatus?.model_architecture || 'xView2 First-Place Siam-ResNet U-Net'}
          </div>
          <div className="text-xs text-slate-600 font-mono">
            Device: {modelStatus?.device} | Weights: {modelStatus?.weights_source}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://github.com/DIUx-xView/xView2_first_place"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded inline-flex items-center gap-1.5"
          >
            GitHub Repository
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="https://vdurnov.s3.amazonaws.com/xview2_1st_weights.zip"
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 bg-teal-800 hover:bg-teal-900 text-white text-xs font-semibold rounded inline-flex items-center gap-1.5"
          >
            Pretrained Weights (S3)
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="solid-card p-6 rounded-lg space-y-6">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">Dual-Stage Neural Architecture</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2 text-xs">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-teal-800 text-white flex items-center justify-center font-mono text-xs">1</span>
              Building Localization Stage
            </div>
            <p className="text-slate-600 leading-relaxed">
              Accepts only the 3-channel pre-disaster RGB satellite image. Uses a U-Net encoder-decoder architecture with a ResNet34 backbone to output a binary mask of building footprints. Training exclusively on pre-disaster images avoids noise from post-disaster atmospheric variations or lighting shifts.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-2 text-xs">
            <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-teal-800 text-white flex items-center justify-center font-mono text-xs">2</span>
              Siamese Damage Classification Stage
            </div>
            <p className="text-slate-600 leading-relaxed">
              Accepts both pre- and post-disaster RGB images through a Siamese shared-weight encoder. Feature maps from corresponding decoder layers are concatenated and fed into classification layers to predict pixel-level 4-class damage logits.
            </p>
          </div>
        </div>
      </div>

      <div className="solid-card p-6 rounded-lg space-y-4">
        <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-3">xView2 Standard Damage Scale Definitions</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded space-y-1">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
              0: No Damage
            </div>
            <p className="text-emerald-800">Structure shows no visible signs of structural compromise or roof alteration.</p>
          </div>

          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded space-y-1">
            <div className="font-bold text-yellow-900 flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-yellow-600"></span>
              1: Minor Damage
            </div>
            <p className="text-yellow-800">Partial roof discolouration, minor shingle displacement, or localized debris nearby.</p>
          </div>

          <div className="p-3 bg-orange-50 border border-orange-200 rounded space-y-1">
            <div className="font-bold text-orange-900 flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-orange-600"></span>
              2: Major Damage
            </div>
            <p className="text-orange-800">Significant roof collapse, structural wall failure, or severe structural distortion.</p>
          </div>

          <div className="p-3 bg-red-50 border border-red-200 rounded space-y-1">
            <div className="font-bold text-red-900 flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-600"></span>
              3: Destroyed
            </div>
            <p className="text-red-800">Total structural collapse, foundation displacement, or complete incineration to rubble.</p>
          </div>
        </div>
      </div>

      <div className="solid-card p-6 rounded-lg space-y-3 bg-slate-50 border-l-4 border-l-amber-600 text-xs text-slate-700">
        <div className="font-bold text-slate-900 flex items-center gap-2 text-sm">
          <ShieldAlert className="w-4 h-4 text-amber-700" />
          Operational Limitations & Ground Verification Notice
        </div>
        <p className="leading-relaxed">
          Computer vision damage assessments derived from satellite imagery are subject to physical constraints such as heavy cloud shadows, off-nadir camera angles, seasonal vegetation growth, and image spatial misalignment.
        </p>
        <p className="leading-relaxed font-semibold text-slate-900">
          All automated model predictions provided by TerraScope serve as initial tactical decision support and must be validated by licensed structural engineers or ground inspection personnel before making operational resource deployments.
        </p>
      </div>
    </div>
  );
};
