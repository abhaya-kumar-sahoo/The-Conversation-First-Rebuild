import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { nanoid } from '@reduxjs/toolkit';
import type { Artifact, ArtifactType } from '@/types';

interface ArtifactState {
  artifacts: Artifact[];
  activeArtifactId: string | null;
}

const initialState: ArtifactState = {
  artifacts: [],
  activeArtifactId: null,
};

const artifactSlice = createSlice({
  name: 'artifacts',
  initialState,
  reducers: {
    createArtifact(
      state,
      action: PayloadAction<{
        type: ArtifactType;
        title: string;
        subtitle?: string;
        payload: Record<string, unknown>;
        conversationId: string;
      }>
    ) {
      const artifact: Artifact = {
        id: nanoid(),
        type: action.payload.type,
        title: action.payload.title,
        subtitle: action.payload.subtitle,
        payload: action.payload.payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPinned: false,
        conversationId: action.payload.conversationId,
      };
      state.artifacts.push(artifact);
      state.activeArtifactId = artifact.id;
    },
    updateArtifact(
      state,
      action: PayloadAction<{ id: string; payload: Partial<Artifact> }>
    ) {
      const idx = state.artifacts.findIndex(a => a.id === action.payload.id);
      if (idx !== -1) {
        state.artifacts[idx] = {
          ...state.artifacts[idx],
          ...action.payload.payload,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteArtifact(state, action: PayloadAction<string>) {
      state.artifacts = state.artifacts.filter(a => a.id !== action.payload);
      if (state.activeArtifactId === action.payload) {
        state.activeArtifactId = state.artifacts[state.artifacts.length - 1]?.id || null;
      }
    },
    setActiveArtifact(state, action: PayloadAction<string | null>) {
      state.activeArtifactId = action.payload;
    },
    pinArtifact(state, action: PayloadAction<string>) {
      const artifact = state.artifacts.find(a => a.id === action.payload);
      if (artifact) {
        artifact.isPinned = !artifact.isPinned;
      }
    },
    clearAllArtifacts(state) {
      state.artifacts = [];
      state.activeArtifactId = null;
    },
  },
});

export const {
  createArtifact,
  updateArtifact,
  deleteArtifact,
  setActiveArtifact,
  pinArtifact,
  clearAllArtifacts,
} = artifactSlice.actions;

export default artifactSlice.reducer;
