import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarCollapsed: boolean;
  commandPaletteOpen: boolean;
  artifactPanelExpanded: boolean;
  rightPanelWidth: number;
  leftPanelWidth: number;
  toasts: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
  }>;
}

const initialState: UIState = {
  sidebarCollapsed: false,
  commandPaletteOpen: false,
  artifactPanelExpanded: false,
  rightPanelWidth: 520,
  leftPanelWidth: 260,
  toasts: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed(state, action: PayloadAction<boolean>) {
      state.sidebarCollapsed = action.payload;
    },
    toggleCommandPalette(state) {
      state.commandPaletteOpen = !state.commandPaletteOpen;
    },
    toggleArtifactPanelExpanded(state) {
      state.artifactPanelExpanded = !state.artifactPanelExpanded;
    },
    setCommandPaletteOpen(state, action: PayloadAction<boolean>) {
      state.commandPaletteOpen = action.payload;
    },
    setRightPanelWidth(state, action: PayloadAction<number>) {
      state.rightPanelWidth = Math.min(900, Math.max(380, action.payload));
    },
    addToast(
      state,
      action: PayloadAction<{
        id: string;
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        description?: string;
      }>
    ) {
      state.toasts.push(action.payload);
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  toggleCommandPalette,
  toggleArtifactPanelExpanded,
  setCommandPaletteOpen,
  setRightPanelWidth,
  addToast,
  removeToast,
} = uiSlice.actions;

export default uiSlice.reducer;
