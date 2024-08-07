import React, { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom"; // Import Link from react-router-dom
import AlertMessage from "../system/AlertMessage";
import { womanImages, manImages, consentImages } from "./images.js";
import ScrollingHelpText from "../system/ScrollingHelpText.js";
import { Button, Modal } from "react-bootstrap";
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
  const [consentImagesState, setConsentImagesState] = useState(consentImages);
  const [manImage, setManImage] = useState(manImages[0]);
  const navigate = useNavigate();
  const location = useLocation(); // To access the passed state
  const helpMessage =
    process.env.REACT_APP_LOGIN_HELP || "No help message configured.";
  const [formData, setFormData] = useState({
    username: location.state?.username || "", // Pre-populate username if it's passed in state
    password: "",
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

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
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!consentGiven) {
      setMessage("Please accept or reject cookies before logging in.");
      setType("error");
      setAlertKey((prevKey) => prevKey + 1);
      resetImages();
      return;
    }
    if (!isImageCorrectlyOriented()) {
      setMessage("Please correctly orient the images before submitting.");
      setType("error");
      setAlertKey((prevKey) => prevKey + 1);
      resetImages();
      return;
    }
    if (validateForm()) {
      console.log('API URL:', process.env.REACT_APP_API_URL);
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
          //console.log("Response status:", response.status);
          //console.log("Response headers:", response.headers);
          return response.json();
        })
        .then((data) => {
          //console.log("Response data:", data);
          if (data.success) {
            setMessage("Login successful");
            setType("success");
            setAlertKey((prevKey) => prevKey + 1);
            localStorage.setItem("token", data.token);
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
          setMessage("Login failed due to network error");
          setType("error");
          setAlertKey((prevKey) => prevKey + 1);
          resetImages();
        });
    }
  };

  const resetImages = () => {
    shuffleConsentImages();
    const randomRotation = () => {
      const angles = [0, 90, 180, 270];
      return angles[Math.floor(Math.random() * angles.length)];
    };

    const selectRandomImage = (images) => {
      return images[Math.floor(Math.random() * images.length)];
    };

    setManRotation(randomRotation());
    setWomanRotation(randomRotation());
    setManImage(selectRandomImage(manImages));
    setWomanImage(selectRandomImage(womanImages));
  };
  const scoreClickConsent = (consertId) => {
    switch (consertId) {
      case "info":
        setModalContent(process.env.REACT_APP_LOGIN_CONSENT_INFO);
        setShowModal(true);
        break;
      case "customize":
        setModalContent(process.env.REACT_APP_LOGIN_CONSENT_CUSTOMIZE);
        setShowModal(true);
        break;
      case "rejectAll":
        setModalContent(process.env.REACT_APP_LOGIN_CONSENT_REJECT_ALL);
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
    resetImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="login-layout">
      <div className="title-and-help" style={{ textAlign: "center" }}>
        <h1 className="font-style-4">Are you Connected Engaged?</h1>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ScrollingHelpText message={helpMessage} width="300px" />
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "center" }}>
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
                {errors.password && <p className="error">{errors.password}</p>}
              </div>
              <Button variant="primary" onClick={handleSubmit}>
                Login
              </Button>{" "}
              <div className="login-page-link">
                <span>
                  Don't have an account?{" "}
                  <Link to="/register">Register here</Link>
                </span>
              </div>
              <div className="login-page-link">
                <span>
                  <Link to="/password-reset-request">Forgotten password?</Link>
                </span>
              </div>
            </form>
            {showModal && (
              <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                  <Modal.Title className="font-style-4">
                    Cookie Information
                  </Modal.Title>
                </Modal.Header>
                <Modal.Body>{modalContent}</Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleCloseModal}>
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
            )}
            {!consentGiven && (
              <div className="">
                <div>
                  {consentImagesState.map((image) => (
                    <img
                      key={image.id}
                      src={image.src}
                      alt={image.description}
                      onClick={() => scoreClickConsent(image.id)}
                      style={{ cursor: "pointer" }}
                    />
                  ))}
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
