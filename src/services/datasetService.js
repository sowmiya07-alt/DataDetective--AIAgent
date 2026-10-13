import { DEMO_DATASETS } from '../data/demoData';
import { parseUploadedDataset } from '../utils/fileParser';
import { apiFetch } from './api';

/**
 * Service managing dataset uploads, profiling, and caching
 */

export const datasetService = {
  /**
   * Get initial default datasets
   */
  getDefaultDatasets() {
    return DEMO_DATASETS;
  },

  /**
   * Parse and profile an uploaded file locally
   */
  async uploadAndProfile(file) {
    // Attempt local browser-side parsing for instant responsiveness
    const profiled = await parseUploadedDataset(file);
    return profiled;
  },

  /**
   * Future FastAPI upload endpoint handler
   */
  async uploadToBackend(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await apiFetch('/datasets/upload', {
        method: 'POST',
        headers: {}, // Let browser set multipart boundary
        body: formData
      });
      return res;
    } catch (err) {
      console.warn('Backend upload unavailable, falling back to client-side parsing:', err.message);
      return await this.uploadAndProfile(file);
    }
  }
};
