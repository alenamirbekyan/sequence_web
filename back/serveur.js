const express = require("express");
const app = express();
// const path = require("path");
const {Server} = require("socket.io");
const http = require("http");
const cors = require("cors");
const jwt = require('jsonwebtoken');
const {decode} = require("jsonwebtoken");

app.use(cors({
    origin: "http://localhost:5173", // autorise Vite à accéder au serveur
    credentials: true
}));
const server = http.createServer(app);

const playerSocket = new Map();

const colors = ["red", "blue", "yellow", "black", "green"]

let session = Date.now()

let played

let max_player = 2

let tour_joueur = -1

let game_started = false

const board = [
    ["🃏"  , "2♠️" , "3♠️" , "4♠️" , "5♠️" , "6♠️" , "7♠️" , "8♠️" , "9♠️" , "🃏"],
    ["6♣️" , "5♣️" , "4♣️" , "3♣️" , "2♣️" , "A♥️" , "K♥️" , "D♥️" , "10♥️", "10♠️"],
    ["7♣️" , "A♠️" , "2♦️" , "3♦️" , "4♦️" , "5♦️" , "6♦️" , "7♦️" , "9♥️" , "D♠️"],
    ["8♣️" , "K♠️" , "6♣️" , "5♣️" , "4♣️" , "3♣️" , "2♣️" , "8♦️" , "8♥️" , "K♠️"],
    ["9♣️" , "D♠️" , "7♣️" , "6♥️" , "5♥️" , "4♥️" , "A♥️" , "9♦️" , "7♥️" , "A♠️"],
    ["10♣️", "10♠️", "8♣️" , "7♥️" , "2♥️" , "3♥️" , "K♥️" , "10♦️", "6♥️" , "2♦️"],
    ["D♣️" , "9♠️" , "9♣️" , "8♥️" , "9♥️" , "10♥️", "D♥️" , "D♦️" , "5♥️" , "3♦️"],
    ["K♣️" , "8♠️" , "10♣️", "D♣️" , "K♣️" , "A♣️" , "A♦️" , "K♦️" , "4♥️" , "4♦️"],
    ["A♣️" , "7♠️" , "6♠️" , "5♠️" , "4♠️" , "3♠️" , "2♠️" , "2♥️" , "3♥️" , "5♦️"],
    ["🃏"  , "A♦️" , "K♦️" , "D♦️" , "10♦️", "9♦️" , "8♦️" , "7♦️" , "6♦️" , "🃏"]
]

let pioche

let defausse

let emplacement_jeton

// let pioche = [ "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️"]

const valetAjout =  ["V♠️", "V♣️"]

const valetSuppr = ["V♦️", "V♥️"]

app.use(express.json()); // à mettre AVANT les routes

app.post("/join_game", (req, res) => {
    const nom = req.body.nom;
    res.setHeader("Content-Type", "application/json");
    // if(!nom in players){
    //     players.push(nom)
    //     player_number = player_number+1
        res.json({ status: "ok", joueur: nom});
    // }else{
    //     res.json({ status: "error", error:"player with this name already exist"});
    // }
});

