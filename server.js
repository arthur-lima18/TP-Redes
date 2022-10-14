import http from "http"
import express from "express"
import { Server } from "socket.io"
import ejs from "ejs"

import Player from './src/models/Player.js'
import Game from './src/models/Game.js'

const app = express()
const server = http.Server(app).listen(8000)
const socket = new Server(server)
const clients = {}

//configurando uso dos arquivos 
app.use(express.static('./public'))
app.use('/vendor', express.static('./node_modules'))

app.set('views', './public')
app.set('view engine', 'html')
app.engine('html', ejs.renderFile)

//renderizando a pagina principal ao acessar a rota raiz
app.get('/', (req, res) => {
    return res.render('index.html')
})

const games = {} //objeto para criar as partidas
let unmatched = null //variavel que funciona como uma "fila" de partidas

//conexao via socket
socket.on('connection', (sock) => {
    let id = sock.id
    console.log(`Novo cliente conectado: ${id}`)
    clients[id] = sock

    //evento para inicio do jogo
    sock.on('game.begin', (data) => {
        const game = joinPlayers(sock, data)

        //se tiver um segundo jogador
        if(game.player2) {
            console.log(`A partida vai começar!`)

            //emit para o front de que a partida vai começar
            clients[game.player1.socketID].emit('game.begin', game)
            clients[game.player2.socketID].emit('game.begin', game)
        }
    })

    //quando um player fizer uma escolha
    sock.on('make.choice', (data) => {
        const game = games[sock.id]
        
        game.board.setChoice(data.index, data.choice)
        
        const event = "choice.made"
        if(data.index == 0){
            clients[game.player1.socketID].emit(event, game)
            game.incrementNumberChoices()
            console.log('choice.made 1 foi chamado')
        }
        else if(data.index == 1){
            clients[game.player2.socketID].emit(event, game)
            game.incrementNumberChoices()
            console.log('choice.made 2 foi chamado')
        }
        //verifica se os dois jogadores fizeram suas jogadas
        if(game.numberChoices == 2) {
            //chama a funcao de fim de round
            console.log("proxima rodada")
            game.incrementRound()
            console.log(game.round)
            game.board.resetChoices()
        }
        
    })
    
    //desconexao dos dois jogadores caso um saia
    sock.on('disconnect', () => {
        const game = games[sock.id]
        if(game) {
            const socketEmitPlayerLeft = game.player1.socketID == socket.id ? clients[game.player2.socketID] : clients[game.player1.socketID]
        
            if(socketEmitPlayerLeft)
                socketEmitPlayerLeft.emit('opponent.left')

            delete games[socket.id]
            delete games[socketEmitPlayerLeft.id]
        }
        delete clients[id]
    })
})

function joinPlayers(socket, data) {
    const playerIndex = unmatched ? 1 : 0
    const player = new Player(data.playerName, playerIndex, socket.id)

    //se ja tiver algum jogador esperando
    if(unmatched) {
        unmatched.player2 = player //adicionando o jogador ao game
        games[unmatched.player1.socketID] = unmatched
        games[unmatched.player2.socketID] = unmatched
        unmatched = null
        return games[socket.id]
    }
    //se nao tiver jogador esperando
    else {
        unmatched = new Game(player)
        return unmatched
    }
}