import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import MarketBehavior from "../components/MarketBehavior.jsx";




function Dashboard() {

    const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    axios
      .get("http://localhost:5000/auth/verify", { headers: { Authorization: token } })
      .then(res => {
        if (!res.data.status) navigate("/login");
        else setUser(res.data.user);
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

    return ( <>
    <div>
      <Navbar />

      {user ? (
        <>
          <h2>Welcome, {user.username}</h2>

          {/*  ML MODEL USED HERE */}
          <MarketBehavior />
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
    </> );
}

export default Dashboard;
