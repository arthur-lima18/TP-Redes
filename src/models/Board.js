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

    //Pedra  - 1
    //Papel  - 2
    //Tesoura- 3
    roundWinner() {
        if(this._choices[0].choice == this._choices[1].choice)
            return 0 //empate
        else if((this._choices[0].choice == 1 && this._choices[1].choice == 3) ||
                (this._choices[0].choice == 2 && this._choices[1].choice == 1) ||
                (this._choices[0].choice == 3 && this._choices[1].choice == 2))
            return 1 //player1 ganhou a rodada
        else
            return 2 //player2 ganhou a rodada
    }

    resetChoices() {
        this._choices.forEach((option) => (option.choice = null))
    }
}

export default Board