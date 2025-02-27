import React from "react";
import translations from "./translations.json"; // Using the same translations file as PrivacyPolicy
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "react-bootstrap"; // Import Bootstrap Button
import "bootstrap/dist/css/bootstrap.min.css";

const ChildSafety = ({ selectedLanguage, showBackButton = true }) => {
  const pageTranslations = translations[selectedLanguage]?.["childSafety"] || {}; // Fetch translations for Child Safety
  const navigate = useNavigate();
  const location = useLocation();

  const sectionStyle = {
    border: "2px solid #ff4500", // Orange border for differentiation
    borderRadius: "10px",
    padding: "15px",
    marginBottom: "20px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
    backgroundColor: "#fff",
    textAlign: "left",
    maxWidth: "800px",
    margin: "0 auto",
    transition: "all 0.3s ease-in-out",
  };

  const handleBackToBase = () => {
    if (location.state?.from === "login") {
      navigate("/", { state: { selectedLanguage } });
    } else if (location.state?.from === "register") {
      navigate("/register", { state: { selectedLanguage } });
    } else {
      navigate("/", { state: { selectedLanguage } });
    }
  };

  return (
    <div className="child-safety-container" style={{ padding: "20px" }}>
      <h1 className="font-style-4">
        {pageTranslations.title || "Child Safety Standards"}
      </h1>

      <section style={sectionStyle}>
        <h2>{pageTranslations.introductionTitle || "Introduction"}</h2>
        <p>
          {pageTranslations.introductionText ||
            "We are committed to ensuring a safe and respectful environment for all users. Our child safety standards align with global protection guidelines to prevent exploitation and misuse."}
        </p>
      </section>

      <section style={sectionStyle}>
        <h2>{pageTranslations.reportingTitle || "Reporting Unsafe Content"}</h2>
        <p>
          {pageTranslations.reportingText ||
            "Users can report inappropriate content directly within the app. Our moderation team will review all reports and take necessary actions."}
        </p>
      </section>

      <section style={sectionStyle}>
        <h2>{pageTranslations.userModerationTitle || "User Moderation"}</h2>
        <p>
          {pageTranslations.userModerationText ||
            "All user-generated content is subject to moderation. We employ automated and manual reviews to prevent harmful interactions."}
        </p>
      </section>

      <section style={sectionStyle}>
        <h2>{pageTranslations.safetyMeasuresTitle || "Safety Measures"}</h2>
        <p>
          {pageTranslations.safetyMeasuresText ||
            "We implement strict verification processes, content moderation, and user behavior monitoring to safeguard all participants."}
        </p>
      </section>

      <section style={sectionStyle}>
        <h2>{pageTranslations.legalComplianceTitle || "Legal Compliance"}</h2>
        <p>
          {pageTranslations.legalComplianceText ||
            "Our platform complies with child safety regulations and global policies to protect minors and prevent exploitation."}
        </p>
      </section>

      <footer>
        <p>
          {pageTranslations.contactInfo ||
            "For concerns related to child safety, contact us at connectedengaged@gmail.com."}
        </p>
      </footer>

      {showBackButton && (
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Button variant="primary" onClick={handleBackToBase}>
            {pageTranslations.backToBase || "Back to Base"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ChildSafety;
