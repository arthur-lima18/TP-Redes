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
        haveChoice: false,
        isRoundFinished: false
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
            //haveChoice deve ser true quando o usuario ja tiver escolhido
            this.msg = this.haveChoice ? `Aguardando escolha do adversário! Você escolheu ${this.playerChoiceNumber()}`  : "Faça sua escolha!"
        },
        playerChoice(choice) {
            if(this.haveChoice) return

            this.haveChoice = true
            this.choice = choice
            this.socket.emit('make.choice', {
                index: this.playerIndex-1,
                choice: this.choice
            })

            this.renderMsgChoose()
        },
        playerResetChoice() {
            this.haveChoice = false
            this.choice = null
        },
        playerChoiceNumber() {
            if(this.choice == 1) return "Pedra"
            else if(this.choice == 2) return "Papel"
            else return "Tesoura"
        }
    },
    mounted() {
        this.socket = io.connect(window.location.origin) //IP e porta da conexao

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

        this.socket.on('round.reset', (data) => {
            console.log(data.roundWinner)
            if(data.roundWinner == 0)
                backupThis.msg = "Houve um empate na rodada! Ninguém pontuou"
            else if(data.roundWinner == backupThis.playerIndex)
                backupThis.msg = "Você venceu a rodada! +1 ponto"
            else
                backupThis.msg = "Você perdeu a rodada!"
            
            setTimeout(() => {
                this.playerResetChoice()
                backupThis.renderMsgChoose()
            }, 2500)
        })

        // this.socket.on('update.scoreboard', () => {
            
        // })

        this.socket.on('gameover', (data) => {
            console.log(data)
            if(data.winner == 0)
                backupThis.msg = "Houve um empate!"
            else if(data.winner == backupThis.playerIndex)
                backupThis.msg = "Você venceu!"
            else
                backupThis.msg = "Você perdeu!"
        })

        this.socket.on('opponent.left', () => {
            backupThis.game = null
            backupThis.blockRegister = false
            backupThis.msg = "O adversário saiu do jogo!"
        })

    }
})
