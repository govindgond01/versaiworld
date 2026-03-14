import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardService from '../../services/dashboardService';

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (dashboardType) => {
    let response;
    switch(dashboardType) {
      case 'academy':
        response = await dashboardService.getAcademyStats();
        break;
      case 'library':
        response = await dashboardService.getLibraryStats();
        break;
      case 'staff':
        response = await dashboardService.getStaffStats();
        break;
      default:
        response = { data: [] };
    }
    return { type: dashboardType, data: response.data };
  }
);

export const fetchActivities = createAsyncThunk(
  'dashboard/fetchActivities',
  async (dashboardType) => {
    const response = await dashboardService.getActivities(dashboardType);
    return response.data;
  }
);

export const fetchNotifications = createAsyncThunk(
  'dashboard/fetchNotifications',
  async () => {
    const response = await dashboardService.getNotifications();
    return response.data;
  }
);

const initialState = {
  stats: [],
  activities: [],
  notifications: [],
  loading: false,
  error: null
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboard: (state) => {
      state.stats = [];
      state.activities = [];
      state.notifications = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.data;
      })
      .addCase(fetchDashboardStats.rejected, (state) => {
        state.loading = false;
      })
      
      // Activities
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.activities = action.payload;
      })
      
      // Notifications
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
      });
  }
});

export const { clearDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;