app.post("/board_json", (req, res) => {
    data = [
        ["🃏"  , "2♠️" , "3♠️" , "4♠️" , "5♠️" , "6♠️" , "7♠️" , "8♠️" , "9♠️" , "🃏"],
        ["6♣️" , "5♣️" , "4♣️" , "3♣️" , "2♣️" , "A♥️" , "K♥️" , "D♥️" , "10♥️", "10♠️"],
        ["7♣️" , "A♠️" , "2♦️" , "3♦️" , "4♦️" , "5♦️" , "6♦️" , "7♦️" , "9♥️" , "D♠️"],
        ["8♣️" , "K♠️" , "6♣️" , "5♣️" , "4♣️" , "3♣️" , "2♣️" , "8♦️" , "8♥️" , "K♠️"],
        ["9♣️" , "D♠️" , "7♣️" , "6♥️" , "5♥️" , "4♥️" , "A♥️" , "9♦️" , "7♥️" , "A♠️"],
        ["10♣️", "10♠️", "8♣️" , "7♥️" , "2♥️" , "3♥️" , "K♥️" , "10♦️", "6♥️" , "2♦️"],
        ["D♣️" , "9♠️" , "9♣️" , "8♥️" , "9♥️" , "10♥️", "D♥️" , "D♦️" , "5♥️" , "3♦️"],
        ["K♣️" , "8♠️" , "10♣️", "D♣️" , "K♣️" , "A♣️" , "A♦️" , "K♦️" , "4♥️" , "4♦️"],
        ["A♣️" , "7♠️" , "6♠️" , "5♠️" , "4♠️" , "3♠️" , "2♠️" , "2♥️" , "3♥️" , "5♦️"],
        ["🃏"  , "A♦️" , "K♦️" , "D♦️" , "10♦️", "9♦️" , "8♦️" , "7♦️" , "6♦️" , "🃏"]
    ]

    res.json({status: "ok", board: data});
});

// Une route simple pour tester
app.get('/', (req, res) => {
    res.send('Hello from server');
});

// Créer le serveur Socket.IO lié à ce serveur HTTP
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:5173", "http://192.168.1.50:5173"],
        methods: ['GET', 'POST']
    }
});

function generateToken(username){
    return jwt.sign({ username: username, session: session }, "CESI2025@Fisa");
}

function verifyToken(token){
    if(token){
        let decode = tokenInfo(token)
        return (decode.session == session)
    }else{
        return false
    }
}

function verifierVertical(x,y,color){
    let i = 0
    let continuer = true
    let coord = []
    let same_token = false
    while (continuer && i<5){
        // console.log(i, " emplacement ", emplacement_jeton[y+i][x])
        continuer = [color, "J", color+"_used"].includes(emplacement_jeton[y+i][x])
        coord.push([y+i, x])
        if(emplacement_jeton[y+i][x] == color+"_used"){
            if(!same_token)
                same_token = true
            else
                continuer = false
        }
        if(continuer)i++
    }
    if(i>4){
        coord.forEach((c)=>{
            if(emplacement_jeton[c[0]][c[1]] != "J")
                emplacement_jeton[c[0]][c[1]] = emplacement_jeton[c[0]][c[1]]+"_used"
        })
        return true
    }else{
        return false
    }
}

function verifierHorizontal(x,y,color){
    let i = 0
    let continuer = true
    let coord = []
    let same_token = false
    while (continuer && i<5){
        continuer = [color, "J", color+"_used"].includes(emplacement_jeton[y][x+i])
        coord.push([y, x+i])
        if(emplacement_jeton[y][x+i] == color+"_used"){
            console.log("same token")
            if(!same_token)
                same_token = true
            else
                continuer = false
        }
        if(continuer)i++
    }
    if(i>4){
        coord.forEach((c)=>{
            if(emplacement_jeton[c[0]][c[1]] != "J")
                emplacement_jeton[c[0]][c[1]] = emplacement_jeton[c[0]][c[1]]+"_used"
        })
        return true
    }else{
        return false
    }
}

function verifierDiagonalDroite(x,y,color){
    let i = 0
    let continuer = true
    let coord = []
    let same_token = false
    while (continuer && i<5){
        // console.log(i, " emplacement ", emplacement_jeton[y+i][x+i], " coord ", x+i, y+i)
        continuer = [color, "J", color+"_used"].includes(emplacement_jeton[y+i][x+i])
        coord.push([y+i, x+i])
        if(emplacement_jeton[y+i][x+i] == color+"_used"){
            if(!same_token)
                same_token = true
            else
                continuer = false
        }
        if(continuer)i++
    }
    // console.log(" fin while ", i)

    if(i>4){
        coord.forEach((c)=>{
            if(emplacement_jeton[c[0]][c[1]] != "J")
                emplacement_jeton[c[0]][c[1]] = emplacement_jeton[c[0]][c[1]]+"_used"
        })
        return true
    }else{
        return false
    }
}

