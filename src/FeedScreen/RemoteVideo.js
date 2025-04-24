import React, { useEffect, useRef, useState } from "react";

const RemoteVideo = ({ stream }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      console.log("[RemoteVideo] 🎥 Attaching remote stream:", stream);

      videoRef.current.srcObject = stream;

      requestAnimationFrame(() => {
        videoRef.current.style.display = "none";
        void videoRef.current.offsetHeight;  // Force reflow
        videoRef.current.style.display = "block";
      });

      videoRef.current.play?.()
        .then(() => console.log("[RemoteVideo] ✅ Remote video playing!"))
        .catch(err => {
          console.warn("[RemoteVideo] 🚫 Play error:", err);
          setError("Failed to play remote video");
        });
    }
  }, [stream]);

  return (
    <div style={{ textAlign: "center" }}>
      <h4>Remote Video</h4>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: 320,
          height: 240,
          backgroundColor: "black",
          border: "2px solid blue",
          margin: 10,
        }}
      />
    </div>
  );
};

export default RemoteVideo;
