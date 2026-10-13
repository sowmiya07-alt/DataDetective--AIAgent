import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEMO_DATASETS, INITIAL_DATASET } from '../data/demoData';
import { SEED_HISTORY } from '../data/sampleHistory';
import { checkBackendHealth } from '../services/api';

const DatasetContext = createContext(null);

const STORAGE_KEY_DATASETS = 'datadetective_custom_datasets';
const STORAGE_KEY_HISTORY = 'datadetective_analysis_history';
const STORAGE_KEY_ACTIVE_ID = 'datadetective_active_dataset_id';

export function DatasetProvider({ children }) {
  // Load custom uploaded datasets from localStorage
  const [datasets, setDatasets] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DATASETS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...DEMO_DATASETS, ...parsed];
      }
    } catch (e) {
      console.warn('Failed to load custom datasets from storage', e);
    }
    return DEMO_DATASETS;
  });

  // Track active dataset ID
  const [activeDatasetId, setActiveDatasetId] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_ACTIVE_ID) || INITIAL_DATASET.id;
  });

  // Analysis History
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load history from storage', e);
    }
    return SEED_HISTORY;
  });

  // Backend connection status
  const [backendStatus, setBackendStatus] = useState({
    connected: false,
    status: 'Demo Mode (Local Engine)',
    url: 'http://localhost:8000/api'
  });

  // Check backend health on mount
  const refreshBackendStatus = useCallback(async () => {
    const res = await checkBackendHealth();
    setBackendStatus(res);
  }, []);

  useEffect(() => {
    refreshBackendStatus();
  }, [refreshBackendStatus]);

  // Derived active dataset
  const activeDataset = datasets.find(d => d.id === activeDatasetId) || datasets[0] || INITIAL_DATASET;

  // Change active dataset
  const selectDataset = useCallback((id) => {
    setActiveDatasetId(id);
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
  }, []);

  // Add a newly parsed dataset
  const addDataset = useCallback((newDataset) => {
    setDatasets(prev => {
      // Filter out existing by same name or id if replacing
      const filtered = prev.filter(d => d.id !== newDataset.id);
      const updated = [newDataset, ...filtered];

      // Save custom ones (non-demo) to localStorage
      try {
        const customOnly = updated.filter(d => !d.isDemo);
        localStorage.setItem(STORAGE_KEY_DATASETS, JSON.stringify(customOnly));
      } catch (e) {
        console.warn('Could not persist large dataset to localStorage', e);
      }
      return updated;
    });

    setActiveDatasetId(newDataset.id);
    localStorage.setItem(STORAGE_KEY_ACTIVE_ID, newDataset.id);
  }, []);

  // Remove dataset
  const removeDataset = useCallback((id) => {
    setDatasets(prev => {
      const updated = prev.filter(d => d.id !== id);
      try {
        const customOnly = updated.filter(d => !d.isDemo);
        localStorage.setItem(STORAGE_KEY_DATASETS, JSON.stringify(customOnly));
      } catch (e) {
        console.warn('Could not persist datasets', e);
      }
      return updated;
    });

    if (activeDatasetId === id) {
      setActiveDatasetId(INITIAL_DATASET.id);
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, INITIAL_DATASET.id);
    }
  }, [activeDatasetId]);

  // Add item to analysis history
  const addHistoryItem = useCallback((item) => {
    setHistory(prev => {
      const updated = [item, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated.slice(0, 50)));
      } catch (e) {
        console.warn('Failed to save history to storage', e);
      }
      return updated;
    });
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY_HISTORY);
  }, []);

  return (
    <DatasetContext.Provider
      value={{
        datasets,
        activeDataset,
        activeDatasetId,
        selectDataset,
        addDataset,
        removeDataset,
        history,
        addHistoryItem,
        clearHistory,
        backendStatus,
        refreshBackendStatus
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  const context = useContext(DatasetContext);
  if (!context) {
    throw new Error('useDataset must be used within a DatasetProvider');
  }
  return context;
}
