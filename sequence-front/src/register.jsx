import React, { useState, useEffect } from 'react';
import './Register.css';
import { useNavigate } from 'react-router-dom';
import { useSocket } from "./context/SocketProvider.jsx";

const Register = () => {
    const [form, setForm] = useState({ nom: "" });
    const socket = useSocket();
    const navigate = useNavigate();

    // localStorage.clear()

    const token = localStorage.getItem("token");

    useEffect(() => {

        document.title = "Sequence";

        // Écoute l'authentification une seule fois au chargement du composant

        socket.on("authenticate", (data) => {
            const {accessToken} = data;

            localStorage.setItem("token", accessToken);
            navigate("/game"); // Navigate uniquement quand le token est reçu
        });

        return () => {
            socket.off("authenticate");
        };
    }, [socket, navigate]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // if (!token) {
        //     socket.emit("authenticate", { name: form.nom });
        // }else{
            socket.emit("connection", {name: form.nom, accessToken: token})
        // }

    };

    return (
        <div className="register-page">
            <div className="back-arrow" onClick={() => navigate(-1)}>←</div>

            <form className="register-form" onSubmit={handleSubmit}>
                <label>Nom</label>
                <input id="nom" name="nom" onChange={handleChange} required />

                <button type="submit" className="btn yellow">
                    Rejoindre
                </button>
            </form>
        </div>
    );
};

export default Register;
