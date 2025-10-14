import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
       
      {user ? <h2>Welcome, your ID: {user.username}</h2> : <p>Loading...</p>}
      <button onClick={() => { localStorage.removeItem("token"); navigate("/login"); }}>Logout</button>
    </div>
    </> );
}

export default Dashboard;
