import React, { useState, useEffect } from 'react';
import './Home.css';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
    const navigate = useNavigate();

    useEffect(() => {
        document.title = "Sequence";

    }, [navigate]);

    const backgroundStyle = {
        backgroundImage: 'url("/Landing.jpeg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    };


    return (
        <div style={backgroundStyle}>
            <div className="home-overlay" />
                <div className="home-content">
                <h1>Sequence</h1>
                <p>TODO tuto</p>
                <Link to="/register" className="cta-button">Play Sequence</Link>
            </div>
        </div>
    );
};

export default Home;
