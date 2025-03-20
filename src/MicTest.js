import React, { useEffect, useState } from 'react';

const MicTest = () => {
  const [status, setStatus] = useState('🎙️ Requesting mic access...');

  useEffect(() => {
    const logPrefix = '[MicTest]';

    const handlePermissionsGranted = (event) => {
      console.log(`${logPrefix} 📥 Received message from WebView:`, event.data);
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'permissionsGranted') {
          console.log(`${logPrefix} ✅ permissionsGranted received inside WebView`);

          console.log(`${logPrefix} 🔍 Requesting getUserMedia({ audio: true })`);
          navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
              const audioTracks = stream.getAudioTracks();
              console.log(`${logPrefix} ✅ getUserMedia succeeded`);
              console.log(`${logPrefix} 🎧 Audio tracks:`, audioTracks);
              setStatus(`✅ Mic granted — ${audioTracks.length} track(s)`);
              stream.getTracks().forEach(track => track.stop());
            })
            .catch((err) => {
              console.error(`${logPrefix} ❌ getUserMedia failed:`, err.name, err.message);
              setStatus(`❌ Mic access failed: ${err.name} — ${err.message}`);
            });
        }
      } catch (err) {
        console.error(`${logPrefix} 🚨 Error parsing message:`, err);
      }
    };

    // Only needed inside WebView
    if (window.ReactNativeWebView) {
      console.log(`${logPrefix} 🚀 Running in React Native WebView`);
      window.addEventListener('message', handlePermissionsGranted);

      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'requestPermissions' })
      );
    } else {
      console.log(`${logPrefix} 🧪 Running in browser`);
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          const audioTracks = stream.getAudioTracks();
          console.log(`${logPrefix} ✅ getUserMedia succeeded`);
          console.log(`${logPrefix} 🎧 Audio tracks:`, audioTracks);
          setStatus(`✅ Mic granted — ${audioTracks.length} track(s)`);
          stream.getTracks().forEach(track => track.stop());
        })
        .catch((err) => {
          console.error(`${logPrefix} ❌ getUserMedia failed:`, err.name, err.message);
          setStatus(`❌ Mic access failed: ${err.name} — ${err.message}`);
        });
    }

    return () => {
      window.removeEventListener('message', handlePermissionsGranted);
    };
  }, []);

  return (
    <div className="test-container">
      <h3>🎧 Mic Access Test</h3>
      <p style={{ color: status.includes('✅') ? 'green' : 'red' }}>
        {status}
      </p>
    </div>
  );
};

export default MicTest;