function verifierDiagonalGauche(x,y,color){
    let i = 0
    let continuer = true
    let coord = []
    let same_token = false
    while (continuer && i<5){
        console.log(i, " emplacement ", emplacement_jeton[y+i][x-i], " coord ", x+i, y+i)
        continuer = [color, "J", color+"_used"].includes(emplacement_jeton[y+i][x-i])
        coord.push([y+i, x-i])
        if(emplacement_jeton[y+i][x-i] == color+"_used"){
            if(!same_token)
                same_token = true
            else
                continuer = false
        }
        if(continuer)i++
    }
    console.log(" fin while ", i)
    console.log(coord)
    if(i>4){
        coord.forEach((c)=>{
            if(emplacement_jeton[c[0]][c[1]] != "J")
                emplacement_jeton[c[0]][c[1]] = emplacement_jeton[c[0]][c[1]]+"_used"
        })
        return true
    }else{
        return false
    }
}

function verifierVictoire(x,y, color){
    let  x_deb= x-4
    if(x_deb<0)
        x_deb=0
    let y_deb= y-4
    if(y_deb<0)
        y_deb=0
    let res = false
    for(let i = x_deb; i<=x; i++){
        for(let j = y_deb; j<=y; j++){
            if(!res && j<6){
                // console.log(" x: ",i," y: ", j, " color: ", color)
                res = verifierVertical(i,j,color)
            }
            if(!res && i<6){
                // console.log(" x: ",i," y: ", j, " color: ", color)
                res = verifierHorizontal(i,j,color)
            }
            if(!res && i<6 && j<6){
                // console.log(" x: ",i," y: ", j, " color: ", color)
                res = verifierDiagonalDroite(i,j,color)
            }
        }
    }
    if (res==false){
        x_deb= x+4
        if(x_deb>9)
            x_deb=9
        y_deb= y-4
        if(y_deb<0)
            y_deb=0

        for(let i = x; i<=x_deb; i++){
            for(let j = y_deb; j<=y; j++){
                if(!res && j<6 && i>3){
                    // console.log(" x: ",i," y: ", j, " color: ", color)
                    res = verifierDiagonalGauche(i,j,color)
                }
            }
        }
    }
    return res
}

function updateDeck(key){
    while (playerSocket.get(key).deck.length<8){
        let cardIndex = Math.floor(Math.random()*pioche.length)
        playerSocket.get(key).deck.push(pioche[cardIndex])
        pioche.splice(cardIndex, 1)
        if(pioche.length == 0){
            console.log("pioche vide")
            pioche = defausse
            defausse = []
        }
    }
}

function fin(){
    playerSocket.keys().forEach((key)=>{
        if (playerSocket.get(key).id == tour_joueur){
            io.to(playerSocket.get(key).socket).emit("youWin", {deck: playerSocket.get(key).deck});
        }else{
            io.to(playerSocket.get(key).socket).emit("youLost", {deck: playerSocket.get(key).deck});
        }
    })
    tour_joueur = -1
}

function nextTurn(){
    console.log("tour joueur ", tour_joueur)
    // console.log(emplacement_jeton)
    playerSocket.keys().forEach((key)=>{
        if (playerSocket.get(key).id == tour_joueur){
            updateDeck(key)
            io.to(playerSocket.get(key).socket).emit("myTurn", {deck: playerSocket.get(key).deck});
        }
    })
}

