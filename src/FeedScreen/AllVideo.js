import React, { useEffect, useRef } from "react";

const AllVideo = ({ stream, label = "Video", muted = false, style = {} }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream && stream.active) {
      console.log(`[AllVideo] 🎥 Setting stream for ${label}, ID: ${stream.id}`);
      videoRef.current.srcObject = stream;

      requestAnimationFrame(() => {
        videoRef.current.style.display = "none";
        void videoRef.current.offsetHeight;
        videoRef.current.style.display = "block";
      });

      videoRef.current.play?.()
        .then(() => console.log(`[AllVideo] ✅ ${label} video playing!`))
        .catch(err => console.warn(`[AllVideo] 🚫 ${label} play failed:`, err));
    } else if (stream && !stream.active) {
      console.warn(`[AllVideo] ⚠️ ${label} stream is inactive`);
    }

    return () => {
      if (videoRef.current) {
        console.log(`[AllVideo] 🧹 Cleaning up ${label} video`);
        videoRef.current.srcObject = null;
      }
    };
  }, [stream, label]);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted={muted}
      playsInline
      style={{
        width: 320,
        height: 240,
        backgroundColor: "black",
        border: "2px solid lime",
        margin: 10,
        ...style
      }}
    />
  );
};

export default AllVideo;
