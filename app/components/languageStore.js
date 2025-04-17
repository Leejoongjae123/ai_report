import { create } from 'zustand'

export const useLanguageStore = create((set) => ({
  language: typeof window !== 'undefined' 
    ? localStorage.getItem('selectedLanguage') || 'korean'
    : 'korean',
  setLanguage: (newLanguage) => set({ language: newLanguage }),
}))