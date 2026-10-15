import React from 'react';
import { ArrowRight, Layers, ShieldCheck, FileCheck2, Cpu, ExternalLink } from 'lucide-react';
import { Earth3DScene } from '../components/Earth3DScene';
import { BeforeAfterSlider } from '../components/BeforeAfterSlider';
import { api } from '../services/api';

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-12 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-teal-100 text-teal-900 border border-teal-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-700"></span>
              Powered by Official xView2 First-Place PyTorch Architecture
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-950 tracking-tight leading-none">
              See the Damage. <br />
              <span className="text-teal-800">Understand the Impact.</span>
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-xl">
              TerraScope delivers automated, building-level structural damage intelligence by analyzing satellite and aerial imagery before and after disaster events. Built on the benchmark-winning xView2 Siam-ResNet U-Net deep learning engine.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('new-assessment')}
                className="px-6 py-3 bg-teal-800 hover:bg-teal-900 text-white font-semibold text-sm rounded shadow-sm transition-colors flex items-center gap-2"
              >
                Start New Assessment
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('model-info')}
                className="px-5 py-3 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-sm rounded transition-colors flex items-center gap-2"
              >
                Explore Methodology
                <Cpu className="w-4 h-4 text-slate-500" />
              </button>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200 text-xs">
              <div>
                <div className="font-mono font-bold text-slate-900 text-base">0.5m / px</div>
                <div className="text-slate-500">Spatial Resolution</div>
              </div>
              <div>
                <div className="font-mono font-bold text-teal-800 text-base">4 Classes</div>
                <div className="text-slate-500">Damage Classification</div>
              </div>
              <div>
                <div className="font-mono font-bold text-slate-900 text-base">CPU Ready</div>
                <div className="text-slate-500">Local Inference Engine</div>
              </div>
            </div>
          </div>

          {/* 3D Earth Observation Scene */}
          <div className="lg:col-span-6 h-[440px]">
            <Earth3DScene />
          </div>
        </div>
      </section>

      {/* Visual Before / After Demo Section */}
      <section className="bg-white border-y border-slate-200 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Synchronized Satellite Comparison</h2>
            <p className="text-sm text-slate-600">
              Drag the swipe slider to visually evaluate structural change between pre-event baseline imagery and post-disaster capture.
            </p>
          </div>

          <div className="max-w-4xl mx-auto h-[420px]">
            <BeforeAfterSlider
              preUrl={api.getSampleImageUrl(0, 'pre')}
              postUrl={api.getSampleImageUrl(0, 'post')}
              className="w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* Three Feature Pillars */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Built for Rapid Emergency Response</h2>
          <p className="text-sm text-slate-600">
            Engineered specifically for structural damage assessment workflow without relying on external cloud APIs or proprietary lock-in.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="solid-card p-6 rounded-lg space-y-3">
            <div className="w-10 h-10 rounded bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">1. Building Localization</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Stage 1 U-Net encoder processes pre-disaster imagery to segment exact building footprints, establishing clean baseline spatial boundaries.
            </p>
          </div>

          <div className="solid-card p-6 rounded-lg space-y-3">
            <div className="w-10 h-10 rounded bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">2. Damage Severity Assessment</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Stage 2 Siamese neural network evaluates pre/post feature differences, classifying each structure into No Damage, Minor, Major, or Destroyed.
            </p>
          </div>

          <div className="solid-card p-6 rounded-lg space-y-3">
            <div className="w-10 h-10 rounded bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">3. Evidence-Based Reporting</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generates PDF technical inspection reports and CSV feature datasets with full breakdown statistics and building-by-building coordinates.
            </p>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="bg-slate-100 border-t border-slate-200 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="solid-card p-8 rounded-lg max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Methodology & Pretrained Weights</h3>
                <p className="text-xs text-slate-500">Official xView2 First-Place Challenge Solution</p>
              </div>
              <a
                href="https://github.com/DIUx-xView/xView2_first_place"
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-teal-800 hover:text-teal-900 flex items-center gap-1"
              >
                GitHub Repository
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-600 leading-relaxed">
              <div>
                <strong className="text-slate-900 block mb-1">Localization Stage:</strong>
                Uses a ResNet34 U-Net model trained strictly on pre-disaster imagery to isolate building contours without noise from post-disaster atmospheric variations.
              </div>
              <div>
                <strong className="text-slate-900 block mb-1">Siamese Classification Stage:</strong>
                Feeds pre- and post-disaster image pairs through shared encoder branches, concatenating multi-scale feature maps to output 4-class logits.
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-5 py-2.5 bg-teal-800 hover:bg-teal-900 text-white font-semibold text-xs rounded transition-colors"
              >
                Launch Workspace Command Center
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        TerraScope — Disaster Damage Intelligence Platform | Powered by xView2 Challenge 1st-Place Solution
      </footer>
    </div>
  );
};
