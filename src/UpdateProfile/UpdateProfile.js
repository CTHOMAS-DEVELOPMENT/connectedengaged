import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AlertMessage from "../system/AlertMessage";
import validateUser from "../system/userValidation.js";
import ViewImage from "./ViewImage.js";
import FloatsMyBoat from "../RegistrationProfileCreation/FloatsMyBoat.js";
import Gender from "../RegistrationProfileCreation/Gender.js";
import Orientation from "../RegistrationProfileCreation/Orientation.js";
import Hobbies from "../RegistrationProfileCreation/Hobbies.js";
import Location from "../RegistrationProfileCreation/Location.js";
import {
  version1Orientations,
  version1Gender,
  version1Hobbies,
  version1Keys,
} from "../RegistrationProfileCreation/scopedCollections.js";
import { Button, Dropdown } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { checkAuthorization } from "../system/authService"; // Ensure this path matches your file structure
import { convertToMediaPath } from "../system/utils";
import botPalOptions from "../RegistrationProfileCreation/botPalOptions.json";
import translations from "./translations.json";
const languageMap = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ar: "العربية", // Arabic
  zh: "中文", // Chinese
};
const UpdateProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state?.userId;
  const [authError, setAuthError] = useState(false);
  const [profileVideo, setProfileVideo] = useState();
  const [profileImage, setProfileImage] = useState();
  const [showFloatsMyBoat, setShowFloatsMyBoat] = useState(false);
  const [selectedCarousel, setSelectedCarousel] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
  const [selectedOrientation, setSelectedOrientation] = useState(null);
  const [showGender, setShowGender] = useState(false);
  const [showOrientation, setShowOrientation] = useState(false);
  const [selectedHobby, setSelectedHobby] = useState(null);
  const [showHobbies, setShowHobbies] = useState(false);
  const [showLocation, setShowLocation] = useState(false); // Manage visibility
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    hobby: "",
    sexualOrientation: "",
    floatsMyBoat: "",
    sex: "",
    aboutYou: "",
    aboutMyBotPal: "",
    admin_face: "",
    worldX: 0, // Add worldX here
    worldY: 0, // Add worldY here
  });

  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [alertKey, setAlertKey] = useState(0);
  const [selectedBotPalOption, setSelectedBotPalOption] = useState(null); // Track the selected botPal option
  const fixedBottomStyle = {
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    backgroundColor: "white",
    padding: "10px",
    boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
    zIndex: 1000, // Ensures it stays on top of other elements
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  };
  const centerWrapperStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  };
  const handleSelectCoordinates = (selectedCoordinates) => {
    // Update formData with the new coordinates
    setFormData((prevFormData) => ({
      ...prevFormData,
      worldX: selectedCoordinates.x,
      worldY: selectedCoordinates.y,
    }));

  };
  const getStaticAdminImagePath = (adminFacePath) => {
    if (!adminFacePath) {
      return ""; // Return an empty string or a default image path if the value is null or undefined
    }
    const relativePath = `/admins/${adminFacePath.split("/").pop()}`;
    return relativePath;
  };

  const adminFace = (gender, orientation) => {
    if (orientation === "Heterosexual") {
      return gender === "Female" ? "Man" : "Woman";
    } else if (orientation === "Lesbian") {
      return "Woman";
    } else if (orientation === "Homosexual") {
      return gender === "Female" ? "Woman" : "Man";
    }
    return "Man"; // Default fallback
  };
  const getAdminFaceImagePath = (index) => {
    const selectedOption = botPalOptions.options[index];
    const face = adminFace(
      version1Gender[selectedGender],
      version1Orientations[selectedOrientation]
    );
    return `/admins/${selectedOption.botImage}${face}.png`;
  };

  const handleRadioChange = (event) => {
    const index = parseInt(event.target.value);
    setSelectedBotPalOption(index);

    setFormData((prevFormData) => ({
      ...prevFormData,
      aboutMyBotPal: botPalOptions.options[index].value,
      admin_face: getAdminFaceImagePath(index),
    }));
  };
  const handleLanguageChange = (eventKey) => {
    setSelectedLanguage(eventKey);
    // Save the language preference (if needed) by making an API call
  };
  useEffect(() => {
    if (userId) {
      checkAuthorization(userId).then((isAuthorized) => {
        if (!isAuthorized) {
          setAuthError(true);
          // Optionally, you could navigate to a login page instead of setting an error
          // navigate("/login");
        } else {
          // If authorized, proceed to fetch user data
          fetchUserData();
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, navigate]);
  useEffect(() => {
    if (formData.sex) {
      const index = version1Gender.indexOf(formData.sex);
      setSelectedGender(index);
    }
  }, [formData.sex]);
  useEffect(() => {
    if (formData.floatsMyBoat) {
      const index = version1Keys.indexOf(formData.floatsMyBoat);
      setSelectedCarousel(index);
    }
  }, [formData.floatsMyBoat]);

  useEffect(() => {
    if (formData.sexualOrientation) {
      const index = version1Orientations.indexOf(formData.sexualOrientation);
      setSelectedOrientation(index);
    }
  }, [formData.sexualOrientation]);
  useEffect(() => {
    if (formData.hobby) {
      const index = version1Hobbies.indexOf(formData.hobby);
      setSelectedHobby(index);
    }
  }, [formData.hobby]);
  useEffect(() => {
    const selectedOptionIndex = botPalOptions.options.findIndex(
      (option) => option.value === formData.aboutMyBotPal
    );
    setSelectedBotPalOption(
      selectedOptionIndex !== -1 ? selectedOptionIndex : null
    );
  }, [formData.aboutMyBotPal]);

  const fetchUserData = () => {
    fetch(`${process.env.REACT_APP_API_URL}/api/users/${userId}`)
      .then((response) => response.json())
      .then((user) => {
        setFormData({
          username: user.username || "",
          email: user.email || "",
          password: "", // Do not fetch password for security reasons
          hobby: user.hobbies || "",
          sexualOrientation: user.sexual_orientation || "",
          floatsMyBoat: user.floats_my_boat || "",
          sex: user.sex || "",
          aboutYou: user.about_you || "",
          aboutMyBotPal: user.about_my_bot_pal || "",
          admin_face: getStaticAdminImagePath(user.admin_face) || "",
          worldX: user.worldx || 0, // Update
          worldY: user.worldy || 0, // Update
        });
        setSelectedLanguage(user.language_code || "en");
        // Add this block to set selectedBotPalOption
        const selectedOptionIndex = botPalOptions.options.findIndex(
          (option) => option.value === user.about_my_bot_pal
        );
        setSelectedBotPalOption(
          selectedOptionIndex !== -1 ? selectedOptionIndex : null
        );

        // Other profile image/video logic
        if (user.profile_video) {
          setProfileVideo(convertToMediaPath(user.profile_video));
        }
        if (user.profile_picture) {
          setProfileImage(convertToMediaPath(user.profile_picture));
        }
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
        setMessage("Failed to load user data");
        setType("error");
        setAlertKey((prevKey) => prevKey + 1);
      });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    const validationErrors = validateUser({ ...formData, [name]: value });
    if (validationErrors[name]) {
      setMessage(validationErrors[name]);
      setType("error");
      setAlertKey((prevKey) => prevKey + 1);
    }
  };
  const handleGenderSelection = (index) => {
    setSelectedGender(index);
    setFormData((prev) => ({
      ...prev,
      sex: version1Gender[index], // Update the sex in formData based on selected index
    }));
  };
  const handleOrientationSelection = (index) => {
    setSelectedOrientation(index);
    setFormData((prev) => ({
      ...prev,
      sexualOrientation: version1Orientations[index],
    }));
  };
  const handleHobbySelection = (index) => {
    setSelectedHobby(index);
    setFormData((prevFormData) => ({
      ...prevFormData,
      hobby: version1Hobbies[index] || "", // Make sure version1Hobbies is accessible here
    }));
  };
  const handleCarouselSelection = (index) => {
    setSelectedCarousel(index);

    setFormData((prevFormData) => ({
      ...prevFormData,
      floatsMyBoat: version1Keys[index],
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
  
    // Reset message and type for re-rendering
    setMessage("");
    setType("info");
    setAlertKey((prevKey) => prevKey + 1);
  
    // Validate the form data (you can customize this validation logic if needed)
    const validationErrors = validateUser(formData, true);
    if (Object.keys(validationErrors).length === 0) {
      // Include selectedLanguage in the payload sent to the backend
      const payload = {
        ...formData,
        language_code: selectedLanguage, // Pass the selected language
      };
  
      // Send the updated form data including language_code to the backend
      fetch(`${process.env.REACT_APP_API_URL}/api/update_profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), // Send the form data including the selected language
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Profile update failed");
          }
          return response.json();
        })
        .then((data) => {
          setMessage("Profile updated successfully");
          setType("success");
          setAlertKey((prevKey) => prevKey + 1);
        })
        .catch((error) => {
          console.error("Update profile error:", error);
          setMessage("Profile update failed: " + error.message);
          setType("error");
          setAlertKey((prevKey) => prevKey + 1);
        });
    } else {
      const firstErrorKey = Object.keys(validationErrors)[0];
      setTimeout(() => {
        setMessage(validationErrors[firstErrorKey]);
        setType("error");
        setAlertKey((prevKey) => prevKey + 1);
      }, 0);
    }
  };
  

  if (authError) {
    return <div>Unauthorized. Please log in.</div>;
  }
  const pageTranslations = translations[selectedLanguage]?.updateProfile || {};
console.log("pageTranslations",pageTranslations)
  return (
    <div>
      <Button
        style={{ backgroundColor: "white" }}
        variant="outline-info"
        className="btn-sm"
        onClick={() => navigate("/userlist", { state: { userId } })}
      >
        {pageTranslations.backToMessages || "Back to messages"}
      </Button>
      <div style={centerWrapperStyle}>
        <h2 className="font-style-4">
          {pageTranslations.title || "Update Profile"}
        </h2>
        <div style={{ textAlign: "center", margin: "20px" }}>
          <Dropdown onSelect={handleLanguageChange}>
            <Dropdown.Toggle
              variant="primary"
              id="language-dropdown"
              className={`font-style-4`}
            >
              {languageMap[selectedLanguage]}{" "}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item eventKey="en" className="font-style-4" lang="en">
                English
              </Dropdown.Item>
              <Dropdown.Item eventKey="es" className="font-style-4" lang="es">
                Español
              </Dropdown.Item>
              <Dropdown.Item eventKey="fr" className="font-style-4" lang="fr">
                Français
              </Dropdown.Item>
              <Dropdown.Item eventKey="de" className="font-style-4" lang="de">
                Deutsch
              </Dropdown.Item>
              <Dropdown.Item eventKey="ar" className="font-style-4" lang="ar">
                العربية
              </Dropdown.Item>
              <Dropdown.Item eventKey="zh" className="font-style-4" lang="zh">
                中文
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div className="button-group">
          <ViewImage
            userId={userId}
            profileVideo={profileVideo}
            profileImage={profileImage}
            selectedLanguage={selectedLanguage}
          />
        </div>
      </div>
      <form noValidate onSubmit={handleSubmit}>
        <div className="system-form">
          <div style={fixedBottomStyle}>
            <Button
              style={{ backgroundColor: "white" }}
              variant="outline-info"
              className="btn-sm"
              type="submit"
            >
              {pageTranslations.submitButton || "Update Profile"}
            </Button>
            {message && (
              <AlertMessage key={alertKey} message={message} type={type} />
            )}
          </div>
          <div>
            <label htmlFor="username">
              {pageTranslations.usernameLabel || "Username"}
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
            />
          </div>
          <div>
            <label htmlFor="email">
              {pageTranslations.emailLabel || "Email"}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
            />
          </div>
          <div>
            <label htmlFor="password">
              {pageTranslations.passwordLabel ||
                "Password (leave blank to keep the same)"}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>

          <div className="rounded-rectangle-wrapper">
            <h3 className="font-style-4">
              {pageTranslations.aboutYouLabel || "About You Survey"}
            </h3>
            <div>
              <div>
                <Button
                  variant="outline-info"
                  className="btn-sm"
                  onClick={() => setShowGender(!showGender)}
                >
                  {showGender
                    ? pageTranslations.genderToggle?.hide ||
                      "Hide Most Like You"
                    : pageTranslations.genderToggle?.show ||
                      "Show Most Like You Selection"}
                </Button>
              </div>

              {showGender && (
                <Gender
                  onSelectGender={handleGenderSelection}
                  selected={selectedGender}
                />
              )}
            </div>
            <div>
              <Button
                variant="outline-info"
                className="btn-sm"
                onClick={() => setShowHobbies(!showHobbies)}
              >
                {showHobbies
                  ? pageTranslations.hobbiesToggle?.hide ||
                    "Hide Your Favourite Hobby"
                  : pageTranslations.hobbiesToggle?.show ||
                    "Show Your Favourite Hobby Selection"}
              </Button>
            </div>
            {showHobbies && (
              <Hobbies
                onSelectHobby={handleHobbySelection}
                selected={selectedHobby}
                selectedLanguage={selectedLanguage}
                hobbies={pageTranslations.hobbies} 
              />
            )}
            <div>
              <div>
                <Button
                  variant="outline-info"
                  className="btn-sm"
                  onClick={() => setShowOrientation(!showOrientation)}
                >
                  {showOrientation
                    ? pageTranslations.orientationToggle?.hide ||
                      "Hide Your Preferred Company"
                    : pageTranslations.orientationToggle?.show ||
                      "Show Your Preferred Company Selection"}
                </Button>
              </div>
              {showOrientation && (
                <Orientation
                  onSelectOrientation={handleOrientationSelection}
                  selected={selectedOrientation}
                />
              )}
            </div>
            <div>
              <Button
                variant="outline-info"
                className="btn-sm"
                onClick={() => setShowFloatsMyBoat(!showFloatsMyBoat)}
              >
                {showFloatsMyBoat
                  ? pageTranslations.floatsMyBoatToggle?.hide ||
                    "Hide Floats Your Boat"
                  : pageTranslations.floatsMyBoatToggle?.show ||
                    "Show Floats Your Boat Selection"}
              </Button>
            </div>

            {showFloatsMyBoat && (
              <FloatsMyBoat
                onSelectCarousel={handleCarouselSelection}
                selectedCarousel={selectedCarousel}
              />
            )}
            <div>
              <Button
                variant="outline-info"
                className="btn-sm"
                onClick={() => setShowLocation(true)} // Open the Location component
              >
                {pageTranslations.locationButton || "Show Location"}
              </Button>
            </div>
            <div>
              <h3 className="font-style-4">
                {pageTranslations.aboutYouLabel || "About You"}
              </h3>
              <textarea
                id="aboutYou"
                name="aboutYou"
                className="about-you-textarea"
                value={formData.aboutYou}
                placeholder={
                  pageTranslations.aboutYouTextArea ||
                  "I am looking for a long term relationship. Look out for my Connection Request from the Communication Centre."
                }
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                style={{ width: "100%", height: "100px" }} // Adjust styling as needed
              />
            </div>

            {showLocation && (
              <Location
                onClose={() => setShowLocation(false)}
                onSelectCoordinates={handleSelectCoordinates}
                initialCoordinates={{ x: formData.worldX, y: formData.worldY }} // Pass initial coordinates
              />
            )}

            <div>
              <h3 className="font-style-4">
                {pageTranslations.aboutAdminLabel || "About Your System Admin"}
              </h3>
              {formData.admin_face && (
                <img
                  src={formData.admin_face}
                  alt={pageTranslations.adminFaceAlt || "Admin Face"}
                />
              )}
              {!formData.admin_face && (
                <img src={"/admins/thumb-file-admin.JPEG"} alt="Admin Face" />
              )}

{(
    translations[selectedLanguage]?.updateProfile?.adminLabels || 
    botPalOptions.options.map(option => option.label)
  ).map((label, index) => (
    <div
      key={index}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </div>
        <input
          type="radio"
          id={`botPalOption${index}`}
          name="aboutMyBotPal"
          value={index}
          checked={selectedBotPalOption === index}
          onChange={handleRadioChange}
          style={{
            marginBottom: "0",
          }}
        />
      </div>
    </div>
  ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default UpdateProfile;
