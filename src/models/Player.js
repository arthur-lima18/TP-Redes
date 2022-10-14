// o que o player precisa?
// Nome, Jogada, socketID

class Player {
    constructor(name, index, socketID) {
        this._name = name
        this._choice = null
        this._socketID = socketID
        this._score = 0
        this._index = index
    }

    get name() { return this._name }
    get choice() { return this._choice }
    get socketID() { return this._socketID }
    get score() { return this._score }
    get index() { return this._index }

    set choice(value) {
        this._choice = value
    }

    incrementScore() {
        this._score++
    }
}

export default Player