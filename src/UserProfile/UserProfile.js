import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import ProfileViewer from "./ProfileViewer";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { checkAuthorization } from "../system/authService";
import { convertToMediaPath } from "../system/utils";
import {
  version1Orientations,
  version1Gender,
  version1Hobbies,
  version1Keys,
} from "../RegistrationProfileCreation/scopedCollections";
import FloatsMyBoat from "../RegistrationProfileCreation/FloatsMyBoat.js";
import Gender from "../RegistrationProfileCreation/Gender.js";
import Orientation from "../RegistrationProfileCreation/Orientation.js";
import Hobbies from "../RegistrationProfileCreation/Hobbies.js";
import LocationDisplay from "../RegistrationProfileCreation/LocationDisplay.js"; // Import the LocationDisplay component
import translations from "./translations.json"; // Import translations

const UserProfile = () => {
  const { userId } = useParams();
  const location = useLocation();
  const state = location.state || {};
  const loggedInUserId = state.loggedInUserId;
  const languageCode = state.languageCode || "en"; // Retrieve the languageCode from navigation state, default to "en"
  const [authError, setAuthError] = useState(false);
  const [showVideo, setShowVideo] = useState(false); // State to manage video visibility
  const [selectedCarousel, setSelectedCarousel] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
  const [selectedOrientation, setSelectedOrientation] = useState(null);
  const [selectedHobby, setSelectedHobby] = useState(null);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const pageTranslations = translations[languageCode]?.userProfile || {};

  const getIndexOfValue = (arrayOf, value) => {
    return arrayOf.indexOf(value);
  };

  const handleNewInteraction = () => {
    navigate("/newsubmission", {
      state: { selectedUser: userId, userId: loggedInUserId },
    });
  };

  const centerWrapperStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: "20px",
  };

  const handleVideoDisplay = () => {
    setShowVideo(!showVideo); // Toggle video display and hide ProfileViewer
  };

  const handleBackToMessagesClick = () => {
    navigate("/userlist", { state: { userId: loggedInUserId } });
  };

  useEffect(() => {
    if (user) {
      setSelectedGender(getIndexOfValue(version1Gender, user.sex));
      setSelectedOrientation(
        getIndexOfValue(version1Orientations, user.sexual_orientation)
      );
      setSelectedHobby(getIndexOfValue(version1Hobbies, user.hobbies));
      setSelectedCarousel(getIndexOfValue(version1Keys, user.floats_my_boat));
    }
  }, [user]);

  useEffect(() => {
    if (loggedInUserId) {
      checkAuthorization(loggedInUserId).then((isAuthorized) => {
        if (!isAuthorized) {
          setAuthError(true);
        } else {
          fetchUserProfile();
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUserId, navigate]);

  const fetchUserProfile = () => {
    fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}`)
      .then((response) => response.json())
      .then((data) => {
        setUser(data);
      })
      .catch((error) => console.error("Error fetching user:", error));
  };

  if (authError) {
    return (
      <div>
        {pageTranslations.unauthorizedAccess || "Unauthorized access."}{" "}
        <a href="/">{pageTranslations.logIn || "log in"}</a>.
      </div>
    );
  }

  if (!user) {
    return <div>{pageTranslations.loading || "Loading..."}</div>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Button
        style={{ backgroundColor: "white" }}
        variant="outline-info"
        className="btn-sm back-button"
        onClick={handleBackToMessagesClick}
      >
        {pageTranslations.backToMessages || "Back to messages"}
      </Button>
      <div className="profile-container" style={{ textAlign: "center" }}>
        <h2 className="font-style-4">
          {pageTranslations.profileTitle
            ? pageTranslations.profileTitle.replace("{username}", user.username)
            : `${user.username}'s Profile`}
        </h2>
        {user.profile_video && (
          <Button
            variant="outline-info"
            className="btn-sm"
            onClick={handleVideoDisplay}
          >
            {showVideo
              ? pageTranslations.hideVideo || "Hide Video"
              : pageTranslations.showVideo || "Show Video"}
          </Button>
        )}
        {showVideo && user.profile_video && (
          <video
            src={convertToMediaPath(user.profile_video)}
            controls
            style={{ width: "100%", maxWidth: "500px" }}
          />
        )}
        {!showVideo && <ProfileViewer userId={userId} />}

        <p style={{ marginTop: "20px" }} className="font-style-4">
          {pageTranslations.preferredCompanySelection
            ? pageTranslations.preferredCompanySelection.replace(
                "{username}",
                user.username
              )
            : `${user.username}'s Preferred Company Selection`}
        </p>

        <Orientation
          onSelectOrientation={() => {}}
          selected={selectedOrientation}
        />
        <p className="font-style-4">
          {pageTranslations.favouriteHobbySelection.replace(
            "{username}",
            user.username
          ) || `${user.username}'s Favourite Hobby Selection`}
        </p>
        <Hobbies
          onSelectHobby={() => {}}
          selected={selectedHobby}
          selectedLanguage={languageCode}
          hobbies={pageTranslations.hobbies}
        />
        <p className="font-style-4">
          {pageTranslations.floatsMyBoatSelection.replace(
            "{username}",
            user.username
          ) || `${user.username}'s Floats Your Boat Selection`}
        </p>
        <FloatsMyBoat
          onSelectCarousel={() => {}}
          selectedCarousel={selectedCarousel}
        />
        <p className="font-style-4">
          {pageTranslations.mostLikeYouSelection.replace(
            "{username}",
            user.username
          ) || `${user.username}'s Most Like You Selection`}
        </p>
        <Gender onSelectGender={() => {}} selected={selectedGender} />
        <div style={centerWrapperStyle}>
          <p className="font-style-4">
            {pageTranslations.locationLabel.replace(
              "{username}",
              user.username
            ) || `${user.username}'s Location`}
          </p>
          <LocationDisplay worldX={user.worldx} worldY={user.worldy} />
        </div>
        <p className="font-style-4">
          {pageTranslations.aboutYouLabel.replace(
            "{username}",
            user.username
          ) || `${user.username}'s about you`}
        </p>
        <textarea readOnly className="about-you-textarea">
          {user.about_you
            ? user.about_you
            : pageTranslations.aboutYouPlaceholder
            ? pageTranslations.aboutYouPlaceholder.replace(
                "{username}",
                user.username
              )
            : `${user.username} has not entered anything yet.`}
        </textarea>
        <Button
          variant="outline-info"
          className="btn-sm"
          onClick={handleNewInteraction}
        >
          {pageTranslations.newSubmissionButton || "New Submission"}
        </Button>
      </div>
    </div>
  );
};

export default UserProfile;
