// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // ✅ ADD THIS
import { Provider } from 'react-redux';
import store from './store/store';
import App from './App';
import './index.css';
import axios from 'axios';  // ✅ YEH IMPORT KARO

// ✅ YEH 3 LINES ADD KARO - TOKEN SET HOGA!
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  console.log('✅ Token set in axios');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter> {/* ✅ WRAP App with BrowserRouter */}
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);