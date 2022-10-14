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
    }

    get player1() { return this._player1 }
    get player2() { return this._player2 }
    get board() { return this._board }
    get gameOver() { return this._gameOver }
    get winner() { return this._winner }
    get round() { return this._round }
    get numberChoices() { return this._numberChoices }

    set player2(player2) {
        this._player2 = player2
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
}

export default Game