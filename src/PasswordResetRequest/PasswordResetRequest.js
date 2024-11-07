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
        languageCode: languageCode, // Send selectedLanguage to the backend
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
      <header>
        <Button
          variant="danger"
          onClick={backToLogin}
          className="logout-button"
          aria-label={
            translations[languageCode]?.passwordReset?.backToLogin ||
            "Back to Login"
          }
        >
          {translations[languageCode]?.passwordReset?.backToLogin ||
            "Back to Login"}
        </Button>
        <h2 className="font-style-4" id="password-reset-title">
          {translations[languageCode]?.passwordReset?.title || "Password Reset"}
        </h2>
      </header>
      <div className="wrapper-container">
      <form onSubmit={handleSubmit} aria-labelledby="password-reset-title">
          <input
          id="emailInput"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={
              translations[languageCode]?.passwordReset?.emailPlaceholder ||
              "Enter your email"
            }
            required
            aria-describedby="emailHelp"
          />

          <Button
            variant="outline-info"
            className="btn-sm view-profile-btn"
            type="submit"
            aria-label={
              translations[languageCode]?.passwordReset?.sendLink ||
              "Send Reset Link"
            }
          >
            {translations[languageCode]?.passwordReset?.sendLink ||
              "Send Reset Link"}
          </Button>
        </form>
      </div>
      <small id="emailHelp" className="form-text text-muted">
            {translations[languageCode]?.passwordReset?.emailHelpText ||
              "We'll send a reset link to this email address."}
          </small>
      {message && <AlertMessage key={alertKey} message={message} type={type} role="alert" aria-live="polite"/>}
    </div>
  );
};

export default PasswordResetRequest;
