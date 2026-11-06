import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../auth/axiosInstance';

export type UnreadEnquiryCounts = {
  submit_manuscripts: number;
  contact_enquiries: number;
};

type EnquiryCountsState = UnreadEnquiryCounts & {
  loading: boolean;
  error: string | null;
};

const initialState: EnquiryCountsState = {
  submit_manuscripts: 0,
  contact_enquiries: 0,
  loading: false,
  error: null,
};

export const fetchUnreadEnquiryCounts = createAsyncThunk(
  'enquiryCounts/fetchUnreadEnquiryCounts',
  async () => {
    const response = await axiosInstance.get('getUnreadEnquiryCounts');
    const counts = response?.data?.data || {};

    return {
      submit_manuscripts: Number(counts.submit_manuscripts) || 0,
      contact_enquiries: Number(counts.contact_enquiries) || 0,
    };
  },
);

const enquiryCountsSlice = createSlice({
  name: 'enquiryCounts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadEnquiryCounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnreadEnquiryCounts.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, action.payload);
      })
      .addCase(fetchUnreadEnquiryCounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load unread enquiry counts';
      });
  },
});

export default enquiryCountsSlice.reducer;