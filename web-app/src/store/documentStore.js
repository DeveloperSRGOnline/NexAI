import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useDocumentStore = create(
  devtools(
    (set) => ({
      documents: [],
      activeDocument: null,
      sections: [],
      isGenerating: false,
      error: null,

      setDocuments: (documents) => set({ documents }),
      setActiveDocument: (activeDocument) => set({ activeDocument }),
      setSections: (sections) => set({ sections }),
      setGenerating: (isGenerating) => set({ isGenerating }),
      setError: (error) => set({ error, isGenerating: false }),
    }),
    { name: 'document-store' }
  )
);

export default useDocumentStore;
