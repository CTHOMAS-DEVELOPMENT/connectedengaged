import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import AlertMessage from "../system/AlertMessage";
import translations from "./translations.json"; // Adjust the path to where your translations are located

const PasswordReset = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token"); // Extract the token from the URL
  const languageCode = searchParams.get("language") || "en"; // Extract the language code or default to "en"

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [alertKey, setAlertKey] = useState(0);
  const navigate = useNavigate();

  const backToLogin = () => {
    navigate("/"); // Redirect back to login
  };

  const handlePasswordReset = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage(
        translations[languageCode]?.passwordReset?.passwordMismatch ||
          "Passwords do not match."
      );
      setType("warning");
      setAlertKey((prevKey) => prevKey + 1);
      return;
    }

    fetch(`${process.env.REACT_APP_API_URL}/api/update_user_password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token, password, languageCode }), // Include the token, new password, and languageCode in the request
    })
      .then((response) => response.json())
      .then((data) => {
        setMessage(
          data.message ||
            translations[languageCode]?.passwordReset?.successMessage ||
            "Password reset successful!"
        );
        setType("success");
        setAlertKey((prevKey) => prevKey + 1);
      })
      .catch((error) => {
        console.error("Error:", error);
        setMessage(
          translations[languageCode]?.passwordReset?.errorMessage ||
            "Error resetting password. Please try again."
        );
        setType("error");
        setAlertKey((prevKey) => prevKey + 1);
      });
  };

  return (
    <div>
      <nav>
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
      </nav>
      <h2 className="font-style-4">
        {translations[languageCode]?.passwordReset?.title ||
          "Reset Your Password"}
      </h2>
      <div className="wrapper-container">
        <form onSubmit={handlePasswordReset} aria-label={translations[languageCode]?.passwordReset?.passwordResetForm ||
              "Password Reset Form"}>
          <label htmlFor="newPassword">
            {translations[languageCode]?.passwordReset?.newPassword ||
              "New Password"}
          </label>
          <input
            type="password"
            value={password}
            id="newPassword"
            onChange={(e) => setPassword(e.target.value)}
            placeholder={
              translations[languageCode]?.passwordReset
                ?.newPasswordPlaceholder || "New Password"
            }
            required
            aria-required="true"
            aria-describedby="newPasswordHelp"
          />
          <small id="newPasswordHelp">
            {translations[languageCode]?.passwordReset?.enterNewPassword ||
              "Enter your new password"}
          </small>

          <label htmlFor="confirmPassword">
            {translations[languageCode]?.passwordReset?.confirmNewPassword ||
              "Confirm New Password"}
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={
              translations[languageCode]?.passwordReset
                ?.confirmPasswordPlaceholder || "Confirm New Password"
            }
            required
            id="confirmPassword"
            aria-required="true"
            aria-describedby="confirmPasswordHelp"
          />
          <Button
            variant="outline-info"
            className="btn-sm view-profile-btn"
            type="submit"
            aria-label={translations[languageCode]?.passwordReset?.submitButton || "Reset Password"}
          >
            {translations[languageCode]?.passwordReset?.submitButton ||
              "Reset Password"}
          </Button>
        </form>
      </div>
      {message && <AlertMessage key={alertKey} message={message} type={type} role="alert"
        aria-live="assertive"/>}
    </div>
  );
};

export default PasswordReset;
