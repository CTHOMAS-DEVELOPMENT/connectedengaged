import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AlertMessage from "../system/AlertMessage";
import io from "socket.io-client";
import PhotoUploadAndEdit from "../PhotoUploadAndEdit/PhotoUploadAndEdit";
import TextUpdate from "../TextEntry/TextUpdate";
import TextEntry from "../TextEntry/TextEntry";
import LiveCallCentre from "./LiveCallCentre";
import {
  extractFilename,
  getThumbnailPath,
  findThumbImage,
} from "../system/utils";
import Scheduler from "./Scheduler";
import { Button, Spinner } from "react-bootstrap";
import {
  ArrowLeftCircleFill,
  ArrowDownCircleFill,
  ArrowUpCircleFill,
  Search,
  Image,
  ImageFill,
  Trash,
  TrashFill,
  MicFill,
  MicMuteFill,
  EnvelopePlus,
  EnvelopeSlash,
  EnvelopePlusFill,
  EnvelopeSlashFill,
  Telephone,
  TelephoneFill,
} from "react-bootstrap-icons";
import "bootstrap/dist/css/bootstrap.min.css";
import { checkAuthorization } from "../system/authService";
import Peer from "simple-peer";
const FeedScreen = () => {
  const [showUploader, setShowUploader] = useState(false);
  const [showMessage, setShowMessage] = useState(true);
  const [showTextUpdate, setShowTextUpdate] = useState(false);
  const [showLiveCallCentre, setShowLiveCallCentre] = useState(false);
  const [liveCallCentreUsers, setLiveCallCentreUsers] = useState([]);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [currentText, setCurrentText] = useState("");
  const [posts, setPosts] = useState([]);
  const [dialogId, setDialogId] = useState(null);
  const [authError, setAuthError] = useState(false);
  const [userProfilePic, setUserProfilePic] = useState(""); // Initialize as empty string
  const [hoveredDeletePostId, setHoveredDeletePostId] = useState(null);
  const [searchActive, setSearchActive] = useState(false);
  const [userIsLive, setUserIsLive] = useState(false); // New state for tracking live updates for involved users
  const [associatedUsers, setAssociatedUsers] = useState([]);
  const [activeUsersList, setActiveUsersList] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [loggedInUserName, setLoggedInUsername] = useState("");
  const [loggedInUserAdmin, setLoggedInUserAdmin] = useState("");
  const [notificationson, setNotificationsOn] = useState(false); //overide default-reset production
  const [hovering, setHovering] = useState(false);
  const [alertKey, setAlertKey] = useState(0);
  const [inCall, setInCall] = useState(false);
  const [caller, setCaller] = useState(null);
  const [showScheduler, setShowScheduler] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  //999 const [callRequestedUser, setCallRequestedUser] = useState([]);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const socketRef = useRef(null);
  const searchInputRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const userId = location.state ? location.state.userId : null;
  const submissionId = location.state ? location.state.submissionId : null;
  const title = location.state ? location.state.title : null;
  const handleBackToMessagesClick = () => {
    navigate("/userlist", { state: { userId: userId } }); // Update for v6
  };
  const getUserNameFromAssociatedUsers = (associatedUsers, id) => {
    const user = associatedUsers.find((user) => user.id === id);
    return user ? user.username : null;
  };
  const [searchQuery, setSearchQuery] = useState("");
  // In your FeedScreen component
  const [isRecording, setIsRecording] = useState(false);

  let audioURL = null;

  const audioRef = useRef(new Audio());
  const mediaRecorderRef = useRef(null);
  useEffect(() => {
    const socket = io(process.env.REACT_APP_BACKEND_HOST);
    socketRef.current = socket; // Save socket instance

    socket.on("connect", () => {
      console.log("Socket connected");
      socket.emit("register", { userId, submissionIds: [submissionId] });
      socket.emit("enter screen", { userId, submissionId });
    });

    socket.on("incomingCall", (data) => {
      //console.log("Incoming call:", data);
      setCaller(data);
    });

    socket.on("callAccepted", (signal) => {
      //console.log("Call accepted:", signal);
      if (peerRef.current) {
        peerRef.current.signal(signal);
      }
    });

    socket.on("active users update", (activeUsers) => {
      //console.log("Active users update:", activeUsers);
      setActiveUsersList(activeUsers);
    });

    socket.on("post update", (newPost) => {
      //console.log("Post update received:", newPost);
      if (
        newPost &&
        newPost.interestedUserIds &&
        newPost.interestedUserIds.includes(parseInt(userId, 10))
      ) {
        setUserIsLive(true);
      }
    });

    socket.on("postDeleted", ({ postId }) => {
      //console.log(`Post deleted with ID: ${postId}`);
      fetchPosts();
    });

    socket.on("postUpdated", ({ updatedPost }) => {
      //console.log(`Post updated with ID: ${updatedPost.id}`);
      fetchPosts();
    });

    return () => {
      socket.emit("leave screen", { userId, submissionId });
      socket.off("connect");
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("active users update");
      socket.off("post update");
      socket.off("postDeleted");
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, submissionId]);

  const handleStartRecording = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
        setIsRecording(true);

        const audioChunks = [];
        mediaRecorder.addEventListener("dataavailable", (event) => {
          audioChunks.push(event.data);
        });

        mediaRecorder.addEventListener("stop", () => {
          const blob = new Blob(audioChunks, { type: "audio/mp3" });
          setIsRecording(false);
          stream.getTracks().forEach((track) => track.stop());
          uploadAudio(blob); // Trigger upload after stopping
        });
      })
      .catch((error) => console.error("Failed to start recording:", error));
  };
  const toggleNotifications = () => {
    setNotificationsOn(!notificationson);
  };
  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const toggleSearch = () => {
    setSearchActive((prev) => !prev);
    // Focus on the input field when it becomes visible (after state update)
    if (!searchActive) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 0);
    }
  };
  // Call this function whenever you need to update the summary
  // For example, you can call it right after fetchPosts() inside useEffect
  const deletePost = async (postId) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/submission-dialog/${postId}`,
        {
          method: "DELETE",
        }
      );
      if (response.ok) {
        // If the deletion was successful, notify the server
        socketRef.current.emit("postDeleted", { postId, submissionId });

        // Fetch the posts again to update the UI
        fetchPosts();
      } else {
        setMessage("Failed to delete the post.");
        setType("error");
        setAlertKey((prevKey) => prevKey + 1);
      }
    } catch (error) {
      setMessage("Error deleting the post.");
      setType("error");
      setAlertKey((prevKey) => prevKey + 1);
    }
  };

  // useEffect to fetch associated users
  useEffect(() => {
    if (submissionId) {
      fetch(
        `${process.env.REACT_APP_API_URL}/api/interaction_feed_user_list?submission_id=${submissionId}`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          const loggedInUser = data.find((user) => user.id === userId);
          if (loggedInUser) {
            setLoggedInUsername(loggedInUser.username);
            setLoggedInUserAdmin(findThumbImage(loggedInUser.admin_face));
          }
          // Filter out the current logged-in user from the list
          const filteredUsers = data.filter((user) => user.id !== userId);
          setAssociatedUsers(filteredUsers);
        })
        .catch((error) => {
          console.error("Error fetching associated users:", error);
        });
    }
  }, [submissionId, userId]);

  useEffect(() => {
    if (userIsLive) {
      // Refresh dialog or posts when userIsLive is true
      fetchPosts();
      // Reset userIsLive after the update
      setUserIsLive(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userIsLive]);
  useEffect(() => {
    // If there's a new audio URL, play the audio
    if (audioURL && audioRef.current) {
      audioRef.current.src = audioURL; // Set the source for the audio player
      audioRef.current
        .play() // Play the audio
        .catch((error) => {
          console.error("Playback failed", error);
          // Handle failure to autoplay here, e.g., due to browser autoplay policies
        });
    }
  }, [audioURL]); // This effect should run every time the audioURL changes

  useEffect(() => {
    if (userId) {
      fetch(
        `${process.env.REACT_APP_API_URL}/api/users/${userId}/profile-picture`
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data.profilePicture) {
            const thumbnailPath = getThumbnailPath(data.profilePicture);
            setUserProfilePic(thumbnailPath);
          }
        })
        .catch((error) => {
          console.error("Error fetching user profile picture:", error);
        });
    }
  }, [userId]);
  const fetchPosts = () => {
    //console.log("Fetching posts for submissionId:", submissionId);
    if (submissionId) {
      fetch(`${process.env.REACT_APP_API_URL}/api/users/${submissionId}/posts`)
        .then((response) => response.json())
        .then((data) => {
          //console.log("Fetched posts:", data);
          return setPosts(data);
        })
        .catch((error) => console.error("Error fetching posts:", error));
    }
  };
  const handlePostSubmit = () => {
    //console.log("New post submitted. Fetching posts...");
    fetchPosts();
  };
  const handleGetNewPicture = () => {
    setShowUploader(true); // Show the uploader
  };
  const handleCloseUploader = () => {
    setShowUploader(false); // This will hide the modal
  };
  const setPostIdForText = (id, text) => {
    setDialogId(id);
    setCurrentText(text);
    setShowTextUpdate(true);
  };
  const setPostId = (id) => {
    setDialogId(id);
    handleGetNewPicture();
  };
  // Call this when the text update is successful to hide the TextUpdate component
  const handleTextSaveSuccess = () => {
    setShowTextUpdate(false);
    fetchPosts(); // Refresh the posts
  };
  const filteredPosts =
    searchQuery.length >= 3
      ? posts.filter(
          (post) =>
            post.content &&
            post.content.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : posts;

  useEffect(() => {
    if (userId) {
      checkAuthorization(userId).then((isAuthorized) => {
        if (!isAuthorized) {
          setAuthError(true);
          // Optionally, you can also navigate the user to a login page or display a modal asking them to log in.
          // navigate("/");
        }
      });
    }
  }, [userId, navigate]);

  useEffect(() => {
    if (submissionId) {
      fetchPosts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submissionId]);

  useEffect(() => {
    // Add the class to body
    document.body.classList.add("feed-displacement");
    const timer = setTimeout(() => {
      setShowMessage(false);
    }, 2000);
    // Cleanup function to remove the class when the component unmounts
    return () => {
      clearTimeout(timer);
      document.body.classList.remove("feed-displacement");
    };
  }, []);

  if (authError) {
    return (
      <div className="unauthorized-access">
        Unauthorized access. Please <a href="/">log in</a>.
      </div>
    );
  }
  //999 -send a version of associated users with 1 user about message call
  //setCallTime (For email)
  const postTypeForEmail = async (
    type,
    associatedUsers,
    scheduledTime = "",
    dayType = ""
  ) => {
    if (!notificationson) {
      return;
    }
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/notify_offline_users`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: type,
            title: title,
            loggedInUserName: loggedInUserName,
            associatedUsers: associatedUsers,
            scheduledTime: scheduledTime ? scheduledTime.toISOString() : "",
            dayType: dayType,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      setMessage("Notification sent successfully:" + result);
      setType("info");
      setAlertKey((prevKey) => prevKey + 1);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  // Update the uploadAudio function to take a Blob as an argument
  const uploadAudio = async (blob) => {
    if (!blob) {
      console.error("No audio to upload");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("audio", blob, "voice-message.mp3");
    formData.append("submissionId", submissionId);
    formData.append("userId", userId);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/upload-audio`,
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();

      postTypeForEmail("audio", associatedUsers);
      setMessage("Upload audio successful!");
      setType("info");
      setAlertKey((prevKey) => prevKey + 1);

      // Emit postUpdated event
      socketRef.current.emit("postUpdated", {
        updatedPost: data,
        submissionId,
      });

      fetchPosts();
    } catch (error) {
      setMessage("Upload failed!");
      setType("error");
      setAlertKey((prevKey) => prevKey + 1);
    } finally {
      setIsUploading(false);
    }
  };

  const checkUserIsInActiveList = (user_id, activeUsersList) => {
    return activeUsersList.includes(user_id) ? "active" : "";
  };

  const validateUploadedSoundFile = (path) => {
    return /\.(mp3|wav|ogg)$/i.test(path); // Case-insensitive check for common audio formats
  };
  const handleScrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const startVideoCall = (userToCall) => {
    setShowLiveCallCentre(false);
    const selectedUsername = getUserName(userToCall);
    const systemTime = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    // Prepare the callRequestedUser array with only the user being called
    // setCallRequestedUser([
    //   associatedUsers.find((user) => user.id === userToCall),
    // ]);
    // Post the event message
    postMessage(
      `${loggedInUserName} called ${selectedUsername} at ${systemTime}`
    );
    // Send email notification
    setInCall(true);
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const peer = new Peer({
          initiator: true,
          trickle: false,
          stream: stream,
        });

        peer.on("signal", (data) => {
          socketRef.current.emit("callUser", {
            userToCall,
            signalData: data,
            from: userId,
          });
        });

        peer.on("stream", (stream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
        });

        peer.on("close", () => {
          endCall();
        });

        socketRef.current.on("callAccepted", (signal) => {
          peer.signal(signal);
        });

        peerRef.current = peer;
      })
      .catch((error) => {
        console.error("Failed to start media devices:", error);
        setMessage(
          "Error accessing camera or microphone. Please check your device settings."
        );
        setType("error");
        setAlertKey((prevKey) => prevKey + 1);
        setInCall(false);
      });
  };

  const answerCall = () => {
    setInCall(true);

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const peer = new Peer({
          initiator: false,
          trickle: false,
          stream: stream,
        });

        peer.on("signal", (data) => {
          socketRef.current.emit("acceptCall", {
            signal: data,
            to: caller.from,
          });
        });

        peer.on("stream", (stream) => {
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
        });

        peer.on("close", () => {
          endCall();
        });

        peer.signal(caller.signal);
        peerRef.current = peer;
      });
  };
  //999
  const launchLiveCallCentre = () => {
    const updatedAssociatedUsers = associatedUsers.map((user) => {
      return {
        ...user,
        isActive:
          checkUserIsInActiveList(user.id, activeUsersList) === "active",
      };
    });
    console.log("FeedScreen-updatedAssociatedUsers", updatedAssociatedUsers);
    console.log("Launch Live Call Centre with the following user data:");
    console.log(updatedAssociatedUsers);

    setLiveCallCentreUsers(updatedAssociatedUsers); // Set the updated users before showing the modal
    setShowLiveCallCentre(true); // Show the LiveCallCentre modal
  };

  const callAction = (userId, action) => {
    if (action === "Cancel") {
      console.log(`Do nothing Cancel user ID: ${userId}`);
      setShowLiveCallCentre(false);
    } else if (action === "Call") {
      console.log(`Initiate call with user ID: ${userId}`);

      // Start the video call
      startVideoCall(userId);
    } else if (action === "Schedule") {
      // Show the scheduler
      setSelectedUser(userId);
      setShowScheduler(true);
    }
  };

  const getUserName = (userId) => {
    const user = associatedUsers.find((user) => user.id === userId);
    return user ? user.username : "Unknown User";
  };
  const onPostSubmit = () => {
    fetchPosts(); // Assuming fetchPosts is a function that fetches the updated posts
  };
  const postMessage = async (textContent) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/api/users/${submissionId}/text-entry`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId, textContent }),
        }
      );
      const data = await response.json();
      if (response.ok) {
        if (onPostSubmit) {
          onPostSubmit(); // Refresh the posts after message submission
        }
      } else {
        throw new Error(data.message || "Error submitting text");
      }
    } catch (error) {
      console.error("Error submitting message:", error);
    }
  };

  const handleSchedulerConfirm = (scheduledTime) => {
    const selectedUsername = getUserNameFromAssociatedUsers(
      associatedUsers,
      selectedUser
    );

    // Prepare the callRequestedUser array with only the user being scheduled
    const callRequestedUser = [
      associatedUsers.find((user) => user.id === selectedUser),
    ];

    postMessage(
      `${loggedInUserName} requested ${selectedUsername} for a video call at ${scheduledTime.toLocaleString()}`
    );

    // Send the email notification with call_request type
    postTypeForEmail("call_request", callRequestedUser, scheduledTime);

    setShowScheduler(false);
    // Close the Live Call Centre modal
    setShowLiveCallCentre(false);
  };

  const handleSchedulerCancel = () => {
    setShowScheduler(false);
  };

  const endCall = () => {
    setInCall(false);
    setCaller(null);
    if (peerRef.current) {
      peerRef.current.destroy();
    }
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      localVideoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
    }
    if (remoteVideoRef.current && remoteVideoRef.current.srcObject) {
      remoteVideoRef.current.srcObject
        .getTracks()
        .forEach((track) => track.stop());
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    peerRef.current = null;
    socketRef.current = null;
  };

  return (
    <div>
      {showMessage && <div className="message-box">FeedScreen</div>}{" "}
      {/* This wraps the entire screen */}
      <div className="header">
        <div className="header-top">
          <Button
            variant="outline-info"
            className="btn-icon"
            onClick={() => {
              handleBackToMessagesClick();
            }}
          >
            <ArrowLeftCircleFill size={25} />
          </Button>
          <div>
            <div className="interaction-icons">
              {associatedUsers.map((user) => (
                <div key={user.id} className="user-container">
                  {parseInt(process.env.REACT_APP_SYSTEM_ADMIN_ID) ===
                    user.id && (
                    <img
                      src={loggedInUserAdmin}
                      alt="Admin Face"
                      className={"post-profile-image"}
                    />
                  )}
                  {parseInt(process.env.REACT_APP_SYSTEM_ADMIN_ID) !==
                    user.id && (
                    <img
                      src={`${process.env.REACT_APP_BACKEND_URL}/${
                        process.env.REACT_APP_IMAGE_FOLDER
                      }/thumb-${extractFilename(user.profile_picture)}`}
                      alt={user.username}
                      className={`post-profile-image ${checkUserIsInActiveList(
                        user.id,
                        activeUsersList
                      )}`}
                    />
                  )}
                  <div className="user-info">
                    <label className="font-style-4">{user.username}</label>
                    {checkUserIsInActiveList(user.id, activeUsersList) ===
                      "active" && (
                      <Button
                        variant="outline-info"
                        className="btn-icon"
                        onClick={() => {
                          startVideoCall(user.id);
                        }}
                      >
                        <Telephone size={25} />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Button
            variant="outline-info"
            className="btn-icon"
            onClick={handleScrollToBottom}
          >
            <ArrowDownCircleFill size={25} />
          </Button>
        </div>
        <h2 className="header-title font-style-4">{title}</h2>
      </div>
      {submissionId && (
        <>
          {showTextUpdate && (
            <div
              className="feed-content modal-backdrop"
              onClick={() => setShowTextUpdate(false)}
            >
              <div
                className="text-update-modal"
                onClick={(e) => e.stopPropagation()}
              >
                <TextUpdate
                  dialogId={dialogId}
                  initialText={currentText}
                  onSaveSuccess={handleTextSaveSuccess}
                  socketRef={socketRef} // Pass socketRef to TextUpdate
                />
              </div>
            </div>
          )}

          {showLiveCallCentre && (
            <div
              className="modal-backdrop"
              onClick={() => setShowLiveCallCentre(false)}
            >
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <LiveCallCentre
                  users={liveCallCentreUsers}
                  callAction={callAction}
                />
              </div>
            </div>
          )}

          {showScheduler && (
            <div
              className="modal-backdrop"
              onClick={() => setShowScheduler(false)}
            >
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <Scheduler
                  onTimeSelected={handleSchedulerConfirm}
                  onCancel={handleSchedulerCancel}
                />
              </div>
            </div>
          )}

          {showUploader && (
            <div className="backdrop" onClick={handleCloseUploader}>
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <PhotoUploadAndEdit
                  userId={userId}
                  submissionId={submissionId}
                  onPhotoSubmit={fetchPosts}
                  onSaveSuccess={() => {
                    console.log("onSaveSuccess");
                    setMessage("Image uploaded successfully");
                    setType("info");
                    setAlertKey((prevKey) => prevKey + 1);
                    handleCloseUploader(); // Close the uploader modal first
                    postTypeForEmail("picture", associatedUsers);
                    socketRef.current.emit("postUpdated", {
                      submissionId,
                      dialogId,
                    }); // Emit postUpdated event
                  }}
                  dialogId={dialogId}
                />
              </div>
            </div>
          )}

          <div className="element-group-box">
            {userProfilePic && (
              <img
                src={`${process.env.REACT_APP_BACKEND_URL}${userProfilePic}`}
                alt="Current User Profile"
                className="current-user-profile-pic"
              />
            )}

            <div className="text-entry-container">
              <TextEntry
                userId={userId}
                submissionId={submissionId}
                onPostSubmit={() => {
                  postTypeForEmail("Text", associatedUsers);
                  handlePostSubmit();
                }}
              />
            </div>
            <div className="verticle_wrapper">
              {isUploading && (
                <div className="upload-status">
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                  <p>Uploading...</p>
                </div>
              )}
              <Button
                variant="outline-info"
                className="btn-icon"
                onClick={
                  isRecording ? handleStopRecording : handleStartRecording
                }
              >
                {isRecording ? (
                  <MicMuteFill size={25} />
                ) : (
                  <MicFill size={25} />
                )}
                {isRecording && (
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  />
                )}
              </Button>
              <Button
                variant="outline-info"
                className="btn-icon btn-delete"
                onMouseEnter={() => setIsImageHovered(true)}
                onMouseLeave={() => setIsImageHovered(false)}
                onClick={handleGetNewPicture}
              >
                {isImageHovered ? <ImageFill size={25} /> : <Image size={25} />}
              </Button>
            </div>
            <Button
              variant="outline-info"
              className="btn-icon"
              onClick={launchLiveCallCentre}
              style={{
                height: "80px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }} // Adjust height as needed
            >
              <Telephone size={25} />
            </Button>
            <div className="verticle_wrapper">
              <Button
                variant="outline-info"
                onMouseEnter={() => setHovering(true)}
                onMouseLeave={() => setHovering(false)}
                onClick={toggleNotifications}
                className="btn-icon"
              >
                {notificationson ? (
                  hovering ? (
                    <EnvelopeSlashFill size={25} />
                  ) : (
                    <EnvelopeSlash size={25} />
                  )
                ) : hovering ? (
                  <EnvelopePlusFill size={25} />
                ) : (
                  <EnvelopePlus size={25} />
                )}
              </Button>
              <div className="search-container">
                <Button
                  variant="outline-info" // This should match other buttons
                  className="btn-icon" // Make sure it has the same classes
                  onClick={toggleSearch}
                >
                  <Search size={25} />
                </Button>
                {searchActive && (
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="search-input"
                    placeholder="Type your search"
                    onChange={handleSearchChange}
                  />
                )}
              </div>
            </div>
          </div>
          {message && (
            <AlertMessage key={alertKey} message={message} type={type} />
          )}
          {inCall && (
            <div className="video-call-container">
              <video
                ref={localVideoRef}
                autoPlay
                muted
                className="local-video"
              />
              <Button
                variant="outline-danger"
                className="btn-icon"
                onClick={endCall}
              >
                <TelephoneFill size={25} />
              </Button>
              <video ref={remoteVideoRef} autoPlay className="remote-video" />
            </div>
          )}
        </>
      )}
      {filteredPosts.map((post) => (
        <div key={post.id} className="element-group-box">
          {parseInt(process.env.REACT_APP_SYSTEM_ADMIN_ID) !==
            post.posting_user_id && (
            <img
              src={`${process.env.REACT_APP_IMAGE_HOST}/${
                process.env.REACT_APP_IMAGE_FOLDER
              }/thumb-${extractFilename(post.profile_picture)}`}
              alt="User Post"
              className="post-profile-image"
            />
          )}

          {parseInt(process.env.REACT_APP_SYSTEM_ADMIN_ID) ===
            post.posting_user_id &&
            loggedInUserAdmin && (
              <img
                src={loggedInUserAdmin}
                alt="Admin Face"
                className="post-profile-image"
              />
            )}

          {parseInt(process.env.REACT_APP_SYSTEM_ADMIN_ID) ===
            post.posting_user_id &&
            !loggedInUserAdmin && (
              <img
                src={"/admins/thumb-file-admin.JPEG"}
                alt="Admin Face"
                className="post-profile-image"
              />
            )}

          {post.type === "text" ? (
            <div className="speech-bubble">
              <div>{post.content}</div>
            </div>
          ) : validateUploadedSoundFile(post.uploaded_path) ? (
            <audio controls ref={audioRef}>
              <source
                src={`${
                  process.env.REACT_APP_IMAGE_HOST
                }${post.uploaded_path.replace(/\\/g, "/")}`}
                type="audio/mp3"
              />
              Your browser does not support the audio element.
            </audio>
          ) : (
            <div className="post-image-container">
              <img
                className={
                  userId === post.posting_user_id ? "resizable-image" : ""
                }
                src={`${
                  process.env.REACT_APP_IMAGE_HOST
                }${post.uploaded_path.replace(/\\/g, "/")}`}
                alt="User Post"
              />
            </div>
          )}

          {userId === post.posting_user_id && (
            <div className="button_tower">
              {post.type === "text" ? (
                <Button
                  variant="outline-info"
                  className="btn-sm"
                  onClick={() => {
                    setPostIdForText(post.id, post.content);
                  }}
                >
                  Update
                </Button>
              ) : validateUploadedSoundFile(post.uploaded_path) ? (
                <Button
                  variant="outline-info"
                  className="btn-sm"
                  style={{ opacity: 0.5 }}
                  disabled
                >
                  Update
                </Button>
              ) : (
                <Button
                  variant="outline-info"
                  className="btn-sm"
                  onClick={() => {
                    setPostId(post.id);
                  }}
                >
                  Update
                </Button>
              )}
              <Button
                variant="danger"
                className="btn-sm"
                onClick={() => deletePost(post.id)}
                onMouseEnter={() => setHoveredDeletePostId(post.id)}
                onMouseLeave={() => setHoveredDeletePostId(null)}
              >
                {hoveredDeletePostId === post.id ? (
                  <TrashFill size={25} />
                ) : (
                  <Trash size={25} />
                )}
              </Button>
            </div>
          )}
          {userId !== post.posting_user_id && (
            <div className="button_tower" style={{ opacity: 0.5 }}>
              <Button variant="outline-info" className="btn-sm" disabled>
                Update
              </Button>

              <Button variant="danger" className="btn-sm" disabled>
                <Trash size={25} />
              </Button>
            </div>
          )}
        </div>
      ))}
      <Button
        variant="outline-info"
        className="btn-icon btn-fixed-bottom"
        onClick={handleScrollToTop}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "0",
          zIndex: 1000,
        }}
      >
        <ArrowUpCircleFill size={25} />
      </Button>
      {caller && !inCall && (
        <div className="wrapper-container-peer-answer incoming-call">
          <p>
            Incoming call from{" "}
            {getUserNameFromAssociatedUsers(associatedUsers, caller.from)}
          </p>
          <Button variant="outline-info" onClick={answerCall}>
            Answer
          </Button>
          <Button variant="outline-danger" onClick={endCall}>
            Decline
          </Button>
        </div>
      )}
    </div>
  );
};

export default FeedScreen;
