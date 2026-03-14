// src/store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isLoggedIn: false,
  role: 'user', // 'user' or 'admin'
  user: null,
  token: null,
  loading: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Login actions
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    loginSuccess: (state, action) => {
      state.isLoggedIn = true;
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.role = action.payload.role || 'user';
    },
    
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    
    // Logout
    logout: (state) => {
      state.isLoggedIn = false;
      state.user = null;
      state.token = null;
      state.role = 'user';
      state.error = null;
    },
    
    // Update role
    setRole: (state, action) => {
      state.role = action.payload;
    },
    
    // Update user
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    }
  }
});

// Export actions
export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setRole,
  updateUser,
  clearError
} = authSlice.actions;

// Export reducer
export default authSlice.reducer;