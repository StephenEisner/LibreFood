import { create } from 'zustand';
import type { UserTrackingPreferences } from '../types/preferences';

interface PreferencesStore {
  preferences: UserTrackingPreferences | null;
  setPreferences: (prefs: UserTrackingPreferences | null) => void;
  updatePreferences: (data: Partial<UserTrackingPreferences>) => void;
}

export const usePreferencesStore = create<PreferencesStore>((set) => ({
  preferences: null,
  setPreferences: (preferences) => set({ preferences }),
  updatePreferences: (data) =>
    set((state) => ({
      preferences: state.preferences ? { ...state.preferences, ...data } : null,
    })),
}));
