import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../../public/CSS/Login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/auth/login", form);
      localStorage.setItem("token", res.data.token);
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
          <h2>Welcome Back</h2>
          <form onSubmit={handleSubmit}>
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

            <button type="submit" className="btn">Login</button>

            {error && <p className="error">{error}</p>}
          </form>

          <div className="signup">
            Don’t have an account?{" "}
            <a href="/signup">Sign Up</a>
          </div>
        </div>
      </div>
    </div>
  );
}
