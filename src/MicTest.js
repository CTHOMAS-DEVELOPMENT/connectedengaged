import React, { useEffect, useRef, useState } from 'react';

const MicTest = () => {
  const [status, setStatus] = useState('🎙️ Requesting mic access...');
  const canvasRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationIdRef = useRef(null);

  useEffect(() => {
    const logPrefix = '[MicTest]';
    let permissionTimeout = setTimeout(() => {
      setStatus('❌ Timeout: getUserMedia did not respond');
    }, 5000);

    const handleMicStream = (stream) => {
      clearTimeout(permissionTimeout);
      setStatus('✅ Mic access granted');

      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);

      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      drawMicLevel();
    };

    const drawMicLevel = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        animationIdRef.current = requestAnimationFrame(draw);
        analyserRef.current.getByteFrequencyData(dataArray);

        const average = dataArray.reduce((sum, val) => sum + val, 0) / bufferLength;
        const normalized = average / 255;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0f0';
        ctx.fillRect(0, 0, canvas.width * normalized, canvas.height);
      };

      draw();
    };

    const startMicTest = () => {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(handleMicStream)
        .catch((err) => {
          clearTimeout(permissionTimeout);
          setStatus(`❌ Mic access failed: ${err.name}`);
          console.error(`${logPrefix} Error:`, err);
        });
    };

    if (window.ReactNativeWebView) {
      window.addEventListener('message', (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'permissionsGranted') {
            startMicTest();
          }
        } catch (err) {
          console.error(`${logPrefix} Invalid message:`, err);
        }
      });

      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'requestPermissions' }));
    } else {
      startMicTest();
    }

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <div style={{ padding: 20, backgroundColor: '#111', color: '#fff' }}>
      <h3>🎧 Mic Volume Level (Real)</h3>
      <p style={{ color: status.includes('✅') ? 'lime' : 'red' }}>{status}</p>
      <canvas
        ref={canvasRef}
        width={300}
        height={20}
        style={{
          backgroundColor: '#333',
          borderRadius: 8,
          marginTop: 10,
        }}
      />
    </div>
  );
};

export default MicTest;
