import React, { useEffect } from 'react';
import {ThemeProvider} from '@mui/material/styles';
import {darkTheme} from './Components';
import {Home, Settings, History} from './Screens';
import { AnimationConfig, Router, Stack } from 'react-motion-router';
import { iOS, isPWA } from './common/utils';
import './css/App.css';
import Toast from './Components/Toast';
import Alert from './Components/Alert';
import inAppInstall from './common/inappinstall';
import DownloadHistory from './common/downloadhistory';
import Badge from './assets/badge.png';
import localforage from 'localforage';
import { NotificationPreferences } from './Screens';
import { Download } from './common/downloadhistory';
import Downloader from './common/downloader';

let animation: AnimationConfig = {
  type: 'fade',
  duration: 350
};

if (iOS() && !isPWA) {
  animation = {
    type: 'none',
    duration: 0
  }
}

function App() {
  useEffect(() => {
    document.body.classList.remove('splash-screen-display');
    inAppInstall();

    async function onUpdate(_id: string, data: Partial<Download>) {
      const notificationPreferences = await preferencesForage.getItem<NotificationPreferences>("notifications");
      if (!notificationPreferences || !notificationPreferences.downloads_finish) return;
      if (document.hasFocus() || Downloader.instance.downloading) return;

      const unsaved = await unsavedForage.length();
      if (data.data) {
          // send notification
          new Notification("Downloads Finished", {
              badge: Badge,
              body: `You have ${unsaved} download${unsaved - 1 ? 's' : ''} finished and ready to be saved.`,
              icon: Badge,
              vibrate: [200, 200]
          });
      }
    }

    // notifications
    const preferencesForage = localforage.createInstance({
        name: process.env.REACT_APP_DB_NAME,
        storeName: 'preferences'
    });
    const unsavedForage = localforage.createInstance({
        name: process.env.REACT_APP_DB_NAME,
        storeName: 'unsaved'
    });
    DownloadHistory.instance.addUpdateListener(onUpdate);

    return () => {
      DownloadHistory.instance.removeUpdateListener(onUpdate);
    }
  }, []);

  
  return (
    <ThemeProvider theme={darkTheme}>
      <div className="app dark-mode">
        <Toast />
        <Alert />
        <Router config={{
          defaultRoute: '/',
          disableDiscovery: !isPWA,
          disableBrowserRouting: isPWA && iOS(),
          animation: animation
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
