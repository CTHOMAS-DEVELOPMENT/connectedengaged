import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AlertMessage from "../system/AlertMessage";
import { Button } from "react-bootstrap";
import { extractFilename } from "../system/utils";
import { checkAuthorization } from "../system/authService";
import FloatsMyBoat from "../RegistrationProfileCreation/FloatsMyBoat.js";
import Gender from "../RegistrationProfileCreation/Gender.js";
import Orientation from "../RegistrationProfileCreation/Orientation.js";
import Hobbies from "../RegistrationProfileCreation/Hobbies.js";
import {
  version1Orientations,
  version1Gender,
  version1Hobbies,
  version1Keys,
} from "../RegistrationProfileCreation/scopedCollections.js";
import ScrollingHelpText from "../system/ScrollingHelpText";
import "bootstrap/dist/css/bootstrap.min.css";
import translations from "./translations.json"; // Adjust the path to where your translations file is located

const EditInteraction = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { submissionId, loggedInUserId, languageCode = "en" } = location.state;
  const [authError, setAuthError] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [alertKey, setAlertKey] = useState(0);
  const [title, setTitle] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [initialSelectedUserIds, setInitialSelectedUserIds] = useState(
    new Set()
  );
  const [isChanged, setIsChanged] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCarousel, setSelectedCarousel] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
  const [showGender, setShowGender] = useState(false);
  const [selectedOrientation, setSelectedOrientation] = useState(null);
  const [showOrientation, setShowOrientation] = useState(false);
  const [showHobbies, setShowHobbies] = useState(false);
  const [selectedHobby, setSelectedHobby] = useState(null);
  const usersPerPage = 6;
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [usernameFilter, setUsernameFilter] = useState("");
  const [aboutYouFilter, setAboutYouFilter] = useState("");
  const [filterSex, setFilterSex] = useState("");
  const [filterHobbies, setFilterHobbies] = useState("");
  const [filterOrientation, setFilterOrientation] = useState("");
  const [showFloatsMyBoat, setShowFloatsMyBoat] = useState(false);

  const [filterFloatsMyBoat, setFilterFloatsMyBoat] = useState("");
  const pageTranslations = translations[languageCode]?.editInteraction || {};
  const helpMessage =
    pageTranslations.helpMessage ||
    "Filter your connected engagers on what their selected preferences were.";

  //
  useEffect(() => {
    if (loggedInUserId) {
      checkAuthorization(loggedInUserId).then((isAuthorized) => {
        if (!isAuthorized) {
          setAuthError(true);
        } else {
          fetchInteractionDetails();
          fetchAllUsers();
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedInUserId, navigate]);
  useEffect(() => {
    let filteredUsers = users.filter((user) =>
      user.username.toLowerCase().includes(usernameFilter.toLowerCase())
    );
    //aboutYouFilter
    if (aboutYouFilter) {
      filteredUsers = filteredUsers.filter((user) =>
        (user.about_you || "")
          .toLowerCase()
          .includes(aboutYouFilter.toLowerCase())
      );
    }
    if (showSelectedOnly) {
      filteredUsers = filteredUsers.filter((user) =>
        selectedUserIds.has(user.id)
      );
    }

    setTotalPages(Math.ceil(filteredUsers.length / usersPerPage));

    // Handle pagination edge case.
    if (currentPage > totalPages || currentPage < 1) {
      setCurrentPage(1);
    }
  }, [
    users,
    usernameFilter,
    aboutYouFilter,
    showSelectedOnly,
    selectedUserIds,
    usersPerPage,
    currentPage,
    totalPages,
  ]);
  const handleGenderSelection = (index) => {
    setSelectedGender(index);
    setFilterSex(version1Gender[index]);
  };
  const handleOrientationSelection = (index) => {
    setSelectedOrientation(index);
    setFilterOrientation(version1Orientations[index]);
  };
  const handleHobbySelection = (index) => {
    setSelectedHobby(index);
    setFilterHobbies(version1Hobbies[index]);
  };
  const handleCarouselSelection = (index) => {
    setSelectedCarousel(index);
    setFilterFloatsMyBoat(version1Keys[index]);
  };
  useEffect(() => {
    // Assuming `users` is always up-to-date with the fetched user list
    const filteredUsers = showSelectedOnly
      ? users.filter((user) => selectedUserIds.has(user.id))
      : users;
    setTotalPages(Math.ceil(filteredUsers.length / usersPerPage));
    setCurrentPage(1); // Reset to page 1 whenever the filter changes
  }, [users, showSelectedOnly, selectedUserIds, usersPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1); // Reset to the first page if the current page is out of bounds
    }
  }, [totalPages, currentPage]);
  const handleShowSelectedChange = (event) => {
    const isChecked = event.target.checked;
    setShowSelectedOnly(isChecked);
    if (isChecked) {
      setUsernameFilter(""); // Clear username filter
      // No need to set currentPage or totalPages as they will be recalculated in the useEffect.
    }
  };
  const fetchInteractionDetails = () => {
    fetch(
      `${process.env.REACT_APP_API_URL}/api/interaction_user_list?submission_id=${submissionId}`
    )
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTitle(data[0].title);
          const userIds = data.map((user) => user.id);
          setSelectedUserIds(new Set(userIds));
          setInitialSelectedUserIds(new Set(userIds));
        }
      })
      .catch((error) => {
        console.error("Error fetching Engagement details:", error);
        setMessage(
          pageTranslations.errorFetchingEngagementDetails ||
            "Error fetching engagement details."
        );
        setType("error");
        setAlertKey((prevKey) => prevKey + 1);
      });
  };
  const fetchAllUsers = () => {
    fetch(
      `${process.env.REACT_APP_API_URL}/api/connected-users/${loggedInUserId}`
    )
      .then((response) => response.json())
      .then((data) => {
        const filteredUsers = data.filter(
          (user) =>
            !user.username.startsWith("Admin") && user.id !== loggedInUserId
        );
        setUsers(filteredUsers);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setMessage(
          pageTranslations.errorFetchingUsers || "Error fetching users."
        );
        setType("error");
        setAlertKey((prevKey) => prevKey + 1);
      });
  };

  // Make sure the 'selectedUserIds' is properly synchronized and in the correct format
  const handleCheckboxChange = (userId) => {
    setSelectedUserIds((prevSelectedUserIds) => {
      const newSelectedUserIds = new Set(prevSelectedUserIds);
      if (newSelectedUserIds.has(userId)) {
        newSelectedUserIds.delete(userId);
      } else {
        newSelectedUserIds.add(userId);
      }

      setIsChanged(
        [...newSelectedUserIds].sort().join(",") !==
          [...initialSelectedUserIds].sort().join(",")
      );
      return newSelectedUserIds;
    });
  };

  const handleBackToMessagesClick = () => {
    navigate("/userlist", { state: { userId: loggedInUserId } });
  };
  const grabUserPicture = (profilePicture, sex) => {
    const fileNeeded = profilePicture
      ? "thumb-" + extractFilename(profilePicture)
      : sex === "Male"
      ? "thumb-greyface-male.png"
      : "thumb-greyface-female.png";
    const pathToFile = `${process.env.REACT_APP_IMAGE_HOST}/${process.env.REACT_APP_IMAGE_FOLDER}/${fileNeeded}`;

    return pathToFile;
  };
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (name === "username") {
      setUsernameFilter(value || "");
    } else if (name === "aboutYou") {
      setAboutYouFilter(value || "");
    }
  };
  const handleUpdateGroupClick = () => {
    setMessage("");
    setType("info");
    setAlertKey((prevKey) => prevKey + 1);
    const payload = {
      submissionId: submissionId,
      userIds: Array.from(selectedUserIds),
    };

    fetch(`${process.env.REACT_APP_API_URL}/api/update-the-group`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          setMessage(
            pageTranslations.failedToUpdateGroup ||
              "Failed to update the group."
          );
          setType("error");
          setAlertKey((prevKey) => prevKey + 1);
          throw new Error(
            pageTranslations.failedToUpdateGroup ||
              "Failed to update the group."
          );
        }
      })
      .then((data) => {
        setMessage(
          pageTranslations.groupUpdatedSuccessfully ||
            "Group updated successfully."
        );
        setType("info");
        setAlertKey((prevKey) => prevKey + 1);
      })
      .catch((error) => {
        setMessage(
          pageTranslations.errorUpdatingGroup || "Error updating the group."
        );
        setType("error");
        setAlertKey((prevKey) => prevKey + 1);
      });
  };

  // Get current page of users
  const currentUsers = useMemo(() => {
    let filteredUsers = users.filter((user) => {
      const aboutYouSafe = user.about_you || "";
      const usernameSafe = user.username || "";
      const hobbiesSafe = user.hobbies || "";
      const sexualOrientationSafe = user.sexual_orientation || "";
      const floatsMyBoatSafe = user.floats_my_boat || "";

      return (
        (aboutYouFilter.length >= 3
          ? aboutYouSafe.toLowerCase().includes(aboutYouFilter.toLowerCase())
          : true) &&
        (usernameFilter.length >= 3
          ? usernameSafe.toLowerCase().includes(usernameFilter.toLowerCase())
          : true) &&
        (filterSex ? user.sex === filterSex : true) &&
        (filterHobbies
          ? hobbiesSafe.toLowerCase().includes(filterHobbies.toLowerCase())
          : true) &&
        (filterOrientation
          ? sexualOrientationSafe
              .toLowerCase()
              .includes(filterOrientation.toLowerCase())
          : true) &&
        (filterFloatsMyBoat
          ? floatsMyBoatSafe
              .toLowerCase()
              .includes(filterFloatsMyBoat.toLowerCase())
          : true)
      );
    });

    if (showSelectedOnly) {
      filteredUsers = filteredUsers.filter((user) =>
        selectedUserIds.has(user.id)
      );
    }

    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    return filteredUsers.slice(startIndex, endIndex);
  }, [
    users,
    usernameFilter,
    aboutYouFilter,
    filterSex,
    filterHobbies,
    filterOrientation,
    filterFloatsMyBoat,
    showSelectedOnly,
    selectedUserIds,
    currentPage,
    usersPerPage,
  ]);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (authError) {
    return (
      <div>
        {pageTranslations.unauthorizedMessage || "Unauthorized. Please log in."}
      </div>
    );
  }

  return (
    <div>
      <nav>
        <Button
          style={{ backgroundColor: "white" }}
          variant="outline-info"
          className="btn-sm"
          onClick={handleBackToMessagesClick}
          aria-label={pageTranslations.backToMessages || "Back to messages"}
        >
          {pageTranslations.backToMessages || "Back to messages"}
        </Button>{" "}
      </nav>
      <main>
        <section aria-labelledby="interaction-title">
          <div className="edit-interaction-container">
            <div className="centre_scroll">
              <h2 id="interaction-title" className="font-style-4">
                {title}
              </h2>
              <ScrollingHelpText message={helpMessage} width="300px" />
            </div>
            <div
              className="dropdown-container"
              style={{
                padding: "20px",
                borderRadius: "10px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                marginBottom: "20px",
              }}
              aria-labelledby="filters-section"
            >
              <h3 id="filters-section" className="font-style-4">
                {pageTranslations.FilterUsers || "Filter Users"}
              </h3>
              <div className="form-group row">
                <div>
                  <input
                    type="text"
                    id="username"
                    className="form-control"
                    placeholder={
                      pageTranslations.usernamePlaceholder ||
                      "Enter a partial username at least"
                    }
                    aria-label={
                      pageTranslations.usernamePlaceholder ||
                      "Enter a partial username at least"
                    }
                    value={usernameFilter}
                    onChange={(e) => setUsernameFilter(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <div>
                  <Button
                    variant="outline-info"
                    className="btn-sm"
                    onClick={() => setShowGender(!showGender)}
                    aria-expanded={showGender}
                    aria-controls="g-selection"
                  >
                    {showGender
                      ? pageTranslations.hideMostLikeYou ||
                        "Hide Their 'Most Like You'"
                      : pageTranslations.showMostLikeYou ||
                        "Show Their 'Most Like You' Selection"}
                  </Button>
                </div>
                {showGender && (
                  <div
                    id="g-selection"
                    role="region"
                    aria-labelledby="g-selection"
                  >
                    <Gender
                      onSelectGender={handleGenderSelection}
                      selected={selectedGender}
                    />
                  </div>
                )}
                <div>
                  <Button
                    variant="outline-info"
                    className="btn-sm"
                    onClick={() => setShowHobbies(!showHobbies)}
                    aria-expanded={showHobbies}
                    aria-controls="h-selection"
                  >
                    {showHobbies
                      ? pageTranslations.hideFavouriteHobby ||
                        "Hide Their 'Favourite Hobby'"
                      : pageTranslations.showFavouriteHobby ||
                        "Show Their 'Favourite Hobby' Selection"}
                  </Button>
                </div>
                {showHobbies && (
                  <div
                    id="h-selection"
                    role="region"
                    aria-labelledby="h-selection"
                  >
                    <Hobbies
                      onSelectHobby={handleHobbySelection}
                      selected={selectedHobby}
                      selectedLanguage={languageCode}
                      hobbies={pageTranslations.hobbies} // Pass the translated hobbies
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <div>
                  <Button
                    variant="outline-info"
                    className="btn-sm"
                    onClick={() => setShowOrientation(!showOrientation)}
                    aria-expanded={showOrientation}
                    aria-controls="o-selection"
                  >
                    {showOrientation
                      ? pageTranslations.hidePreferredCompany ||
                        "Hide Their 'Preferred Partner'"
                      : pageTranslations.showPreferredCompany ||
                        "Show Their 'Preferred Partner' Selection"}
                  </Button>
                </div>
                {showOrientation && (
                  <div
                    id="o-selection"
                    role="region"
                    aria-labelledby="o-selection"
                  >
                    <Orientation
                      onSelectOrientation={handleOrientationSelection}
                      selected={selectedOrientation}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <div>
                  <Button
                    variant="outline-info"
                    className="btn-sm"
                    onClick={() => setShowFloatsMyBoat(!showFloatsMyBoat)}
                    aria-expanded={showFloatsMyBoat}
                    aria-controls="f-selection"
                  >
                    {showFloatsMyBoat
                      ? pageTranslations.hideFloatsYourBoat ||
                        "Hide Their 'Floats Your Boat'"
                      : pageTranslations.showFloatsYourBoat ||
                        "Show Their 'Floats Your Boat' Selection"}
                  </Button>
                </div>

                {showFloatsMyBoat && (
                  <div
                    id="f-selection"
                    role="region"
                    aria-labelledby="f-selection"
                  >
                    <FloatsMyBoat
                      onSelectCarousel={handleCarouselSelection}
                      selectedCarousel={selectedCarousel}
                    />
                  </div>
                )}
              </div>
              <div className="row mb-3">
                <div>
                  <textarea
                    id="aboutYou"
                    name="aboutYou"
                    className="about-you-textarea"
                    value={aboutYouFilter}
                    placeholder={
                      pageTranslations.aboutYouPlaceholder ||
                      "Enter something they must have said in their bio"
                    }
                    aria-label={
                      pageTranslations.aboutYouPlaceholder ||
                      "Enter something they must have said in their bio"
                    }
                    onChange={handleInputChange}
                    style={{ width: "100%", height: "100px" }} // Adjust styling as needed
                  />
                </div>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                padding: "10px 20px",
                backgroundColor: "#000", // Black background
                borderRadius: "8px", // Rounded corners
              }}
            >
              <div
                className="font-style-4 form-check"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%",
                  fontSize: "20px",
                }}
              >
                <label
                  className="form-check-label"
                  htmlFor="showSelectedCheckbox"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "#fff", // White text
                  }}
                  aria-label={
                    pageTranslations.showSelectedCheckbox ||
                    "Click the checkbox to show only the users already in the Engagement"
                  }
                >
                  <span style={{ marginRight: "30px" }}>
                    {pageTranslations.showSelectedUsers ||
                      "Show Selected Users"}
                  </span>
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="showSelectedCheckbox"
                    checked={showSelectedOnly}
                    onChange={handleShowSelectedChange}
                  />
                </label>
              </div>
            </div>
            <div className="scrollable-content">
              <section aria-labelledby="user-list">
                <ul id="user-list" className="no-bullet">
                  {currentUsers.map((user) => (
                    <li key={user.id} className="user-edit-item">
                      <div
                        className="user-edit-info"
                        role="region"
                        aria-label={`User ${user.username}`}
                      >
                        <img
                          src={grabUserPicture(user.profile_picture, user.sex)}
                          alt={user.username}
                          className="post-profile-image"
                        />
                        <span className="username">{user.username}</span>
                        <input
                          type="checkbox"
                          checked={selectedUserIds.has(user.id)}
                          onChange={() => handleCheckboxChange(user.id)}
                          aria-label={user.username}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
            {totalPages > 1 && (
              <nav aria-label={pageTranslations.pagination || "Pagination"}>
                <div className="pagination">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Button
                      key={i}
                      variant={
                        currentPage === i + 1 ? "primary" : "outline-primary"
                      }
                      className={`round-button ${
                        currentPage === i + 1 ? "selected" : ""
                      }`}
                      onClick={() => paginate(i + 1)}
                      aria-label={`Page ${i + 1}`}
                      aria-current={currentPage === i + 1 ? "page" : undefined}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              </nav>
            )}
            {message && (
              <AlertMessage
                key={alertKey}
                message={message}
                type={type}
                role="alert"
                aria-live="assertive"
              />
            )}
            {isChanged && (
              <Button
                variant="outline-info"
                className="btn-sm"
                onClick={handleUpdateGroupClick}
                aria-label={pageTranslations.updateGroup || "Update Group"}
              >
                {pageTranslations.updateGroup || "Update Group"}
              </Button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default EditInteraction;
