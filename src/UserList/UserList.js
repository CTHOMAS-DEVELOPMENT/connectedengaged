import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import JSZip from "jszip";
import { useLocation, useNavigate } from "react-router-dom";
import translations from "./translations.json";
import InteractionTitles from "../InteractionTitles/InteractionTitles";
import ThumbProfileViewer from "./ThumbProfileViewer";
import ConnectionRequests from "./ConnectionRequests";
import ConnectionRequested from "./ConnectionRequested";
import ScrollingHelpText from "../system/ScrollingHelpText";
import FilterUsers from "./FilterUsers";
import { Button, Pagination, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { Trash, TrashFill } from "react-bootstrap-icons";
import { checkAuthorization } from "../system/authService"; // Ensure the path is correct
import AlertMessage from "../system/AlertMessage";

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [selectedUsernames, setSelectedUsernames] = useState([]);
  const [authError, setAuthError] = useState(false); // State for authorization error
  const [showFilter, setShowFilter] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showConnectionRequests, setShowConnectionRequests] = useState(true); // State to toggle connection requests visibility
  const [showRequestsFromOthers, setShowRequestsFromOthers] = useState(true);
  const [hoveredContactToBeDeleted, setHoveredContactToBeDeleted] =
    useState(null);
  const [connectionRequests, setConnectionRequests] = useState(0);
  const [requestsFromOthers, setRequestsFromOthers] = useState(0);
  const [refreshNeeded, setRefreshNeeded] = useState(false);
  const [showMessage, setShowMessage] = useState(true);
  const [shouldRefreshInteractions, setShouldRefreshInteractions] =
    useState(false);

  const [activeTab, setActiveTab] = useState("Interactions");
  const [lastSelectedUserId, setLastSelectedUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;
  let notificationson = false; //overide default
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(true);
  const [message, setMessage] = useState("");
  const [adminFace, setAdminFace] = useState("");
  const [type, setType] = useState("info");
  const [alertKey, setAlertKey] = useState(0);
  const [languageCode, setLanguageCode] = useState("en");
  const isLocal = process.env.REACT_APP_ENV === "local";
  const helpMessage =
    translations[languageCode]?.usersList?.helpMessage ||
    "No help message configured.";

  const navigate = useNavigate();
  const location = useLocation();
  const loggedInUserId = location.state ? location.state.userId : null;
  const socketRef = useRef(null);
  const toggleFilter = () => {
    setShowConnectionRequests(false);
    setShowFilter(!showFilter);
  };
  const deleteContactToBeDeleted = (id) => {
    fetch(`${process.env.REACT_APP_API_URL}/api/delete-connection/${id}`, {
      method: "DELETE", // Use the DELETE HTTP method
    })
      .then((response) => {
        if (!response.ok) {
          // If the server response is not OK, throw an error
          throw new Error("Network response was not ok");
        }
        return response.json(); // Assuming the server responds with JSON
      })
      .then((data) => {
        fetchConnectedUsers(); // Refresh the list to reflect the deletion
      })
      .catch((error) => {
        console.error("Error deleting connection:", error);
        // Optionally, update your UI to indicate the error to the user
      });
  };
  const handleInteractionsTabClick = () => {
    setActiveTab("Interactions");
  };

  const handleCommunicationCentreTabClick = () => {
    setActiveTab("Communication Centre");
  };
  const applyFilter = (filterCriteria) => {
    if (!user.id) {
      console.error("No user ID provided for filtering.");
      return;
    }

    // Assuming `user.id` is the ID of the logged-in user you want to pass to your backend
    fetch(`${process.env.REACT_APP_API_URL}/api/filter-users/${user.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(filterCriteria),
    })
      .then((response) => {
        if (!response.ok) {
          // If the server response is not OK, throw an error to catch it in the catch block
          throw new Error("Network response was not ok");
        }
        return response.json(); // Assuming the server responds with JSON
      })
      .then((data) => {
        // Handle the successful response here
        setSubmitSuccess(true);
        setShowConnectionRequests(true);
      })
      .catch((error) => {
        setSubmitSuccess(false);
        console.error("Error applying filter:", error);
        // Optionally, update your UI to indicate the error to the user
      });
    toggleFilter();
  };
  const handleToggleConnectionRequests = () => {
    //setShowConnectionRequests(!showConnectionRequests); // Toggle the visibility
    setShowConnectionRequests((prev) => !prev);
  };

  const handleToggleRequestsFromOthers = () => {
    //setShowRequestsFromOthers(!showRequestsFromOthers);
    setShowRequestsFromOthers((prev) => !prev);
  };

  const fetchConnectionRequests = () => {
    if (!user.id) return;

    fetch(`${process.env.REACT_APP_API_URL}/api/connection-requests/${user.id}`)
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
        setConnectionRequests(nonAdminRequests.length);
      })
      .catch((err) => {
        console.error("Error:", err);
      });
  };
  useEffect(() => {
    fetchConnectionRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(false);
    }, 2000); // Set the message to disappear after 2000 milliseconds (2 seconds)

    return () => clearTimeout(timer); // Clean up the timer
  }, []);
  useEffect(() => {
    if (refreshNeeded) {
      // Perform your refresh actions here
      fetchConnectedUsers(); // Example action: re-fetch connected users
      setShouldRefreshInteractions(true);
      // Optionally, reset other states or perform additional updates
      setRefreshNeeded(false); // Reset the refresh trigger
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshNeeded]); // This effect depends on `refreshNeeded`

  useEffect(() => {
    setShowConnectionRequests(false);
    setShowRequestsFromOthers(false);
  }, []);
  useEffect(() => {
    if (submitSuccess) {
      // Perform actions on success, e.g., show a success message, redirect, etc.
      setMessage(
        translations[languageCode]?.usersList?.connectionRequestsSuccess ||
          "Successfully sent connection requests!"
      );
      setType("info");
      setAlertKey((prevKey) => prevKey + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitSuccess]);
  useEffect(() => {
    if (loggedInUserId) {
      checkAuthorization(loggedInUserId).then((isAuthorized) => {
        if (!isAuthorized) {
          setAuthError(true); // Handle unauthorized access
        }
      });
    }
  }, [loggedInUserId, navigate]);
  useEffect(() => {
    fetchConnectedUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUserId, authError]);
  useEffect(() => {
    const socket = isLocal
      ? io(process.env.REACT_APP_BACKEND_HOST) // Development environment, no transport options needed
      : io(process.env.REACT_APP_BACKEND_HOST, {
          transports: ["websocket", "polling"], // Production environment, add WebSocket and polling options
        });
    socketRef.current = socket;
    socket.on("connect", () => {
      console.log("Socket connected ");
      socket.emit("register", { userId: loggedInUserId, submissionIds: [] });
    });
    socket.on("connections_change", (data) => {
      if (data.user_two_id === loggedInUserId) {
        fetchConnectedUsers();
        setMessage(
          translations[languageCode]?.usersList?.connectionRequestAccepted ||
            "A connection request has been accepted!"
        );
        setType("info");
        setAlertKey((prevKey) => prevKey + 1);
      }
      if (data.user_one_id === loggedInUserId) {
        fetchConnectedUsers();
        fetchConnectionRequests();
        setShowConnectionRequests(false);
      }
    });
    // Listen for new_engagement messages
    socket.on("new_engagement", (data) => {
      if (data.userIds.includes(loggedInUserId)) {
        fetchConnectedUsers();
        setMessage(
          translations[languageCode]?.usersList?.newEngagementMessage ||
            "A new engagement has been created!"
        );
        setType("info");
        setAlertKey((prevKey) => prevKey + 1);
        setShouldRefreshInteractions(true); // Add this line to trigger refresh
      }
    });
    // Added the connection_requests_change listener
    socket.on("connection_requests_change", (data) => {
      if (data.requested_id === loggedInUserId) fetchConnectionRequested();
    });

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loggedInUserId) {
      fetchConnectionRequested();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUserId]);
  const fetchConnectionRequested = () => {
    fetch(
      `${process.env.REACT_APP_API_URL}/api/connection-requested/${loggedInUserId}`
    )
      .then((response) => {
        if (!response.ok)
          throw new Error("Failed to fetch connection requests");
        return response.json();
      })
      .then((data) => {
        setRequestsFromOthers(data.length);
      })
      .catch((err) => {
        console.error("Error fetching connection requests:", err);
      });
  };
  const handleLogoutClick = () => {
    navigate("/"); // Update for v6
  };
  const handleCheckboxChange = (userId, username) => {
    // Update the selectedUserIds state
    setSelectedUserIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
        if (lastSelectedUserId === userId) {
          setLastSelectedUserId(null);
        }
      } else {
        newSet.add(userId);
        setLastSelectedUserId(userId);
      }
      return newSet;
    });
    // Clear the search input and hide the search bar
    setSearchTerm("");
    setShowSearch(false);
    // Update the selectedUsernames state
    setSelectedUsernames((prev) => {
      const index = prev.indexOf(username);
      if (index !== -1) {
        // Username already exists, remove it
        return [...prev.slice(0, index), ...prev.slice(index + 1)];
      } else {
        // Username does not exist, add it
        return [...prev, username];
      }
    });
  };

  const handleProfileClick = (selectedUserId, selectedUsername) => {
    navigate(`/userprofile/${selectedUserId}`, {
      state: {
        selectedUser: selectedUserId,
        loggedInUserId: loggedInUserId,
        selectedUsername: selectedUsername,
        languageCode: languageCode, // Pass the languageCode to UserProfile
      },
    });
  };

  const uploadZipFile = (file, userId) => {
    const formData = new FormData();

    formData.append("zipFile", file);
    formData.append("userId", userId);

    fetch(`${process.env.REACT_APP_API_URL}/api/build-interaction-from-files`, {
      method: "POST",
      body: formData,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Server responded with an error!");
        }
        return response.json();
      })
      .then((data) => {
        setRefreshNeeded(true);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) {
      setMessage(
        translations[languageCode]?.usersList?.noFileSelected ||
          "No file selected."
      );
      setType("error");
      setAlertKey((prevKey) => prevKey + 1);
      return;
    }

    // Check if file.type includes 'zip'
    if (file.type.indexOf("zip") === -1) {
      setMessage(
        translations[languageCode]?.usersList?.notZipArchive ||
          "File is not a ZIP archive."
      );
      setType("error");
      setAlertKey((prevKey) => prevKey + 1);
      event.target.value = null;
      return;
    }

    // Use JSZip to read the ZIP file
    JSZip.loadAsync(file)
      .then((zip) => {
        // Validate the contents of the ZIP file
        let isValid = true;
        let jsonFileCount = 0;

        Object.keys(zip.files).forEach((filename) => {
          if (filename.endsWith(".json")) {
            jsonFileCount += 1;
          } else if (!filename.match(/\.(jpg|jpeg|png)$/i)) {
            // If the file is not JSON or an image, mark as invalid
            isValid = false;
          }
        });

        if (jsonFileCount !== 1) {
          isValid = false; // There must be exactly one JSON file
        }

        if (!isValid) {
          setMessage(
            translations[languageCode]?.usersList?.invalidZipContents ||
              "ZIP archive contents are invalid."
          );
          setType("error");
          setAlertKey((prevKey) => prevKey + 1);
          event.target.value = null;
          return;
        }

        // Proceed to process the ZIP file (e.g., extract and display contents)
        uploadZipFile(file, loggedInUserId);
        // After processing the file, clear the input to allow for new uploads
        event.target.value = null;
      })
      .catch((err) => {
        console.error("Error reading ZIP file:", err);
        // Clear the file input in case of an error as well
        event.target.value = null;
      });
  };

  const handleUpdateProfileClick = (loggedInUserId) => {
    navigate("/profile", { state: { userId: loggedInUserId } });
  };
  const handleNewInteraction = () => {
    navigate("/newsubmission", {
      state: {
        selectedUserIds: Array.from(selectedUserIds),
        userId: loggedInUserId,
        languageCode: languageCode, // Pass the languageCode to NewSubmission
      },
    });
  };

  const informConnectionSuccess = async (
    selectedUserIds,
    selectedUserNames
  ) => {
    // Ensure both arrays have the same length
    if (selectedUserIds.length !== selectedUserNames.length) {
      console.error(
        "Selected user IDs and names arrays do not match in length."
      );
      return;
    }

    if (!notificationson) {
      return;
    }

    const associatedUsers = selectedUserIds.map((id, index) => ({
      id: id,
      username: selectedUserNames[index],
    }));

    try {
      for (let i = 0; i < associatedUsers.length; i++) {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/api/notify_offline_users`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "connection_accepted",
              title: "", // No title is needed for connection acceptance
              loggedInUserName: user.username,
              associatedUsers: [associatedUsers[i]], // Send one user at a time
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Notification sent successfully:", result);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const enableSelectedConnections = async (
    selectedUserIds,
    selectedUserNames
  ) => {
    setShowRequestsFromOthers(false);

    // Prepare the data to be sent in the request body
    const requestData = { selectedUserIds };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/enable-selected-connections/${loggedInUserId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        }
      );

      if (!response.ok) {
        // If the server response is not OK, throw an error
        throw new Error("Network response was not ok");
      }

      await response.json(); // Assuming the server responds with JSON

      // Handle the successful response here
      setMessage(
        translations[languageCode]?.usersList?.connectionsEnabledSuccess ||
          "Connections successfully enabled"
      );
      setType("error");
      setAlertKey((prevKey) => prevKey + 1);

      try {
        await informConnectionSuccess(selectedUserIds, selectedUserNames);
      } catch (error) {
        console.error("Error in informConnectionSuccess:", error);
      }

      fetchConnectedUsers();
      // You may want to update your component's state based on the successful operation
      // For example, clear selectedUserIds or show a success message
    } catch (error) {
      console.error("Error enabling connections:", error);
      // Optionally, update your UI to indicate the error to the user
    }
  };

  const fetchConnectedUsers = () => {
    if (!authError && loggedInUserId) {
      fetch(`${process.env.REACT_APP_API_URL}/api/connected/${loggedInUserId}`)
        .then((response) => response.json())
        .then((data) => {
          //console.log("Fetched connected users:", data);

          const loggedInUser = data.find((user) => user.id === loggedInUserId);
          setLanguageCode(loggedInUser.language_code);
          setAdminFace(loggedInUser.admin_face);
          const dbUserlist = data.filter((user) => user.id !== loggedInUserId);
          setUser(loggedInUser);
          setUsers(dbUserlist);
        })
        .catch((error) => console.error("Error fetching users:", error));
    }
  };
  const showConnectRequests = (count) => {
    setConnectionRequests(count);
  };
  const showRequestsOfOthers = (count) => {
    setRequestsFromOthers(count);
  };

  if (authError) {
    return (
      <div>
        Unauthorized access. Please <a href="/">log in</a>.
      </div>
    );
  }
  const svgStyle = {
    position: "absolute",
    left: "-40px",
    top: "50%",
    transform: "translateY(-50%)",
    animation: "float 2s ease-in-out infinite",
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Search filter logic
  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedUsers = searchTerm.length >= 3 ? filteredUsers : currentUsers;
  if (!languageCode) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      {showMessage && (
        <div className="message-box" role="status" aria-live="polite">
          {translations[languageCode]?.usersList?.afterLoginMessage ||
            "After login landing page"}
        </div>
      )}

      <div className="button-container" aria-label="User navigation">
        <Button
          variant="danger"
          onClick={handleLogoutClick}
          className="logout-button"
          aria-label={
            translations[languageCode]?.usersList?.logoutText || "Logout"
          }
        >
          {translations[languageCode]?.usersList?.logoutText || "Logout"}{" "}
          {user ? user.username : ""}?
        </Button>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "20px",
          }}
        >
          <nav>
            <Button
              variant={activeTab === "Interactions" ? "info" : "outline-info"}
              onClick={handleInteractionsTabClick}
              aria-label={
                activeTab === "Interactions"
                  ? translations[languageCode]?.usersList
                      ?.engagementButtonActive || "Engagement button is active"
                  : translations[languageCode]?.usersList
                      ?.engagementButtonInactive ||
                    "Engagement button is inactive"
              }
            >
              {translations[languageCode]?.usersList?.engagementsTab ||
                "Engagements"}
            </Button>

            <Button
              variant={
                activeTab === "Communication Centre" ? "info" : "outline-info"
              }
              onClick={handleCommunicationCentreTabClick}
              aria-label={
                activeTab === "Communication Centre"
                  ? translations[languageCode]?.usersList
                      ?.connectionCentreActive || "Connection Centre is active"
                  : translations[languageCode]?.usersList
                      ?.connectionCentreInActive ||
                    "Connection Centre is inactive"
              }
            >
              {translations[languageCode]?.usersList?.connectionsTab ||
                "Connections"}
            </Button>

            <Button
              variant="outline-info"
              onClick={() => handleUpdateProfileClick(user.id)}
              aria-label={
                activeTab === "Communication Centre"
                  ? translations[languageCode]?.usersList
                      ?.connectionCentreActive || "Connection Centre is active"
                  : translations[languageCode]?.usersList
                      ?.connectionCentreInActive ||
                    "Connection Centre is inactive"
              }
            >
              {translations[languageCode]?.usersList?.profileButton ||
                "Profile"}
            </Button>
          </nav>
        </div>
        {activeTab === "Communication Centre" && (
          <section
            className="section-container"
            aria-labelledby="connection-centre-title"
          >
            <h2 id="connection-centre-title" className="font-style-4">
              {translations[languageCode]?.usersList?.connectionCentreTitle ||
                "Connection Centre"}
            </h2>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <ScrollingHelpText message={helpMessage} width="400px" />
            </div>
            {showSearch && (
              <Form.Group controlId="search">
                <Form.Control
                  type="text"
                  placeholder={
                    translations[languageCode]?.usersList?.searchPlaceholder ||
                    "Search"
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label={
                    translations[languageCode]?.usersList?.searchPlaceholder ||
                    "Search"
                  }
                />
              </Form.Group>
            )}{" "}
            <div className="users-list-container">
              <ul className="no-bullet">
                {displayedUsers.map((user) => (
                  <li key={user.id} className="user-item">
                    <span
                      className="user-name font-style-4"
                      aria-label={`${translations[languageCode]?.filterUsers?.usernamePlaceholder}: ${user.username}`}
                    >
                      {user.username}
                    </span>
                    <div
                      className="user-info-container center-elements"
                      role="region"
                    >
                      <div className="center-elements">
                        <div
                          style={{
                            position: "relative",
                            display: "inline-block",
                          }}
                        >
                          {lastSelectedUserId !== user.id && (
                            <svg width="30" height="30" style={svgStyle}>
                              <polygon points="0,0 30,15 0,30" fill="blue" />
                            </svg>
                          )}
                          <input
                            type="checkbox"
                            onChange={() =>
                              handleCheckboxChange(user.id, user.username)
                            }
                            checked={selectedUserIds.has(user.id)}
                            className="user-checkbox"
                          />
                        </div>
                        {lastSelectedUserId === user.id && (
                          <Button
                            variant="outline-info"
                            className="btn-sm btn-wrap"
                            onClick={handleNewInteraction}
                            aria-label={`${
                              translations[languageCode]?.usersList
                                ?.createNewEngagementWith ||
                              "Create New Engagement with"
                            } ${selectedUsernames.join(" ")}`}
                          >
                            {translations[languageCode]?.usersList
                              ?.createNewEngagementWith ||
                              "Create New Engagement with"}{" "}
                            {selectedUsernames.join(" ")}{" "}
                            {selectedUsernames.length === 1
                              ? translations[languageCode]?.usersList
                                  ?.addOtherUsersHint ||
                                "(Add other users by checking their box)"
                              : ""}
                          </Button>
                        )}
                      </div>
                    </div>
                    {/*999
                    
                    */}
                    {parseInt(process.env.REACT_APP_SYSTEM_ADMIN_ID) ===
                      user.id &&
                      adminFace && (
                        <div
                          className="thumb-profile-viewer"
                          role="img"
                          aria-label={
                            translations[languageCode]?.usersList?.adminFace ||
                            "Admin Face"
                          }
                        >
                          <img
                            src={adminFace}
                            alt={
                              translations[languageCode]?.usersList
                                ?.adminFace || "Admin Face"
                            }
                          />
                        </div>
                      )}
                    {parseInt(process.env.REACT_APP_SYSTEM_ADMIN_ID) ===
                      user.id &&
                      !adminFace && (
                        <img src={"/admins/file-admin.JPEG"} alt={
                          translations[languageCode]?.usersList?.adminFace ||
                          "Admin Face"
                        } />
                      )}
                    {parseInt(process.env.REACT_APP_SYSTEM_ADMIN_ID) !==
                      user.id && (
                      <>
                        <div
                          className="thumb-profile-viewer"
                          role="img"
                          aria-label={`${
                            translations[languageCode]?.usersList
                              ?.profilePictureOf || "Profile picture of"
                          } ${user.username}`}
                        >
                          <ThumbProfileViewer userId={user.id} />
                        </div>

                        <Button
                          variant="outline-info"
                          className="btn-sm"
                          onClick={() =>
                            handleProfileClick(user.id, user.username)
                          }
                          aria-label={`${
                            translations[languageCode]?.usersList
                              ?.viewProfile || "View Profile"
                          }}: ${user.username}`}
                        >
                          {translations[languageCode]?.usersList?.viewProfile ||
                            "View Profile"}
                        </Button>

                        <Button
                          variant="danger"
                          className="btn-sm"
                          onClick={() =>
                            deleteContactToBeDeleted(user.connection_id)
                          }
                          onMouseEnter={() =>
                            setHoveredContactToBeDeleted(user.connection_id)
                          }
                          onMouseLeave={() =>
                            setHoveredContactToBeDeleted(null)
                          }
                          aria-label={`${
                            translations[languageCode]?.usersList
                              ?.deleteConnectionWith || "Delete Connection with"
                          } ${user.username}`}
                        >
                          {hoveredContactToBeDeleted === user.connection_id ? (
                            <TrashFill size={25} />
                          ) : (
                            <Trash size={25} />
                          )}
                        </Button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              <Pagination
                aria-label={
                  translations[languageCode]?.usersList?.userPagination ||
                  "User pagination"
                }
              >
                {Array.from(
                  { length: Math.ceil(users.length / usersPerPage) },
                  (_, index) => (
                    <Pagination.Item
                      key={index + 1}
                      active={index + 1 === currentPage}
                      onClick={() => paginate(index + 1)}
                      aria-current={
                        index + 1 === currentPage ? "page" : undefined
                      }
                    >
                      {index + 1}
                    </Pagination.Item>
                  )
                )}
              </Pagination>
            </div>
            {message && (
              <AlertMessage
                key={alertKey}
                message={message}
                type={type}
                role="alert"
                aria-live="assertive"
              />
            )}
            <div className="button_tower">
              <Button
                style={{ backgroundColor: "white" }}
                variant="outline-info"
                className="btn-sm"
                onClick={toggleFilter}
                aria-label={
                  translations[languageCode]?.usersList
                    ?.replaceConnectionRequestsButton ||
                  "Replace Your Connection Requests"
                }
              >
                {translations[languageCode]?.usersList
                  ?.replaceConnectionRequestsButton ||
                  "Replace Your Connection Requests"}
              </Button>
              {showFilter && (
                <FilterUsers
                  applyFilter={applyFilter}
                  closeWindow={toggleFilter}
                  languageCode={languageCode}
                />
              )}
              <Button
                style={{ backgroundColor: "white" }}
                variant="outline-info"
                className="btn-sm"
                onClick={handleToggleConnectionRequests} // Use this handler to toggle the visibility
                aria-expanded={showConnectionRequests}
              >
                {showConnectionRequests
                  ? translations[languageCode]?.usersList
                      ?.hideConnectionRequests ||
                    "Hide Your Connection Requests"
                  : `${
                      translations[languageCode]?.usersList
                        ?.showConnectionRequests ||
                      "Show Your Connection Requests"
                    } (${connectionRequests})`}
              </Button>
              {showConnectionRequests && (
                <ConnectionRequests
                  userId={loggedInUserId}
                  showConnectRequests={showConnectRequests}
                  languageCode={languageCode}
                />
              )}
              <div style={{ position: "relative", display: "inline-block" }}>
                {!showRequestsFromOthers && requestsFromOthers > 0 && (
                  <svg width="30" height="30" style={svgStyle}>
                    <polygon points="0,0 30,15 0,30" fill="blue" />
                  </svg>
                )}
                <Button
                  variant="outline-info"
                  className="btn-sm"
                  onClick={handleToggleRequestsFromOthers}
                  style={{ backgroundColor: "white" }}
                  aria-expanded={showRequestsFromOthers}
                  aria-controls="requests-from-others"
                >
                  {showRequestsFromOthers
                    ? translations[languageCode]?.usersList
                        ?.hideRequestsFromOthers ||
                      "Hide Connection Requests from Others"
                    : `${
                        translations[languageCode]?.usersList
                          ?.showRequestsFromOthers ||
                        "Show Connection Requests from Others"
                      } (${requestsFromOthers})`}
                </Button>

                {showRequestsFromOthers && (
                  <ConnectionRequested
                    userId={loggedInUserId}
                    onEnableSelectedConnections={enableSelectedConnections}
                    showRequestsOfOthers={showRequestsOfOthers}
                    languageCode={languageCode}
                    id="requests-from-others"
                  />
                )}
              </div>
            </div>
          </section>
        )}
      </div>
      {activeTab === "Interactions" && (
        <div className="section-container center-interaction-elements">
          <h2 className="font-style-4">
            {translations[languageCode]?.usersList?.engagementsTitle ||
              "Engagements"}
          </h2>

          <div>
            <input
              type="file"
              id="fileInput"
              style={{ display: "none" }} // Hide the file input, will be triggered by a button
              onChange={handleFileSelect}
              accept=".zip"
            />
            <Button
              style={{ backgroundColor: "white" }}
              variant="outline-info"
              onClick={() => document.getElementById("fileInput").click()}
            >
              {translations[languageCode]?.usersList?.loadEngagementButton ||
                "Load Previously Saved Engagement"}
            </Button>
          </div>
          <InteractionTitles
            loggedInUserId={loggedInUserId}
            shouldRefreshInteractions={shouldRefreshInteractions}
            resetRefreshTrigger={() => setShouldRefreshInteractions(false)}
            languageCode={languageCode}
          />
        </div>
      )}
    </div>
  );
};

export default UsersList;
