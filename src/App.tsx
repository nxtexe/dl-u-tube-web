import React from 'react';
import {ThemeProvider} from '@mui/material/styles';
import {darkTheme} from './Components';
import {Home, Settings, History} from './Screens';
import { Router, Stack } from 'react-motion-router';
import { getPWADisplayMode, iOS } from './common/utils';
import './css/App.css';
import Toast from './Components/Toast';

const isPWA = getPWADisplayMode() === 'standalone';

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <div className="app dark-mode">
        <Toast />
        <Router config={{
          defaultRoute: '/',
          disableDiscovery: !isPWA,
          disableBrowserRouting: isPWA && iOS(),
          animation: {
            in: {
              type: 'fade',
              duration: 350
            }
          }
        }}>
          <Stack.Screen path={'/'} component={Home} />
          <Stack.Screen path={'/settings'} component={Settings} />
          <Stack.Screen path={'/history'} component={History} />
        </Router>
        
      </div>
    </ThemeProvider>
  );
}

export default App;
