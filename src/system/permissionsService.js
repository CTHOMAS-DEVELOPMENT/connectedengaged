// permissionsService.js

export const isReactNativeWebView = () => {
    return typeof window !== 'undefined' && !!window.ReactNativeWebView;
  };
  
  export const requestWebViewPermissions = () => {
    if (isReactNativeWebView()) {
      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'requestPermissions' })
      );
    }
  };
  
  export const waitForWebViewPermissions = () => {
    return new Promise((resolve) => {
      const handler = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'permissionsGranted') {
            window.removeEventListener('message', handler);
            resolve(true);
          }
        } catch (e) {
          console.warn('[permissionsService] Failed to parse message:', e);
        }
      };
  
      window.addEventListener('message', handler);
    });
  };
  
  navigator.mediaDevices.getUserMedia({ video: true, audio: true })
  .then((stream) => {
    console.log("[✅] getUserMedia success:", stream);
    return stream;
  })
  .catch((err) => {
    console.error("[❌] getUserMedia error in Chrome:", err.name, err.message);
  });

  