import React, { useState, useEffect } from "react";
import ImageUploader from "../RegistrationProfileCreation/imageUploader";
import LoadAVideo from "../Video/LoadAVideo";
import { convertToMediaPath } from "../system/utils";
import { Button, Modal } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import translations from "./translations.json";
const ViewImage = ({
  userId,
  profileVideo = "",
  profileImage = "",
  selectedLanguage = "en",
}) => {
  const [profilePicture, setProfilePicture] = useState("");
  const [showUploader, setShowUploader] = useState(false);
  const [showVideoUploader, setShowVideoUploader] = useState(false);
  const [videoPath, setVideoPath] = useState("");

  // Construct the full URL for profileImage and profileVideo using REACT_APP_BACKEND_URL
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    if (profileImage) {
      setProfilePicture(`${backendUrl}${profileImage}`);
    }
  }, [profileImage, backendUrl]);

  useEffect(() => {
    if (profileVideo) {
      setVideoPath(`${backendUrl}${profileVideo}`);
    }
  }, [profileVideo, backendUrl]);

  const handleProfileVideo = () => {
    setShowVideoUploader(!showVideoUploader);
  };

  const handleProfilePictureUpdate = () => {
    setShowUploader(true);
  };

  const handleCloseUploader = () => {
    setShowUploader(false);
  };

  const handleCloseVideoUploader = () => {
    setShowVideoUploader(false);
  };

  const handleUploadSuccess = (newProfilePicture) => {
    const fileName = newProfilePicture.split("\\").pop().split("/").pop();
    const updatedProfilePicture = `${
      process.env.REACT_APP_BACKEND_URL
    }/uploaded-images/${fileName}?timestamp=${new Date().getTime()}`;
    setProfilePicture(updatedProfilePicture);
    handleCloseUploader();
  };
  const handleVideoUploadSuccess = (data) => {
    setVideoPath(`${backendUrl}${convertToMediaPath(data.user.profile_video)}`);
    handleCloseVideoUploader();
  };
  const translationsForLang = translations[selectedLanguage]?.viewImage || {};
  return (
    <div className="profile-picture-container">
      {profilePicture ? (
        <div className="button-container">
          <img src={profilePicture} alt="Profile" />
          <Button
            style={{ backgroundColor: "white" }}
            variant="outline-info"
            className="btn-sm"
            onClick={handleProfilePictureUpdate}
          >
            {translationsForLang.updateProfileImage || "Update Profile Image"}
          </Button>
          <Button
            style={{ backgroundColor: "white" }}
            variant="outline-info"
            className="btn-sm"
            onClick={handleProfileVideo}
          >
            {videoPath
              ? translationsForLang.updateProfileVideo ||
                "Update Profile Video (Max 30 seconds)"
              : translationsForLang.addProfileVideo ||
                "Add Profile Video (Max 30 seconds)"}
          </Button>
        </div>
      ) : (
        <div className="button-container">
          <p>No profile picture</p>
          <Button
            style={{ backgroundColor: "white" }}
            variant="outline-info"
            className="btn-sm"
            onClick={handleProfilePictureUpdate}
          >
            {translationsForLang.addProfileImage || "Add a Profile Image"}
          </Button>
        </div>
      )}
      {videoPath && (
        <div>
          <video src={videoPath} controls style={{ width: "80%" }} />{" "}
          {/* Adjust width as necessary */}
        </div>
      )}
      <Modal show={showUploader} onHide={handleCloseUploader}>
        <Modal.Header closeButton>
          <Modal.Title>
            {translationsForLang.addUpdateProfileImage ||
              "Add/Update Profile Picture"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ImageUploader userId={userId} onUpload={handleUploadSuccess} selectedLanguage={selectedLanguage}/>
        </Modal.Body>
      </Modal>
      <Modal show={showVideoUploader} onHide={handleCloseVideoUploader}>
        <Modal.Header closeButton>
          <Modal.Title className="font-style-4">
            {videoPath
              ? translationsForLang.updateProfileVideo || "Update Profile Video"
              : translationsForLang.addProfileVideo || "Add Profile Video"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <LoadAVideo userId={userId} onUpload={handleVideoUploadSuccess} selectedLanguage={ selectedLanguage }/>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ViewImage;
