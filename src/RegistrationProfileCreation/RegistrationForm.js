import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // New import
import Cookies from "js-cookie";
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
import PrivacyPolicy from "../Login/PrivacyPolicy.js";

const RegistrationForm = () => {
  // Initialize selectedLanguage first
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return Cookies.get("preferredLanguage") || "en"; // Default to 'en' if no cookie is set
  });
  const [ipData, setIpData] = useState({
    ip: "",
    country: "",
    language: selectedLanguage,
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
  const [privacyChecked, setPrivacyChecked] = useState(false); // For privacy policy checkbox
  const [isEighteenOrOlder, setIsEighteenOrOlder] = useState(false); // For 18+ checkbox
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const usernameInputRef = useRef(null);
  const privacyPolicyRef = useRef(null);
  // Initialize formData state
  const [formData, setFormData] = useState(() => {
    // Load form data from local storage if available
    const savedData = JSON.parse(localStorage.getItem("registrationFormData"));
    return (
      savedData || {
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
        language_code: selectedLanguage,
      }
    );
  });
  const navigate = useNavigate();
  const location = useLocation(); // Get the location object
  const { language, country, ip } = location.state || {};
  const pageTranslations =
    translations[selectedLanguage]?.["registration"] || {}; // Get the translation for the current page
  const translatedAdminLabels =
    pageTranslations.adminLabels ||
    botPalOptions.options.map((option) => option.label); // fallback to default labels

  const languageMap = {
    en: "English",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
    ar: "العربية", // Arabic
    zh: "中文", // Chinese
    ga: "Gaelach",
    pt: "Português",
    hi: "हिन्दी",
    hy: "Հայերեն",
  };
  const handleTogglePrivacyPolicy = () => {
    setShowPrivacyPolicy((prev) => !prev);
  };
  const handleAgeCheck = (event) => {
    setIsEighteenOrOlder(event.target.checked);
  };
  const handleOpenLocation = () => {
    setShowLocation(true);
  };
  const handlePrivacyCheck = (event) => {
    setPrivacyChecked(event.target.checked); // Update checkbox state
  };

  const handleLanguageChange = (languageCode) => {
    setSelectedLanguage(languageCode);
    setIpData((prevIpData) => ({
      ...prevIpData,
      language: languageCode,
    }));

    Cookies.set("preferredLanguage", languageCode, { expires: 365 }); // Store language in cookies
  };
  useEffect(() => {
    if (usernameInputRef.current) {
      usernameInputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (!ip || !country || !language) {
      const fetchIpAddress = async () => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/api/get-ip`
          );
          const data = await response.json();

          const fetchedLanguage = data.language || "en"; // Default to 'en'
          const fetchedCountry = data.country || "";
          const fetchedIp = data.ip || "";

          // Log and set the fetched data
          console.log("Fetched IP-based data:", {
            language: fetchedLanguage,
            country: fetchedCountry,
            ip: fetchedIp,
          });

          setIpData({
            ip: fetchedIp,
            country: fetchedCountry,
            language: fetchedLanguage,
          });

          // Set preferred language to the fetched one if necessary
          setSelectedLanguage(fetchedLanguage);
        } catch (error) {
          console.error("Error fetching IP address:", error);
        }
      };

      // Trigger IP fetch only if necessary
      fetchIpAddress();
    } else {
      // If the data is already present, log it and set it to state
      //console.log("IP-based data from login:", { language, country, ip });
      setIpData({ ip, country, language });
    }
  }, [language, country, ip]);

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
    console.log(name, value)
    
    const validationErrors = validateUser({ ...formData, [name]: value }, false, selectedLanguage);

    if (name === "dummyEmail" && value !== formData.email) {
      validationErrors["dummyEmail"] =
        pageTranslations.emailsDoNotMatch || "Emails do not match";
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
    if (!isEighteenOrOlder) {
      setMessage(
        pageTranslations.confirmAgeError ||
          "Please confirm that you are 18 years or older to register."
      );
      setType("error");
      setAlertKey((prevKey) => prevKey + 1);
      return; // Stop form submission if the checkbox is not checked
    }
    if (!privacyChecked) {
      setMessage(
        pageTranslations.acceptPrivacyPolicy ||
          "Please read and accept the Privacy Policy before registering."
      );
      setType("error");
      setAlertKey((prevKey) => prevKey + 1);
      privacyPolicyRef.current?.scrollIntoView({ behavior: "smooth" }); // Scroll to Privacy Policy
      return;
    }
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

    // Proceed to send data to the server if there are no validation errors
    fetch(`${process.env.REACT_APP_API_URL}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...formData,
        admin_face: getAdminFaceName(),
        country_name: ipData.country, // New field for country name
        registered_ip_address: ipData.ip, // New field for registered IP address
      }),
    })
      .then((response) => {
        if (!response.ok) {
          if (response.status === 409) {
            throw new Error(
              pageTranslations.emailAlreadyExists || "Email already exists"
            );
          }
          throw new Error(
            pageTranslations.registrationFailed || "Registration failed"
          );
        }
        return response.json();
      })
      .then((data) => {
        if (data.id) {
          setUserId(data.id);
          setMessage(
            pageTranslations.registrationSuccessful || "Registration successful"
          );
          setType("success");
          setAlertKey((prevKey) => prevKey + 1);
          window.scrollTo(0, 0);
        } else {
          setMessage(
            pageTranslations.registrationFailed || "Registration failed"
          );
          setType("error");
          setAlertKey((prevKey) => prevKey + 1);
        }
      })
      .catch((error) => {
        setMessage(
          `${pageTranslations.registrationFailed || "Registration failed"}: ${
            error.message
          }`
        );
        setType("error");
        setAlertKey((prevKey) => prevKey + 1);
      });
  };

  return (
    <div>
      <h2 id="registration-form-title" className="font-style-4">
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
            <Dropdown.Item eventKey="ga" className="font-style-4" lang="ga">
              Gaelic
            </Dropdown.Item>
            <Dropdown.Item eventKey="pt" className="font-style-4" lang="pt">
              Português
            </Dropdown.Item>
            <Dropdown.Item eventKey="hi" className="font-style-4" lang="hi">
              हिन्दी
            </Dropdown.Item>
            <Dropdown.Item eventKey="hy" className="font-style-4" lang="hy">
              Հայերեն
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
                ? `${pageTranslations.loginWithProfileImage || "Login"} ${
                    formData.username
                  }`
                : `${
                    pageTranslations.loginWithoutProfileImage ||
                    "Login without profile image"
                  } ${formData.username}`}
            </Button>
          </div>

          {!uploadedImageUrl && (
            <div className="profile-image-buttons">
              <ImageUploader
                userId={userId}
                onUpload={handleImageUpload}
                selectedLanguage={selectedLanguage}
              />
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
      {!showPrivacyPolicy ? (
        <form
          noValidate
          className="system-form"
          onSubmit={handleSubmit}
          aria-labelledby="registration-form-title"
        >
          <div>
            <label htmlFor="username" className="font-style-4">
              {pageTranslations.usernameLabel || "Username"}
            </label>
            <input
              type="text"
              id="username"
              name="username"
              ref={usernameInputRef}
              value={formData.username}
              onChange={handleInputChange}
              onBlur={handleBlur}
              aria-label={
                pageTranslations.ariaUsernameRequest || "Enter your username"
              }
              aria-required="true"
            />
          </div>
          <fieldset>
            <legend className="font-style-4">
              {pageTranslations.emailSectionLegend || "Email Confirmation"}
            </legend>

            <div>
              <label htmlFor="email" className="font-style-4">
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
                aria-required="true"
              />
            </div>

            <div>
              <label htmlFor="dummyEmail" className="font-style-4">
                {pageTranslations.confirmEmailLabel || "Confirm Email"}
              </label>
              <input
                type="email"
                id="dummyEmail"
                name="dummyEmail"
                value={dummyEmail}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                aria-required="true"
              />
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-style-4">
              {pageTranslations.passwordLabel || "Password"}
            </legend>

            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onBlur={handleBlur}
                required
                aria-required="true"
                style={{ paddingRight: "40px", flexGrow: 1 }} // Space for the button
              />
              <Button
                variant="link"
                style={{
                  position: "absolute",
                  right: "10px", // Adjust spacing to align button slightly left or inside
                  transform: "translateY(-50%)",
                  top: "50%",
                }}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <Eye /> : <EyeSlash />}
              </Button>
            </div>
          </fieldset>

          <fieldset className="rounded-rectangle-wrapper">
            <legend className="font-style-4">
              {pageTranslations.aboutYouSurveyTitle || "About You Survey"}
            </legend>
            <div>
              <Button
                variant="outline-info"
                className="btn-sm mb-2"
                onClick={() => setShowGender(!showGender)}
                aria-pressed={showGender} // indicates toggle state
                aria-expanded={showGender}
                aria-controls="g-selection"
                aria-label={
                  showGender
                    ? pageTranslations.hideGenderSelection
                    : pageTranslations.showGenderSelection
                }
              >
                {selectedGender === null ? (
                  <XCircle className="me-1" style={{ fontSize: "1.5rem" }} />
                ) : (
                  <CheckCircle
                    className="me-1"
                    style={{ fontSize: "1.5rem" }}
                  />
                )}
                {showGender
                  ? pageTranslations.hideGender || "Hide Most Like You"
                  : pageTranslations.showGender ||
                    "Show Most Like You Selection"}
                {selectedGender === null ? (
                  <XCircle className="ms-1" style={{ fontSize: "1.5rem" }} />
                ) : (
                  <CheckCircle
                    className="ms-1"
                    style={{ fontSize: "1.5rem" }}
                  />
                )}
              </Button>
            </div>
            {showGender && (
              <div id="g-selection" role="region" aria-labelledby="g-selection">
                <Gender
                  onSelectGender={handleGenderSelection}
                  selected={selectedGender}
                />
              </div>
            )}
            <div>
              <Button
                variant="outline-info"
                className="btn-sm mb-2"
                onClick={() => setShowHobbies(!showHobbies)}
                aria-pressed={showHobbies} // Indicate the toggle state
                aria-label={
                  showHobbies
                    ? pageTranslations.hideHobbies ||
                      "Hide Your Favourite Hobby"
                    : pageTranslations.showHobbies ||
                      "Show Your Favourite Hobby Selection"
                }
                aria-expanded={showHobbies}
                aria-controls="h-selection"
              >
                {selectedHobby === null ? (
                  <XCircle className="me-1" style={{ fontSize: "1.5rem" }} />
                ) : (
                  <CheckCircle
                    className="me-1"
                    style={{ fontSize: "1.5rem" }}
                  />
                )}
                {showHobbies
                  ? pageTranslations.hideHobbies || "Hide Your Favourite Hobby"
                  : pageTranslations.showHobbies ||
                    "Show Your Favourite Hobby Selection"}
                {selectedHobby === null ? (
                  <XCircle className="ms-1" style={{ fontSize: "1.5rem" }} />
                ) : (
                  <CheckCircle
                    className="ms-1"
                    style={{ fontSize: "1.5rem" }}
                  />
                )}
              </Button>
            </div>

            {showHobbies && (
              <div id="h-selection" role="region" aria-labelledby="h-selection">
                <Hobbies
                  onSelectHobby={handleHobbySelection}
                  selected={selectedHobby}
                  selectedLanguage={selectedLanguage}
                  hobbies={pageTranslations.hobbies} // Pass the translated hobbies
                />
              </div>
            )}
            <div>
              <Button
                variant="outline-info"
                className="btn-sm mb-2"
                onClick={() => setShowOrientation(!showOrientation)}
                aria-pressed={showOrientation} // Indicates toggle state to screen readers
                aria-label={
                  showOrientation
                    ? pageTranslations.hideOrientation ||
                      "Hide Preferred Partner"
                    : pageTranslations.showOrientation ||
                      "Show Preferred Partner Selection"
                }
                aria-expanded={showOrientation}
                aria-controls="o-selection"
              >
                {selectedOrientation === null ? (
                  <XCircle className="me-1" style={{ fontSize: "1.5rem" }} />
                ) : (
                  <CheckCircle
                    className="me-1"
                    style={{ fontSize: "1.5rem" }}
                  />
                )}
                {showOrientation
                  ? pageTranslations.hideOrientation || "Hide Preferred Partner"
                  : pageTranslations.showOrientation ||
                    "Show  Selection"}
                {selectedOrientation === null ? (
                  <XCircle className="ms-1" style={{ fontSize: "1.5rem" }} />
                ) : (
                  <CheckCircle
                    className="ms-1"
                    style={{ fontSize: "1.5rem" }}
                  />
                )}
              </Button>
            </div>

            {showOrientation && (
              <div id="o-selection" role="region" aria-labelledby="o-selection">
                <Orientation
                  onSelectOrientation={handleOrientationSelection}
                  selected={selectedOrientation}
                />
              </div>
            )}
            <div>
              <Button
                variant="outline-info"
                className="btn-sm mb-2"
                onClick={() => setShowFloatsMyBoat(!showFloatsMyBoat)}
                aria-pressed={showFloatsMyBoat} // Indicates toggle state for screen readers
                aria-label={
                  showFloatsMyBoat
                    ? pageTranslations.hideFloatsMyBoat ||
                      "Hide Floats Your Boat"
                    : pageTranslations.showFloatsMyBoat ||
                      "Show Floats Your Boat Selection"
                }
                aria-expanded={showFloatsMyBoat}
                aria-controls="f-selection"
              >
                {selectedCarousel === null ? (
                  <XCircle className="me-1" style={{ fontSize: "1.5rem" }} />
                ) : (
                  <CheckCircle
                    className="me-1"
                    style={{ fontSize: "1.5rem" }}
                  />
                )}
                {showFloatsMyBoat
                  ? pageTranslations.hideFloatsMyBoat || "Hide Floats Your Boat"
                  : pageTranslations.showFloatsMyBoat ||
                    "Show Floats Your Boat Selection"}
                {selectedCarousel === null ? (
                  <XCircle className="ms-1" style={{ fontSize: "1.5rem" }} />
                ) : (
                  <CheckCircle
                    className="ms-1"
                    style={{ fontSize: "1.5rem" }}
                  />
                )}
              </Button>
            </div>
            {showFloatsMyBoat && (
              <div id="f-selection" role="region" aria-labelledby="f-selection">
                <FloatsMyBoat
                  onSelectCarousel={handleCarouselSelection}
                  selectedCarousel={selectedCarousel}
                />
              </div>
            )}
            <div>
              <Button
                variant="outline-info"
                className="btn-sm mb-2"
                onClick={handleOpenLocation}
                aria-pressed={locationSelected} // Indicates toggle state for screen readers
                aria-label={
                  locationSelected
                    ? pageTranslations.locationSelected || "Location Selected"
                    : pageTranslations.selectLocation || "Select Location"
                } // Descriptive label for screen readers
              >
                {locationSelected ? (
                  <CheckCircle
                    className="me-1"
                    style={{ fontSize: "1.5rem" }}
                  />
                ) : (
                  <XCircle className="me-1" style={{ fontSize: "1.5rem" }} />
                )}
                {locationSelected
                  ? pageTranslations.locationSelected || "Location Selected"
                  : pageTranslations.selectLocation || "Select Location"}
                {locationSelected ? (
                  <CheckCircle
                    className="ms-1"
                    style={{ fontSize: "1.5rem" }}
                  />
                ) : (
                  <XCircle className="ms-1" style={{ fontSize: "1.5rem" }} />
                )}
              </Button>
            </div>
            <div>
              <h3 className="font-style-4" id="aboutYouHeading">
                {pageTranslations.aboutYou || "About You"}
              </h3>
              <label htmlFor="aboutYou" className="visually-hidden">
                {pageTranslations.describeYourself ||
                  "Describe yourself and what you’re looking for"}
              </label>
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
                aria-required="true"
                aria-labelledby="aboutYouHeading" // Associates the heading as context for the textarea
                style={{ width: "100%", height: "100px" }}
              />
            </div>

            <div>
              {selectedOrientation !== null && selectedGender !== null && (
                <section aria-labelledby="about-system-admin">
                  <h3 id="about-system-admin" className="font-style-4">
                    {pageTranslations.aboutYourSystemAdmin ||
                      "About Your System Admin"}
                  </h3>
                  <img
                    style={{
                      width: "100%",
                      maxWidth: "300px",
                      height: "auto",
                      borderRadius: "8px",
                      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                    }}
                    src={getAdminImagePath()}
                    alt={
                      pageTranslations.avatarPreference ||
                      "System Admin avatar based on your preferences"
                    }
                  />

                  <div role="radiogroup" aria-labelledby="about-system-admin">
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
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <label
                            htmlFor={`botPalOption${index}`}
                            style={{ whiteSpace: "nowrap" }}
                          >
                            {label}
                          </label>
                          <input
                            type="radio"
                            id={`botPalOption${index}`}
                            name="aboutMyBotPal"
                            value={index}
                            checked={selectedBotPalOption === index}
                            onChange={handleRadioChange}
                            style={{
                              marginBottom: "0",
                              width: "20px",
                            }}
                            aria-labelledby={`about-system-admin botPalOption${index}-label`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <textarea
                    id="aboutMyBotPal"
                    className="about-you-textarea"
                    name="aboutMyBotPal"
                    value={formData.aboutMyBotPal}
                    readOnly
                    style={hiddenTextareaStyle}
                    aria-hidden="true"
                  />
                </section>
              )}
            </div>
          </fieldset>

          {showLocation && (
            <Location
              onClose={() => setShowLocation(false)}
              onSelectCoordinates={handleSelectCoordinates} // Pass the handler to the Location component
              selectedLanguage={selectedLanguage}
            />
          )}

          <div
            style={{
              display: "flex",
            }}
          >
            <div style={{ color: "#62DDF5", textAlign: "left" }}>
              {pageTranslations.confirmAge ||
                "I confirm that I am 18 years or older"}
            </div>
            <input
              type="checkbox"
              id="ageCheck"
              checked={isEighteenOrOlder}
              onChange={handleAgeCheck}
              style={{ flexBasis: "15px", textAlign: "left", margin: "5px" }}
            />
          </div>
          {!userId && (
            <Button
              style={{ margin: "10px" }}
              type="submit"
              variant="outline-info"
              className="btn-sm"
            >
              {pageTranslations.registerButton || "Register"}
            </Button>
          )}
        </form>
      ) : (
        <PrivacyPolicy
          selectedLanguage={selectedLanguage}
          showBackButton={false}
        />
      )}
      <div
        ref={privacyPolicyRef}
        style={{ backgroundColor: "#fff" }}
        className="rounded-rectangle-wrapper"
      >
        <Button
          variant="outline-info"
          className="btn-sm"
          onClick={handleTogglePrivacyPolicy}
          style={{ margin: "10px", whiteSpace: "nowrap" }}
        >
          {showPrivacyPolicy
            ? pageTranslations.backToBase || "Back to Base"
            : pageTranslations.privacyPolicyLink || "Privacy Policy"}
        </Button>

        <div
          style={{
            display: "flex",
          }}
        >
          <div style={{ flexGrow: "10", color: "#62DDF5" }}>
            <label htmlFor="privacyPolicy">
              {pageTranslations.acceptPrivacyPolicy ||
                "I have read and understood the Privacy Policy"}
            </label>
          </div>
          <input
            type="checkbox"
            id="privacyPolicy"
            checked={privacyChecked}
            onChange={handlePrivacyCheck}
            aria-required="true"
            aria-describedby="privacyPolicy-help"
            style={{ flexGrow: "1", flexBasis: "15px", margin: "5px" }}
          />
          <div id="privacyPolicy-help" style={{ display: "none" }}>
            {pageTranslations.acceptingPrivacy ||
              "Accepting the privacy policy is required to register."}
          </div>
        </div>
      </div>

      {message && (
        <div role="alert" aria-live="assertive" id="form-message">
          <AlertMessage
            key={alertKey}
            message={message}
            type={type}
            centred={type === "error"}
          />
        </div>
      )}
    </div>
  );
};

export default RegistrationForm;
