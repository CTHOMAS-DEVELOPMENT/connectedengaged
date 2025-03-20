import React, { useEffect, useRef, useState } from 'react';

const WebRTCVideoTest = () => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const constraints = { audio: true };

    console.log('[TEST] Requesting media with constraints:', constraints);

    navigator.mediaDevices.getUserMedia(constraints)
      .then((stream) => {
        console.log('[TEST] ✅ getUserMedia succeeded');
        console.log('[TEST] Tracks:', stream.getTracks());
        console.log('[TEST] Video:', stream.getVideoTracks());
        console.log('[TEST] Audio:', stream.getAudioTracks());

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error('[TEST] ❌ getUserMedia failed:', err.name, err.message);
        setError(`${err.name}: ${err.message}`);
      });
  }, []);

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h2>🎥 WebRTC Video Test</h2>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: '90%', maxWidth: 400, borderRadius: 10 }}
      />
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </div>
  );
};

export default WebRTCVideoTest;
