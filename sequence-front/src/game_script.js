// import { useSocket } from "./SocketProvider.jsx";

document.addEventListener("DOMContentLoaded", () => {
    fetch("join_game")
        .then((res) => added(res))
    // fetch("/board.json")
    //     .then((res) => res.json())
    //     .then((board) => renderBoard(board))
    //     .catch((err) => console.error("Erreur chargement plateau:", err));
});


function updateBoard(cellIndex, color){
    const boardElement = document.getElementById("board");
    let cell = boardElement.children[cellIndex]
    cell.clicked = true
    const token = document.createElement('div');
    token.classList.add('token', color);
    cell.appendChild(token);
}

function click(event){
    updateBoard(event.target.index, "red")
}