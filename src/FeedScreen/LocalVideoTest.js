// LocalVideoTest.js
import React, { useEffect, useRef } from "react";

const LocalVideoTest = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    console.log("[Test] 🧪 Running local video test");
    console.log("[Test] ✍️ Requesting media permissions...");

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "user" }, // Force front camera
        audio: false,
      })
      .then((stream) => {
        console.log("[Test] ✅ Stream acquired:", stream);

        const video = videoRef.current;
        if (video) {
          console.log("[Test] 📽 Setting srcObject");
          video.srcObject = stream;

          console.log("[Test] 🧱 Element exists:", video.outerHTML);

          const [videoTrack] = stream.getVideoTracks();
          console.log("[Test] 🔎 Track settings:", videoTrack.getSettings());
          console.log("[Test] 🔇 Track muted?", videoTrack.muted);

          video.play()
            .then(() => {
              console.log("[Test] ✅ Local video playing!");
              setTimeout(() => {
                console.log(
                  "[Test] ⏱ Dimensions after play:",
                  video.videoWidth,
                  video.videoHeight
                );
              }, 500);
            })
            .catch((err) => {
              console.error("[Test] 🚫 play() failed:", err);
            });
        } else {
          console.warn("[Test] ⚠️ videoRef is null");
        }
      })
      .catch((err) => {
        console.error("[Test] ❌ Failed to acquire media:", err);
      });
  }, []);

  return (
    <div>
      <h2>Local Video Test</h2>
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: 320,
          height: 240,
          backgroundColor: "red",
          border: "2px solid lime",
          zIndex: 9999,
          position: "relative",
        }}
      />
    </div>
  );
};

export default LocalVideoTest;
