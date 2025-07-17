// src/socket.jsx
import { io } from "socket.io-client";

let socket;
const host = window.location.hostname;

export const getSocket = () => {
    if (!socket) {
        socket = io({
            autoConnect: false,
        });
    }

    console.log("socek recuperer")
    return socket;
};
