import { useState } from 'react'
import Dashboard from "./components/Dashboard"
import TopBar from "./components/TopBar"

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <TopBar/>
      <Dashboard/>
    </>
  )
}

export default App
