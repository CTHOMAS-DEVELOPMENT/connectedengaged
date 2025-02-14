import React from "react";
import { Button } from "react-bootstrap";
import { Telephone } from "react-bootstrap-icons";
import { extractFilename } from "../system/utils";
import translations from "./translations.json";
const LiveCallCentre = ({ users, callAction, languageCode = "en" }) => {
  const containerStyle = {
    backgroundColor: "white",
    borderRadius: "15px",
    padding: "20px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)", // Optional: add a subtle shadow for depth
    maxWidth: "500px",
    margin: "auto",
  };

  const imageStyle = {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    marginRight: "10px",
    objectFit: "cover",
  };

  return (
    <div style={containerStyle}>
      <h3 className="font-style-4">
        {translations[languageCode]?.LiveCallCentre?.title ||
          "Live Call Centre"}
      </h3>

      <ul style={{ paddingLeft: 0, listStyleType: "none" }}>
        {users.map((user) => (
          <li
            key={user.id}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            {/* Using the environment variables to generate the correct image path */}
            <img
              src={`${process.env.REACT_APP_IMAGE_HOST}/${
                process.env.REACT_APP_IMAGE_FOLDER
              }/thumb-${extractFilename(user.profile_picture)}`}
              alt={user.username}
              style={imageStyle}
            />
            <span>{user.username}</span>
            {user.isActive ? (
              <Button
                variant="outline-info"
                className="btn-icon"
                style={{ marginLeft: "auto" }}
                onClick={() => callAction(user.id, "Call")}
              >
                <Telephone size={25} />
              </Button>
            ) : (
              <Button
                variant="outline-info"
                className="btn-sm"
                style={{ marginLeft: "auto" }}
                onClick={() => callAction(user.id, "Schedule")}
              >
                {translations[languageCode]?.LiveCallCentre?.schedule ||
                  "Schedule"}
              </Button>
            )}
          </li>
        ))}
      </ul>
      <Button
        variant="outline-info"
        className="btn-sm"
        onClick={() => callAction(null, "Cancel")}
      >
        {translations[languageCode]?.LiveCallCentre?.cancel || "Cancel"}
      </Button>
    </div>
  );
};

export default LiveCallCentre;
