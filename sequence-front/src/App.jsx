import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Game from './game';
import Home from './home.jsx'
import Register from "./register.jsx";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/game" element={<Game key="/game" />} />
                <Route path="/register" element={<Register key="/register" />} />
            </Routes>
        </Router>
    );
}

export default App;

