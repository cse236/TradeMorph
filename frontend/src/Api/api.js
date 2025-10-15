import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/auth", // backend auth routes
  withCredentials: true,                 // allows cookies to be sent/received
});

export default API;
