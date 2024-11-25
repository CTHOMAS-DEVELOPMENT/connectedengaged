// utils.js
const path = require("path");
const fs = require("fs");

function loadEnvVariables() {
  const envPath = path.join(__dirname, ".env");

  try {
    const data = fs.readFileSync(envPath, "utf-8");

    const envVariables = data.split(/\r?\n/);

    envVariables.forEach((variable) => {
      if (!variable.trim() || variable.startsWith("#")) return;

      const [key, value] = variable.split("=");
      if (key && value) {
        process.env[key.trim()] = value.trim();
      }
    });

    console.log("Environment variables loaded successfully.");
  } catch (error) {
    console.error("Error loading .env variables:", error);
  }
}

module.exports = { loadEnvVariables };
