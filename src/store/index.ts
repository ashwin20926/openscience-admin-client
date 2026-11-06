import { configureStore } from '@reduxjs/toolkit';
import enquiryCountsReducer from './enquiryCountsSlice';

export const store = configureStore({
  reducer: {
    enquiryCounts: enquiryCountsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;