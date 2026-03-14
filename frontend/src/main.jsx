import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; 
import { Provider } from 'react-redux';
import store from './store/store';
import App from './App';
import './index.css';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
globalThis.API_URL = API_URL;  

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);