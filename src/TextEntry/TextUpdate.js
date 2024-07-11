// TextUpdate.js
import React, { useState, useEffect, useRef } from "react";
import { Button } from "react-bootstrap";

const TextUpdate = ({ dialogId, initialText, onSaveSuccess, socketRef }) => {
  const [texty, setTexty] = useState("");
  const textAreaRef = useRef(null);

  useEffect(() => {
    // Focus the textarea and select the text after it has been auto-focused
    if (textAreaRef.current) {
      textAreaRef.current.focus();
    }
    setTexty(initialText);
  }, [dialogId, initialText]);

  const handleSave = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/submission-dialog/${dialogId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text_content: texty }),
    });

    if (response.ok) {
      const updatedPost = await response.json();
      // Emit postUpdated event to notify other clients
      socketRef.current.emit("postUpdated", {
        submissionId: updatedPost.submission_id,
        updatedPost,
      });

      // Call the onSaveSuccess callback to indicate that the save was successful
      onSaveSuccess();
    } else {
      console.error("Failed to update text content.");
    }
  };

  return (
    <div className="text-update">
      <textarea
        value={texty}
        onChange={(e) => setTexty(e.target.value)}
        className="form-control"
        onFocus={(e) => e.currentTarget.select()}
        ref={textAreaRef}
      />
      <Button variant="primary" onClick={handleSave}>
        Save
      </Button>
    </div>
  );
};

export default TextUpdate;
