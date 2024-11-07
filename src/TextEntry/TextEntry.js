import React, { useState } from "react";
import { Button, Spinner } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import AlertMessage from "../system/AlertMessage";
import { Rocket, RocketFill } from "react-bootstrap-icons";
import translations from "./translations.json"; // Adjust the path as necessary

const TextEntry = ({ userId, submissionId, onPostSubmit, languageCode = "en" }) => {
  const [textContent, setTextContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [alertKey, setAlertKey] = useState(0);

  const pageTranslations = translations[languageCode]?.textEntry || {};

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!textContent.trim()) {
      setMessage(pageTranslations.emptyTextError || "Please enter some text");
      setType("error");
      setAlertKey((prevKey) => prevKey + 1);
      return;
    }
    setIsSubmitting(true); // Set submitting state to true
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/${submissionId}/text-entry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, textContent }), // Including userId in the request body
      });

      const data = await response.json();
      if (response.ok) {
        setTextContent("");
        if (onPostSubmit) {
          onPostSubmit(); // Trigger the callback to re-fetch posts
        }
      } else {
        throw new Error(data.message || pageTranslations.submitError || "Error submitting text");
      }
    } catch (error) {
      console.error("Error submitting text:", error);
      setMessage(pageTranslations.submitError || "Error submitting text");
      setType("error");
      setAlertKey((prevKey) => prevKey + 1);
    } finally {
      setIsSubmitting(false); // Reset submitting state regardless of the outcome
    }
  };

  return (
    <div className="text-entry">
      <form onSubmit={handleSubmit} aria-labelledby="text-entry-label">
      <div id="text-entry-label" className="visually-hidden">
        {pageTranslations.textEntryForm || "Text Entry Form"}
      </div>
        <div className="text-input-and-button">
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder={pageTranslations.placeholder || "What's on your mind?"}
            disabled={isSubmitting} // Disable textarea while submitting
            aria-label={pageTranslations.placeholder || "What's on your mind?"}

          />

          <Button
            type="submit"
            variant="outline-info"
            className="btn-icon"
            onMouseEnter={() => setIsImageHovered(true)}
            onMouseLeave={() => setIsImageHovered(false)}
            disabled={isSubmitting} 
            aria-label={isSubmitting ? pageTranslations.submitting || "Submitting" : pageTranslations.submitYourPost || "Submit your post"}

          >
            {isSubmitting ? (
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
              />
            ) : isImageHovered ? (
              <RocketFill size={25} />
            ) : (
              <Rocket size={25} />
            )}
          </Button>
          {message && <AlertMessage key={alertKey} message={message} type={type} role="alert" aria-live="assertive" />}
          </div>
      </form>
    </div>
  );
};

export default TextEntry;
