//classe que vai unir Player e Board
//logistica de placar etc

import Board from "./Board.js"

class Game {
    constructor(player1) {
        this._player1 = player1
        this._player2 = null
        this._board = new Board()
        this._gameOver = null
        this._winner = null
        this._round = 1
        this._numberChoices = 0
        this._scoreboard = [0, 0]
    }

    get player1() { return this._player1 }
    get player2() { return this._player2 }
    get board() { return this._board }
    get gameOver() { return this._gameOver }
    get winner() { return this._winner }
    get round() { return this._round }
    get numberChoices() { return this._numberChoices }
    get scoreboard() { return this._scoreboard }

    set player2(player2) {
        this._player2 = player2
    }

    getScoreboard1() { return this._scoreboard[0] }
    getScoreboard2() { return this._scoreboard[1] }
    setScoreboard(roundWinner) {
        roundWinner == 0 ? this._scoreboard[0]++ : this._scoreboard[1]++
    }

    incrementRound() {
        this._round++
    }

    incrementNumberChoices() {
        this._numberChoices++
    }

    resetNumberChoices() {
        this._numberChoices = 0
    }

    checkRoundWinner() {
        const roundWinner = this._board.roundWinner()
        if(roundWinner == 1)
            this._player1.incrementScore()
        else if(roundWinner == 2)
            this._player2.incrementScore()
        return roundWinner
    }

    checkGameOver() {
        if(this._player1.score == 3)
            return { gameOver: true, winner: 1 }
        else if(this._player2.score == 3)
            return { gameOver: true, winner: 2 }
        else if(this._round == 5)
            return { gameOver: true, winner: 0 }
        return { gameOver: false, winner: null }
    }
}

export default Game