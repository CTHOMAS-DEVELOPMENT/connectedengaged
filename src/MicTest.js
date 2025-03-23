import React, { useEffect, useState } from 'react';

const MicTest = () => {
  const [status, setStatus] = useState('🎙️ Requesting mic access...');

  useEffect(() => {
    const logPrefix = '[MicTest]';
  
    let permissionTimeout = setTimeout(() => {
      setStatus('❌ Timeout: getUserMedia did not respond');
      console.warn(`${logPrefix} ⚠️ getUserMedia is hanging – no success or failure`);
    }, 5000); // 5 seconds max wait
  
    const handlePermissionsGranted = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'permissionsGranted') {
          console.log(`${logPrefix} ✅ permissionsGranted received inside WebView`);
  
          navigator.mediaDevices.getUserMedia({ audio: true, video: true })
            .then((stream) => {
              clearTimeout(permissionTimeout);
              const audioTracks = stream.getAudioTracks();
              const videoTracks = stream.getVideoTracks();
              console.log(`${logPrefix} ✅ getUserMedia succeeded`);
              setStatus(`✅ Mic + Cam granted — Audio: ${audioTracks.length}, Video: ${videoTracks.length}`);

              stream.getTracks().forEach((track) => track.stop());
            })
            .catch((err) => {
              clearTimeout(permissionTimeout);
              console.error(`${logPrefix} ❌ getUserMedia failed:`, err.name, err.message);
              setStatus(`❌ Mic access failed: ${err.name} — ${err.message}`);
            });
        }
      } catch (err) {
        console.error(`${logPrefix} Error parsing message:`, err);
      }
    };
  
    if (window.ReactNativeWebView) {
      console.log(`${logPrefix} 🚀 Running in React Native WebView`);
      window.addEventListener('message', handlePermissionsGranted);
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'requestPermissions' }));
    } else {
        navigator.mediaDevices.getUserMedia({ audio: true, video: true })
        .then((stream) => {
          clearTimeout(permissionTimeout);
          const audioTracks = stream.getAudioTracks();
          const videoTracks = stream.getVideoTracks();
          console.log(`${logPrefix} ✅ getUserMedia succeeded`);
          setStatus(`✅ Mic + Cam granted — Audio: ${audioTracks.length}, Video: ${videoTracks.length}`);

          stream.getTracks().forEach((track) => track.stop());
        })
        .catch((err) => {
          clearTimeout(permissionTimeout);
          console.error(`${logPrefix} ❌ getUserMedia failed:`, err.name, err.message);
          setStatus(`❌ Mic access failed: ${err.name} — ${err.message}`);
        });
    }
  
    return () => {
      clearTimeout(permissionTimeout);
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
