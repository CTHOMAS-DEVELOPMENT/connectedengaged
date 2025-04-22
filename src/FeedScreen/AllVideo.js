import React, { useEffect, useRef } from "react";

const AllVideo = ({ stream, label = "Video", muted = false, style = {} }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const attachStream = () => {
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
      }
    };
  
    attachStream();
  }, [stream, label]);  // ✅ Correct dependencies
  

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
