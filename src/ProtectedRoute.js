// ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token"); // Check for a token in localStorage

  if (!token) {
    // If no token, redirect to the login page
    return <Navigate to="/" replace />;
  }

  return children; // Render the wrapped component if authenticated
};

export default ProtectedRoute;
