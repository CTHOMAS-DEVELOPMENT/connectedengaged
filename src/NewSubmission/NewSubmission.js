import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const NewSubmission = () => {
  const [title, setTitle] = useState("");
  const maxLength = 60; // Maximum length of characters allowed

  const location = useLocation();
  const loggedInUserId = location.state?.userId;
  const selectedUser = location.state?.selectedUser;
  const selectedUserIds = location.state?.selectedUserIds;
  const navigate = useNavigate();

  const handleBackToMessagesClick = () => {
    navigate("/userlist", { state: { userId: loggedInUserId } }); // Update for v6
  };

  const handleSave = () => {
    let userIds = [loggedInUserId]; // Start with logged-in user

    // If selectedUserIds is populated (and is an array), add it to userIds;
    // otherwise, add selectedUser (if it's not null)
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

    // POST request to backend to save data
    fetch(`${process.env.REACT_APP_API_URL}/api/user_submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submissionData),
    })
      .then((response) => {
        if (response.ok) {
          return response.json(); // Parse JSON response
        } else {
          throw new Error("Submission failed");
        }
      })
      .then((data) => {
        navigate("/feed", {
          state: {
            submissionId: data.id,
            userId: data.user_id,
            title: data.title,
            selectedUser: selectedUser,
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
        Back to messages
      </Button>{" "}
      <h2 className="font-style-4">Create New Submission</h2>
      <div style={{ position: "relative", display: "inline-block" }}>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Title"
          maxLength={maxLength} // Limit to 60 characters
          style={{ paddingRight: "40px" }} // Add padding to make space for the counter
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
        Save
      </Button>{" "}
    </div>
  );
};

export default NewSubmission;
