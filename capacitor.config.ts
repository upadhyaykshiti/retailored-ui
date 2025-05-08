import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.retailored.app',
  appName: 'reTailored',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    cleartext: true
  },
  plugins: {
    Camera: {
      photoSize: 'medium',
      saveToGallery: false,
      correctOrientation: true,
      resultType: 'dataUrl'
    },
    Toast: {
      duration: 2000,
      position: 'bottom'
    }
  }
};

export default config;