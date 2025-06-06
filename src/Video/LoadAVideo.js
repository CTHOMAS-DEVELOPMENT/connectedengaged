import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { Search } from "react-bootstrap-icons";
import translations from "./translations.json"; // Assuming you have translations for video uploader as well

const LoadAVideo = ({ userId, onUpload, selectedLanguage = "en" }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videoError, setVideoError] = useState("");
  const [videoDuration, setVideoDuration] = useState(0);

  const pageTranslations = translations[selectedLanguage]?.videoUploader || {};

  const handleVideoChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.match("video.*")) {
        const video = document.createElement("video");
        video.preload = "metadata";

        video.onloadedmetadata = function () {
          window.URL.revokeObjectURL(video.src);
          setVideoDuration(video.duration);

          if (video.duration > 60) {
            setVideoError(
              pageTranslations.durationError ||
                "Video is longer than 60 seconds."
            );
            setSelectedVideo(null);
          } else {
            setVideoError("");
            setSelectedVideo(file);
          }
        };

        video.src = URL.createObjectURL(file);
      } else {
        setVideoError(
          pageTranslations.invalidFileError ||
            "Please select a valid video file."
        );
        setSelectedVideo(null);
      }
    }
  };

  const handleVideoUpload = async () => {
    if (selectedVideo) {
      const formData = new FormData();
      formData.append("profileVideo", selectedVideo);

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/users/${userId}/upload-profile-video`,
          {
            method: "POST",
            body: formData,
          }
        );
        if (response.ok) {
          const data = await response.json();
          onUpload(data); // Trigger the onUpload callback with the response
        } else {
          setVideoError(
            pageTranslations.uploadError ||
              "Failed to upload video. Please try again."
          );
        }
      } catch (error) {
        console.error("Error uploading video:", error);
        setVideoError(
          pageTranslations.networkError ||
            "An error occurred while uploading the video."
        );
      }
    }
  };

  return (
    <div
      className="video-uploader"
      role="region"
      aria-labelledby="uploadVideoTitle"
    >
      <h2 id="uploadVideoTitle" className="font-style-4">
        {pageTranslations.title || "Upload a Profile Video"}
      </h2>

      <form
        className="upload-form"
        onSubmit={(e) => e.preventDefault()}
        aria-describedby="videoUploadInstructions"
      >
        <p id="videoUploadInstructions" className="font-style-4">
          {pageTranslations.instructions ||
            "Choose a video file (Max 30 seconds) to upload as your profile video."}
        </p>
        <div className="custom-file-input">
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoChange}
            style={{ display: "none" }}
            id="videoInput"
            className="file-input"
            aria-labelledby="chooseVideoButton"
          />

          <Button
            onClick={() => document.getElementById("videoInput").click()} // Trigger file input
            className="custom-file-button"
            id="chooseVideoButton"
            aria-label={
              selectedVideo
                ? selectedVideo.name
                : pageTranslations.browseLabel || "Choose Video"
            }
          >
            <Search style={{ marginRight: "8px" }} aria-hidden="true" />{" "}
            {/* Search Icon */}
            {selectedVideo
              ? selectedVideo.name
              : pageTranslations.browseLabel || "Choose Video"}
          </Button>
        </div>

        {videoError && <p className="error">{videoError}</p>}
        {selectedVideo && (
          <>
            <div className="video-preview" aria-label="Video preview">
              {" "}
              <video
                src={URL.createObjectURL(selectedVideo)}
                controls
                style={{ width: "100%", marginTop: "15px" }}
                aria-describedby="videoDuration"
              />
              
              <p id="videoDuration">
                {pageTranslations.durationLabel || "Duration"}:{" "}
                {Math.floor(videoDuration)}{" "}
                {pageTranslations.seconds || "seconds"}
              </p>
            </div>
            <Button
              type="button"
              onClick={handleVideoUpload}
              className="submit-button"
              style={{ marginTop: "15px" }}
              aria-label={pageTranslations.uploadButton || "Upload Video"}
            >
              {pageTranslations.uploadButton || "Upload Video"}
            </Button>
          </>
        )}
      </form>
    </div>
  );
};

export default LoadAVideo;
