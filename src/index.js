import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import process from 'process';

// Polyfill for process
if (typeof global.process === 'undefined') {
  global.process = process;
}

const root = ReactDOM.createRoot(document.getElementById('root'));
// Polyfill for process
if (typeof process === 'undefined') {
  global.process = {
    env: {
      NODE_ENV: 'development', // or 'production'
    },
  };
}

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);


