import axios from 'axios';
import type { Assessment, ModelStatus, SampleDataset, InferenceResults } from '../types';

const API_BASE = 'http://127.0.0.1:8000/api';

export const api = {
  getHealth: async () => {
    const res = await axios.get(`${API_BASE}/health`);
    return res.data;
  },

  getModelStatus: async (): Promise<ModelStatus> => {
    const res = await axios.get(`${API_BASE}/model/status`);
    return res.data;
  },

  getSamples: async (): Promise<SampleDataset[]> => {
    const res = await axios.get(`${API_BASE}/samples`);
    return res.data;
  },

  getAssessments: async (): Promise<Assessment[]> => {
    const res = await axios.get(`${API_BASE}/assessments`);
    return res.data;
  },

  getAssessment: async (id: string): Promise<Assessment> => {
    const res = await axios.get(`${API_BASE}/assessments/${id}`);
    return res.data;
  },

  createAssessment: async (formData: FormData): Promise<Assessment> => {
    const res = await axios.post(`${API_BASE}/assessments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  processAssessment: async (id: string): Promise<Assessment> => {
    const res = await axios.post(`${API_BASE}/assessments/${id}/process`);
    return res.data;
  },

  getResults: async (id: string): Promise<InferenceResults> => {
    const res = await axios.get(`${API_BASE}/assessments/${id}/results`);
    return res.data;
  },

  deleteAssessment: async (id: string): Promise<{ success: boolean }> => {
    const res = await axios.delete(`${API_BASE}/assessments/${id}`);
    return res.data;
  },

  getPreImageUrl: (id: string) => `${API_BASE}/assessments/${id}/images/pre`,
  getPostImageUrl: (id: string) => `${API_BASE}/assessments/${id}/images/post`,
  getSampleImageUrl: (index: number, type: 'pre' | 'post') => `${API_BASE}/samples/${index}/image/${type}`,
  getResultOverlayUrl: (id: string) => `${API_BASE}/assessments/${id}/results/overlay.png`,
  getResultMaskUrl: (id: string) => `${API_BASE}/assessments/${id}/results/mask.png`,
  getReportUrl: (id: string) => `${API_BASE}/assessments/${id}/report`,
  getExportCsvUrl: (id: string) => `${API_BASE}/assessments/${id}/export`,
  getSnippetUrl: (snippetPath: string) => snippetPath.startsWith('http') ? snippetPath : `http://127.0.0.1:8000${snippetPath}`
};
