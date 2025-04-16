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
  
  export const requestPermissions = async () => {
    if (isReactNativeWebView()) {
      requestWebViewPermissions();
      await waitForWebViewPermissions();
    }
  
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      console.log("[✅] getUserMedia success:", stream);
      return stream;
    } catch (err) {
      console.error("[❌] getUserMedia error:", err.name, err.message);
      throw err; // rethrow so caller can handle
    }
  };
  
  

  