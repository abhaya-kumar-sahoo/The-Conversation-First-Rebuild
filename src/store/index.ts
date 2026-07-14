import { configureStore } from '@reduxjs/toolkit';
import conversationReducer from './slices/conversationSlice';
import artifactReducer from './slices/artifactSlice';
import uiReducer from './slices/uiSlice';
import { api } from './api/apiSlice';

export const store = configureStore({
  reducer: {
    conversation: conversationReducer,
    artifacts: artifactReducer,
    ui: uiReducer,
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
