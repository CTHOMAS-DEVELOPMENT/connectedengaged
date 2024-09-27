import React, { useState } from "react";
import Resizer from "react-image-file-resizer";
import { Button } from "react-bootstrap";
import { Search } from "react-bootstrap-icons";
import translations from "./translations.json";
const ImageUploader = ({ userId, onUpload, selectedLanguage = "en" }) => {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // Resizer function
  const resizeFile = (file) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        300, // maxWidth
        300, // maxHeight (to maintain aspect ratio, you might adjust this or keep it the same as maxWidth)
        "JPEG", // compressFormat
        100, // quality
        0, // rotation
        (uri) => {
          resolve(uri);
        },
        "file" // Output as file blob
      );
    });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      console.error("No file selected");
      return;
    }

    try {
      // Resize file before uploading
      const resizedImage = await resizeFile(file);

      const formData = new FormData();
      formData.append("file", resizedImage); // 'file' is the key multer will look for

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/${userId}/profile-picture`,
        {
          method: "POST",
          body: formData, // Send formData, not JSON
          // Do not set Content-Type header, let the browser set it
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (onUpload) {
        onUpload(data.profile_picture);
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
    }
  };
  const pageTranslations = translations[selectedLanguage]?.imageUploader || {};

  return (
    <div className="image-uploader">
      <h2 className="font-style-4">
        {pageTranslations.title || "Upload a Picture for Your Profile"}
      </h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="custom-file-input">
          <input
            type="file"
            onChange={handleFileChange}
            style={{ display: "none" }}
            id="fileInput"
            className="file-input"
          />
         <Button
            onClick={() => document.getElementById("fileInput").click()} // Trigger file input
            className="custom-file-button"
          >
            <Search style={{ marginRight: "8px" }} /> {/* Search Icon */}
            {file ? file.name : pageTranslations.browseLabel || "Choose File"}
          </Button>
        </div>{" "}
        <button type="submit" className="submit-button">
          {pageTranslations.uploadButton || "Upload Image"}
        </button>
      </form>
    </div>
  );
};

export default ImageUploader;
