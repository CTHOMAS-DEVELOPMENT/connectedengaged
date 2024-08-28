import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { convertToMediaPath } from "../system/utils";
import AlertMessage from "../system/AlertMessage";
import validateUser from "../system/userValidation.js";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Eye, EyeSlash, CheckCircle, XCircle } from "react-bootstrap-icons";
import botPalOptions from "./botPalOptions.json"; // Import the JSON file

const RegistrationForm = () => {
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
  const navigate = useNavigate();
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
  });
  //about_my_bot_pal
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [userId, setUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

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
    const face = adminFace(version1Gender[selectedGender], version1Orientations[selectedOrientation]);
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
    const face = adminFace(version1Gender[selectedGender], version1Orientations[selectedOrientation]);
    const imagePath = `/admins/${selectedOption.botImage}${face}.png`; // Use the static path from the public directory
  
    return imagePath;
  };
  
  

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "dummyEmail") {
      setDummyEmail(value);
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
      validationErrors["dummyEmail"] = "Emails do not match";
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
      hobby: version1Hobbies[index] || "", // Make sure version1Hobbies is accessible here
    }));
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    const validationErrors = validateUser(formData);
    if (dummyEmail !== formData.email) {
      validationErrors["dummyEmail"] = "Emails do not match";
    }
    if (Object.keys(validationErrors).length === 0) {
      const adminFacePath = getAdminFaceName();
      fetch(`${process.env.REACT_APP_API_URL}/api/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          admin_face: adminFacePath, // Include admin_face in the request payload
        }),
      })
        .then((response) => {
          if (!response.ok) {
            if (response.status === 409) {
              throw new Error("Email already exists");
            }
            throw new Error("Registration failed");
          }
          return response.json();
        })
        .then((data) => {
          if (data.id) {
            setUserId(data.id);
            setMessage("Registration successful");
            setType("success");
            setAlertKey((prevKey) => prevKey + 1);
            window.scrollTo(0, 0);
          } else if (data.message) {
            setMessage(data.message);
            setType("error");
            setAlertKey((prevKey) => prevKey + 1);
          }
        })
        .catch((error) => {
          console.error("Registration error:", error);
          setMessage("Registration failed: " + error.message);
          setType("error");
          setAlertKey((prevKey) => prevKey + 1);
        });
    } else {
      // Show the first validation error
      const firstErrorKey = Object.keys(validationErrors)[0];
      setMessage(validationErrors[firstErrorKey]);
      setType("error");
      setAlertKey((prevKey) => prevKey + 1);
    }
  };

  return (
    <div>
      <h2 className="font-style-4">User Registration</h2>
      {userId && ( // Only render this section if userId exists
        <div className="dummy">
          <div className="button-container">
            <Button
              variant="danger"
              onClick={handleLoginScreenClick}
              className="logout-button"
            >
              {uploadedImageUrl
                ? `Login ${formData.username}`
                : `Login ${formData.username} without profile image`}
            </Button>
          </div>

          {!uploadedImageUrl && (
            <div className="profile-image-buttons">
              <ImageUploader userId={userId} onUpload={handleImageUpload} />
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
          <label htmlFor="username">Username</label>
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
          <label htmlFor="email">Email</label>
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
          <label htmlFor="dummyEmail">Confirm Email</label>
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
          <label htmlFor="password">Password</label>
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
          <h3 className="font-style-4">About You Survey</h3>
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
                ? "Hide Most Like You"
                : "Show Most Like You Selection"}
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
                ? "Hide Your Favourite Hobby"
                : "Show Your Favourite Hobby Selection"}
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
                ? "Hide Your Preferred Company"
                : "Show Your Preferred Company Selection"}
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
                ? "Hide Floats Your Boat"
                : "Show Floats Your Boat Selection"}
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
            <h3 className="font-style-4">About You</h3>
            <textarea
              id="aboutYou"
              className="about-you-textarea"
              placeholder="I am looking for a long term relationship. Look out for my Connection Request from the Communication Centre."
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
                <h3 className="font-style-4">About Your System Admin</h3>
                <img src={getAdminImagePath()} alt="admin" />
                {botPalOptions.options.map((option, index) => (
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
                        {option.label}
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
        {!userId && (
          <Button type="submit" variant="outline-info" className="btn-sm">
            Register
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