function startGame(){

    pioche = ["A♦️" , "K♦️" , "D♦️" , "V♦️", "10♦️", "9♦️" , "8♦️" , "7♦️" , "6♦️", "5♦️", "2♦️" , "3♦️" , "4♦️", "2♠️" , "3♠️" , "4♠️" , "5♠️" , "6♠️" , "7♠️" , "8♠️" , "9♠️", "10♠️", "V♠️", "D♠️", "K♠️", "A♠️", "A♥️" , "K♥️" , "D♥️" , "V♥️", "10♥️", "9♥️" , "8♥️" , "7♥️" , "6♥️", "5♥️", "2♥️" , "3♥️" , "4♥️", "2♣️" , "3♣️" , "4♣️" , "5♣️" , "6♣️" , "7♣️" , "8♣️" , "9♣️", "10♣️", "V♣️", "D♣️", "K♣️", "A♣️", "A♦️" , "K♦️" , "D♦️" , "V♦️", "10♦️", "9♦️" , "8♦️" , "7♦️" , "6♦️", "5♦️", "2♦️" , "3♦️" , "4♦️", "2♠️" , "3♠️" , "4♠️" , "5♠️" , "6♠️" , "7♠️" , "8♠️" , "9♠️", "10♠️", "V♠️", "D♠️", "K♠️", "A♠️", "A♥️" , "K♥️" , "D♥️" , "V♥️", "10♥️", "9♥️" , "8♥️" , "7♥️" , "6♥️", "5♥️", "2♥️" , "3♥️" , "4♥️", "2♣️" , "3♣️" , "4♣️" , "5♣️" , "6♣️" , "7♣️" , "8♣️" , "9♣️", "10♣️", "V♣️", "D♣️", "K♣️", "A♣️"]
    //pioche = [ "V♦️", "V♦️", "V♦️", "V♦️", "V♦️", "V♦️", "V♦️", "V♦️", "V♦️", "V♦️", "V♦️", "V♦️", "V♦️", "V♦️", "V♦️", "V♦️", "V♦️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️", "V♣️"]

    defausse = []
    played = []
    emplacement_jeton = []

    for (let i = 0; i<10; i++){
        emplacement_jeton.push([])
        for (let j = 0; j<10; j++){
            emplacement_jeton[i].push("")
        }
    }

    emplacement_jeton[0][0] = "J"
    emplacement_jeton[0][9] = "J"
    emplacement_jeton[9][0] = "J"
    emplacement_jeton[9][9] = "J"

    game_started = true
    tour_joueur = 0

    playerSocket.keys().forEach((key)=>{
        io.to(playerSocket.get(key).socket).emit("restart");
        io.to(playerSocket.get(key).socket).emit("board", {board : board, deck: []});
        playerSocket.get(key).deck = []
        playerSocket.get(key).points = 0
        played.forEach((coup)=>{
            io.to(playerSocket.get(key).socket).emit("coup", { index: coup.coord, color: coup.color })
        })
    })
    nextTurn()
}

