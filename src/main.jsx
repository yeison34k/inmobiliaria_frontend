import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App.jsx';
import './app/styles/global.css';
import './app/styles/home.css';
import './app/styles/catalog.css';
import './app/styles/ventas.css';
import './app/styles/experience.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
