import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.the66challenge.app',
  appName: '66 Challenge',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // Use your deployed URL for live updates
    // url: 'https://66-challenge.vercel.app',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#f4f3ee',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#f4f3ee',
    },
  },
  ios: {
    contentInset: 'automatic',
    backgroundColor: '#f4f3ee',
  },
};

export default config;
