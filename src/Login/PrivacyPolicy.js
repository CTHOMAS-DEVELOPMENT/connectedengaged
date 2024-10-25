import React from "react";
import translations from "./translations.json"; // Import your translations
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "react-bootstrap"; // Import the Button from react-bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
const PrivacyPolicy = ({ selectedLanguage }) => {
  const pageTranslations = translations[selectedLanguage]?.["privacyPolicy"] || {}; // Get privacy policy translations for selected language
  const navigate = useNavigate();
  const location = useLocation();
  const sectionStyle = {
    border: "2px solid #00bfff", // Light blue border
    borderRadius: "10px", // Rounded corners
    padding: "15px", // Inner spacing
    marginBottom: "20px", // Space between sections
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Raised shadow effect
    backgroundColor: "#fff", // White background
    textAlign: "left", // Align text to the left
    maxWidth: "800px", // Limit the width of the section
    margin: "0 auto", // Center align horizontally
    transition: "all 0.3s ease-in-out", // Smooth transition for hover or focus
  };
  const handleBackToBase = () => {
    if (location.state?.from === "login") {
      navigate("/", { state: { selectedLanguage } });
    } else if (location.state?.from === "register") {
      navigate("/register", { state: { selectedLanguage } });
    } else {
      // Default fallback, navigate to login if no previous state is available
      navigate("/", { state: { selectedLanguage } });
    }
  };
  return (
    <div className="privacy-policy-container" style={{ padding: "20px" }}>
      <h1 className="font-style-4">
        {pageTranslations.title || "Privacy Policy"}
      </h1>

      <section style={sectionStyle}>
        <h2>{pageTranslations.introductionTitle || "Introduction"}</h2>
        <p>
          {pageTranslations.introductionText ||
            "We are committed to protecting your personal information and your right to privacy. This Privacy Policy outlines how we collect, use, and protect your information when you use our app."}
        </p>
      </section>

      <section style={sectionStyle}>
        <h2>{pageTranslations.dataCollectionTitle || "Data We Collect"}</h2>
        <p>
          {pageTranslations.dataCollectionText ||
            "We collect your email address, profile information, and other essential details needed to provide the service."}
        </p>
        <p>
        {pageTranslations.dataCollectionText2}
        </p>
      </section>

      <section style={sectionStyle}>
        <h2>{pageTranslations.howWeUseDataTitle || "How We Use Your Data"}</h2>
        <p>
          {pageTranslations.howWeUseDataText ||
            "We use your data to provide our services, improve our app, and ensure your experience is as seamless as possible."}
        </p>
      </section>

      <section style={sectionStyle}>
        <h2>{pageTranslations.dataRetentionTitle || "Data Retention"}</h2>
        <p>
          {pageTranslations.dataRetentionText ||
            "We retain your personal data only for as long as necessary to fulfill the purposes outlined in this privacy policy. Your non-essential data will be deleted after two days."}
        </p>
      </section>

      <section style={sectionStyle}>
        <h2>{pageTranslations.rightsTitle || "Your Rights"}</h2>
        <p>
          {pageTranslations.rightsText ||
            "You have the right to access, modify, or delete your data at any time. If you have any concerns or questions, feel free to contact us."}
        </p>
      </section>

      <section style={sectionStyle}>
        <h2>{pageTranslations.consentTitle || "Consent"}</h2>
        <p>
          {pageTranslations.consentText ||
            "By using this app, you consent to our privacy policy and agree to its terms."}
        </p>
      </section>

      <footer>
        <p>
          {pageTranslations.contactInfo ||
            "If you have any questions or concerns regarding this Privacy Policy, please contact us at connectedengaged@gmail.com."}
        </p>
      </footer>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <Button variant="primary" onClick={handleBackToBase}>
          {pageTranslations.backToBase || "Back to base"}
        </Button>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
