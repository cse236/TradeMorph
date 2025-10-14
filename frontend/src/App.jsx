// src/App.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function App() {
  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to JWT Auth App 🚀</h1>
      <p>This is the main landing page.</p>

      <div style={{ marginTop: "20px" }}>
        <Link to="/signup">Signup</Link> |{" "}
        <Link to="/login">Login</Link> |{" "}
        <Link to="/home">Home</Link>
      </div>
    </div>
  );
}
