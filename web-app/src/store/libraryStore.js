import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useLibraryStore = create(
  devtools(
    (set) => ({
      items: [],
      selectedItem: null,
      filterType: 'all',
      searchQuery: '',
      isLoading: false,
      error: null,

      setItems: (items) => set({ items }),
      setSelectedItem: (selectedItem) => set({ selectedItem }),
      setFilterType: (filterType) => set({ filterType }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error, isLoading: false }),
    }),
    { name: 'library-store' }
  )
);

export default useLibraryStore;
