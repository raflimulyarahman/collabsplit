import { create } from 'zustand';
import { type SuiClient } from '@mysten/sui.js/client';

interface Split {
  id: string;
  members: string[];
  percentages: number[];
  balance: number;
}

interface CollabSplitStore {
  splits: Split[];
  selectedSplit: Split | null;
  suiClient: SuiClient | null;
  isLoading: boolean;
  error: string | null;
  setSplits: (splits: Split[]) => void;
  setSelectedSplit: (split: Split | null) => void;
  setSuiClient: (client: SuiClient) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useCollabSplitStore = create<CollabSplitStore>((set) => ({
  splits: [],
  selectedSplit: null,
  suiClient: null,
  isLoading: false,
  error: null,
  setSplits: (splits) => set({ splits }),
  setSelectedSplit: (split) => set({ selectedSplit: split }),
  setSuiClient: (client) => set({ suiClient: client }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));