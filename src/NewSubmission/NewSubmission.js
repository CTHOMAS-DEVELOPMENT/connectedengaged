import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import translations from './translations.json'; // Adjust the path if necessary
import "bootstrap/dist/css/bootstrap.min.css";

const NewSubmission = () => {
  const [title, setTitle] = useState("");
  const maxLength = 60; // Maximum length of characters allowed

  const location = useLocation();
  const loggedInUserId = location.state?.userId;
  const selectedUser = location.state?.selectedUser;
  const selectedUserIds = location.state?.selectedUserIds;
  const languageCode = location.state?.languageCode || 'en'; // Default to 'en' if not provided
  const navigate = useNavigate();

  const handleBackToMessagesClick = () => {
    navigate("/userlist", { state: { userId: loggedInUserId } });
  };

  const handleSave = () => {
    let userIds = [loggedInUserId];

    if (Array.isArray(selectedUserIds) && selectedUserIds.length > 0) {
      userIds = [...userIds, ...selectedUserIds];
    } else if (selectedUser) {
      userIds.push(selectedUser);
    }

    const submissionData = {
      user_id: loggedInUserId,
      title: title,
      userIds: userIds,
    };

    fetch(`${process.env.REACT_APP_API_URL}/api/user_submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submissionData),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(translations[languageCode]?.newSubmission?.submissionFailed || "Submission failed");
        }
      })
      .then((data) => {
        navigate("/feed", {
          state: {
            submissionId: data.id,
            userId: data.user_id,
            title: data.title,
            selectedUser: selectedUser,
            languageCode: languageCode, // Pass the languageCode to the FeedScreen
          },
        });
      })
      .catch((error) => {
        console.error("Error saving submission:", error);
      });
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  return (
    <div>
      <Button
        style={{ backgroundColor: "white" }}
        variant="outline-info"
        className="btn-sm"
        onClick={handleBackToMessagesClick}
      >
        {translations[languageCode]?.newSubmission?.backToMessages || "Back to messages"}
      </Button>
      <h2 className="font-style-4">
        {translations[languageCode]?.newSubmission?.createNewSubmission || "Create New Submission"}
      </h2>
      <div style={{ position: "relative", display: "inline-block" }}>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder={translations[languageCode]?.newSubmission?.titlePlaceholder || "Title"}
          maxLength={maxLength}
          style={{ paddingRight: "40px" }}
        />
        <span style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)" }}>
          {maxLength - title.length}
        </span>
      </div>
      <Button
        variant="outline-info"
        className="btn-sm"
        style={{ backgroundColor: "white", marginLeft: "10px" }}
        onClick={handleSave}
        disabled={title.length < 3}
      >
        {translations[languageCode]?.newSubmission?.save || "Save"}
      </Button>
    </div>
  );
};

export default NewSubmission;
