import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom"; // New import
import { getPageName } from "../system/utils.js"; // New import
import ImageUploader from "./imageUploader";
import FloatsMyBoat from "./FloatsMyBoat";
import Orientation from "./Orientation"; // Make sure to import the Orientation component
import Gender from "./Gender.js"; // Make sure to import the Orientation component
import Hobbies from "./Hobbies.js";
import {
  version1Orientations,
  version1Gender,
  version1Hobbies,
  version1Keys,
} from "./scopedCollections.js";
import Location from "./Location";
import { convertToMediaPath } from "../system/utils";
import AlertMessage from "../system/AlertMessage";
import validateUser from "../system/userValidation.js";
import { Button, Dropdown } from "react-bootstrap"; // Import Dropdown from react-bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import { Eye, EyeSlash, CheckCircle, XCircle } from "react-bootstrap-icons";
import botPalOptions from "./botPalOptions.json"; // Import the JSON file
import translations from "./translations.json";
import Cookies from "js-cookie";

const RegistrationForm = () => {
  // Initialize selectedLanguage first
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return Cookies.get("preferredLanguage") || "en"; // Default to 'en' if no cookie is set
  });
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [alertKey, setAlertKey] = useState(0);
  const [dummyEmail, setDummyEmail] = useState("");
  const [showFloatsMyBoat, setShowFloatsMyBoat] = useState(false);
  const [selectedCarousel, setSelectedCarousel] = useState(null);
  const [showOrientation, setShowOrientation] = useState(false);
  const [selectedOrientation, setSelectedOrientation] = useState(null);
  const [showGender, setShowGender] = useState(false);
  const [selectedGender, setSelectedGender] = useState(null);
  const [showHobbies, setShowHobbies] = useState(false);
  const [selectedHobby, setSelectedHobby] = useState(null);
  const [selectedBotPalOption, setSelectedBotPalOption] = useState(1); // Default to the second option "Warm and friendly"
  const [locationSelected, setLocationSelected] = useState(false); // Assume location is false for now
  const [showLocation, setShowLocation] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Initialize formData state
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    hobby: "",
    sexualOrientation: "",
    floatsMyBoat: "",
    sex: "",
    aboutYou: "",
    aboutMyBotPal: botPalOptions.options[1].value,
    worldX: 0,
    worldY: 0,
    language_code: selectedLanguage, // Use selectedLanguage in formData
  });

  const navigate = useNavigate();
  const location = useLocation(); // Get the location object
  const currentPage = getPageName(location); // Use the utility function to get the current page name

  const pageTranslations = translations[selectedLanguage]?.[currentPage] || {}; // Get the translation for the current page
  const translatedAdminLabels =
    pageTranslations.adminLabels ||
    botPalOptions.options.map((option) => option.label); // fallback to default labels

  // console.log("currentPage", currentPage);
  // console.log("selectedLanguage", selectedLanguage);
  // console.log("translations", translations);
  // console.log("pageTranslations", pageTranslations);
  const languageMap = {
    en: "English",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
    ar: "العربية", // Arabic
    zh: "中文", // Chinese
  };
  const handleOpenLocation = () => {
    setShowLocation(true);
  };
  const handleLanguageChange = (languageCode) => {
    setSelectedLanguage(languageCode); // Update the selected language
    setFormData((prevFormData) => ({
      ...prevFormData,
      language_code: languageCode, // Update the language_code in formData
    }));
    Cookies.set("preferredLanguage", languageCode, { expires: 365 }); // Store the language preference in cookies
  };

  const handleSelectCoordinates = (selectedCoordinates) => {
    setLocationSelected(true);
    // Update formData with the new coordinates
    setFormData((prevFormData) => ({
      ...prevFormData,
      worldX: selectedCoordinates.x,
      worldY: selectedCoordinates.y,
    }));
  };

  const hiddenTextareaStyle = {
    display: "none",
  };

  const handleLoginScreenClick = () => {
    if (userId) {
      navigate("/", { state: { username: formData.username } });
    } else {
      navigate("/"); // Update for v6
    }
  };
  const getAdminFaceName = () => {
    const selectedOption = botPalOptions.options[selectedBotPalOption];
    const face = adminFace(
      version1Gender[selectedGender],
      version1Orientations[selectedOrientation]
    );
    return `/admins/${selectedOption.botImage}${face}.png`; // Use the static path for saving to the database
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
  const getAdminImagePath = () => {
    const selectedOption = botPalOptions.options[selectedBotPalOption];
    const face = adminFace(
      version1Gender[selectedGender],
      version1Orientations[selectedOrientation]
    );
    const imagePath = `/admins/${selectedOption.botImage}${face}.png`; // Use the static path from the public directory

    return imagePath;
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "dummyEmail") {
      setDummyEmail(value); // Update the dummyEmail state
    } else {
      setFormData((prevFormData) => ({
        ...prevFormData,

        [name]: value,
      }));
    }
  };
  const handleRadioChange = (event) => {
    const index = parseInt(event.target.value);
    setSelectedBotPalOption(index);
    setFormData((prevFormData) => ({
      ...prevFormData,
      aboutMyBotPal: botPalOptions.options[index].value,
    }));
  };

  const handleImageUpload = (url) => {
    setUploadedImageUrl(url);
  };

  const handleBlur = (event) => {
    const { name, value } = event.target;
    const validationErrors = validateUser({ ...formData, [name]: value });

    if (name === "dummyEmail" && value !== formData.email) {
      validationErrors["dummyEmail"] = pageTranslations.emailsDoNotMatch || "Emails do not match";
    }

    if (validationErrors[name]) {
      setMessage(validationErrors[name]);
      setType("error");
      setAlertKey((prevKey) => prevKey + 1);
    } else {
      setMessage("");
      setType("info");
      setAlertKey((prevKey) => prevKey + 1);
    }
  };

  const handleCarouselSelection = (index) => {
    setSelectedCarousel(index);

    setFormData((prevFormData) => ({
      ...prevFormData,
      floatsMyBoat: version1Keys[index],
    }));
  };
  const handleOrientationSelection = (index) => {
    setSelectedOrientation(index);
    setFormData((prevFormData) => ({
      ...prevFormData,
      sexualOrientation: version1Orientations[index],
    }));
  };
  const handleGenderSelection = (index) => {
    setSelectedGender(index);
    setFormData((prevFormData) => ({
      ...prevFormData,
      sex: version1Gender[index],
    }));
  };
  const handleHobbySelection = (index) => {
    setSelectedHobby(index);
    setFormData((prevFormData) => ({
      ...prevFormData,
      hobby: version1Hobbies[index] || "",
    }));
  };
  const handleSubmit = (event) => {
    event.preventDefault();

    // Perform validation using the selected language
    const validationErrors = validateUser(formData, false, selectedLanguage);

    if (Object.keys(validationErrors).length > 0) {
      // Display the first validation error
      const firstErrorKey = Object.keys(validationErrors)[0];
      setMessage(validationErrors[firstErrorKey]);
      setType("error");
      setAlertKey((prevKey) => prevKey + 1);
      return;
    }

    if (dummyEmail !== formData.email) {
      setMessage(pageTranslations.emailsDoNotMatch || "Emails do not match");
      setType("error");
      setAlertKey((prevKey) => prevKey + 1);
      return; // Stop form submission if emails don't match
    }

    // Log the data that will be sent to the backend
    // console.log("Form data being sent to the backend:", {
    //   ...formData,
    //   admin_face: getAdminFaceName(),
    // });

    // Proceed to send data to the server if there are no validation errors
    fetch(`${process.env.REACT_APP_API_URL}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        admin_face: getAdminFaceName(),
      }),
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 409) {
            throw new Error(pageTranslations.emailAlreadyExists || "Email already exists");
          }
          throw new Error(pageTranslations.registrationFailed || "Registration failed");
        }
        return response.json();
      })
      .then((data) => {
        if (data.id) {
          setUserId(data.id);
          setMessage(pageTranslations.registrationSuccessful || "Registration successful");
          setType("success");
          setAlertKey((prevKey) => prevKey + 1);
          window.scrollTo(0, 0);
        } else {
          setMessage(pageTranslations.registrationFailed || "Registration failed");
          setType("error");
          setAlertKey((prevKey) => prevKey + 1);
        }
      })
      .catch((error) => {
        setMessage(`${pageTranslations.registrationFailed || "Registration failed"}: ${error.message}`);
        setType("error");
        setAlertKey((prevKey) => prevKey + 1);
      });
  };

  return (
    <div>
      <h2 className="font-style-4">
        {pageTranslations.title || "User Registration"}
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
      {userId && ( // Only render this section if userId exists
        <div className="dummy">
          <div className="button-container">
            <Button
              variant="danger"
              onClick={handleLoginScreenClick}
              className="logout-button"
            >
              {uploadedImageUrl
                ? `${pageTranslations.loginWithProfileImage || "Login"} ${formData.username}`
                : `${pageTranslations.loginWithoutProfileImage || "Login without profile image"} ${formData.username}`}
            </Button>
          </div>

          {!uploadedImageUrl && (
            <div className="profile-image-buttons">
              <ImageUploader userId={userId} onUpload={handleImageUpload} selectedLanguage={selectedLanguage}/>
            </div>
          )}

          {uploadedImageUrl && (
            <div className="uploaded-image">
              <img
                src={`${process.env.REACT_APP_BACKEND_URL}${convertToMediaPath(
                  uploadedImageUrl
                )}`}
                alt="Uploaded Profile"
              />
            </div>
          )}
        </div>
      )}
      <form noValidate className="system-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">
            {pageTranslations.usernameLabel || "Username"}
          </label>{" "}
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
          <label htmlFor="dummyEmail">
            {pageTranslations.confirmEmailLabel || "Confirm Email"}
          </label>{" "}
          <input
            type="email"
            id="dummyEmail"
            name="dummyEmail"
            value={dummyEmail}
            onChange={handleInputChange}
            onBlur={handleBlur}
            required
          />
        </div>
        <div>
          <label htmlFor="password">
            {pageTranslations.passwordLabel || "Password"}
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"} // Toggle between text and password type
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
              style={{ paddingRight: "30px" }} // Ensure there's space for the icon
            />
            <Button
              variant="link"
              style={{
                position: "absolute",
                right: "5px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <Eye /> : <EyeSlash />}
            </Button>
          </div>
        </div>
        <div className="rounded-rectangle-wrapper">
          <h3 className="font-style-4">
            {pageTranslations.aboutYouSurveyTitle || "About You Survey"}
          </h3>{" "}
          <div>
            <Button
              variant="outline-info"
              className="btn-sm mb-2"
              onClick={() => setShowGender(!showGender)}
            >
              {selectedGender === null ? (
                <XCircle className="me-1" style={{ fontSize: "1.5rem" }} />
              ) : (
                <CheckCircle className="me-1" style={{ fontSize: "1.5rem" }} />
              )}
              {showGender
                ? pageTranslations.hideGender || "Hide Most Like You"
                : pageTranslations.showGender || "Show Most Like You Selection"}
              {selectedGender === null ? (
                <XCircle className="ms-1" style={{ fontSize: "1.5rem" }} />
              ) : (
                <CheckCircle className="ms-1" style={{ fontSize: "1.5rem" }} />
              )}
            </Button>
          </div>
          {showGender && (
            <Gender
              onSelectGender={handleGenderSelection}
              selected={selectedGender}
            />
          )}
          <div>
            <Button
              variant="outline-info"
              className="btn-sm mb-2"
              onClick={() => setShowHobbies(!showHobbies)}
            >
              {selectedHobby === null ? (
                <XCircle className="me-1" style={{ fontSize: "1.5rem" }} />
              ) : (
                <CheckCircle className="me-1" style={{ fontSize: "1.5rem" }} />
              )}
              {showHobbies
                ? pageTranslations.hideHobbies || "Hide Your Favourite Hobby"
                : pageTranslations.showHobbies ||
                  "Show Your Favourite Hobby Selection"}
              {selectedHobby === null ? (
                <XCircle className="ms-1" style={{ fontSize: "1.5rem" }} />
              ) : (
                <CheckCircle className="ms-1" style={{ fontSize: "1.5rem" }} />
              )}
            </Button>
          </div>
          {showHobbies && (
            <Hobbies
              onSelectHobby={handleHobbySelection}
              selected={selectedHobby}
              selectedLanguage={selectedLanguage}
              hobbies={pageTranslations.hobbies} // Pass the translated hobbies
            />
          )}
          <div>
            <Button
              variant="outline-info"
              className="btn-sm mb-2"
              onClick={() => setShowOrientation(!showOrientation)}
            >
              {selectedOrientation === null ? (
                <XCircle className="me-1" style={{ fontSize: "1.5rem" }} />
              ) : (
                <CheckCircle className="me-1" style={{ fontSize: "1.5rem" }} />
              )}
              {showOrientation
                ? pageTranslations.hideOrientation ||
                  "Hide Your Preferred Company"
                : pageTranslations.showOrientation ||
                  "Show Your Preferred Company Selection"}
              {selectedOrientation === null ? (
                <XCircle className="ms-1" style={{ fontSize: "1.5rem" }} />
              ) : (
                <CheckCircle className="ms-1" style={{ fontSize: "1.5rem" }} />
              )}
            </Button>
          </div>
          {showOrientation && (
            <Orientation
              onSelectOrientation={handleOrientationSelection}
              selected={selectedOrientation}
            />
          )}
          <div>
            <Button
              variant="outline-info"
              className="btn-sm mb-2"
              onClick={() => setShowFloatsMyBoat(!showFloatsMyBoat)}
            >
              {selectedCarousel === null ? (
                <XCircle className="me-1" style={{ fontSize: "1.5rem" }} />
              ) : (
                <CheckCircle className="me-1" style={{ fontSize: "1.5rem" }} />
              )}
              {showFloatsMyBoat
                ? pageTranslations.hideFloatsMyBoat || "Hide Floats Your Boat"
                : pageTranslations.showFloatsMyBoat ||
                  "Show Floats Your Boat Selection"}
              {selectedCarousel === null ? (
                <XCircle className="ms-1" style={{ fontSize: "1.5rem" }} />
              ) : (
                <CheckCircle className="ms-1" style={{ fontSize: "1.5rem" }} />
              )}
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
              className="btn-sm mb-2"
              onClick={handleOpenLocation}
            >
              {locationSelected ? (
                <CheckCircle className="me-1" style={{ fontSize: "1.5rem" }} />
              ) : (
                <XCircle className="me-1" style={{ fontSize: "1.5rem" }} />
              )}
              {locationSelected
                ? pageTranslations.locationSelected || "Location Selected"
                : pageTranslations.selectLocation || "Select Location"}{" "}
              {locationSelected ? (
                <CheckCircle className="ms-1" style={{ fontSize: "1.5rem" }} />
              ) : (
                <XCircle className="ms-1" style={{ fontSize: "1.5rem" }} />
              )}
            </Button>
          </div>
          <div>
            <h3 className="font-style-4">
              {pageTranslations.aboutYou || "About You"}
            </h3>
            <textarea
              id="aboutYou"
              className="about-you-textarea"
              placeholder={
                pageTranslations.aboutYouPlaceholder ||
                "I am looking for a long term relationship. Look out for my Connection Request from the Communication Centre."
              }
              name="aboutYou"
              value={formData.aboutYou}
              onChange={handleInputChange}
              onBlur={handleBlur}
              required
              style={{ width: "100%", height: "100px" }} // Adjust styling as needed
            />
          </div>
          <div>
            {selectedOrientation !== null && selectedGender !== null && (
              <>
                <h3 className="font-style-4">
                  {pageTranslations.aboutYourSystemAdmin ||
                    "About Your System Admin"}
                </h3>
                <img src={getAdminImagePath()} alt="admin" />
                {translatedAdminLabels.map((label, index) => (
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
                        display: "flex", // Ensure flexbox layout
                        alignItems: "center", // Center the items vertically
                        justifyContent: "center", // Center the items horizontally
                      }}
                    >
                      <div
                        style={{
                          whiteSpace: "nowrap", // Prevent the text from wrapping
                        }}
                      >
                        {label} {/* Use the translated label */}
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
                          width: "20px"
                        }}
                      />
                    </div>
                  </div>
                ))}
                <textarea
                  id="aboutMyBotPal"
                  className="about-you-textarea"
                  name="aboutMyBotPal"
                  value={formData.aboutMyBotPal}
                  readOnly
                  style={hiddenTextareaStyle}
                />
              </>
            )}
          </div>
        </div>

        {showLocation && (
          <Location
            onClose={() => setShowLocation(false)}
            onSelectCoordinates={handleSelectCoordinates} // Pass the handler to the Location component
          />
        )}

        {!userId && (
          <Button type="submit" variant="outline-info" className="btn-sm">
            {pageTranslations.registerButton || "Register"}
          </Button>
        )}
      </form>
      {message && (
        <AlertMessage
          key={alertKey}
          message={message}
          type={type}
          centred={type === "error"}
        />
      )}
    </div>
  );
};

export default RegistrationForm;
