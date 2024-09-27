import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import ThumbProfileViewer from "./ThumbProfileViewer";
import AlertMessage from "../system/AlertMessage";
import { Button } from "react-bootstrap";
import { Trash, TrashFill } from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  version1Orientations,
  version1Gender,
  version1Hobbies,
  version1Keys,
} from "../RegistrationProfileCreation/scopedCollections";
import FloatsMyBoat from "../RegistrationProfileCreation/FloatsMyBoat.js";
import Gender from "../RegistrationProfileCreation/Gender.js";
import Orientation from "../RegistrationProfileCreation/Orientation.js";
import Hobbies from "../RegistrationProfileCreation/Hobbies.js";
import translations from "./translations.json";

const ConnectionRequests = ({
  userId,
  showConnectRequests,
  languageCode = "en",
}) => {
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredMyContactRequestId, setHoveredMyContactRequestId] =
    useState(null);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [alertKey, setAlertKey] = useState(0);
  const [error, setError] = useState("");
  const isLocal = process.env.REACT_APP_ENV === "local";
  const getIndexOfValue = (arrayOf, value) => {
    return arrayOf.indexOf(value);
  };
  const deleteAllRequests = () => {
    // Ensure we have a userId before making the API call
    if (!userId) return;

    // Call the new endpoint to delete all requests from the user
    fetch(
      `${process.env.REACT_APP_API_URL}/api/delete-requests-from-me/${userId}`,
      {
        method: "DELETE", // Make sure to use the correct HTTP method
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => {
        if (!response.ok) {
          // If the server response is not OK, throw an error
          throw new Error("Network response was not ok");
        }
        return response.json(); // Assuming the server responds with JSON
      })
      .then((data) => {
        // Log the success message from the server
        setType("info");
        setMessage(data.message);
        setAlertKey((prevKey) => prevKey + 1);
        // Refresh the list of connection requests
        fetchConnectionRequests();
      })
      .catch((error) => {
        setType("error");
        setMessage("Error deleting all requests:" + error);
        setAlertKey((prevKey) => prevKey + 1);
      });
  };

  const deleteMyContactRequestId = (id) => {
    fetch(
      `${process.env.REACT_APP_API_URL}/api/delete-from-connection-requests/${id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete connection request");
        }
        return response.json();
      })
      .then((data) => {
        setType("info");
        setMessage("Connection request successfully deleted:" + data);
        setAlertKey((prevKey) => prevKey + 1);
        // Call fetchConnectionRequests to refresh the list
        fetchConnectionRequests();
      })
      .catch((err) => {
        setType("error");
        setMessage("Error:" + err);
        setAlertKey((prevKey) => prevKey + 1);
      });
  };

  const fetchConnectionRequests = () => {
    if (!userId) return;

    setIsLoading(true);
    fetch(`${process.env.REACT_APP_API_URL}/api/connection-requests/${userId}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch connection requests");
        }
        return response.json();
      })
      .then((data) => {
        // Filter out pseudo admin users
        const nonAdminRequests = data.filter(
          (request) => !request.email.endsWith("@system.com")
        );

        showConnectRequests(nonAdminRequests.length);
        setConnectionRequests(nonAdminRequests);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error:", err);
        setError(err.message);
        setIsLoading(false);
      });
  };
  useEffect(() => {
    // const socket = io(process.env.REACT_APP_BACKEND_HOST, {
    //   transports: ['websocket', 'polling'] // Add this to enable both WebSocket and polling
    // });
    const socket = isLocal
      ? io(process.env.REACT_APP_BACKEND_HOST) // Development environment, no transport options needed
      : io(process.env.REACT_APP_BACKEND_HOST, {
          transports: ["websocket", "polling"], // Production environment, add WebSocket and polling options
        });
    // Added the connection_requests_change listener
    socket.on("connection_requests_change", (data) => {
      if (data.requested_id === userId) fetchConnectionRequests();
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    fetchConnectionRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (isLoading) return <div>Loading connection requests...</div>;
  if (error) return <div>Error loading connection requests: {error}</div>;

  return (
    <div className="connection-requests-container">
      <h2 className="font-style-4">
        {translations[languageCode]?.connectionRequests?.title ||
          "Connection Requests"}
      </h2>
      {connectionRequests.length > 0 && (
        <Button
          variant="danger"
          onClick={deleteAllRequests}
          className="logout-button"
        >
          {translations[languageCode]?.connectionRequests
            ?.deleteAllRequestsButton || "Delete All My Requests"}
        </Button>
      )}
      {connectionRequests.length > 0 ? (
        <ul className="connection-requests-list">
          {connectionRequests.map((request) => (
            <li key={request.id} className="connection-request-item">
              <div className="connection-request-text">
                <div className="left-side-listed-profile-section">
                  <span className="font-style-4">{request.username}</span>
                  <div className="thumb-profile-viewer">
                    <ThumbProfileViewer userId={request.requested_id} />
                  </div>
                  <Button
                    variant="danger"
                    className="system-small-button-wrapper"
                    onClick={() => deleteMyContactRequestId(request.id)}
                    onMouseEnter={() =>
                      setHoveredMyContactRequestId(request.id)
                    }
                    onMouseLeave={() => setHoveredMyContactRequestId(null)}
                  >
                    {hoveredMyContactRequestId === request.id ? (
                      <TrashFill size={25} />
                    ) : (
                      <Trash size={25} />
                    )}
                  </Button>
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <Gender
                      onSelectGender={() => {}}
                      selected={getIndexOfValue(version1Gender, request.sex)}
                      defaultSize={100}
                      noChexbox={true}
                    />
                    <Orientation
                      onSelectOrientation={() => {}}
                      selected={getIndexOfValue(
                        version1Orientations,
                        request.sexual_orientation
                      )}
                      defaultSize={100}
                      noChexbox={true}
                    />
                    <Hobbies
                      onSelectHobby={() => {}}
                      selected={getIndexOfValue(
                        version1Hobbies,
                        request.hobbies
                      )}
                      defaultSize={100}
                      noTitle={true}
                      noChexbox={true}
                    />
                    <FloatsMyBoat
                      onSelectCarousel={() => {}}
                      selectedCarousel={getIndexOfValue(
                        version1Keys,
                        request.floats_my_boat
                      )}
                      defaultSize={100}
                      noChexbox={true}
                    />
                  </div>
                  <textarea
                    readOnly
                    className="about-you-textarea"
                    value={
                      request.about_you
                        ? request.about_you
                        : request.username + " has not entered anything yet.."
                    }
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>
          {translations[languageCode]?.connectionRequests?.noRequestsFound ||
            "No connection requests found."}
        </p>
      )}
      {message && <AlertMessage key={alertKey} message={message} type={type} />}
    </div>
  );
};

export default ConnectionRequests;
