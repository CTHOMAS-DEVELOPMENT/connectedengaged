import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom"; // Import Link from react-router-dom
import Cookies from "js-cookie";
import translations from "./translations.json";
import AlertMessage from "../system/AlertMessage";
import { womanImages, manImages } from "./images.js";
import AcceptAllIcon from "./accept_all.svg";
import RejectAllIcon from "./reject_all.svg";
import InformationIcon from "./information.svg";
import CustomizeIcon from "./customize.svg";
import ScrollingHelpText from "../system/ScrollingHelpText.js";
import { Button, Modal, Dropdown } from "react-bootstrap"; // Add Dropdown to imports
import "bootstrap/dist/css/bootstrap.min.css";

const LoginForm = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info"); // Default to 'info' or any type you prefer
  const [alertKey, setAlertKey] = useState(0);
  const [errors, setErrors] = useState({});
  const [manRotation, setManRotation] = useState(0);
  const [womanRotation, setWomanRotation] = useState(0);
  const [womanImage, setWomanImage] = useState(womanImages[0]);
  const [consentGiven, setConsentGiven] = useState(false);
  const [consentImagesState, setConsentImagesState] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [manImage, setManImage] = useState(manImages[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return Cookies.get("preferredLanguage") || "en"; // Default to 'en' if no cookie is set
  });
  const verticleWrapper = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center", // Center vertically
    width: "100%", // Ensure the wrapper takes full width
  };

  const horizontalWrapper = {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center", // Center vertically
    width: "100%",
  };
  const languageMap = {
    en: "English",
    es: "Español",
    fr: "Français",
    de: "Deutsch",
    ar: "العربية", // Arabic
    zh: "中文", // Chinese
  };

  const pageTranslations = translations[selectedLanguage]?.["login"] || {}; // Get the translation for the current page
  const navigate = useNavigate();
  const helpMessage =
    pageTranslations.helpMessage || "No help message configured";
  // Move the consentImages array inside the component after pageTranslations is defined
  const consentImages = [
    {
      id: "customize",
      svg: CustomizeIcon,
      label: pageTranslations.consent?.customize || "Customize",
    },
    {
      id: "acceptAll",
      svg: AcceptAllIcon,
      label: pageTranslations.consent?.acceptAll || "Accept All",
    },
    {
      id: "rejectAll",
      svg: RejectAllIcon,
      label: pageTranslations.consent?.rejectAll || "Reject All",
    },
    {
      id: "info",
      svg: InformationIcon,
      label: pageTranslations.consent?.info || "Information",
    },
  ];

  const [formData, setFormData] = useState({
    username: Cookies.get("username") || "", // Get the username from cookies if available
    password: "", // Do not store password
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const rotateImage = (image) => {
    if (image === "man") {
      setManRotation((prevRotation) => (prevRotation + 90) % 360);
    } else {
      setWomanRotation((prevRotation) => (prevRotation + 90) % 360);
    }
  };

  const shuffleConsentImages = () => {
    let shuffled = [...consentImages];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setConsentImagesState(shuffled);
  };

  const isImageCorrectlyOriented = () => {
    return manRotation % 360 === 0 && womanRotation % 360 === 0;
  };

  const handleLanguageChange = (languageCode) => {
    setSelectedLanguage(languageCode);
    Cookies.set("preferredLanguage", languageCode, { expires: 365 }); // Store for 1 year
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!consentGiven) {
      setMessage(
        pageTranslations.cookieConsentError ||
          "Please accept or reject cookies before logging in."
      );
      setType("error");
      setAlertKey((prevKey) => prevKey + 1);
      resetImages();
      return;
    }
    if (!isImageCorrectlyOriented()) {
      setMessage(
        pageTranslations.imageOrientationError ||
          "Please correctly orient the images before submitting."
      );
      setType("error");
      setAlertKey((prevKey) => prevKey + 1);
      resetImages();
      return;
    }
    if (validateForm()) {
      fetch(`${process.env.REACT_APP_API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data.success) {
            setMessage(pageTranslations.loginSuccess || "Login successful");
            setType("success");
            setAlertKey((prevKey) => prevKey + 1);
            localStorage.setItem("token", data.token);

            // Store the username in a cookie
            Cookies.set("username", formData.username, { expires: 365 }); // Store username for 1 year

            navigate("/userlist", { state: { userId: data.userId } });
          } else {
            setMessage(data.message || "Login failed");
            setType("error");
            setAlertKey((prevKey) => prevKey + 1);
            resetImages();
          }
        })
        .catch((error) => {
          console.error("Login error:", error);
          setMessage(
            pageTranslations.loginFailedNetwork ||
              "Login failed due to network error"
          );
          setType("error");
          setAlertKey((prevKey) => prevKey + 1);
          resetImages();
        });
    }
  };

  const resetImages = () => {
    shuffleConsentImages();

    const randomRotation = () => {
      const angles = [0, 90, 180, 270]; // Possible rotations
      return angles[Math.floor(Math.random() * angles.length)];
    };

    const selectRandomImage = (images) => {
      return images[Math.floor(Math.random() * images.length)];
    };

    setManRotation(randomRotation()); // Randomize man image rotation
    setWomanRotation(randomRotation()); // Randomize woman image rotation

    setManImage(selectRandomImage(manImages)); // Randomize man image
    setWomanImage(selectRandomImage(womanImages)); // Randomize woman image
  };

  const scoreClickConsent = (consertId) => {
    switch (consertId) {
      case "info":
        setModalContent(
          pageTranslations.infoMessage ||
            "We have two cookies which are for remembering your username and your language preference to remove the inconvenience of remembering your username or having to reselect your language preference the next time you login"
        );
        setShowModal(true);
        break;
      case "customize":
        setModalContent(
          pageTranslations.customizeMessage ||
            "You can either accept the application specific cookies or reject them."
        );
        setShowModal(true);
        break;
      case "rejectAll":
        Cookies.remove("username");
        Cookies.remove("preferredLanguage");
        setModalContent(
          pageTranslations.rejectAllMessage || "We have removed all cookies"
        );
        setShowModal(true);
        break;

      case "acceptAll":
        setConsentGiven(true);
        break;
      default:
        console.log("Unrecognized consent ID");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setConsentGiven(true); // Set consent given upon closing the modal
  };
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    resetImages(); // Call resetImages to randomize images and rotation on component mount
    setConsentImagesState(consentImages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLanguage, pageTranslations]); // Add selectedLanguage and pageTranslations to the dependency array

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <div className="login-layout">
      <div className="title-and-help" style={{ textAlign: "center" }}>
        <h1 className="font-style-4">
          {pageTranslations.title || "Are you Connected Engaged?"}
        </h1>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ScrollingHelpText message={helpMessage} width="300px" />
        </div>
      </div>
      <div style={{ textAlign: "center", margin: "20px" }}>
        <Dropdown onSelect={(eventKey) => handleLanguageChange(eventKey)}>
          <Dropdown.Toggle
            variant="primary"
            id="language-dropdown"
            className={`font-style-4`}
            lang={selectedLanguage} // Set the lang attribute dynamically
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

      <div style={isMobile ? verticleWrapper : horizontalWrapper}>
        <div className="image-panel">
          <img
            src={manImage}
            alt="Man"
            style={{ transform: `rotate(${manRotation}deg)` }}
            onClick={() => rotateImage("man")}
          />
        </div>
        <div className="image-panel">
          <img
            src={womanImage}
            alt="Woman"
            style={{ transform: `rotate(${womanRotation}deg)` }}
            onClick={() => rotateImage("woman")}
          />
        </div>
      </div>
      {message && <AlertMessage key={alertKey} message={message} type={type} />}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div className="login-form">
          <div className="form-container">
            <form onSubmit={handleSubmit}>
              <div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  placeholder="Username"
                  onChange={handleInputChange}
                  required
                />
                {errors.username && <p className="error">{errors.username}</p>}
              </div>
              <div>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  placeholder="Password"
                  onChange={handleInputChange}
                  required
                />
                {errors.password && (
                  <p className="error">
                    {pageTranslations.passwordLengthError ||
                      "Password must be at least 8 characters"}
                  </p>
                )}
              </div>
              <Button variant="primary" onClick={handleSubmit}>
                {pageTranslations.loginButton || "Login"}
              </Button>{" "}
              <div className="login-page-link">
                <span>
                  {pageTranslations.noAccountText || "Don't have an account?"}{" "}
                  <Link to="/register">
                    {pageTranslations.registerLink || "Register here"}
                  </Link>
                </span>
              </div>
              <div className="login-page-link">
                <span>
                  <Link
                    to="/password-reset-request"
                    state={{ selectedLanguage: selectedLanguage }} // Pass the selected language to PasswordResetRequest
                  >
                    {pageTranslations.forgottenPasswordLink ||
                      "Forgotten password?"}
                  </Link>
                </span>
              </div>
            </form>
            {showModal && (
              <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                  <Modal.Title className="font-style-4">
                    {pageTranslations.modalTitle || "Cookie Information"}
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>{modalContent}</Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleCloseModal}>
                    {pageTranslations.closeButton || "Close"}
                  </Button>
                </Modal.Footer>
              </Modal>
            )}
            {!consentGiven && (
              <div className="">
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: isMobile
                      ? "1fr 1fr"
                      : "repeat(4, 1fr)", // 2 columns on mobile, 4 on larger
                    gridGap: "15px", // Adds space between items
                    justifyContent: "center", // Centers the grid
                    alignItems: "center", // Centers items vertically
                    marginTop: "20px", // Space at the top
                  }}
                >
                  {consentImagesState.map(
                    ({ id, svg: SvgComponent, label }) => (
                      <div
                        key={id}
                        onClick={() => scoreClickConsent(id)}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={SvgComponent}
                          alt={label}
                          style={{ width: "60px", height: "60px" }}
                        />
                        <div
                          className="font-style-4"
                          style={{ textAlign: "center" }}
                        >
                          {label}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
