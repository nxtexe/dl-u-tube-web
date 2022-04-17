import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import initialise from './common/initialise';
import reportWebVitals from './reportWebVitals';

declare global {
  interface Window {
    GLOBAL_WORKER_POOL_SIZE: number;
  }
}

window.GLOBAL_WORKER_POOL_SIZE = 0;

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

initialise();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
