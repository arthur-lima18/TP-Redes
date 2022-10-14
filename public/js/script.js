const app = new Vue({
    el: '#app',
    data: {
        socket: null,
        game: null,
        choice: null,
        playerName: null,
        playerIndex: null,
        msg: "",
        blockRegister: false,
        haveChoice: false
    },
    methods: {
        startGame() {
            this.msg = "Aguardando adversário..."
            this.blockRegister = true
            this.socket.emit('game.begin', {
                playerName: this.playerName
            })
        },
        renderMsgChoose() {
            //haveChoice deve ser true quando o usuario adversario ja tiver escolhido
            this.msg = this.haveChoice ? `Aguardando escolha do adversário! Você escolheu ${this.playerChoiceNumber(this.choice)}`  : "Faça sua escolha!"
        },
        playerChoice(choice) {
            if(this.haveChoice) return

            this.haveChoice = true
            this.choice = choice
            this.socket.emit('make.choice', {
                index: this.playerIndex,
                choice: this.choice
            })

            this.renderMsgChoose()
        },
        playerChoiceNumber(choiceNumber) {
            if(choiceNumber == 1) return "Pedra"
            else if(choiceNumber == 2) return "Papel"
            else return "Tesoura"
        }
    },
    mounted() {
        this.socket = io.connect(window.location.origin)

        const backupThis = this

        this.socket.on('game.begin', (data) => {
            backupThis.game = data
            const myPlayer = data._player1._socketID == backupThis.socket.id ? data._player1 : data._player2
        
            backupThis.playerIndex = myPlayer._index
            backupThis.choice = myPlayer._choice
            backupThis.renderMsgChoose()
        })

        this.socket.on('choice.made', (data) => {
            backupThis.game = data
            backupThis.renderMsgChoose()
        })

        this.socket.on('opponent.left', () => {
            backupThis.game = null
            backupThis.blockRegister = false
            backupThis.msg = "O adversário saiu do jogo!"
        })
    }
})
