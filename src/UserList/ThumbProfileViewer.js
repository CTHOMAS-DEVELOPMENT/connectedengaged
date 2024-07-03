import React, { useState, useEffect } from "react";
import {getThumbnailPath} from "../system/utils"

import "bootstrap/dist/css/bootstrap.min.css";

const ProfileViewer = ({ userId }) => {
  const [profilePicture, setProfilePicture] = useState(null);
  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}/profile-picture`);
        
        if (!response.ok) throw new Error("Failed to fetch profile picture");
        const data = await response.json();
        const thumbImage = getThumbnailPath(data.profilePicture);
        setProfilePicture(thumbImage);
      } catch (error) {
        console.error("Error fetching profile picture:", error);
      }
    };

    fetchProfilePicture();
  }, [userId]);


  return (
    <div className="profile-picture-container">
      {profilePicture ? (
        <img src={`${process.env.REACT_APP_BACKEND_URL?process.env.REACT_APP_BACKEND_URL:""}${profilePicture}`} alt="Profile" />
      ) : (
        <span>No image</span>
      )}
    </div>
  );
};

export default ProfileViewer;
