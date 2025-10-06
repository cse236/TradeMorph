import React from "react";
import "../Styling/ErrorPage.css";
import Roboimg from "../assets/Error-robot.png";
import {Link ,useNavigate}from "react-router-dom";

const ErrorPage = () => {
    const navigate = useNavigate();
  return (
    <div className="error-container">
      <div className="error-content">
        <h1 className="error-title">Oops! Something went wrong</h1>
        <p className="error-subtitle">
          We can’t seem to load your data right now.
        </p>

        <div className="robot-section">
          <img
            src={Roboimg}
            alt="Robot Error"
            className="robot-image"
          />
        </div>

        <div className="error-buttons">
          <button className="try-again-btn" onClick={() => window.location.reload()}>
            Try Again
          </button>
          <button
            className="back-btn"
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
