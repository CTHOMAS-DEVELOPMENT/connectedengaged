import React, { useEffect, useRef, useState } from "react";

const LocalVideo = () => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("[LocalVideo] 🎬 Requesting media...");

    navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      .then((stream) => {
        console.log("[LocalVideo] ✅ Stream acquired:", stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          requestAnimationFrame(() => {
            videoRef.current.style.display = "none";
            void videoRef.current.offsetHeight;
            videoRef.current.style.display = "block";
          });

          videoRef.current.play()
            .then(() => console.log("[LocalVideo] 🎥 Video playing!"))
            .catch(err => console.warn("[LocalVideo] 🚫 Play error:", err));
        }
      })
      .catch((err) => {
        console.error("[LocalVideo] ❌ Failed to get media:", err);
        setError(err.message);
      });

  }, []);

  return (
    <div style={{ textAlign: "center" }}>
      <h3>Local Video Preview</h3>
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: 320,
          height: 240,
          backgroundColor: "black",
          border: "2px solid red",
          zIndex: 9999,
        }}
      />
    </div>
  );
};

export default LocalVideo;
