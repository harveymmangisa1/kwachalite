
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Workspace } from '@/lib/types';

interface WorkspaceState {
  activeWorkspace: Workspace;
  setActiveWorkspace: (workspace: Workspace) => void;
}

export const useActiveWorkspace = create<WorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspace: 'personal',
      setActiveWorkspace: (workspace) => set({ activeWorkspace: workspace }),
    }),
    {
      name: 'active-workspace-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
