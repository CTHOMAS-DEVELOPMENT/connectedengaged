import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import AlertMessage from "../system/AlertMessage";
import translations from "./translations.json"; // Adjust the path to where translations.json is located

const PasswordResetRequest = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [alertKey, setAlertKey] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  // Use the language code passed via the Link state or fallback to 'en'
  const languageCode = location.state?.selectedLanguage || "en";

  const backToLogin = () => {
    navigate("/"); // Update for v6
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetch(`${process.env.REACT_APP_API_URL}/api/password_reset_request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        languageCode: languageCode,  // Send selectedLanguage to the backend
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setMessage(
            translations[languageCode]?.passwordReset?.emailSent ||
              "Please check your email for the password reset link."
          );
          setAlertKey((prevKey) => prevKey + 1);
        } else {
          setMessage(
            translations[languageCode]?.passwordReset?.emailFailed ||
              "Unable to send password reset link. Please try again later."
          );
          setType("error");
          setAlertKey((prevKey) => prevKey + 1);
        }
      })
      .catch((error) => {
        console.error("Password reset request error:", error);
        setMessage(
          translations[languageCode]?.passwordReset?.networkError ||
            "Network error while trying to send reset link."
        );
        setType("error");
        setAlertKey((prevKey) => prevKey + 1);
      });
  };

  return (
    <div className="password-reset-request">
      <Button variant="danger" onClick={backToLogin} className="logout-button">
        {translations[languageCode]?.passwordReset?.backToLogin ||
          "Back to Login"}
      </Button>
      <h2 className="font-style-4">
        {translations[languageCode]?.passwordReset?.title || "Password Reset"}
      </h2>
      <div className="wrapper-container">
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={
              translations[languageCode]?.passwordReset?.emailPlaceholder ||
              "Enter your email"
            }
            required
          />
          <Button
            variant="outline-info"
            className="btn-sm view-profile-btn"
            type="submit"
          >
            {translations[languageCode]?.passwordReset?.sendLink ||
              "Send Reset Link"}
          </Button>
        </form>
      </div>
      {message && <AlertMessage key={alertKey} message={message} type={type} />}
    </div>
  );
};

export default PasswordResetRequest;
