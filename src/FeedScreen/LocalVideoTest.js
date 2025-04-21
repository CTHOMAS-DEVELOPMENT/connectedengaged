import React, { useEffect, useRef, useState } from "react";

const LocalVideoTest = () => {
  const localVideoRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("[Test] 🔄 Running local video test");

    const startVideo = async () => {
      try {
        console.log("[Test] 🎤 Requesting media permissions...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        console.log("[Test] ✅ Stream acquired:", stream);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;

          console.log("[Test] 🎥 Setting srcObject");
          console.log("[Test] Element exists:", localVideoRef.current);
          console.log(
            "[Test] srcObject on element:",
            localVideoRef.current.srcObject
          );

          requestAnimationFrame(() => {
            localVideoRef.current.style.display = "none";
            void localVideoRef.current.offsetHeight;
            localVideoRef.current.style.display = "block";
          });

          const widthBefore = localVideoRef.current.videoWidth;
          const heightBefore = localVideoRef.current.videoHeight;
          console.log("[Test] ⏱ Dimensions before play:", widthBefore, heightBefore);

          await localVideoRef.current.play();

          console.log("[Test] 🎬 Local video playing!");
          setTimeout(() => {
            const width = localVideoRef.current.videoWidth;
            const height = localVideoRef.current.videoHeight;
            console.log("[Test] ⏱ Dimensions after play:", width, height);
          }, 1000);
        } else {
          console.warn("[Test] ⚠️ localVideoRef.current is null");
        }
      } catch (err) {
        console.error("[Test] ❌ Error getting media or playing video", err);
        setError(err.message);
      }
    };

    startVideo();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>🎥 Local Video Test</h2>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: 320,
          height: 240,
          backgroundColor: "black",
          border: "2px solid #ccc",
        }}
      />
    </div>
  );
};

export default LocalVideoTest;
