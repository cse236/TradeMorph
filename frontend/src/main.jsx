import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {BrowserRouter,Routes,Route} from "react-router-dom";
import './index.css'
import App from './App.jsx'
import ErrorPage from "./pages/ErrorPage.jsx";
import HomePage from "./pages/HomePage/HomePage.jsx";

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage/>}/>
      <Route path="*" element={<ErrorPage/>}/>

    </Routes>
  </BrowserRouter>
)
