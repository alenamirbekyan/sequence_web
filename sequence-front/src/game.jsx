import {useEffect, useState} from "react";
import {useNavigate} from 'react-router-dom';
import './game.css'
import {useSocket} from "./context/SocketProvider.jsx";

const Game = () => {

    const navigate = useNavigate();
    const [board, setBoard] = useState([]);
    const [myTurn, setMyTurn] = useState(false);
    const [playerHand, setPlayerHand] = useState([]);
    const [lastPlayedCard, setLastPlayedCard] = useState([]);
    const token = localStorage.getItem("token");
    const [selectedCard, setSelectedCard] = useState()
    const [end, setEnd] = useState(null)
    const [lastPlayedToken, setLastPlayedToken] = useState(null)

    const socket = useSocket();

    useEffect(() => {
        if (!token) {
            navigate("/register");
            return;
        }
        socket.emit("get_board")

        function updateBoard(cellIndex, color) {
            const boardElement = document.getElementById("board");
            let cell = boardElement.children[cellIndex];
            if (!cell) return; // sécurité

            cell.dataset.clicked = "true";

            const token = document.createElement("div");
            token.classList.add("token", color);
            cell.appendChild(token);
        }

        socket.on("myTurn", (data)=>{
            const {deck} = data
            setMyTurn(true);
            document.body.classList.add("green");
            document.body.classList.remove("red");
            setPlayerHand(deck)
        })

        socket.on("board", (data)=>{
            const {board, deck} = data
            console.log(data)
            setPlayerHand(deck)
            setBoard(board)
        })

        socket.on("coup", (data) => {
            const {index, color, dernier} = data;
            updateBoard(index, color)
            setLastPlayedCard(dernier)
            setLastPlayedToken(index)
        })

        socket.on("sessionExpired", (data) => {
            navigate("/register")
        })

        socket.on("notMyTurn", () => {
            setMyTurn(false);
            document.body.classList.add("red");
            document.body.classList.remove("green");
        })

        function supprimerJeton(index){
            const boardElement = document.getElementById("board");
            let cell = boardElement.children[index];
            if (!cell) return; // sécurité
            cell.removeChild(cell.childNodes[1])
        }

        socket.on("supprimerJeton", (data) => {
            const {index, dernier} = data;
             console.log("supprimer jeton")
            supprimerJeton(index)
            setLastPlayedCard(dernier)
        })

        socket.on("updateDeck", (data)=> {
            const {deck} = data
            setPlayerHand(deck)
        })

        socket.on("youWin", ()=>{
            setEnd("You Win")
        })

        socket.on("youLost", ()=>{
            setEnd("You Lost")
        })

        socket.on("restart", ()=>{
            setMyTurn(false);
            socket.emit("get_board")
        })

        return () => {
            socket.off("myTurn");
            socket.off("sessionExpired")
            socket.off("coup")
            socket.off("board")
            socket.off("updateDeck")
            socket.off("supprimerJeton")
            socket.off("youWin")
            socket.off("youLost")
            socket.off("restart")
        };

    }, [])

    function playTurn(cardIndex){
        // if(myturn)
        socket.emit("play", {selectedCard, cardIndex, token });
    }

    function resetGame(){
        socket.emit("reset")
    }

    function defausser(){
        socket.emit("defausser", {selectedCard, token })
    }

    const handleClick = (row, col) => {
        playTurn(row*10+col)
    };

    const handleSelectCard = (selectedCard) => {

        setSelectedCard(selectedCard)
    }

    const reset = () => {
        console.log("clicked")
        resetGame();
    }

    const handleDefausser = () =>{
        defausser()
    }

    return (
        <div>
            <div className="page-title">Sequence</div>
            {myTurn && <div className="your-turn-banner">Your turn!</div>}
            {!myTurn && <div className="wait-turn-banner">Wait!</div>}
            <div className="page-title" onClick={() => reset()}>{end}</div>
            <div className="game-container">
                <div className="sidebar">
                    <div className="last-played-card">
                        <div className="card" onClick={() => handleDefausser()}>
                            {lastPlayedCard ? (
                                <>
                                    <span>{lastPlayedCard}</span>
                                </>
                            ) : (
                                <span>–</span>
                            )}
                        </div>
                        <p>Dernière carte jouée</p>
                    </div>
                </div>
                <div className="board" id="board">
                    {board.map((row, rowIndex) =>
                        row.map((cellValue, colIndex) => {
                            const flatIndex = rowIndex * 10 + colIndex;
                            const isLastPlayed = flatIndex === lastPlayedToken;

                            return (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className={`cell ${isLastPlayed ? "highlight" : ""}`}
                                    data-row={rowIndex}
                                    data-col={colIndex}
                                    onClick={() => handleClick(rowIndex, colIndex)}
                                >
                                    {cellValue}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            <div className="deck">
                {playerHand.map((card, index) => (
                    <div
                        key={index}
                        className={`card ${selectedCard === card ? 'selected' : ''}`}
                        onClick={() => handleSelectCard(card)}
                    >
                        {card.value} <span className="suit">{card}</span>
                    </div>
                ))}
            </div>
        </div>
    );

}

export default Game
