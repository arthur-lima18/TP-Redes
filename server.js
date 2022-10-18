import http from "http"
import express from "express"
import { Server } from "socket.io"
import ejs from "ejs"

import Player from './src/models/Player.js'
import Game from './src/models/Game.js'

const app = express()
const server = http.Server(app).listen(8000)
// const server = http.Server(app).listen(8000, '192.168.2.113')
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

const games = {} //objeto para criar as partidas e permitir que aconteçam mais de uma ao mesmo tempo
let unmatched = null //variavel que funciona como uma "fila" de partidas, se for true é pq uma partida ainda nao foi encontrada e ha um usuario esperando

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
            game.player1.choice = data.choice
        }
        else if(data.index == 1){
            clients[game.player2.socketID].emit(event, game)
            game.incrementNumberChoices()
            game.player2.choice = data.choice
        }

        //verifica se os dois jogadores fizeram suas jogadas
        if(game.numberChoices == 2) {
            game.setChoicesHistory(game.round, game.player1.choice, game.player2.choice)
            //chama a funcao de fim de round e pega o vencedor da rodada
            let roundWinner = game.checkRoundWinner()
            game.setScoreboard(roundWinner)
            
            //verifica se os 5 rounds foram completados ou se algum jogador atingiu 3 pontos
            let isGameOver = game.checkGameOver()
            
            setTimeout(() => {//deve chamar um endpoint gameover
                if(isGameOver.gameOver == true) {
                    clients[game.player1.socketID].emit('gameover', {winner: isGameOver.winner})
                    clients[game.player2.socketID].emit('gameover', {winner: isGameOver.winner})
                }
                else {
                    //indicador do proximo round
                    game.board.resetChoices()
                    game.resetNumberChoices()
                
                    //passa o roundWinner pelo emit do round.reset para personalizar a mensagem ao usuario
                    clients[game.player1.socketID].emit('round.reset', {roundWinner: roundWinner})
                    clients[game.player2.socketID].emit('round.reset', {roundWinner: roundWinner})
                }
                game.incrementRound()
            }, 1500)
        }
    })
    
    //desconexao dos dois jogadores caso um saia
    sock.on('disconnect', () => {
        const game = games[sock.id]
        if(game) {
            const socketEmitPlayerLeft = game.player1.socketID == sock.id ? clients[game.player2.socketID] : clients[game.player1.socketID]
        
            if(socketEmitPlayerLeft)
                socketEmitPlayerLeft.emit('opponent.left')

            delete games[socket.id]
        }
        delete clients[id]
    })
})

function joinPlayers(socket, data) {
    const playerIndex = unmatched ? 2 : 1
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