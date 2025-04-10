import React from 'react';
import {BrowserRouter as Router,Routes,Route} from "react-router-dom";
import Home from "./components/Home.jsx";
import { Main } from './components/Main.jsx';
import Register from './components/Register.jsx';
import { CalculateGPA } from './components/CalculateGPA.jsx';
import { LevelUp } from './components/Levelup.jsx';

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/main" element={<Main />} />
          <Route path="/register" element={<Register />} />
          <Route path="/calculategpa" element={<CalculateGPA />}/>
          <Route path="/levelup" element={<LevelUp />}/>
        </Routes>
      </Router>
    </div>
  );
}

export default App;