io.on('connection', (socket) => {

    console.log('Client connecté:', socket.id);

    socket.on("connection", async (data) => {
        const {accessToken, name} = data;
        if(verifyToken(accessToken)){
            console.log(accessToken)
            playerSocket.set(accessToken, {id: playerSocket.get(accessToken).id, socket: socket.id, deck: []});
            socket.emit("authenticate", {accessToken})
        }
        else{
            const accessToken = generateToken(name)
            playerSocket.set(accessToken, {id:playerSocket.size, socket:socket.id, deck: [], points:0})
            socket.emit("authenticate", {accessToken})
        }
        if(playerSocket.size == max_player){
            startGame()
        }
    });

    socket.on('disconnect', () => {});

    socket.on('play', (data)=>{
        const {token, cardIndex, selectedCard} = data;
        console.log(selectedCard)
        if (!verifyToken(token)){
            console.log("expired")
            socket.emit("sessionExpired")
            return
        }

        let y = Math.floor(cardIndex/10)
        let x = cardIndex%10

        let id = playerSocket.get(token).id
        if (coupValide(cardIndex, id, token, selectedCard)){
            const color = colors[playerSocket.get(token).id]
            const allSocketIds = [];
            playerSocket.keys().forEach((key) => {
                allSocketIds.push(playerSocket.get(key).socket)
            })

            if(valetSuppr.includes(selectedCard)) {
                emplacement_jeton[y][x] = ""
                for (let i = 0; i < played.length; i++) {
                    if (played[i].coord == cardIndex) {
                        played.splice(i, 1)
                        console.log("coup supprimé " + i)
                    }
                }
                allSocketIds.forEach(id => {
                    io.to(id).emit("supprimerJeton", {index: cardIndex, dernier: defausse[defausse.length - 1]});
                    io.to(id).emit("notMyTurn");
                });
            }else {
                played.push({id: token, color: color, coord: cardIndex})
                emplacement_jeton[y][x] = color
                allSocketIds.forEach(id => {
                    io.to(id).emit("coup", {index: cardIndex, color: color, dernier: defausse[defausse.length - 1]});
                    io.to(id).emit("notMyTurn");
                });
            }
            if(verifierVictoire(x,y, color)) {
                playerSocket.get(token).points += 1
                console.log("sequence")
                if (playerSocket.get(token).points == 2) {
                    fin()
                } else {
                    tour_joueur += 1
                    tour_joueur = tour_joueur % 2
                    nextTurn()
                }
            }else{
                tour_joueur += 1
                tour_joueur = tour_joueur % 2
                nextTurn()
            }
        }else{
            socket.emit("not Valide")
            console.log("non valide")
        }

    })

    socket.on("get_board", ()=>{
        if(game_started){
            socket.emit("board", {board : board, deck: []})
            played.forEach((coup)=>{
                socket.emit("coup", { index: coup.coord, color: coup.color })
            })
            nextTurn()
        }
    })

    socket.on("reset", ()=>{
        session = Date.now()
        playerSocket.clear()
        startGame()
    })

    socket.on("defausser", (data)=>{
        const {selectedCard, token } = data
        let id = playerSocket.get(token).id
        if (id == tour_joueur) {
            // console.log(played)
            let dispo = 2
            played.forEach((coup)=>{
                let y = Math.floor(coup.coord/10)
                let x = coup.coord%10
                if(board[y][x] == selectedCard){
                    console.log("yes ", selectedCard)
                    dispo-=1
                }
            })
            if (dispo == 0){
                let index = playerSocket.get(token).deck.indexOf(selectedCard);
                if (index !== -1) {
                    playerSocket.get(token).deck.splice(index, 1);
                    defausse.push(selectedCard)
                    updateDeck(token)
                    io.to(playerSocket.get(token).socket).emit("myTurn", {deck: playerSocket.get(token).deck});
                }
            }
        }
    })

});

function tokenInfo(token){
    let decodedToken = jwt.verify(token, "CESI2025@Fisa", (err, decoded) => {
        if(err){
            console.log(err);
            return "error"
        }
        return decoded
    });
    return decodedToken
}

function coupValide(index, id, token, played_card){
    if (id == tour_joueur){

        let boardCard = board[Math.floor(index/10)][index%10]

        console.log("played card: " + played_card + " board card " + boardCard)

        let droitJouer

        let valide = (emplacement_jeton[Math.floor(index/10)][index%10] == "")

        if(valetAjout.includes(played_card)){
            droitJouer = true
        }else if(valetSuppr.includes(played_card)){
            valide = (emplacement_jeton[Math.floor(index/10)][index%10] != "" && !emplacement_jeton[Math.floor(index/10)][index%10].includes("_used"))
            droitJouer = true
        }else{
            droitJouer = played_card == boardCard
        }

        console.log("valide ", valide, "droit ", droitJouer)

        if (valide && droitJouer){
            let index = playerSocket.get(token).deck.indexOf(played_card);
            if (index !== -1) {
                playerSocket.get(token).deck.splice(index, 1);
                io.to(playerSocket.get(token).socket).emit("updateDeck", {deck: playerSocket.get(token).deck});
                defausse.push(played_card)
                return valide
            }
        }else{
            return false
        }
    }else{
        return false
    }
}


server.listen(3000, () => {
    console.log('Serveur démarré sur le port 3000');
});
