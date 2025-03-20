import React, { useEffect, useState } from "react";

const MicTest = () => {
  const [status, setStatus] = useState("🎤 Requesting mic access...");

  useEffect(() => {
    const handlePermissionsGranted = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "permissionsGranted") {
          console.log("[MicTest] 📩 permissionsGranted received from React Native");
          navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
              const audioTracks = stream.getAudioTracks();
              console.log("[MicTest] ✅ getUserMedia succeeded");
              console.log("[MicTest] 🎧 Audio tracks:", audioTracks);
              setStatus(`✅ Microphone access granted — ${audioTracks.length} track(s)`);
              stream.getTracks().forEach(track => track.stop()); // Stop it after test
              window.removeEventListener("message", handlePermissionsGranted);
            })
            .catch((err) => {
              console.error("[MicTest] ❌ getUserMedia failed:", err.name, err.message);
              setStatus(`❌ Mic access failed: ${err.name} — ${err.message}`);
            });
        }
      } catch (e) {
        console.error("[MicTest] Failed to parse message:", e);
      }
    };

    if (window.ReactNativeWebView) {
      console.log("[MicTest] 🚀 Running in React Native WebView");
      window.addEventListener("message", handlePermissionsGranted);
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: "requestPermissions" }));
    } else {
      console.log("[MicTest] 🌐 Running in browser");
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          const audioTracks = stream.getAudioTracks();
          console.log("[MicTest] ✅ Browser mic access OK —", audioTracks);
          setStatus(`✅ Microphone access granted — ${audioTracks.length} track(s)`);
          stream.getTracks().forEach(track => track.stop());
        })
        .catch((err) => {
          console.error("[MicTest] ❌ Browser mic access failed:", err);
          setStatus(`❌ Mic access failed: ${err.name} — ${err.message}`);
        });
    }

    return () => window.removeEventListener("message", handlePermissionsGranted);
  }, []);

  return (
    <div className="testing-container">
      <h2>🎧 Mic Access Test</h2>
      <p style={{ color: status.startsWith("✅") ? "green" : "red" }}>{status}</p>
    </div>
  );
};

export default MicTest;
