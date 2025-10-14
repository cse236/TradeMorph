import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../CSS/Login.css";

export default function Signup() {
  const [form, setForm] = useState({ 
    username: "", 
    email: "",
    password: "" 
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/auth/signup", form);
      alert("Signup successful!");
      navigate("/dashboard");
    } catch (err) {
      setError(err.response.data.message);
    }
  };

  return (
   <div className="login-page">
      <div className="login-container">
        <div className="left">
          <div className="overlay"></div>
          <div className="logo">TradeMorph</div>
        </div>

        <div className="right">
          <h2>Create an Account</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-box">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="input-box">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            <button type="submit" className="btn">Sign Up</button>

            {error && <p className="error">{error}</p>}
          </form>

          <div className="signup">
            Already have an account?{" "}
            <a href="/login">Login</a>
          </div>
        </div>
      </div>
    </div>
  );
}
