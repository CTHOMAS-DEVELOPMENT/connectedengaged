import React, { useState } from "react";

const TestUserSimulator = () => {
  const [selectedUser, setSelectedUser] = useState("MissTaste");
  const [language, setLanguage] = useState("en");
  const password = "128Crestway";

  const testUsers = [
    { username: "MissTaste", label: "Miss Taste (EN)" },
    { username: "CityDwellerGirl", label: "City Dweller Girl (FR)" },
    { username: "DigiFarmer", label: "Digi Farmer (GA)" },
  ];

  const handleUserSelect = (event) => {
    const user = testUsers.find((u) => u.username === event.target.value);
    setSelectedUser(user.username);
    setLanguage(
      user.username === "CityDwellerGirl"
        ? "fr"
        : user.username === "DigiFarmer"
        ? "ga"
        : "en"
    );
  };

  const handleSubmit = () => {
    const form = document.getElementById("form-frame");
    const suffix = Date.now(); // Ensure uniqueness
    const username = `${selectedUser}${suffix}`;
    const email = `connectedengaged+${username}@gmail.com`;

    if (form?.contentWindow) {
        console.log("✅ Posting to iframe:", {
            type: "simulateRegister",
            username,
            email,
            password,
            language,
          });
      form.contentWindow.postMessage(
        {
          type: "simulateRegister",
          username,
          email,
          password,
          language,
        },
        "*"
      );
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div
        style={{
          flex: 1,
          padding: "20px",
          backgroundColor: "#f7f7f7",
          borderRight: "1px solid #ccc",
        }}
      >
        <h2>🧪 Connected Engager Tester</h2>
        <p>Select a test user and run through the login & registration flow.</p>
        <select value={selectedUser} onChange={handleUserSelect}>
          {testUsers.map((user) => (
            <option key={user.username} value={user.username}>
              {user.label}
            </option>
          ))}
        </select>
        <br />
        <br />
        <button
          style={{ padding: "10px 20px", fontWeight: "bold" }}
          onClick={handleSubmit}
        >
          🚀 Simulate Tester
        </button>
      </div>

      <iframe
        id="form-frame"
        title="ConnectedEngager"
        src="https://connectedengager.com/"
        style={{ flex: 2, border: "none" }}
      ></iframe>
    </div>
  );
};

export default TestUserSimulator;
