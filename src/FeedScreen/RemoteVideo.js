import React, { useEffect, useRef, useState } from "react";

const RemoteVideo = ({ stream }) => {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("⏳ Waiting for stream...");
  const [trackInfo, setTrackInfo] = useState("");

  useEffect(() => {
    if (videoRef.current && stream) {
      console.log("[RemoteVideo] 🎥 Attaching remote stream:", stream);

      const tracks = stream.getTracks();
      setTrackInfo(`Tracks: ${tracks.length} (${tracks.map(t => t.kind).join(", ")})`);

      videoRef.current.srcObject = stream;

      requestAnimationFrame(() => {
        videoRef.current.style.display = "none";
        void videoRef.current.offsetHeight;
        videoRef.current.style.display = "block";
      });

      videoRef.current.play?.()
        .then(() => {
          console.log("[RemoteVideo] ✅ Remote video playing!");
          setStatus("✅ Remote video playing!");
        })
        .catch(err => {
          console.warn("[RemoteVideo] 🚫 Play error:", err);
          setStatus("🚫 Failed to play remote video");
        });
    } else {
      setStatus("⏳ Waiting for remote stream...");
    }
  }, [stream]);

  return (
    <div style={{ textAlign: "center", border: "2px dashed gray", padding: 10 }}>
      <h4>Remote Video Debug</h4>
      <p>{status}</p>
      {trackInfo && <p>{trackInfo}</p>}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: 320,
          height: 240,
          backgroundColor: stream ? "black" : "#eee",
          border: stream ? "3px solid green" : "3px solid red",
          margin: 10,
        }}
      />
    </div>
  );
};

export default RemoteVideo;
