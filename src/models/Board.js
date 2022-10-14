//como vai ser o nosso tabuleiro?
//escolhas(2)

class Board {
    constructor() {
        this._choices = [
            { choice: 0 },
            { choice: 0 }
        ]
    }

    getChoice(index) {
        return this._options[index]
    }

    setChoice(index, choice) {
        this._choices[index].choice = choice
    }

    get choices() { return this._choices }
    
    resetChoices() {
        this._choices.forEach((option) => (option.choice = null))
    }
}

export default Board